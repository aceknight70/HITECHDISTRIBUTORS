import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { put } from "@vercel/blob";
import { PRODUCTS, SOLAR_PRODUCTS } from "./src/data/catalog.js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Set up public upload directory for fallback
const uploadDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Support serving uploaded files
app.use("/uploads", express.static(uploadDir));

// Multer storage config for local fallback
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// API 1: File Upload Test with Vercel Blob fallback
app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (fileToken) {
      // Real Vercel Blob upload when token is present
      const fileBuffer = fs.readFileSync(req.file.path);
      const blob = await put(req.file.originalname, fileBuffer, {
        access: "public",
        token: fileToken,
      });
      // Clean up local temp file
      fs.unlinkSync(req.file.path);
      return res.json({
        success: true,
        provider: "vercel-blob",
        url: blob.url,
        filename: req.file.originalname,
      });
    } else {
      // Local fallback in workspace development
      const relativeUrl = `/uploads/${req.file.filename}`;
      return res.json({
        success: true,
        provider: "local-workspace",
        url: relativeUrl,
        filename: req.file.originalname,
      });
    }
  } catch (err: any) {
    console.error("Upload error:", err);
    res.status(500).json({ error: err.message || "Failed to upload file" });
  }
});

// Lazy-loaded Gemini AI client to prevent startup crashes if key is missing
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing. Please add it to your secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Embedded Catalog summaries to feed into Gemini context
const prodsSummary = PRODUCTS.map(p => `ID:${p.id} - ${p.n} (${p.sp}) - Price:${p.price} [Cat:${p.cat}]`).join("\n");
const solarSummary = SOLAR_PRODUCTS.map(s => `ID:${s.id} - ${s.n} (${s.sp}) - Price:${s.price} [Brand:${s.brand}, Cat:${s.cat}]`).join("\n");

// API 2: Gemini Chat (Info Booth)
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages array" });
    }

    const ai = getGemini();

    const systemInstruction = `You are a friendly, helpful in-store sales assistant at "HiTech Distributors" (formal legal name, also known as consumer brand "HiTech Emporium") located at 6 Airport Road, Warri, Delta State, Nigeria (Phone/WhatsApp: 08032175552, Hours: Mon–Sat 8am–6pm, Website: hitechd.com).

Core Directives:
1. Provide extremely friendly and warm in-store sales assistant service.
2. Keep responses highly concise (strictly 2 to 4 sentences).
3. Recommend specific products from the catalogs below using their precise name and pricing when relevant to the user's needs or queries.
4. If a user asks about repairs, solar sizing, or general information, answer directly and helpfully.
5. You support two tools/functions: "add_to_cart" and "open_whatsapp". If the user explicitly asks to buy or add a product to their cart, or asks to make an inquiry on WhatsApp, call the corresponding tool.

HITECH PRODUCTS CATALOG:
${prodsSummary}

SOLAR SYSTEM CATALOG:
${solarSummary}`;

    // Map message list to model format
    const lastMsg = messages[messages.length - 1];
    const contextHistory = messages.slice(0, -1).map(m => ({
      role: m.sender === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    }));

    // Define function declarations for tool use
    const addToCartTool: FunctionDeclaration = {
      name: "add_to_cart",
      description: "Adds a specific product ID to the user's shopping cart/quote.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          productId: { type: Type.STRING, description: "The product ID to add" },
          productName: { type: Type.STRING, description: "The name of the product being added" },
        },
        required: ["productId", "productName"],
      },
    };

    const openWhatsAppTool: FunctionDeclaration = {
      name: "open_whatsapp",
      description: "Prepares a WhatsApp enquiry text and link for the user.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          enquiryText: { type: Type.STRING, description: "Formatted WhatsApp message text" },
          recipientNumber: { type: Type.STRING, description: "Phone number without '+' or country prefix if local, or standard international format. Defaults to '2348065210611'" },
        },
        required: ["enquiryText"],
      },
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        ...contextHistory,
        { role: "user", parts: [{ text: lastMsg.text }] }
      ],
      config: {
        systemInstruction,
        tools: [{ functionDeclarations: [addToCartTool, openWhatsAppTool] }],
      },
    });

    const replyText = response.text || "I'm sorry, I couldn't process that.";
    const functionCalls = response.functionCalls || null;

    return res.json({
      text: replyText,
      functionCalls,
    });
  } catch (err: any) {
    console.error("Chat error:", err);
    res.status(500).json({ error: err.message || "AI Service Unavailable" });
  }
});

// API 3: Smart Solar Sizing Tool
app.post("/api/gemini/solar-sizing", async (req, res) => {
  try {
    const { appliances } = req.body; // array of { name, watts, hours, count }
    if (!appliances || !Array.isArray(appliances)) {
      return res.status(400).json({ error: "Invalid appliances data" });
    }

    const ai = getGemini();

    const applianceText = appliances.map(a => `- ${a.name}: ${a.watts}W, running ${a.hours} hours/day, count: ${a.count}`).join("\n");

    const prompt = `A user has entered the following appliances for solar system sizing:
${applianceText}

Calculate total daily load in Watt-hours (Wh). Based on the total wattage load and daily Watt-hours, look through our SOLAR CATALOG below and recommend the best combination of:
1. Inverter (must match required peak load)
2. Battery (Lithium or Tubular) with sufficient capacity in WH or Ah
3. Solar Panel(s) with sufficient total wattage to recharge the battery
4. Estimate of Cable/Controllers needed if applicable.

Return a clean JSON object containing:
- totalLoadWh: total daily energy load in Wh
- recommendedInverter: { id: string, name: string, price: string }
- recommendedBattery: { id: string, name: string, price: string }
- recommendedPanels: { id: string, name: string, quantity: number, price: string }
- reasoning: summary (2 sentences) of why this configuration was selected and how it powers their appliances.

SOLAR SYSTEM CATALOG:
${solarSummary}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            totalLoadWh: { type: Type.INTEGER },
            recommendedInverter: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                price: { type: Type.STRING },
              },
              required: ["id", "name", "price"],
            },
            recommendedBattery: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                price: { type: Type.STRING },
              },
              required: ["id", "name", "price"],
            },
            recommendedPanels: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                quantity: { type: Type.INTEGER },
                price: { type: Type.STRING },
              },
              required: ["id", "name", "quantity", "price"],
            },
            reasoning: { type: Type.STRING },
          },
          required: ["totalLoadWh", "recommendedInverter", "recommendedBattery", "recommendedPanels", "reasoning"],
        },
      },
    });

    const parsedData = JSON.parse(response.text || "{}");
    return res.json(parsedData);
  } catch (err: any) {
    console.error("Solar sizing error:", err);
    res.status(500).json({ error: err.message || "Failed to calculate solar sizing recommendation" });
  }
});

// API 4: AI Repair Triage
app.post("/api/gemini/repair-triage", async (req, res) => {
  try {
    const { problem } = req.body;
    if (!problem) {
      return res.status(400).json({ error: "Problem description is required" });
    }

    const ai = getGemini();

    const prompt = `Analyze this customer's device issue and estimate the fault category and repair complexity.
Problem Description: "${problem}"

Return a JSON object:
- category: A short 1-3 word classification (e.g. "Screen replacement", "Motherboard issue", "Toner replacement", "Software crash", "Battery degradation")
- complexity: "Low", "Medium", or "High"
- explanation: A concise 1-sentence estimation of complexity.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            complexity: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
            explanation: { type: Type.STRING },
          },
          required: ["category", "complexity", "explanation"],
        },
      },
    });

    const parsedData = JSON.parse(response.text || "{}");
    return res.json(parsedData);
  } catch (err: any) {
    console.error("Repair triage error:", err);
    // Graceful fallback
    return res.json({
      category: "Hardware check needed",
      complexity: "Medium",
      explanation: "A standard hardware diagnostics will be performed upon receipt.",
    });
  }
});

// Serve frontend build static files in production or delegate to Vite in dev
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
