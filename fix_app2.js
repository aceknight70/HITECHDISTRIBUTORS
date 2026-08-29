import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

// The block for staff starts at {activeManagerTab === "staff" && (
const staffIndex = content.indexOf('{activeManagerTab === "staff" && (');
if (staffIndex > -1) {
  // we want to replace from here down to the end of directory.
  const sheetsIndex = content.indexOf('{activeManagerTab === "sheets" && (');
  if (sheetsIndex > -1) {
    // but wait, is there a "sheets" block?
  }
}
