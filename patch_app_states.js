import fs from "fs";
const file = "src/App.tsx";
let content = fs.readFileSync(file, "utf8");

content = content.replace(
  `  const [activeManagerTab, setActiveManagerTab] = useState<"menu" | "ads" | "staff" | "directory" | "sheets">("menu");`,
  `  const [activeManagerTab, setActiveManagerTab] = useState<"menu" | "ally" | "tenant" | "staff" | "directory" | "sheets">("menu");`
);

content = content.replace(
  `  const [hubletAds, setHubletAds] = useState([\n    { id: "jotra", name: "Jotra", url: "https://jotra.com", active: true },\n    { id: "ugomenz", name: "Ugomenz", url: "https://ugomenz.com", active: true }\n  ]);\n  const [newHubletName, setNewHubletName] = useState("");\n  const [newHubletUrl, setNewHubletUrl] = useState("");\n  const [addingHublet, setAddingHublet] = useState(false);`,
  `  const [hubAllies, setHubAllies] = useState<HubAlly[]>([]);
  const [hubTenants, setHubTenants] = useState<HubTenant[]>([]);
  const [activeTenantSpace, setActiveTenantSpace] = useState<HubTenant | null>(null);
  const [activeAllyModal, setActiveAllyModal] = useState<HubAlly | null>(null);
  const [tenantEntryCode, setTenantEntryCode] = useState("");
  // Manager Hub forms
  const [addingAlly, setAddingAlly] = useState(false);
  const [addingTenant, setAddingTenant] = useState(false);`
);

fs.writeFileSync(file, content);
console.log("Updated states");
