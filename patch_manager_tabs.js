import fs from "fs";
const file = "src/App.tsx";
let content = fs.readFileSync(file, "utf8");

const oldMenu = `                    {activeManagerTab === "menu" && (
                      <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setActiveManagerTab("ads")} className="p-4 bg-[var(--dk2)] border border-[var(--border)] rounded-xl flex flex-col gap-2 items-center text-center hover:bg-slate-800 transition-colors">
                          <Globe className="w-6 h-6 text-blue-400" />
                          <div>
                            <h4 className="font-bold text-[11px] text-white uppercase">Partner Ads</h4>
                            <p className="text-[9px] text-[var(--mu)] mt-0.5">Toggle home screen badges</p>
                          </div>
                        </button>`;

const newMenu = `                    {activeManagerTab === "menu" && (
                      <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setActiveManagerTab("ally")} className="p-4 bg-[var(--dk2)] border border-[var(--border)] rounded-xl flex flex-col gap-2 items-center text-center hover:bg-slate-800 transition-colors">
                          <Handshake className="w-6 h-6 text-blue-400" />
                          <div>
                            <h4 className="font-bold text-[11px] text-white uppercase">HubAlly</h4>
                            <p className="text-[9px] text-[var(--mu)] mt-0.5">Manage Allies & Tracking</p>
                          </div>
                        </button>
                        <button onClick={() => setActiveManagerTab("tenant")} className="p-4 bg-[var(--dk2)] border border-[var(--border)] rounded-xl flex flex-col gap-2 items-center text-center hover:bg-slate-800 transition-colors">
                          <Store className="w-6 h-6 text-emerald-400" />
                          <div>
                            <h4 className="font-bold text-[11px] text-white uppercase">HubTenant</h4>
                            <p className="text-[9px] text-[var(--mu)] mt-0.5">Manage Tenant Spaces</p>
                          </div>
                        </button>`;

content = content.replace(oldMenu, newMenu);
fs.writeFileSync(file, content);
console.log("Updated Manager Menu");
