/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
        5. FORMAT: Use 2.5D matte vectors, pure white background, and no gloss.
        
        OUTPUT FORMAT: Return ONLY the refined paragraph ready for copy-pasting into Gemini Web. 
        `;

        const models = ["gemini-2.0-flash-lite", "gemini-1.5-flash"];
        let refinedPrompt = "";

        for (const modelName of models) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent([systemPrompt, `REFINE THIS IDEA FOR BIORENDER ${mode} MODE: ${brief}`]);
                refinedPrompt = result.response.text();
                if (refinedPrompt) break;
            } catch (err) {
                console.warn(`Refine fallback: ${modelName} failed`);
            }
        }

        return NextResponse.json({
            success: true,
            refinedPrompt: refinedPrompt.trim()
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
