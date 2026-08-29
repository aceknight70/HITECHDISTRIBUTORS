import fs from "fs";
const file = "src/lib/supabase.ts";
let content = fs.readFileSync(file, "utf8");

const newApiCode = `
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
`;

content += newApiCode;
fs.writeFileSync(file, content);
console.log("Patched supabase.ts with Master API!");
