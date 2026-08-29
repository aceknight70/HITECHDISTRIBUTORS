import fs from "fs";
const file = "src/App.tsx";
let content = fs.readFileSync(file, "utf8");

const target = `<motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => { setInStore(true); setCurrentRoom("showroom"); }}
              className="w-full py-4 bg-[#1a2a4a] text-white font-bold uppercase tracking-widest text-xs border-2 border-[#1a2a4a] hover:bg-white hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(26,42,74,1)] hover:shadow-none"
            >
              Enter Showroom →
            </motion.button>`;

const replacement = `<motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => { setInStore(true); setCurrentRoom("showroom"); }}
              className="w-full py-4 bg-[#1a2a4a] text-white font-bold uppercase tracking-widest text-xs border-2 border-[#1a2a4a] hover:bg-white hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(26,42,74,1)] hover:shadow-none"
            >
              Enter Showroom →
            </motion.button>

            {/* Enter Tenant ID Flow */}
            <div className="mt-4 p-4 border border-slate-700 bg-slate-900 rounded-lg shadow-inner">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Store className="w-4 h-4"/> Have a Tenant Code?</h4>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={tenantEntryCode}
                  onChange={(e) => setTenantEntryCode(e.target.value.toUpperCase())}
                  placeholder="e.g. MARTINS"
                  className="flex-1 bg-slate-950 border border-slate-700 rounded px-3 text-xs font-mono text-white uppercase focus:border-emerald-500 focus:outline-none placeholder-slate-600"
                />
                <button 
                  onClick={async () => {
                    const matched = hubTenants.find(t => t.referral_code.toUpperCase() === tenantEntryCode.toUpperCase() && t.status === 'active');
                    if (matched) {
                      if (!sessionStorage.getItem('logged_tenant_ref_' + matched.id)) {
                        await logTenantTraffic(matched.id, matched.referral_code, 'referral');
                        sessionStorage.setItem('logged_tenant_ref_' + matched.id, 'true');
                      }
                      setActiveTenantSpace(matched);
                      setTenantEntryCode("");
                    } else {
                      alert("Invalid or inactive Tenant Code.");
                    }
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded text-[10px] uppercase tracking-wider transition-colors"
                >
                  Enter
                </button>
              </div>
            </div>`;

content = content.replace(target, replacement);
fs.writeFileSync(file, content);
console.log("Updated Enter Tenant ID flow");
