import { POST } from './src/app/api/generate/route';
import { NextRequest } from 'next/server';
import { config } from 'dotenv';
config({ path: '.env.local' });

async function run() {
  const payload = {
    mode: "medical",
    brief: "A cross-section of a healthy human heart showing the left ventricle, right ventricle, left atrium, and right atrium. Focus on the myocardium thickness difference.",
    style: "Professional BioRender Style",
    lightweight: false
  };

  console.log("Mocking NextRequest with payload:", payload);

  const req = new NextRequest('http://localhost:3000/api/generate', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' }
  });

  try {
    const res = await POST(req);
    const data = await res.json();

    if (data.success) {
      console.log("\n=== PHASE 1: REFINED EXPANSION TEXT (For Imagen 3 copy) ===");
      console.log(data.data.refinedPrompt);
      console.log("\n=======================================================\n");
      
      console.log("=== PHASE 2: TECHNICAL JSON BLUEPRINT (From model) ===\n");
      const jsonPrompt = data.data.data?.diffusion_synthesis?.master_prompt || "";
      const refinedPrompt = data.data.refinedPrompt || "";
      
      console.log("JSON Output: \n", JSON.stringify(data.data.data, null, 2));
      console.log("\n=======================================================\n");

      // Evaluation
      console.log("=== EVALUATION: DESCRIPTIVE DENSITY ===");
      console.log(`Refined Text Length: ${refinedPrompt.length} chars | ${refinedPrompt.split(' ').length} words`);
      console.log(`JSON master_prompt Length: ${jsonPrompt.length} chars | ${jsonPrompt.split(' ').length} words`);
      
      if (refinedPrompt.length > jsonPrompt.length) {
        console.log("RESULT: Refined Text is richer! UI fallback confirmed.");
      } else {
        console.log("RESULT: JSON master_prompt is richer.");
      }
    } else {
      console.log("API Error:", data);
    }
  } catch (err) {
    console.error("Test failed:", err);
  }
}

run();
