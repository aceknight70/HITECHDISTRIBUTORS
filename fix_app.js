import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

const startStaff = content.indexOf('{activeManagerTab === "staff" && (');
if (startStaff !== -1) {
  // Find the end of directory block. It's after directory block.
  // We know what's after directory block: {activeManagerTab === "sheets" && ( ? No, wait.
  // Let's find exactly the blocks.
}
