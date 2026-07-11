import { PRODUCTS, SOLAR_PRODUCTS, DEFAULT_CSV_DATA } from "./src/data/catalog";
import * as fs from "fs";

const escapeCsv = (str: string | undefined | null) => {
  if (!str) return "";
  const s = String(str).replace(/"/g, '""');
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s}"`;
  }
  return s;
};

const rows: string[] = [];
rows.push("name,category,price,description,image_url,in_stock");

for (const p of PRODUCTS) {
  const name = p.n;
  const category = p.cat;
  const price = p.price;
  const description = p.desc;
  const image_url = p.imgFront || p.imgManual || "";
  const in_stock = (p.stock || "").toLowerCase() === "out of stock" ? "false" : "true";
  
  rows.push(`${escapeCsv(name)},${escapeCsv(category)},${escapeCsv(price)},${escapeCsv(description)},${escapeCsv(image_url)},${in_stock}`);
}

for (const p of SOLAR_PRODUCTS) {
  const name = p.n;
  const category = "solar";
  const price = p.price;
  const description = p.desc;
  const image_url = "";
  const in_stock = "true";
  
  rows.push(`${escapeCsv(name)},${escapeCsv(category)},${escapeCsv(price)},${escapeCsv(description)},${escapeCsv(image_url)},${in_stock}`);
}

for (const p of DEFAULT_CSV_DATA) {
  const name = p.category; // imported products use category as name
  let mappedCat = "laptops";
  const rawCat = p.category.toLowerCase();
  if (rawCat.includes("printer") || rawCat.includes("copier")) mappedCat = "printers";
  if (rawCat.includes("desktop") || rawCat.includes("all-in-one")) mappedCat = "desktops";
  if (rawCat.includes("solar") || rawCat.includes("inverter") || rawCat.includes("battery") || rawCat.includes("ups") || rawCat.includes("stabilizer")) mappedCat = "solar";
  
  const category = mappedCat;
  const price = p.price || "CALL";
  const description = p.description || "Imported from CSV Sheet";
  const image_url = "";
  const in_stock = (p.stockStatus || "").toLowerCase() === "out of stock" ? "false" : "true";
  
  rows.push(`${escapeCsv(name)},${escapeCsv(category)},${escapeCsv(price)},${escapeCsv(description)},${escapeCsv(image_url)},${in_stock}`);
}

fs.writeFileSync("products.csv", rows.join("\n"));
console.log("Written products.csv");
