/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Groq } from "groq-sdk";
import { Anthropic } from "@anthropic-ai/sdk";

export const runtime = "edge";

export async function POST(req: NextRequest) {
    try {
        const { brief, mode } = await req.json();

        if (!brief) {
            return NextResponse.json({ error: "No brief provided" }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY!;
        const genAI = new GoogleGenerativeAI(apiKey);

        // 🧠 Refinement Intelligence Prompt
        const systemPrompt = `
        You are an Elite Medical Illustrator Prompt Engineer. Your job is to transform raw clinical ideas into a "Gemini-Web Master Prompt."
        
        CRITICAL RULES FOR WEB-COPY:
        1. CONVERSATIONAL AUTHORITY: Start with "Generate a professional BioRender medical illustration..."
        2. NO TEXT/LABELS: Explicitly tell the AI "DO NOT render ANY text, labels, or pointers."
        3. ETHNICITY LOCKED: Specify "Single central Indian male silhouette" to ensure cultural accuracy.
        4. WARM-TONAL DNA: Describe the "warm-tonal translucent skin with glowing internal organs" in vivid detail.
        6. ANATOMICAL FIDELITY: Incorporate precise anatomical terminology (e.g., 'latissimus dorsi' instead of 'back muscle', 'renal medulla' instead of 'middle kidney'). Use Grey's Anatomy as the naming standard.
        
        OUTPUT FORMAT: Return ONLY the refined paragraph ready for copy-pasting into Gemini Web. 
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
