import fs from "fs";
const file = "src/App.tsx";
let content = fs.readFileSync(file, "utf8");

const target = `            {/* HubAlly & HubTenant Buttons */}
            <div className="mt-4 flex flex-col gap-2">
              <p className="text-[10px] text-center text-slate-400 italic font-serif leading-relaxed px-4 mb-1">
                Discover our trusted partners and rented spaces — tap to explore
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setShowAllyDirectory(true)}
                  className="relative overflow-hidden rounded-xl h-14 border border-blue-500/30 shadow-lg group"
                >
                  <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32b7?auto=format&fit=crop&w=400&q=80" alt="HubAlly" className="absolute inset-0 w-full h-full object-cover brightness-50 group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 flex items-center justify-center bg-blue-900/50 group-hover:bg-blue-900/40 transition-colors">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest drop-shadow-md flex items-center gap-2">
                      <Handshake className="w-4 h-4 text-blue-300"/>
                      HubAlly
                    </h3>
                  </div>
                </button>
                <button 
                  onClick={() => setShowTenantDirectory(true)}
                  className="relative overflow-hidden rounded-xl h-14 border border-emerald-500/30 shadow-lg group"
                >
                  <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=80" alt="HubTenant" className="absolute inset-0 w-full h-full object-cover brightness-50 group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 flex items-center justify-center bg-emerald-900/50 group-hover:bg-emerald-900/40 transition-colors">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest drop-shadow-md flex items-center gap-2">
                      <Store className="w-4 h-4 text-emerald-300"/>
                      HubTenant
                    </h3>
                  </div>
                </button>
              </div>
            </div>`;

const replacement = `            {/* HubAlly & HubTenant Buttons */}
            <div className="mt-4 flex flex-col gap-2">
              <p className="text-[10px] text-center text-slate-400 italic font-serif leading-relaxed px-4 mb-1">
                Discover our trusted partners and rented spaces — tap to explore
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setShowAllyDirectory(true)}
                  className="relative overflow-hidden rounded-xl h-14 border border-blue-500/30 shadow-lg group"
                >
                  <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32b7?auto=format&fit=crop&w=400&q=80" alt="HubAlly" className="absolute inset-0 w-full h-full object-cover brightness-50 group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 flex items-center justify-center bg-blue-900/50 group-hover:bg-blue-900/40 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center border border-white/20 shadow-md">
                        <Handshake className="w-3.5 h-3.5 text-white" />
                      </div>
                      <h3 className="text-xs font-black text-white uppercase tracking-widest drop-shadow-md">
                        HubAlly
                      </h3>
                    </div>
                  </div>
                </button>
                <button 
                  onClick={() => setShowTenantDirectory(true)}
                  className="relative overflow-hidden rounded-xl h-14 border border-emerald-500/30 shadow-lg group"
                >
                  <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=80" alt="HubTenant" className="absolute inset-0 w-full h-full object-cover brightness-50 group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 flex items-center justify-center bg-emerald-900/50 group-hover:bg-emerald-900/40 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center border border-white/20 shadow-md">
                        <Store className="w-3.5 h-3.5 text-white" />
                      </div>
                      <h3 className="text-xs font-black text-white uppercase tracking-widest drop-shadow-md">
                        HubTenant
                      </h3>
                    </div>
                  </div>
                </button>
              </div>
            </div>`;

content = content.replace(target, replacement);

const target2 = `          {/* Floating Ally/Tenant Button */}
          {inStore && (hubAllies.filter(a => a.status === 'active').length > 0 || hubTenants.filter(t => t.status === 'active').length > 0) && (
            <div className="fixed bottom-20 right-4 flex flex-col gap-2 z-50">
              {hubAllies.filter(a => a.status === 'active').length > 0 && (
                <button 
                  onClick={() => setShowAllyDirectory(true)}
                  className="w-12 h-12 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center text-white shadow-[0_4px_15px_rgba(37,99,235,0.4)] border-2 border-white/20 transition-transform hover:scale-105"
                  title="Partners"
                >
                  <Handshake className="w-5 h-5" />
                </button>
              )}
              {hubTenants.filter(t => t.status === 'active').length > 0 && (
                <button 
                  onClick={() => setShowTenantDirectory(true)}
                  className="w-12 h-12 bg-emerald-600 hover:bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-[0_4px_15px_rgba(16,185,129,0.4)] border-2 border-white/20 transition-transform hover:scale-105"
                  title="Mini-Stores"
                >
                  <Store className="w-5 h-5" />
                </button>
              )}
            </div>
          )}`;

const replacement2 = `          {/* Floating Action Stack */}
          {inStore && (
            <div className="fixed bottom-20 right-4 flex flex-col gap-2 z-50">
              <button 
                onClick={() => setCurrentRoom("info")}
                className="w-12 h-12 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center text-white shadow-[0_4px_15px_rgba(220,38,38,0.4)] border-2 border-white/20 transition-transform hover:scale-105"
                title="AI Support"
              >
                <Bot className="w-5 h-5" />
              </button>
              {hubAllies.filter(a => a.status === 'active').length > 0 && (
                <button 
                  onClick={() => setShowAllyDirectory(true)}
                  className="w-12 h-12 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center text-white shadow-[0_4px_15px_rgba(37,99,235,0.4)] border-2 border-white/20 transition-transform hover:scale-105"
                  title="Partners"
                >
                  <Handshake className="w-5 h-5" />
                </button>
              )}
              {hubTenants.filter(t => t.status === 'active').length > 0 && (
                <button 
                  onClick={() => setShowTenantDirectory(true)}
                  className="w-12 h-12 bg-emerald-600 hover:bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-[0_4px_15px_rgba(16,185,129,0.4)] border-2 border-white/20 transition-transform hover:scale-105"
                  title="Mini-Stores"
                >
                  <Store className="w-5 h-5" />
                </button>
              )}
            </div>
          )}`;

content = content.replace(target2, replacement2);

fs.writeFileSync(file, content);
