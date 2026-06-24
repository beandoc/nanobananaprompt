import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("❌ No GEMINI_API_KEY found in .env.local");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

const models = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-exp",
  "gemini-2.0-pro-exp-02-05",
  "gemini-1.5-pro",
  "gemini-1.5-pro-latest",
  "gemini-1.5-flash",
  "gemini-1.5-flash-latest"
];

async function testAllModels() {
  console.log("Starting model capabilities test...\n");
  
  for (const modelName of models) {
    console.log(`Testing model: [${modelName}]...`);
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const startTime = Date.now();
      const response = await model.generateContent("Hello, respond in exactly 3 words.");
      const duration = Date.now() - startTime;
      console.log(`  ✅ SUCCESS! Response: "${response.response.text().trim()}" (${duration}ms)\n`);
    } catch (err: any) {
      console.error(`  ❌ FAILED! Error: ${err.message}\n`);
    }
  }
}

testAllModels().catch(console.error);
