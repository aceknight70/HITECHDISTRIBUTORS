import fs from "fs";
const file = "src/App.tsx";
let content = fs.readFileSync(file, "utf8");

// 1. Add states
content = content.replace(
  `const [tenantEntryCode, setTenantEntryCode] = useState("");`,
  `const [tenantEntryCode, setTenantEntryCode] = useState("");
  const [showAllyDirectory, setShowAllyDirectory] = useState(false);
  const [showTenantDirectory, setShowTenantDirectory] = useState(false);`
);

// 2. Replace the sections with the buttons requested
const oldSpotlightStart = `{/* HubAlly & HubTenant Sections */}`;
const oldSpotlightEnd = `</div>
              )}
            </div>`;

const startIndex = content.indexOf(oldSpotlightStart);
if (startIndex !== -1) {
  // Find the end of the HubTenant section block
  // The block ends with "</div>\n              )}\n            </div>"
  // Let's use string manipulation safely
  let block = content.substring(startIndex, startIndex + 5000);
  const endIndexOffset = block.indexOf("</div>\\n              )}\\n            </div>");
  
}
