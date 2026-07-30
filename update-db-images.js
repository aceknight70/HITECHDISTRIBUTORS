import { createClient } from "@supabase/supabase-js";
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const images = {
    "30": "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=500&q=80",
    "31": "https://images.unsplash.com/photo-1593640495253-23196b27a87f?auto=format&fit=crop&w=500&q=80",
    "32": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=500&q=80",
    "33": "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=500&q=80",
    "34": "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=500&q=80"
  };
  
  for (const [id, url] of Object.entries(images)) {
     const { data, error } = await supabase
       .from("products")
       .update({ front_image_url: url })
       .eq("row_number", Number(id));
     console.log(`Updated product ${id}:`, error || "Success");
  }
}
run();
