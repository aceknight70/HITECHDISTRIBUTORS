import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /\{activeManagerTab === "staff" && \([\s\S]*?\{activeManagerTab === "directory" && \([\s\S]*?<\/div>\s*\)\}\s*<\/div>\s*\)\}\s*<\/motion.div>\s*\)\}/;

const match = regex.exec(content);
if (match) {
  console.log("Found match");
} else {
  console.log("No match");
}
