import dotenv from "dotenv";
dotenv.config();
import { createClient } from "@supabase/supabase-js";
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const tables = [
    "hublet_tenants",
    "hublet_tenant_traffic",
    "hitech_master_tenant_notifications",
    "hublet_tenant_commissions",
    "hublet_tenant_products",
    "hublet_allies"
  ];
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select("*").limit(1);
    console.log(t, error ? `ERROR: ${error.message}` : `OK (count: ${data?.length})`);
  }
}
check();
