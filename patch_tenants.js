import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `            tenants = seedTenants;
          }
          
          setHubAllies(allies);`;

const replacement = `            tenants = seedTenants;
          }
          
          if (!tenants.find(t => t.id === "tenant-2")) {
            const sumshi = { 
              id: "tenant-2", 
              tenant_name: "Sumshi", 
              description: "Specialist in Solar Solutions and Point of Sale (POS) systems.", 
              category: "Solar & POS", 
              photos: ["https://images.unsplash.com/photo-1592833159155-c62df1b65634?auto=format&fit=crop&w=500&q=80", "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=500&q=80"], 
              contact_info: { phone: "08011223355", whatsapp: "08011223355" }, 
              invoicing_enabled: true, 
              referral_code: "SUMSHI", 
              pixel_id: "", 
              status: "active", 
              date_added: new Date().toISOString(), 
              referral_entries: 0, 
              discovery_entries: 0 
            };
            await saveHubTenant(sumshi);
            tenants.push(sumshi);
          }
          
          setHubAllies(allies);`;

content = content.replace(targetStr, replacement);
fs.writeFileSync('src/App.tsx', content);
