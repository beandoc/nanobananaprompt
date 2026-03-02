/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
    try {
        const {
            brief,
            image,
            mode = "ad",
            parentPrompt = null,
            assetInstruction = "style",
            previousImage = null // The already rendered image we want to fix
        } = await req.json();

        if (!brief && !image) {
            return NextResponse.json({ error: "No input provided" }, { status: 400 });
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
        3. Aim for 'SVG Readiness': The simpler and cleaner the shapes, the better for future vectorization.
      `;
        } else {
            systemPrompt = `
        You are a World-Class Medical Illustrator.
        FIDELITY LOCKING: If a reference image is provided, replicate its technical 'Atlas Style':
        1. Render Level: 3D render, pencil sketch, or digital oil painting.
        2. Labeling Style: Clean minimalist text or callouts.
        3. Anatomical Lighting: High-contrast specialized focus areas.
        
        TECHNICAL ACCURACY RULES for REVISIONS:
        1. If correcting a scientific error, use high-fidelity anatomical terms.
        2. Maintain 'Structural Grounding': Do not shift the location of organs or cells unless explicitly asked.
      `;
        }

        let promptContent = brief || "Generate based on the provided reference image.";

        if (image) {
            promptContent = `
            [ASSET_PROTOCOL]: ${assetInstruction.toUpperCase()} LOCK
            INSTRUCTION: Treat the attached reference image as the primary authority for ${assetInstruction}. 
            If ${assetInstruction} is 'style', deconstruct the colors, lighting, and textures to create a 'Brand DNA'.
            If ${assetInstruction} is 'subject', focus on replicating the anatomical or product features exactly.
            If ${assetInstruction} is 'structure', match the exact spatial composition and layout.
            
            USER BRIEF: ${brief || "Maintain this brand DNA for the new generation."}
            `;
        }

        // Context-Aware Refinement
        if (parentPrompt) {
            promptContent = `
            [CONTEXTUAL DATA]
            PREVIOUS_JSON_BLUEPRINT: ${JSON.stringify(parentPrompt)}
            ${previousImage ? "THE_IMAGE_THIS_PROMPT_GENERATED: [Attached as Image Part]" : ""}
            REFINEMENT_INSTRUCTION: ${brief}
            
            [TASK]
            You must provide a SURGICAL REVISION of the JSON. 
            Identify what failed in the previous attempt and update ONLY the necessary keys (e.g., textures, scientific_subject, lighting) to fix the technical grade of the illustration. 
            Return the full updated JSON.
            `;
        }

        const promptParams: any[] = [systemPrompt, promptContent];

        // Add the uploaded asset or the previous image for context
        if (image) {
            const base64Data = image.split(",")[1] || image;
            promptParams.push({ inlineData: { data: base64Data, mimeType: "image/png" } });
        } else if (previousImage) {
            const base64Data = previousImage.split(",")[1] || previousImage;
            promptParams.push({ inlineData: { data: base64Data, mimeType: "image/png" } });
        }

        const result = await model.generateContent(promptParams);
        const response = await result.response;
        const text = response.text();

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
        const promptPath = path.join(process.cwd(), folder, filename);
        const isVercel = process.env.VERCEL === "1";
        if (!isVercel) {
            if (!fs.existsSync(path.join(process.cwd(), folder))) {
                fs.mkdirSync(path.join(process.cwd(), folder), { recursive: true });
            }
            fs.writeFileSync(promptPath, JSON.stringify(adData, null, 2));
        }

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
