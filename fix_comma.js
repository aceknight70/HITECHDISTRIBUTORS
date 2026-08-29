import fs from "fs";
const file = "src/App.tsx";
let content = fs.readFileSync(file, "utf8");

content = content.replace(
  `  Users\n  Store, Handshake, ExternalLink`,
  `  Users,\n  Store, Handshake, ExternalLink`
);

fs.writeFileSync(file, content);
console.log("Fixed comma");
