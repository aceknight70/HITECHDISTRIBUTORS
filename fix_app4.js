import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /\{activeManagerTab === "staff" && \([\s\S]*?\{activeManagerTab === "directory" && \([\s\S]*?<\/div>\s*\)\}/;

const match = regex.exec(content);
if (match) {
  content = content.replace(regex, `{activeManagerTab === "manage-staff" && (<ManagerManageStaff onBack={() => setActiveManagerTab("menu")} />)}`);
  fs.writeFileSync('src/App.tsx', content);
  console.log("Fixed!");
} else {
  console.log("No match");
}
