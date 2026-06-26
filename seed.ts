import { initializeApp } from "firebase/app";
import { getFirestore, doc, writeBatch } from "firebase/firestore";
import fs from "fs";

// Need to read the config
const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const parseCsvRow = (text: string) => {
    const rows: string[][] = [];
    let inQuotes = false;
    let currentWord = '';
    let currentRow: string[] = [];
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        if (inQuotes && text[i+1] === '"') {
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

async function seed() {
  const csvText = fs.readFileSync('prompt_data.csv', 'utf8');
  const rows = parseCsvRow(csvText);
  const importedProducts: any[] = [];
  
  rows.forEach((cols, i) => {
    if (i === 0 || cols.length < 2) return;
    
    const isShifted = !isNaN(Number(cols[0]?.trim())) || rows[0][0]?.toLowerCase().startsWith("no");
    const offset = isShifted ? 1 : 0;
    const displayOrder = isShifted ? cols[0]?.trim() : String(i);

    if (cols.length >= 6 + offset) {
      const rawCat = cols[2 + offset]?.trim().toLowerCase() || "laptops";
      let mappedCat = "laptops";
      if (rawCat.includes("printer") || rawCat.includes("copier")) mappedCat = "printers";
      if (rawCat.includes("desktop") || rawCat.includes("all-in-one")) mappedCat = "desktops";
      if (rawCat.includes("solar") || rawCat.includes("inverter") || rawCat.includes("battery") || rawCat.includes("ups") || rawCat.includes("stabilizer") || rawCat.includes("controller")) mappedCat = "solar";

      importedProducts.push({
        id: `csv-${displayOrder}`,
        displayOrder: displayOrder,
        brand: cols[0 + offset]?.trim() || "HITECH",
        pn: cols[1 + offset]?.trim() || "—",
        cat: mappedCat,
        n: cols[2 + offset]?.trim() || "Imported Product",
        desc: cols[3 + offset]?.trim() || "Imported from CSV Sheet",
        bullets: cols[4 + offset]?.trim() || "",
        sp: cols[5 + offset]?.trim() || "Imported Specifications",
        price: cols[6 + offset]?.trim() || "CALL",
        assuranceLayer: cols[7 + offset]?.trim() || "No",
        assuranceText: cols[8 + offset]?.trim() || "",
        laggardLayer: cols[9 + offset]?.trim() || "No",
        laggardPromoText: cols[10 + offset]?.trim() || "",
        imgManual: cols[11 + offset]?.trim() || "",
        imgFront: cols[12 + offset]?.trim() || "",
        imgSide: cols[13 + offset]?.trim() || "",
        imgBack: cols[14 + offset]?.trim() || "",
        imgTop: cols[15 + offset]?.trim() || "",
        imgVideo: cols[16 + offset]?.trim() || "",
        stock: cols[17 + offset]?.trim() || "In Stock",
        staffNotes: cols[18 + offset]?.trim() || "",
        searchKeywords: cols[19 + offset]?.trim() || "",
        color: cols[20 + offset]?.trim() || "",
        needsVerification: cols[21 + offset]?.trim() || "No",
        floorDisplay: cols[22 + offset]?.trim() || "No",
        promo: cols[18 + offset]?.trim() === "PROMO",
        newp: cols[18 + offset]?.trim() === "NEW"
      });
    }
  });

  console.log(`Found ${importedProducts.length} products to import.`);

  const batchSize = 100;
  for (let i = 0; i < importedProducts.length; i += batchSize) {
    const chunk = importedProducts.slice(i, i + batchSize);
    const batch = writeBatch(db);
    chunk.forEach(p => {
      const docRef = doc(db, "products", p.id);
      batch.set(docRef, p, { merge: true });
    });
    await batch.commit();
    console.log(`Committed chunk ${i} to ${i + chunk.length}`);
  }
  
  console.log("Upload complete! ✅");
  process.exit(0);
}

seed();
