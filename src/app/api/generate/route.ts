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
        expansionRole: "Sovereign Cinematic Director — Google Flow / Veo 3.1 Native Protocol (v8.0)",
        expansionRules: [
            "RULE 1 — DURATION CONTRACT: Veo only accepts 4s, 6s, or 8s. Always default to 8s.",
            "RULE 2 — STYLE EXTRACTION (CRITICAL ❌ P0): Read the brief. Identify the animation style FIRST before touching any other field. Map it EXACTLY using the Style Table below. If the brief says 'Pixar' or 'Disney CGI' → veo_native_tags MUST include 'Pixar-like 3D animation'. WRONG STYLE = DISQUALIFIED OUTPUT.",
            "RULE 3 — HERO VISUAL EXTRACTION: Find the single most visually distinctive moment in the brief (e.g., 'batter sizzles into blue light'). This MUST become the climax beat and MUST appear verbatim in the compiled prompt.",
            "RULE 4 — PROSE SYNTHESIS (100-150 words): compiled_master_prompt MUST be a single flowing cinematic paragraph. Formula: [SHOT + CAMERA] → [SUBJECT with identity] → [ACTION ARC — 3 beats with causal connectors] → [SETTING + HERO VISUAL] → [STYLE TAGS] → [AUDIO]. NOT a list. NOT one sentence. A directed story paragraph.",
            "RULE 5 — IDENTITY LOCK WITH RENDER VOCABULARY: For CGI/Animation briefs, identity descriptions MUST include: proportions (e.g., 'Pixar oversized eyes'), material cues (e.g., 'wet synthetic nylon, high specular sheen'), and SSS descriptors.",
            "RULE 6 — KILL TIMECODES: NEVER include [0s] [3s] brackets in the compiled prompt.",
            "RULE 7 — AUDIO REGISTER MATCH: For Pixar/CGI → audio must be 'orchestral, heightened, emotionally tuned'. For stop-motion → 'natural, ambient, diegetic'. For live-action → 'photorealistic, cinematic'. Match the audio register to the ANIMATION STYLE, not the setting.",
            "RULE 8 — NEGATIVE PROMPTS ARE MANDATORY for animation: Pixar/CGI MUST include: ['no photorealistic rendering', 'no live-action footage style', 'no morphing or texture instability']. Stop-motion MUST include: ['No smooth motion interpolation', 'No morphing between frames', 'No subtitles']. NEVER leave negative_prompts empty for an animation brief.",
            "RULE 9 — FPS BY STYLE: Pixar CGI → 24fps. Stop-motion/Claymation → 12fps. Anime → 24fps. Cel-shaded → 24fps. Vintage film → 24fps. NEVER use 60fps for animation — that is slow-motion live-action.",
            "RULE 10 — no_smooth_interpolation FLAG: Set TRUE for ALL animation styles (CGI, Claymation, Anime, Cel-shaded). Set FALSE for live-action photorealism ONLY.",
            "RULE 11 — RENDER LANGUAGE: CGI briefs MUST populate style.render_language array with: SSS descriptors, PBR material specs, volumetric lighting, and the hero visual's emissive/specular properties.",
            "RULE 12 — STYLE TAG MAP (EXACT MATCH MANDATORY): 'Pixar' or 'Disney' → 'Pixar-like 3D animation'. 'claymation' or 'clay' → 'claymation style'. 'stop-motion' → 'stop-motion animation'. 'anime' or 'Ghibli' → 'Japanese anime style'. 'hand-drawn' or '2D' → 'cel-shaded animation'. 'vintage' or 'retro' → 'shot on 16mm film, film grain'. 'watercolour' → 'watercolor painting coming to life'. 'sketch' → 'charcoal sketch animation'. SETTING WORDS LIKE 'cyberpunk', 'Mumbai', 'street food' ARE NOT STYLE TAGS."
        ],
        jsonRole: "Chief Cinematic Engineer — Google Flow / Veo 3.1 Protocol (v8.0)",
        jsonInstructions: (style: string) => `### SOVEREIGN CINEMATIC ENGINE v8.0 — STYLE-AWARE EXTRACTION PROTOCOL

STYLE APPLIED: ${style}

Mandatory Pre-Generation Checklist (complete in this order):
STEP 1 — STYLE EXTRACTION: What animation style is this brief? Map it to the EXACT Veo native tag.
  Pixar/Disney CGI → veo_native_tags: ["Pixar-like 3D animation"], fps: 24, negative_prompts: ["no photorealistic rendering","no live-action footage style","no morphing or texture instability"]
  Claymation/Stop-motion → veo_native_tags: ["claymation style","stop-motion animation"], fps: 12, negative_prompts: ["No smooth motion interpolation","No morphing between frames","No subtitles"]
  Anime/Ghibli → veo_native_tags: ["Japanese anime style"], fps: 24, negative_prompts: ["no photorealistic rendering","no 3D CGI look","no morphing"]
  Cel-shaded → veo_native_tags: ["cel-shaded animation"], fps: 24, negative_prompts: ["no photorealistic rendering","no smooth gradients","no morphing"]
  Live-action → veo_native_tags: ["cinematic film look"], fps: 24, negative_prompts: ["no text","no subtitles","no morphing"]

STEP 2 — HERO VISUAL: Identify the single most visually striking moment in the brief. Write it down. This MUST appear in compiled_master_prompt.

STEP 3 — IDENTITY LOCK: Fill identity_locks for every subject. For CGI: add 'pixar_design_notes' with proportions. Physical features ≠ costume props.

STEP 4 — ACTION ARC: Exactly 3 causal beats. FORMAT: Beat→Trigger→Physical Consequence. Max 4 beats only if the brief explicitly needs it.

STEP 5 — COMPILED PROMPT: Write 120-160 words of fluid prose. STRUCTURE:
  Sentence 1: [SHOT TYPE + CAMERA MOVEMENT + LENS]
  Sentence 2-3: [ALL SUBJECTS with full identity — NOT just one word]
  Paragraph 2: [ACTION ARC — 3 beats with 'As...', 'When...', 'In response...' connectors]
  Paragraph 3: [SETTING as unified material reality + HERO VISUAL]
  Final lines: [STYLE TAG] + [fps] stuttered/smooth + [colour grade]. Ambient: [...]. SFX: [...]. No dialogue. No subtitles. Exclude: [negatives].`
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
                console.log("[SOVEREIGN CINEMATIC COMPILER v7.0] Hard Constraints & Prose Synthesis Layer...");
                const cin = adData.cinematography || {};
                const style = adData.style || {};
                const negatives: string[] = (adData.negative_prompts || []).slice(0, 3);
                const veoClip = adData.veo_clip || {};
                const fps = style.fps || 24;

                // --- RULE 1: Duration enforcement (4 / 6 / 8 only) ---
                const ALLOWED_DURATIONS = [4, 6, 8];
                if (!ALLOWED_DURATIONS.includes(veoClip.duration_seconds)) {
                    adData.veo_clip = { ...veoClip, duration_seconds: 8 };
                }

                // --- v7.0: Resolution Constraint Validator ---
                if (veoClip.resolution === '4K UHD' || veoClip.resolution === '4K') {
                    console.log("[v7.0 Validator] 4K not supported by Veo 3.1. Capping to 1080p.");
                    adData.veo_clip.resolution = '1080p';
                    veoClip.resolution = '1080p';
                }

                // --- v7.0: Negative Prompt Validator ---
                let processedNegatives = negatives.map((neg: string) => {
                    const lower = neg.toLowerCase();
                    if (lower.startsWith('no urban') || lower.includes('no modern')) {
                        return 'natural rural elements only';
                    }
                    if (lower.match(/^no [a-zA-Z]+$/)) { // simple adjective block
                        return neg.replace(/^no /i, 'exclude ');
                    }
                    return neg;
                });

                // --- v6.1 SYNTHESIS LAYER ---
                // We rely on the LLM's fluid prose in adData.compiled_master_prompt.
                let compiledPrompt = adData.compiled_master_prompt || "";

                // --- RULE 6: Negative prompt enforcement ---
                // If the LLM missed 'Exclude:' in the prose, we inject it based on negative_prompts
                if (compiledPrompt && !compiledPrompt.includes("Exclude:")) {
                    const negBlock = processedNegatives.length > 0 ? processedNegatives.join('. ') + '.' : 'No morphing. No subtitles.';
                    compiledPrompt = `${compiledPrompt.trim()} Exclude: ${negBlock}`;
                    adData.compiled_master_prompt = compiledPrompt;
                }

                // --- v8.0: STYLE-AWARE POST-PROCESSOR ---
                // This is the hard-enforcement layer that catches LLM style failures.
                const veoNativeTags: string[] = Array.isArray(adData.style?.veo_native_tags) ? adData.style.veo_native_tags : [];
                const rawStyle = (style as string || '').toLowerCase();

                // Detect animation style from tags or the style passed in from the UI
                const isPixarCGI = veoNativeTags.some((t: string) => t.toLowerCase().includes('pixar') || t.toLowerCase().includes('disney')) ||
                    rawStyle.includes('pixar') || rawStyle.includes('disney') || rawStyle.includes('cgi');
                const isClaymation = veoNativeTags.some((t: string) => t.toLowerCase().includes('claymation') || t.toLowerCase().includes('stop-motion')) ||
                    rawStyle.includes('clay') || rawStyle.includes('stop');
                const isAnime = veoNativeTags.some((t: string) => t.toLowerCase().includes('anime') || t.toLowerCase().includes('ghibli')) ||
                    rawStyle.includes('anime') || rawStyle.includes('ghibli');
                const isCelShaded = veoNativeTags.some((t: string) => t.toLowerCase().includes('cel-shaded')) ||
                    rawStyle.includes('cel-shaded') || rawStyle.includes('hand-drawn');
                const isAnimation = isPixarCGI || isClaymation || isAnime || isCelShaded;

                // --- STYLE TAG ENFORCEMENT ---
                if (isPixarCGI && !veoNativeTags.some((t: string) => t.toLowerCase().includes('pixar'))) {
                    console.log('[v8.0] Enforcing Pixar-style tags — LLM missed style extraction');
                    adData.style.veo_native_tags = ['Pixar-like 3D animation', 'Disney CGI animation style', 'cinematic 3D animation'];
                    adData.style.fps = 24;
                }
                if (isClaymation && !veoNativeTags.some((t: string) => t.toLowerCase().includes('claymation'))) {
                    console.log('[v8.0] Enforcing Claymation tags');
                    adData.style.veo_native_tags = ['claymation style', 'stop-motion animation'];
                    adData.style.fps = 12;
                }
                if (isAnime && !veoNativeTags.some((t: string) => t.toLowerCase().includes('anime'))) {
                    console.log('[v8.0] Enforcing Anime tags');
                    adData.style.veo_native_tags = ['Japanese anime style'];
                    adData.style.fps = 24;
                }

                // --- FPS ENFORCEMENT ---
                // 60fps is NEVER correct for animation — hard-cap it
                if (isAnimation && adData.style?.fps === 60) {
                    console.log('[v8.0] FPS 60 overridden for animation — setting to 24fps');
                    adData.style.fps = isPixarCGI ? 24 : isClaymation ? 12 : 24;
                }

                // --- NO_SMOOTH_INTERPOLATION ENFORCEMENT ---
                // Must be TRUE for all animation styles
                if (isAnimation && adData.audio?.no_smooth_interpolation === false) {
                    console.log('[v8.0] Enforcing no_smooth_interpolation: true for animation style');
                    adData.audio.no_smooth_interpolation = true;
                }

                // --- NEGATIVE PROMPT AUTO-INJECTOR ---
                // If negative_prompts is empty for animation, inject the correct failure-mode guards
                if (isAnimation && (!adData.negative_prompts || adData.negative_prompts.length === 0)) {
                    console.log('[v8.0] Injecting animation negative prompts — LLM left array empty');
                    if (isPixarCGI) {
                        adData.negative_prompts = ['no photorealistic rendering', 'no live-action footage style', 'no morphing or texture instability'];
                        processedNegatives = adData.negative_prompts;
                    } else if (isClaymation) {
                        adData.negative_prompts = ['No smooth motion interpolation', 'No morphing between frames', 'No subtitles or text on screen'];
                        processedNegatives = adData.negative_prompts;
                    } else {
                        adData.negative_prompts = ['no photorealistic rendering', 'no morphing', 'no subtitles'];
                        processedNegatives = adData.negative_prompts;
                    }
                }

                // --- COMPILED PROMPT WORD-COUNT GUARD ---
                // If the LLM wrote one sentence (< 60 words), it failed the synthesis rule. Flag it.
                const compiledWordCount = compiledPrompt.trim().split(/\s+/).length;
                if (compiledWordCount < 60) {
                    console.warn(`[v8.0 QUALITY GATE] compiled_master_prompt FAILED word count: ${compiledWordCount} words (min: 120). Flagging.`);
                    // Append a warning tag to signal failure — do not silently pass through a bad prompt
                    adData._quality_flags = { prose_word_count: compiledWordCount, prose_gate_passed: false };
                } else {
                    adData._quality_flags = { prose_word_count: compiledWordCount, prose_gate_passed: true };
                }

                const veoPrompt = compiledPrompt.trim();

                adData.engine_prompts = {
                    veo: veoPrompt
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

