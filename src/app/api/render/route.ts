import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

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

        // Construct the final prompt for the image engine
        let finalPrompt = "";
        if (mode === "ad") {
            finalPrompt = `${promptData.core_prompt}. ${promptData.lighting}, ${promptData.camera_settings?.lens || ''}, ${promptData.camera_settings?.aesthetic || ''}. Text: ${promptData.exact_text || ''}. Negative: ${promptData.negative_prompt}`;
        } else {
            finalPrompt = `${promptData.scientific_subject}. Illustration Style: ${promptData.illustration_style}. Textures: ${promptData.visual_accuracy?.textures || ''}. Lighting: ${promptData.visual_accuracy?.lighting || ''}. Journal Standard: ${promptData.journal_standard}. Consistency: ${promptData.consistent_character || ''}. Theme: ${promptData.visual_theme || ''}. Negative: ${promptData.negative_prompt}`;
        }

        // Prepare the request for Imagen (Note: This requires Paid Tier or Vertex AI access)
        const imagenUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`;

        // For now, if it's the free tier, this might fail with 400/403.
        // We will catch that and return a descriptive error to the UI.
        const response = await fetch(imagenUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                instances: [
                    {
                        prompt: finalPrompt
                    }
                ],
                parameters: {
                    sampleCount: 1,
                    aspectRatio: mode === "ad" ? (promptData.aspect_ratio || "1:1") : "1:1",
                    outputMimeType: "image/png"
                }
            })
        });

        const result = await response.json();

        if (!response.ok) {
            console.error("Imagen API Error:", result);
            const errorMessage = result.error?.message || "Failed to render image. Ensure your Gemini API Key has Imagen access (Paid Tier required).";
            return NextResponse.json({ error: errorMessage }, { status: response.status });
        }

        // Imagen returns base64 in predictions[0].bytesBase64
        const base64Image = result.predictions?.[0]?.bytesBase64;
        if (!base64Image) {
            return NextResponse.json({ error: "No image generated in response" }, { status: 500 });
        }

        // Save the rendered image locally for history
        const folder = mode === "ad" ? "renders/ad" : "renders/medical";
        const filename = `render-${Date.now()}.png`;
        const renderPath = path.join(process.cwd(), folder, filename);

        if (!fs.existsSync(path.join(process.cwd(), folder))) {
            fs.mkdirSync(path.join(process.cwd(), folder), { recursive: true });
        }

        const imageBuffer = Buffer.from(base64Image, 'base64');
        fs.writeFileSync(renderPath, imageBuffer);

        return NextResponse.json({
            success: true,
            imageUrl: `data:image/png;base64,${base64Image}`,
            localPath: `/${folder}/${filename}`
        });

    } catch (error: any) {
        console.error("Render API Error:", error);
        return NextResponse.json({ error: error.message || "Failed to process image rendering" }, { status: 500 });
    }
}
