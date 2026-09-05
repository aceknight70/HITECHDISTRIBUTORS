import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Find the start of the injected Modals
const modalStartIdx = content.indexOf('{/* Active Tenant Space Modal */}');
if (modalStartIdx !== -1) {
  // Find everything before it
  let cleanPrefix = content.slice(0, modalStartIdx);
  
  // Clean up any trailing </div> or whitespace before the modals if it was supposed to be the end of the App component.
  // Actually, the <div id="app"> corresponds to a closing </div>.
  // We want the modals to be INSIDE the <> fragment, right before </>.
  
  // Let's find the closing `</div>` that belongs to `div id="app"`
  // It should be the very last `</div>` before the Modals.
  
  // Let's strip the last `</div>` from cleanPrefix so we can wrap the Modals inside it.
  // Or, we can just put the Modals OUTSIDE of `div id="app"`, but inside the `<>` fragment.
  
  const modalsCode = content.slice(modalStartIdx, content.indexOf('function SparklesIcon'));
  
  // Clean up the modalsCode (remove the extra `</div>\n    </>\n  );\n}`)
  const cleanedModalsCode = modalsCode.replace(/<\/div>\s*<\/>\s*\);\s*\}/, '');
  
  let newContent = cleanPrefix.trim();
  // Ensure it ends with exactly one `</div>` before the modals (if they are outside) or no `</div>` if inside.
  // Let's just put the modals BEFORE the last `</div>` of cleanPrefix!
  
  // But wait, cleanPrefix ends with:
  //       )}
  //     </div>
  // Let's just replace the very last `</div>` in cleanPrefix with:
  //   {cleanedModalsCode}
  //   </div>
  // </>\n  );\n}
  
  const lastDivIndex = newContent.lastIndexOf('</div>');
  if (lastDivIndex !== -1) {
     newContent = newContent.slice(0, lastDivIndex) + cleanedModalsCode + '\n    </div>\n    </>\n  );\n}\n\nfunction SparklesIcon(props: React.SVGProps<SVGSVGElement>) {\n  return (\n    <svg\n      {...props}\n      xmlns="http://www.w3.org/2000/svg"\n      width="24"\n      height="24"\n      viewBox="0 0 24 24"\n      fill="none"\n      stroke="currentColor"\n      strokeWidth="2"\n      strokeLinecap="round"\n      strokeLinejoin="round"\n    >\n      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z" />\n      <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5Z" />\n      <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z" />\n    </svg>\n  );\n}\n';
     fs.writeFileSync('src/App.tsx', newContent);
     console.log("Fixed end of file.");
  }
}
