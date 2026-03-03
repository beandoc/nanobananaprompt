/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

// 🚀 Enable Edge Runtime for maximum performance on Vercel
export const runtime = "edge";

function handleSuccessfulImage(base64Image: string, mode: string) {
    const folderMap: any = { ad: "renders/ad", medical: "renders/medical", vector: "renders/vector" };
    const folder = folderMap[mode] || "renders/ad";
    const filename = `render-${Date.now()}.png`;

    return NextResponse.json({
        success: true,
        imageUrl: `data:image/png;base64,${base64Image}`,
        localPath: `/${folder}/${filename}`
    });
}

// Helper for Edge-compatible Base64 conversion
function arrayBufferToBase64(buffer: ArrayBuffer) {
    const uint8Array = new Uint8Array(buffer);
    let binary = '';
    const len = uint8Array.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binary);
}

export async function POST(req: NextRequest) {
    try {
        const { promptData, mode = "ad", parentImage = null } = await req.json();

        if (!promptData) {
            return NextResponse.json({ error: "No prompt data provided" }, { status: 400 });
        }

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
            const characterDesc = promptData.consistent_character === "Male-Subject-A" ? "middle-aged Indian male silhouette" :
                promptData.consistent_character === "Female-Subject-B" ? "middle-aged Indian female silhouette" : "human silhouette";

            finalPrompt = `CRITICAL: ZERO TEXT POLICY. ABSOLUTELY NO FONT, LABELS, LETTERS, OR TITLES ALLOWED.
            VISUAL-ONLY TRANSFORMATION:
            - SUBJECT: ${promptData.scientific_subject}. 
            - CHARACTER: Central single ${characterDesc} with ${promptData.visual_theme}.
            - ASSET DNA: ${promptData.illustration_style}, high-fidelity 3D matte vector finish.
            - TEXTURE: Translucent Indian skin tones. Internal organs semi-transparent matte plastic.
            - NEGATIVE (STRICT): ${promptData.negative_prompt}, text, words, labels, call-outs, arrows, fonts, captions, headers.`;
        }

        // 🌊 IMAGE RENDER WATERFALL
        const modelsToTry = [
            { name: "imagen-4.0-generate-001", type: "imagen", supportsSeed: true },
            { name: "imagen-4.0-fast-generate-001", type: "imagen", supportsSeed: false },
            { name: "imagen-4.0-ultra-generate-001", type: "imagen", supportsSeed: true },
            { name: "gemini-1.5-flash-latest", type: "gemini", supportsSeed: true },
            { name: "gemini-1.5-pro-latest", type: "gemini", supportsSeed: true },
            { name: "gemini-2.0-flash-exp-image-generation", type: "gemini", supportsSeed: true }
        ];

        for (const model of modelsToTry) {
            console.log(`🚀 Attempting Render with: ${model.name} (${model.type})`);
            try {
                const url = model.type === "imagen"
                    ? `https://generativelanguage.googleapis.com/v1beta/models/${model.name}:predict?key=${apiKey}`
                    : `https://generativelanguage.googleapis.com/v1beta/models/${model.name}:generateContent?key=${apiKey}`;

                let body: any;
                if (model.type === "imagen") {
                    const params: any = {
                        sampleCount: 1,
                        aspectRatio: promptData.aspect_ratio || "1:1",
                        outputMimeType: "image/png"
                    };
                    if (model.supportsSeed) params.seed = seed;

                    body = {
                        instances: [{ prompt: finalPrompt }],
                        parameters: params
                    };
                } else {
                    const parts: any[] = [{ text: `Generate clear 2.5D medical illustration: ${finalPrompt}` }];
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
                        const imagePart = parts.find((p: any) => p.inlineData?.data || (p.text && p.text.length > 500));
                        base64Image = imagePart?.inlineData?.data || "";
                    }
                    if (base64Image) return handleSuccessfulImage(base64Image, mode);
                }
            } catch (err) {
                console.warn(`${model.name} failed`);
            }
        }

        // 🌊 FINAL FALLBACK: Replicate (FLUX)
        if (process.env.REPLICATE_API_TOKEN) {
            console.log("🐺 [Replicate] Attempting Fallback...");
            try {
                const response = await fetch("https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`,
                        "Content-Type": "application/json",
                        "Prefer": "wait"
                    },
                    body: JSON.stringify({
                        input: {
                            prompt: finalPrompt,
                            aspect_ratio: "1:1",
                            output_format: "png"
                        }
                    })
                });

                const result = await response.json();
                const imageUrl = result.output?.[0] || result.output;
                if (imageUrl) {
                    const imgRes = await fetch(imageUrl);
                    const arrayBuffer = await imgRes.arrayBuffer();
                    return handleSuccessfulImage(arrayBufferToBase64(arrayBuffer), mode);
                }
            } catch (err) {
                console.warn("Replicate failed");
            }
        }

        // 🌊 ULTIMATE FAIL-SAFE: Pollinations (Ultra-Clean Prompt)
        console.log("🌸 [Pollinations] Emergency Render...");
        try {
            const safePrompt = `${promptData.scientific_subject}`.replace(/[^a-zA-Z0-9 ]/g, ' ').substring(0, 100);
            // Adding .jpg extension can bypass some edge cache blocks
            const pollinationUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(safePrompt)}.jpg?seed=${Math.floor(Math.random() * 1000000)}&nologo=true&width=1024&height=1024`;

            const pollRes = await fetch(pollinationUrl);
            if (pollRes.ok) {
                const arrayBuffer = await pollRes.arrayBuffer();
                return handleSuccessfulImage(arrayBufferToBase64(arrayBuffer), mode);
            }
        } catch (err) {
            console.warn("Pollinations failed");
        }

        return NextResponse.json({
            error: "Quotas Exhausted. Google Labs is highly recommended for this level of detail. Please retry in 60s."
        }, { status: 429 });

    } catch (error: any) {
        console.error("Critical Render Failure:", error);
        return NextResponse.json({ error: error.message || "Failed to process image rendering" }, { status: 500 });
    }
}
