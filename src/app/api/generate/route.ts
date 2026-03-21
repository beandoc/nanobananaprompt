import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Groq } from "groq-sdk";
import { ResponseManager } from "@/lib/api-response";
import { atlasService } from "@/lib/atlas-service";
import { adCreativeSchema } from "@/lib/schemas/ad-creative";
import { medicalIllustrationSchema } from "@/lib/schemas/medical-illustration";
import { vectorIllustrationSchema } from "@/lib/schemas/vector-branding";
import { storyboardSchema } from "@/lib/schemas/storyboard";
import { comicStripSchema } from "@/lib/schemas/comic-strip";
import { mangaCharacterSchema } from "@/lib/schemas/manga-character";
import { videoIllustrationSchema } from "@/lib/schemas/cinematic-video";
import { foodIllustrationSchema } from "@/lib/schemas/food-illustration";
import { promptService } from "@/lib/prompt-service";

const schemaMap: any = {
    ad: adCreativeSchema,
    medical: medicalIllustrationSchema,
    vector: vectorIllustrationSchema,
    video: videoIllustrationSchema,
    storyboard: storyboardSchema,
    manga: mangaCharacterSchema,
    comic: comicStripSchema,
    food: foodIllustrationSchema
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { mode = "medical", brief = "", style = "NEJM", isStoryboard = false } = body;
        const normalizedStyle = style && style !== "" ? style : "NEJM";

        if (!brief) return ResponseManager.badRequest("No brief provided");

        // --- PHASE 1: AUTOMATIC TECHNICAL EXPANSION ---
        let expansionSystemPrompt = `You are a Principal Medical Illustrator focused on TECHNICAL VISUALS. 
        MISSION: Refine a raw brief into a technical "Visual Rendering Paragraph."
        RENDERING PROTOCOLS:
        1. NO TEXT OR LABELS: Describe shapes, textures, and luminous effects. Do NOT name structures.
        2. IDENTITY: ALL human subjects MUST be South Asian (warm skin tones, contemporary Indian styling).
        3. PATHOLOGY: Describe the biology visually in acute and chronic states.
        STYLE: ${atlasService.getStyleProtocol(normalizedStyle)}
        HARD ZERO-TEXT BAN: Terminate with: "No text, no labels, no characters."`;

        let refinedText = "";
        let refinementError: Error | null = null;

        // --- 1. TRY GEMINI ELITE FIRST (FOR PRECISION) ---
        if (process.env.GEMINI_API_KEY) {
            try {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
                const result = await model.generateContent([expansionSystemPrompt, `REFINE THIS BRIEF: ${brief}`]);
                refinedText = result.response.text().trim();
            } catch (err) { refinementError = err as Error; }
        }

        // --- 2. FALLBACK TO GROQ (ONLY IF GEMINI QUOTA IS EMPTY) ---
        if (!refinedText && process.env.GROQ_API_KEY) {
            try {
                const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
                const completion = await groq.chat.completions.create({
                    messages: [
                        { role: "system", content: expansionSystemPrompt },
                        { role: "user", content: `REFINE THIS BRIEF: ${brief}` }
                    ],
                    model: "llama-3.3-70b-versatile"
                });
                refinedText = completion.choices[0]?.message?.content?.trim() || "";
            } catch (err) { refinementError = err as Error; }
        }

        const finalBriefForJson = refinedText || brief;

        // --- PHASE 2: AUTOMATIC JSON GENERATION ---
        const currentSchema = (mode === 'comic' && isStoryboard) ? comicStripSchema : (isStoryboard ? storyboardSchema : schemaMap[mode]);
        // CLEAN STYLE NAME FOR METADATA
        const sanitizedStyleName = normalizedStyle.split(' ')[0].replace(/[-,]/g, '');
        
        const systemInstruction = `You are an Elite Medical Art Director for ${sanitizedStyleName}. 
        CORE DIRECTIVE: Convert the brief into a JSON Blueprint.
        RULES:
        1. SUBJECT LOCK: The "scientific_subject" field MUST be exactly "${brief}".
        2. STYLE AUTHORITY: The "journal_standard" MUST be "${sanitizedStyleName}-classic". 
        3. IDENTITY STANDARD: All humans MUST be Indian (South Asian).
        4. NO LABELS: Set all labeling options to false or none.
        STYLE PROTOCOL: ${atlasService.getStyleProtocol(normalizedStyle)}`;

        let adData: any = null;
        let generationError: Error | null = null;

        // --- 1. TRY GEMINI ELITE SUITE ---
        if (process.env.GEMINI_API_KEY) {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            for (const m of ["gemini-2.0-flash", "gemini-1.5-flash"]) {
                try {
                    const model = genAI.getGenerativeModel({ 
                        model: m, 
                        generationConfig: { responseMimeType: "application/json", responseSchema: currentSchema }
                    });
                    const result = await model.generateContent([systemInstruction, `JSON BLUEPRINT FOR: ${finalBriefForJson}`]);
                    adData = JSON.parse(result.response.text());
                    if (adData) break;
                } catch (err) { generationError = err as Error; }
            }
        }

        // --- 2. TRY GROQ EMERGENCY FALLBACK ---
        if (!adData && process.env.GROQ_API_KEY) {
            try {
                const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
                const completion = await groq.chat.completions.create({
                    messages: [
                        { role: "system", content: systemInstruction + "\nSCHEMA:\n" + JSON.stringify(currentSchema) },
                        { role: "user", content: `JSON BLUEPRINT FOR: ${finalBriefForJson}` }
                    ],
                    model: "llama-3.3-70b-versatile",
                    response_format: { type: "json_object" }
                });
                adData = JSON.parse(completion.choices[0]?.message?.content || "{}");
            } catch (err) { generationError = err as Error; }
        }

        if (!adData) {
            return ResponseManager.error(`Sovereign Sequence Failure: ${generationError?.message || refinementError?.message}`, 500);
        }

        // Final Patch for metadata integrity & Command Scrubbing
        const scrubSubject = (s: string) => s.replace(/^(create|generate|show|make|build|give me|render|draw|an)\s+(an|a|the|image of|illustration of|diagram of|blueprint of|map for)\s+/gi, "").trim();
        const finalSubject = scrubSubject(brief);
        if (adData) adData.scientific_subject = finalSubject;

        const filename = `gen-${Date.now()}.json`;
        await promptService.savePrompt({ name: filename, type: mode, content: adData });

        return ResponseManager.success({
            data: adData,
            refinedPrompt: finalBriefForJson,
            promptFile: filename,
            folder: mode + "_prompts"
        });

    } catch (error: any) {
        console.error("Single-Shot Engine Failure:", error);
        return ResponseManager.error(error.message, 500);
    }
}
