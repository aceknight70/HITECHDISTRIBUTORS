import fs from "fs";
const file = "src/lib/supabase.ts";
let content = fs.readFileSync(file, "utf8");

const newLogsCode = `

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
`;

content += newLogsCode;
fs.writeFileSync(file, content);
console.log("Patched supabase.ts with Weekly Logs API!");
