import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const brokenSectionStart = content.indexOf('                        Saving...');
if (brokenSectionStart !== -1) {
  const unsavedChangesIndex = content.indexOf(') : hasUnsavedChanges ? (', brokenSectionStart);
  if (unsavedChangesIndex !== -1) {
      // The exact text we want to restore:
      const correctText = `                        Saving...
                      </>
                    `;
      const stringToReplace = content.slice(brokenSectionStart, unsavedChangesIndex);
      content = content.replace(stringToReplace, correctText);
      fs.writeFileSync('src/App.tsx', content);
      console.log('Restored broken button component logic.');
  }
}
