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

        CRITICAL: PREVENT DISJOINTED ASSETS. Use 'layout_composition' field to force a unified structure.

        LAYOUT COMPOSITION LOGIC:
        1. central-figure-with-callouts: Use for Multi-Organ pathology. 
        2. high-fidelity-integration: Ensure 'malar rashes' are blended into the silhouette's face.
        3. full-body-pathology-map: Create an integrated 'X-ray' effect where organs are INSIDE the GHOSTED silhouette.

        BIORENDER SELECTION LOGIC:
        1. BIORENDER-MULTISYSTEM-PATHOLOGY: Expert mode for ghosted anatomy + organ hotspots. Use 'full-body-pathology-map' layout.

        FIDELITY LOCK:
        1. BIORENDER DNA: Clean 2.5D vector assets, matte plastic textures, even-ambient lighting.
        2. NEGATIVE PROMPT: Exclude 'character portraits', 'floating stickers', 'disjointed layouts'.
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
