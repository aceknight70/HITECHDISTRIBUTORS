import fs from "fs";
const file = "src/App.tsx";
let content = fs.readFileSync(file, "utf8");
content = content.replace(
  `import {`,
  `import { Store, Handshake, ExternalLink, User, `
);
fs.writeFileSync(file, content);
console.log("Updated lucide imports");
