/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
    try {
        const {
            brief,
            image,
            mode = "ad",
            parentPrompt = null,
            assetInstruction = "style",
            previousImage = null // The already rendered image we want to fix
        } = await req.json();

        if (!brief && !image) {
            return NextResponse.json({ error: "No input provided" }, { status: 400 });
        }

        const model = getGeminiModel(mode as "ad" | "medical" | "vector");

        let systemPrompt = "";
        if (mode === "ad") {
            systemPrompt = `
        You are an elite Art Director for a premium Indian DTC skincare brand. 
        Your job is to translate briefs and reference images into Nano Banana 2 JSON payloads.

        REVISION LOGIC: When a 'PARENT PROMPT' or 'PREVIOUS IMAGE' is provided, perform a SURGICAL EDIT. Do not change parts of the prompt that were successful. Focus only on the 'brief' instructions while maintaining the core brand aesthetic.
      `;
        } else if (mode === "vector") {
            systemPrompt = `
        You are a Principal Brand Designer specialized in Scalable Vector Illustrations (Corporate Memphis, Flat Design, Line Art).
        
        RULES FOR VECTOR BLUEPRINTS:
        1. Keep colors flat and distinct. Avoid complex 3D shading or noisy textures.
        2. Ensure subjects are clearly separated from the background.
        3. Aim for 'SVG Readiness': The simpler and cleaner the shapes, the better for future vectorization.
        4. When revising, maintain 'Brand Locking'—do not change the core color palette or character proportions unless requested.
      `;
        } else {
            systemPrompt = `
        You are a World-Class Medical Illustrator specializing in technical accuracy for Indian medical textbooks.
        
        TECHNICAL ACCURACY RULES for REVISIONS:
        1. If correcting a scientific error, use high-fidelity anatomical terms.
        2. Maintain 'Structural Grounding': Do not shift the location of organs or cells unless explicitly asked.
        3. SURGICAL EDITING: Only modify the specific fields in the JSON required to achieve the correction.
        4. CONSISTENCY COMMAND: You MUST always include a field "web_consistency_command" in the JSON. 
           This field should contain strict instructions for a web-based AI (like Gemini Web) to use the previous render as a structural reference.
           Format: "Use the attached previous render as a strict structural map. Keep geometry, lighting, and style 100% identical. [Insert specific surgical change here based on brief]."
      `;
        }

        let promptContent = brief || "Generate based on the provided reference image.";

        // Context-Aware Refinement
        if (parentPrompt) {
            promptContent = `
            [CONTEXTUAL DATA]
            PREVIOUS_JSON_BLUEPRINT: ${JSON.stringify(parentPrompt)}
            ${previousImage ? "THE_IMAGE_THIS_PROMPT_GENERATED: [Attached as Image Part]" : ""}
            REFINEMENT_INSTRUCTION: ${brief}
            
            [TASK]
            You must provide a SURGICAL REVISION of the JSON. 
            Identify what failed in the previous attempt and update ONLY the necessary keys (e.g., textures, scientific_subject, lighting) to fix the technical grade of the illustration. 
            Return the full updated JSON.
            `;
        }

        const promptParams: any[] = [systemPrompt, promptContent];

        // Add the uploaded asset or the previous image for context
        if (image) {
            const base64Data = image.split(",")[1] || image;
            promptParams.push({ inlineData: { data: base64Data, mimeType: "image/png" } });
        } else if (previousImage) {
            const base64Data = previousImage.split(",")[1] || previousImage;
            promptParams.push({ inlineData: { data: base64Data, mimeType: "image/png" } });
        }

        const result = await model.generateContent(promptParams);
        const response = await result.response;
        const text = response.text();

        const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const adData = JSON.parse(cleanText);

        const folderMap: any = { ad: "prompts", medical: "medical_prompts", vector: "vector_prompts" };
        const folder = folderMap[mode] || "prompts";

        let prefix = "asset";
        if (mode === "ad") prefix = adData.core_prompt || "ad";
        else if (mode === "medical") prefix = adData.scientific_subject || "med";
        else if (mode === "vector") prefix = adData.illustration_subject || "vector";

        const cleanPrefix = prefix.substring(0, 15).toLowerCase().replace(/\s+/g, '-');
        const filename = `${cleanPrefix}-${Date.now()}.json`;
        const promptPath = path.join(process.cwd(), folder, filename);
        const isVercel = process.env.VERCEL === "1";
        if (!isVercel) {
            if (!fs.existsSync(path.join(process.cwd(), folder))) {
                fs.mkdirSync(path.join(process.cwd(), folder), { recursive: true });
            }
            fs.writeFileSync(promptPath, JSON.stringify(adData, null, 2));
        }

        return NextResponse.json({
            success: true,
            data: adData,
            promptFile: filename,
            folder
        });

    } catch (error: any) {
        console.error("Gemini API Error:", error);
        return NextResponse.json({ error: error.message || "Failed to generate structured output" }, { status: 500 });
    }
}
