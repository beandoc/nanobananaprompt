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

const creativeProtocols: any = {
    ugc: `\nUGC CREATIVE PROTOCOL:\n- Aesthetic: Raw, candid, shot on mobile device.\n- Lighting: Natural, imperfect, multi-directional ambient light.\n- Texture: Pores visible, slight motion blur, authentic fabric folds.\n- Composition: Uncentered, dynamic, 'in-the-moment' framing.\n`,
    editorial: `\nHIGH-END EDITORIAL PROTOCOL:\n- Aesthetic: Vogue/Harper's Bazaar style, extremely polished.\n- Lighting: Cinematic moody-rim or softbox beauty lighting.\n- Texture: Skin retouching (subtle), high-gloss surfaces, liquid flow physics.\n- Composition: Perfect rule of thirds, architectural depth.\n`,
    ecom: `\nCLEAN E-COMMERCE PROTOCOL:\n- Aesthetic: Minimalist, Apple/Dyson style, distraction-free.\n- Lighting: Bright-diffused daylight, sharp shadow definition on product.\n- Texture: Precise material rendering (matte/glass), crisp edges.\n- Composition: Centered or 60/40 hero product placement.\n`
};

const agentConfigs: any = {
    ad: {
        expansionRole: "Elite Art Director and Prompt Engineer for a high-end DTC creative agency",
        expansionRules: [
            "MISSION: Refine a raw brief into a high-converting 'Visual Ad Concept'.",
            "IDENTITY: IF human characters are featured, they MUST be of Indian descent (South Asian features, modern urban Indian styling). Do not add humans to product-only or inanimate scenes unless requested.",
            "SENSORY DETAIL: Exhaustively describe facial expressions (e.g., 'eyes closed in bliss', 'bright warm smile'), skin textures (pores, sheen, moisture), and secondary action points (e.g., 'condensation on glass', 'water droplets on skin').",
            "REALISM: For UGC shots, enforce photographic realism ('shot on iPhone', 'candid', 'natural skin texture').",
            "PRODUCT: Describe material properties exhaustively (e.g., 'matte cardboard', 'high-gloss label', 'rich dark wood grains').",
            "CAMERA LOGIC: If the brief mentions small details (like condensation or toes), suggest a corresponding shot type (e.g., 'extreme-close-up' for condensation, 'full-body' for bare feet).",
            "STRICT BAN: NO TEXT characters, labels, or bracket notation in the description paragraph."
        ],
        jsonRole: "High-Performance DTC Ad Director",
        jsonInstructions: (style: string) => `CORE DIRECTIVE: Convert the brief into a high-impact JSON Ad Blueprint.
        STYLE AUTHORITY: Follow a ${style} aesthetic. Use the local creative protocols for UGC, Editorial, or Ecom if applicable.
        PROMPT DISTILLATION: In the "core_prompt" field, do NOT copy the long expansion. Instead, distill it into a 40-60 word HIGH-CONVERSION visual hook. Start with the HERO (Product or Human) and end with the ATMOSPHERE.
        IDENTITY STANDARD: IF humans are present, they MUST be Indian (South Asian). Capture their facial expression exactly from the expansion.
        CAMERA PRECISION: Match the shot_type and lens to the specific details described in the refined brief (e.g., use 100mm for macro details).
        COPYWRITING: Create punchy, emotional headlines that address user pain points.`,
        // No subjectField overwrite for ad - core_prompt is a detailed generated description
    },
    medical: {
        expansionRole: "Principal Medical Illustrator focused on TECHNICAL VISUALS",
        expansionRules: [
            "MISSION: Refine a raw brief into a technical 'Visual Rendering Paragraph'.",
            "DIAGNOSTIC VERIFICATION: You MUST start your response with a '[VERIFICATION]' block. Inside, list 3 pathognomonic (unique) visual markers from the GLOSSARY/ATLAS provided in this prompt that are required for this diagnosis. Ensure these markers are the centerpieces of your refined brief.",
            "IDENTITY: IF human clinical subjects are featured, they MUST be South Asian (warm skin tones, contemporary Indian styling).",
            "ACCURACY: Prioritize anatomical accuracy over artistic flair.",
            "TEXTURES: Differentiate between fibrous, aqueous, and granulated textures.",
            "GLOSSARY PRIORITY: If MEDICAL REFERENCE DATA is provided in this prompt, you MUST prioritize its unique 'Visual Rules', 'Textures', and 'Color Palettes' over your general training data to ensure diagnostic-grade consistency.",
            "NO TEXT OR LABELS: Describe shapes, textures, and luminous effects. Do NOT name structures."
        ],
        jsonRole: "Elite Medical Art Director",
        jsonInstructions: (style: string) => `CORE DIRECTIVE: Convert the brief into a precise Scientific JSON Blueprint.
        SUBJECT LOCK: The "scientific_subject" field MUST be exactly the topic.
        STYLE AUTHORITY: The "journal_standard" MUST be "${style}-classic".
        IDENTITY STANDARD: IF humans are present, they MUST be Indian (South Asian).
        NO LABELS: Ensure all labeling options are false/none.`,
        subjectField: "scientific_subject",
        styleField: "journal_standard",
        styleSuffix: "classic"
    },
    vector: {
        expansionRole: "Principal Brand Designer for Scalable Vector Illustrations",
        expansionRules: [
            "MISSION: Refine a raw brief into a geometric 'Vector Logic Paragraph'.",
            "AESTHETIC: Focus on clean lines, geometric shapes, and flat colors.",
            "IDENTITY: IF human characters are present, they MUST be Indian descent/South Asian features.",
            "STRICT BAN: NO TEXT, noise, blur, or complex textures."
        ],
        jsonRole: "Master Brand Architect",
        jsonInstructions: (style: string) => `CORE DIRECTIVE: Convert the brief into a Scalable Vector JSON Blueprint.
        STYLE AUTHORITY: Use a ${style} framework.
        IDENTITY STANDARD: South Asian features for all human subjects.`,
        // No subjectField overwrite - illustration_subject is detailed
    },
    video: {
        expansionRole: "Cinematic Director for Generative Video Systems",
        expansionRules: [
            "MISSION: Refine a raw brief into a cinematic 'Visual Motion Paragraph'.",
            "MOTION: Describe camera movements (dolly, pan) and object dynamics.",
            "IDENTITY: IF human characters are featured, they MUST be of South Asian descent.",
            "VISUALS: Describe lighting (neon, golden hour) and environment in detail."
        ],
        jsonRole: "Chief Cinematic Engineer",
        jsonInstructions: (style: string) => `CORE DIRECTIVE: Convert the brief into a Video JSON Blueprint.
        STYLE AUTHORITY: Apply a ${style} cinematic aesthetic.`,
        // No subjectField overwrite - description is detailed
    },
    manga: {
        expansionRole: "Manga Concept Artist and Multi-Verse Designer",
        expansionRules: [
            "MISSION: Refine a raw brief into a 'Manga Universe Specification'.",
            "DIVERSITY: Describe how the character adapts across different manga styles (visuals only).",
            "IDENTITY: Character MUST be of Indian/South Asian descent.",
            "STRICT BAN: NO TEXT in the visual description."
        ],
        jsonRole: "Lead Manga Editor",
        jsonInstructions: (style: string) => `CORE DIRECTIVE: Convert the character into a Multi-Universe Manga JSON Blueprint.`,
        // No subjectField overwrite - manga_subject is detailed
    },
    food: {
        expansionRole: "Industrial Food & Beverage Infographic Artist",
        expansionRules: [
            "MISSION: Refine a raw brief into a 'Culinary Macro Analysis'.",
            "TEXTURES: Describe food textures (viscous, glistening, fibrous) with high precision.",
            "IDENTITY: IF any human is present (chef/user), they MUST be of Indian descent.",
            "STRICT BAN: NO TEXT or labels."
        ],
        jsonRole: "Culinary Visual Director",
        jsonInstructions: (style: string) => `CORE DIRECTIVE: Convert the brief into a Scientific Culinary JSON Blueprint.
        JOURNAL STANDARD: ${style}-Editorial.`,
        subjectField: "scientific_subject",
        styleField: "journal_standard",
        styleSuffix: "Editorial"
    },
    comic: {
        expansionRole: "Graphic Novel Stylist and Sequential Art Director",
        expansionRules: [
            "MISSION: Refine a raw brief into a 'Sequential Art Script'.",
            "AESTHETIC: Focus on ink-work, halftone patterns, and dynamic paneling.",
            "IDENTITY: All leading characters MUST be of South Asian descent.",
            "STRICT BAN: Describe visuals only. No actual text or dialogue in the visual prompt."
        ],
        jsonRole: "Lead Comic Editor",
        jsonInstructions: (style: string) => `CORE DIRECTIVE: Convert the brief into a Comic/Graphic Novel JSON Blueprint.`
    },
    storyboard: {
        expansionRole: "Cinematic Storyboard Artist and Previs Director",
        expansionRules: [
            "MISSION: Refine a raw brief into a 'Multi-Scene Narrative Flow'.",
            "CONTINUITY: Describe character appearance consistently across all scenes.",
            "IDENTITY: All featured characters MUST be of South Asian descent.",
            "MOTION: Specify camera angles and timing for each shot."
        ],
        jsonRole: "Chief Storyboard Supervisor",
        jsonInstructions: (style: string) => `CORE DIRECTIVE: Convert the brief into a detailed multi-scene Storyboard JSON Blueprint.`
    }
};

const getProtocol = (mode: string, style: string) => {
    const lStyle = style.toLowerCase();
    if (mode === 'ad' || mode === 'food') {
        if (lStyle.includes('ugc')) return creativeProtocols.ugc;
        if (lStyle.includes('editorial')) return creativeProtocols.editorial;
        if (lStyle.includes('ecom')) return creativeProtocols.ecom;
    }
    return atlasService.getStyleProtocol(style);
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { mode = "medical", brief = "", style = "NEJM", isStoryboard = false } = body;
        const normalizedStyle = style && style !== "" && style !== "-" ? style : (mode === 'medical' ? "NEJM" : "Modern");

        if (!brief) return ResponseManager.badRequest("No brief provided");

        // Select Config
        const config = agentConfigs[mode] || agentConfigs.medical;

        // --- PHASE 1: AUTOMATIC TECHNICAL EXPANSION ---
        const atlasContext = mode === 'medical' ? atlasService.getAtlasContext(brief) : "";
        
        let expansionSystemPrompt = `You are a ${config.expansionRole}.
        ${config.expansionRules.join('\n        ')}
        ${atlasContext ? `\nMEDICAL REFERENCE DATA (PRIORITIZE THESE SPECIFIC VISUAL RULES):\n${atlasContext}` : ""}
        STYLE PROTOCOL: ${getProtocol(mode, normalizedStyle)}
        HARD ZERO-TEXT BAN: Terminate with: "No text characters, no labels."`;

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
        const currentSchema = (mode === 'comic' && isStoryboard) ? comicStripSchema : (isStoryboard ? storyboardSchema : (schemaMap[mode] || medicalIllustrationSchema));
        
        // CLEAN STYLE NAME FOR METADATA
        const sanitizedStyleName = normalizedStyle.split(' ')[0].replace(/[-,]/g, '');
        
        const systemInstruction = `You are a ${config.jsonRole}. 
        ${config.jsonInstructions(sanitizedStyleName)}
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
        
        // Mode-Aware Injection
        if (adData) {
            if (config.subjectField && adData[config.subjectField] !== undefined) {
                adData[config.subjectField] = finalSubject;
            }
            if (config.styleField && adData[config.styleField] !== undefined) {
                adData[config.styleField] = sanitizedStyleName + (config.styleSuffix ? `-${config.styleSuffix}` : "");
            }
        }

        const filename = `gen-${Date.now()}.json`;
        await promptService.savePrompt({ name: filename, type: mode, content: adData });

        const phase1Provider = refinedText && !refinementError ? "Gemini" : "Groq";
        const phase2Provider = adData && !generationError ? "Gemini" : "Groq";
        const activeProvider = (phase1Provider === "Gemini" && phase2Provider === "Gemini") ? "Gemini-Elite" : `Fallback-Active (${phase1Provider}/${phase2Provider})`;

        return ResponseManager.success({
            data: adData,
            refinedPrompt: finalBriefForJson,
            promptFile: filename,
            folder: mode + "_prompts",
            activeProvider
        });

    } catch (error: any) {
        console.error("Single-Shot Engine Failure:", error);
        return ResponseManager.error(error.message, 500);
    }
}

