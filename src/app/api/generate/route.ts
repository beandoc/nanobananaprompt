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
        const { mode = "ad", brief, image, previousImage, parentPrompt, isStoryboard, style } = await req.json();

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

        const currentSchema = isStoryboard ? storyboardSchema : schemaMap[mode];

        let domainInstruction = "";
        if (mode === "ad") {
            domainInstruction = `
        You are an Elite Performance Creative Director. Your mission is to transform raw product photos into conversion-optimized ad creatives.
        CORE RULES: 1. PRODUCT IS THE HERO. 2. RELATABLE MODELS. 3. FACE DE-EMPHASIS. 4. PAIN-POINT COPY.
      `;
        } else if (mode === "vector") {
            domainInstruction = `
        You are a Principal Brand Designer specialized in Scalable Vector Illustrations. 1. Keep colors flat and distinct. 2. Ensure subjects are clearly separated from the background.
      `;
        } else if (mode === "video") {
            domainInstruction = `
        You are an Elite Cinematic Director of Photography and Art Director. Your task is to design an 8-second cinematic sequence. 
        MANDATORY CAMERA PROTOCOLS: [Dolly in, Dolly out, Orbit left, Orbit right, Orbit up, Orbit low, Dolly in zoom out].
        IDENTITY: Maintain the 'Indian subject' lock for brand consistency.
      `;
        } else {
            domainInstruction = `
        You are a PhD-level Medical Illustrator focusing on Clinical Core-Accuracy and Publication-Ready Aesthetics. 
        CRITICAL: ANATOMICAL PRECISION. Use Gray's Anatomy level detail. 
        INTERNAL RULE: NEVER write 'Male-Subject-A' or 'Female-Subject-B'. Use 'Indian male silhouette'.
      `;
        }

        let systemPrompt = "";
        if (isStoryboard) {
            systemPrompt = `
        You are an Elite Screenwriter and Director. Your task is to break down a 60-second documentary or commercial script into exactly 12 segments of 5 seconds each.
        
        DOMAIN CONTEXT (APPLY THIS TO EVERY SCENE):
        ${domainInstruction}

        FREE-TIER PRODUCTION RULES:
        1. SCENE SEGMENTATION: You MUST output exactly 12 scenes for a 60-second request.
        2. SHOT DURATION: Every scene MUST be exactly "5 seconds".
        3. MANDATORY CINEMATOGRAPHY: For EVERY scene, specify a CAMERA MOTION and CAMERA POSITION.
        4. VISUAL CONTINUITY: Ensure subjects and environments remain locked across all 12 shots.
        5. SYNCED NARRATION: Provide exactly one sentence of VO text for each 5s shot.
      `;
        } else {
            systemPrompt = domainInstruction + `
        
        CRITICAL: ZERO TEXT POLICY.
        AI engines cannot spell medical terms. You MUST ensure the 'negative_prompt' specifically blocks all text. 

        BIORENDER STANDARDS:
        1. NO LABELS/TITLES: Let the visual speak for itself.
        2. FIDELITY LOCK: Clean 2.5D vectors, matte plastic textures.
      `;
        }

        const userPrompt = parentPrompt
            ? `BASELINE JSON: ${JSON.stringify(parentPrompt)}. MODIFICATION REQUEST: "${brief}"`
            : `Generate a technical ${isStoryboard ? "PRODUCTION STORYBOARD (12 Scenes)" : "SINGLE-SHOT JSON BLUEPRINT"} for this ${mode} brief: ${brief}. ${style ? `\n\nREQUIRED VISUAL STYLE: ${style}` : ""}`;

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
            const geminiModels = ["gemini-2.0-flash", "gemini-2.0-flash-exp", "gemini-1.5-pro", "gemini-1.5-flash"];

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
                        { role: "system", content: systemPrompt + "\n\nRETURN ONLY VALID JSON MATCHING THIS SCHEMA: " + JSON.stringify(currentSchema) },
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
                    system: systemPrompt + "\n\nReturn ONLY a JSON object matching this structure: " + JSON.stringify(currentSchema),
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
