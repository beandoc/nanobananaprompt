/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// 🚀 Enable Edge Runtime for maximum performance on Vercel
export const runtime = "edge";

function getGeminiModel(mode: "ad" | "medical" | "vector") {
    const apiKey = process.env.GEMINI_API_KEY!;
    const genAI = new GoogleGenerativeAI(apiKey);

    // Waterfall: Prefer Imagen 4.0 for AD/Vector, standard for Medical
    const modelMap = {
        ad: "gemini-1.5-pro", // Pro for complex creative
        medical: "gemini-1.5-flash", // Flash for fast labeling
        vector: "gemini-1.5-pro", // Pro for spatial awareness
    };
    return genAI.getGenerativeModel({
        model: modelMap[mode] || "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
    });
}

export async function POST(req: NextRequest) {
    try {
        const { mode = "ad", brief, image, previousImage, assetInstruction } = await req.json();

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

        const finalSystemPrompt = `${systemPrompt}\n\nIMPORTANT: Return ONLY valid JSON matching the required schema. No conversational filler.`;

        const promptParams: any[] = [
            finalSystemPrompt,
            `Analyze this ${mode} brief and provide a technical JSON blueprint: ${brief}`
        ];

        // Combine inputs: 'image' is the uploaded reference, 'previousImage' is the last render
        const activeImage = image || previousImage;

        if (activeImage) {
            const base64Data = activeImage.split(",")[1] || activeImage;
            const assetPrompt =
                assetInstruction === "style" ? "Analyze the STYLE, LIGHTING, and COLOR DNA of this image and replicate it in the JSON." :
                    assetInstruction === "subject" ? "Focus on the EXACT SUBJECT in this image and describe it in detail in the JSON." :
                        "Extract the COMPOSITION and SPATIAL STRUCTURE of this image for the new JSON.";

            promptParams.push(assetPrompt);
            promptParams.push({ inlineData: { data: base64Data, mimeType: "image/png" } });
        }

        const result = await model.generateContent(promptParams);
        const response = await result.response;
        const text = response.text();

        // SURGICAL FIX: Remove potential markdown backticks that cause JSON.parse failure
        const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const adData = JSON.parse(cleanText);

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
