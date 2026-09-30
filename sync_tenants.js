import dotenv from "dotenv";
dotenv.config();
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function syncTenants() {
  const tenants = [
    {
      id: "2bd9900a-c315-40ab-9e26-f59b62ba2a87",
      tenant_name: "Favour Atigolo (Shama's Findings)",
      category: "Home, Personal & Food Essentials",
      description: "Shama's Findings is an everyday-essentials brand built around three practical product lines: The Stain Rectifier (a 500ml multi-purpose cleaning and stain-removal product), female underwear and lingerie (sets, bralettes, camisoles, thongs, boxer pants, nightwear, loungewear), and crayfish products (flakes and headless crayfish for everyday cooking). Founded and run by Favour Toritsemofe Atigolo.",
      photos: [
        "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80"
      ],
      contact_info: {
        email: "elishamaatigolo@gmail.com",
        phone: "+2347031489084",
        whatsapp: "+2347031489084"
      },
      invoicing_enabled: true,
      referral_code: "SHAMASFINDINGS01",
      assigned_by: "master",
      commission_rate: 1.0,
      status: "active"
    },
    {
      id: "a0000000-0000-0000-0000-000000000001",
      tenant_name: "Martins",
      category: "Solar & Inverter Systems",
      description: "Certified solar installer and inverter technician. We provide custom home power audits, battery storage setup, and renewable energy maintenance across Lagos and Warri.",
      photos: [
        "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=800&q=80"
      ],
      contact_info: {
        phone: "+2348033221144",
        whatsapp: "+2348033221144",
        email: "martins.solar@hitechhub.ng"
      },
      invoicing_enabled: true,
      referral_code: "MARTINSQW13",
      assigned_by: "master",
      commission_rate: 1.0,
      status: "active"
    },
    {
      id: "a0000000-0000-0000-0000-000000000002",
      tenant_name: "Sumshi",
      category: "Solar Power & POS Systems",
      description: "Commercial and retail merchant solutions. Specialist in fast merchant Android POS terminals, agency banking setups, and high-efficiency backup solar systems for shops.",
      photos: [
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1592833159155-c62df1b65634?auto=format&fit=crop&w=800&q=80"
      ],
      contact_info: {
        phone: "+2348099887766",
        whatsapp: "+2348099887766",
        email: "sumshi.pos@hitechhub.ng"
      },
      invoicing_enabled: true,
      referral_code: "SUMSHI",
      assigned_by: "master",
      commission_rate: 1.0,
      status: "active"
    }
  ];

  for (const t of tenants) {
    const { data, error } = await supabase.from("hublet_tenants").upsert(t, { onConflict: "id" }).select();
    if (error) {
      console.error(`Error saving ${t.tenant_name}:`, error.message);
    } else {
      console.log(`Saved ${t.tenant_name}: OK`);
    }
  }
}

syncTenants();
