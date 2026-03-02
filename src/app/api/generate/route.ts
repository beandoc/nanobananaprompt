import { NextRequest, NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
    try {
        const { brief, image, mode = "ad", parentPrompt = null, assetInstruction = "style" } = await req.json();

        if (!brief && !image) {
            return NextResponse.json({ error: "No input provided" }, { status: 400 });
        }

        const model = getGeminiModel(mode as "ad" | "medical");

        let systemPrompt = "";
        if (mode === "ad") {
            systemPrompt = `
        You are an elite Art Director for a premium Indian DTC skincare brand. 
        Your job is to translate briefs and reference images into Nano Banana 2 JSON payloads.

        1. Identity Standard: All characters (UGC creators, models) MUST be of Indian descent.
        2. Asset Handling: If a reference image is provided, use it according to the instruction: "${assetInstruction}". 
           - If "style": Copy the lighting, color palette, and camera aesthetic.
           - If "subject": Use the person/product in the image as the core subject.
           - If "structure": Follow the exact layout and composition of the image.
        3. Photographic Realism: For UGC and lifestyle shots, always enforce photographic realism. 
      `;
        } else {
            systemPrompt = `
        You are a World-Class Medical Illustrator specializing in Indian medical textbooks. 
        Your job is to translate clinical cases and reference assets into high-precision technical JSON.

        1. Scientific Identity: All human subjects MUST be of Indian descent.
        2. Asset Handling: If a reference image/sketch is provided, use it according to: "${assetInstruction}".
           - If "structure": This is a structural anchor (ControlNet-style). Follow the exact anatomical layout of the sketch/image.
           - If "style": Replicate the journal-standard aesthetic (e.g., SEM monochrome or 3D render style).
        3. Scientific Accuracy: Prioritize anatomical precision over artistic flair.
      `;
        }

        let promptContent = brief || "Generate based on the provided reference image.";

        if (parentPrompt) {
            promptContent = `
            PARENT PROMPT (JSON): ${JSON.stringify(parentPrompt)}
            REFINEMENT INSTRUCTION: ${brief}
            
            Task: Modify the PARENT PROMPT JSON based on the REFINEMENT INSTRUCTION. 
            Return only the updated JSON object.
            `;
        }

        const promptParams: any[] = [systemPrompt, promptContent];

        if (image) {
            const base64Data = image.split(",")[1] || image;
            promptParams.push({
                inlineData: {
                    data: base64Data,
                    mimeType: "image/png"
                }
            });
        }

        const result = await model.generateContent(promptParams);
        const response = await result.response;
        const text = response.text();

        const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const adData = JSON.parse(cleanText);

        const folder = mode === "ad" ? "prompts" : "medical_prompts";
        const prefix = mode === "ad" ? (adData.core_prompt || "ad").substring(0, 15) : (adData.scientific_subject || "med").substring(0, 15);
        const cleanPrefix = prefix.toLowerCase().replace(/\s+/g, '-');
        const filename = `${cleanPrefix}-${Date.now()}.json`;
        const promptPath = path.join(process.cwd(), folder, filename);

        if (!fs.existsSync(path.join(process.cwd(), folder))) {
            fs.mkdirSync(path.join(process.cwd(), folder), { recursive: true });
        }

        fs.writeFileSync(promptPath, JSON.stringify(adData, null, 2));

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
