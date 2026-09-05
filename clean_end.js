import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Find where the modals start (at the end of the file)
const startIdx = content.indexOf('{/* Active Tenant Space Modal */}');
if (startIdx !== -1) {
  content = content.slice(0, startIdx); // chop off everything
  
  // Re-add the clean modals and the closing tags.
  const cleanEnd = `
      {/* Active Tenant Space Modal */}
      {activeTenantSpace && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-[#0f172a]">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-emerald-950/20">
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-emerald-400" />
              <h3 className="font-black text-white uppercase tracking-widest text-sm">Tenant Space: {activeTenantSpace.tenant_name}</h3>
            </div>
            <button onClick={() => setActiveTenantSpace(null)} className="text-slate-400 hover:text-white transition-colors p-2 bg-slate-900 rounded-full hover:bg-slate-800 border border-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-[var(--dk)]">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/3 aspect-video md:aspect-square bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center">
                {activeTenantSpace.photos && activeTenantSpace.photos.length > 0 ? (
                  <img src={activeTenantSpace.photos[0]} alt={activeTenantSpace.tenant_name} className="w-full h-full object-cover" />
                ) : (
                  <Store className="w-16 h-16 text-emerald-900/50" />
                )}
              </div>
              <div className="flex-1 flex flex-col gap-4">
                <div>
                  <span className="text-xs px-2 py-1 rounded uppercase font-bold tracking-widest bg-emerald-950/40 text-emerald-400 border border-emerald-800/50">{activeTenantSpace.category}</span>
                  <h2 className="text-3xl font-black text-white uppercase mt-2">{activeTenantSpace.tenant_name}</h2>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">{activeTenantSpace.description}</p>
                
                {activeTenantSpace.contact_info && (
                  <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 mt-2 flex flex-col gap-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-widest border-b border-slate-800 pb-2 mb-1">Contact Information</h4>
                    {activeTenantSpace.contact_info.email && <p className="text-sm text-slate-300">📧 {activeTenantSpace.contact_info.email}</p>}
                    {activeTenantSpace.contact_info.phone && <p className="text-sm text-slate-300">📞 {activeTenantSpace.contact_info.phone}</p>}
                    {activeTenantSpace.contact_info.address && <p className="text-sm text-slate-300">📍 {activeTenantSpace.contact_info.address}</p>}
                  </div>
                )}
                
                <div className="mt-auto pt-4 flex gap-3">
                  <button onClick={() => { setActiveTenantSpace(null); setCurrentRoom("showroom"); }} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold uppercase tracking-wider text-xs transition-colors shadow-lg shadow-emerald-900/20">
                    Exit to Main Showroom
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Ally Modal */}
      {activeAllyModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0f172a] border border-blue-500/30 rounded-xl w-full max-w-lg overflow-hidden shadow-[0_0_20px_rgba(59,130,246,0.15)] relative">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-blue-950/20">
              <div className="flex items-center gap-2">
                <Handshake className="w-5 h-5 text-blue-400" />
                <h3 className="font-black text-white uppercase tracking-widest text-sm">HubAlly: {activeAllyModal.ally_name}</h3>
              </div>
              <button onClick={() => setActiveAllyModal(null)} className="text-slate-400 hover:text-white transition-colors p-1 bg-slate-900 rounded-full hover:bg-slate-800 border border-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 bg-[var(--dk2)] flex flex-col items-center text-center gap-4">
              <div className="w-24 h-24 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
                {activeAllyModal.logo_or_photo ? (
                  <img src={activeAllyModal.logo_or_photo} alt={activeAllyModal.ally_name} className="w-full h-full object-cover" />
                ) : (
                  <Handshake className="w-10 h-10 text-blue-900/50" />
                )}
              </div>
              
              <div>
                <span className="text-[10px] px-2 py-1 rounded uppercase font-bold tracking-widest bg-blue-950/40 text-blue-400 border border-blue-800/50">{activeAllyModal.business_type}</span>
                <h2 className="text-xl font-black text-white uppercase mt-3">{activeAllyModal.ally_name}</h2>
              </div>
              
              <p className="text-sm text-slate-400 leading-relaxed max-w-sm">{activeAllyModal.description}</p>
              
              {activeAllyModal.external_link && (
                <a href={activeAllyModal.external_link} target="_blank" rel="noreferrer" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold uppercase tracking-wider text-xs transition-colors shadow-lg mt-2 flex items-center justify-center gap-2">
                  <ExternalLink className="w-4 h-4" /> Visit Partner Website
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Ally Directory Modal */}
      {showAllyDirectory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0f172a] border border-blue-500/30 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden shadow-[0_0_20px_rgba(59,130,246,0.15)] relative">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-blue-950/20">
              <div className="flex items-center gap-2">
                <Handshake className="w-5 h-5 text-blue-400" />
                <h3 className="font-black text-white uppercase tracking-widest text-sm">HubAlly Directory</h3>
              </div>
              <button onClick={() => setShowAllyDirectory(false)} className="text-slate-400 hover:text-white transition-colors p-1 bg-slate-900 rounded-full hover:bg-slate-800 border border-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1 bg-[var(--dk2)] flex flex-col gap-3">
              {hubAllies.length > 0 ? (
                hubAllies.map(ally => (
                  <div key={ally.id} className="p-4 rounded-xl border border-slate-800 bg-slate-900 flex flex-col sm:flex-row gap-4 items-center sm:items-start group hover:border-blue-500/50 transition-colors">
                    <div className="w-16 h-16 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {ally.logo_or_photo ? (
                        <img src={ally.logo_or_photo} alt={ally.ally_name} className="w-full h-full object-cover" />
                      ) : (
                        <Handshake className="w-8 h-8 text-blue-900/50" />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col gap-1 text-center sm:text-left">
                      <div className="flex items-center gap-2 justify-center sm:justify-start">
                        <h4 className="font-bold text-white uppercase">{ally.ally_name}</h4>
                        <span className="text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-widest bg-blue-950/40 text-blue-400 border border-blue-800/50">{ally.business_type}</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed max-w-md line-clamp-2">{ally.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                        {ally.external_link && (
                          <a href={ally.external_link} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded transition-colors shadow-sm">
                            <ExternalLink className="w-3 h-3" /> Visit Site
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center border border-slate-800 border-dashed rounded-xl bg-slate-900/50">
                  <Handshake className="w-8 h-8 text-slate-700 mb-2" />
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">No Allies Found</p>
                  <p className="text-xs text-slate-600 mt-1">Check back later for new partnerships.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tenant Directory Modal */}
      {showTenantDirectory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0f172a] border border-emerald-500/30 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.15)] relative">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-emerald-950/20">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-400" />
                <h3 className="font-black text-white uppercase tracking-widest text-sm">HubTenant Directory</h3>
              </div>
              <button onClick={() => setShowTenantDirectory(false)} className="text-slate-400 hover:text-white transition-colors p-1 bg-slate-900 rounded-full hover:bg-slate-800 border border-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1 bg-[var(--dk2)] flex flex-col gap-3">
              {hubTenants.length > 0 ? (
                hubTenants.map(tenant => (
                  <div key={tenant.id} className="p-4 rounded-xl border border-slate-800 bg-slate-900 flex flex-col sm:flex-row gap-4 items-center sm:items-start group hover:border-emerald-500/50 transition-colors">
                    <div className="w-16 h-16 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {tenant.photos && tenant.photos.length > 0 ? (
                        <img src={tenant.photos[0]} alt={tenant.tenant_name} className="w-full h-full object-cover" />
                      ) : (
                        <Store className="w-8 h-8 text-emerald-900/50" />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col gap-1 text-center sm:text-left">
                      <div className="flex items-center gap-2 justify-center sm:justify-start">
                        <h4 className="font-bold text-white uppercase">{tenant.tenant_name}</h4>
                        <span className="text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-widest bg-emerald-950/40 text-emerald-400 border border-emerald-800/50">{tenant.category}</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed max-w-md line-clamp-2">{tenant.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                        <button onClick={() => { setShowTenantDirectory(false); setInStore(true); setActiveTenantSpace(tenant); setCurrentRoom("showroom"); }} className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded transition-colors shadow-sm">
                           Enter Space
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center border border-slate-800 border-dashed rounded-xl bg-slate-900/50">
                  <Store className="w-8 h-8 text-slate-700 mb-2" />
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">No Tenants Found</p>
                  <p className="text-xs text-slate-600 mt-1">Check back later for new spaces.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1-1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z" />
      <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5Z" />
      <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z" />
    </svg>
  );
}
`;
  
  content += cleanEnd;
  fs.writeFileSync('src/App.tsx', content);
  console.log("Restored all modals cleanly at the end of the file!");
} else {
  console.log("Could not find start index");
}
