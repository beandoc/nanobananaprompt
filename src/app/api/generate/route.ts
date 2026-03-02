import { NextRequest, NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
    try {
        const { brief, image, mode = "ad", parentPrompt = null } = await req.json();

        if (!brief) {
            return NextResponse.json({ error: "No brief provided" }, { status: 400 });
        }

        const model = getGeminiModel(mode as "ad" | "medical");

        let systemPrompt = "";
        if (mode === "ad") {
            systemPrompt = `
        You are an elite Art Director for a premium Indian DTC skincare brand. 
        Your job is to translate briefs into Nano Banana 2 JSON payloads.

        1. Identity Standard: All characters (UGC creators, models) MUST be of Indian descent. Use specific descriptors like "South Asian heritage," "warm olive undertones," and authentic styling.
        2. Eradicate the "AI Look": For UGC and lifestyle shots, always enforce photographic realism. Use terms like "shot on iPhone 15 Pro", "slight motion blur", "natural skin texture", "imperfect ambient lighting", and "candid".
        3. Product Accuracy: Describe material properties exhaustively (e.g., "matte cardboard packaging," "high-gloss label," "condensation on glass").
        4. Typography: Wrap the exact phrase in quotes and specify the font style and placement.
      `;
        } else {
            systemPrompt = `
        You are a World-Class Medical Illustrator specializing in Indian medical textbooks and high-impact journals (e.g., Nature, NEJM). 
        Your job is to translate clinical cases into high-precision technical JSON for the Nano Banana 2 engine.

        1. Scientific & Identity Integrity: All human clinical subjects, surgical teams, and patients MUST be of Indian descent.
        2. Scientific Integrity: Prioritize anatomical accuracy over artistic flair. Describe cellular structures with precision.
        3. Textural Definition: Differentiate between fibrous, aqueous, and granulated textures.
        4. Clean Backgrounds: Ensure medical subjects are isolated or placed against neutral, non-distracting backgrounds suitable for scientific publication.
      `;
        }

        let promptContent = brief;
        if (parentPrompt) {
            promptContent = `
            PARENT PROMPT (JSON): ${JSON.stringify(parentPrompt)}
            REFINEMENT INSTRUCTION: ${brief}
            
            Task: Modify the PARENT PROMPT JSON based on the REFINEMENT INSTRUCTION. 
            Maintain all brand and scientific rules (Indian characters, anatomical accuracy). 
            Return only the updated JSON object.
            `;
        }

        const promptParams: any[] = [systemPrompt, promptContent];

        // If an image is provided (base64), add it as a part
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

        // Clean text if Gemini adds markdown markers
        const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const adData = JSON.parse(cleanText);

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
