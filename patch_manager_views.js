import fs from "fs";
const file = "src/App.tsx";
let content = fs.readFileSync(file, "utf8");

const startStr = `{activeManagerTab === "ads" && (`;
const endStr = `{activeManagerTab === "staff" && (`;

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find boundaries");
  process.exit(1);
}

const newViews = `{activeManagerTab === "ally" && (
                      <div className="p-4 bg-[var(--dk2)] rounded-xl border border-[var(--border)] flex flex-col gap-3">
                        <div className="flex justify-between items-center mb-2 border-b border-slate-800 pb-2">
                          <h4 className="font-bold text-[13px] text-white uppercase">HubAlly Configuration</h4>
                          <button onClick={() => setActiveManagerTab("menu")} className="text-[10px] font-bold text-[var(--yl)] uppercase hover:underline">← Back</button>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <h5 className="text-[10px] uppercase font-bold text-slate-400">Allies Directory</h5>
                          <button onClick={() => setAddingAlly(true)} className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-[10px] font-bold text-white uppercase tracking-wider">
                            + Add Ally
                          </button>
                        </div>

                        {addingAlly && (
                          <div className="bg-slate-900 border border-blue-900/50 p-4 rounded-xl flex flex-col gap-3">
                            <h6 className="text-[10px] uppercase text-blue-400 font-bold mb-2 border-b border-blue-900/30 pb-1">New Ally Profile</h6>
                            <div className="grid grid-cols-2 gap-3">
                              <input id="ally-name" placeholder="Ally Name (e.g. Jotra)" className="bg-slate-950 border border-slate-800 p-2 rounded text-xs text-white" />
                              <input id="ally-type" placeholder="Business Type" className="bg-slate-950 border border-slate-800 p-2 rounded text-xs text-white" />
                              <input id="ally-desc" placeholder="Description" className="col-span-2 bg-slate-950 border border-slate-800 p-2 rounded text-xs text-white" />
                              <input id="ally-logo" placeholder="Logo/Photo URL" className="col-span-2 bg-slate-950 border border-slate-800 p-2 rounded text-xs text-white" />
                              <input id="ally-whatsapp" placeholder="WhatsApp (e.g. 080...)" className="bg-slate-950 border border-slate-800 p-2 rounded text-xs text-white" />
                              <input id="ally-link" placeholder="External Link (Optional)" className="bg-slate-950 border border-slate-800 p-2 rounded text-xs text-white" />
                            </div>
                            <div className="flex gap-2 mt-2">
                              <button onClick={async () => {
                                const name = (document.getElementById('ally-name') as HTMLInputElement).value;
                                if (!name) return;
                                const id = "ally-" + Date.now();
                                const newAlly: HubAlly = {
                                  id, ally_name: name,
                                  business_type: (document.getElementById('ally-type') as HTMLInputElement).value || "Partner",
                                  description: (document.getElementById('ally-desc') as HTMLInputElement).value || "Hublet Ally",
                                  logo_or_photo: (document.getElementById('ally-logo') as HTMLInputElement).value || "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=200&q=80",
                                  contact_info: { whatsapp: (document.getElementById('ally-whatsapp') as HTMLInputElement).value },
                                  external_link: (document.getElementById('ally-link') as HTMLInputElement).value,
                                  referral_code: name.replace(/\\s+/g, '').toUpperCase() + "-" + Math.floor(Math.random()*100),
                                  status: "active", date_added: new Date().toISOString(), referral_count: 0
                                };
                                await saveHubAlly(newAlly);
                                setHubAllies(await fetchHubAllies());
                                setAddingAlly(false);
                              }} className="flex-1 bg-blue-600 hover:bg-blue-500 py-2 rounded text-white text-[10px] font-bold uppercase tracking-wider">Save Ally</button>
                              <button onClick={() => setAddingAlly(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 py-2 rounded text-white text-[10px] font-bold uppercase tracking-wider">Cancel</button>
                            </div>
                          </div>
                        )}

                        <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                          {hubAllies.map(ally => (
                            <div key={ally.id} className="bg-slate-950 border border-slate-800 p-3 rounded-lg flex flex-col gap-2 relative">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h6 className="font-bold text-xs text-white uppercase flex items-center gap-2">
                                    {ally.ally_name}
                                    <span className={\`w-2 h-2 rounded-full \${ally.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}\`}></span>
                                  </h6>
                                  <p className="text-[10px] font-mono text-blue-400">Code: {ally.referral_code}</p>
                                </div>
                                <div className="flex gap-2">
                                  <button onClick={async () => {
                                    const nextStatus = ally.status === 'active' ? 'inactive' : 'active';
                                    await saveHubAlly({...ally, status: nextStatus});
                                    setHubAllies(await fetchHubAllies());
                                  }} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300">
                                    <Globe className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={async () => {
                                    if(confirm("Delete this Ally?")) {
                                      await deleteHubAlly(ally.id);
                                      setHubAllies(await fetchHubAllies());
                                    }
                                  }} className="p-1.5 bg-red-900/40 hover:bg-red-900/80 rounded text-red-400">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                              <div className="text-[10px] text-slate-400 uppercase tracking-widest border-t border-slate-800 pt-2 flex justify-between">
                                <span>Total Referrals</span>
                                <span className="font-mono text-white bg-slate-800 px-2 rounded">{ally.referral_count || 0}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeManagerTab === "tenant" && (
                      <div className="p-4 bg-[var(--dk2)] rounded-xl border border-[var(--border)] flex flex-col gap-3">
                        <div className="flex justify-between items-center mb-2 border-b border-slate-800 pb-2">
                          <h4 className="font-bold text-[13px] text-white uppercase">HubTenant Configuration</h4>
                          <button onClick={() => setActiveManagerTab("menu")} className="text-[10px] font-bold text-[var(--yl)] uppercase hover:underline">← Back</button>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <h5 className="text-[10px] uppercase font-bold text-slate-400">Tenants Directory</h5>
                          <button onClick={() => setAddingTenant(true)} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 rounded text-[10px] font-bold text-white uppercase tracking-wider">
                            + Add Tenant
                          </button>
                        </div>

                        {addingTenant && (
                          <div className="bg-slate-900 border border-emerald-900/50 p-4 rounded-xl flex flex-col gap-3">
                            <h6 className="text-[10px] uppercase text-emerald-400 font-bold mb-2 border-b border-emerald-900/30 pb-1">New Tenant Space</h6>
                            <div className="grid grid-cols-2 gap-3">
                              <input id="ten-name" placeholder="Tenant Name (e.g. Martins)" className="bg-slate-950 border border-slate-800 p-2 rounded text-xs text-white" />
                              <input id="ten-cat" placeholder="Category (e.g. Solar)" className="bg-slate-950 border border-slate-800 p-2 rounded text-xs text-white" />
                              <input id="ten-desc" placeholder="Bio/Description" className="col-span-2 bg-slate-950 border border-slate-800 p-2 rounded text-xs text-white" />
                              <input id="ten-photo" placeholder="Primary Photo URL" className="col-span-2 bg-slate-950 border border-slate-800 p-2 rounded text-xs text-white" />
                              <input id="ten-whatsapp" placeholder="WhatsApp Number" className="bg-slate-950 border border-slate-800 p-2 rounded text-xs text-white" />
                              <input id="ten-pixel" placeholder="Meta Pixel ID (Optional)" className="bg-slate-950 border border-slate-800 p-2 rounded text-xs text-white" />
                            </div>
                            <div className="flex gap-2 mt-2">
                              <button onClick={async () => {
                                const name = (document.getElementById('ten-name') as HTMLInputElement).value;
                                if (!name) return;
                                const id = "tenant-" + Date.now();
                                const newTenant: HubTenant = {
                                  id, tenant_name: name,
                                  category: (document.getElementById('ten-cat') as HTMLInputElement).value || "Partner",
                                  description: (document.getElementById('ten-desc') as HTMLInputElement).value || "Hublet Tenant",
                                  photos: [(document.getElementById('ten-photo') as HTMLInputElement).value || "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=200&q=80"],
                                  contact_info: { whatsapp: (document.getElementById('ten-whatsapp') as HTMLInputElement).value },
                                  invoicing_enabled: true,
                                  pixel_id: (document.getElementById('ten-pixel') as HTMLInputElement).value,
                                  referral_code: name.replace(/\\s+/g, '').toUpperCase() + "-" + Math.floor(Math.random()*100),
                                  status: "active", date_added: new Date().toISOString(), referral_entries: 0, discovery_entries: 0
                                };
                                await saveHubTenant(newTenant);
                                setHubTenants(await fetchHubTenants());
                                setAddingTenant(false);
                              }} className="flex-1 bg-emerald-600 hover:bg-emerald-500 py-2 rounded text-white text-[10px] font-bold uppercase tracking-wider">Save Tenant</button>
                              <button onClick={() => setAddingTenant(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 py-2 rounded text-white text-[10px] font-bold uppercase tracking-wider">Cancel</button>
                            </div>
                          </div>
                        )}

                        <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1">
                          {hubTenants.map(tenant => (
                            <div key={tenant.id} className="bg-slate-950 border border-slate-800 p-3 rounded-lg flex flex-col gap-2 relative">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h6 className="font-bold text-xs text-white uppercase flex items-center gap-2">
                                    {tenant.tenant_name}
                                    <span className={\`w-2 h-2 rounded-full \${tenant.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}\`}></span>
                                  </h6>
                                  <p className="text-[10px] font-mono text-emerald-400">Code: {tenant.referral_code}</p>
                                </div>
                                <div className="flex gap-2">
                                  <button onClick={async () => {
                                    const nextStatus = tenant.status === 'active' ? 'inactive' : 'active';
                                    await saveHubTenant({...tenant, status: nextStatus});
                                    setHubTenants(await fetchHubTenants());
                                  }} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300">
                                    <Globe className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={async () => {
                                    if(confirm("Delete this Tenant?")) {
                                      await deleteHubTenant(tenant.id);
                                      setHubTenants(await fetchHubTenants());
                                    }
                                  }} className="p-1.5 bg-red-900/40 hover:bg-red-900/80 rounded text-red-400">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 uppercase tracking-widest border-t border-slate-800 pt-2 mt-1">
                                <div className="flex flex-col gap-1">
                                  <span>Referral (📤)</span>
                                  <span className="font-mono text-emerald-400 font-bold bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-900/50 w-fit">{tenant.referral_entries || 0}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <span>Discovery (📥)</span>
                                  <span className="font-mono text-blue-400 font-bold bg-blue-950/30 px-2 py-0.5 rounded border border-blue-900/50 w-fit">{tenant.discovery_entries || 0}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    `;

content = content.substring(0, startIndex) + newViews + content.substring(endIndex);
fs.writeFileSync(file, content);
console.log("Updated Manager Views");
