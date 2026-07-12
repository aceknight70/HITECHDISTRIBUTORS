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

// Upload file to 'hitech-images' public bucket
export async function uploadToSupabaseStorage(fileOrBlob: File | Blob, originalName?: string): Promise<string> {
  let ext = "jpg";
  if (fileOrBlob instanceof File) {
    const parts = fileOrBlob.name.split(".");
    if (parts.length > 1) ext = parts[parts.length - 1];
  } else if (fileOrBlob.type) {
    const parts = fileOrBlob.type.split("/");
    if (parts.length > 1) ext = parts[1];
  }

  const uniqueName = `upload-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
  
  const { data, error } = await supabase.storage
    .from("hitech-images")
    .upload(uniqueName, fileOrBlob, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) {
    console.error("Storage upload error:", error);
    throw new Error(`Failed to upload file to storage: ${error.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from("hitech-images")
    .getPublicUrl(uniqueName);

  return publicUrl;
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
