import { config } from "dotenv";
config({ path: ".env.local" });
import { compileMedicalPrompt } from "./src/lib/compilers/prompt-compiler";

// Mocking the adData structure for 5 different cases
const cases: Array<{ name: string; brief: string; adData: any }> = [
  {
    name: "Case 1: Electron Microscopy (Podocyte effacement)",
    brief: "Glomerulus showing podocyte effacement.",
    adData: {
      diffusion_synthesis: {
        master_prompt: "The glomerulus shows diffuse foot process effacement.",
        priority_weighting: { primary_focus: ["podocyte", "glomerular basement membrane"] },
      },
      metadata: { subject: "Podocyte effacement" },
      medical_content: {}
    }
  },
  {
    name: "Case 2: Light Microscopy (Acute myocardial infarction)",
    brief: "Acute myocardial infarction with neutrophil infiltration.",
    adData: {
      diffusion_synthesis: {
        master_prompt: "Myocardium with neutrophil infiltration and coagulative necrosis.",
        priority_weighting: { primary_focus: ["myocardium", "neutrophils"] },
      },
      metadata: { subject: "Acute myocardial infarction" },
      medical_content: {
        pathophysiology: {
          description: "Coronary artery occlusion leads to ischemic necrosis of the myocardium.",
          cascade: [
            { event: "Plaque rupture", mechanism: "exposes thrombogenic core", consequence: "triggering thrombosis" },
            { event: "Coronary occlusion", mechanism: "blocks blood flow", consequence: "causing ischemia" }
          ]
        }
      }
    }
  },
  {
    name: "Case 3: Gross Anatomy (Aortic aneurysm)",
    brief: "Aortic aneurysm with a tear in the intima.",
    adData: {
      diffusion_synthesis: {
        master_prompt: "An aortic aneurysm showing an intimal tear and dissection.",
        priority_weighting: { primary_focus: ["aorta", "intimal tear"] },
      },
      metadata: { subject: "Aortic aneurysm" },
      medical_content: {}
    }
  },
  {
    name: "Case 4: Surgical (Laparoscopic appendectomy)",
    brief: "Laparoscopic appendectomy.",
    adData: {
      diffusion_synthesis: {
        master_prompt: "Laparoscopic view of the inflamed appendix being grasped by an instrument.",
        priority_weighting: { primary_focus: ["appendix", "laparoscopic grasper"] },
      },
      metadata: { subject: "Laparoscopic appendectomy" },
      medical_content: {}
    }
  },
  {
    name: "Case 5: Multi-organ (Lupus with butterfly rash and kidney biopsy)",
    brief: "Patient with lupus showing butterfly rash and kidney biopsy with wire loop lesions.",
    adData: {
      diffusion_synthesis: {
        master_prompt: "Clinical presentation of a malar rash and a renal biopsy showing wire loop lesions.",
        priority_weighting: { primary_focus: ["rash", "wire loop"] },
      },
      metadata: { subject: "Lupus multi-organ" },
      medical_content: {}
    }
  }
];

cases.forEach((c) => {
  console.log(`\n===========================================`);
  console.log(`Testing: ${c.name}`);
  console.log(`Brief: ${c.brief}`);
  compileMedicalPrompt(c.adData, c.brief, "BioRender");
  console.log(`\nIMAGEN PROMPT:`);
  console.log(c.adData.diffusion_synthesis.imagen_prompt);
});
