import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Groq } from "groq-sdk";
import { Anthropic } from "@anthropic-ai/sdk";
import { ResponseManager } from "@/lib/api-response";
import { validateEnv } from "@/lib/env";

export const runtime = "edge";

export async function POST(req: NextRequest) {
    validateEnv();
    try {
        const { brief, mode, style, image, isStoryboard } = await req.json();

        if (!brief && !image) {
            return ResponseManager.badRequest("No brief or image provided");
        }

        const inlineImageData = image ? {
            inlineData: { data: image.split(",")[1] || image, mimeType: "image/png" }
        } : null;

        const isPhysical = style.toLowerCase().includes('stop-motion') || style.toLowerCase().includes('claymation') || style.toLowerCase().includes('puppet') || style.toLowerCase().includes('paper-cut');
        
        let systemPrompt = "";
        
        if (mode === "medical") {
            systemPrompt = `You are a PhD Lead Medical Illustrator and Senior Editor for the New England Journal of Medicine (NEJM) and Nature.
            MISSION: Refine a raw clinical brief into a "Direct-Flow Rendering Paragraph" for publication-ready figures.
            
            NEJM SURGICAL PROTOCOLS:
            1. RENDERING: Demand "technical medical stippling" and "soft watercolor-style layering." Avoid glossy surfaces; use "matte biological finishes."
            2. IDENTITY: Strictly South Asian/Indian clinical subjects. Specify "Fitzpatrick Type IV-V skin physics."
            3. PATHOLOGY: Accurately describe the VISUAL manifestation (e.g., "irregular thickening of the GBM", "fused podocyte pedicels").
            4. COMPOSITION: Always specify a "clean publication-white background" and "professional layout with micro-macro insets."
            
            STYLE CONTEXT: ${style || "Standard NEJM Clinical Figure."}
            HARD ZERO-TEXT BAN: End with: "Visual-only asset. No text, symbols, or labels."
            RETURN ONLY THE REFINED PARAGRAPH.`;
        } else if (mode === "video" || mode === "ad") {
            systemPrompt = `You are a World-Class Creative Director and Cinematographer.
            MISSION: Refine this brief into a cinematic "Direct-Flow Rendering Paragraph" optimized for FLUX.2 Klein and Google Veo 3.
            
            CORE PROTOCOLS:
            1. IDENTITY: All human subjects MUST be Indian descent (modern urban styling, warm South Asian skin tones).
            2. PHYSICS: High-contrast Chiaroscuro lighting, volumetric smoke/fog, and "rain-slicked" or "dust-shrouded" textures.
            3. CAMERA: Specify lens (Anamorphic, Macro) and path (Slow-dolly, Dutch angle).
            
            STYLE CONTEXT: ${style || "Cinematic Noir 8K."}
            IDENTITY LOCK: ${isPhysical ? "Characters must be handcrafted models with visible clay fingerprints and authentic clothing textures. LIGHTING: Mixed-source cinematography. ENVIRONMENT: 1:12 scale miniature world with Devanagari signage." : ""}
            HARD ZERO-TEXT BAN: End with: "Visual-only asset. No text, symbols, or labels."
            RETURN ONLY THE REFINED PARAGRAPH.`;
        } else {
            systemPrompt = `You are a Master Creative Director. Transform a raw brief/image into a professional "Direct-Flow Rendering Paragraph."
            STYLE CONTEXT: ${style ? style : "Professional Matte Vector Illustration."}
            IDENTITY LOCK: Always include 'Indian descent' for humans.
            HARD ZERO-TEXT BAN: End with: "Visual-only asset. No text, symbols, or labels."
            RETURN ONLY THE REFINED PARAGRAPH.`;
        }

        const geminiApiKey = process.env.GEMINI_API_KEY;
        const geminiModels = ["gemini-2.0-flash", "gemini-1.5-flash"];
        let refinedPrompt = "";

        if (geminiApiKey) {
            const genAI = new GoogleGenerativeAI(geminiApiKey);
            for (const modelName of geminiModels) {
                try {
                    const model = genAI.getGenerativeModel({ model: modelName });
                    const promptPieces: any[] = [systemPrompt, `REFINE THIS IDEA: ${brief}`];
                    if (inlineImageData) promptPieces.push(inlineImageData);

                    const result = await model.generateContent(promptPieces);
                    refinedPrompt = result.response.text();
                    if (refinedPrompt) break;
                } catch (err) {
                    console.warn(`Refine fallback: Gemini ${modelName} failed`);
                }
            }
        }

        if (!refinedPrompt && process.env.GROQ_API_KEY) {
            try {
                const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
                const completion = await groq.chat.completions.create({
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: `REFINE THIS IDEA: ${brief}` }
                    ],
                    model: "llama-3.3-70b-versatile",
                });
                refinedPrompt = completion.choices[0]?.message?.content || "";
            } catch (err) { console.warn("Refine fallback: Groq failed"); }
        }

        if (!refinedPrompt) {
            return ResponseManager.error("Failed to refine prompt via all models", 429);
        }

        return ResponseManager.success({
            refinedPrompt: refinedPrompt.trim()
        });

    } catch (error) {
        console.error("Critical Refine Failure:", error);
        return ResponseManager.error((error as Error).message);
    }
}
