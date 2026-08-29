import fs from "fs";
const file = "src/App.tsx";
let content = fs.readFileSync(file, "utf8");

content = content.replace(
  `import { Store, Handshake, ExternalLink, User,  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";`,
  `import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";`
);

content = content.replace(
  `} from "lucide-react";`,
  `  Store, Handshake, ExternalLink, User\n} from "lucide-react";`
);

fs.writeFileSync(file, content);
console.log("Fixed imports");
