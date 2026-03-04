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

        const systemPrompt = `
        You are a Master Creative Director. Transform a raw brief/image into a professional "Direct-Flow Rendering Paragraph."
        STYLE CONTEXT: ${style ? style : "Professional BioRender Style (2.5D matte vector finish)."}
        IDENTITY LOCK: Always include "Indian model silhouette" for humans.
        HARD ZERO-TEXT BAN: End with: "Visual-only asset. No text, symbols, or labels."
        RETURN ONLY THE PARAGRAPH.
        `;

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
