import { config } from "dotenv";
config({ path: ".env.local" });
import { GenerationService } from "./src/lib/services/generation-service";
import { medicalIllustrationSchema } from "./src/lib/schemas/medical-illustration";
import { compileMedicalPrompt } from "./src/lib/compilers/prompt-compiler";
import { pruneDescriptions } from "./src/lib/utils";

async function run() {
  const brief = "Laparoscopic cholecystectomy. Surgical anatomy showing a metallic surgical clamp precisely applied to the bright red, tubular cystic artery within Calots triangle. The common hepatic duct is medial, cystic duct lateral, liver edge superior.";
  
  // Simulated Expansion Output (to save API calls/time if we just want to test compiler logic)
  const expandedText = "### PHASE 1 — ANATOMICAL GROUNDING... \n### PHASE 2 — OPERATIVE VISUAL SPECIFICATION: \nLaparoscopic view of Calot's triangle during cholecystectomy. The cystic artery is bright red and clamped with a metallic surgical clip applier. The liver edge is superior, common hepatic duct is medial, and cystic duct is lateral. The surgical field is illuminated by cold LED lighting.";
  
  const minSchema = JSON.parse(JSON.stringify(medicalIllustrationSchema));
  pruneDescriptions(minSchema);
  const schemaStr = JSON.stringify(minSchema);

  const sysInstruction = `### ROLE: PRINCIPAL MEDICAL ILLUSTRATOR
SCHEMA MANDATE: Return JSON strictly following schema: ${schemaStr}
NO TEXT LABELS.`;

  console.log("Generating JSON...");
  const adData: any = {
    diffusion_synthesis: {
      master_prompt: "The cystic artery is clamped.",
      imagen_prompt: "The cystic artery is clamped.",
      negative_prompt: "Do not show: abstract colors",
      priority_weighting: { primary_focus: ["cystic artery", "liver", "clamp"] }
    },
    medical_content: {}
  };

  
  
  console.log("Compiling Prompt...");
  compileMedicalPrompt(adData, brief, "BioRender");

  console.log("\n--- RESULT ---");
  console.log("Master Prompt (ChatGPT/DallE):", adData.diffusion_synthesis?.master_prompt);
  console.log("Imagen Prompt (Gemini):", adData.diffusion_synthesis?.imagen_prompt);
  console.log("Negative Prompt:", adData.diffusion_synthesis?.negative_prompt);
}

run().catch(console.error);
