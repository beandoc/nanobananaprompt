import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { Groq } from "groq-sdk";
import { ResponseManager } from "@/lib/api-response";
import { atlasService } from "@/lib/atlas-service";

export const maxDuration = 60; // Extend Vercel Serverless function timeout to 60s (Hobby max)

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
    ugc: `\nUGC CREATIVE PROTOCOL:\n- Aesthetic: Raw, candid, shot on mobile device.\n- Lighting: Natural, imperfect, multi-directional ambient light.\n- Texture: Pores visible, authentic fabric folds.\n`,
    editorial: `\nHIGH-END EDITORIAL PROTOCOL:\n- Aesthetic: Vogue/Harper's Bazaar style, extremely polished.\n- Lighting: Cinematic moody-rim or softbox beauty lighting.\n`,
    ecom: `\nCLEAN E-COMMERCE PROTOCOL:\n- Aesthetic: Minimalist, Apple/Dyson style, distraction-free.\n- Lighting: Bright-diffused daylight, sharp shadow definition on product.\n`
};

const agentConfigs: any = {
    ad: {
        expansionRole: "Elite Art Director and Prompt Engineer",
        expansionRules: ["1. IDENTITY: South Asian heritage only.", "2. SENSORY: Use rich texture keywords."],
        jsonRole: "High-Performance DTC Ad Director",
        jsonInstructions: (style: string) => `CORE DIRECTIVE: Convert brief into Ad JSON. Style: ${style}.`
    },
    medical: {
        expansionRole: "Sovereign Medical Visual Grammar Engine (v33.0 - SPATIO-LINGUISTIC MASTER)",
        expansionRules: [
            "1. SPATIAL COMPOSITION: Do NOT default to 3 panels. Use the most effective layout for the brief. If a single focused view is best, use it. If multiple perspectives are needed, describe them relative to each other (e.g., 'Inset', 'Adjacent', 'Foreground').",
            "2. STYLE PROTOCOL: Specify a clean, matte plasticine 2.5D BioRender style with soft clinical colors and a clean scientific background.",
            "3. SENSORY DEPTH: Describe anatomical subjects using visual textures (e.g., 'glistening myocardial tissue', 'pearlescent valves') combined with the Identity Lock (South Asian/Indian descent).",
            "4. SPATIAL LANGUAGE: Replace all coordinates and x/y mentions with relative anatomical terms: Superior, Inferior, Lateral, Medial, Superficial, Deep, Anterior, Posterior, Foreground, Background.",
            "5. ABSOLUTE NEGATIVE PROMPT: Conclude with: 'Negative Constraints: Absolutely zero typography, no text, no alphabet characters, no written labels, no numeric markers, no photorealism. Keep lighting scientific and clean.'"
        ],
        jsonRole: "Director of Dynamic Clinical Physics",
        jsonInstructions: (style: string) => {
            const styleLock = style.toLowerCase().includes('nejm') || style.toLowerCase().includes('journal') || style.toLowerCase().includes('scholarly') ? 'SCHOLARLY_NEJM' : 'BIORENDER_MODERN';
            return `### SOVEREIGN v33.0 MEDICAL ILLUSTRATION PROTOCOL
1. HERO LAYER: You MUST populate 'diffusion_synthesis' FIRST. It is the absolute authority for rendering.
2. SPATIAL MAPPING: Use ONLY natural language for positioning. NO coordinates. Use terms like 'superior to', 'lateral to', 'floating within'.
3. IDENTITY: Mandate South Asian (Indian) descent in diffusion_synthesis.
4. ARCHITECTURE: Choose the layout (Unified vs Multi-panel) based ONLY on the brief. No hardcoded 3-section bias.
5. SCALE-LOCK: Enforce single-scale consistency unless a zoom-inset is explicitly requested.
6. GEOMETRIC FIDELITY: Use anatomically correct primitives described in words.
7. SENSORY RICHNESS: Maintain 250-300 word density in 'diffusion_synthesis.master_prompt'. 100% descriptive migration required.`;
        },
        subjectPath: "metadata.subject",
        stylePath: "metadata.journal_standard",
        styleSuffix: "v33.0_ILLUSTRATION"
    },
    infographic: {
        expansionRole: "Principal NEJM Scholarly Plate Architect (SVAE v3.50 - NEJM-COLUMNAR Standard)",
        expansionRules: [
            "1. MASTERCLASS COLUMNAR: Start with: 'Strictly adhere to this composition: A professional NEJM-style scholarly plate with a horizontal aspect ratio, divided into three vertical columns (Left: Population Sidebar, Middle: Intervention, Right: Control).'",
            "2. DATA INTEGRITY: Every piece of clinical data (N-values, HR, p-values, CI) must be embedded within the descriptive sentences as focal information points.",
            "3. STYLE INFUSION: Specify: 'The overall aesthetic is a clean, academic infographic style with thin grey borders, professional columnar shading, and high-contrast clinical headers.'",
            "4. COLUMNAR LOGIC: Formulate content strictly into 'Left Column', 'Middle Column', and 'Right Column' fluid paragraphs. NO bullet points.",
            "5. FINAL DIRECTIVE: Conclude with: 'Maintain clinical accuracy and data-centric visual hierarchy. Use South Asian patient silhouettes for population data.'"
        ],
        jsonRole: "Director of High-Impact Visual Abstracts",
        jsonInstructions: (style: string) => `### SVAE v3.50 NEJM-COLUMNAR PROTOCOL
1. ARCHITECTURE: Design the layout to fit the data. While 3-column is standard, allow for focus panels if the trial has fewer arms.
2. ENDPOINTS: Map clinical results horizontally across trial arms.
3. STATISTICS: Pair every result with its (HR, 95% CI, P) block.
4. PRIMITIVES: Header Mechanism Icons for each column.
5. IDENTITY: South Asian patient silhouettes in the Population sidebar.`,
        subjectPath: "metadata.subject",
        stylePath: "metadata.journal_standard",
        styleSuffix: "v3.50_NEJM_COLUMNAR"
    },
    vector: {
        expansionRole: "Principal Brand Designer",
        expansionRules: ["1. IDENTITY: South Asian heritage only.", "2. AESTHETIC: Clean geometric lines."],
        jsonRole: "Master Brand Architect",
        jsonInstructions: (style: string) => `CORE DIRECTIVE: Convert brief into Vector JSON. Style: ${style}.`
    },
    video: {
        expansionRole: "Sovereign Cinematic Director — Google Flow / Veo 3.1 Native Protocol (v6.0)",
        expansionRules: [
            "RULE 1 — DURATION CONTRACT: Veo only accepts 4s, 6s, or 8s per clip. Always set veo_clip.duration_seconds to 8. If the brief needs more than 8s, populate clip_2 with first-frame handoff instructions.",
            "RULE 2 — PROMPT FORMULA: compiled_master_prompt MUST follow this 5-part order: [SHOT composition + camera + lens] → [SUBJECT: identity_lock as a single rich sentence] → [ACTION: sequential prose of all beats, no timecodes] → [SETTING + world_material] → [AESTHETICS: veo_native_tags + fps + color_grade]. Then append 2–3 audio sentences. Target: 100–150 words. Hard minimum: 80 words. Hard maximum: 180 words.",
            "RULE 3 — KILL TIMECODES: temporal_arc.keyframes are for internal planning ONLY. NEVER include [0s-3s] or any timecode bracket in compiled_master_prompt. Convert all temporal structure into sequential prose action beats.",
            "RULE 4 — AUDIO INLINE: Audio is NOT a separate metadata field. The compiler appends 3 audio sentences at the END of compiled_master_prompt: Sentence 1: 'Audio: {ambient_bed}.' Sentence 2: '{specific_sfx}.' Sentence 3: 'No dialogue. No subtitles.' For stop-motion add: 'No smooth motion interpolation.'",
            "RULE 5 — IDENTITY FRONT-LOAD: The second sentence of compiled_master_prompt is ALWAYS the identity_lock block. Formula: '{age_descriptor} {ethnicity} {gender}, {physical_features}, {skin_descriptor}, wearing {garment} — {material_cue}.'",
            "RULE 6 — NEGATIVE DISCIPLINE: negative_prompts array MUST contain exactly 1–3 entries. Stop-motion standard: ['No smooth motion interpolation', 'No morphing', 'No subtitles']. Never add aesthetic negatives like 'no noise'.",
            "RULE 7 — VEO STYLE VOCABULARY: Only use Veo-native trained strings in veo_native_tags. MAP: stop-motion claymation → 'claymation style, stop-motion animation'. Pixar CGI → 'Pixar-like 3D animation'. Hand-drawn → 'cel-shaded animation'. Vintage → 'shot on 16mm film, film grain'. NEVER invent custom style tags."
        ],
        jsonRole: "Chief Cinematic Engineer — Google Flow / Veo 3.1 Protocol (v6.0)",
        jsonInstructions: (style: string) => `### SOVEREIGN CINEMATIC ENGINE v6.0 — VEO 3.1 PRODUCTION PROTOCOL
1. SCHEMA: Populate veo_clip.duration_seconds as 4, 6, or 8 ONLY.
2. IDENTITY: scene_core.identity_lock is MANDATORY. Include age, ethnicity, physical_features, skin_descriptor, garment, material_cue.
3. ACTION BEATS: scene_core.action_sequence must be an array of prose beats — NO timecodes.
4. TEMPORAL ARC: temporal_arc.keyframes are planning data only. Set phase to 'Opening', 'Mid Action', 'Resolution'.
5. STYLE: style.veo_native_tags MUST use exact Veo strings (claymation style, stop-motion animation, Pixar-like 3D animation, etc).
6. AUDIO: audio.ambient_bed and audio.specific_sfx are REQUIRED — they compile into inline sentences.
7. NEGATIVES: negative_prompts array max 3 entries.
8. HERO: compiled_master_prompt is the OUTPUT. 100–150 words. Shot→Subject→Action→Setting→Aesthetics→Audio. ZERO timecodes.
9. IDENTITY: South Asian/Indian subject MANDATORY.
10. STYLE APPLIED: ${style || 'claymation style, stop-motion animation'}.`
    },
    manga: {
        expansionRole: "Manga Concept Artist",
        expansionRules: ["1. IDENTITY: South Asian characters only.", "2. AESTHETIC: Pro Manga inking."],
        jsonRole: "Lead Manga Editor",
        jsonInstructions: (style: string) => `CORE DIRECTIVE: Convert to Manga JSON.`
    },
    food: {
        expansionRole: "Industrial Food Infographic Artist",
        expansionRules: ["1. IDENTITY: Indian heritage for chefs.", "2. TEXTURES: Glistening/Steam."],
        jsonRole: "Culinary Visual Director",
        jsonInstructions: (style: string) => `CORE DIRECTIVE: Convert to Food JSON. Journal: ${style}.`
    },
    comic: {
        expansionRole: "Sequential Art Director",
        expansionRules: ["1. IDENTITY: South Asian heritage only.", "2. AESTHETIC: Pro Graphic Novel and cinematic lighting."],
        jsonRole: "Lead Comic Art Director",
        jsonInstructions: (style: string) => `CORE DIRECTIVE: Convert to Comic Script JSON.`
    },
    storyboard: {
        expansionRole: "Storyboarding Previs Director",
        expansionRules: ["1. IDENTITY: South Asian heritage only.", "2. CONTINUITY: Consistent appearance."],
        jsonRole: "Chief Storyboard Supervisor",
        jsonInstructions: (style: string) => `CORE DIRECTIVE: Convert to Storyboard JSON.`
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
    const panels = data?.spatial_layout?.panels;
    if (!Array.isArray(panels) || panels.length < 1) {
        issues.push("spatial_layout.panels must have at least 1 panel");
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

        // Guard against ID/Property name leakage (e.g., 'ent_beta' or 'p1_micro' appearing in text)
        const idLeakPattern = /ent_|panel_|p1_|p2_|p3_|\w+_\w+/;
        if (idLeakPattern.test(ds.master_prompt || "")) {
            issues.push("diffusion_synthesis.master_prompt contains internal JSON property names or IDs — this causes 'ID Leakage' in the rendered image. Remove these technical markers.");
        }

        // Check for spatial language in master_prompt
        if (!ds.spatial_narrative || ds.spatial_narrative.trim().length < 20) {
            issues.push("diffusion_synthesis.spatial_narrative is missing or too short");
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
            const isVideo = mode === 'video';
            const dynamicBlacklist = (mode === 'medical' || mode === 'infographic') ? getDynamicBlacklist(brief) : "";

            let expansionSystemPrompt: string;

            if (isInfographic) {
                expansionSystemPrompt = `### ROLE: Principal Visual Abstract Director
                Refine the user's brief into a high-fidelity 'Visual Abstract Design Specification'.
                1. EXTRACT ALL CLINICAL DATA: Identify N-values, p-values, HR, CI, and primary results.
                2. CLINICAL ARCHITECTURE: Organize the content logically (e.g., Cohort, Interventions, Results, or Primary/Secondary Analysis) to best represent the provided trial data. Use the most effective layout for the findings.
                3. NO TEXT BAN EXEMPTION: This is a text-heavy infographic. Preserve all numbers and metrics.
                ${dynamicBlacklist}
                ${config.expansionRules.join('\n        ')}
                STYLE PROTOCOL: ${getProtocol(mode, normalizedStyle)}
                ${atlasContext ? `\nMEDICAL REFERENCE DATA:\n${atlasContext}` : ""}`;
            } else if (isVideo) {
                // --- DEDICATED VIDEO EXPANSION BRANCH ---
                // This ensures video briefs are NEVER contaminated by medical rules (ZERO-TEXT BAN, anatomy blacklist, single-panel, etc.)
                expansionSystemPrompt = `### ROLE: ${config.expansionRole}

You are the world's foremost cinematic prompt engineer. Your mission is to transform a simple video brief into an ultra-dense, production-grade 'Cinematic Design Specification' that will generate industry-leading video output from AI engines like Kling AI 2.0, Seedance 2.0, Google Veo 3, Runway Gen-4, and Sora.

Your output must be a single, continuous block of rich natural language — NOT bullet points, NOT JSON, NOT a list. Write it as a professional cinematographer would describe a shot to their crew.

### MANDATORY EXPANSION RULES:
${config.expansionRules.join('\n')}

### VIDEO TYPE DETECTION:
Analyze the brief. If it describes:
- Real-world scenes, people, products → Use PHOTOREALISTIC language (film grain, lens flare, skin pores, fabric weave).
- Animated characters, fantasy worlds, stylized visuals → Use ANIMATION language (cel-shading, squash-and-stretch, parallax layers, motion smear, hand-painted backgrounds).
- 3D/CGI renders, Pixar-style → Use CGI language (subsurface scattering, global illumination, PBR materials, volumetric caustics).
- Abstract/motion graphics → Use DESIGN language (kinetic typography, geometric morphing, smooth easing curves, particle systems).

### TEMPORAL STRUCTURE (CRITICAL):
Your expanded text MUST describe the shot as a JOURNEY through time:
- OPENING (0-3s): What does the viewer see first? Establish the world.
- MIDPOINT (3-6s): What changes? What is the key action or transformation?
- CLOSING (6-8s+): How does the shot resolve? What is the final image?

### SENSORY LAYERING:
Every sentence should layer multiple sensory channels:
- VISUAL: Subject appearance, environment textures, lighting quality
- MOTION: How things move, with physical weight and velocity
- ATMOSPHERIC: Particles, weather, ambient elements
- AUDIO (describe visually): What sounds would accompany this (for engines that generate audio)

### STYLE PROTOCOL: ${normalizedStyle || 'Cinematic Photorealistic'}

### OUTPUT FORMAT:
Write 200-400 words of continuous, dense, cinematic prose. End with a line of comma-separated style tags (e.g., 'cinematic, 4K, temporal consistency, no morphing, photorealistic, volumetric lighting').

Do NOT output JSON. Do NOT use markdown headers. Do NOT use bullet points. Write pure cinematographic prose.`;
            } else {
                // --- DEFAULT BRANCH (Medical, Ad, Vector, Comic, Manga, Food) ---
                expansionSystemPrompt = `RULE 0 (CRITICAL): MEMORY PURGE. Flush previous anatomy. Focus EXCLUSIVELY on: ${brief.substring(0, 50)}...
                RULE 1 (STRICT): If the user doesn't mention 'sections', 'panels', or 'stages', you MUST generate a SINGLE-PANEL composition. Do NOT mention Section 1, Left Section, etc. unless explicitly asked.
                ${dynamicBlacklist}
                You are a ${config.expansionRole}. Refine into high-fidelity scientific spec.
                ${config.expansionRules.join('\n        ')}
                STYLE PROTOCOL: ${getProtocol(mode, normalizedStyle)}
                ${atlasContext ? `\nMEDICAL REFERENCE DATA:\n${atlasContext}` : ""}
                HARD ZERO-TEXT BAN: Terminate with: "No text characters, no labels."`;
            }


            if (process.env.GEMINI_API_KEY) {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
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
                        const isQuota = err.message?.includes("429") || err.message?.toLowerCase().includes("quota");
                        providerHistory.push({ phase: "expansion", model: m, status: "fail", error: err.message, isQuota });

                        if (isQuota) {
                            console.warn(`[SOVEREIGN FAILOVER] Expansion quota hit on ${m}. Breaking Gemini loop and pivoting to Groq...`);
                            break; // Aggressively break out of the Google loop to reach Groq
                        }
                        continue; // For other errors (like 404), try the next Gemini model
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

        // --- SCHEMA MINIFICATION (v32.51) ---
        // Prevents Buffer Overflow errors for large schemas (e.g., medical-illustration 28KB)
        const minSchema = JSON.parse(JSON.stringify(currentSchema));
        const pruneDescriptions = (obj: any) => {
            if (obj.description) delete obj.description;
            if (obj.properties) {
                for (let k in obj.properties) pruneDescriptions(obj.properties[k]);
            }
            if (obj.items) pruneDescriptions(obj.items);
        };
        pruneDescriptions(minSchema);
        const schemaStr = JSON.stringify(minSchema);

        const systemInstruction = lightweight ? `Return ONLY valid JSON for: "${mode}". SCHEMA: ${schemaStr}` :
            `### ROLE: ${config.jsonRole}
            ${config.jsonInstructions ? config.jsonInstructions(normalizedStyle) : ""}
            SCHEMA MANDATE: Return JSON strictly following schema: ${schemaStr}
            NO TEXT LABELS (This rule only applies to medical illustrations, ignore if mode is infographic).`;

        let adData: any = null;
        let generationError: Error | null = null;

        // --- PHASE 2: JSON GENERATION (RESILIENT) ---
        if (process.env.GEMINI_API_KEY) {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            // Optimized models list: removed 1.5-pro bounds token exhaustion as it's heavily rate limited on free tier (2 RPM)
            const jsonModels = lightweight ? ["gemini-1.5-flash"] : ["gemini-1.5-flash", "gemini-2.0-flash"];

            for (const m of jsonModels) {
                try {
                    const model = genAI.getGenerativeModel({
                        model: m,
                        // Removed responseSchema to prevent 400 Bad Request parameter mapping errors.
                        // We rely on responseMimeType and the system prompt structure.
                        generationConfig: { responseMimeType: "application/json" },
                        safetySettings
                    });
                    const result = await model.generateContent([systemInstruction, `GENERATE JSON BLUEPRINT FOR: ${finalBriefForJson}`]);
                    adData = JSON.parse(result.response.text());
                    if (adData) {
                        providerHistory.push({ phase: "json", model: m, status: "success" });
                        break;
                    }
                } catch (err: any) {
                    const isQuota = err.message?.includes("429") || err.message?.toLowerCase().includes("quota") || err.message?.includes("limit");
                    const isNotFound = err.message?.includes("404") || err.message?.toLowerCase().includes("not found");
                    const isDecommissioned = err.message?.includes("400") || err.message?.toLowerCase().includes("decommissioned");

                    providerHistory.push({ phase: "json", model: m, status: "fail", error: err.message, isQuota, isNotFound, isDecommissioned });

                    if (isQuota) {
                        console.warn(`[SOVEREIGN FAILOVER] Gemini quota hit on ${m}. Dumping Google provider and pivoting to Groq...`);
                        break; // Aggressive dump: skip all other Gemini models and hit Groq immediately
                    }
                    if (isNotFound || isDecommissioned) {
                        console.warn(`[SOVEREIGN FAILOVER] Gemini model ${m} not found/retired. Trying next Google core...`);
                        continue; // Hop to next Gemini model
                    }
                    generationError = err as Error;
                }
            }
        }

        // --- FINAL EMERGENCY FALLBACK (GROQ MULTIMAL-MODEL HOPPING) ---
        if (!adData && process.env.GROQ_API_KEY) {
            console.log("[SOVEREIGN RECOVERY] Gemini exhausted or rejected schema. Entering Groq Multi-Model Recovery...");
            const groqModels = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "llama3-70b-8192", "gemma2-9b-it"];
            const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

            const schemaRequiredFields = (currentSchema as any)?.required ?? [];
            const schemaFieldGuide = schemaRequiredFields.length > 0
                ? `\n\nREQUIRED TOP-LEVEL FIELDS:\n${schemaRequiredFields.map((f: string) => `- "${f}"`).join('\n')}`
                : "";

            const groqSystemPrompt = [
                systemInstruction,
                `SCHEMA STRUCTURE:`,
                schemaStr,
                schemaFieldGuide,
                `CRITICAL: Return ONLY valid JSON. No markdown. No chatter.`
            ].join('\n\n');

            for (const gm of groqModels) {
                try {
                    console.log(`[SOVEREIGN ATTEMPT] Trying Groq Core: ${gm}...`);
                    const completion = await groq.chat.completions.create({
                        messages: [
                            { role: "system", content: groqSystemPrompt },
                            { role: "user", content: `GENERATE JSON BLUEPRINT: ${finalBriefForJson}` }
                        ],
                        model: gm,
                        response_format: { type: "json_object" },
                        temperature: 0.1
                    });
                    const rawContent = completion.choices[0]?.message?.content || "{}";
                    adData = JSON.parse(rawContent);
                    if (adData) {
                        providerHistory.push({ phase: "json", model: gm, status: "success" });
                        console.log(`[SOVEREIGN SUCCESS] Recovered with ${gm}.`);
                        break;
                    }
                } catch (err: any) {
                    console.error(`[SOVEREIGN FAIL] ${gm} failed: ${err.message}`);
                    providerHistory.push({ phase: "json", model: gm, status: "fail", error: err.message });
                    continue; // Instantly hop to the next Groq model
                }
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
            // --- GENERATIVE COMPILER LAYER (Principles 2, 6, 8) ---
            if (adData.diffusion_synthesis && typeof adData.diffusion_synthesis === 'object') {
                console.log("[SOVEREIGN COMPILER] Compiling final prompt with Principle-based pruning...");
                let cleanMaster = adData.diffusion_synthesis.master_prompt || "";
                
                // 1. Noise Pruning (Principle 8)
                cleanMaster = cleanMaster.replace(/stroke_dasharray|stroke_width|z_index|opacity|#[0-9a-fA-F]{6}|\{\s*x:\s*\d.*?\}/g, "");
                cleanMaster = cleanMaster.replace(/ent_\w+|panel_\w+|p1_\w+|p2_\w+|p3_\w+/g, "");

                // 2. Structural/Compositional Normalization
                const ds = adData.diffusion_synthesis;
                let compiledBlocks = [];
                
                // Priority Weighting
                if (ds.priority_weighting) {
                    const pw = ds.priority_weighting;
                    if (pw.primary_focus?.length) compiledBlocks.push(`[PRIMARY FOCUS]:\n${pw.primary_focus.join(", ")}`);
                    if (pw.secondary_context?.length) compiledBlocks.push(`[SECONDARY CONTEXT]:\n${pw.secondary_context.join(", ")}`);
                }

                // Spatial Narrative (New Hero Signal)
                if (ds.spatial_narrative) {
                    compiledBlocks.push(`[SPATIAL ARRANGEMENT]:\n${ds.spatial_narrative}`);
                }

                compiledBlocks.push(`[DETAILED SPECIFICATION]:\n${cleanMaster.trim()}`);
                if (ds.style_descriptors?.length) compiledBlocks.push(`[STYLE PROTOCOL]:\n${ds.style_descriptors.join(", ")}`);

                adData.diffusion_synthesis.compiled_prompt = compiledBlocks.join("\n\n");
            }

            // --- VIDEO CINEMATIC COMPILER (v5.0) ---
            // For video mode: compile all layers into engine-ready paste prompts
            if (mode === 'video') {
                console.log("[SOVEREIGN CINEMATIC COMPILER v6.0] Veo 3.1 Native Compliance...");
                const sc = adData.scene_core || {};
                const cin = adData.cinematography || {};
                const style = adData.style || {};
                const audio = adData.audio || {};
                const negatives: string[] = (adData.negative_prompts || []).slice(0, 3);
                const ta = adData.temporal_arc || {};
                const veoClip = adData.veo_clip || {};

                // --- RULE 1: Duration enforcement (4 / 6 / 8 only) ---
                const ALLOWED_DURATIONS = [4, 6, 8];
                if (!ALLOWED_DURATIONS.includes(veoClip.duration_seconds)) {
                    adData.veo_clip = { ...veoClip, duration_seconds: 8 };
                }

                // --- RULE 5: Build front-loaded identity sentence ---
                const idLock = sc.identity_lock || {};
                const features = Array.isArray(idLock.physical_features) ? idLock.physical_features.join(', ') : '';
                const identitySentence = `${idLock.age_descriptor || 'Senior'} ${idLock.ethnicity || 'Indian'} ${idLock.gender || 'male'}, ${features}, ${idLock.skin_descriptor || 'warm brown skin'}, wearing ${idLock.garment || 'traditional attire'}${idLock.material_cue ? ` — ${idLock.material_cue}` : ''}.`;

                // --- RULE 3: Convert keyframes → sequential prose (strip timecodes) ---
                const beats: string[] = Array.isArray(sc.action_sequence) && sc.action_sequence.length > 0
                    ? sc.action_sequence
                    : (Array.isArray(ta.keyframes) ? ta.keyframes.map((kf: any) => kf.visual_state || '') : []);
                const actionProse = beats.filter((b: string) => b.trim()).join('. ');

                // --- RULE 7: Veo-native style tags ---
                const styleTags = Array.isArray(style.veo_native_tags) && style.veo_native_tags.length > 0
                    ? style.veo_native_tags.join(', ')
                    : 'claymation style, stop-motion animation';
                const fps = style.fps || 24;
                const colorGrade = cin.color_grade || 'warm cinematic';
                const dof = cin.depth_of_field || 'shallow depth of field';
                const lightTemp = cin.lighting?.colour_temp_K || 3200;
                const lightType = cin.lighting?.type || 'practical candle light';
                const flickerHz = cin.lighting?.flicker_hz || 0;

                // --- RULES 2 + 5: Assemble the 5-part formula ---
                const shotBlock = `${cin.shot_type || 'Medium shot'}, ${cin.camera_movement || 'slow dolly-in'}, ${cin.lens || 'macro lens'}.`;
                const settingBlock = `${sc.environment || ''}${sc.world_material ? '. ' + sc.world_material : ''}.`;
                const aestheticsBlock = `${styleTags}, ${fps}fps${style.motion_quality ? ', ' + style.motion_quality : ''}, ${colorGrade} colour grade, ${dof}. ${lightType}, ${lightTemp}K${flickerHz > 0 ? `, ${flickerHz}Hz flicker` : ''}.`;

                // --- RULE 4: Audio as inline sentences ---
                const audioLine1 = `Audio: ${audio.ambient_bed || 'natural ambient sound'}.`;
                const audioLine2 = audio.specific_sfx ? `${audio.specific_sfx}.` : '';
                const audioLine3 = `No dialogue. No subtitles.${audio.no_smooth_interpolation ? ' No smooth motion interpolation.' : ''}`;
                const audioBlock = [audioLine1, audioLine2, audioLine3].filter(Boolean).join(' ');

                // --- RULE 6: Negative prompt (max 3) ---
                const negBlock = negatives.length > 0 ? negatives.join('. ') + '.' : 'No morphing. No subtitles.';

                // Assemble full compiled prompt
                let compiledPrompt = `${shotBlock} ${identitySentence} ${actionProse}. ${settingBlock} ${aestheticsBlock} ${audioBlock} Exclude: ${negBlock}`;

                // --- RULE 2: Word count gate (80–180 words) ---
                const wordCount = compiledPrompt.trim().split(/\s+/).length;
                if (wordCount < 80) {
                    compiledPrompt += ` High production quality, photorealistic material textures, temporal consistency across all frames.`;
                } else if (wordCount > 180) {
                    // Trim aesthetics block to compress
                    compiledPrompt = `${shotBlock} ${identitySentence} ${actionProse}. ${settingBlock} ${styleTags}, ${fps}fps, ${colorGrade}. ${audioBlock} Exclude: ${negBlock}`;
                }

                adData.compiled_master_prompt = compiledPrompt.trim();

                // --- ENGINE-SPECIFIC COMPILER (v6.0) ---
                // Veo: clean prose only (no params)
                // Kling: --stylize params
                // Seedance: [Motion Vector] header
                // Runway: camera token prefix
                const veoPrompt = compiledPrompt.trim();

                adData.engine_prompts = {
                    veo: veoPrompt,
                    kling: `--stylize 8 --motion 7 --quality high\n\n${veoPrompt.replace(/Exclude:[\s\S]*$/g, '').trim()}\n\nResolution: ${veoClip.resolution || '1080p'}, Duration: ${veoClip.duration_seconds || 8}s.`,
                    seedance: `[Motion Vector Guidance: High Magnitude]\n\n${veoPrompt.replace(/Exclude:[\s\S]*$/g, '').trim()}\n\nMasterpiece, 8K, Seedance-2.0, detailed material physics.`,
                    runway: `Camera: ${cin.camera_movement || 'slow dolly-in'}.\n\n${veoPrompt.replace(/Exclude:[\s\S]*$/g, '').trim()}\n\nRunway Gen-4, hyper-realistic, temporal consistency.`,
                    generic: `${veoPrompt}\n\nDuration: ${veoClip.duration_seconds || 8}s, ${fps}fps, ${veoClip.resolution || '1080p'}.`
                };
            }

            // --- v32.44 CITATION-ERASER HOOK ---
            if (mode === 'medical' && adData.metadata) {
                console.log("[SOVEREIGN SANITIZER] Stripping halluncinated citation artifacts...");
                delete adData.metadata.citation;
                delete adData.metadata.doi;
            }

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

