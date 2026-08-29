import fs from "fs";
const file = "src/App.tsx";
let content = fs.readFileSync(file, "utf8");

content = content.replace(
  `import { supabase, base64ToBlob, uploadToSupabaseStorage } from "./lib/supabase";`,
  `import { supabase, base64ToBlob, uploadToSupabaseStorage, fetchHubAllies, saveHubAlly, deleteHubAlly, fetchHubTenants, saveHubTenant, deleteHubTenant, logAllyReferral, logTenantTraffic, HubAlly, HubTenant } from "./lib/supabase";`
);

fs.writeFileSync(file, content);
console.log("Fixed Supabase imports");
