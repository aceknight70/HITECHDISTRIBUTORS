export interface Product {
  id: string;
  pn?: string;
  cat: string;
  n: string;
  sp: string;
  price: string; // e.g. "₦1,150,000" or "CALL"
  promo?: boolean;
  newp?: boolean;
  desc: string;
  displayOrder?: string | number;
  brand?: string;
  bullets?: string;
  assurance?: string;
  stock?: string;
  imgManual?: string;
  imgFront?: string;
  imgSide?: string;
  imgBack?: string;
  imgTop?: string;
  // new fields from latest CSV
  assuranceLayer?: string;
  assuranceText?: string;
  laggardLayer?: string;
  laggardPromoText?: string;
  imgVideo?: string;
  staffNotes?: string;
  searchKeywords?: string;
  color?: string;
  needsVerification?: string;
  floorDisplay?: string;
}

export interface SolarProduct {
  id: string;
  cat: string;
  n: string;
  brand: string;
  sp: string;
  price: string;
  desc: string;
  displayOrder?: string | number;
}

export const CATEGORIES = [
  { id: "laptops", name: "Laptops", icon: "Laptop", description: "HP laptop series — Omnibook, Pavilion, Envy, ProBook, Foldable, 250, 240, 15" },
  { id: "printers", name: "Printers", icon: "Printer", description: "HP Neverstop, DeskJet, Smart Tank, LaserJet, Color LaserJet, Sharp Copier" },
  { id: "desktops", name: "Desktops", icon: "Monitor", description: "HP, Dell, Lenovo, Acer desktop computers and workstations" },
  { id: "cameras", name: "Cameras", icon: "Camera", description: "Canon DSLR, mirrorless, webcams and security cameras" },
  { id: "cctv", name: "CCTV & Security", icon: "Shield", description: "CCTV packages, DVR/NVR systems, Kaspersky security software" },
  { id: "networking", name: "Networking", icon: "Network", description: "Routers, switches, access points and network equipment" },
  { id: "monitors", name: "Monitors", icon: "Tv", description: "LG, Dell, ASUS monitors in various sizes and resolutions" },
  { id: "software", name: "Software", icon: "Cpu", description: "Microsoft Office, Windows licences, Kaspersky antivirus" },
  { id: "accessories", name: "Accessories", icon: "FolderPlus", description: "Bags, mice, keyboards, cables, UPS and power accessories" },
  { id: "phones", name: "Phones & Tablets", icon: "Smartphone", description: "Smartphones, iPads, and Android tablets" }
];

export const SOLAR_CATEGORIES = [
  { id: "Inverters", name: "Inverters" },
  { id: "Lithium Batteries", name: "Lithium Batteries" },
  { id: "Tubular Battery", name: "Tubular Battery" },
  { id: "Solar Panels", name: "Solar Panels" },
  { id: "Controllers", name: "Controllers" },
  { id: "Cables", name: "Cables" },
  { id: "All-in-One", name: "All-in-One" }
];

export const PRODUCTS: Product[] = [
  // Laptops
  { id: "1", pn: "—", cat: "laptops", n: "HP Omnibook Series", sp: "AI PC · Intel Core Ultra · 13th/14th Gen · Premium line", price: "CALL", newp: true, desc: "HP's top-tier AI companion. High performance with neural processing units (NPU), elite magnesium casing, and high-efficiency battery for seamless hybrid work." },
  { id: "2", pn: "—", cat: "laptops", n: "HP Envy Series", sp: "Premium performance · 13th/14th Gen · Core i7/Ultra 7", price: "CALL", newp: true, desc: "Designed for content creators and power users. Striking color accuracy, touch screen capability, and fast charging options in a sleek form factor." },
  { id: "3", pn: "—", cat: "laptops", n: "HP Foldable / x360", sp: "Convertible touchscreen · Folds 360° · Multiple angles", price: "CALL", newp: true, desc: "Ultimate versatility. Effortlessly transitions from workstation laptop to presentation stand and drawing tablet. Includes optional premium stylus." },
  { id: "4", pn: "9B4P0EA", cat: "laptops", n: "HP ProBook 440 G11", sp: "Core Ultra 5 125U · 16GB DDR5 · 512GB SSD · Fingerprint", price: "₦1,150,000", newp: true, desc: "Enterprise-grade safety, durable aluminum deck, ultra-fast DDR5 multitasking, and convenient secure fingerprint bio-reader." },
  { id: "5", pn: "9G1W6ET", cat: "laptops", n: "HP ProBook 440 G11 Ultra 7", sp: "Core Ultra 7 155U · 16GB DDR5 · 512GB SSD · Fingerprint", price: "₦1,340,000", newp: true, desc: "Elite processing speeds for professionals. Handles heavy databases, advanced programming suites, and spreadsheets with ease." },
  { id: "6", pn: "4F0U8EA", cat: "laptops", n: "HP Pavilion 14 X360", sp: "Core i5-1135G7 · 8GB · 512GB · Convertible", price: "₦1,100,000", promo: true, desc: "Interactive display on a budget. Includes a fast NVMe SSD, pristine sound by Bang & Olufsen, and full 360-degree rotation." },
  { id: "7", pn: "84V4EA", cat: "laptops", n: "HP Pavilion 13", sp: "Core i3-1115G4 · 8GB · 256GB SSD · Natural Silver", price: "₦650,000", promo: true, desc: "Compact everyday helper. Extremely lightweight with elegant silver finishing, long battery span, and crystal clear micro-edge screen." },
  { id: "8", pn: "7N0F3ES", cat: "laptops", n: "HP 240 G9", sp: "Core i3-1215U · 8GB DDR4 · 256GB SSD · 14” HD · Dark Ash Silver", price: "₦560,000", desc: "Reliable business laptop. Excellent keyboard, solid connectivity ports, and speedy everyday performance for standard office programs." },
  { id: "9", pn: "2R9H9EA", cat: "laptops", n: "HP 240 G8 Core i5", sp: "Intel Celeron N4020 · 4GB DDR4 · 500GB HDD · FreeDOS", price: "₦390,000", desc: "Basic utility laptop. Suitable for students, record keeping, point-of-sale, and typing. Very robust and highly repairable." },
  { id: "10", pn: "C40ZKEA", cat: "laptops", n: "HP 14 Core i3", sp: "Core i3-N305 · 8GB DDR4 · 512GB PCIe · 14” DOS", price: "₦720,000", newp: true, desc: "Optimized modern i3 processor. Excellent balance between power efficiency and multitasking, paired with spacious high-speed storage." },
  { id: "11", pn: "2R411EA", cat: "laptops", n: "HP 14 Core i5", sp: "Core i5-1035G1 · 8GB DDR4 · 1TB HDD · 14” UHD · Win10", price: "₦650,000", desc: "High capacity storage with powerful core i5 computing. Beautiful UHD screen, perfect for editing documents and standard spreadsheets." },
  { id: "12", pn: "2E7G1EA", cat: "laptops", n: "HP 15 Pentium", sp: "Intel Pentium 4GB · 500GB · 15 HD · FreeDOS · Jet Black", price: "₦400,000", desc: "Sizable 15.6-inch screen with complete numeric keypad. Designed for general school tasks, inventory logging, and home entertainment." },
  { id: "13", pn: "49L31EA", cat: "laptops", n: "HP 15 Core i5", sp: "Core i5-10210U · 12GB · 1TB · 15.6 HD · Win10", price: "₦685,000", promo: true, desc: "Highly popular workstation model. Enhanced 12GB of RAM prevents lags during intensive multitasking, paired with massive 1TB space." },
  { id: "14", pn: "2R9H6EA", cat: "laptops", n: "HP 250 Core i7", sp: "Intel Core i7 · 1TB HDD · 8GB RAM · 15.6” · FreeDOS", price: "₦750,000", promo: true, desc: "Heavy-duty processing computing power for numerical analysts, project developers, and advanced creators." },
  { id: "15", pn: "853K2ES", cat: "laptops", n: "HP 250 G9 Celeron", sp: "Intel Celeron N4500 · 4GB DDR4 · 128GB SSD · 15.6” · DOS", price: "₦400,000", desc: "Economical daily driver. Boots fast thanks to SSD integration. Large screen is perfect for reading, video streaming, and office typing." },

  // Printers
  { id: "20", pn: "7RY23A", cat: "printers", n: "HP Neverstop 1000W", sp: "Laser tank refillable · High yield · Wireless", price: "₦200,000", desc: "Superb economical monochrome laser printing. Features an innovative reloadable toner tank system with exceptionally low cost per page." },
  { id: "21", pn: "4QD21A", cat: "printers", n: "HP Neverstop 1200A", sp: "Laser tank · AiO · Scan & Copy · High yield", price: "₦280,000", desc: "Perfect high-volume monochrome printer, scanner and copier. Refill your toner in 15 seconds without any messy spills." },
  { id: "22", pn: "7WN42B", cat: "printers", n: "HP DeskJet IA 2320", sp: "AiO · Print/Scan/Copy · Entry level · AFR/ME", price: "₦80,000", desc: "Compact home printer. Fits on any shelf, provides sharp color documents and scanning for school assignments or small business bills." },
  { id: "23", pn: "4ZB78A", cat: "printers", n: "HP Laser MFP 107w", sp: "Laser · Wireless · Compact · Fast print", price: "₦250,000", promo: true, desc: "Pristine black & white printing. Extremely small footprint, supports wireless printing from mobile phones and tablets seamlessly." },
  { id: "24", pn: "4ABD4A", cat: "printers", n: "HP Smart Tank 581 AiO", sp: "Wireless · Print/Scan/Copy · High capacity ink", price: "₦260,000", desc: "Incredible cost savings for color printing. Comes with high-capacity ink tanks holding thousands of pages worth of ink right in the box." },
  { id: "25", pn: "Y0F71A", cat: "printers", n: "HP Smart Tank 615 Wireless", sp: "Wireless AiO · 6-month ink supply included", price: "₦398,000", desc: "All-in-one printer with automatic document feeder (ADF) for quick copying. Low-cost ink tanks make it ideal for schools and clinics." },
  { id: "26", pn: "6UU47A", cat: "printers", n: "HP Smart Tank 750 AiO", sp: "Wireless · Large ink tanks · Auto duplex", price: "₦498,000", desc: "Fast duplex color printing. Speeds up office workflows with automatic two-sided sheets and massive ink reservoirs." },
  { id: "27", pn: "7KW72A", cat: "printers", n: "HP Color LaserJet M282nw", sp: "Color laser · Wireless · Print/Scan/Copy · A4", price: "₦640,000", desc: "Professional quality color laser output. High processing speed, amazing graphics quality, and reliable wireless workgroup networking." },
  { id: "28", pn: "W1A80A", cat: "printers", n: "HP Color LaserJet M479fdw", sp: "Color laser · Wireless duplex · Fax · Premium", price: "₦950,000", desc: "Ultimate business color workstation. High security protocols, automatic double-sided scanning and copying, fax support, and fast print speeds." },
  { id: "29", pn: "—", cat: "printers", n: "Sharp AR-7024 A3 Copier", sp: "A3 · High volume · Print/Copy/Scan · Office copier", price: "₦1,150,000", desc: "Heavy-duty commercial copier for major operations. Supports massive paper trays, A3 layout sheets, and high-speed monochrome bulk runs." },

  // Desktops
  { id: "30", cat: "desktops", n: "HP Slimline 290 Core i5", sp: "Intel i5 11th Gen · 8GB RAM · 512GB SSD", price: "₦195,000", desc: "Compact desktop powerhouse. Sleek design fits any workspace, ideal for offices, schools, and business accounting." },
  { id: "31", cat: "desktops", n: "HP EliteDesk 800 Core i7", sp: "Intel i7 11th Gen · 16GB RAM · 512GB SSD · Business", price: "₦385,000", desc: "Premium enterprise security and performance. Ready for advanced productivity, high-speed multi-monitor configurations, and high reliability." },
  { id: "32", cat: "desktops", n: "HP All-in-One 24", sp: "Core i5 · 8GB · 512GB SSD · 23.8” FHD Display", price: "₦350,000", desc: "Space-saving elegant display computer. The tower and display are unified into one gorgeous screen, perfect for modern front desks." },
  { id: "33", cat: "desktops", n: "Dell OptiPlex 3080 Core i5", sp: "Intel i5 10th Gen · 8GB RAM · 256GB SSD · Small Form", price: "₦220,000", desc: "Industry standard corporate reliability. Extremely tough, easily serviceable, perfect for standard workstations." },
  { id: "34", cat: "desktops", n: "Lenovo ThinkCentre M720", sp: "Intel i5 9th Gen · 8GB RAM · 256GB SSD · SFF", price: "₦285,000", desc: "Compact security-conscious workstation. Perfect for secure offices, banks, and clinical data terminals." },

  // Cameras
  { id: "40", cat: "cameras", n: "Canon EOS M50 Mark II", sp: "Mirrorless · 24.1MP · 4K Video · Wi-Fi · APS-C", price: "₦420,000", desc: "Popular vlogging and content creation camera. Compact, with dual pixel autofocus, clear 4K video recording, and simple streaming." },
  { id: "41", cat: "cameras", n: "Canon EOS 250D DSLR", sp: "DSLR · 24.1MP · Full HD · Lightweight · APS-C", price: "₦580,000", desc: "Perfect entry DSLR. Long-lasting battery, classic optical viewfinder, beautiful colors, and incredible portrait detailing." },
  { id: "42", cat: "cameras", n: "HP Webcam HD Pro 1080p", sp: "1080p · Built-in mic · USB plug-and-play", price: "₦22,000", desc: "Upgrade your video calls. Autofocus camera with standard low-light enhancement, built-in noise-canceling microphone, and robust clips." },

  // CCTV & Security
  { id: "50", cat: "cctv", n: "4-Channel CCTV Package", sp: "4 cameras · DVR · Full HD · Night vision · Complete set", price: "₦85,000", desc: "Complete security set for small shops or houses. Includes weather-proof outdoor cameras, high quality DVR box, accessories, and power packs." },
  { id: "51", cat: "cctv", n: "8-Channel CCTV Package", sp: "8 cameras · DVR · Full HD · Night vision · Complete set", price: "₦145,000", desc: "Comprehensive home/office security monitoring. Full HD recording, motion alarms, and simple connection for remote phone viewing." },
  { id: "52", cat: "cctv", n: "Kaspersky Internet Security 1yr", sp: "1 device · 1 year · Full protection", price: "₦12,000", desc: "Award-winning malware block. Protects your computer, banking details, and personal files from internet hacks." },

  // Networking
  { id: "60", cat: "networking", n: "ASUS RT-AX55 Wi-Fi 6 Router", sp: "Wi-Fi 6 · AX1800 · Dual band · AiMesh", price: "₦45,000", desc: "Cutting edge Wi-Fi 6 technology. Prevents lag with multiple devices connected simultaneously, perfect for offices and smart homes." },
  { id: "61", cat: "networking", n: "TP-Link Business Router", sp: "Dual WAN · Load balance · Enterprise grade", price: "₦55,000", desc: "Connect two internet providers together to ensure zero downtime. Balances load and manages local bandwidth for active offices." },
  { id: "62", cat: "networking", n: "HP OfficeConnect Switch 1820", sp: "8-port · Smart managed · Gigabit · Office", price: "₦38,000", desc: "Reliable managed local switches. High speed gigabit ports, excellent safety protocols, perfect for linking office machines." },

  // Monitors
  { id: "70", cat: "monitors", n: "LG 24” IPS FHD Monitor", sp: "24” IPS · 1920x1080 · HDMI/VGA · Anti-glare", price: "₦88,000", desc: "Beautiful color-accurate screen. Wide viewing angles, elegant stand, and eye-friendly blue-light reduction filters." },
  { id: "71", cat: "monitors", n: "LG 27” QHD Monitor", sp: "27” IPS · 2560x1440 · AMD FreeSync · HDR10", price: "₦185,000", desc: "High resolution workspace monitor. Extreme crispness for visual editors, CAD designers, and multitasking professionals." },

  // Software
  { id: "80", cat: "software", n: "Microsoft Office 2021 Professional", sp: "Word · Excel · PowerPoint · Outlook · Lifetime licence", price: "₦28,000", desc: "Full software package for offices. Lifetime activation on one PC without monthly subscription costs." },
  { id: "81", cat: "software", n: "Windows 11 Pro Licence", sp: "Genuine · Digital delivery · Full activation", price: "₦18,000", desc: "Original Windows activation key. Access complete encryption tools, professional remote desktop, and robust security." },
  { id: "82", cat: "software", n: "Kaspersky Total Security 1yr", sp: "3 devices · 1 year · PC + Mac + Android", price: "₦15,000", desc: "Ultimate device protection package. Secure VPN, file vault encryption, password keeper, and kids filters." },

  // Accessories
  { id: "90", cat: "accessories", n: "HP Wireless Mouse & Keyboard", sp: "Wireless combo · 2.4GHz · Silent keys", price: "₦15,000", desc: "Extremely comfortable silent input tools. Single small USB dongle controls both keyboard and mouse, saving ports." },
  { id: "91", cat: "accessories", n: "HP 15.6” Laptop Bag", sp: "Padded · Water resistant · Multiple compartments", price: "₦8,500", desc: "Padded commuter backpack. Specialized secure laptop sleeve, breathable padding, and side pockets." },
  { id: "92", cat: "accessories", n: "UPS 650VA (Home/Small Office)", sp: "650VA · Auto voltage regulation · USB port", price: "CALL", desc: "Emergency backup power unit. Keeps your laptop, router, and monitors running during power cuts so you never lose unsaved tasks." }
];

export const DEFAULT_CSV_DATA = [
    {
        "displayOrder": 131,
        "brand": "HP",
        "productCode": "HP-422U0EA",
        "category": "HP Envy",
        "description": "If you are looking for a compact premium laptop, the HP Envy 13-inch is for you.",
        "bullets": "• Compact 13-inch design\n• 8GB RAM\n• 512GB SSD storage",
        "specs": "8GB RAM, 512GB SSD, 13-inch display",
        "price": null,
        "stockStatus": "In Stock"
    },
    {
        "displayOrder": 132,
        "brand": "HP",
        "productCode": "",
        "category": "HP 14 Laptop",
        "description": "If you are looking for a dependable everyday laptop, the HP 14 i3 (Silver) is for you.",
        "bullets": "• Intel Core i3\n• 8GB RAM\n• 512GB SSD storage",
        "specs": "Intel Core i3, 8GB RAM, 512GB SSD, 14-inch display",
        "price": null,
        "stockStatus": "In Stock"
    },
    {
        "displayOrder": 133,
        "brand": "HP",
        "productCode": "",
        "category": "HP 14 Laptop",
        "description": "If you are looking for a dependable everyday laptop, the HP 14 i3 (Dark Silver) is for you.",
        "bullets": "• Intel Core i3\n• 8GB RAM\n• 512GB SSD storage",
        "specs": "Intel Core i3, 8GB RAM, 512GB SSD, 14-inch display",
        "price": null,
        "stockStatus": "In Stock"
    },
    {
        "displayOrder": 134,
        "brand": "HP",
        "productCode": "",
        "category": "HP 14 Laptop",
        "description": "If you are looking for an affordable everyday laptop, the HP 14 i3 (Black, 256GB) is for you.",
        "bullets": "• Intel Core i3\n• 8GB RAM\n• 256GB SSD storage",
        "specs": "Intel Core i3, 8GB RAM, 256GB SSD, 14-inch display",
        "price": null,
        "stockStatus": "In Stock"
    },
    {
        "displayOrder": 135,
        "brand": "Orex",
        "productCode": "",
        "category": "Solar Battery",
        "description": "If you are looking for a reliable inverter battery, the Orex 240Ah/12V Battery is for you.",
        "bullets": "• 240Ah capacity\n• 12V output\n• Built for inverter backup",
        "specs": "240Ah, 12V, deep-cycle battery for inverter use",
        "price": null,
        "stockStatus": "In Stock"
    },
    {
        "displayOrder": 136,
        "brand": "WEXcell",
        "productCode": "",
        "category": "Solar Battery",
        "description": "If you are looking for a reliable inverter battery, the WEXcell 240Ah/12V Battery is for you.",
        "bullets": "• 240Ah capacity\n• 12V output\n• Built for inverter backup",
        "specs": "240Ah, 12V, deep-cycle battery for inverter use",
        "price": null,
        "stockStatus": "In Stock"
    },
    {
        "displayOrder": 137,
        "brand": "HP",
        "productCode": "",
        "category": "HP Pavilion",
        "description": "",
        "bullets": "• 14-inch display\n• 512GB SSD storage\n• RAM to be confirmed",
        "specs": "512GB SSD, 14-inch display, RAM TBC",
        "price": null,
        "stockStatus": "In Stock"
    },
    {
        "displayOrder": 138,
        "brand": "HP",
        "productCode": "",
        "category": "HP Pavilion",
        "description": "",
        "bullets": "• 14-inch display\n• 1TB SSD storage\n• RAM to be confirmed",
        "specs": "1TB SSD, 14-inch display, RAM TBC",
        "price": null,
        "stockStatus": "In Stock"
    },
    {
        "displayOrder": 139,
        "brand": "HP",
        "productCode": "",
        "category": "HP OmniBook",
        "description": "",
        "bullets": "• 16GB RAM\n• 14-inch display\n• Storage size to be confirmed",
        "specs": "16GB RAM, 14-inch display, storage noted as 1TB but unclear -- TBC",
        "price": null,
        "stockStatus": "In Stock"
    },
    {
        "displayOrder": 140,
        "brand": "HP",
        "productCode": "",
        "category": "HP OmniBook",
        "description": "",
        "bullets": "• 16GB RAM\n• 14-inch display\n• Smaller storage option -- exact size to be confirmed",
        "specs": "16GB RAM, 14-inch display, storage noted as 512GB but unclear -- TBC",
        "price": null,
        "stockStatus": "In Stock"
    },
    {
        "displayOrder": 141,
        "brand": "HP",
        "productCode": "",
        "category": "HP ProBook",
        "description": "",
        "bullets": "• 16GB RAM\n• 512GB SSD storage\n• Screen size to be confirmed",
        "specs": "16GB RAM, 512GB SSD, screen size TBC",
        "price": null,
        "stockStatus": "In Stock"
    },
    {
        "displayOrder": 142,
        "brand": "HP",
        "productCode": "",
        "category": "Pending Confirmation",
        "description": "",
        "bullets": "• Intel Celeron processor\n• 8GB RAM\n• 512GB SSD storage\n• Exact model to be confirmed",
        "specs": "Celeron processor, 8GB RAM, 512GB SSD, series/model TBC",
        "price": null,
        "stockStatus": "In Stock"
    },
    {
        "displayOrder": 143,
        "brand": "HP",
        "productCode": "",
        "category": "HP Victus Gaming",
        "description": "",
        "bullets": "• 8GB RAM\n• 512GB SSD storage\n• 15-inch display\n• Wi-Fi enabled",
        "specs": "8GB RAM, 512GB SSD, 15-inch display, Wi-Fi enabled, model TBC",
        "price": null,
        "stockStatus": "In Stock"
    },
    {
        "displayOrder": 144,
        "brand": "HP",
        "productCode": "",
        "category": "Pending Confirmation",
        "description": "",
        "bullets": "• Intel Celeron processor\n• 8GB RAM\n• 15-inch display\n• Runs FreeDOS (no pre-installed Windows)\n• Storage size to be confirmed",
        "specs": "Celeron processor, 8GB RAM, FreeDOS, 15-inch display, storage TBC",
        "price": null,
        "stockStatus": "In Stock"
    },
    {
        "displayOrder": 145,
        "brand": "HP",
        "productCode": "",
        "category": "Pending Confirmation",
        "description": "",
        "bullets": "• Intel Celeron processor\n• 256GB SSD storage\n• 15-inch display\n• Most affordable SSD unit on the floor\n• RAM to be confirmed",
        "specs": "Celeron processor, 256GB SSD, 15-inch display, RAM TBC",
        "price": null,
        "stockStatus": "In Stock"
    },
    {
        "displayOrder": 146,
        "brand": "Cworth",
        "productCode": "",
        "category": "Solar Battery",
        "description": "",
        "bullets": "• 6kW capacity\n• Cworth solar range\n• Battery or inverter type to be confirmed",
        "specs": "6kW capacity, battery vs inverter TBC",
        "price": null,
        "stockStatus": "In Stock"
    },
    {
        "displayOrder": 147,
        "brand": "Cworth",
        "productCode": "",
        "category": "Solar Battery",
        "description": "",
        "bullets": "• 15kW capacity\n• 'Blue Carbon' sub-brand within the Cworth range\n• May match an existing catalogue item -- to be confirmed",
        "specs": "15kW capacity, 'Blue Carbon' sub-brand, battery vs inverter TBC",
        "price": null,
        "stockStatus": "In Stock"
    },
    {
        "displayOrder": 148,
        "brand": "Cworth",
        "productCode": "",
        "category": "Solar Battery",
        "description": "",
        "bullets": "• 20kW capacity\n• Cworth solar range\n• May match an existing catalogue item -- to be confirmed",
        "specs": "20kW capacity, battery vs inverter TBC",
        "price": null,
        "stockStatus": "In Stock"
    },
    {
        "displayOrder": 149,
        "brand": "",
        "productCode": "",
        "category": "Solar Battery",
        "description": "",
        "bullets": "• 5kW lithium battery\n• Standalone unit\n• Brand to be confirmed",
        "specs": "5kW lithium battery, standalone unit, brand TBC",
        "price": null,
        "stockStatus": "In Stock"
    },
    {
        "displayOrder": 150,
        "brand": "Growatt",
        "productCode": "",
        "category": "Solar Battery",
        "description": "",
        "bullets": "• Growatt lithium battery option\n• Capacity to be confirmed",
        "specs": "Lithium battery option, capacity TBC",
        "price": null,
        "stockStatus": "In Stock"
    },
    {
        "displayOrder": 151,
        "brand": "",
        "productCode": "",
        "category": "Solar All-in-One",
        "description": "",
        "bullets": "• All-in-one inverter and battery in a single unit\n• Only one unit currently on the floor\n• Brand and capacity to be confirmed",
        "specs": "All-in-one inverter + battery 'Power Tank' system, brand/capacity TBC",
        "price": null,
        "stockStatus": "In Stock"
    },
    {
        "displayOrder": 152,
        "brand": "Deye",
        "productCode": "",
        "category": "Solar Inverter",
        "description": "",
        "bullets": "• Deye power inverter\n• Capacity to be confirmed",
        "specs": "Power inverter, capacity TBC",
        "price": null,
        "stockStatus": "In Stock"
    },
    {
        "displayOrder": 153,
        "brand": "Choice",
        "productCode": "",
        "category": "Solar Inverter",
        "description": "",
        "bullets": "• Choice solar inverter\n• Capacity to be confirmed",
        "specs": "Capacity TBC",
        "price": null,
        "stockStatus": "In Stock"
    },
    {
        "displayOrder": 154,
        "brand": "Felicity",
        "productCode": "",
        "category": "Solar Inverter",
        "description": "",
        "bullets": "• Felicity solar inverter\n• Capacity to be confirmed",
        "specs": "Capacity TBC",
        "price": null,
        "stockStatus": "In Stock"
    },
    {
        "displayOrder": 155,
        "brand": "iSense",
        "productCode": "",
        "category": "Solar Inverter",
        "description": "",
        "bullets": "• 48V, 120A rating\n• May be a solar charge controller rather than an inverter -- to be confirmed",
        "specs": "48V, 120A rating, inverter vs charge controller TBC",
        "price": null,
        "stockStatus": "In Stock"
    }
];

export const SOLAR_PRODUCTS: SolarProduct[] = [
  // Inverters
  { id: "s1", cat: "Inverters", n: "Choice 1.5KVA 12V Inverter", brand: "Choice", sp: "1.5KVA · 12V · Entry home use", price: "₦220,000", desc: "Excellent entry-level system. Powers standard lights, fans, TV, and laptops during short cuts." },
  { id: "s2", cat: "Inverters", n: "Choice 2.5KVA 24V Inverter", brand: "Choice", sp: "2.5KVA · 24V · Standard home", price: "₦360,000", desc: "Standard household inverter. Excellent stability, handles multiple rooms, fans, refrigerators, and electronics." },
  { id: "s3", cat: "Inverters", n: "Choice 5KVA 48V Inverter", brand: "Choice/Foresolar", sp: "5KVA · 48V · Heavy home/light commercial", price: "₦520,000", desc: "Powerful inverter for large houses or active small offices. Handles heavy lighting, multiple coolers, and small water pumps." },
  { id: "s4", cat: "Inverters", n: "Cworth 1.8KVA Hybrid", brand: "Cworth", sp: "1.8KVA · 24V · Hybrid inverter", price: "₦300,000", desc: "Integrated solar controller and pure sine wave inverter in one unit. Highly efficient, auto-switches solar, grid and battery." },
  { id: "s5", cat: "Inverters", n: "Cworth 3.6KVA Hybrid", brand: "Cworth", sp: "3.6KVA · 24V · Hybrid inverter", price: "₦430,000", desc: "Medium power hybrid. Connects solar panels directly without external controllers. Highly intuitive display panel." },
  { id: "s6", cat: "Inverters", n: "Cworth 4KVA Hybrid", brand: "Cworth", sp: "4KVA · 24V · Hybrid inverter", price: "₦520,000", desc: "Heavy-duty 24V hybrid inverter. Designed for medium households wanting comprehensive solar independence." },
  { id: "s7", cat: "Inverters", n: "Growatt 6KW Hybrid", brand: "Growatt", sp: "6KW · 48V · 2 MPPT · Hybrid", price: "₦680,000", desc: "Premium smart inverter. Elite performance with smart app monitoring, high voltage solar array support, and clean power delivery." },
  { id: "s8", cat: "Inverters", n: "Felicity 5KVA Hybrid", brand: "Felicity", sp: "5KVA · 48V · Pure sine wave · Hybrid", price: "₦850,000", desc: "Top-tier reliability. Excellent heat management, smart programmable cycles, and extreme power output." },
  { id: "s9", cat: "Inverters", n: "Felicity 10KVA Hybrid", brand: "Felicity", sp: "10KVA · 48V · Hybrid · Commercial grade", price: "₦1,400,000", desc: "Heavy commercial scale hybrid inverter. Powers entire warehouses, medical laboratories, deep freezers, and dynamic heavy loads." },

  // Lithium Batteries
  { id: "s10", cat: "Lithium Batteries", n: "12.4V 2400W Lithium Battery", brand: "Generic", sp: "12.4V · 2400W · Compact home use", price: "₦250,000", desc: "Sleek compact storage. Ideal replacement for standard lead batteries, lasting up to 5 times longer with faster charging times." },
  { id: "s11", cat: "Lithium Batteries", n: "Deye 5KWH 48V Lithium", brand: "Deye", sp: "5KWH · 48V · Premium lithium", price: "₦1,050,000", desc: "World-class energy storage wall. Sleek wall-mounted design, smart battery management system (BMS), and up to 10 years active lifespan." },
  { id: "s12", cat: "Lithium Batteries", n: "Cworth 5KWH 48V Lithium", brand: "Cworth", sp: "5KWH · 48V · Long cycle life", price: "₦1,150,000", desc: "High discharge rating battery. Highly stable and compatible with major inverter protocols." },
  { id: "s13", cat: "Lithium Batteries", n: "Felicity 5KWH 48V Lithium", brand: "Felicity", sp: "5KWH · 48V · Deep cycle lithium", price: "₦1,150,000", desc: "Extremely popular smart lithium battery. Excellent protection standards, long lifecycle, perfect companion for 5KVA setups." },
  { id: "s14", cat: "Lithium Batteries", n: "Felicity 10KWH 48V Lithium", brand: "Felicity", sp: "10KWH · 48V · Heavy duty", price: "₦1,800,000", desc: "Massive storage capacity. Excellent for offices and large family houses seeking comprehensive night-time autonomy." },
  { id: "s15", cat: "Lithium Batteries", n: "Blue Carbon 15KWH Lithium", brand: "Blue Carbon", sp: "15KWH · Commercial grade · Long life", price: "₦2,200,000", desc: "Heavy commercial power reserve. Features highly stable lithium-iron-phosphate (LiFePO4) chemistry for ultimate safety and performance." },
  { id: "s16", cat: "Lithium Batteries", n: "Cworld 20KWH Lithium", brand: "Cworld", sp: "20KWH · Industrial grade", price: "₦3,200,000", desc: "Mega industrial battery backup. Keeps production facilities, servers, or mini-grids running reliably through extended darkness." },

  // Tubular Battery
  { id: "s17", cat: "Tubular Battery", n: "12V 220AH Tubular Battery", brand: "Generic", sp: "12V · 220AH · Deep cycle · Long life", price: "₦260,000", desc: "Heavy deep-cycle acid battery. Robust and durable with low maintenance, excellent for affordable backup power." },

  // Solar Panels
  { id: "s18", cat: "Solar Panels", n: "460W Fairly Used Panel", brand: "Various", sp: "460W · Monocrystalline · Tested", price: "₦50,000", desc: "Verified secondary solar panels. Pre-tested output rates, extremely economical for quick setups or low budgets." },
  { id: "s19", cat: "Solar Panels", n: "460W Exulted Mono Panel", brand: "Exulted", sp: "460W · Monocrystalline · New", price: "₦95,000", desc: "High-grade monocrystalline cell technology. Excellent performance under low-light and cloudy conditions." },
  { id: "s20", cat: "Solar Panels", n: "450W Jinko Mono Panel", brand: "jinko", sp: "450W · Mono Bifacial · Tier 1 brand", price: "₦140,000", desc: "Premium tier-1 panels. Certified quality standard, durable framing, high conversion efficiency." },
  { id: "s21", cat: "Solar Panels", n: "590W Jinko Mono Bifacial", brand: "jinko", sp: "590W · Mono Bifacial · High power", price: "₦155,000", desc: "Double-sided generation! Captures solar light from both sides of the panel, boosting efficiency up to an extra 25%." },
  { id: "s22", cat: "Solar Panels", n: "620W Jinko Mono Bifacial", brand: "jinko", sp: "620W · Mono Bifacial · Premium", price: "₦160,000", desc: "High-output professional panel. Delivers incredible power density, reducing total required roof footprint." },
  { id: "s23", cat: "Solar Panels", n: "715W Jinko Solar Panel", brand: "jinko", sp: "715W · Mono · Ultra high power", price: "₦170,000", desc: "One of the most powerful panels on the market. Maximizes solar yield per square meter, perfect for dynamic installations." },

  // Controllers
  { id: "s24", cat: "Controllers", n: "Felicity 60A Controller", brand: "Felicity", sp: "60A · 12/24V · MPPT charge control", price: "₦190,000", desc: "Highly stable smart solar charger. Increases solar panel yield up to 30% compared to standard PWM chargers." },
  { id: "s25", cat: "Controllers", n: "Felicity 80A Controller", brand: "Felicity", sp: "80A · 12/24V · High current MPPT", price: "₦260,000", desc: "Heavy duty MPPT charger. Protects battery banks from overcharging, monitors dynamic input flows." },
  { id: "s26", cat: "Controllers", n: "Felicity 100A Controller", brand: "Felicity", sp: "100A · High capacity MPPT", price: "₦300,000", desc: "Ultimate high current MPPT solar regulator. Excellent heat dissipation and high efficiency tracking." },
  { id: "s27", cat: "Controllers", n: "Felicity 120A Controller", brand: "Felicity", sp: "120A · Maximum capacity MPPT", price: "₦320,000", desc: "Heavy commercial grade MPPT. Coordinates very large panel arrays to deliver maximum charge currents." },

  // Cables
  { id: "s28", cat: "Cables", n: "6MM Solar Cable", brand: "Generic", sp: "6mm · Per metre · High current rated", price: "₦5,000", desc: "Heavy duty pure copper outdoor solar cables. UV protected casing prevents decay under Delta heat." },
  { id: "s29", cat: "Cables", n: "10MM Solar Cable", brand: "Generic", sp: "10mm · Per metre · Heavy duty", price: "₦6,800", desc: "Ultra-thick power transmission cable. Prevents power losses over long cable lengths between array and inverter." },

  // All-in-One
  { id: "s30", cat: "All-in-One", n: "Cworth 1200W/2500WH Solar Generator", brand: "Cworth", sp: "1200W · 2500WH · All-in-one · Portable", price: "₦750,000", desc: "Complete portable solar generator! Includes integrated lithium battery, smart inverter, USB ports, AC plugs, and solar charger in a single box." },
  { id: "s31", cat: "All-in-One", n: "Itel 500W Solar Generator 1000Wh", brand: "Itel", sp: "500W · 1000Wh · Lithium · Portable", price: "₦380,000", desc: "Lightweight utility generator. Excellent for running televisions, desktop computers, or routers during blackouts." }
];
