/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { adCreativeSchema, medicalIllustrationSchema, vectorIllustrationSchema } from "@/lib/gemini";

// 🚀 Enable Edge Runtime for maximum performance on Vercel
export const runtime = "edge";

export async function POST(req: NextRequest) {
    try {
        const { mode = "ad", brief, image, previousImage, parentPrompt } = await req.json();

        if (!brief) {
            return NextResponse.json({ error: "No brief provided" }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY!;
        const genAI = new GoogleGenerativeAI(apiKey);

        const schemaMap: any = {
            ad: adCreativeSchema,
            medical: medicalIllustrationSchema,
            vector: vectorIllustrationSchema
        };

        let systemPrompt = "";
        if (mode === "ad") {
            systemPrompt = `
        You are an Elite Performance Creative Director. Your mission is to transform raw product photos into conversion-optimized ad creatives.
        CORE RULES: 1. PRODUCT IS THE HERO. 2. RELATABLE MODELS. 3. FACE DE-EMPHASIS. 4. PAIN-POINT COPY.
      `;
        } else if (mode === "vector") {
            systemPrompt = `
        You are a Principal Brand Designer specialized in Scalable Vector Illustrations. 1. Keep colors flat and distinct. 2. Ensure subjects are clearly separated from the background.
      `;
        } else {
            systemPrompt = `
        You are a PhD-level Medical Illustrator focusing on Clinical Core-Accuracy and Publication-Ready Aesthetics. 

        CRITICAL: ZERO TEXT POLICY.
        AI engines cannot spell medical terms. You MUST ensure the 'negative_prompt' specifically blocks all text. 
        **INTERNAL RULE: NEVER write 'Male-Subject-A' or 'Female-Subject-B' in descriptions. Use 'Indian male silhouette' instead.**

        CRITICAL: SINGLE INTEGRATED FIGURE RULE.
        Do NOT generate multiple views or galleries. Use 'layout_composition' for a single, central anatomical focus.

        BIORENDER STANDARDS:
        1. NO LABELS/TITLES: Let the anatomy speak for itself.
        2. BIORENDER CUSTOM STYLING: When 'Warm-Tonal-Ghosting' is used, provide a TRANSLUCENT, warm-toned silhouette. 
        
        FIDELITY LOCK:
        - BIORENDER DNA: Clean 2.5D vectors, matte plastic textures.
        - NEGATIVE PROMPT (MANDATORY): Include 'text', 'labels', 'lettering', 'spelling', 'typos', 'orthography', 'captions', 'headers', 'Male-Subject-A', 'Female-Subject-B'. 
      `;
        }

        const promptParams: any[] = [
            systemPrompt,
            parentPrompt
                ? `BASELINE JSON: ${JSON.stringify(parentPrompt)}. MODIFICATION REQUEST: "${brief}"`
                : `Generate a technical JSON blueprint for this ${mode} brief: ${brief}`
        ];

        const activeImage = image || previousImage;
        if (activeImage) {
            const base64Data = activeImage.split(",")[1] || activeImage;
            promptParams.push({ inlineData: { data: base64Data, mimeType: "image/png" } });
        }

        // 🌊 FREE-TIER OPTIMIZED WATERFALL
        const models = [
            "gemini-2.0-flash-lite",
            "gemini-1.5-flash",
            "gemini-1.5-pro-002", // Pro 002 is often on a fresh quota
            "gemini-1.0-pro"
        ];

        let adData: any = null;
        let lastError: any;

        for (const modelName of models) {
            console.log(`🧠 Generating Master Blueprint: ${modelName}`);
            try {
                const model = genAI.getGenerativeModel({
                    model: modelName,
                    generationConfig: {
                        responseMimeType: "application/json",
                        responseSchema: schemaMap[mode]
                    }
                });

                const result = await model.generateContent(promptParams);
                const response = await result.response;
                adData = JSON.parse(response.text());
                if (adData) break; // Success!
            } catch (err: any) {
                lastError = err;
                console.warn(`Waterfall Fallback: ${modelName} failed. Reason: ${err.message}`);
                continue; // Move to next model
            }
        }

        if (!adData) {
            return NextResponse.json({
                error: `All Gemini models exhausted. Please wait 60 seconds (Quota resets). Last Error: ${lastError?.message}`
            }, { status: 429 });
        }

        const folderMap: any = { ad: "prompts", medical: "medical_prompts", vector: "vector_prompts" };
        const folder = folderMap[mode] || "prompts";
        const cleanSubject = (adData.scientific_subject || adData.core_prompt || "asset")
            .substring(0, 15).toLowerCase().replace(/\s+/g, '-');
        const filename = `${cleanSubject}-${Date.now()}.json`;

        return NextResponse.json({
            success: true,
            data: adData,
            promptFile: filename,
            folder
        });

    } catch (error: any) {
        console.error("Critical Gemini API Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
