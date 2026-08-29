import fs from "fs";
const file = "src/App.tsx";
let content = fs.readFileSync(file, "utf8");

content = content.replace(
  `import { db } from "./lib/firebase";`,
  `import { db } from "./lib/firebase";\nimport { fetchHubAllies, saveHubAlly, deleteHubAlly, fetchHubTenants, saveHubTenant, deleteHubTenant, logAllyReferral, logTenantTraffic, HubAlly, HubTenant } from "./lib/supabase";`
);

fs.writeFileSync(file, content);
console.log("Updated imports");
