import { createClient } from "@supabase/supabase-js";

const supabaseUrl = 
  (import.meta as any).env?.VITE_SUPABASE_URL || 
  (typeof process !== "undefined" && process.env?.VITE_SUPABASE_URL) || 
  "";
const supabaseAnonKey = 
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 
  (typeof process !== "undefined" && process.env?.VITE_SUPABASE_ANON_KEY) || 
  "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const CLIENT_ID = "hitech";

// Helper to convert base64 to Blob for storage uploads
export async function base64ToBlob(base64: string): Promise<Blob> {
  const res = await fetch(base64);
  return await res.blob();
}

// Upload file to 'hitech-images' public bucket with resilient optimized data URL fallback
export async function uploadToSupabaseStorage(fileOrBlob: File | Blob, originalName?: string): Promise<string> {
  try {
    let ext = "jpg";
    if (fileOrBlob instanceof File) {
      const parts = fileOrBlob.name.split(".");
      if (parts.length > 1) ext = parts[parts.length - 1];
    } else if (fileOrBlob.type) {
      const parts = fileOrBlob.type.split("/");
      if (parts.length > 1) ext = parts[1];
    }

    const uniqueName = `upload-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    
    const { error } = await supabase.storage
      .from("hitech-images")
      .upload(uniqueName, fileOrBlob, {
        cacheControl: "3600",
        upsert: true,
      });

    if (!error) {
      const { data: { publicUrl } } = supabase.storage
        .from("hitech-images")
        .getPublicUrl(uniqueName);
      if (publicUrl) return publicUrl;
    }
  } catch (err) {
    console.warn("Supabase storage upload fallback triggered:", err);
  }

  // Resilient fallback: Convert to compressed Data URL
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      if (!rawDataUrl) {
        reject(new Error("Unable to read file content"));
        return;
      }

      if (typeof window !== "undefined" && typeof Image !== "undefined") {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            const MAX_DIM = 1200;
            let width = img.width;
            let height = img.height;
            if (width > height && width > MAX_DIM) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            } else if (height > MAX_DIM) {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL("image/jpeg", 0.85));
              return;
            }
          } catch (e) {}
          resolve(rawDataUrl);
        };
        img.onerror = () => resolve(rawDataUrl);
        img.src = rawDataUrl;
      } else {
        resolve(rawDataUrl);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(fileOrBlob);
  });
}

export async function fetchHubletAds() {
  const { data, error } = await supabase
    .from("client_channels")
    .select("website")
    .eq("client_id", "hublet_ads")
    .single();

  if (error) {
    if (error.code !== "PGRST116") {
      console.error("Fetch hublet_ads error:", error);
    }
    return [];
  }
  
  if (data?.website) {
    try {
      return JSON.parse(data.website);
    } catch (e) {
      console.error("Parse hublet_ads error:", e);
      return [];
    }
  }
  return [];
}

export async function addHubletAd(ad: any) {
  const currentAds = await fetchHubletAds();
  const newAd = ad.id ? ad : { ...ad, id: "ad-" + Date.now() + Math.floor(Math.random() * 1000) };
  const updatedAds = [...currentAds, newAd];
  
  const { error } = await supabase
    .from("client_channels")
    .upsert({ client_id: "hublet_ads", website: JSON.stringify(updatedAds) }, { onConflict: "client_id" });

  if (error) {
    console.error("Insert hublet_ads error:", error);
    throw error;
  }
}

export async function toggleHubletAd(id: string, active: boolean) {
  const currentAds = await fetchHubletAds();
  const updatedAds = currentAds.map((ad: any) => ad.id === id ? { ...ad, active } : ad);
  
  const { error } = await supabase
    .from("client_channels")
    .upsert({ client_id: "hublet_ads", website: JSON.stringify(updatedAds) }, { onConflict: "client_id" });

  if (error) {
    console.error("Update hublet_ads error:", error);
    throw error;
  }
}

export async function incrementHubletAdClick(id: string) {
  const currentAds = await fetchHubletAds();
  const updatedAds = currentAds.map((ad: any) => ad.id === id ? { ...ad, clickCount: (ad.clickCount || 0) + 1 } : ad);
  
  const { error } = await supabase
    .from("client_channels")
    .upsert({ client_id: "hublet_ads", website: JSON.stringify(updatedAds) }, { onConflict: "client_id" });

  if (error) {
    console.error("Increment hublet_ads click error:", error);
    throw error;
  }
}

// Products operations
export async function fetchProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("client_id", CLIENT_ID)
    .order("row_number", { ascending: true });

  if (error) {
    console.error("Fetch products error:", error);
    throw error;
  }
  return data;
}

export async function insertProduct(product: any) {
  const { id, ...rest } = product; // Never supply custom id values, let identity column assign it
  
  const sanitized = { ...rest };
  if ("product_code" in sanitized) {
    const code = sanitized.product_code;
    if (typeof code === "string") {
      const trimmed = code.trim();
      if (trimmed === "" || trimmed === "-" || trimmed === "—") {
        sanitized.product_code = null;
      } else {
        sanitized.product_code = trimmed;
      }
    } else if (code === undefined || code === null) {
      sanitized.product_code = null;
    }
  }

  const { data, error } = await supabase
    .from("products")
    .insert([{ ...sanitized, client_id: CLIENT_ID }])
    .select()
    .single();

  if (error) {
    console.error("Insert product error:", error);
    throw error;
  }
  return data;
}

export async function updateProduct(productId: any, updates: any = {}) {
  console.log('RUNNING VERSION 2 - TIMESTAMP: 2026-07-12T05:12:15-07:00');
  console.log('updateProduct called with productId:', productId, 'updates:', JSON.stringify(updates));
  const { id: _, created_at, updated_at, ...rest } = updates;
  
  // Cast boolean fields safely to prevent Postgres string-to-boolean cast errors
  const booleanFields = [
    "assurance_layer",
    "laggard_layer",
    "show_in_display_room",
    "show_in_gallery",
    "show_in_showroom",
    "show_in_seasonal_promo",
    "show_in_sale_room",
    "show_in_workbook_room",
    "is_featured",
    "needs_verification",
    "floor_display",
    "members_only",
    "is_draft"
  ];
  
  const sanitizedUpdates = { ...rest };
  if ("product_code" in sanitizedUpdates) {
    const code = sanitizedUpdates.product_code;
    if (typeof code === "string") {
      const trimmed = code.trim();
      if (trimmed === "" || trimmed === "-" || trimmed === "—") {
        sanitizedUpdates.product_code = null;
      } else {
        sanitizedUpdates.product_code = trimmed;
      }
    } else if (code === undefined || code === null) {
      sanitizedUpdates.product_code = null;
    }
  }

  for (const field of booleanFields) {
    if (field in sanitizedUpdates) {
      const val = sanitizedUpdates[field];
      if (typeof val === "string") {
        sanitizedUpdates[field] = val.toLowerCase() === "yes" || val.toLowerCase() === "true";
      } else if (val === null || val === undefined) {
        sanitizedUpdates[field] = false;
      } else {
        sanitizedUpdates[field] = Boolean(val);
      }
    }
  }

  if ("row_number" in sanitizedUpdates) {
    const val = sanitizedUpdates.row_number;
    if (val === "" || val === null || val === undefined) {
      delete sanitizedUpdates.row_number;
    } else {
      const num = Number(val);
      if (isNaN(num)) {
        delete sanitizedUpdates.row_number;
      } else {
        sanitizedUpdates.row_number = num;
      }
    }
  }

  let realId: any = null;
  const isNumeric = productId && !isNaN(Number(productId));
  
  if (!isNumeric) {
    // Non-numeric ID (like def-0, csv-131, imp-5). Attempt to find existing product by product_code or row_number
    if (sanitizedUpdates.product_code) {
      const { data } = await supabase
        .from("products")
        .select("id")
        .eq("client_id", CLIENT_ID)
        .eq("product_code", sanitizedUpdates.product_code)
        .limit(1);
      if (data && data.length > 0) {
        realId = data[0].id;
      }
    }
    
    if (!realId && updates.row_number && !isNaN(Number(updates.row_number))) {
      const { data } = await supabase
        .from("products")
        .select("id")
        .eq("client_id", CLIENT_ID)
        .eq("row_number", Number(updates.row_number))
        .limit(1);
      if (data && data.length > 0) {
        realId = data[0].id;
      }
    }
  } else {
    realId = Number(productId);
  }

  console.log('Resolved realId:', realId, 'isNumeric:', isNumeric);

  if (realId) {
    const { data, error } = await supabase
      .from("products")
      .update(sanitizedUpdates)
      .eq("id", realId)
      .eq("client_id", CLIENT_ID)
      .select();

    if (error) {
      console.error("Update product error object:", JSON.stringify(error));
      console.error("Update product error text:", error.message || error.code || error);
      throw new Error(`Update product failed: ${error.message || error.code || JSON.stringify(error)}`);
    }

    if (data && data.length > 0) {
      return data[0];
    } else {
      console.log(`Product with ID ${realId} not found during update, inserting instead...`);
      const { data: insertData, error: insertError } = await supabase
        .from("products")
        .insert([{ ...sanitizedUpdates, client_id: CLIENT_ID }])
        .select();

      if (insertError) {
        console.error("Insert product fallback error object:", JSON.stringify(insertError));
        console.error("Insert product fallback error text:", insertError.message || insertError.code || insertError);
        throw new Error(`Insert fallback failed: ${insertError.message || insertError.code || JSON.stringify(insertError)}`);
      }
      return insertData?.[0] || null;
    }
  } else {
    // Fallback: If we didn't find any matching product, insert it as a new product
    console.log("No product match found for non-numeric id, inserting as new product...");
    const { data, error } = await supabase
      .from("products")
      .insert([{ ...sanitizedUpdates, client_id: CLIENT_ID }])
      .select();

    if (error) {
      console.error("Insert product fallback error object:", JSON.stringify(error));
      console.error("Insert product fallback error text:", error.message || error.code || error);
      throw new Error(`Insert failed: ${error.message || error.code || JSON.stringify(error)}`);
    }
    return data?.[0] || null;
  }
}

export async function deleteProduct(productId: any) {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId)
    .eq("client_id", CLIENT_ID);

  if (error) {
    console.error("Delete product error:", error);
    throw error;
  }
}

// Invoices & Invoice Items operations
export async function fetchInvoices() {
  const { data, error } = await supabase
    .from("invoices")
    .select(`
      *,
      invoice_items (*)
    `)
    .eq("client_id", CLIENT_ID)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch invoices error:", error);
    throw error;
  }
  return data;
}

export async function insertInvoice(invoice: any, items: any[]) {
  const { id, ...invoiceRest } = invoice;
  const { data: insertedInvoice, error: invError } = await supabase
    .from("invoices")
    .insert([{ ...invoiceRest, client_id: CLIENT_ID }])
    .select()
    .single();

  if (invError) {
    console.error("Insert invoice error:", invError);
    throw invError;
  }

  if (items && items.length > 0) {
    const formattedItems = items.map(item => {
      const { id, ...itemRest } = item;
      return {
        ...itemRest,
        invoice_id: insertedInvoice.id
      };
    });

    const { error: itemsError } = await supabase
      .from("invoice_items")
      .insert(formattedItems);

    if (itemsError) {
      console.error("Insert invoice items error:", itemsError);
      throw itemsError;
    }
  }

  return insertedInvoice;
}

export async function updateInvoiceStatus(invoiceId: any, status: string) {
  const { data, error } = await supabase
    .from("invoices")
    .update({ status })
    .eq("id", invoiceId)
    .eq("client_id", CLIENT_ID)
    .select()
    .single();

  if (error) {
    console.error("Update invoice error:", error);
    throw error;
  }
  return data;
}

// Support Tickets operations (repairs + gm_escalation)
export async function fetchSupportTickets() {
  const { data, error } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("client_id", CLIENT_ID)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch support tickets error:", error);
    throw error;
  }
  return data;
}

export async function insertSupportTicket(ticket: any) {
  const { id, ...rest } = ticket;
  const { data, error } = await supabase
    .from("support_tickets")
    .insert([{ ...rest, client_id: CLIENT_ID }])
    .select()
    .single();

  if (error) {
    console.error("Insert support ticket error:", error);
    throw error;
  }
  return data;
}

export async function updateSupportTicketStatus(ticketId: any, status: string) {
  const { data, error } = await supabase
    .from("support_tickets")
    .update({ status })
    .eq("id", ticketId)
    .eq("client_id", CLIENT_ID)
    .select()
    .single();

  if (error) {
    console.error("Update support ticket error:", error);
    throw error;
  }
  return data;
}

// Pickup Scheduler operations
export async function fetchPickupSlots() {
  const { data, error } = await supabase
    .from("pickup_scheduler")
    .select("*")
    .eq("client_id", CLIENT_ID)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch pickup slots error:", error);
    throw error;
  }
  return data;
}

export async function insertPickupSlot(slot: any) {
  const { id, ...rest } = slot;
  const { data, error } = await supabase
    .from("pickup_scheduler")
    .insert([{ ...rest, client_id: CLIENT_ID }])
    .select()
    .single();

  if (error) {
    console.error("Insert pickup slot error:", error);
    throw error;
  }
  return data;
}

export async function updatePickupSlotStatus(slotId: any, status: string) {
  const { data, error } = await supabase
    .from("pickup_scheduler")
    .update({ status })
    .eq("id", slotId)
    .eq("client_id", CLIENT_ID)
    .select()
    .single();

  if (error) {
    console.error("Update pickup slot status error:", error);
    throw error;
  }
  return data;
}

// Feedback operations
export async function fetchFeedback() {
  const { data, error } = await supabase
    .from("client_feedback")
    .select("*")
    .eq("client_id", CLIENT_ID)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch feedback error:", error);
    throw error;
  }
  return data;
}

export async function insertFeedback(feedback: any) {
  const { id, ...rest } = feedback;
  const { data, error } = await supabase
    .from("client_feedback")
    .insert([{ ...rest, client_id: CLIENT_ID }])
    .select()
    .single();

  if (error) {
    console.error("Insert feedback error:", error);
    throw error;
  }
  return data;
}

// Client channels operations
export async function saveStorefrontBanner(url: string) {
  const { data, error } = await supabase
    .from("client_channels")
    .upsert({ client_id: "hitech_banner", website: url }, { onConflict: "client_id" })
    .select()
    .single();

  if (error) {
    console.error("Save banner error:", error);
    throw error;
  }
  return data;
}

export async function fetchStorefrontBanner() {
  const { data, error } = await supabase
    .from("client_channels")
    .select("website")
    .eq("client_id", "hitech_banner")
    .single();

  if (error) {
    return null;
  }
  return data?.website || null;
}

export async function fetchStorefrontPresets() {
  const { data, error } = await supabase
    .from("client_channels")
    .select("client_id, website")
    .in("client_id", ["hitech_preset_1", "hitech_preset_2", "hitech_preset_3"]);

  if (error || !data) {
    return [];
  }
  return data;
}

export async function saveStorefrontPreset(presetId: string, url: string) {
  const { data, error } = await supabase
    .from("client_channels")
    .upsert({ client_id: presetId, website: url }, { onConflict: "client_id" })
    .select()
    .single();

  if (error) {
    console.error("Save preset error:", error);
    throw error;
  }
  return data;
}

export async function saveThemeSettings(settings: string) {
  const { data, error } = await supabase
    .from("client_channels")
    .upsert({ client_id: "hitech_theme", website: settings }, { onConflict: "client_id" })
    .select()
    .single();

  if (error) {
    console.error("Save theme error:", error);
    throw error;
  }
  return data;
}

export async function fetchThemeSettings() {
  const { data, error } = await supabase
    .from("client_channels")
    .select("website")
    .eq("client_id", "hitech_theme")
    .single();

  if (error) {
    return null;
  }
  return data?.website || null;
}

export async function saveCompanyLogo(url: string) {
  const { data, error } = await supabase
    .from("client_channels")
    .upsert({ client_id: "hitech_logo", website: url }, { onConflict: "client_id" })
    .select()
    .single();

  if (error) {
    console.error("Save logo error:", error);
    throw error;
  }
  return data;
}

export async function fetchCompanyLogo() {
  const { data, error } = await supabase
    .from("client_channels")
    .select("website")
    .eq("client_id", "hitech_logo")
    .single();

  if (error) {
    return null;
  }
  return data?.website || null;
}

export async function fetchClientChannels() {
  const { data, error } = await supabase
    .from("client_channels")
    .select("*")
    .eq("client_id", CLIENT_ID)
    .single();

  if (error) {
    console.error("Fetch client channels error:", error);
    throw error;
  }
  return data;
}

export async function updateClientChannels(updates: any) {
  const { id, created_at, updated_at, ...rest } = updates;
  const { data, error } = await supabase
    .from("client_channels")
    .update(rest)
    .eq("client_id", CLIENT_ID)
    .select()
    .single();

  if (error) {
    console.error("Update client channels error:", error);
    throw error;
  }
  return data;
}

// Automatically seed default product data into Supabase products table if empty
export async function seedProductsIfEmpty(initialProducts: any[], initialSolarProducts: any[], defaultCsvData?: any[]) {
  try {
    const { data: countCheck, error: countErr } = await supabase
      .from("products")
      .select("id")
      .eq("client_id", CLIENT_ID);

    if (countErr) {
      console.error("Error checking product count for seed:", countErr);
      return;
    }

    if (countCheck && countCheck.length >= 100) {
      console.log(`Products table already has full hitech data (${countCheck.length} rows). Skipping seed.`);
      return;
    }

    if (countCheck && countCheck.length > 0) {
      console.log(`Partial or old data found (${countCheck.length} rows). Cleaning up before fresh full seed...`);
      const { error: cleanErr } = await supabase
        .from("products")
        .delete()
        .eq("client_id", CLIENT_ID);
      if (cleanErr) {
        console.error("Clean up failed:", cleanErr);
        return;
      }
    }

    console.log("Seeding products table with all defaults (including CSV)...");
    const rowsToInsert: any[] = [];

    // Map PRODUCTS
    initialProducts.forEach((p, idx) => {
      let prodCode: string | null = (p.pn || "").trim();
      if (!prodCode || prodCode === "—" || prodCode === "-") {
        prodCode = null;
      }

      rowsToInsert.push({
        client_id: CLIENT_ID,
        row_number: p.displayOrder ? Number(p.displayOrder) : idx + 1,
        brand: p.brand || "HITECH",
        product_code: prodCode,
        category: p.cat || "laptops",
        description_headline: p.n || "Imported Product",
        description_bullets: p.bullets || p.desc || "",
        technical_specs: p.sp || "",
        price: p.price || "CALL",
        original_price: p.price || "CALL",
        discounted_price: p.price || "CALL",
        assurance_layer: p.assuranceLayer || "No",
        assurance_text: p.assuranceText || "",
        laggard_layer: p.laggardLayer || "No",
        laggard_promo_text: p.laggardPromoText || "",
        show_in_showroom: true,
        show_in_gallery: true,
        show_in_display_room: p.floorDisplay === "Yes" || p.floorDisplay === "true" || false,
        show_in_seasonal_promo: p.newp === true || p.newp === "true",
        show_in_sale_room: p.promo === true || p.promo === "true",
        main_image_url: p.imgManual || "",
        front_image_url: p.imgFront || "",
        side_image_url: p.imgSide || "",
        back_image_url: p.imgBack || "",
        top_image_url: p.imgTop || "",
        video_url: p.imgVideo || "",
        stock_status: p.stock || "In Stock",
        staff_notes: p.staffNotes || "",
        search_keywords: p.searchKeywords || "",
        color_variant: p.color || "",
        needs_verification: p.needsVerification === "Yes" || p.needsVerification === "true",
        floor_display: p.floorDisplay === "Yes" || p.floorDisplay === "true",
        extra_details: p.desc || ""
      });
    });

    // Map SOLAR_PRODUCTS
    initialSolarProducts.forEach((p, idx) => {
      rowsToInsert.push({
        client_id: CLIENT_ID,
        row_number: idx + 1000,
        brand: p.brand || "Generic",
        product_code: null,
        category: p.cat ? p.cat.toLowerCase() : "solar",
        description_headline: p.n || "Solar Product",
        description_bullets: p.desc || "",
        technical_specs: p.sp || "",
        price: p.price || "CALL",
        original_price: p.price || "CALL",
        discounted_price: p.price || "CALL",
        show_in_showroom: true,
        show_in_gallery: true,
        show_in_display_room: false,
        show_in_seasonal_promo: false,
        show_in_sale_room: false,
        main_image_url: "",
        stock_status: "In Stock",
        extra_details: p.desc || ""
      });
    });

    // Map DEFAULT_CSV_DATA
    if (defaultCsvData && defaultCsvData.length > 0) {
      defaultCsvData.forEach((p, idx) => {
        let prodCode: string | null = (p.productCode || "").trim();
        if (!prodCode || prodCode === "—" || prodCode === "-") {
          prodCode = null;
        }

        const catLower = (p.category || "").toLowerCase();
        let mappedCat = "laptops";
        if (catLower.includes("laptop")) mappedCat = "laptops";
        else if (catLower.includes("battery")) mappedCat = "tubular battery";
        else if (catLower.includes("inverter")) mappedCat = "inverters";

        rowsToInsert.push({
          client_id: CLIENT_ID,
          row_number: p.displayOrder ? Number(p.displayOrder) : idx + 2000,
          brand: p.brand || "HITECH",
          product_code: prodCode,
          category: mappedCat,
          description_headline: `${p.brand} ${p.category}`.trim(),
          description_bullets: p.bullets || "",
          technical_specs: p.specs || "",
          price: p.price || "CALL",
          original_price: p.price || "CALL",
          discounted_price: p.price || "CALL",
          assurance_layer: "No",
          assurance_text: "",
          laggard_layer: "No",
          laggard_promo_text: "",
          show_in_showroom: true,
          show_in_gallery: true,
          show_in_display_room: false,
          show_in_seasonal_promo: false,
          show_in_sale_room: false,
          main_image_url: "",
          stock_status: p.stockStatus || "In Stock",
          extra_details: p.description || ""
        });
      });
    }

    // Insert batch wise
    const batchSize = 50;
    for (let i = 0; i < rowsToInsert.length; i += batchSize) {
      const chunk = rowsToInsert.slice(i, i + batchSize);
      const { error: insertErr } = await supabase
        .from("products")
        .insert(chunk);
      if (insertErr) {
        console.error("Error inserting seed chunk:", insertErr);
      }
    }

    console.log("Seeding complete successfully!");
  } catch (err) {
    console.error("Error seeding products table:", err);
  }
}


// ==========================================
// HUBALLY & HUBTENANT DATA MODELS
// ==========================================
export interface HubAlly {
  id: string;
  ally_name: string;
  business_type: string;
  description: string;
  logo_or_photo: string;
  contact_info: any;
  external_link: string;
  referral_code: string;
  status: string; // 'active' | 'inactive'
  date_added: string;
  // Locally tracked metrics
  referral_count?: number; 
}

export interface HubTenant {
  id: string;
  tenant_name: string;
  description: string;
  category: string;
  photos: string[];
  contact_info: {
    phone?: string;
    whatsapp?: string;
    email?: string;
    address?: string;
  };
  invoicing_enabled: boolean;
  referral_code: string;
  assigned_by?: string; // 'master' | 'manager'
  commission_rate?: number; // e.g. 1.00
  pixel_id?: string;
  status: string; // 'active' | 'inactive'
  date_added: string;
  // Traffic metrics
  referral_entries?: number;
  discovery_entries?: number;
}

export interface HubTenantProduct {
  id: string;
  tenant_id: string;
  product_name: string;
  price: number | null; // nullable — "Price on request" if blank/0
  description?: string;
  photo_url?: string;
  category?: string;
  in_stock: boolean;
  date_added?: string;
  updated_at?: string;
}

export interface HubTenantCommission {
  id: string;
  tenant_id: string;
  tenant_name?: string;
  invoice_reference: string;
  customer_name?: string;
  sale_amount: number;
  commission_rate_applied: number;
  commission_amount: number;
  status: "Pending" | "Paid" | "Reversed";
  logged_by_staff?: string;
  reversed_by?: string;
  reversed_at?: string;
  reversal_reason?: string;
  created_at?: string;
}

export interface MasterTenantNotification {
  id: string;
  tenant_id: string;
  tenant_name: string;
  referral_code: string;
  created_by: string; // 'manager'
  acknowledged: boolean;
  created_at?: string;
}

// Fallback logic helper with infallible localStorage cache
function getLocalItem<T>(key: string): T | null {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const val = window.localStorage.getItem(`hitech_${key}`);
      return val ? JSON.parse(val) : null;
    }
  } catch (e) {}
  return null;
}

function setLocalItem(key: string, payload: any) {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(`hitech_${key}`, JSON.stringify(payload));
    }
  } catch (e) {}
}

async function readFallback(client_id: string) {
  // First try local cache for instant zero-latency retrieval
  const local = getLocalItem(client_id);

  try {
    const { data, error } = await supabase.from("client_channels").select("website").eq("client_id", client_id).single();
    if (!error && data?.website) {
      const parsed = JSON.parse(data.website);
      if (parsed) {
        setLocalItem(client_id, parsed);
        return parsed;
      }
    }
  } catch(e) {}

  if (local && Array.isArray(local) && local.length > 0) {
    return local;
  }
  return local || [];
}

async function writeFallback(client_id: string, payload: any) {
  // Write to localStorage immediately so no updates are ever lost
  setLocalItem(client_id, payload);
  try {
    await supabase.from("client_channels").upsert({ client_id, website: JSON.stringify(payload) }, { onConflict: "client_id" });
  } catch (e) {}
}

export async function fetchHubAllies(): Promise<HubAlly[]> {
  try {
    const { data, error } = await supabase.from("hublet_allies").select("*");
    if (!error && data) return data as HubAlly[];
  } catch (e) {}
  return await readFallback("hublet_allies_fallback") as HubAlly[];
}

export async function saveHubAlly(ally: HubAlly) {
  try {
    const { error } = await supabase.from("hublet_allies").upsert(ally);
    if (!error) return;
  } catch (e) {}
  
  // Fallback
  const current = await readFallback("hublet_allies_fallback") as HubAlly[];
  const updated = current.filter(a => a.id !== ally.id);
  updated.push(ally);
  await writeFallback("hublet_allies_fallback", updated);
}

export async function deleteHubAlly(id: string) {
  try { await supabase.from("hublet_allies").delete().eq("id", id); } catch(e) {}
  const current = await readFallback("hublet_allies_fallback") as HubAlly[];
  await writeFallback("hublet_allies_fallback", current.filter(a => a.id !== id));
}

// 30 Generic Mockup Placeholders for Tenant Photo Slots
export const DEFAULT_30_SLOT_MOCKUPS: string[] = [
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1592833159155-c62df1b65634?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1576426863848-c21f53c60b19?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"
];

// Helper to ensure tenant always has exactly 30 photo slots pre-filled with mockups
export function ensure30PhotoSlots(photos?: string[]): string[] {
  const existing = Array.isArray(photos) ? photos : [];
  const result: string[] = [];
  for (let i = 0; i < 30; i++) {
    if (existing[i] && typeof existing[i] === "string" && existing[i].trim() !== "") {
      result.push(existing[i]);
    } else {
      result.push(DEFAULT_30_SLOT_MOCKUPS[i] || DEFAULT_30_SLOT_MOCKUPS[0]);
    }
  }
  return result;
}

export const DEFAULT_INITIAL_TENANTS: HubTenant[] = [
  {
    id: "a0000000-0000-0000-0000-000000000001",
    tenant_name: "Martins",
    category: "Solar & Inverter Systems",
    description: "Certified solar installer and inverter technician. We provide custom home power audits, battery storage setup, and renewable energy maintenance across Lagos and Warri.",
    photos: ensure30PhotoSlots([
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=800&q=80"
    ]),
    contact_info: {
      phone: "+2348033221144",
      whatsapp: "+2348033221144",
      email: "martins.solar@hitechhub.ng"
    },
    invoicing_enabled: true,
    referral_code: "MARTINSQW13",
    assigned_by: "master",
    commission_rate: 1.0,
    pixel_id: "",
    status: "active",
    date_added: new Date().toISOString(),
    referral_entries: 0,
    discovery_entries: 0
  },
  {
    id: "2bd9900a-c315-40ab-9e26-f59b62ba2a87",
    tenant_name: "Favour Atigolo (Shama's Findings)",
    category: "Home, Personal & Food Essentials",
    description: "Shama's Findings is an everyday-essentials brand built around three practical product lines: The Stain Rectifier (a 500ml multi-purpose cleaning and stain-removal product), female underwear and lingerie (sets, bralettes, camisoles, thongs, boxer pants, nightwear, loungewear), and crayfish products (flakes and headless crayfish for everyday cooking). Founded and run by Favour Toritsemofe Atigolo.",
    photos: ensure30PhotoSlots([
      "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80"
    ]),
    contact_info: {
      email: "elishamaatigolo@gmail.com",
      phone: "+2347031489084",
      whatsapp: "+2347031489084"
    },
    invoicing_enabled: true,
    referral_code: "SHAMASFINDINGS01",
    assigned_by: "master",
    commission_rate: 1.0,
    pixel_id: "",
    status: "active",
    date_added: new Date().toISOString(),
    referral_entries: 0,
    discovery_entries: 0
  },
  {
    id: "a0000000-0000-0000-0000-000000000002",
    tenant_name: "Sumshi",
    category: "Solar Power & POS Systems",
    description: "Commercial and retail merchant solutions. Specialist in fast merchant Android POS terminals, agency banking setups, and high-efficiency backup solar systems for shops.",
    photos: ensure30PhotoSlots([
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1592833159155-c62df1b65634?auto=format&fit=crop&w=800&q=80"
    ]),
    contact_info: {
      phone: "+2348099887766",
      whatsapp: "+2348099887766",
      email: "sumshi.pos@hitechhub.ng"
    },
    invoicing_enabled: true,
    referral_code: "SUMSHI",
    assigned_by: "master",
    commission_rate: 1.0,
    pixel_id: "",
    status: "active",
    date_added: new Date().toISOString(),
    referral_entries: 0,
    discovery_entries: 0
  }
];

export async function fetchHubTenants(): Promise<HubTenant[]> {
  let list: HubTenant[] = [];
  try {
    const { data, error } = await supabase.from("hublet_tenants").select("*");
    if (!error && data && data.length > 0) {
      list = data as HubTenant[];
    }
  } catch (e) {}

  if (list.length === 0) {
    const fallback = (await readFallback("hublet_tenants_fallback")) as HubTenant[];
    if (fallback && Array.isArray(fallback) && fallback.length > 0) {
      list = fallback;
    } else {
      list = [...DEFAULT_INITIAL_TENANTS];
    }
  }

  // Guarantee that all 3 official initial tenants (Martins, Shama's Findings, Sumshi) are always present
  for (const defTenant of DEFAULT_INITIAL_TENANTS) {
    const existingIndex = list.findIndex(
      t => t.id === defTenant.id || 
           t.referral_code?.toUpperCase() === defTenant.referral_code.toUpperCase() ||
           (t.tenant_name?.toLowerCase().includes("martins") && defTenant.tenant_name.toLowerCase().includes("martins")) ||
           (t.tenant_name?.toLowerCase().includes("shama") && defTenant.tenant_name.toLowerCase().includes("shama")) ||
           (t.tenant_name?.toLowerCase().includes("sumshi") && defTenant.tenant_name.toLowerCase().includes("sumshi"))
    );

    if (existingIndex === -1) {
      list.push(defTenant);
    } else {
      // Keep existing custom edits (photos, etc.), but ensure referral_code is normalized and valid
      const existing = list[existingIndex];
      list[existingIndex] = {
        ...defTenant,
        ...existing,
        // If it was the old "MARTINS" code, upgrade to official MARTINSQW13
        referral_code: existing.referral_code === "MARTINS" ? "MARTINSQW13" : (existing.referral_code || defTenant.referral_code),
        status: existing.status || "active",
        photos: ensure30PhotoSlots(existing.photos || defTenant.photos)
      };
    }
  }

  // Ensure every tenant has all 30 photo slots pre-filled
  const processed = list.map(t => ({
    ...t,
    photos: ensure30PhotoSlots(t.photos)
  }));

  // Sync to fallback & localStorage in background
  writeFallback("hublet_tenants_fallback", processed);

  return processed;
}

export async function saveHubTenant(tenant: HubTenant) {
  const sanitizedTenant = {
    ...tenant,
    photos: ensure30PhotoSlots(tenant.photos)
  };

  // 1. Immediately persist to localStorage/fallback cache so no UI edits are lost
  try {
    const current = (await readFallback("hublet_tenants_fallback")) as HubTenant[];
    const existingList = current && Array.isArray(current) && current.length > 0 ? current : [...DEFAULT_INITIAL_TENANTS];
    const updated = existingList.filter(t => t.id !== sanitizedTenant.id);
    updated.push(sanitizedTenant);
    await writeFallback("hublet_tenants_fallback", updated);
  } catch (e) {
    console.warn("Failed to write to fallback cache:", e);
  }

  // 2. Persist to Supabase database
  try {
    await supabase.from("hublet_tenants").upsert(sanitizedTenant);
  } catch (e) {}
}

export async function deleteHubTenant(id: string) {
  const current = (await readFallback("hublet_tenants_fallback")) as HubTenant[];
  const existingList = current && Array.isArray(current) && current.length > 0 ? current : [...DEFAULT_INITIAL_TENANTS];
  await writeFallback("hublet_tenants_fallback", existingList.filter(t => t.id !== id));
  try { await supabase.from("hublet_tenants").delete().eq("id", id); } catch(e) {}
}

// Robust matcher that accepts codes, variations, and tenant aliases
export function findMatchingTenant(tenants: HubTenant[], queryCode: string): HubTenant | undefined {
  if (!queryCode) return undefined;
  const clean = queryCode.trim().toUpperCase();
  const normalized = clean.replace(/[^A-Z0-9]/g, "");
  if (!normalized) return undefined;

  // 1. Exact match on referral_code
  let match = tenants.find(t => t.referral_code?.trim().toUpperCase() === clean);
  if (match) return match;

  // 2. Normalized alphanumeric match on referral_code
  match = tenants.find(t => (t.referral_code || "").replace(/[^A-Z0-9]/gi, "").toUpperCase() === normalized);
  if (match) return match;

  // 3. Martins alias matches (MARTINS, MARTINSQW13, MARTINS13, MARTIN)
  if (normalized === "MARTINS" || normalized === "MARTINSQW13" || normalized === "MARTINS13" || normalized === "MARTIN") {
    match = tenants.find(t => t.tenant_name.toLowerCase().includes("martins") || (t.referral_code || "").toUpperCase().includes("MARTINS"));
    if (match) return match;
  }

  // 4. Shama's Findings alias matches (SHAMA, SHAMAS, SHAMASFINDINGS, SHAMASFINDINGS01, FAVOUR)
  if (normalized.startsWith("SHAMA") || normalized.includes("FINDING") || normalized === "FAVOUR") {
    match = tenants.find(t => t.tenant_name.toLowerCase().includes("shama") || (t.referral_code || "").toUpperCase().includes("SHAMA"));
    if (match) return match;
  }

  // 5. Sumshi alias matches (SUMSHI, SUMSHIPOS, SUMSHI-POS)
  if (normalized === "SUMSHI" || normalized.startsWith("SUMSHI")) {
    match = tenants.find(t => t.tenant_name.toLowerCase().includes("sumshi") || (t.referral_code || "").toUpperCase().includes("SUMSHI"));
    if (match) return match;
  }

  // 6. Substring match on tenant name or referral code
  match = tenants.find(t => 
    t.tenant_name.toUpperCase().includes(clean) || 
    clean.includes(t.tenant_name.toUpperCase()) ||
    (t.referral_code && clean.includes(t.referral_code.toUpperCase()))
  );
  if (match) return match;

  return undefined;
}

export async function logAllyReferral(ally_id: string, referral_code: string) {
  try {
    await supabase.from("hublet_ally_referrals").insert({ ally_id, referral_code });
  } catch (e) {}
  
  const current = await readFallback("hublet_allies_fallback") as HubAlly[];
  const updated = current.map(a => {
    if (a.id === ally_id) {
      return { ...a, referral_count: (a.referral_count || 0) + 1 };
    }
    return a;
  });
  await writeFallback("hublet_allies_fallback", updated);
}

export async function logTenantTraffic(tenant_id: string, referral_code: string, source_type: 'referral' | 'discovery') {
  try {
    await supabase.from("hublet_tenant_traffic").insert({ tenant_id, source: source_type });
  } catch(e) {}
  
  const current = (await readFallback("hublet_tenants_fallback")) as HubTenant[];
  const existingList = current && current.length > 0 ? current : [...DEFAULT_INITIAL_TENANTS];
  const updated = existingList.map(t => {
    if (t.id === tenant_id || t.referral_code?.toUpperCase() === referral_code?.toUpperCase()) {
      if (source_type === 'referral') {
        return { ...t, referral_entries: (t.referral_entries || 0) + 1 };
      } else {
        return { ...t, discovery_entries: (t.discovery_entries || 0) + 1 };
      }
    }
    return t;
  });
  await writeFallback("hublet_tenants_fallback", updated);
}

// -------------------------------------------------------------
// TENANT PRODUCTS API
// -------------------------------------------------------------
export const DEFAULT_TENANT_PRODUCTS: HubTenantProduct[] = [
  // Favour Atigolo / Shama's Findings
  {
    id: "prod-shama-1",
    tenant_id: "2bd9900a-c315-40ab-9e26-f59b62ba2a87",
    product_name: "The Stain Rectifier (500ml)",
    price: 4500,
    description: "Multi-purpose cleaning and rapid fabric/surface stain-removal solution. Gentle on textiles, tough on deep grease and stains.",
    photo_url: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80",
    category: "Cleaning & Essentials",
    in_stock: true,
    date_added: new Date().toISOString()
  },
  {
    id: "prod-shama-2",
    tenant_id: "2bd9900a-c315-40ab-9e26-f59b62ba2a87",
    product_name: "Female Underwear & Intimates Collection",
    price: 6500,
    description: "Breathable cotton underwear, luxury sets, bralettes, camisoles, thongs, boxer pants, nightwear and comfy loungewear.",
    photo_url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80",
    category: "Fashion & Intimates",
    in_stock: true,
    date_added: new Date().toISOString()
  },
  {
    id: "prod-shama-3",
    tenant_id: "2bd9900a-c315-40ab-9e26-f59b62ba2a87",
    product_name: "Premium Dried Crayfish Flakes & Headless",
    price: null, // Price on request
    description: "Specially selected, sun-dried, sand-free headless crayfish and aromatic flakes for rich Nigerian soups and everyday cooking.",
    photo_url: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80",
    category: "Food Essentials",
    in_stock: true,
    date_added: new Date().toISOString()
  },
  // Martins Solar
  {
    id: "prod-martins-1",
    tenant_id: "a0000000-0000-0000-0000-000000000001",
    product_name: "5kVA Pure Sine Wave Solar Hybrid Inverter",
    price: 680000,
    description: "High-power hybrid inverter with integrated MPPT solar charger for heavy home appliances and continuous power.",
    photo_url: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=600&q=80",
    category: "Solar & Inverters",
    in_stock: true,
    date_added: new Date().toISOString()
  },
  {
    id: "prod-martins-2",
    tenant_id: "a0000000-0000-0000-0000-000000000001",
    product_name: "540W Monocrystalline Solar Panel",
    price: 125000,
    description: "Tier 1 high efficiency half-cut cell solar module with 25-year manufacturer performance warranty.",
    photo_url: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=600&q=80",
    category: "Solar & Inverters",
    in_stock: true,
    date_added: new Date().toISOString()
  },
  {
    id: "prod-martins-3",
    tenant_id: "a0000000-0000-0000-0000-000000000001",
    product_name: "Solar Maintenance & Battery Health Audit",
    price: null, // Price on request
    description: "On-site battery equalization, inverter calibration, solar panel cleaning, and full home electrical load analysis.",
    photo_url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80",
    category: "Services & Audit",
    in_stock: true,
    date_added: new Date().toISOString()
  },
  // Sumshi
  {
    id: "prod-sumshi-1",
    tenant_id: "a0000000-0000-0000-0000-000000000002",
    product_name: "Smart 4G Android POS Terminal",
    price: 45000,
    description: "High-speed touchscreen POS terminal with built-in thermal receipt printer, instant settlement, and quad-SIM support.",
    photo_url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=600&q=80",
    category: "POS Terminals",
    in_stock: true,
    date_added: new Date().toISOString()
  },
  {
    id: "prod-sumshi-2",
    tenant_id: "a0000000-0000-0000-0000-000000000002",
    product_name: "Mini Solar Backup Station for POS & Routers",
    price: 85000,
    description: "Uninterrupted DC mini-UPS with solar panel input, keeping POS terminals, WiFi routers, and phones powered 24/7.",
    photo_url: "https://images.unsplash.com/photo-1592833159155-c62df1b65634?auto=format&fit=crop&w=600&q=80",
    category: "Solar & Power",
    in_stock: true,
    date_added: new Date().toISOString()
  }
];

export async function fetchTenantProducts(tenantId?: string): Promise<HubTenantProduct[]> {
  try {
    let query = supabase.from("hublet_tenant_products").select("*");
    if (tenantId) query = query.eq("tenant_id", tenantId);
    const { data, error } = await query;
    if (!error && data && data.length > 0) return data as HubTenantProduct[];
  } catch (e) {}
  
  const fallback = (await readFallback("hublet_tenant_products_fallback")) as HubTenantProduct[];
  let allProds = fallback.length > 0 ? fallback : DEFAULT_TENANT_PRODUCTS;
  if (tenantId) {
    const tid = tenantId.toLowerCase();
    return allProds.filter(p => {
      if (p.tenant_id === tenantId) return true;
      const ptid = p.tenant_id.toLowerCase();
      // Martins match
      if ((tid.includes("martins") || tid === "tenant-1" || tid === "a0000000-0000-0000-0000-000000000001") &&
          (ptid.includes("martins") || ptid === "tenant-1" || ptid === "a0000000-0000-0000-0000-000000000001")) {
        return true;
      }
      // Sumshi match
      if ((tid.includes("sumshi") || tid === "tenant-2" || tid === "a0000000-0000-0000-0000-000000000002") &&
          (ptid.includes("sumshi") || ptid === "tenant-2" || ptid === "a0000000-0000-0000-0000-000000000002")) {
        return true;
      }
      // Favour / Shama match
      if ((tid.includes("shama") || tid.includes("favour") || tid === "2bd9900a-c315-40ab-9e26-f59b62ba2a87") &&
          (ptid.includes("shama") || ptid.includes("favour") || ptid === "2bd9900a-c315-40ab-9e26-f59b62ba2a87")) {
        return true;
      }
      return false;
    });
  }
  return allProds;
}

export async function saveTenantProduct(product: HubTenantProduct): Promise<void> {
  try {
    const { error } = await supabase.from("hublet_tenant_products").upsert({
      ...product,
      updated_at: new Date().toISOString()
    });
    if (!error) return;
  } catch (e) {}

  const current = (await readFallback("hublet_tenant_products_fallback")) as HubTenantProduct[];
  const existingList = current.length > 0 ? current : [...DEFAULT_TENANT_PRODUCTS];
  const updated = existingList.filter(p => p.id !== product.id);
  updated.push({ ...product, updated_at: new Date().toISOString() });
  await writeFallback("hublet_tenant_products_fallback", updated);
}

export async function deleteTenantProduct(productId: string): Promise<void> {
  try {
    await supabase.from("hublet_tenant_products").delete().eq("id", productId);
  } catch (e) {}

  const current = (await readFallback("hublet_tenant_products_fallback")) as HubTenantProduct[];
  const existingList = current.length > 0 ? current : [...DEFAULT_TENANT_PRODUCTS];
  const updated = existingList.filter(p => p.id !== productId);
  await writeFallback("hublet_tenant_products_fallback", updated);
}

// -------------------------------------------------------------
// TENANT COMMISSIONS API
// -------------------------------------------------------------
export async function fetchTenantCommissions(tenantId?: string): Promise<HubTenantCommission[]> {
  try {
    let query = supabase.from("hublet_tenant_commissions").select("*").order("created_at", { ascending: false });
    if (tenantId) query = query.eq("tenant_id", tenantId);
    const { data, error } = await query;
    if (!error && data) return data as HubTenantCommission[];
  } catch (e) {}

  const fallback = (await readFallback("hublet_tenant_commissions_fallback")) as HubTenantCommission[];
  if (tenantId) {
    return fallback.filter(c => c.tenant_id === tenantId);
  }
  return fallback;
}

export async function logTenantCommission(commission: Omit<HubTenantCommission, "id" | "created_at">): Promise<void> {
  const newRow = {
    ...commission,
    id: "comm-" + Date.now() + Math.random().toString(36).substring(5),
    created_at: new Date().toISOString()
  };
  try {
    const { error } = await supabase.from("hublet_tenant_commissions").insert(newRow);
    if (!error) return;
  } catch (e) {}

  const current = (await readFallback("hublet_tenant_commissions_fallback")) as HubTenantCommission[];
  current.unshift(newRow);
  await writeFallback("hublet_tenant_commissions_fallback", current);
}

export async function updateCommissionStatus(
  commissionId: string, 
  status: "Pending" | "Paid" | "Reversed",
  reversalReason?: string,
  reversedBy?: string
): Promise<void> {
  const updates: any = { status };
  if (status === "Reversed") {
    updates.reversed_at = new Date().toISOString();
    updates.reversed_by = reversedBy || "Master/Manager";
    updates.reversal_reason = reversalReason || "Order cancelled or reversed";
  }

  try {
    const { error } = await supabase.from("hublet_tenant_commissions").update(updates).eq("id", commissionId);
    if (!error) return;
  } catch (e) {}

  const current = (await readFallback("hublet_tenant_commissions_fallback")) as HubTenantCommission[];
  const updated = current.map(c => c.id === commissionId ? { ...c, ...updates } : c);
  await writeFallback("hublet_tenant_commissions_fallback", updated);
}

// -------------------------------------------------------------
// MASTER TENANT NOTIFICATIONS API
// -------------------------------------------------------------
export async function fetchMasterTenantNotifications(): Promise<MasterTenantNotification[]> {
  try {
    const { data, error } = await supabase
      .from("hitech_master_tenant_notifications")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) return data as MasterTenantNotification[];
  } catch (e) {}

  return (await readFallback("master_tenant_notifications_fallback")) as MasterTenantNotification[];
}

export async function createMasterTenantNotification(notif: Omit<MasterTenantNotification, "id" | "created_at">): Promise<void> {
  const newRow = {
    ...notif,
    id: "notif-" + Date.now(),
    created_at: new Date().toISOString()
  };
  try {
    const { error } = await supabase.from("hitech_master_tenant_notifications").insert(newRow);
    if (!error) return;
  } catch (e) {}

  const current = (await readFallback("master_tenant_notifications_fallback")) as MasterTenantNotification[];
  current.unshift(newRow);
  await writeFallback("master_tenant_notifications_fallback", current);
}

export async function acknowledgeMasterTenantNotification(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("hitech_master_tenant_notifications")
      .update({ acknowledged: true })
      .eq("id", id);
    if (!error) return;
  } catch (e) {}

  const current = (await readFallback("master_tenant_notifications_fallback")) as MasterTenantNotification[];
  const updated = current.map(n => n.id === id ? { ...n, acknowledged: true } : n);
  await writeFallback("master_tenant_notifications_fallback", updated);
}
// ==========================================

// -------------------------------------------------------------
// MASTER SECTION API
// -------------------------------------------------------------

export interface MasterTimelineEntry {
  id?: string;
  client_id?: string;
  month: string;
  phase_label: string;
  what_was_done: string;
  what_was_achieved: string;
  created_at?: string;
  updated_at?: string;
}

export interface MasterEngine {
  id?: string;
  client_id?: string;
  engine_name: string;
  status: "Not Started" | "Building" | "Active" | "Weak/Unclear";
  notes: string;
  updated_at?: string;
}

export interface MasterTarget {
  id?: string;
  client_id?: string;
  engine_name: string;
  target_description: string;
  progress_notes: string;
  status: "Not Met" | "In Progress" | "Met";
  updated_at?: string;
}

export interface MasterStaff {
  id?: string;
  client_id?: string;
  staff_name: string;
  role: string;
  interest_level: "Engaged" | "Minimal" | "Not Participating";
  notes: string;
  updated_at?: string;
}

export interface MasterStaffLog {
  id?: string;
  staff_id: string;
  activity_type: string;
  description: string;
  logged_at?: string;
}

export async function fetchMasterTimeline() {
  const { data, error } = await supabase
    .from("hitech_master_timeline")
    .select("*")
    .eq("client_id", CLIENT_ID)
    .order("created_at", { ascending: false });
  if (error) console.error("Error fetching master timeline:", error);
  return data || [];
}

export async function upsertMasterTimeline(entry: MasterTimelineEntry) {
  const { data, error } = await supabase
    .from("hitech_master_timeline")
    .upsert({ ...entry, client_id: CLIENT_ID, updated_at: new Date().toISOString() })
    .select();
  if (error) console.error("Error saving master timeline:", error);
  return data;
}

export async function fetchMasterEngines() {
  const { data, error } = await supabase
    .from("hitech_master_engines")
    .select("*")
    .eq("client_id", CLIENT_ID)
    .order("engine_name", { ascending: true });
  if (error) console.error("Error fetching master engines:", error);
  return data || [];
}

export async function upsertMasterEngine(engine: MasterEngine) {
  const { data, error } = await supabase
    .from("hitech_master_engines")
    .upsert({ ...engine, client_id: CLIENT_ID, updated_at: new Date().toISOString() })
    .select();
  if (error) console.error("Error saving master engine:", error);
  return data;
}

export async function fetchMasterTargets() {
  const { data, error } = await supabase
    .from("hitech_master_targets")
    .select("*")
    .eq("client_id", CLIENT_ID);
  if (error) console.error("Error fetching master targets:", error);
  return data || [];
}

export async function upsertMasterTarget(target: MasterTarget) {
  const { data, error } = await supabase
    .from("hitech_master_targets")
    .upsert({ ...target, client_id: CLIENT_ID, updated_at: new Date().toISOString() })
    .select();
  if (error) console.error("Error saving master target:", error);
  return data;
}

export async function fetchMasterStaff() {
  const { data, error } = await supabase
    .from("hitech_staff_evaluation")
    .select("*")
    .eq("client_id", CLIENT_ID);
  if (error) console.error("Error fetching master staff:", error);
  return data || [];
}

export async function upsertMasterStaff(staff: MasterStaff) {
  const { data, error } = await supabase
    .from("hitech_staff_evaluation")
    .upsert({ ...staff, client_id: CLIENT_ID, updated_at: new Date().toISOString() })
    .select();
  if (error) console.error("Error saving master staff:", error);
  return data;
}

export async function deleteMasterTimelineEntry(id: string) {
  await supabase.from("hitech_master_timeline").delete().eq("id", id);
}

export async function deleteMasterTarget(id: string) {
  await supabase.from("hitech_master_targets").delete().eq("id", id);
}

export async function deleteMasterStaff(id: string) {
  await supabase.from("hitech_staff_evaluation").delete().eq("id", id);
}


// -------------------------------------------------------------
// MANAGE STAFF API
// -------------------------------------------------------------

export interface StaffWeeklyLog {
  id?: string;
  staff_id: string;
  date_submitted: string;
  base_catalog_updates: string | number;
  base_ad_posts: string | number;
  edu_link: string;
  edu_views: string;
  ent_link: string;
  ent_views: string;
  conv_note: string;
  approval_status: "Pending" | "Approved";
  approved_by?: string;
  approved_at?: string;
  created_at?: string;
}

export async function fetchWeeklyLogs() {
  const { data, error } = await supabase
    .from("hitech_weekly_logs")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) console.error("Error fetching weekly logs:", error);
  return data || [];
}

export async function approveWeeklyLog(id: string, managerName: string) {
  const { data, error } = await supabase
    .from("hitech_weekly_logs")
    .update({ 
      approval_status: "Approved", 
      approved_by: managerName, 
      approved_at: new Date().toISOString() 
    })
    .eq("id", id)
    .select();
  if (error) console.error("Error approving weekly log:", error);
  return data;
}
