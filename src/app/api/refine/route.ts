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
        You are an Elite Medical Illustrator Prompt Engineer. Your job is to transform raw clinical ideas into a "Watertight BioRender Master Prompt."
        
        CRITICAL RULES:
        1. NO TEXT/LABELS: Never suggest the use of labels, titles, or text. 
        2. VISUAL METAPHORS: Translate clinical actions (e.g., 'Check JVP') into visual elements.
        3. NO INTERNAL IDs: Scrub all strings like 'Male-Subject-A' or 'Female-Subject-B'. Replace them with 'Indian male/female silhouette'.
        4. NO POINTING: Instead of 'boxes pointing to', use 'Integrated insets' or 'Anatomical localizations'.
        5. BIORENDER DNA: Force 'Matte plastic textures', 'Clean 2.5D vectors', 'translucent skin', and 'Indian Ethnography'.
        
        OUTPUT FORMAT: Return ONLY the refined paragraph. 
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
