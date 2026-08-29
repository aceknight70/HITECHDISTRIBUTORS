import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

const startStaff = content.indexOf('{activeManagerTab === "staff" && (');
const endDirectory = content.indexOf('{/* Shadow School Room */}');

if (startStaff > -1 && endDirectory > -1) {
  // Find the exact place to slice
  // The end of manager div is before Shadow School Room, there's a </div> \n )} \n </motion.div> \n )}
  // Let's just use regex to replace from startStaff to endDirectory
  
  const before = content.slice(0, startStaff);
  const afterMatch = content.slice(endDirectory);
  
  // Actually we need to keep the closing tags of manager room.
  // Let's look at the exact lines.
}
