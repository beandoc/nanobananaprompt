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

        // FALLBACK POLICY: If Imagen 4 fails (Paid Tier check), try the Gemini 2.5 Flash Image Model (Nano Banana)
        if (!response.ok && (response.status === 403 || response.status === 400)) {
            console.log("Primary Imagen failed, triggering Fallback: Gemini 2.5 Flash Image...");

            const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`;

            response = await fetch(fallbackUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: `Generate a high-quality medical/commercial image based on this blueprint: ${finalPrompt}` }] }]
                })
            });

            result = await response.json();

            if (response.ok) {
                // Gemini image models return parts with inlineData containing the image data
                const parts = result.candidates?.[0]?.content?.parts || [];
                const imagePart = parts.find((p: any) => p.inlineData?.data);

                if (imagePart?.inlineData?.data) {
                    return handleSuccessfulImage(imagePart.inlineData.data, mode);
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
