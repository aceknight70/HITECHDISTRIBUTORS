import fs from "fs";
let content = fs.readFileSync("src/App.tsx", "utf8");

// 1. Add Import
content = content.replace(
  `import { supabase, base64ToBlob`,
  `import ManagerManageStaff from "./components/ManagerManageStaff";\nimport { supabase, base64ToBlob`
);

// 2. Change state type
content = content.replace(
  `const [activeManagerTab, setActiveManagerTab] = useState<"menu" | "ally" | "tenant" | "staff" | "directory" | "sheets">("menu");`,
  `const [activeManagerTab, setActiveManagerTab] = useState<"menu" | "ally" | "tenant" | "manage-staff" | "sheets">("menu");`
);

// 3. Update Menu Button for Staff
content = content.replace(
  /onClick=\{\(\) => setActiveManagerTab\("staff"\)\}.*?h4 className="font-bold text-\[11px\] text-white uppercase">Staff Logs<\/h4>/s,
  `onClick={() => setActiveManagerTab("manage-staff")} className="p-4 bg-[var(--dk2)] border border-[var(--border)] rounded-xl flex flex-col gap-2 items-center text-center hover:bg-slate-800 transition-colors">
                          <Users className="w-6 h-6 text-emerald-400" />
                          <div>
                            <h4 className="font-bold text-[11px] text-white uppercase">Manage Staff</h4>`
);

// 4. Remove Directory menu button (starts around line 4890)
content = content.replace(
  /<button onClick=\{\(\) => setActiveManagerTab\("directory"\)\}.*?h4 className="font-bold text-\[11px\] text-white uppercase">Directory<\/h4>.*?<\/button>/s,
  `{/* Directory moved to Manage Staff */}`
);

// 5. Replace staff render block
// This is trickier with regex, so we'll replace everything from {activeManagerTab === "staff" && ( down to {activeManagerTab === "directory" && (
const staffBlockRegex = /\{activeManagerTab === "staff" && \([\s\S]*?\{activeManagerTab === "directory" && \([\s\S]*?<\/div>\s*\}\)/g;
content = content.replace(staffBlockRegex, `
                    {activeManagerTab === "manage-staff" && (
                      <ManagerManageStaff onBack={() => setActiveManagerTab("menu")} />
                    )}
`);

fs.writeFileSync("src/App.tsx", content);
console.log("Patched App.tsx");
