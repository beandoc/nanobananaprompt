/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Groq } from "groq-sdk";
import { Anthropic } from "@anthropic-ai/sdk";

export const runtime = "edge";

export async function POST(req: NextRequest) {
    try {
        const { brief, mode, style, image, isStoryboard } = await req.json();

        if (!brief && !image) {
            return NextResponse.json({ error: "No brief or image provided" }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY!;
        const genAI = new GoogleGenerativeAI(apiKey);

        const inlineImageData = image ? {
            inlineData: { data: image.split(",")[1] || image, mimeType: "image/png" }
        } : null;

        // 🧠 Refinement Intelligence Prompt (Vision-Aware)
        const systemPrompt = `
        You are a Master Performance Creative & Medical Illustrator. Your task is to transform a raw brief AND an optional reference image into a "Direct-Flow Rendering Paragraph."
        
        CRITICAL VISION RULE: 
        - If an image is provided, PRIORITIZE its visual structure (e.g. JAR vs BOTTLE). 
        - For DTC: Do NOT just describe the product. You MUST build a "Commercial Grade Narrative." If the user wants a "pool deck," describe "caustic water reflections, dappled sunlight through palm fronds, and professional set-design textures." Force the AI away from white backgrounds.
        - For VIDEO or STORYBOARD Active: You MUST explicitly include professional Camera Motion [Dolly in, Dolly out, Orbit left/right/up/low, Dolly in zoom out] and Camera Position [Center, Left, Right, High, Low] in the paragraph.
        - ARTISTIC STYLE OVERRIDE: If "Studio Ghibli" or "Claymation" is in the STYLE CONTEXT:
            1. Start the paragraph with: "MASTER STYLE LOCK: [Studio Ghibli 2D Watercolor / Claymation Hand-Sculpted]".
            2. For Ghibli: Explicitly mandate "Zero Photorealism", "Flat 2D painting", "Hand-drawn line art".
            3. STRIP OUT 3D-trigger words like "Caustics", "Volumetric fog", "Bioluminescence", or "Micro-textures" when an artistic style is active.
        
        STYLE CONTEXT: ${style ? style : "Professional BioRender Style (2.5D matte vector finish, warm-tonal translucent skin, subtle internal glows)."}
        
        CRITICAL LOGIC:
        1. NO HALLUCINATION: Describe only objects in the brief/image. 
        2. ATMOSPHERIC DEPTH: Only use high-end terms (Bokeh, Rim-lighting, Volumetric fog, Caustics) if in MEDICAL or DTC mode. 
        3. IDENTITY LOCK: Always include the "Indian model silhouette" for human interaction.
        4. HARD ZERO-TEXT BAN: End with: "Visual-only asset. No text, symbols, or labels."
        
        OUTPUT FORMAT: Return ONLY the refined paragraph.
        `;

        const geminiApiKey = process.env.GEMINI_API_KEY;
        const geminiModels = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
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

        // --- GROQ FALLBACK ---
        if (!refinedPrompt && process.env.GROQ_API_KEY) {
            try {
                const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
                const completion = await groq.chat.completions.create({
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: `REFINE THIS IDEA FOR BIORENDER ${mode} MODE: ${brief}` }
                    ],
                    model: "llama-3.3-70b-versatile",
                });
                refinedPrompt = completion.choices[0]?.message?.content || "";
            } catch (err) {
                console.warn("Refine fallback: Groq failed");
            }
        }

        // --- ANTHROPIC FALLBACK ---
        if (!refinedPrompt && process.env.ANTHROPIC_API_KEY) {
            try {
                const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
                const msg = await anthropic.messages.create({
                    model: "claude-3-5-sonnet-20241022",
                    max_tokens: 1024,
                    system: systemPrompt,
                    messages: [{ role: "user", content: `REFINE THIS IDEA FOR BIORENDER ${mode} MODE: ${brief}` }],
                });
                const contentText: any = msg.content[0];
                refinedPrompt = contentText.text || "";
            } catch (err) {
                console.warn("Refine fallback: Anthropic failed");
            }
        }

        return NextResponse.json({
            success: true,
            refinedPrompt: (refinedPrompt || "Failed to refine prompt").trim()
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
