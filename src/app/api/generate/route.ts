/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { adCreativeSchema, medicalIllustrationSchema, vectorIllustrationSchema } from "@/lib/gemini";

// 🚀 Enable Edge Runtime for maximum performance on Vercel
export const runtime = "edge";

function getGeminiModel(mode: "ad" | "medical" | "vector") {
    const apiKey = process.env.GEMINI_API_KEY!;
    const genAI = new GoogleGenerativeAI(apiKey);

    const schemaMap: any = {
        ad: adCreativeSchema,
        medical: medicalIllustrationSchema,
        vector: vectorIllustrationSchema
    };

    return genAI.getGenerativeModel({
        model: mode === "medical" ? "gemini-flash-latest" : "gemini-pro-latest",
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schemaMap[mode]
        }
    });
}

export async function POST(req: NextRequest) {
    try {
        const { mode = "ad", brief, image, previousImage, assetInstruction, parentPrompt } = await req.json();

        if (!brief) {
            return NextResponse.json({ error: "No brief provided" }, { status: 400 });
        }

        const model = getGeminiModel(mode as "ad" | "medical" | "vector");

        let systemPrompt = "";
        if (mode === "ad") {
            systemPrompt = `
        You are an Elite Performance Creative Director. Your mission is to transform raw product photos into conversion-optimized ad creatives.
        
        CORE RULES:
        1. PRODUCT IS THE HERO: The product must be the single most visually prominent element. Depth of field must be sharpest on the product.
        2. RELATABLE MODELS: Models must look like real, everyday people—not professional influencers. Imperfections are preferred over "Instagram-ready" looks.
        3. FACE DE-EMPHASIS: The model's face must NEVER be the dominant visual element. Angle the face away, or crop it at the frame edge to keep focus on the product.
        4. PAIN-POINT COPY: Headlines MUST be direct questions or bold statements rooted in a specific frustration (e.g., 'TIRED OF LOOKING INVISIBLE?'). No generic aspiration.
        5. NO METADATA LEAKAGE: Absolute zero JSON keys or system tags in the visual scene.
        
        LAYOUT: Subject and product occupy right 50-60%. Left side reserved for bold, uniform-size typography.
        BRAND DNA: Deconstruct reference colors, lighting, and textures to replicate brand style exactly.
      `;
        } else if (mode === "vector") {
            systemPrompt = `
        You are a Principal Brand Designer specialized in Scalable Vector Illustrations.
        STYLE ANALYSIS: If an image is provided, extract the 'Design Language':
        1. Line Weight: Is it bold, thin, or variable?
        2. Color Palette: Use the exact same vibrant/muted palette.
        3. Character Style: Head-to-body ratios, organic vs geometric shapes.
        
        RULES FOR VECTOR BLUEPRINTS:
        1. Keep colors flat and distinct. Avoid complex 3D shading or noisy textures.
        2. Ensure subjects are clearly separated from the background.
        3. Prioritize high-contrast edges to facilitate perfect SVG path tracing.
      `;
        } else {
            systemPrompt = `
        You are a PhD-level Medical Illustrator focusing on Clinical Core-Accuracy.
        FIDELITY LOCK: When an image is provided, lock the 'Medical DNA':
        1. Render Level: Is it a surgical sketch, colorized MRI, or anatomical 3D render?
        2. Labeling Style: Match the pointer line weight and font-feel.
        
        INSTRUCTIONS FOR MEDICAL BLUEPRINTS:
        1. Use precise anatomical terminology.
        2. Specify "technical cross-section" or "surface anatomy" clearly.
        3. If labeling is required, describe it as part of the visual composition.
      `;
        }

        const promptParams: any[] = [
            systemPrompt,
            parentPrompt
                ? `BASELINE BLUEPRINT: ${JSON.stringify(parentPrompt)}\n\nMODIFICATION REQUEST: ${brief}\n\nApply surgical corrections to the baseline while maintaining its core technical DNA.`
                : `Generate a technical JSON blueprint for this ${mode} brief: ${brief}`
        ];

        // Combine inputs: 'image' is the uploaded reference, 'previousImage' is the last render
        const activeImage = image || previousImage;

        if (activeImage) {
            const base64Data = activeImage.split(",")[1] || activeImage;
            const assetPrompt =
                assetInstruction === "style" ? "REPLICATE STYLE/DNA: Analyze the lighting and colors of this image and match them." :
                    assetInstruction === "subject" ? "MATCH SUBJECT: Ensure the anatomical/product features match this exactly." :
                        "MATCH COMPOSITION: Use the exact spatial layout of this reference.";

            promptParams.push(assetPrompt);
            promptParams.push({ inlineData: { data: base64Data, mimeType: "image/png" } });
        }

        // 🧠 Retry logic for backend 503 errors (Service Unavailable / High Demand)
        let result: any;
        let lastError: any;
        const maxRetries = 2; // Total 3 attempts

        for (let i = 0; i <= maxRetries; i++) {
            try {
                result = await model.generateContent(promptParams);
                if (result) break;
            } catch (err: any) {
                lastError = err;
                if (err.message?.includes("503") || err.message?.includes("high demand") || err.message?.includes("Service Unavailable")) {
                    console.warn(`Gemini 503 Attempt ${i + 1} for ${mode} mode. Retrying in 1.5s...`);
                    await new Promise(r => setTimeout(r, 1500));
                    continue;
                }
                throw err;
            }
        }

        if (!result) throw lastError;

        const response = await result.response;
        const text = response.text();
        const adData = JSON.parse(text);

        const folderMap: any = { ad: "prompts", medical: "medical_prompts", vector: "vector_prompts" };
        const folder = folderMap[mode] || "prompts";

        let prefix = "asset";
        if (mode === "ad") prefix = adData.core_prompt || "ad";
        else if (mode === "medical") prefix = adData.scientific_subject || "med";
        else if (mode === "vector") prefix = adData.illustration_subject || "vector";

        const cleanPrefix = prefix.substring(0, 15).toLowerCase().replace(/\s+/g, '-');
        const filename = `${cleanPrefix}-${Date.now()}.json`;

        // Note: fs saving logic removed for speed and Edge compatibility. 
        // Vercel handles requests faster without Disk I/O.

        return NextResponse.json({
            success: true,
            data: adData,
            promptFile: filename,
            folder
        });

    } catch (error: any) {
        console.error("Gemini API Error:", error);
        return NextResponse.json({ error: error.message || "Failed to generate structured output" }, { status: 500 });
    }
}
