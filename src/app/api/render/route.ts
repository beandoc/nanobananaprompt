/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function handleSuccessfulImage(base64Image: string, mode: string) {
    const isVercel = process.env.VERCEL === "1";
    const folder = mode === "ad" ? "renders/ad" : "renders/medical";
    const filename = `render-${Date.now()}.png`;

    if (!isVercel) {
        const renderDir = path.join(process.cwd(), folder);
        const renderPath = path.join(renderDir, filename);

        if (!fs.existsSync(renderDir)) {
            fs.mkdirSync(renderDir, { recursive: true });
        }

        const imageBuffer = Buffer.from(base64Image, 'base64');
        fs.writeFileSync(renderPath, imageBuffer);
    }

    return NextResponse.json({
        success: true,
        imageUrl: `data:image/png;base64,${base64Image}`,
        localPath: `/${folder}/${filename}`
    });
}

export async function POST(req: NextRequest) {
    try {
        const { promptData, mode = "ad" } = await req.json();

        if (!promptData) {
            return NextResponse.json({ error: "No prompt data provided" }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "API Key missing" }, { status: 500 });
        }

        let finalPrompt = "";
        if (mode === "ad") {
            finalPrompt = `${promptData.core_prompt}. ${promptData.lighting}, ${promptData.camera_settings?.lens || ''}, ${promptData.camera_settings?.aesthetic || ''}. Text: ${promptData.exact_text || ''}. Negative: ${promptData.negative_prompt}`;
        } else {
            finalPrompt = `${promptData.scientific_subject}. Illustration Style: ${promptData.illustration_style}. Textures: ${promptData.visual_accuracy?.textures || ''}. Lighting: ${promptData.visual_accuracy?.lighting || ''}. Journal Standard: ${promptData.journal_standard}. Consistency: ${promptData.consistent_character || ''}. Theme: ${promptData.visual_theme || ''}. Negative: ${promptData.negative_prompt}`;
        }

        // Primary Model URL (Imagen 4.0)
        const imagenUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;

        let response = await fetch(imagenUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                instances: [{ prompt: finalPrompt }],
                parameters: {
                    sampleCount: 1,
                    aspectRatio: mode === "ad" ? (promptData.aspect_ratio || "1:1") : "1:1",
                    outputMimeType: "image/png"
                }
            })
        });

        let result = await response.json();

        // FALLBACK POLICY: If Imagen 4 fails (Paid Tier check), try the Experimental Flash Image Model
        if (!response.ok && (response.status === 403 || response.status === 400)) {
            console.log("Primary Imagen failed, triggering Fallback: Gemini 2.0 Flash Exp...");

            const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${apiKey}`;

            response = await fetch(fallbackUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: finalPrompt }] }],
                    generationConfig: {
                        responseMimeType: "image/png"
                    }
                })
            });

            result = await response.json();

            if (response.ok) {
                const base64Image = result.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
                if (base64Image) {
                    return handleSuccessfulImage(base64Image, mode);
                }
            }
        }

        if (!response.ok) {
            console.error("All Image Models Failed:", result);
            const errorMessage = result.error?.message || "All renderers failed. Ensure your API Key has valid quota.";
            return NextResponse.json({ error: errorMessage }, { status: response.status });
        }

        const base64Image = result.predictions?.[0]?.bytesBase64;
        if (!base64Image) {
            return NextResponse.json({ error: "No image generated in response" }, { status: 500 });
        }

        return handleSuccessfulImage(base64Image, mode);

    } catch (error: any) {
        console.error("Render API Error:", error);
        return NextResponse.json({ error: error.message || "Failed to process image rendering" }, { status: 500 });
    }
}
