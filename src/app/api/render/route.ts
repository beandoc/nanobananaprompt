import { NextRequest } from "next/server";
import { ResponseManager } from "@/lib/api-response";
import Replicate from "replicate";

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN || "",
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { promptData, mode = "medical", refinedPrompt = "" } = body;

        if (!promptData && !refinedPrompt) {
            return ResponseManager.badRequest("No prompt data or refined prompt provided.");
        }

        // Construct the ultimate generation prompt
        // IF we have a refined prompt, it is the ABSOLUTE authority
        // BUT we prepend a Hard Identity Lock to ensure Flux doesn't ignore the patient/character.
        let identityLock = "[CORE VISUAL ANCHOR: A ghosted clinical silhouette of an Indian patient with warm South Asian features in the background]";
        
        if (mode !== "medical") {
            const charDesc = promptData?.consistent_character || promptData?.consistent_character_description;
            if (charDesc) {
                identityLock = `[CORE VISUAL ANCHOR: ${charDesc}. Must be Indian/South Asian descent with authentic features.]`;
            } else {
                identityLock = "[CORE VISUAL ANCHOR: High-fidelity South Asian characters with consistent features]";
            }
        }

        let visualPrompt = refinedPrompt ? `${identityLock} ${refinedPrompt}` : "";
        
        if (!visualPrompt) {
            if (mode === "medical") {
                const va = promptData.visual_accuracy || {};
                visualPrompt = `${identityLock} HIGH-FIDELITY MEDICAL ILLUSTRATION: ${promptData.scientific_subject}. 
                LAYOUT: ${promptData.layout_composition}. 
                VISUALS: ${va.textures || ""}, ${va.lighting || ""}. 
                STYLE: ${promptData.illustration_style}. NO TEXT, NO LABELS. NATURE/NEJM STANDARD.`;
            } else if (mode === "comic") {
                visualPrompt = `${identityLock} COMIC PANEL ILLUSTRATION: ${promptData.characters}. ACTION: ${promptData.action}. SETTING: ${promptData.background}. STYLE: ${promptData.art_style || "Modern Graphic Novel"}.`;
            } else {
                visualPrompt = `${identityLock} HIGH-QUALITY ${mode.toUpperCase()} ILLUSTRATION: ${JSON.stringify(promptData)}.`;
            }
        }

        // --- Call Replicate Output Normalization ---
        console.log("REPLICATE INPUT PROMPT:", visualPrompt);
        
        let imageUrl = "";
        try {
            const output: any = await replicate.run(
                "black-forest-labs/flux-1-dev",
                {
                    input: {
                        prompt: visualPrompt,
                        aspect_ratio: promptData.aspect_ratio || "1:1",
                        output_format: "webp",
                        output_quality: 90,
                        num_inference_steps: 28
                    }
                }
            );
            
            console.log("REPLICATE RAW OUTPUT:", output);
            imageUrl = Array.isArray(output) ? output[0] : output;
        } catch (repErr) {
            console.error("REPLICATE CRITICAL ERROR:", repErr);
            // DO NOT THROW: Fallback to a high-fidelity diagnostic placeholder so UI doesn't crash
            imageUrl = "https://images.unsplash.com/photo-1576091160550-217359f42f8c?q=80&w=2070&auto=format&fit=crop"; 
        }

        if (!imageUrl) {
            imageUrl = "https://images.unsplash.com/photo-1576091160550-217359f42f8c?q=80&w=2070&auto=format&fit=crop";
        }

        return ResponseManager.success({ imageUrl });

    } catch (error: any) {
        console.error("Visual Generation Engine Failure:", error);
        return ResponseManager.error(error.message, 500);
    }
}
