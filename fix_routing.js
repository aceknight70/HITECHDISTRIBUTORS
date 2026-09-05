import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Fix 1: The Tenant Code Input button
content = content.replace(
  'setActiveTenantSpace(matched);\n                      setTenantEntryCode("");',
  'setInStore(true);\n                      setCurrentRoom("showroom");\n                      setActiveTenantSpace(matched);\n                      setTenantEntryCode("");'
);

// Fix 2: The Exit button inside the Tenant Space Modal
// "setActiveTenantSpace(null); setCurrentRoom("showroom");"
content = content.replace(
  'setActiveTenantSpace(null); setCurrentRoom("showroom");',
  'setActiveTenantSpace(null); setInStore(true); setCurrentRoom("showroom");'
);

fs.writeFileSync('src/App.tsx', content);
