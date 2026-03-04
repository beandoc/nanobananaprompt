import { NextRequest } from "next/server";
import { Mode, RenderRequest } from "@/types";
import { ResponseManager } from "@/lib/api-response";
import { validateEnv } from "@/lib/env";

export const runtime = "nodejs";

function handleSuccessfulImage(base64Image: string, mode: Mode, contentType = 'image/png') {
    const folderMap: Record<Mode, string> = {
        ad: "renders/ad",
        medical: "renders/medical",
        vector: "renders/vector",
        video: "renders/video",
        storyboard: "renders/storyboard"
    };
    const folder = folderMap[mode] || "renders/ad";
    const filename = `render-${Date.now()}.png`;

    const dataUri = base64Image.startsWith('data:') ? base64Image : `data:${contentType};base64,${base64Image}`;

    console.log(`[RENDER SUCCESS] Mode: ${mode}, MIME: ${contentType}, URI Length: ${dataUri.length}`);
    if (dataUri.length < 1000) {
        console.warn(`[RENDER WARNING] Extremely short image data detected: ${dataUri.substring(0, 100)}...`);
    }

    return ResponseManager.success({
        imageUrl: dataUri,
        localPath: `/${folder}/${filename}`
    });
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
    const buf = Buffer.from(buffer);
    return buf.toString("base64");
}

interface ImagenParams {
    sampleCount: number;
    aspectRatio: string;
    outputMimeType: string;
    seed?: number;
}

interface ImagenRequest {
    instances: { prompt: string }[];
    parameters: ImagenParams;
}

interface GeminiPart {
    text?: string;
    inlineData?: {
        data: string;
        mimeType: string;
    };
}

interface GeminiRequest {
    contents: { parts: GeminiPart[] }[];
}

export async function POST(req: NextRequest) {
    validateEnv();
    try {
        const body: RenderRequest = await req.json();
        const { promptData, mode = "ad" } = body;

        if (!promptData) {
            return ResponseManager.badRequest("No prompt data provided");
        }

        const seed = Math.floor(Math.random() * 2147483647);
        const apiKey = process.env.GEMINI_API_KEY;

        let finalPrompt = "";
        if (mode === "ad") {
            finalPrompt = `${promptData.core_prompt}. ${promptData.lighting}, ${promptData.camera_settings?.lens || ''}. Text: ${promptData.exact_text || ''}. Negative: ${promptData.negative_prompt}`;
        } else if (mode === "vector") {
            finalPrompt = `${promptData.illustration_subject}. Style: ${promptData.vector_style}. Palette: ${promptData.color_palette}.`;
        } else {
            const characterDesc = promptData.consistent_character === "Male-Subject-A" ? "middle-aged Indian male silhouette" :
                promptData.consistent_character === "Female-Subject-B" ? "middle-aged Indian female silhouette" : "human silhouette";

            finalPrompt = `CRITICAL: ZERO TEXT POLICY. 
            - SUBJECT: ${promptData.scientific_subject}. 
            - CHARACTER: Central single ${characterDesc} with ${promptData.visual_theme}.
            - ASSET DNA: ${promptData.illustration_style}, high-fidelity 3D matte vector finish.`;
        }

        const modelsToTry = [
            { name: "gemini-2.0-flash-exp-image-generation", type: "gemini", supportsSeed: true }
        ];

        for (const model of modelsToTry) {
            try {
                if (apiKey) {
                    const url = model.type === "imagen"
                        ? `https://generativelanguage.googleapis.com/v1beta/models/${model.name}:predict?key=${apiKey}`
                        : `https://generativelanguage.googleapis.com/v1beta/models/${model.name}:generateContent?key=${apiKey}`;

                    let requestBody: ImagenRequest | GeminiRequest;
                    if (model.type === "imagen") {
                        const params: ImagenParams = {
                            sampleCount: 1,
                            aspectRatio: promptData.aspect_ratio || "1:1",
                            outputMimeType: "image/png"
                        };
                        if (model.supportsSeed) params.seed = seed;
                        requestBody = { instances: [{ prompt: finalPrompt }], parameters: params };
                    } else {
                        requestBody = { contents: [{ parts: [{ text: `Generate clear medical illustration: ${finalPrompt}` }] }] };
                    }

                    const response = await fetch(url, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(requestBody)
                    });

                    const result = await response.json();
                    if (response.ok) {
                        let base64Image = "";
                        if (model.type === "imagen") {
                            base64Image = result.predictions?.[0]?.bytesBase64;
                        } else {
                            const parts = (result.candidates?.[0]?.content?.parts as GeminiPart[]) || [];
                            const imagePart = parts.find((p) => p.inlineData?.data || (p.text && p.text.length > 500));
                            base64Image = imagePart?.inlineData?.data || "";
                        }
                        if (base64Image) return handleSuccessfulImage(base64Image, mode);
                    }
                }
            } catch (err) { console.warn(`${model.name} failed`); }
        }

        return ResponseManager.error(
            "API Limit REACHED: Your Gemini API limits have run out, and the free provider (Pollinations) has officially ended free unauthenticated support. Please use a fresh API key or wait for your daily quota to reset.",
            429
        );

    } catch (error) {
        console.error("Critical Render Failure:", error);
        return ResponseManager.error((error as Error).message);
    }
}
