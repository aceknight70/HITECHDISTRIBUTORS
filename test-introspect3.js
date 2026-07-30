import { createClient } from "@supabase/supabase-js";
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);
async function run() {
  const { data, error } = await supabase.from('hublet_ads').insert([{ id: '11111111-1111-1111-1111-111111111111', title: 'test' }]);
  console.log(data, error);
}
run();
