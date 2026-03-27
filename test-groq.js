const { Groq } = require("groq-sdk");
require('dotenv').config({ path: '.env.local' });

async function checkStatus() {
  if (!process.env.GROQ_API_KEY) {
    console.log("No GROQ_API_KEY found in .env.local.");
    return;
  }
  
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    console.log("Testing Groq (Llama-3.3-70b)...");
    
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: "Hello. Just answer OK." }],
      model: "llama-3.3-70b-versatile",
    });
    
    console.log(`[PASS] Groq: Active and OK! Response: ${completion.choices[0]?.message?.content}`);
  } catch (e) {
    console.log(`[FAIL] Groq: ${e.message}`);
    if (e.status === 401) {
      console.log("HINT: Your Groq API key is definitely invalid or expired (401).");
    }
  }
}

checkStatus();
