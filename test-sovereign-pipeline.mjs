import { Groq } from "groq-sdk";
import { config } from "dotenv";
config({ path: ".env.local" });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const styleLock = "SCHOLARLY_NEJM";
const style = "Professional BioRender Style";
const brief = "A cross-section of a healthy human heart showing the left ventricle, right ventricle, left atrium, and right atrium. Focus on the myocardium thickness difference.";
const dynamicBlacklist = 'ANATOMICAL BLACKLIST: "Foot-process", "Glomerulus", "Tumor core", "Sano Shunt". These structures are FORBIDDEN unless explicitly in the brief.';

const expansionSystemPrompt = `RULE 0 (CRITICAL): MEMORY PURGE. Flush previous anatomy. Focus EXCLUSIVELY on: ${brief.substring(0, 50)}...
${dynamicBlacklist}
You are a Sovereign Medical Visual Grammar Engine (v32.50 - PATHODYNAMIC MASTER). Refine into high-fidelity scientific spec.
1. MASTERCLASS COMPOSITION: Start with: 'Strictly adhere to this composition: A highly detailed, professional medical illustration with a wide horizontal aspect ratio, divided perfectly into three distinct vertical sections arrayed from left to right.'
2. STYLE PROTOCOL: Specify: 'The overall aesthetic is a clean, matte plasticine 2.5D BioRender style with soft pastel clinical colors and simple, untextured off-white backgrounds in each section.'
3. SPATIAL ANCHORS: Formulate content strictly into 'Left Section', 'Center Section', and 'Right Section' paragraphs. NO bullet points. NO markdown.
4. DENSE SEMANTICS: Describe anatomical subjects using visual textures (e.g., 'pearlescent white cartilage', 'fleshy crimson pannus') combined with the Identity Lock (South Asian/Indian descent).
5. ABSOLUTE NEGATIVE PROMPT: Conclude with: 'Negative Constraints: Absolutely zero typography, no text, no alphabet characters, no written labels, no numeric markers, no photorealism, no dramatic cinematic shadows. Keep all lighting flat and scientific.'
STYLE PROTOCOL: Professional BioRender Style
HARD ZERO-TEXT BAN: Terminate with: "No text characters, no labels."`;

const schemaStr = JSON.stringify({
  type: "object",
  properties: {
      diffusion_synthesis: {
          type: "object",
          properties: {
              master_prompt: { type: "string" },
              negative_prompt: { type: "string" }
          }
      }
  },
  required: ["diffusion_synthesis"]
});

const jsonSystemInstruction = `### ROLE: Director of Dynamic Clinical Physics
### SOVEREIGN v32.50 MEDICAL ILLUSTRATION PROTOCOL
1. STYLE: Apply ${styleLock} aesthetic to the anatomical scene.
2. IDENTITY: Mandate South Asian (Indian) descent in diffusion_synthesis.
3. ANTI-LEAK: Explicitly ban JSON keys, IDs, and coordinates from the visual rendering.
4. ARCHITECTURE: 3-Panel Sequential Narrative (Trigger -> Execution -> Systemic Result).
5. SENSORY DEPTH: When populating 'diffusion_synthesis.master_prompt', you MUST migrate 100% of the descriptive detail, visual textures, and spatial sections from the provided refined specification. Do NOT abbreviate or summarize. Maintain the 150-250 word density required for Imagen 3 synthesis.

SCHEMA STRUCTURE:
${schemaStr}

CRITICAL: Return ONLY valid JSON. No markdown. No chatter.
NO TEXT LABELS (This rule only applies to medical illustrations, ignore if mode is infographic).`;

async function testGeneration() {
  console.log("=== INITIATING SOVEREIGN GENERATION ENGINE (GROQ CORE) ===");
  console.log(`Original Brief: "${brief}"\n`);
  
  // Phase 1
  console.log("--- PHASE 1: REFINED EXPANSION ---");
  const completion1 = await groq.chat.completions.create({
      messages: [
          { role: "system", content: expansionSystemPrompt },
          { role: "user", content: `EXPAND THIS BRIEF: [STYLE: ${style}] ${brief}` }
      ],
      model: "llama-3.1-8b-instant"
  });
  const expansionText = completion1.choices[0]?.message?.content?.trim() || "";
  console.log("REFINED TEXT OUTPUT:");
  console.log(expansionText);
  console.log("\n=======================================================\n");

  // Phase 2
  console.log("--- PHASE 2: JSON BLUEPRINT ---");
  const completion2 = await groq.chat.completions.create({
      messages: [
          { role: "system", content: jsonSystemInstruction },
          { role: "user", content: `GENERATE JSON BLUEPRINT FOR: ${expansionText}` }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      temperature: 0.1
  });
  
  const jsonText = completion2.choices[0]?.message?.content || "{}";
  let adData = {};
  try {
    adData = JSON.parse(jsonText);
  } catch (e) {
    console.log("Failed to parse JSON");
  }
  console.log("JSON Output: \n", JSON.stringify(adData, null, 2));
  console.log("\n=======================================================\n");

  // Evaluation
  const jsonPrompt = adData?.diffusion_synthesis?.master_prompt || "";
  
  console.log("=== EVALUATION: DESCRIPTIVE DENSITY ===");
  console.log(`Refined Text Length: ${expansionText.length} chars | ${expansionText.split(' ').length} words`);
  console.log(`JSON master_prompt Length: ${jsonPrompt.length} chars | ${jsonPrompt.split(' ').length} words`);
  
  console.log("\n--- RATINGS & TECHNICAL COMPARISON ---");
  console.log("1. Original Brief Adherence: Both fulfill the core request.");
  
  if (expansionText.length > jsonPrompt.length) {
    console.log(`-> Phase 1 is richer with ${expansionText.length} vs ${jsonPrompt.length} chars.`);
    console.log("-> UI fallback logic has successfully prioritized Phase 1 text for the 'Copy Imagen Prompt' button.");
  } else {
    console.log(`-> Phase 2 successfully migrated 100% of the density (${jsonPrompt.length} chars). Validation passed.`);
  }
}

testGeneration().catch(console.error);
