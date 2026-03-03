/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Groq } from "groq-sdk";
import { Anthropic } from "@anthropic-ai/sdk";
import { adCreativeSchema, medicalIllustrationSchema, vectorIllustrationSchema, videoIllustrationSchema, storyboardSchema } from "@/lib/gemini";

// 🚀 Enable Edge Runtime for maximum performance on Vercel
export const runtime = "edge";

export async function POST(req: NextRequest) {
    try {
        const { mode = "ad", brief, image, previousImage, parentPrompt } = await req.json();

        if (!brief) {
            return NextResponse.json({ error: "No brief provided" }, { status: 400 });
        }

        const schemaMap: any = {
            ad: adCreativeSchema,
            medical: medicalIllustrationSchema,
            vector: vectorIllustrationSchema,
            video: videoIllustrationSchema,
            storyboard: storyboardSchema
        };

        const currentSchema = schemaMap[mode];

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
        } else if (mode === "video") {
            systemPrompt = `
        You are an Elite Cinematic Director of Photography and Art Director. Your task is to design an 8-second cinematic sequence. 
        
        MANDATORY CAMERA PROTOCOLS:
        1. CAMERA MOTION: You MUST specify one of: [Dolly in, Dolly out, Orbit left, Orbit right, Orbit up, Orbit low, Dolly in zoom out].
        2. CAMERA POSITION: You MUST specify one of: [Center, Left, Right, High, Low].
        3. LIGHTING: Describe professional cinematic lighting (e.g., Rim-lighting, Volumetric fog, High-key, Moody low-key, or Dappled sunlight).
        
        1. TEMPORAL CONTINUITY: Define exactly what happens at 0s, 4s, and 8s to ensure a logical action arc.
        2. MOTION FIDELITY: Describe the physics of movement (inertia, fluid dynamics, gravity).
        3. IDENTITY: Maintain the 'Indian subject' lock for brand consistency.
        
        Visual-only asset. No text, symbols, or labels.
      `;
        } else if (mode === "storyboard") {
            systemPrompt = `
        You are an Elite Screenwriter and Director. Your task is to break down a 60-second script into exactly 12 segments of 5 seconds each.
        
        FREE-TIER PRODUCTION RULES (Optimization for Kling Free / Dreamina):
        1. SCENE SEGMENTATION: You MUST output exactly 12 scenes for a 60-second request.
        2. SHOT DURATION: Every scene MUST be exactly "5 seconds".
        3. MANDATORY CINEMATOGRAPHY: For EVERY scene, specify a CAMERA MOTION ([Dolly in, Dolly out, Orbit left/right/up/low, Dolly in zoom out]) and CAMERA POSITION ([Center, Left, Right, High, Low]).
        4. VISUAL CONTINUITY: Ensure subjects (Indian professional) and environments remain locked across all 12 shots.
        5. SYNCED NARRATION: Provide exactly one sentence of VO text for each 5s shot.
      `;
        } else {
            systemPrompt = `
        You are a PhD-level Medical Illustrator focusing on Clinical Core-Accuracy and Publication-Ready Aesthetics. 

        CRITICAL: ANATOMICAL PRECISION.
        You must describe structures with microscopic accuracy. If the user asks for a 'Kidney', describe the 'Glomeruli, Nephrons, and Renal Pelvis' as if for a medical textbook. Never use generic 'blob' descriptions. Use precise spatial relationships: superior, inferior, lateral, medial.

        CRITICAL: ZERO TEXT POLICY.
        AI engines cannot spell medical terms. You MUST ensure the 'negative_prompt' specifically blocks all text. 
        **INTERNAL RULE: NEVER write 'Male-Subject-A' or 'Female-Subject-B' in descriptions. Use 'Indian male silhouette' instead.**

        CRITICAL: SINGLE INTEGRATED FIGURE RULE.
        Do NOT generate multiple views or galleries. Use 'layout_composition' for a single, central anatomical focus.

        BIORENDER STANDARDS:
        1. NO LABELS/TITLES: Let the anatomy speak for itself.
        2. BIORENDER CUSTOM STYLING: When 'Warm-Tonal-Ghosting' is used, provide a TRANSLUCENT, warm-toned silhouette. 
        
        FIDELITY LOCK:
        - BIORENDER DNA: Clean 2.5D vectors, matte plastic textures.
        - NEGATIVE PROMPT (MANDATORY): Include 'text', 'labels', 'lettering', 'spelling', 'typos', 'orthography', 'captions', 'headers', 'Male-Subject-A', 'Female-Subject-B'. 
      `;
        }

        const userPrompt = parentPrompt
            ? `BASELINE JSON: ${JSON.stringify(parentPrompt)}. MODIFICATION REQUEST: "${brief}"`
            : `Generate a technical JSON blueprint for this ${mode} brief: ${brief}`;

        const activeImage = image || previousImage;
        const inlineImageData = activeImage ? {
            inlineData: { data: activeImage.split(",")[1] || activeImage, mimeType: "image/png" }
        } : null;

        let adData: any = null;
        let lastError: any;

        // --- 1. LAYER ONE: GOOGLE GEMINI (Core Waterfall) ---
        const geminiApiKey = process.env.GEMINI_API_KEY;
        if (geminiApiKey) {
            const genAI = new GoogleGenerativeAI(geminiApiKey);
            const geminiModels = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash", "gemini-pro-latest"];

            for (const modelName of geminiModels) {
                try {
                    console.log(`🧠 [Gemini] Generating Master Blueprint: ${modelName}`);
                    const model = genAI.getGenerativeModel({
                        model: modelName,
                        generationConfig: {
                            responseMimeType: "application/json",
                            responseSchema: currentSchema
                        }
                    });

                    const promptPieces: any[] = [systemPrompt, userPrompt];
                    if (inlineImageData) promptPieces.push(inlineImageData);

                    const result = await model.generateContent(promptPieces);
                    const text = result.response.text();
                    adData = JSON.parse(text);
                    if (adData) break;
                } catch (err: any) {
                    lastError = err;
                    console.warn(`Waterfall Fallback: Gemini ${modelName} failed. Reason: ${err.message}`);
                }
            }
        }

        // --- 2. LAYER TWO: GROQ (Llama 3 70B - FAST FALLBACK) ---
        if (!adData && process.env.GROQ_API_KEY) {
            try {
                console.log("🐺 [Groq] Falling back to Llama 3 70B...");
                const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
                const completion = await groq.chat.completions.create({
                    messages: [
                        { role: "system", content: systemPrompt + "\n\nANATOMICAL PRECISION RULE: Use Gray's Anatomy level detail. Prioritize correct spatial relationships. Return ONLY valid JSON matching this schema: " + JSON.stringify(currentSchema) },
                        { role: "user", content: userPrompt }
                    ],
                    model: "llama-3.3-70b-versatile",
                    response_format: { type: "json_object" }
                });
                adData = JSON.parse(completion.choices[0]?.message?.content || "{}");
            } catch (err: any) {
                lastError = err;
                console.warn(`Waterfall Fallback: Groq failed. Reason: ${err.message}`);
            }
        }

        // --- 3. LAYER THREE: ANTHROPIC (Claude 3.5 Sonnet - QUALITY FALLBACK) ---
        if (!adData && process.env.ANTHROPIC_API_KEY) {
            try {
                console.log("🐦 [Anthropic] Falling back to Claude 3.5 Sonnet...");
                const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
                const msg = await anthropic.messages.create({
                    model: "claude-3-5-sonnet-20241022",
                    max_tokens: 1024,
                    system: systemPrompt + "\n\nReturn ONLY a JSON object followed exactly by this structure: " + JSON.stringify(currentSchema),
                    messages: [{ role: "user", content: userPrompt }],
                });
                const contentText: any = msg.content[0];
                adData = JSON.parse(contentText.text || "{}");
            } catch (err: any) {
                lastError = err;
                console.warn(`Waterfall Fallback: Anthropic failed. Reason: ${err.message}`);
            }
        }

        if (!adData) {
            return NextResponse.json({
                error: `All models exhausted (Gemini, Groq, Anthropic). Last Error: ${lastError?.message}`
            }, { status: 429 });
        }

        const folderMap: any = { ad: "prompts", medical: "medical_prompts", vector: "vector_prompts", video: "video_prompts", storyboard: "storyboards" };
        const folder = folderMap[mode] || "prompts";
        const cleanSubject = (adData.scientific_subject || adData.core_prompt || adData.illustration_subject || adData.video_subject || adData.total_project_duration || "storyboard")
            .substring(0, 15).toLowerCase().replace(/\s+/g, '-');
        const filename = `${cleanSubject}-${Date.now()}.json`;

        return NextResponse.json({
            success: true,
            data: adData,
            promptFile: filename,
            folder
        });

    } catch (error: any) {
        console.error("Critical Multi-AI Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
