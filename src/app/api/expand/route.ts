import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Groq } from "groq-sdk";
import { Anthropic } from "@anthropic-ai/sdk";
import { ResponseManager } from "@/lib/api-response";
import { atlasService } from "@/lib/atlas-service";
import { validateEnv } from "@/lib/env";

// export const runtime = "edge"; // Standardizing to Node runtime for local stability

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
            
            NEJM EDITORIAL PROTOCOLS:
            1. RENDERING: Demand "technical medical stippling" and "soft watercolor-style layering." Specify "visible skin pores" and "fine vellus hair" for realism.
            2. IDENTITY: Strictly South Asian/Indian clinical subjects. Specify "Fitzpatrick Type IV-V skin physics."
            3. SOVEREIGN STRUCTURES: Mention "Ghosted Silhouette Anchor" (20% opacity), "Translucent Overlay" for internal anatomy, and "Panelized Modular" (4-panel sequence) for process flows.
            4. TECHNICAL LOGIC: Mention "Inhibition Logic" (T-bars/X-nodes) for drug blocking and "Luminous Lumen" for internal vascular glow.
            5. PATHOLOGY: Accurately describe visual manifestations (e.g. "portal resistance mapping," "lobule fibrosis"). 
            6. COMPOSITION: Use "Anatomy-White-Background" theme with micro-macro insets.

            STYLE CONTEXT: ${style || "Standard NEJM Clinical Figure."}
            
            ${atlasService.getAtlasContext(brief)}
            ${atlasService.getStyleProtocol(style)}
            
            HARD ZERO-TEXT BAN: End with: "Visual-only asset. No text, symbols, or labels."
            RETURN ONLY THE REFINED PARAGRAPH.`;
        } else if (mode === "video" || mode === "ad") {
            systemPrompt = `You are a World-Class Creative Director and Cinematographer.
            MISSION: Refine this brief into a cinematic "Production Blueprint Paragraph" optimized for FLUX.2 Klein and Google Veo 3.
            
            PRODUCTION PROTOCOLS:
            1. PHASING: Segment the prompt—Phase 1: Composition (e.g. "The Sandwich Effect," "Visual Rhythm"), Phase 2: Materiality (e.g. "terry cloth loops," "matte Western Red Cedar"), Phase 3: Hardware (e.g. "iPhone 16 Pro Max rear camera," "85mm f/1.8").
            2. IDENTITY: All human subjects MUST be Indian descent (modern urban styling, warm South Asian skin tones).
            3. PHYSICS: High-contrast Chiaroscuro lighting, volumetric smoke/fog, and "rain-slicked" or "dust-shrouded" textures.
            4. LIGHTING: Specify "rim-lit anatomical," "moody rim lighting," or "soft-box studio lighting."
            
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
