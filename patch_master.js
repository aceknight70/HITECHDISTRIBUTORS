import fs from "fs";
const file = "src/App.tsx";
let content = fs.readFileSync(file, "utf8");

// 1. Add import
content = content.replace(
  'import { HitechLogo } from "./components/HitechLogo";',
  'import { HitechLogo } from "./components/HitechLogo";\nimport MasterSection from "./MasterSection";'
);

// 2. Add to presets
content = content.replace(
  '{ showroom: "DEFAULT", display: "DEFAULT", livesheet: "DEFAULT", deals: "DEFAULT", gallery: "DEFAULT", manager: "DEFAULT" }',
  '{ showroom: "DEFAULT", display: "DEFAULT", livesheet: "DEFAULT", deals: "DEFAULT", gallery: "DEFAULT", manager: "DEFAULT", master: "DEFAULT" }'
);

// 3. Rename Manager texts
content = content.replace(
  'Teleprompter text="Welcome to the Master Control Hub. Authorized Managers only.',
  'Teleprompter text="Welcome to the Manager Control Hub. Authorized Managers only.'
);
content = content.replace(
  '<p className="text-[10px] text-[var(--mu)] uppercase tracking-wider font-mono">Master PIN</p>',
  '<p className="text-[10px] text-[var(--mu)] uppercase tracking-wider font-mono">Manager PIN</p>'
);
content = content.replace(
  'Unlock Master Hub →',
  'Unlock Manager Hub →'
);

// 4. Render MasterSection
const masterRender = `            {/* Master Room */}
            {currentRoom === "master" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <MasterSection />
              </motion.div>
            )}`;

content = content.replace(
  '            {/* Manager Room */}',
  masterRender + '\n\n            {/* Manager Room */}'
);

// 5. Add master to bottom nav
content = content.replace(
  '{ id: "manager", label: "Manager", icon: <Settings className="w-4 h-4" /> },',
  '{ id: "manager", label: "Manager", icon: <Settings className="w-4 h-4" /> },\n                { id: "master", label: "Master", icon: <Shield className="w-4 h-4" /> },'
);

fs.writeFileSync(file, content);
console.log("Patched App.tsx with MasterSection!");
