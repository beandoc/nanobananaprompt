import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function run() {
  const { compileMedicalPrompt } = await import("./src/lib/compilers/prompt-compiler");
  
  const adData = {
    metadata: {
      subject: "surgical dissection of Calot's triangle",
      journal_standard: "BioRender"
    },
    diffusion_synthesis: {
      master_prompt: "A metallic surgical clamp is precisely applied to the bright red, tubular cystic artery within Calot's triangle, preventing blood flow and preparing for gallbladder removal. The surrounding ducts and connective tissue are clearly visible, highlighting the surgical field's clarity. The laparoscopic camera view is centered on Calot's triangle. The common hepatic duct is positioned medially, with the cystic duct running laterally to it. The inferior border of the liver is superior to these structures. The cystic artery is floating within the center of Calot's triangle, with the surgical clamp applied directly to it. The gallbladder is superior and slightly lateral to Calot's triangle, partially obscured by the liver edge. A BioRender-standard scientific illustration, clean 2.5D vector assets, matte plastic textures, depicting a laparoscopic view during cholecystectomy. The anatomical subject is Calot's triangle, normally a critical surgical landmark defined by the common hepatic duct medially, the cystic duct laterally, and the inferior border of the liver superiorly, containing the cystic artery and cystic lymph node.",
      priority_weighting: {
        primary_focus: ["Cystic duct", "Common hepatic duct", "Liver edge", "Cystic artery", "Surgical clamp"],
        secondary_context: ["Gallbladder", "Connective tissue"]
      },
      style_descriptors: ["BioRender", "2.5D", "vector", "matte plastic"],
      color_language: [
        { zone: "Cystic Artery", color_descriptor: "bright red, pulsatile" },
        { zone: "Cystic Duct", color_descriptor: "translucent, greenish-white" },
        { zone: "Common Hepatic Duct", color_descriptor: "translucent, greenish-white" },
        { zone: "Connective Tissue", color_descriptor: "pale yellow, fibrous" },
        { zone: "Surgical Clamp", color_descriptor: "metallic silver, sterile" },
        { zone: "Liver Edge", color_descriptor: "dark reddish-brown" }
      ],
      negative_prompt: "cartoonish, blurry, low resolution, abstract, non-anatomical shapes"
    }
  };

  compileMedicalPrompt(adData, adData.diffusion_synthesis.master_prompt, "BioRender");
  console.log("=== IMAGEN PROMPT ===");
  console.log(adData.diffusion_synthesis.imagen_prompt);
  console.log("\n=== CHATGPT PROMPT ===");
  console.log(adData.diffusion_synthesis.chatgpt_prompt);
}

run().catch(console.error);
