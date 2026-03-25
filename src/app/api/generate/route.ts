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
import { infographicSchema } from "@/lib/schemas/infographic";

const schemaMap: any = {
    ad: adCreativeSchema,
    medical: medicalIllustrationSchema,
    vector: vectorIllustrationSchema,
    video: videoIllustrationSchema,
    storyboard: storyboardSchema,
    manga: mangaCharacterSchema,
    comic: comicStripSchema,
    food: foodIllustrationSchema,
    infographic: infographicSchema
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
            "IDENTITY: IF human characters are featured, they MUST be of Indian descent (South Asian features, modern urban Indian styling, warm olive skin tones). Do not add humans to product-only scenes unless requested.",
            "SENSORY DETAIL EXAMPLES: Your descriptions MUST be exhaustive. Use texture keywords appropriate to the subject (e.g., 'viscous liquid', 'matte cardboard', 'brushed aluminum', 'glistening moisture'). DO NOT use these specific examples if they do not fit the actual subject.",
            "REALISM: Enforce photographic realism ('shot on iPhone 15 Pro' for UGC, '85mm/100mm macro' for Editorial). Capture facial expressions with nuanced emotional keywords (e.g., 'eyes squinted in genuine laughter', 'serene focus').",
            "STRICT BAN: NO conversational fillers, NO text/labels/names in the description paragraph, NO bracket notation.",
            "MATERIAL ATLAS Rule: Differentiate between glossy, matte, satin, and textured surfaces. If the subject is an fruit, focus on skin texture, stem detail, and waxy sheen. If it is hardware, focus on metallic grains and reflections."
        ],
        jsonRole: "High-Performance DTC Ad Director",
        jsonInstructions: (style: string) => `CORE DIRECTIVE: Convert the brief into a high-impact JSON Ad Blueprint.
        STYLE AUTHORITY: Follow a ${style} aesthetic. Use the local creative protocols.
        PROMPT DISTILLATION: In the "core_prompt" field, distill the refined brief into a 50-word HIGH-CONVERSION visual hook. Start with the HERO and end with the ATMOSPHERE. 
        SENSORY LOCK: Ensure at least 3 material texture descriptors (e.g., 'glistening', 'etched', 'velvety') are included in the core_prompt.
        TYPOGRAPHY: Use the "exact_text" field for any copy. Keep it punchy and emotional.
        IDENTITY STANDARD: South Asian features only.`,
    },
    medical: {
        expansionRole: "Principal Medical Illustrator and Scientific Director (SUPER-ENGINE PROTOCOL)",
        expansionRules: [
            "MISSION: Refine a raw brief into a high-fidelity 'Disease Mapping Blueprint' for Nature/NEJM/Lancet standards.",
            "1. STRICT HIERARCHY: Output MUST follow: tissue → micro → cellular → molecular → flow_dynamics → annotations → layout → render_layers.",
            "2. ZERO NARRATIVE: Strictly NO explanations, descriptions, or sentences. Use only structured, renderable data-points.",
            "3. MECHANISM ENCODING: All biological processes MUST be encoded as stepwise pathways/causal relationships (molecule → receptor → effect).",
            "4. SPATIAL ACCURACY: Explicitly define anatomical locations and spatial relationships (e.g. subendothelial vs subepithelial).",
            "5. FLOW & GRADIENTS: Encode flow direction, pressure gradients, and concentration gradients using directional vectors only.",
            "6. MULTI-SCALE LINKING: Ensure molecular events logically drive cellular and tissue-level functional outcomes.",
            "7. IDENTITY STANDARD: All human clinical subjects, surgical teams, and patients MUST be of South Asian (Indian) descent.",
            "8. CONSTRAINT RESOLUTION: If conflict occurs: prioritize biological accuracy → then spatial correctness → then visual clarity.",
            "9. ABSTRACTION CONTROL: Include only relevant structures; exclude unrelated anatomy; avoid duplication across layers.",
            "10. DIAGNOSTIC VERIFICATION: Identify 3 pathognomonic visual markers required for this specific diagnosis."
        ],
        jsonRole: "Master Medical Art Director and Technical Lead",
        jsonInstructions: (style: string) => `CORE DIRECTIVE: Convert the brief into a Production-Grade 12/12 Hierarchical JSON.
        STRICT COMPLIANCE: Adhere to the SUPER-ENGINE PROTOCOL (Hierarchy, Zero-Narrative, Mechanism-Encoding).
        SPATIAL LOCK: Ensure 'visual_constraints' and 'layout' fields map precise coordinate/zoom data.
        IDENTITY LOCK: Enforce South Asian heritage standard for any human elements.
        STYLE AUTHORITY: Apply the ${style} standard with specific texture definitions.`,
        subjectField: "scientific_subject",
        styleField: "journal_standard",
        styleSuffix: "standard"
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
        expansionRole: "Industrial Food & Beverage Infographic Artist and Culinary Visual Lead",
        expansionRules: [
            "MISSION: Refine a raw brief into a 'Culinary Macro Analysis'.",
            "TEXTURES: Focus on viscous, glistening, fibrous, and flaky textures. Specifically describe 'thermal vapor' (steam) or 'condensation beads' (chilled).",
            "PRODUCT FINISH: Describe glaze levels (e.g., 'high-gloss balsamic-reduction', 'matte flour dusting').",
            "IDENTITY: IF any human is present (chef/user), they MUST be of Indian descent. DO NOT ethnic-ize the food itself unless explicitly requested in the brief (e.g. an 'apple' remains an 'apple', not a 'samosa').",
            "STRICT BAN: NO TEXT or labels."
        ],
        jsonRole: "Culinary Visual Director",
        jsonInstructions: (style: string) => `CORE DIRECTIVE: Convert the brief into a Scientific Culinary JSON Blueprint.
        JOURNAL STANDARD: ${style}-Editorial.
        MATERIAL LOCK: Prioritize 'glistening' and 'texture-rich' descriptors in the scientific_subject.`,
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
    },
    infographic: {
        expansionRole: "Principal Scientific Infographic Architect",
        expansionRules: [
            "MISSION: Refine a raw brief into a 'Sovereign Hero Infographic' (NotebookLM Gold Standard).",
            "CENTRAL METAPHOR: You MUST identify a single 'Central Hero Diagram' (e.g. a divided plate, a multi-layered cell) that serves as the STAGE for all data.",
            "ENVIRONMENTAL TOKENS: Explicitly describe a 'Rough tooth watercolor paper texture' and 'Candid sketchbook bleed' in the background.",
            "STICKER-BOOK HIERARCHY: Treat narrative sections as 'Notes' or 'Scraps' appearing 'Taped' or 'Pinned' around the central hero. Use 'Washi-taped' or 'Translucent blue tape' descriptors.",
            "BAN ARROWS: DO NOT use technical or diagrammatic arrows. Use 'Soft Graphite Pathways' or 'Sweeping Watercolor Trails' to show connectivity.",
            "SAMPLING: Describe physical items (e.g. berries, cauliflower) as being 'Resting on/in' the central hero metaphor, not outside it.",
            "TYPOGRAPHY: Describe labels as 'Handwritten graphite notation' or 'Soft charcoal lettering'.",
            "IDENTITY: All human characters MUST be of Indian/South Asian descent."
        ],
        jsonRole: "Master Infographic Director",
        jsonInstructions: (style: string) => `CORE DIRECTIVE: Convert the brief into an Organic Infographic JSON Blueprint.
        COLLAGE LOGIC: Ensure 'sections' describe how they are 'taped' or 'integrated' into the ${style} environment.
        MATERIALITY: Define the 'rendering_detail' for the central metaphor as having a 'Hand-drawn clinical sketch' or 'Artist field notes' quality.`,
        subjectField: "scientific_subject"
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
        const { mode = "medical", brief = "", style = "Watercolor-Field-Notes", isStoryboard = false, image = null, assetInstruction = "style" } = body;
        const normalizedStyle = style && style !== "" && style !== "-" ? style : (mode === 'infographic' ? "Watercolor-Field-Notes" : (mode === 'medical' ? "NEJM" : "Modern"));

        if (!brief) return ResponseManager.badRequest("No brief provided");

        // Select Config
        const config = agentConfigs[mode] || agentConfigs.medical;

        // --- PHASE 1: AUTOMATIC TECHNICAL EXPANSION ---
        const atlasContext = mode === 'medical' ? atlasService.getAtlasContext(brief) : "";
        
        let expansionSystemPrompt = `You are a ${config.expansionRole}.
        ${config.expansionRules.join('\n        ')}
        ${atlasContext ? `\nMEDICAL REFERENCE DATA (PRIORITIZE THESE SPECIFIC VISUAL RULES):\n${atlasContext}` : ""}
        STYLE PROTOCOL: ${getProtocol(mode, normalizedStyle)}
        ${image ? `VISUAL DNA HOOK: You have been provided an image asset. Your #1 priority is to identify the main ${assetInstruction} (shape/subject/color) in that image and use it as the foundation for the prompt. DO NOT replace it with wooden assets or generic products.` : ""}
        HARD ZERO-TEXT BAN: Terminate with: "No text characters, no labels."`;

        let refinedText = "";
        let refinementError: Error | null = null;

        // --- 1. TRY GEMINI ELITE FIRST (PRIORITIZE 1.5-FLASH FOR SPEED/STABILITY) ---
        if (process.env.GEMINI_API_KEY) {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            // Optimized model stack: 1.5-flash is significantly faster for schema-heavy tasks
            for (const m of ["gemini-1.5-flash", "gemini-2.0-flash"]) {
                try {
                    const model = genAI.getGenerativeModel({ model: m });
                    const userParts: any[] = [`REFINE THIS BRIEF: ${brief}`];
                    
                    if (image) {
                        const base64Data = image.split(',')[1];
                        const mimeType = image.split(';')[0].split(':')[1];
                        userParts.push({
                            inlineData: { data: base64Data, mimeType: mimeType }
                        });
                    }

                    const result = await model.generateContent([expansionSystemPrompt, ...userParts]);
                    refinedText = result.response.text().trim();
                    if (refinedText) break;
                } catch (err) { refinementError = err as Error; }
            }
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

        // --- 1. TRY GEMINI ELITE SUITE (PRIORITIZE 1.5-FLASH FOR JSON) ---
        if (process.env.GEMINI_API_KEY) {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            // 1.5-flash provides the fastest JSON response for structured outputs
            for (const m of ["gemini-1.5-flash", "gemini-2.0-flash"]) {
                try {
                    const model = genAI.getGenerativeModel({ 
                        model: m, 
                        generationConfig: { responseMimeType: "application/json", responseSchema: currentSchema }
                    });
                    const userParts: any[] = [`JSON BLUEPRINT FOR: ${finalBriefForJson}`];
                    
                    if (image) {
                        const base64Data = image.split(',')[1];
                        const mimeType = image.split(';')[0].split(':')[1];
                        userParts.push({
                            inlineData: { data: base64Data, mimeType: mimeType }
                        });
                    }

                    const result = await model.generateContent([systemInstruction, ...userParts]);
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
        
        // Mode-Aware Injection (Only perform if field is empty/missing to avoid wiping AI detection)
        if (adData) {
            if (config.subjectField && (!adData[config.subjectField] || adData[config.subjectField].toLowerCase().includes("subject") || adData[config.subjectField].trim().length < 5)) {
                adData[config.subjectField] = finalSubject;
            }
            if (config.styleField && adData[config.styleField] !== undefined) {
                adData[config.styleField] = sanitizedStyleName + (config.styleSuffix ? `-${config.styleSuffix}` : "");
            }
        }

        const filename = `gen-${Date.now()}.json`;
        await promptService.savePrompt({ name: filename, type: mode, content: adData });

        const phase1Provider = refinedText && !refinementError ? "Gemini-1.5-Flash" : "Groq-Llama-3";
        const phase2Provider = adData && !generationError ? "Gemini-1.5-Flash" : "Groq-Llama-3";
        const activeProvider = (phase1Provider.includes("Gemini") && phase2Provider.includes("Gemini")) ? "Gemini-System-Elite (Fast-Tracked)" : `Fallback-Active (${phase1Provider}/${phase2Provider})`;

        console.log(`[ENGINE] Latency Optimization: Done | Provider: ${activeProvider}`);
        if (refinementError || generationError) {
            console.warn(`[ENGINE] WARNING: Quota or API Error occurred. Falling back to secondary core.`, { refinementError: refinementError?.message, generationError: generationError?.message });
        }

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

