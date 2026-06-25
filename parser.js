const fs = require('fs');
const parseCsv = (csvText) => {
  const rows = [];
  let inQuotes = false;
  let currentWord = '';
  let currentRow = [];
  
  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    
    if (char === '"') {
      if (inQuotes && csvText[i+1] === '"') {
        currentWord += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentWord.trim());
      currentWord = '';
    } else if (char === '\n' && !inQuotes) {
      currentRow.push(currentWord.trim());
      rows.push(currentRow);
      currentRow = [];
      currentWord = '';
    } else {
      currentWord += char;
    }
  }
  if (currentWord || currentRow.length > 0) {
    currentRow.push(currentWord.trim());
    rows.push(currentRow);
  }
  
  return rows;
};

const text = fs.readFileSync('data.csv', 'utf8');
const rows = parseCsv(text);
const header = rows[0];

const data = rows.slice(1).filter(r => r.length > 1).map(row => {
  return {
    displayOrder: row[0],
    brand: row[1],
    productCode: row[2],
    category: row[3],
    description: row[4],
    bullets: row[5],
    specs: row[6],
    price: row[7],
    assuranceLayer: row[8],
    assuranceText: row[9],
    laggardLayer: row[10],
    laggardPromoText: row[11],
    imageUrl: row[12],
    imgFront: row[13],
    imgSide: row[14],
    imgBack: row[15],
    imgTop: row[16],
    imgVideo: row[17],
    stockStatus: row[18],
    staffNotes: row[19],
    searchKeywords: row[20],
    color: row[21],
    needsVerification: row[22],
    floorDisplay: row[23]
  };
});

fs.writeFileSync('output.json', JSON.stringify(data, null, 2));
