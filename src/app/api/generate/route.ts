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
        Current AI rendering engines cannot spell medical terms correctly (e.g., 'Cidney'). You MUST ensure the 'negative_prompt' in the JSON output specifically blocks all text, labels, and annotations. 

        BIORENDER STANDARDS:
        1. NO LABELS: Do not include names of organs or processes within the image.
        2. NO TITLES: Pure white background, zero headers or footers.
        3. PURE VISUALS: Use layout_composition for visual linking.

        BIORENDER CUSTOM STYLING - WARM TONAL GHOSTING:
        - When 'BioRender-Warm-Tonal-Ghosting' or a 'skin-tone modified' theme is requested, replace the standard BioRender light-gray silhouette with a **translucent, warm-toned, semi-transparent Indian skin-tone**. 
        - The silhouette must maintain a 'ghosted' feel (seeing internal organs like the pancreas/liver through the skin) but with a subtle, human-warmth palette. This creates a premium, custom scientific look beyond standard templates.
        
        FIDELITY LOCK:
        - BIORENDER DNA: Clean 2.5D vectors, matte plastic textures, zero-gloss.
        - NEGATIVE PROMPT (MANDATORY): Include 'text', 'labels', 'lettering', 'spelling', 'typos', 'orthography', 'captions', 'headers'.
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

        // 🌊 WATERFALL FALLBACK SYSTEM (Bypasses Quota/429/404 errors)
        // Order: Most likely to have quota -> Newest high-capacity preview
        const models = [
            "gemini-2.0-flash-lite",
            "gemini-flash-latest",
            "gemini-2.5-flash",
            "gemini-1.5-flash",
            "gemini-2.0-flash",
            "gemini-3-flash-preview"
        ];

        let adData: any = null;
        let lastError: any;

        for (const modelName of models) {
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
