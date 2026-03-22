const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function checkStatus() {
  if (!process.env.GEMINI_API_KEY) {
    console.log("No GEMINI_API_KEY found.");
    return;
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  console.log("Testing Models...");

  const testModel = async (modelName) => {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Hello. Just answer OK.");
      console.log(`[PASS] ${modelName}: Active and OK!`);
    } catch (e) {
      console.log(`[FAIL] ${modelName}: ${e.message}`);
    }
  };

  await testModel("gemini-1.5-flash");
  await testModel("gemini-2.0-flash");
}

checkStatus();
