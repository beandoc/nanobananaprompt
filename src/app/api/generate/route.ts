import { NextRequest, NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
    try {
        const { brief, image, mode = "ad" } = await req.json();

        if (!brief) {
            return NextResponse.json({ error: "No brief provided" }, { status: 400 });
        }

        const model = getGeminiModel(mode as "ad" | "medical");

        let systemPrompt = "";
        if (mode === "ad") {
            systemPrompt = `
        You are an elite Art Director and Prompt Engineer for a high-end DTC creative agency. 
        Your job is to translate plain-English creative briefs (and optional reference images) into highly structured JSON prompts optimized for the Nano Banana 2 image generation model.

        1. Eradicate the "AI Look": For UGC and lifestyle shots, always enforce photographic realism. Use terms like "shot on iPhone 15 Pro", "slight motion blur", "natural skin texture", "imperfect ambient lighting", and "candid".
        2. Product Accuracy: Describe material properties exhaustively (e.g., "matte cardboard packaging," "high-gloss label," "condensation on glass").
        3. Typography: Wrap the exact phrase in quotes and specify the font style and placement.
      `;
        } else {
            systemPrompt = `
        You are a Medical Illustrator specializing in high-impact journals (e.g., Nature, NEJM, The Lancet). 
        Your job is to translate clinical case descriptions, anatomical briefs, or histology findings into structured prompts for high-fidelity medical renderings.

        1. Scientific Integrity: Prioritize anatomical accuracy over artistic flair. Describe cellular structures with precision.
        2. Textural Definition: Differentiate between fibrous, aqueous, and granulated textures.
        3. Clean Backgrounds: Ensure medical subjects are isolated or placed against neutral, non-distracting backgrounds.
      `;
        }

        const promptParams: any[] = [systemPrompt, brief];

        // If an image is provided (base64), add it as a part
        if (image) {
            const base64Data = image.split(",")[1] || image;
            promptParams.push({
                inlineData: {
                    data: base64Data,
                    mimeType: "image/png" // Assuming PNG for basic support
                }
            });
        }

        const result = await model.generateContent(promptParams);
        const response = await result.response;
        const text = response.text();
        const adData = JSON.parse(text);

        // Dynamic folder and naming based on mode
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
