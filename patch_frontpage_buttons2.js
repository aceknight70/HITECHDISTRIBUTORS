import fs from "fs";
const file = "src/App.tsx";
let content = fs.readFileSync(file, "utf8");

content = content.replace(
  `  const [activeAllyModal, setActiveAllyModal] = useState<HubAlly | null>(null);`,
  `  const [activeAllyModal, setActiveAllyModal] = useState<HubAlly | null>(null);
  const [showAllyDirectory, setShowAllyDirectory] = useState(false);
  const [showTenantDirectory, setShowTenantDirectory] = useState(false);`
);

const oldSpotlight = `            {/* HubAlly & HubTenant Sections */}
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

const newSpotlight = `            {/* HubAlly & HubTenant Buttons */}
            <div className="mt-6 flex flex-col gap-3">
              <p className="text-[11px] text-center text-slate-400 italic font-serif leading-relaxed px-4">
                Discover our trusted partners and rented spaces — tap to explore
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setShowAllyDirectory(true)}
                  className="relative overflow-hidden rounded-xl h-24 border border-blue-500/30 shadow-lg group"
                >
                  <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32b7?auto=format&fit=crop&w=400&q=80" alt="HubAlly" className="absolute inset-0 w-full h-full object-cover brightness-50 group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 flex items-center justify-center bg-blue-900/50 group-hover:bg-blue-900/40 transition-colors">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest drop-shadow-md flex flex-col items-center gap-1.5">
                      <Handshake className="w-5 h-5 text-blue-300"/>
                      HubAlly
                    </h3>
                  </div>
                </button>
                <button 
                  onClick={() => setShowTenantDirectory(true)}
                  className="relative overflow-hidden rounded-xl h-24 border border-emerald-500/30 shadow-lg group"
                >
                  <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=80" alt="HubTenant" className="absolute inset-0 w-full h-full object-cover brightness-50 group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 flex items-center justify-center bg-emerald-900/50 group-hover:bg-emerald-900/40 transition-colors">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest drop-shadow-md flex flex-col items-center gap-1.5">
                      <Store className="w-5 h-5 text-emerald-300"/>
                      HubTenant
                    </h3>
                  </div>
                </button>
              </div>
            </div>`;

content = content.replace(oldSpotlight, newSpotlight);

// 3. Add modals for directory listings
const modalHook = `{/* ALLY MINI-VIEW MODAL */}`;
const directoryModals = `{/* ALLY DIRECTORY MODAL */}
      <AnimatePresence>
        {showAllyDirectory && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 z-[90] bg-slate-950 flex flex-col overflow-hidden text-slate-200"
          >
            <div className="flex-shrink-0 bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-lg relative z-10">
              <div className="flex items-center gap-2">
                <Handshake className="w-5 h-5 text-blue-500" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">HubAlly Partners</h2>
              </div>
              <button onClick={() => setShowAllyDirectory(false)} className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center border border-slate-700 text-slate-300 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-hide">
              {hubAllies.filter(a => a.status === 'active').length === 0 ? (
                <p className="text-center text-slate-500 text-xs italic mt-10">No active HubAllies found.</p>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {hubAllies.filter(a => a.status === 'active').map(ally => (
                    <button 
                      key={ally.id}
                      onClick={() => setActiveAllyModal(ally)}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500 transition-colors shadow-sm text-left group"
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-800 shrink-0">
                        <img src={ally.logo_or_photo} alt={ally.ally_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs font-bold text-white uppercase truncate">{ally.ally_name}</h3>
                        <p className="text-[10px] text-blue-400 font-mono truncate">{ally.business_type}</p>
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{ally.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TENANT DIRECTORY MODAL */}
      <AnimatePresence>
        {showTenantDirectory && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 z-[90] bg-slate-950 flex flex-col overflow-hidden text-slate-200"
          >
            <div className="flex-shrink-0 bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-lg relative z-10">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-500" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">HubTenants</h2>
              </div>
              <button onClick={() => setShowTenantDirectory(false)} className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center border border-slate-700 text-slate-300 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-hide">
              {hubTenants.filter(t => t.status === 'active').length === 0 ? (
                <p className="text-center text-slate-500 text-xs italic mt-10">No active HubTenants found.</p>
              ) : (
                <div className="grid grid-cols-1 gap-3">
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
                      className="flex flex-col gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500 transition-colors shadow-sm text-left group relative"
                    >
                      <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded z-10 uppercase tracking-wider">Mini-Store</div>
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-800 shrink-0">
                          <img src={tenant.photos[0] || ""} alt={tenant.tenant_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs font-bold text-white uppercase truncate pr-16">{tenant.tenant_name}</h3>
                          <p className="text-[10px] text-emerald-400 font-mono truncate">{tenant.category}</p>
                          <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{tenant.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ALLY MINI-VIEW MODAL */}`;

content = content.replace(modalHook, directoryModals);

fs.writeFileSync(file, content);
console.log("Updated Frontpage layout to match prompt");
