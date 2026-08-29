import { createClient } from "@supabase/supabase-js";
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);
async function run() {
  const { data: d1, error: e1 } = await supabase.from("hublet_allies").select("id").limit(1);
  const { data: d2, error: e2 } = await supabase.from("hublet_tenants").select("id").limit(1);
  console.log("Allies:", e1 ? e1.message : "Exists");
  console.log("Tenants:", e2 ? e2.message : "Exists");
}
run();
