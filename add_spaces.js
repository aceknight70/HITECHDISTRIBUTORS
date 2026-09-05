import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

const spacesModals = `
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
`;

content = content.replace('{/* Ally Directory Modal */}', spacesModals + '\n      {/* Ally Directory Modal */}');
fs.writeFileSync('src/App.tsx', content);

console.log("Added Space Modals to App.tsx");
