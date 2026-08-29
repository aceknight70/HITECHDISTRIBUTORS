import fs from "fs";
const file = "src/App.tsx";
let content = fs.readFileSync(file, "utf8");

const target = `{/* 3.5 Bottom Navigation - Fixed bottom bar */}`;

const replacement = `{/* Floating Ally/Tenant Button */}
          {inStore && (hubAllies.filter(a => a.status === 'active').length > 0 || hubTenants.filter(t => t.status === 'active').length > 0) && (
            <div className="fixed bottom-20 right-4 flex flex-col gap-2 z-50">
              {hubAllies.filter(a => a.status === 'active').length > 0 && (
                <button 
                  onClick={() => {
                    // Open a selector if multiple, or just the first one. Let's just pick the first for now.
                    // Better yet, just open the first one to avoid making a whole new menu.
                    const ally = hubAllies.find(a => a.status === 'active');
                    if (ally) setActiveAllyModal(ally);
                  }}
                  className="w-12 h-12 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center text-white shadow-[0_4px_15px_rgba(37,99,235,0.4)] border-2 border-white/20 transition-transform hover:scale-105"
                  title="Partners"
                >
                  <Handshake className="w-5 h-5" />
                </button>
              )}
              {hubTenants.filter(t => t.status === 'active').length > 0 && (
                <button 
                  onClick={() => {
                    const tenant = hubTenants.find(t => t.status === 'active');
                    if (tenant) {
                      if (!sessionStorage.getItem('logged_tenant_disc_' + tenant.id)) {
                        logTenantTraffic(tenant.id, tenant.referral_code, 'discovery').catch(console.error);
                        sessionStorage.setItem('logged_tenant_disc_' + tenant.id, 'true');
                      }
                      setActiveTenantSpace(tenant);
                    }
                  }}
                  className="w-12 h-12 bg-emerald-600 hover:bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-[0_4px_15px_rgba(16,185,129,0.4)] border-2 border-white/20 transition-transform hover:scale-105"
                  title="Mini-Stores"
                >
                  <Store className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {/* 3.5 Bottom Navigation - Fixed bottom bar */}`;

content = content.replace(target, replacement);
fs.writeFileSync(file, content);
console.log("Updated floating btn");
