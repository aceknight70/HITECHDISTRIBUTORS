import fs from "fs";
const file = "src/App.tsx";
let content = fs.readFileSync(file, "utf8");

const oldSpotlight = `            {/* Partner Spotlight / Hublets */}
            <div className="flex gap-3 mt-3 overflow-x-auto pb-2 scrollbar-hide">
              {hubletAds.filter(ad => ad.active).map(ad => (
                <button 
                  key={ad.id}
                  onClick={() => {
                    db.incrementHubletAdClick(ad.id).catch(e => console.error(e));
                    window.open(ad.url, '_blank');
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 hover:border-blue-500 transition-colors shadow-sm whitespace-nowrap group"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold shadow-inner group-hover:scale-110 transition-transform">
                    {ad.name.charAt(0)}
                  </div>
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">{ad.name}</span>
                </button>
              ))}
            </div>`;

const newSpotlight = `            {/* HubAlly & HubTenant Sections */}
            <div className="mt-4 flex flex-col gap-4">
              {hubAllies.filter(a => a.status === 'active').length > 0 && (
                <div className="border border-slate-800 bg-slate-900/50 p-3 rounded-lg">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Handshake className="w-3.5 h-3.5"/> HubAlly Partners</h3>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {hubAllies.filter(a => a.status === 'active').map(ally => (
                      <button 
                        key={ally.id}
                        onClick={() => setActiveAllyModal(ally)}
                        className="flex-shrink-0 w-[140px] flex flex-col items-start gap-2 p-2 rounded bg-slate-800 border border-slate-700 hover:border-blue-500 transition-colors shadow group text-left"
                      >
                        <div className="w-full h-[70px] rounded overflow-hidden bg-slate-900 relative">
                          <img src={ally.logo_or_photo} alt={ally.ally_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                        <div>
                          <span className="text-[11px] font-bold text-white uppercase truncate block w-full">{ally.ally_name}</span>
                          <span className="text-[9px] text-blue-400 font-mono truncate block w-full">{ally.business_type}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {hubTenants.filter(t => t.status === 'active').length > 0 && (
                <div className="border border-slate-800 bg-slate-900/50 p-3 rounded-lg">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Store className="w-3.5 h-3.5"/> HubTenants</h3>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {hubTenants.filter(t => t.status === 'active').map(tenant => (
                      <button 
                        key={tenant.id}
                        onClick={async () => {
                          if (!sessionStorage.getItem('logged_tenant_disc_' + tenant.id)) {
                            await logTenantTraffic(tenant.id, tenant.referral_code, 'discovery');
                            sessionStorage.setItem('logged_tenant_disc_' + tenant.id, 'true');
                          }
                          setActiveTenantSpace(tenant);
                        }}
                        className="flex-shrink-0 w-[140px] flex flex-col items-start gap-2 p-2 rounded bg-slate-800 border border-slate-700 hover:border-emerald-500 transition-colors shadow group text-left relative"
                      >
                        <div className="absolute top-1 right-1 bg-emerald-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded z-10 uppercase tracking-wider">Mini-Store</div>
                        <div className="w-full h-[70px] rounded overflow-hidden bg-slate-900 relative">
                          <img src={tenant.photos[0] || ""} alt={tenant.tenant_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                        <div>
                          <span className="text-[11px] font-bold text-white uppercase truncate block w-full">{tenant.tenant_name}</span>
                          <span className="text-[9px] text-emerald-400 font-mono truncate block w-full">{tenant.category}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>`;

content = content.replace(oldSpotlight, newSpotlight);
fs.writeFileSync(file, content);
console.log("Updated Frontpage");
