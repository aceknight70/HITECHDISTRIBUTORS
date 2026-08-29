import fs from "fs";
const file = "src/App.tsx";
let content = fs.readFileSync(file, "utf8");

const target = `            {/* HubAlly & HubTenant Buttons */}
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

content = content.replace(target, replacement);
fs.writeFileSync(file, content);
console.log("Updated Button Sizes");
