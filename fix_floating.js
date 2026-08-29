import fs from "fs";
const file = "src/App.tsx";
let content = fs.readFileSync(file, "utf8");

content = content.replace(
  `                  onClick={() => {
                    // Open a selector if multiple, or just the first one. Let's just pick the first for now.
                    // Better yet, just open the first one to avoid making a whole new menu.
                    const ally = hubAllies.find(a => a.status === 'active');
                    if (ally) setActiveAllyModal(ally);
                  }}`,
  `                  onClick={() => setShowAllyDirectory(true)}`
);

content = content.replace(
  `                  onClick={() => {
                    const tenant = hubTenants.find(t => t.status === 'active');
                    if (tenant) {
                      if (!sessionStorage.getItem('logged_tenant_disc_' + tenant.id)) {
                        logTenantTraffic(tenant.id, tenant.referral_code, 'discovery').catch(console.error);
                        sessionStorage.setItem('logged_tenant_disc_' + tenant.id, 'true');
                      }
                      setActiveTenantSpace(tenant);
                    }
                  }}`,
  `                  onClick={() => setShowTenantDirectory(true)}`
);

fs.writeFileSync(file, content);
