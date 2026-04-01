async function runTest() {
  const payload = {
    mode: "medical",
    brief: "A cross-section of a healthy human heart showing the left ventricle, right ventricle, left atrium, and right atrium. Focus on the myocardium thickness difference.",
    style: "Professional BioRender Style"
  };

  console.log("Sending request to http://localhost:3000/api/generate...");
  console.log(`Brief: "${payload.brief}"\n`);

  try {
    const res = await fetch('http://localhost:3000/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    
    if (data.success) {
      console.log("=== PHASE 1: REFINED EXPANSION TEXT (For Imagen 3 copy) ===");
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
        console.log("RESULT: Refined Text is richer. The UI fallback will correctly use Refined Text for the Imagen 3 copy button.");
      } else {
        console.log("RESULT: JSON master_prompt is richer. The UI will use JSON master_prompt for the Imagen 3 copy button.");
      }
      process.exit(0);
    } else {
      console.error("API Error:", data);
      process.exit(1);
    }
    
  } catch (e) {
    if (e.code === 'ECONNREFUSED') {
       console.log("Server not ready yet. Retrying in 5 seconds...");
       setTimeout(runTest, 5000);
    } else {
       console.error("Fetch failed:", e);
       process.exit(1);
    }
  }
}

runTest();
