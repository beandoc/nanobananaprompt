import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
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
        expansionRole: "Sovereign Medical Illustrator (SOVEREIGN v31 DUAL-TRACK PROTOCOL)",
        expansionRules: [
            "1. NEURO-ANATOMY: Cerebral Cortex MUST be 'laminar_parallel_bands' (Layers 1-6). CONCENTRIC IS BANNED for brain.",
            "2. AD BIOLOGY: 'Microglia' (Bio-Green #43A047), 'Tau-Tangles' (Purple #673AB7), and 'Synaptic Terminals' ARE required entities.",
            "3. ZERO GRADIENT: Background MUST be 'absolute_pure_white' (#FFFFFF). NO soft blue gradients.",
            "4. PANEL INTEGRITY: Use discrete bounds (Macro: Organ-Top; Micro: Cell-Bottom). No embedding micro inside macro.",
            "5. NO CITATIONS: DOI generation is prohibited."
        ],
        jsonRole: "Ultimate Medical Art Director and Clinical Strategist",
        jsonInstructions: (medicalBrief: string) => {
            const isNejm = medicalBrief.toLowerCase().includes('nejm') || medicalBrief.toLowerCase().includes('watercolor');
            return `### SOVEREIGN v31.7 PERFECT-10 FINAL POLISH
1. STYLE MANDATE: 
   - ${isNejm ? 'NEJM MODE: Organic on cream.' : 'BIORENDER DEFAULT: ZERO TEXTURE. ZERO GRADIENT. Pure White (#FFFFFF) void. Material: Volumetric Polymer 2.5D.'}
2. GEOMETRY SUPREMACY: 
   - Cortex: laminar_parallel_bands (Horizontal 1-6). 
   - Plaque: asymmetric_off-center_contour (Extracellular).
   - Tau: helical_intracellular_fibrils (Intracellular).
3. COLOR LANGUAGE: 
   - Neutral Cortex (#E0E0E0), Bio-Teal Amyloid (#00796B), Clinical Purple Tau (#673AB7), Bio-Green Microglia (#43A047).
   - Signaling (Magenta #D81B60).
4. STRUCTURAL COHESION: Define discrete non-overlapping panels (Top: 0-400; Bottom: 440-840) linked by a 'tapered_zoom_connector'.
5. MECHANISTIC WIRING: Explicitly link Microglia (Source) -> Amyloid Plaque (Target). Visualize Synaptic Loss as 'diminished density' vs 'controls'.
6. LAYER 5 (DIFFUSION): Describe 'Scholarly Modular Clinical Assets'. ZERO text. Uniform volumetric lighting. NO shadows. High-transparency Indian Ghost Silhouette @ Z-index 0.`;
        },
        subjectPath: "metadata.subject",
        stylePath: "metadata.journal_standard",
        styleSuffix: "v31.7_PERFECT-10-FINAL"
    },
    infographic: {
        expansionRole: "Visual Abstract Architect (SVAE v3.0 - CJASN/NEJM Standards)",
        expansionRules: [
            "1. INFOGRAPHIC FOCUS: Convert clinical briefs into card-centric visual abstracts.",
            "2. CARD LOGIC: Define discrete cards (PICO, Results, Conclusion).",
            "3. STYLE LOCK: NEJM Dense Slab (Academic Grid) vs. CJASN Blue Standard (Electric Blue Cards).",
            "4. IDENTITY: All human representations (Patients/Doctors) MUST be South Asian.",
            "5. DATA VIZ: Propose specific charts (Forest Plots, Kaplan-Meier, etc.) for the results panel."
        ],
        jsonRole: "Lead Scholarly Plate Designer (Visual Abstract Engine)",
        jsonInstructions: (style: string) => {
            const isCjasn = style.toLowerCase().includes('cjasn');
            return `### SVAE PROTOCOL (INFOGRAPHICS)
1. GRID LAW: 680x840 canvas. Define distinct "Slabs" or "Cards" with header/body hierarchies.
2. STYLE ENFORCEMENT:
   - IF style is CJASN: Use Electric Navy (#03055B) headers, rounded white cards, and teal/slate accents.
   - ELSE (NEJM): Use Dense academic grids, saturated left-rail metadata, and serif typography (implied).
3. CONTENT: Map the brief to PICO (Population, Intervention, Comparator, Outcome) structure.
4. RENDERING: Specify card bounds, colors, and font-weights clearly in layers 3-4.
5. NO IMAGE ASSETS: Focus on iconography and layout, not complex anatomical paintings.`;
        }
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
            "AESTHETIC: Pro-Graphic Novel style. Heavy G-Pen inking, hand-drawn textures, paper-bleed effects, and subtle CMYK halftone dots.",
            "LIGHTING: High-contrast Chiaroscuro. Use deep, dramatic rim-lighting (golden/blue) and expressive shadows. No flat ambient light.",
            "IDENTITY: All leading characters MUST be of South Asian/Indian descent with rich, authentic skin textures (Shot on 35mm film grain look).",
            "CAST OF CHARACTERS: You MUST identify all recurring characters and populate the 'cast_of_characters' array with hyper-detailed visual anchors (specific face shape, clothing, age, heritage). This is CRITICAL for visual locking.",
            "STRICT BAN: Describe visuals only. No actual text or dialogue in the visual prompt."
        ],
        jsonRole: "Lead Comic Art Director",
        jsonInstructions: (style: string) => `CORE DIRECTIVE: Convert the brief into a 'Pro Graphic Novel' JSON Blueprint.
        ${style === 'marvel-hero-project' ? 'MARVEL-PRO MODE: Enforce vibrant primary colors, cinematic heroic lighting, dynamic low-angle perspective, and clean but expressive black inking. Posing MUST be dynamic (floating, powerful reach, energetic movement).' : ''}
        STYLE LOCK: Enforce high-contrast inking, gritty cinematic textures, and dramatic lighting for every panel. 
        IDENTITY LOCK: Populate the 'cast_of_characters' array with detailed visual descriptions for every recurring character.`
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

/**
 * Derives a dynamic anatomical blacklist from the user's brief.
 * Extracts the primary anatomical subject and bans unrelated canonical landmarks
 * to prevent the model from hallucinating anatomy from previous requests.
 */
const getDynamicBlacklist = (brief: string): string => {
    const list = atlasService.getBlacklist(brief);
    if (list.length > 0) {
        return `ANATOMICAL BLACKLIST (derived from your brief): ${list.map(b => `"${b}"`).join(", ")}. These structures are FORBIDDEN. Do NOT include, reference, or imply them.`;
    }
    return `ANATOMICAL BLACKLIST: "Foot-process", "Glomerulus", "Tumor core", "Sano Shunt". These structures are FORBIDDEN unless explicitly in the brief.`;
};

/**
 * Post-generation validator for medical JSON output.
 * Returns { valid: boolean, issues: string[] }
 */
const validateMedicalOutput = (data: any): { valid: boolean; issues: string[] } => {
    const issues: string[] = [];

    // Check pathophysiology cascade is populated
    const cascade = data?.medical_content?.pathophysiology?.cascade;
    if (!Array.isArray(cascade) || cascade.length === 0) {
        issues.push("pathophysiology.cascade is empty or missing");
    } else {
        const placeholderPattern = /^(step|event|mechanism|consequence|placeholder|\[|TBD|N\/A)$/i;
        cascade.forEach((step: any, i: number) => {
            if (!step.event || placeholderPattern.test(step.event.trim())) {
                issues.push(`pathophysiology.cascade[${i}].event is a placeholder or empty: "${step.event}"`);
            }
        });
    }

    // Check anatomical zones are populated
    const zones = data?.medical_content?.anatomical_zones;
    if (!Array.isArray(zones) || zones.length === 0) {
        issues.push("medical_content.anatomical_zones is empty or missing");
    } else {
        zones.forEach((z: any, i: number) => {
            if (!z.definition || z.definition.trim().length < 5) {
                issues.push(`anatomical_zones[${i}].definition is missing or too short`);
            }
        });
    }

    // Check visual panels exist
    const panels = data?.visual_specification?.panels;
    if (!Array.isArray(panels) || panels.length < 2) {
        issues.push("visual_specification.panels must have at least 2 panels (macro + micro)");
    }

    // Check diffusion_synthesis is populated (the critical Layer 5)
    const ds = data?.diffusion_synthesis;
    if (!ds) {
        issues.push("diffusion_synthesis (Layer 5) is entirely missing — diffusion models have no rendering signal");
    } else {
        if (!ds.master_prompt || ds.master_prompt.trim().length < 50) {
            issues.push("diffusion_synthesis.master_prompt is missing or too short (needs 150-220 words)");
        }
        if (!Array.isArray(ds.style_descriptors) || ds.style_descriptors.length < 3) {
            issues.push("diffusion_synthesis.style_descriptors must have at least 3 entries");
        }
        if (!Array.isArray(ds.color_language) || ds.color_language.length === 0) {
            issues.push("diffusion_synthesis.color_language is empty — hex codes from Layer 3 were not translated to natural language");
        }
        if (!ds.negative_prompt || ds.negative_prompt.trim().length < 10) {
            issues.push("diffusion_synthesis.negative_prompt is missing");
        }
        // Guard against SVG bleed-through (common model error: copying coordinates into master_prompt)
        const svgLeakPattern = /stroke_dasharray|stroke_width|z_index|\{\s*x:\s*\d|\{\s*y:\s*\d|#[0-9a-fA-F]{6}/;
        if (svgLeakPattern.test(ds.master_prompt || "")) {
            issues.push("diffusion_synthesis.master_prompt contains SVG/CSS values or hex codes — these are invisible to diffusion models and must be translated to natural language");
        }
    }

    return { valid: issues.length === 0, issues };
};

/**
 * Post-generation validator for infographic JSON output.
 */
const validateInfographicOutput = (data: any): { valid: boolean; issues: string[] } => {
    const issues: string[] = [];

    // Check medical content
    const interventions = data?.medical_content?.interventions;
    if (!Array.isArray(interventions) || interventions.length === 0) {
        issues.push("medical_content.interventions is missing trial arms");
    }

    // Check for Layer 5
    const ds = data?.diffusion_synthesis;
    if (!ds) {
        issues.push("diffusion_synthesis (Layer 5) is missing");
    } else {
        if (!ds.master_prompt || ds.master_prompt.trim().length < 50) {
            issues.push("diffusion_synthesis.master_prompt is too short");
        }
        const svgLeakPattern = /stroke_dasharray|stroke_width|z_index|\{\s*x:\s*\d|\{\s*y:\s*\d|#[0-9a-fA-F]{6}/;
        if (svgLeakPattern.test(ds.master_prompt || "")) {
            issues.push("diffusion_synthesis.master_prompt contains SVG/CSS or hex leaks");
        }
    }

    return { valid: issues.length === 0, issues };
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { mode = "medical", brief = "", style = "Watercolor-Field-Notes", isStoryboard = false, image = null, assetInstruction = "style", lightweight = false } = body;
        const normalizedStyle = style && style !== "" && style !== "-" ? style : (mode === 'infographic' ? "Nature-Gold-Standard" : (mode === 'medical' ? "NEJM" : "Modern"));

        if (!brief) return ResponseManager.badRequest("No brief provided");

        // Select Config
        const config = agentConfigs[mode] || agentConfigs.medical;

        let refinedText = "";
        let refinementError: Error | null = null;
        let providerHistory: any[] = [];

        const safetySettings = [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ];

        // --- PHASE 1: EXPANSION (STABILIZED) ---
        if (!lightweight) { 
            const atlasContext = (mode === 'medical' || mode === 'infographic') ? atlasService.getAtlasContext(brief) : "";
            const isInfographic = mode === 'infographic';
            const dynamicBlacklist = (mode === 'medical' || mode === 'infographic') ? getDynamicBlacklist(brief) : "";
            const expansionSystemPrompt = isInfographic 
                ? `### ROLE: Principal Visual Abstract Director
                Refine the user's brief into a high-fidelity 'Visual Abstract Design Specification'.
                1. EXTRACT ALL CLINICAL DATA: Identify N-values, p-values, HR, CI, and primary results.
                2. NEJM ARCHITECTURE: Organize into Cohort, Interventions, and Results.
                3. NO TEXT BAN EXEMPTION: This is a text-heavy infographic. Preserve all numbers and metrics.
                ${dynamicBlacklist}
                ${config.expansionRules.join('\n        ')}
                STYLE PROTOCOL: ${getProtocol(mode, normalizedStyle)}
                ${atlasContext ? `\nMEDICAL REFERENCE DATA:\n${atlasContext}` : ""}`
                : `RULE 0 (CRITICAL): MEMORY PURGE. Flush previous anatomy. Focus EXCLUSIVELY on: ${brief.substring(0, 50)}...
                ${dynamicBlacklist}
                You are a ${config.expansionRole}. Refine into high-fidelity scientific spec.
                ${config.expansionRules.join('\n        ')}
                STYLE PROTOCOL: ${getProtocol(mode, normalizedStyle)}
                ${atlasContext ? `\nMEDICAL REFERENCE DATA:\n${atlasContext}` : ""}
                HARD ZERO-TEXT BAN: Terminate with: "No text characters, no labels."`;

            if (process.env.GEMINI_API_KEY) {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                // Stabilized IDs: gemini-1.5-flash is the primary to conserve quota
                const modelsToTry = ["gemini-1.5-flash", "gemini-2.0-flash"]; 
                for (const m of modelsToTry) {
                    try {
                        const model = genAI.getGenerativeModel({ model: m, safetySettings });
                        const userParts: any[] = [`EXPAND THIS BRIEF: ${brief}`];
                        if (image) {
                            const base64Data = image.split(',')[1];
                            const mimeType = image.split(';')[0].split(':')[1];
                            userParts.push({ inlineData: { data: base64Data, mimeType } });
                        }
                        const result = await model.generateContent([expansionSystemPrompt, ...userParts]);
                        refinedText = result.response.text().trim();
                        if (refinedText) {
                            providerHistory.push({ phase: "expansion", model: m, status: "success" });
                            break;
                        }
                    } catch (err: any) { 
                        const isQuota = err.message?.includes("429") || err.message?.toLowerCase().includes("quota") || err.message?.includes("limit");
                        const isNotFound = err.message?.includes("404") || err.message?.toLowerCase().includes("not found");
                        providerHistory.push({ phase: "expansion", model: m, status: "fail", error: err.message });
                        refinementError = err as Error;
                        
                        if (isQuota) break; // Immedately switch provider on quota hit
                        if (isNotFound) continue; // Try next Gemini model if version is wrong
                        break; // Fail-fast on other errors to reach Groq
                    }
                }
            }

            // Fallback to Groq for expansion
            if (!refinedText && process.env.GROQ_API_KEY) {
                try {
                    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
                    const completion = await groq.chat.completions.create({
                        messages: [
                            { role: "system", content: expansionSystemPrompt },
                            { role: "user", content: `REFINE THIS BRIEF: ${brief}` }
                        ],
                        model: "llama-3.1-8b-instant"
                    });
                    refinedText = completion.choices[0]?.message?.content?.trim() || "";
                    if (refinedText) providerHistory.push({ phase: "expansion", model: "groq-llama-3", status: "success" });
                } catch (err: any) { 
                    providerHistory.push({ phase: "expansion", model: "groq-error", status: "fail", error: err.message });
                    refinementError = err as Error;
                }
            }
        }

        const finalBriefForJson = (lightweight ? brief : refinedText) || brief;
        const currentSchema = (mode === 'comic' && isStoryboard) ? comicStripSchema : (isStoryboard ? storyboardSchema : (schemaMap[mode] || medicalIllustrationSchema));
        const sanitizedStyleName = normalizedStyle.split(' ')[0].replace(/[-,]/g, '');
        
        const systemInstruction = lightweight ? `Return ONLY valid JSON for: "${mode}". SCHEMA: ${JSON.stringify(currentSchema)}` : 
            `### ROLE: ${config.jsonRole}
            ${config.jsonInstructions ? config.jsonInstructions(normalizedStyle) : ""}
            SCHEMA MANDATE: Return JSON strictly following: ${JSON.stringify(currentSchema)}
            NO TEXT LABELS (This rule only applies to medical illustrations, ignore if mode is infographic).`;

        let adData: any = null;
        let generationError: Error | null = null;

        // --- PHASE 2: JSON GENERATION ---
        if (process.env.GEMINI_API_KEY) {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const jsonModels = lightweight ? ["gemini-1.5-flash"] : ["gemini-1.5-flash", "gemini-1.5-pro"];
            
            for (const m of jsonModels) {
                try {
                    const model = genAI.getGenerativeModel({ 
                        model: m, 
                        generationConfig: { responseMimeType: "application/json", responseSchema: currentSchema },
                        safetySettings
                    });
                    const userParts: any[] = [`GENERATE JSON BLUEPRINT FOR: ${finalBriefForJson}`];
                    if (image) {
                        const base64Data = image.split(',')[1];
                        const mimeType = image.split(';')[0].split(':')[1];
                        userParts.push({ inlineData: { data: base64Data, mimeType } });
                    }
                    const result = await model.generateContent([systemInstruction, ...userParts]);
                    adData = JSON.parse(result.response.text());
                    if (adData) {
                        providerHistory.push({ phase: "json", model: m, status: "success" });
                        break;
                    }
                } catch (err: any) { 
                    const isQuota = err.message?.includes("429") || err.message?.toLowerCase().includes("quota") || err.message?.includes("limit");
                    providerHistory.push({ phase: "json", model: m, status: "fail", error: err.message });
                    generationError = err as Error; 
                    if (isQuota) break; // Drop out of Gemini loop on quota
                }
            }
        }

        // Final Emergency Fallback — uses llama-3.3-70b-versatile for reliable structured JSON
        if (!adData && process.env.GROQ_API_KEY) {
            try {
                const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

                // Build an explicit field-by-field instruction list from the schema's required fields
                // so the 70b model has a deterministic target even without native responseSchema support.
                const schemaRequiredFields = (currentSchema as any)?.required ?? [];
                const schemaFieldGuide = schemaRequiredFields.length > 0
                    ? `\n\nREQUIRED TOP-LEVEL FIELDS (you MUST populate ALL of these with real values, not placeholders):\n${schemaRequiredFields.map((f: string) => `- "${f}"`).join('\n')}`
                    : "";

                const groqSystemPrompt = [
                    systemInstruction,
                    `SCHEMA STRUCTURE (JSON):`,
                    JSON.stringify(currentSchema, null, 2),
                    schemaFieldGuide,
                    `CRITICAL: Return ONLY a valid JSON object. No markdown fences, no commentary. Every field must contain real, meaningful data — no placeholders like "string", "[value]", "TBD", or empty arrays.`
                ].join('\n\n');

                const completion = await groq.chat.completions.create({
                    messages: [
                        { role: "system", content: groqSystemPrompt },
                        { role: "user", content: `GENERATE JSON BLUEPRINT FOR: ${finalBriefForJson}` }
                    ],
                    model: "llama-3.3-70b-versatile",
                    response_format: { type: "json_object" },
                    temperature: 0.4  // Lower temp = more deterministic, schema-faithful output
                });
                const rawContent = completion.choices[0]?.message?.content || "{}";
                adData = JSON.parse(rawContent);
                if (adData) providerHistory.push({ phase: "json", model: "groq-llama-3.3-70b", status: "success" });
            } catch (err: any) { 
                providerHistory.push({ phase: "json", model: "groq-fail", status: "fail", error: err.message });
                generationError = err as Error; 
            }
        }

        if (!adData) return ResponseManager.error(`Sovereign Sequence Failure: ${generationError?.message || refinementError?.message || "All cores failed."}`, 500);

        // --- POST-GENERATION VALIDATION ---
        let validationResult: { valid: boolean; issues: string[] } | null = null;
        if (adData) {
            if (mode === 'medical') {
                validationResult = validateMedicalOutput(adData);
            } else if (mode === 'infographic') {
                validationResult = validateInfographicOutput(adData);
            }
            
            if (validationResult && !validationResult.valid) {
                 console.warn(`[SOVEREIGN VALIDATION] ${mode} output issue:`, validationResult.issues);
            }
        }

        const scrubSubject = (s: string) => s.replace(/^(create|generate|show|make|build|give me|render|draw|an)\s+(an|a|the|image of|illustration of|diagram of|blueprint of|map for)\s+/gi, "").trim();
        const finalSubject = scrubSubject(brief);
        
        if (adData) {
            const setNestedValue = (obj: any, path: string, value: any) => {
                const parts = path.split('.');
                let current = obj;
                for (let i = 0; i < parts.length - 1; i++) {
                    if (!current[parts[i]]) current[parts[i]] = {};
                    current = current[parts[i]];
                }
                current[parts[parts.length - 1]] = value;
            };

            const getNestedValue = (obj: any, path: string) => {
                return path.split('.').reduce((o, i) => o?.[i], obj);
            };

            const subPath = config.subjectPath || config.subjectField;
            const stylePath = config.stylePath || config.styleField;

            if (subPath) {
                const val = getNestedValue(adData, subPath);
                if (!val || val.toLowerCase().includes("subject") || val.trim().length < 5) {
                    setNestedValue(adData, subPath, finalSubject);
                }
            }
            if (stylePath) {
                setNestedValue(adData, stylePath, sanitizedStyleName + (config.styleSuffix ? `-${config.styleSuffix}` : ""));
            }
        }

        const filename = `gen-${Date.now()}.json`;
        await promptService.savePrompt({ name: filename, type: mode, content: adData });

        return ResponseManager.success({
            data: adData,
            refinedPrompt: finalBriefForJson,
            promptFile: filename,
            folder: mode + "_prompts",
            providerHistory,
            ...(validationResult && !validationResult.valid ? { _validation_warnings: validationResult.issues } : {})
        });

    } catch (error: any) {
        console.error("Single-Shot Engine Failure:", error);
        return ResponseManager.error(error.message, 500);
    }
}

