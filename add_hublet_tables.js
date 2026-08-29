import fs from "fs";
const file = "src/lib/supabase.ts";
let content = fs.readFileSync(file, "utf8");

const additionalCode = `
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
  contact_info: any;
  invoicing_enabled: boolean;
  referral_code: string;
  pixel_id: string;
  status: string; // 'active' | 'inactive'
  date_added: string;
  // Locally tracked metrics
  referral_entries?: number;
  discovery_entries?: number;
}

// Fallback logic helper
async function readFallback(client_id: string) {
  const { data, error } = await supabase.from("client_channels").select("website").eq("client_id", client_id).single();
  if (data?.website) {
    try { return JSON.parse(data.website); } catch(e) {}
  }
  return [];
}
async function writeFallback(client_id: string, payload: any) {
  await supabase.from("client_channels").upsert({ client_id, website: JSON.stringify(payload) }, { onConflict: "client_id" });
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

export async function fetchHubTenants(): Promise<HubTenant[]> {
  try {
    const { data, error } = await supabase.from("hublet_tenants").select("*");
    if (!error && data) return data as HubTenant[];
  } catch (e) {}
  return await readFallback("hublet_tenants_fallback") as HubTenant[];
}

export async function saveHubTenant(tenant: HubTenant) {
  try {
    const { error } = await supabase.from("hublet_tenants").upsert(tenant);
    if (!error) return;
  } catch (e) {}
  
  const current = await readFallback("hublet_tenants_fallback") as HubTenant[];
  const updated = current.filter(t => t.id !== tenant.id);
  updated.push(tenant);
  await writeFallback("hublet_tenants_fallback", updated);
}

export async function deleteHubTenant(id: string) {
  try { await supabase.from("hublet_tenants").delete().eq("id", id); } catch(e) {}
  const current = await readFallback("hublet_tenants_fallback") as HubTenant[];
  await writeFallback("hublet_tenants_fallback", current.filter(t => t.id !== id));
}

export async function logAllyReferral(ally_id: string, referral_code: string) {
  try {
    await supabase.from("hublet_ally_referrals").insert({ ally_id, referral_code });
  } catch (e) {}
  
  // Update local fallback count directly on the ally
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
    await supabase.from("hublet_tenant_traffic").insert({ tenant_id, referral_code, source_type });
  } catch(e) {}
  
  // Update local fallback
  const current = await readFallback("hublet_tenants_fallback") as HubTenant[];
  const updated = current.map(t => {
    if (t.id === tenant_id) {
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
// ==========================================
`;

if (!content.includes("export interface HubAlly")) {
  fs.writeFileSync(file, content + "\n" + additionalCode);
  console.log("Added wrappers to supabase.ts");
} else {
  console.log("Wrappers already exist");
}
