/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

// 🚀 Enable Edge Runtime for maximum performance on Vercel
export const runtime = "edge";

function handleSuccessfulImage(base64Image: string, mode: string) {
    const folderMap: any = { ad: "renders/ad", medical: "renders/medical", vector: "renders/vector" };
    const folder = folderMap[mode] || "renders/ad";
    const filename = `render-${Date.now()}.png`;

    // Note: Local disk saving bypassed for Edge Runtime compatibility.
    // This allows the Vercel app to respond as fast as Gemini generates.

    return NextResponse.json({
        success: true,
        imageUrl: `data:image/png;base64,${base64Image}`,
        localPath: `/${folder}/${filename}`
    });
}

export async function POST(req: NextRequest) {
    try {
        const { promptData, mode = "ad", parentImage = null } = await req.json();

        if (!promptData) {
            return NextResponse.json({ error: "No prompt data provided" }, { status: 400 });
        }

        // Initialize or retrieve seed for consistency
        const seed = promptData.seed || Math.floor(Math.random() * 2147483647);

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "API Key missing" }, { status: 500 });
        }

        let finalPrompt = "";
        if (mode === "ad") {
            finalPrompt = `${promptData.core_prompt}. ${promptData.lighting}, ${promptData.camera_settings?.lens || ''}, ${promptData.camera_settings?.aesthetic || ''}. Text: ${promptData.exact_text || ''}. Negative: ${promptData.negative_prompt}`;
        } else if (mode === "vector") {
            finalPrompt = `${promptData.illustration_subject}. Style: ${promptData.vector_style}. Palette: ${promptData.color_palette}. Background: ${promptData.background}. Complexity: ${promptData.complexity}. Negative: ${promptData.negative_prompt}`;
        } else {
            finalPrompt = `${promptData.scientific_subject}. Illustration Style: ${promptData.illustration_style}. Textures: ${promptData.visual_accuracy?.textures || ''}. Lighting: ${promptData.visual_accuracy?.lighting || ''}. Journal Standard: ${promptData.journal_standard}. Consistency: ${promptData.consistent_character || ''}. Theme: ${promptData.visual_theme || ''}. Negative: ${promptData.negative_prompt}`;
        }

        // 🌊 IMAGE RENDER WATERFALL (Bypasses Quota/429/404 errors)
        const modelsToTry = [
            { name: "imagen-4.0-generate-001", type: "imagen" },
            { name: "gemini-3.1-flash-image-preview", type: "gemini" },
            { name: "gemini-2.5-flash-image", type: "gemini" },
            { name: "imagen-3.0-generate-001", type: "imagen" },
            { name: "gemini-2.0-flash-exp-image-generation", type: "gemini" },
            { name: "imagen-4.0-fast-generate-001", type: "imagen" }
        ];

        for (const model of modelsToTry) {
            try {
                const url = model.type === "imagen"
                    ? `https://generativelanguage.googleapis.com/v1beta/models/${model.name}:predict?key=${apiKey}`
                    : `https://generativelanguage.googleapis.com/v1beta/models/${model.name}:generateContent?key=${apiKey}`;

                let body: any;
                if (model.type === "imagen") {
                    body = {
                        instances: [{ prompt: finalPrompt }],
                        parameters: {
                            sampleCount: 1,
                            aspectRatio: promptData.aspect_ratio || "1:1",
                            seed: seed,
                            outputMimeType: "image/png"
                        }
                    };
                    // If we have a parent image, use it for structural consistency (if model supports it)
                    if (parentImage) {
                        body.instances[0].image = { bytesBase64: parentImage.split(",")[1] || parentImage };
                    }
                } else {
                    const parts: any[] = [{ text: `Generate a high-quality professional image maintaining the exact structure of previous work: ${finalPrompt}` }];
                    if (parentImage) {
                        parts.push({ inlineData: { data: parentImage.split(",")[1] || parentImage, mimeType: "image/png" } });
                    }
                    body = { contents: [{ parts }] };
                }

                const response = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body)
                });

                const result = await response.json();

                if (response.ok) {
                    let base64Image = "";
                    if (model.type === "imagen") {
                        base64Image = result.predictions?.[0]?.bytesBase64;
                    } else {
                        const parts = result.candidates?.[0]?.content?.parts || [];
                        const imagePart = parts.find((p: any) => p.inlineData?.data || (p.text && p.text.length > 500)); // Some exp models return text-wrapped base64
                        base64Image = imagePart?.inlineData?.data || "";
                    }

                    if (base64Image) {
                        return handleSuccessfulImage(base64Image, mode);
                    }
                } else {
                    console.warn(`Model ${model.name} failed:`, result.error?.message);
                    // Continue to next model in loop
                }
            } catch (err) {
                console.error(`Error with model ${model.name}:`, err);
            }
        }

        // If we reach here, all fallbacks failed
        return NextResponse.json({
            error: "All Image Models Failed/Quota Exceeded. To resolve this, please enable Billing in your Google AI Studio account to unlock high-priority Imagen 4 access."
        }, { status: 429 });

    } catch (error: any) {
        console.error("Critical Render Failure:", error);
        return NextResponse.json({ error: error.message || "Failed to process image rendering" }, { status: 500 });
    }
}
