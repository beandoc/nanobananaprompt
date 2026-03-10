import { NextRequest } from "next/server";
import { GoogleGenerativeAI, Schema } from "@google/generative-ai";
import { Groq } from "groq-sdk";
import { Anthropic } from "@anthropic-ai/sdk";
import { adCreativeSchema } from "@/lib/schemas/ad-creative";
import { medicalIllustrationSchema } from "@/lib/schemas/medical-illustration";
import { vectorIllustrationSchema } from "@/lib/schemas/vector-branding";
import { videoIllustrationSchema } from "@/lib/schemas/cinematic-video";
import { storyboardSchema } from "@/lib/schemas/storyboard";
import { Mode, BlueprintData, GenerateRequest } from "@/types";
import { ResponseManager } from "@/lib/api-response";
import { promptService } from "@/lib/prompt-service";
import { validateEnv } from "@/lib/env";

export const runtime = "edge";

const schemaMap: Record<Mode, Schema> = {
    ad: adCreativeSchema,
    medical: medicalIllustrationSchema,
    vector: vectorIllustrationSchema,
    video: videoIllustrationSchema,
    storyboard: storyboardSchema
};

const folderMap: Record<Mode, string> = {
    ad: "prompts",
    medical: "medical_prompts",
    vector: "vector_prompts",
    video: "video_prompts",
    storyboard: "storyboards"
};

const MEDICAL_FEW_SHOT = `
EXAMPLE 1 (Perfect Medical Blueprint):
{
  "scientific_subject": "Coronary Arterial Stent Deployment",
  "biological_context": "Intravascular cross-section of a coronary artery showing atherosclerotic plaque.",
  "illustration_style": "BioRender standard, 2.5D matte technical render, clinical soft palette",
  "visual_theme": "High-transparency vessel walls with realistic particle flow for blood cells",
  "consistent_character": "None",
  "labels_required": [],
  "aspect_ratio": "16:9"
}

EXAMPLE 2 (Perfect Vector Icon):
{
  "illustration_subject": "DNA Double Helix Abstract Logo",
  "vector_style": "Modern flat vector with geometric symmetry, bold outlines",
  "color_palette": "Indigo-600, Sky-400, White",
  "complexity_level": "Minimalist"
}
`;

export async function POST(req: NextRequest) {
    validateEnv();
    try {
        const body: GenerateRequest = await req.json();
        const { mode = "ad", brief, image, previousImage, parentPrompt, isStoryboard, style } = body;

        if (!brief && !image) {
            return ResponseManager.badRequest("No brief or image provided");
        }

        const currentSchema = isStoryboard ? storyboardSchema : schemaMap[mode];

        let domainInstruction = "";
        if (mode === "ad") {
            domainInstruction = `You are an Elite Performance Creative Director. CORE RULES: 1. PRODUCT IS THE HERO. 2. RELATABLE MODELS (Indian subjects). 3. FACE DE-EMPHASIS.`;
        } else if (mode === "vector") {
            domainInstruction = `You are a Principal Brand Designer specialized in Scalable Vector Illustrations. Rule 1: Flat colors. Rule 2: High contrast.`;
        } else if (mode === "video") {
            const isPhysical = style.toLowerCase().includes('stop-motion') || style.toLowerCase().includes('claymation') || style.toLowerCase().includes('puppet') || style.toLowerCase().includes('paper-cut');
            domainInstruction = `You are an Elite Cinematic Director. CAMERA: [Dolly, Orbit, Macro-static]. SUBJECT: Indian lock enforced. ${isPhysical ? "MEDIUM: 1:12 Miniature world. LIGHTING: Mixed-source cinematography (cool teal fluorescent vs warm orange tungsten glow). MACRO: Detail tasks (e.g., tweezers on clock gears) with shallow depth-of-field. ATMOSPHERE: Night bokeh, Devanagari shop signage, and visible clay fingerprints." : ""}`;
        } else {
            domainInstruction = `You are a PhD Medical Illustrator. CRITICAL: ANATOMICAL PRECISION. Style: BioRender Matte. STRICT RULE: NEVER add medical devices, implants, pacemakers, stents, catheters, or surgical hardware UNLESS the user's brief EXPLICITLY mentions them. If the user asks for "heart and lungs", draw ONLY pure anatomy with zero devices. STRICT RULE: The negative_prompt MUST ALWAYS ban all text, labels, annotations, arrows, and callout boxes. ${MEDICAL_FEW_SHOT}`;
        }

        let systemPrompt = domainInstruction + (isStoryboard ? ` Break down a script into exactly 12 segments of 5 seconds.` : ` ZERO TEXT POLICY.`);

        const userPrompt = parentPrompt
            ? `BASELINE JSON: ${JSON.stringify(parentPrompt)}. MODIFICATION REQUEST: "${brief}"`
            : `Generate a technical ${isStoryboard ? "STORYBOARD" : "JSON BLUEPRINT"} for this ${mode} brief: ${brief}. ${style ? `\n\nSTYLE: ${style}` : ""}`;

        const activeImage = image || previousImage;
        const inlineImageData = activeImage ? {
            inlineData: { data: activeImage.split(",")[1] || activeImage, mimeType: "image/png" }
        } : null;

        let adData: BlueprintData | null = null;
        let lastError: Error | null = null;

        const geminiApiKey = process.env.GEMINI_API_KEY;
        if (geminiApiKey) {
            const genAI = new GoogleGenerativeAI(geminiApiKey);
            const geminiModels = ["gemini-2.0-flash", "gemini-1.5-pro"];

            for (const modelName of geminiModels) {
                try {
                    const model = genAI.getGenerativeModel({
                        model: modelName,
                        generationConfig: { responseMimeType: "application/json", responseSchema: currentSchema }
                    });
                    const promptPieces: (string | { inlineData: { data: string; mimeType: string } })[] = [systemPrompt, userPrompt];
                    if (inlineImageData) promptPieces.push(inlineImageData);
                    const result = await model.generateContent(promptPieces);
                    adData = JSON.parse(result.response.text()) as BlueprintData;
                    if (adData) break;
                } catch (err) {
                    lastError = err as Error;
                }
            }
        }

        if (!adData && process.env.GROQ_API_KEY) {
            try {
                const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
                const completion = await groq.chat.completions.create({
                    messages: [
                        { role: "system", content: systemPrompt + " Return JSON matching: " + JSON.stringify(currentSchema) },
                        { role: "user", content: userPrompt }
                    ],
                    model: "llama-3.3-70b-versatile",
                    response_format: { type: "json_object" }
                });
                adData = JSON.parse(completion.choices[0]?.message?.content || "{}") as BlueprintData;
            } catch (err) { lastError = err as Error; }
        }

        if (!adData) {
            return ResponseManager.error(`All models exhausted. Last Error: ${lastError?.message}`, 429);
        }

        // Persistence in Library
        const subject = (adData.scientific_subject || adData.core_prompt || adData.illustration_subject || "new-generation");
        const filename = `${subject.substring(0, 15).toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`;

        await promptService.savePrompt({
            name: filename,
            type: mode,
            content: adData
        });

        return ResponseManager.success({
            data: adData,
            promptFile: filename,
            folder: folderMap[mode] || "prompts"
        });

    } catch (error) {
        console.error("Critical Multi-AI Error:", error);
        return ResponseManager.error((error as Error).message);
    }
}
