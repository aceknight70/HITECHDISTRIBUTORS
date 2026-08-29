import fs from "fs";
const file = "src/MasterSection.tsx";
let content = fs.readFileSync(file, "utf8");

content = content.replace(/className=\\{\\\`/g, "className={\`");
content = content.replace(/\\}\\\`\\}/g, "\`}");

// Since backticks were lost completely, I will just rewrite MasterSection.tsx using double quotes or properly escaped backticks.
