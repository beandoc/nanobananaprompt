/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Groq } from "groq-sdk";
import { Anthropic } from "@anthropic-ai/sdk";

export const runtime = "edge";

export async function POST(req: NextRequest) {
    try {
        const { brief, mode, style } = await req.json();

        if (!brief) {
            return NextResponse.json({ error: "No brief provided" }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY!;
        const genAI = new GoogleGenerativeAI(apiKey);

        // 🧠 Refinement Intelligence Prompt (Logic-Hardened)
        const systemPrompt = `
        You are a Master Medical Illustrator. Your task is to transform a raw clinical brief into a "Direct-Flow Rendering Paragraph."
        
        CRITICAL STYLE RULE: 
        - If the STYLE CONTEXT mentions "NEJM", "Editorial", or "Painting", use soft volumetric digital painting with muted clinical colors. Abandon BioRender "plastic" looks.
        
        CRITICAL LOGIC RULES:
        1. PATHOLOGICAL CONSISTENCY: Ensure causes and effects are on the same side. If a stone is in the right ureter, only the right kidney should be distended.
        2. ANATOMICAL SKELETON: The Indian male silhouette must be a clean, ghosted container. Do NOT draw organs outside the body or tubes coming from the arms.
        3. HARDWARE ANCHORING: Clinical hardware (catheters/pumps) must be precisely anchored to the anatomical entry point (e.g. renal pelvis) and follow a single logical path. No floating wires.
        
        STYLE CONTEXT: ${style ? style : "Professional BioRender Style (2.5D matte vector finish, warm-tonal translucent skin, subtle internal glows)."}
        
        OUTPUT FORMAT: Return ONLY the paragraph. No meta-text.
        `;

        const geminiApiKey = process.env.GEMINI_API_KEY;
        const geminiModels = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash"];
        let refinedPrompt = "";

        if (geminiApiKey) {
            const genAI = new GoogleGenerativeAI(geminiApiKey);
            for (const modelName of geminiModels) {
                try {
                    const model = genAI.getGenerativeModel({ model: modelName });
                    const result = await model.generateContent([systemPrompt, `REFINE THIS IDEA FOR BIORENDER ${mode} MODE: ${brief}`]);
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
