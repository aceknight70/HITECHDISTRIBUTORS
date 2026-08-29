import fs from "fs";
const file = "src/App.tsx";
let content = fs.readFileSync(file, "utf8");

const oldFetchBlock = `        // Step 7.5: Fetch Hublet Ads
        try {
          const ads = await db.fetchHubletAds();
          if (ads && ads.length > 0) {
            setHubletAds(ads.map((ad: any) => ({
              id: ad.id,
              name: ad.name,
              url: ad.url,
              active: ad.active,
              clickCount: ad.clickCount || 0
            })));
          } else {
            // Seed defaults if empty
            try {
              const defaults = [
                { id: "ad-1", name: "Jotra", url: "https://jotra.com", active: true, clickCount: 0 },
                { id: "ad-2", name: "Ugomenz", url: "https://ugomenz.com", active: true, clickCount: 0 }
              ];
              // Write once directly to avoid race conditions and multiple trigger events
              await supabase.from("client_channels").upsert({ client_id: "hublet_ads", website: JSON.stringify(defaults) }, { onConflict: "client_id" });
              
              setHubletAds(defaults);
            } catch (err) {
              console.error("Seed hublet_ads error:", err);
            }
          }
        } catch (e) {
          console.error("Failed to load hublet ads", e);
        }`;

const newFetchBlock = `        // Step 7.5: Fetch HubAllies & HubTenants
        try {
          let allies = await fetchHubAllies();
          let tenants = await fetchHubTenants();
          
          if (allies.length === 0) {
            const seedAllies: HubAlly[] = [
              { id: "ally-1", ally_name: "Jotra Interiors", business_type: "Furniture & Design", description: "Premium furniture and interior design services", logo_or_photo: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=500&q=80", contact_info: { phone: "08012345678", whatsapp: "08012345678" }, external_link: "https://jotra-interiors.vercel.app", referral_code: "JOTRA-001", status: "active", date_added: new Date().toISOString(), referral_count: 0 },
              { id: "ally-2", ally_name: "Ugomenz", business_type: "Fashion & Tailoring", description: "Bespoke fashion design and ready-to-wear outfits", logo_or_photo: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=500&q=80", contact_info: { phone: "08098765432", whatsapp: "08098765432" }, external_link: "https://ugomenz.vercel.app", referral_code: "UGOMENZ-002", status: "active", date_added: new Date().toISOString(), referral_count: 0 }
            ];
            for (const a of seedAllies) await saveHubAlly(a);
            allies = seedAllies;
          }
          
          if (tenants.length === 0) {
            const seedTenants: HubTenant[] = [
              { id: "tenant-1", tenant_name: "Martins", description: "Expert in solar installation and maintenance. Available for home setups.", category: "Solar", photos: ["https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=500&q=80", "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=500&q=80"], contact_info: { phone: "08011223344", whatsapp: "08011223344" }, invoicing_enabled: true, referral_code: "MARTINS", pixel_id: "", status: "active", date_added: new Date().toISOString(), referral_entries: 0, discovery_entries: 0 }
            ];
            for (const t of seedTenants) await saveHubTenant(t);
            tenants = seedTenants;
          }
          
          setHubAllies(allies);
          setHubTenants(tenants);
          
          // Handle initial URL parameters for referral tracking
          const urlParams = new URLSearchParams(window.location.search);
          const refCode = urlParams.get('ref');
          if (refCode) {
            const matchedAlly = allies.find(a => a.referral_code.toUpperCase() === refCode.toUpperCase());
            const matchedTenant = tenants.find(t => t.referral_code.toUpperCase() === refCode.toUpperCase());
            
            if (matchedAlly && !sessionStorage.getItem('logged_ally_ref_' + matchedAlly.id)) {
              await logAllyReferral(matchedAlly.id, matchedAlly.referral_code);
              sessionStorage.setItem('logged_ally_ref_' + matchedAlly.id, 'true');
            } else if (matchedTenant && !sessionStorage.getItem('logged_tenant_ref_' + matchedTenant.id)) {
              await logTenantTraffic(matchedTenant.id, matchedTenant.referral_code, 'referral');
              sessionStorage.setItem('logged_tenant_ref_' + matchedTenant.id, 'true');
              setActiveTenantSpace(matchedTenant);
            }
          }
        } catch (e) {
          console.error("Failed to load allies & tenants", e);
        }`;

content = content.replace(oldFetchBlock, newFetchBlock);
fs.writeFileSync(file, content);
console.log("Updated fetch block");
