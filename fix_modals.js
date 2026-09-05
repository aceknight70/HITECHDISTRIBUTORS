import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Extract the modal code.
const startTag = '{/* Active Tenant Space Modal */}';
const endTag = '{/* Ally Directory Modal */}';

const startIndex = content.indexOf(startTag);
if (startIndex !== -1) {
  // Find the SECOND occurrence of Ally Directory Modal (since it was duplicated in replacement string)
  let endIndex = content.indexOf(endTag, startIndex);
  if (endIndex !== -1) {
    // Find the END of that Ally Directory Modal
    let realEnd = content.indexOf(')}', endIndex) + 2; 
    // Actually, let's just grab everything from startTag to the end of the Ally Modal.
    // Looking at add_directories.js and add_spaces.js...
    // The structure is:
    // {/* Active Tenant Space Modal */} ... )}
    // {/* Active Ally Modal */} ... )}
    // {/* Ally Directory Modal */} ... )}
    // {/* Tenant Directory Modal */} ... )}
    
    // Let's find the end of Tenant Directory Modal
    const tenantDirTag = '{/* Tenant Directory Modal */}';
    let tenantDirIndex = content.indexOf(tenantDirTag, startIndex);
    if (tenantDirIndex !== -1) {
       let endOfTenantDir = content.indexOf(')}', tenantDirIndex) + 2;
       
       const modalsCode = content.slice(startIndex, endOfTenantDir);
       
       // Remove the modals from where they are currently
       content = content.slice(0, startIndex) + content.slice(endOfTenantDir);
       
       // Put them back at the correct location (before the last `</div>\n    </>`)
       // Let's replace `    </>\n  );\n}` with the modals.
       const injectionTarget = '    </>\n  );\n}';
       
       if (content.indexOf(injectionTarget) !== -1) {
          content = content.replace(injectionTarget, modalsCode + '\n    </>\n  );\n}');
          fs.writeFileSync('src/App.tsx', content);
          console.log("Successfully moved modals to the root of App.");
       } else {
          // try alternative ending
          const altTarget = '    </>\n  );';
          content = content.replace(altTarget, modalsCode + '\n    </>\n  );');
          fs.writeFileSync('src/App.tsx', content);
          console.log("Successfully moved modals to the root of App (alt target).");
       }
    } else {
       console.log("Could not find Tenant Directory Modal");
    }
  }
} else {
  console.log("Could not find Active Tenant Space Modal");
}
