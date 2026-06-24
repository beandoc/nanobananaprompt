import { HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { adCreativeSchema } from "../schemas/ad-creative";
import { medicalIllustrationSchema } from "../schemas/medical-illustration";
import { vectorIllustrationSchema } from "../schemas/vector-branding";
import { storyboardSchema } from "../schemas/storyboard";
import { comicStripSchema } from "../schemas/comic-strip";
import { mangaCharacterSchema } from "../schemas/manga-character";
import { videoIllustrationSchema } from "../schemas/cinematic-video";
import { foodIllustrationSchema } from "../schemas/food-illustration";
import { infographicSchema } from "../schemas/infographic";

export const schemaMap: Record<string, any> = {
  ad: adCreativeSchema,
  medical: medicalIllustrationSchema,
  vector: vectorIllustrationSchema,
  video: videoIllustrationSchema,
  storyboard: storyboardSchema,
  manga: mangaCharacterSchema,
  comic: comicStripSchema,
  food: foodIllustrationSchema,
  infographic: infographicSchema,
};

export const creativeProtocols: Record<string, string> = {
  ugc: `\nUGC CREATIVE PROTOCOL:\n- Aesthetic: Raw, candid, shot on mobile device.\n- Lighting: Natural, imperfect, multi-directional ambient light.\n- Texture: Pores visible, authentic fabric folds.\n`,
  editorial: `\nHIGH-END EDITORIAL PROTOCOL:\n- Aesthetic: Vogue/Harper's Bazaar style, extremely polished.\n- Lighting: Cinematic moody-rim or softbox beauty lighting.\n`,
  ecom: `\nCLEAN E-COMMERCE PROTOCOL:\n- Aesthetic: Minimalist, Apple/Dyson style, distraction-free.\n- Lighting: Bright-diffused daylight, sharp shadow definition on product.\n`,
};

export const agentConfigs: Record<string, any> = {
  ad: {
    expansionRole: "Elite Art Director and Prompt Engineer",
    expansionRules: ["1. IDENTITY: South Asian heritage only.", "2. SENSORY: Use rich texture keywords."],
    jsonRole: "High-Performance DTC Ad Director",
    jsonInstructions: (style: string) => `CORE DIRECTIVE: Convert brief into Ad JSON. Style: ${style}.`,
  },
  medical: {
    expansionRole: "Sovereign Medical Visual Grammar Engine (v33.0 - SPATIO-LINGUISTIC MASTER)",
    expansionRules: [
      "1. SPATIAL COMPOSITION: Do NOT default to 3 panels. Use the most effective layout for the brief. If a single focused view is best, use it. If multiple perspectives are needed, describe them relative to each other (e.g., 'Inset', 'Adjacent', 'Foreground').",
      "2. STYLE PROTOCOL: Specify a clean, matte plasticine 2.5D BioRender style with soft clinical colors and a clean scientific background.",
      "3. SENSORY DEPTH: Describe anatomical subjects using visual textures (e.g., 'glistening myocardial tissue', 'pearlescent valves'). Apply the Identity Lock (South Asian/Indian descent) if and only if human figures (patients, surgeons) are explicitly requested in the brief. Do not introduce physicians or observers otherwise.",
      "4. SPATIAL LANGUAGE: Replace all coordinates and x/y mentions with relative anatomical terms: Superior, Inferior, Lateral, Medial, Superficial, Deep, Anterior, Posterior, Foreground, Background.",
      "5. ABSOLUTE NEGATIVE PROMPT: Conclude with: 'Negative Constraints: Absolutely zero typography, no text, no alphabet characters, no written labels, no numeric markers, no photorealism, no arrows, no line diagrams, no clinical staff. Keep lighting scientific and clean.'",
      "6. ZERO DIAGRAM ELEMENT LEAKS: Focus 100% on the anatomical and tissue structures. Do NOT describe conceptual diagram lines, arrows, callout shapes, or floating text titles (like 'Genetic Predisposition')."
    ],
    jsonRole: "Director of Dynamic Clinical Physics",
    jsonInstructions: (style: string) => {
      const styleLock = style.toLowerCase().includes("nejm") || style.toLowerCase().includes("journal") || style.toLowerCase().includes("scholarly") ? "SCHOLARLY_NEJM" : "BIORENDER_MODERN";
      return `### SOVEREIGN v34.0 MEDICAL ILLUSTRATION PROTOCOL
1. HERO LAYER: You MUST populate 'diffusion_synthesis' FIRST. It is the absolute authority for rendering.
2. SPATIAL MAPPING: Use ONLY natural language for positioning. NO coordinates. Use terms like 'superior to', 'lateral to', 'floating within'.
3. IDENTITY: Mandate South Asian (Indian) descent in diffusion_synthesis only when human subjects (e.g. patients, surgeons) are explicitly requested in the brief. If the brief is purely microscopic, cellular, or tissue pathology, do not include any physicians or human figures. Ensure no arrows or text tags exist in the master_prompt.
4. ARCHITECTURE: Choose the layout (Unified vs Multi-panel) based ONLY on the brief. No hardcoded 3-section bias.
5. SCALE-LOCK: Enforce single-scale consistency unless a zoom-inset is explicitly requested. CRITICAL — SCALE RULES: Wire-loop lesions, endocapillary proliferation, fibrinoid necrosis, crescents, mesangiolysis, tubular atrophy, foam cells = ALWAYS light microscopy / H&E scale. NEVER describe these as TEM or electron microscopy. Only use TEM if the brief explicitly requests foot process effacement at ultrastructural/nanometer scale. Default glomerular disease = light microscopy.
6. GEOMETRIC FIDELITY: Use anatomically correct primitives described in words.
7. SENSORY RICHNESS: Maintain 250-300 word density in 'diffusion_synthesis.master_prompt'. 100% descriptive migration required.
8. SCIENTIFIC CAUSALITY (NEW — CRITICAL): 'master_prompt' MUST contain three scientific strata:
   a) WHAT: The anatomical subject and its normal structure (e.g., "the glomerular basement membrane, normally a trilaminar structure").
   b) MECHANISM: The pathophysiological process at play (e.g., "advanced glycation end-products cross-link type IV collagen, expanding the mesangial matrix").
   c) VISUAL CONSEQUENCE: How the mechanism manifests visually (e.g., "rendered as irregular thickening of the membrane, pale grey and homogeneous, devoid of its normal laminated architecture").
9. MEDICAL_CONTENT FIDELITY: Populate 'medical_content.pathophysiology_cascade' as an ordered causal chain (minimum 3 steps). Populate 'medical_content.cellular_markers' with at least 3 specific proteins or cell types relevant to the disease.
10. BIOLOGICAL_GRAPH PRECISION: Populate 'biological_graph.entities' with typed entries (type: 'cell', 'protein', 'tissue', 'organ'). Each interaction MUST specify relationship type (e.g., 'activates', 'inhibits', 'secretes', 'damages', 'infiltrates').`;
    },
    subjectPath: "metadata.subject",
    stylePath: "metadata.journal_standard",
    styleSuffix: "v33.0_ILLUSTRATION",
  },
  infographic: {
    expansionRole: "Principal Visual Abstract Director — Scholarly Plate Protocol v4.0",
    expansionRules: [
      "RULE 1 — STYLE DISPATCH (P0): Identify the journal standard first: CJASN, NEJM, or Nature Flow.",
      "RULE 2 — CJASN BLUE STANDARD: Use 'Cobalt Blue' primary color, 'high-contrast vector icons', 'academic serifs', and a 'linear 3-stage vertical flow'. Muted grey borders.",
      "RULE 3 — NEJM DENSE SLAB: Use 'Navy and Muted Gold', 'heavy slab typography headers', 'dense columnar layout (3 columns)', and 'South Asian patient silhouettes' specifically in the population sidebar.",
      "RULE 4 — NATURE FLOW / WCN: Use 'Mint and Emerald gradients', 'curved flow pathways', 'modern minimalist glyphs', and 'ultra-wide aspect ratio' with a focal center mechanism icon.",
      "RULE 5 — DATA DENSITY: Every clinical statistic (HR, 95% CI, p-value) MUST be woven into the descriptive prose using specific data markers.",
      "RULE 6 — PROSE SYNTHESIS (MIN 150 WORDS): master_prompt must be a continuous scholarly narrative. DO NOT dump tags. Describe the panels as a spatially arranged visual journey.",
      "RULE 7 — NO HEX CODES: Use descriptive color language like 'Dusky Cobalt', 'Burnished Gold', or 'Clinical Mint'.",
    ],
    jsonRole: "Director of High-Impact Visual Abstracts (v4.0)",
    jsonInstructions: (style: string) => `### SVAE v4.0 STYLE-AWARE PROTOCOL
STYLE SELECTED: ${style}

1. SCHEMA: Populate journal_standard as: "CJASN_Blue_Standard", "NEJM_Dense_Slab", or "Nature_Flow_WCN".
2. RENDER LANGUAGE: Add style-specific cues to render_language.
  CJASN: ["Cobalt Blue theme", "high-contrast lines", "linear flow"]
  NEJM: ["Dense slab typography", "Navy and Gold", "columnar slabs"]
  Nature: ["Minimalist glyphs", "Mint/Emerald accents", "curved pathways"]
3. HERO: master_prompt must be 150-250 words of scholarly prose. ZERO bullet points.
4. IDENTITY: South Asian patient silhouettes for all population data.`,
  },
  vector: {
    expansionRole: "Principal Brand Designer",
    expansionRules: ["1. IDENTITY: South Asian heritage only.", "2. AESTHETIC: Clean geometric lines."],
    jsonRole: "Master Brand Architect",
    jsonInstructions: (style: string) => `CORE DIRECTIVE: Convert brief into Vector JSON. Style: ${style}.`,
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
      "RULE 12 — THE STYLE MATRIX (V9.1 — UI SYNC): You MUST map these specific UI labels to their Veo native equivalents:",
      "  - Cinematic Noir → 'high-contrast 35mm film look, crushed blacks, noir atmosphere'.",
      "  - High-Fashion Editorial → '8k editorial photography, high-gloss materials, 85mm portrait lens'.",
      "  - Cyberpunk Neon Burst → 'neon lights, saturated secondary colors, wet rain-lashed pavement'.",
      "  - Handheld Documentary 16mm → 'shot on 16mm film, handheld documentary camera shake'.",
      "  - Anamorphic 8K Widescreen → 'anamorphic widescreen flare, ultra-wide cinematic aspect ratio'.",
      "  - [PRO] Luxury Wellness → 'bright airy lighting, low contrast, stable gimbal-smooth motion'.",
      "  - [ANIMATED] Pixar/Disney CGI → 'Pixar-like 3D animation, subsurface scattering skin textures'.",
      "  - [ANIMATED] Studio Ghibli → 'Ghibli-inspired aesthetic, hand-painted watercolor textures'.",
      "  - [ANIMATED] Anime Action (Shonen) → 'Japanese anime style, dynamic motion lines, high-intensity'.",
      "  - [ANIMATED] Claymation/Stop Motion → 'claymation style, stop-motion animation, 12fps stuttered motion'.",
      "  - [PRO] Drone Cinematic → 'wide-angle aerial drone shot, high-altitude stable drift'.",
      "RULE 13 — THE 3-BEAT ARC (CRITICAL): Every 8s clip MUST have 3 causal beats (Start, Middle, End). If you only provide 2 beats, the model will improvise in the middle-third. Explicitly define the transition from Beat 1 to Beat 2 to Beat 3.",
    ],
    jsonRole: "Chief Cinematic Engineer — Google Flow / Veo 3.1 Protocol (v9.1 — UI Synced)",
    jsonInstructions: (style: string) => `### SOVEREIGN CINEMATIC ENGINE v9.1 — UI-SYNCED PROTOCOL
STYLE SELECTED: ${style}

131. STYLE LOCK: Use verbatim tags for the UI preset: ${style}. Handle 'Cinematic Noir' with high-contrast, anamorphic 2.39:1 specs.
2. FPS SYNC: Animated = 12fps/24fps. Documentary = 24fps. Drone/Wellness = 24fps.
3. DURATION SYNC: All duration fields (veo_clip, clip_strategy, temporal_arc) MUST match. Default to 8s.
4. ACTION SEMANTICS: Use rich, specific verbs. Avoid 'crafting', 'pausing', 'resuming' without detail.
5. PHYSICS FOCUS: If workshop/Noir, describe 'volumetric light interactions' and 'motes of dust/sawdust' specifically.
6. IDENTITY: South Asian (Indian) characters only.
7. NEGATIVES: If animated → 'no photorealistic render'. If documentary → 'no digital cleaning, no 3D look'. noir → 'no warm golden lighting'.`,
  },
  manga: {
    expansionRole: "Manga Concept Artist",
    expansionRules: ["1. IDENTITY: South Asian characters only.", "2. AESTHETIC: Pro Manga inking."],
    jsonRole: "Lead Manga Editor",
    jsonInstructions: (style: string) => `CORE DIRECTIVE: Convert to Manga JSON.`,
  },
  food: {
    expansionRole: "Industrial Food Infographic Artist",
    expansionRules: ["1. IDENTITY: Indian heritage for chefs.", "2. TEXTURES: Glistening/Steam."],
    jsonRole: "Culinary Visual Director",
    jsonInstructions: (style: string) => `CORE DIRECTIVE: Convert to Food JSON. Journal: ${style}.`,
  },
  comic: {
    expansionRole: "Sequential Art Director",
    expansionRules: ["1. IDENTITY: South Asian heritage only.", "2. AESTHETIC: Pro Graphic Novel and cinematic lighting."],
    jsonRole: "Lead Comic Art Director",
    jsonInstructions: (style: string) => `CORE DIRECTIVE: Convert to Comic Script JSON.`,
  },
  storyboard: {
    expansionRole: "Storyboarding Previs Director",
    expansionRules: ["1. IDENTITY: South Asian heritage only.", "2. CONTINUITY: Consistent appearance."],
    jsonRole: "Chief Storyboard Supervisor",
    jsonInstructions: (style: string) => `CORE DIRECTIVE: Convert to Storyboard JSON.`,
  },
};

export const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

