import { NextRequest } from "next/server";
import { GoogleGenerativeAI, Schema } from "@google/generative-ai";
import { Groq } from "groq-sdk";
import { Anthropic } from "@anthropic-ai/sdk";
import { adCreativeSchema } from "@/lib/schemas/ad-creative";
import { medicalIllustrationSchema } from "@/lib/schemas/medical-illustration";
import { vectorIllustrationSchema } from "@/lib/schemas/vector-branding";
import { videoIllustrationSchema } from "@/lib/schemas/cinematic-video";
import { mangaCharacterSchema } from "@/lib/schemas/manga-character";
import { comicStripSchema } from "@/lib/schemas/comic-strip";
import { storyboardSchema } from "@/lib/schemas/storyboard";
import { foodIllustrationSchema } from "@/lib/schemas/food-illustration";
import { Mode, BlueprintData, GenerateRequest } from "@/types";
import { ResponseManager } from "@/lib/api-response";
import { promptService } from "@/lib/prompt-service";
import { atlasService } from "@/lib/atlas-service";
import { validateEnv } from "@/lib/env";

export const runtime = "edge";

const schemaMap: Record<Mode, Schema> = {
    ad: adCreativeSchema,
    medical: medicalIllustrationSchema,
    vector: vectorIllustrationSchema,
    video: videoIllustrationSchema,
    storyboard: storyboardSchema,
    manga: mangaCharacterSchema,
    comic: comicStripSchema,
    food: foodIllustrationSchema
};

const folderMap: Record<Mode, string> = {
    ad: "prompts",
    medical: "medical_prompts",
    vector: "vector_prompts",
    video: "video_prompts",
    storyboard: "storyboards",
    manga: "manga_prompts",
    comic: "comic_strips",
    food: "food_prompts"
};

const COMIC_FEW_SHOT = `
EXAMPLE 1 (Narrative Comic Strip):
{
  "narrative_arc": "An elderly Indian grandfather teaches his granddaughter the art of traditional kite flying on a Mumbai rooftop.",
  "art_style": "Modern Ink & Ink-wash with vibrant primary color accents",
  "lettering_style": "Open hand-drawn balloons with energetic bold text",
  "comic_panels": [
    {
      "panel_number": 1,
      "shot_type": "Wide Establishing Shot",
      "characters": "Grandfather (weathered features, white kurta) looking up; Granddaughter (10 years old, pigtails, bright T-shirt) holding a colorful 'Patang' kite.",
      "action": "Grandfather points to the sky, gesturing towards the wind direction.",
      "background": "The chaotic but beautiful Mumbai skyline at dusk, multiple other kites visible in the distance.",
      "narrative_caption": "On a breezy Mumbai evening, a tradition is passed down.",
      "dialogue": "Look, Meera! The wind is finally on our side."
    },
    {
      "panel_number": 2,
      "shot_type": "Extreme Close-up",
      "characters": "Granddaughter looking intensely focused, slight sweat on brow.",
      "action": "She grips the spool tightly, eyes narrowed.",
      "background": "Blurred rooftop.",
      "thought_bubble": "I can't let it dip. Not today!",
      "onomatopoeia": "WHIRRRR"
    }
  ],
  "layout_type": "grid",
  "production_credits": "Writer: Aryan Srivastava\nArtist: Meera Joshi\nColorist: Rahul Varma",
  "negative_prompt": "labels, arrows, captions, bad anatomy"
}

EXAMPLE 2 (Educational Medical Comic):
{
  "narrative_arc": "A young patient named Priya learns about her upcoming kidney biopsy from her nephrologist.",
  "art_style": "Clean vector-style educational comic, bright and approachable",
  "lettering_style": "Rounded sans-serif bubbles, friendly professional tone",
  "comic_panels": [
    {
      "panel_number": 1,
      "shot_type": "Medium Shot",
      "characters": "Dr. Mehta (Indian male, mid-40s, stethoscope) smiling reassuringly; Priya (Indian girl, 12, glasses, striped shirt) looking curious.",
      "action": "Dr. Mehta shows Priya a pamphlet about kidney health.",
      "background": "Modern clinical office with anatomical posters.",
      "narrative_caption": "Priya visits her nephrologist to discuss her care plan.",
      "dialogue": "Hello Priya, we need to do a kidney biopsy tomorrow to see how your kidneys are doing."
    },
    {
      "panel_number": 2,
      "shot_type": "Close-up",
      "characters": "Priya looking slightly nervous, finger to her chin.",
      "action": "She looks down at the biopsy pamphlet.",
      "background": "Soft blue clinical background.",
      "thought_bubble": "A biopsy? That sounds a little bit scary...",
      "dialogue": "Will it hurt, Dr. Mehta?"
    }
  ]
}
`;

const MANGA_FEW_SHOT = `
EXAMPLE 3 (Archie-Style Teen Comedy):
{
  "narrative_arc": "Rohan (Archie-type) and his friends share a funny moment at a Mumbai 'Chaat' stall.",
  "art_style": "Archie-style clean lineart, flat vibrant colors, expressive facial features",
  "lettering_style": "Comic-style uppercase sans-serif with bold emphasis",
  "comic_panels": [
    {
      "panel_number": 1,
      "shot_type": "Medium Shot",
      "characters": "Rohan (orange-brown messy hair, striped polo shirt, freckles) grinning widely; Ananya (black hair, white blazer, laughing); Kabir (black hair, jacket, smirking).",
      "action": "Rohan is trying a very spicy pani puri and his face is turning red.",
      "background": "Vibrant Mumbai street at dusk, blurred crowds.",
      "narrative_caption": "Friday nights at the local stall are always... adventurous.",
      "dialogue": "I... I think I just saw the sun inside my mouth!"
    },
    {
      "panel_number": 2,
      "shot_type": "Extreme Close-up",
      "characters": "Rohan with steam metaphorically coming out of his ears, eyes bulging.",
      "action": "Drinking water frantically.",
      "background": "Orange dot-pattern background (pop-art style).",
      "onomatopoeia": "GULP! GULP!",
      "thought_bubble": "Too much chutney! Way too much chutney!"
    }
  ],
  "layout_type": "splash",
  "production_credits": "Script: Aryan Srivastava | Pencils: Meera Joshi | Colors: Rahul Varma"
}

EXAMPLE 1 (Legendary Manga Grid):
{
  "manga_subject": "Young Indian man with sharp features and messy black hair, using provided image as face reference.",
  "layout": "3x3 grid layout (nine panels)",
  "panels": [
    { "panel_number": 1, "universe": "One Piece", "art_style": "Eiichiro Oda's bold lines, exaggerated expressions", "outfit": "Straw Hat pirate vest and sash", "environment": "Deck of a wooden ship, blue sea" },
    { "panel_number": 2, "universe": "Dragon Ball Z", "art_style": "Akira Toriyama's angular muscle definition, spiky hair", "outfit": "Orange martial arts gi", "environment": "Rocky wasteland with floating mountains" }
  ]
}

EXAMPLE 2 (Character Model Sheet Matrix):
{
  "manga_subject": "Young South Asian woman with glasses and a professional blazer.",
  "is_model_sheet": true,
  "panels": [
    { "panel_number": 1, "pose": "Standing Neutral", "angle": "Frontal Full Body", "expression": "Confident Smile", "art_style": "High-fidelity modern anime lineart", "outfit": "Charcoal blazer, white shirt", "environment": "Studio neutral gray" },
    { "panel_number": 2, "pose": "Pointing Forward", "angle": "3/4 Profile", "expression": "Serious Focus", "art_style": "High-fidelity modern anime lineart", "outfit": "Charcoal blazer, white shirt", "environment": "Studio neutral gray" }
  ]
}
`;

const MEDICAL_FEW_SHOT = `
EXAMPLE 1 (Perfect NEJM Clinical Illustration):
{
  "scientific_subject": "Dermatological manifestation of Systemic Lupus Erythematosus (SLE) on South Asian skin tone.",
  "layout_composition": "side-by-side-comparison",
  "illustration_style": "clean-surgical-sketch",
  "visual_accuracy": {
    "textures": "Stippled epidermal texture with localized follicular plugging and fine scaling.",
    "lighting": "diffused-lab-lighting",
    "tissue_physics": "Subsurface scattering specifically for Fitzpatrick Type IV skin, subtle erythema (purple-tinged inflammation).",
    "anatomical_keys": "Malar rash (butterfly distribution) with distinct borders, sparing the nasolabial folds.",
    "labeling_safe_zones": "Vertical margin on the right."
  },
  "journal_standard": "NEJM-classic",
  "negative_prompt": "ZERO TEXT POLICY. No labels, no arrows, no medical hardware, no blood, no simplistic cartoon shading.",
  "consistent_character": "Female-Subject-B",
  "visual_theme": "Anatomy-White-Background"
}

EXAMPLE 2 (Perfect BioRender Schematic):
{
  "scientific_subject": "T-Cell activation pathway in the lymphatic microenvironment.",
  "layout_composition": "linear-process-flow",
  "illustration_style": "biorender-scientific-vector",
  "visual_accuracy": {
    "textures": "Matte plasticine cellular membranes, granulated cytoplasm, translucent organelle layering.",
    "lighting": "even-ambient-clean",
    "tissue_physics": "Volumetric soft glow for receptor binding events, matte finish for protein complexes.",
    "anatomical_keys": "MHC-II complex on dendritic cell, T-cell receptor (TCR) engagement, cytokine release nodes.",
    "labeling_safe_zones": "Uniform spacing around all cellular assets."
  },
  "journal_standard": "BioRender-standard",
  "negative_prompt": "ZERO TEXT POLICY. No captions, no numbers, no leader lines, no vibrant-neon gradients.",
  "consistent_character": "No-Human-Figure",
  "visual_theme": "BioRender-Pastel"
}

EXAMPLE 3 (High-Impact Nephrology Infographic):
{
  "scientific_subject": "Renal Pathophysiology: Multi-panel diagram showing Whole Kidney macro-view, Cortex/Medulla tissue section, and Glomerular Filtration detail.",
  "layout_composition": "micro-macro-inset",
  "illustration_style": "biorender-mechanism-action",
  "visual_accuracy": {
    "textures": "Smooth semi-translucent renal tubules, detailed podocyte foot processes, delicate glomerular basement membrane.",
    "lighting": "even-ambient-clean",
    "tissue_physics": "Soft subsurface scattering for organ tissue, high specularity on bloodstream capillaries.",
    "anatomical_keys": "Cortex, Medulla, Glomerulus closeup, Efferent arteriole, Proximal convoluted tubule.",
    "labeling_safe_zones": "Clearance for signal pathway arrows and pharmacological tags."
  },
  "pharmacological_tags": ["RAAS inhibitor", "SGLT2 inhibitor", "GLP-1RA", "Non-steroidal MRA"],
  "pathway_markers": true,
  "journal_standard": "BioRender-standard",
  "negative_prompt": "No low-resolution, no inaccurate anatomy, no blood-horror, no vibrant-neon, no grids.",
  "consistent_character": "No-Human-Figure",
  "visual_theme": "Systemic-Pathogenesis"
}
`;

const JSON_PROMPTING_PHILOSOPHY = `
JSON PROMPTING PHILOSOPHY:
1. PRODUCTION-GRADE PHASING: Structure prompts in phases (Phase 1: Composition/Geometry, Phase 2: Materiality/Lighting, Phase 3: Brand/Finish).
2. DERMATOLOGICAL ACCURACY: For Indian/South Asian subjects (Fitzpatrick III-VI), describe inflammation as "purple-tinged" or "darkening" rather than "bright red."
3. TISSUE PHYSICS: Describe biological light behavior: "subsurface scattering in flesh", "fine vellus hair", "high-specularity mucosal reflection".
4. HARDWARE FIDELITY: Use specific hardware cues: "iPhone 16 Pro Max rear camera" for UGC or "Hasselblad 100mm Macro" for product hero shots.
5. MATERIAL ACCURACY: Describe textures exhaustively: "terry cloth loops", "Western Red Cedar grain", "matte cardboard", "high-gloss label condensation".
6. IDENTITY LOCK: All human subjects MUST be of Indian descent (South Asian features, warm skin tones, authentic Indian styling).
7. COMPOSITIONAL RHYTHM: Use "Visual Rhythm" for grids and "The Sandwich Effect" to interweave subjects with graphic elements.
8. ZERO TEXT BEYOND BLUEPRINT: Avoid random text hallucinations. Only include exact text specified in the schema.
`;

const AD_FEW_SHOT = `
EXAMPLE 1 (Nano Banana Hyperrealism):
{
  "core_prompt": "A ripe yellow banana resting on a reflective glass surface with natural imperfections and subtle bruises.",
  "lighting": "soft-natural-daylight",
  "camera_settings": {
    "lens": "100mm-macro",
    "shot_type": "extreme-close-up",
    "aesthetic": "high-end-editorial"
  },
  "negative_prompt": "low quality, blurry, text, watermark",
  "aspect_ratio": "4:5"
}
`;

const VIDEO_FEW_SHOT = `
EXAMPLE 1 (Cinematic Storytelling):
{
  "description": "A dark-haired Indian detective in a futuristic, weathered trench coat stands on a rain-slicked rooftop, looking over a neon-lit Neo-Mumbai skyline.",
  "style": "Cinematic Noir, gritty cyberpunk realism",
  "camera": "Wide shot, slow pull-back for reveal",
  "lens": "35mm Anamorphic, bokeh effect",
  "lighting": "Cool blue ambient hues with harsh pink neon rim lighting",
  "environment": "Rooftop in Neo-Mumbai; midnight; heavy rain; moving hover-traffic in distant background",
  "audio": "Deep synth pad with rhythmic electronic hum, heavy rain, distant cyber-sirens",
  "elements": ["Indian detective", "weathered trench coat", "Neo-Mumbai skyline", "holographic ads", "rain droplets"],
  "motion": "Detective adjusts collar; rain droplets slide down the leather coat; coat flapping slightly in rooftop wind",
  "ending": "Camera pulls back into a wide landscape shot as a corporate drone sweeps its searchlight across the frame.",
  "text": "none",
  "keywords": ["mystery", "cyberpunk", "noir", "cinematic", "future-india"]
}

EXAMPLE 2 (Dior-Style High Fashion Adaptation):
{
  "description": "A graceful Indian model in a flowing gold silk gown walking through a lush Himalayan valley at golden hour.",
  "style": "High-end editorial fashion film, ethereal lighting",
  "camera": "Handheld tracking shot, low-angle, following the model's movement",
  "lens": "85mm Portrait lens, shallow depth of field",
  "lighting": "Natural golden hour sun, soft backlighting creating a halo effect",
  "environment": "Emerald green slopes of a Himalayan valley, snow-capped peaks in the distance, wildflowers in foreground",
  "audio": "Soft orchestral swell, wind rustling through grass, distant bird calls",
  "elements": ["Indian fashion model", "gold silk gown", "Himalayan peaks", "wildflowers", "soft sunlight"],
  "motion": "Fabric of the gown billowing in the breeze; model turns slightly to look into the lens with a confident gaze",
  "ending": "Model walks towards the horizon as the screen softly fades to a warm white glow.",
  "text": "CHANEL",
  "keywords": ["luxury", "fashion", "nature", "gold", "ethereal"]
}
`;

const STORYBOARD_FEW_SHOT = `
EXAMPLE 1 (Cinematic Video Storyboard):
{
  "total_project_duration": "64 seconds",
  "scenes": [
    {
      "scene_number": 1,
      "shot_duration": "8 seconds",
      "visual_prompt": "Wide establishing shot of a futuristic Neo-Mumbai skyline at dusk.",
      "narration_vo": "Mumbai. 2099. A city that never sleeps, but always dreams.",
      "motion_instruction": "Slow drone pull-back"
    }
  ]
}

EXAMPLE 2 (Comic Thumbnail Storyboard):
{
  "total_project_duration": "1 Page Strip",
  "scenes": [
    {
      "scene_number": 1,
      "shot_duration": "Wide Top",
      "visual_prompt": "Arjun leaping from a rooftop, cape billowing in the wind.",
      "narration_vo": "CAPTION: High over the city, justice takes flight.",
      "motion_instruction": "WHIRRRR - Grappling line SFX"
    }
  ]
}
`;

export async function POST(req: NextRequest) {
    validateEnv();
    try {
        const body: GenerateRequest = await req.json();
        const { mode = "ad", brief, image, previousImage, parentPrompt, isStoryboard, style = "" } = body;

        if (!brief && !image) {
            return ResponseManager.badRequest("No brief or image provided");
        }

        const currentSchema = (mode === 'comic' && isStoryboard) ? comicStripSchema : (isStoryboard ? storyboardSchema : schemaMap[mode]);

        let domainInstruction = JSON_PROMPTING_PHILOSOPHY + "\n";
        if (mode === "ad") {
            domainInstruction += `You are an Elite Performance Creative Director and Production Art Director. 
            CORE MISSION: Transform raw briefs into scroll-stopping, high-production-value ad creatives.

            PRODUCTION PROTOCOL:
            1. THE SANDWICH EFFECT: Interweave the subject with graphic elements. Some parts hidden behind blocks, others overlapping to create 3D depth.
            2. PRODUCT IS THE HERO: Product must be the sharpest, most lit element. Exhaustive material description (e.g., "high-gloss label," "matte bottle finish").
            3. ADVANCED LIGHTING: Use "rim-lit anatomical," "moody rim lighting," or "soft-box studio lighting" to accentuate rich textures.
            4. IDENTITY LOCK: Use Indian everyday people (South Asian heritage). Natural styling, no heavy influencer glam.
            5. DYNAMIC SUBJECT LOGIC: Use "Visual Rhythm" in compositions. High-end social media lifestyle aesthetic meets commercial polish.
            6. SOPHISTICATED MUTED PALETTES: Use desaturated "dusty" versions of brand colors (e.g., sage green vs mint, slate blue vs royal blue).
            
            STYLE PALETTES:
            - Outdoor/Rugged: Earthy tones (forest green, rust, mud brown).
            - Beauty/Wellness: Soft warm tones (peach, ivory, blush).
            - Tech/Minimal: Cool tones (charcoal, slate, clean daylight).
            - Home/Living: Warm neutrals (linen, oak, soft window light).
            
            ${AD_FEW_SHOT}`;
        } else if (mode === "vector") {
            domainInstruction = `You are a Principal Brand Designer specialized in Scalable Vector Illustrations. 
            RULES:
            1. GEOMETRY: Define clear geometric logic (corners, angles, symmetry).
            2. STROKE: Specify uniform vs variable stroke weights.
            3. STYLE: Use premium frameworks like Isometric 2.5D or Bold Minimalist.
            4. IDENTITY: Any human assets MUST be Indian descent (South Asian features).
            
            ${MEDICAL_FEW_SHOT.split('EXAMPLE 2')[1].replace('}', '}\n')} (Vector Reference)`;
        } else if (mode === "video") {
            const isPhysical = style.toLowerCase().includes('stop-motion') || style.toLowerCase().includes('claymation') || style.toLowerCase().includes('puppet') || style.toLowerCase().includes('paper-cut');
            domainInstruction = `You are a Google Veo 3 & FLUX.2 [klein] JSON Blueprint Generator. 
            CORE PERFORMANCE: You are designing for a 9B parameter rectified flow transformer capable of sub-second rendering.
            IDENTITY: All human subjects MUST be of Indian descent (South Asian features, warm skin tones, modern Indian styling).
            
            RULES:
            1. Use a consistent format. Never deviate from the layout provided.
            2. Language: Mandatory cinematic, specific, and visually rich language. Avoid generic terms.
            3. Structure: Follow the mandatory flat JSON structure: description, style, camera, lens, lighting, environment, audio, elements, motion, ending, text, keywords.
            4. Detail: Leverage FLUX.2's high-speed inference by providing dense, high-contrast visual cues.
            
            ${isPhysical ? "MEDIUM: 1:12 Miniature world. MACRO: High detail with visible fingerprints and clay textures." : ""}
            
            ${VIDEO_FEW_SHOT}`;
        } else if (mode === "manga") {
            domainInstruction = `You are a Manga Master Artist. 
            MISSION: Create a 3x3 grid (9 panels) where a single face reference is adapted into 9 different manga universes.
            IDENTITY: The subject MUST be of Indian descent (South Asian features, warm skin tones).
            CONSISTENCY: Ensure the "recognizable face" is the anchor across all styles.
            UNIVERSES: Use iconic worlds (e.g., Naruto, Bleach, Jojo, Studio Ghibli, Akira, Sailor Moon, Demon Slayer, etc.).
            
            ${MANGA_FEW_SHOT}`;
        } else if (mode === "comic") {
            if (isStoryboard) {
                domainInstruction = `You are a Graphic Novel Scriptwriter & Director.
                MISSION: Generate a MULTI-PAGE GRAPHIC NOVEL (E-Book) storyboard.
                SCENE STRUCTURE:
                - Use comic_pages[].
                - Each page should have 2-5 panels.
                - For each panel: shot_type, characters, action, background, and dialogue.
                
                IDENTITY LOCK: Define a clear 'consistent_character' (Indian descent). This is the absolute anchor for every page.
                
                STYLE: Cinematic, high-impact graphic novel aesthetics.
                
                ${COMIC_FEW_SHOT}
            `;
            } else {
                domainInstruction = `You are a Master Comic Scriptwriter & Director (ImagineArt / CSP Expert).
                MISSION: Generate a Marvel-tier vivid comic [comic_title] and [logline].
                IDENTITY LOCK: Use 'consistent_character' to define the core visual anchor (e.g. 'Subject A'). All individual panel character descriptions MUST refer back to this anchor to maintain identity locking.
                PRODUCTION SPEC: pacing_energy (high/low), global_color_grade (Golden Hour, Retro 4-Color).
                TECHNICAL ART (Mandatory per panel): lettering_weight (Action/Whimsy), onomatopoeia (aggressive SFX), visual_texture (Ben-Day, Slanted).
                
                ETHNICITY: All characters MUST be of Indian descent (South Asian features).
                
                ${COMIC_FEW_SHOT}`;
            }
        } else {
            domainInstruction = `You are a PhD Medical Illustrator specializing in South Asian Clinical Accuracy. 
            CORE MISSION: Anatomical and dermatological precision for high-impact journals (Nature, NEJM, BioRender).
            
            IDENTITY & CLINICAL ACCURACY: 
            1. All patients, surgical teams, and clinical subjects MUST be of Indian descent (South Asian features).
            2. DERMATOLOGICAL PRECISION: Accurately represent skin pathologies on South Asian skin tones (Types III-VI on the Fitzpatrick scale). Emphasize authentic hyperpigmentation, inflammation markers, and skin texture.
            3. TISSUE PHYSICS: Define mucosal reflections, subsurface scattering in flesh, and fibrous vs aqueous grain.
            
            JOURNAL STANDARDS:
            - BioRender: Clean, plasticine 2.5D surfaces, matte textures, pastel clinical palettes, high-contrast asset isolation.
            - NEJM: Technical stippling, soft watercolor-style layering, muted 'classic textbook' tonal shifts. Use 'Ghosted Silhouette Anchor' for truncal anatomy.
            - Nature: Volumetric transparency, vibrant biological glows (bioluminescence), cellular-level physics.
            
            NEJM EDITORIAL PROTOCOLS:
            1. GHOSTED SILHOUETTE: Use a translucent Indian human silhouette (20% opacity) as the base anchor. 
            2. TRANSLUCENT OVERLAY: Render internal anatomy visible through skin with technical stippling.
            3. INHIBITION LOGIC: Use 'T-bars' and 'X' nodes to illustrate pharmacodynamic blocking.
            4. 2.5D DEPTH: Apply micro-contact shadows and "Halogen Halos" to activated immune cells.
            5. LUMINOUS LUMEN/MATRIX: Internal soft-glow light for heart chambers and organelle interiors (Matrix/Cristae).
            6. MULTI-MODAL BLEND: Integrate 2.5D assets with 2D charts, EKG strips, or 3D technical protein ribbons.
            7. MOLECULAR BLUEPRINT: Muted color-coding for DNA/Proteins (Teal, Mauve, Peach).
            8. MORPHOLOGICAL ODYSSEY: Illustrate state-changes (Platelet activation) and intracellular flows (ER -> Golgi -> Surface).
            9. GHOSTED APPARATUS: Medical machinery (MRI, Robots) at 10-15% opacity.
            10. THE ID BUBBLE: High-contrast circular inset for identification within a complex field.
            11. PANELIZED MODULAR: Construct 4-grid "Infographic Stories" with unified titles.
            
            STRICT RULE: Focus on 'anatomical_keys' that a specialist would verify. NEVER add medical hardware unless explicitly requested.
            
            ${MEDICAL_FEW_SHOT.split('EXAMPLE 2')[0]}`;
        }

        // --- Atlas Integration ---
        if (mode === "medical") {
            const atlasContext = atlasService.getAtlasContext(brief);
            const styleProtocol = atlasService.getStyleProtocol(style);
            domainInstruction += atlasContext + styleProtocol;
        }

        let systemPrompt = domainInstruction + (isStoryboard && mode === 'video' ? ` Break down a script into exactly 8 segments of 8 seconds each for a cinematic 64-second production.` : ` ZERO TEXT POLICY.`);

        const userPrompt = parentPrompt
            ? `BASELINE JSON: ${JSON.stringify(parentPrompt)}. MODIFICATION REQUEST: "${brief}"`
            : `Generate a technical ${isStoryboard ? "STORYBOARD" : "JSON BLUEPRINT"} for this ${mode} brief: ${brief}. ${style ? `\n\nSTYLE: ${style}` : ""}`;

        const activeImage = image || previousImage;
        const inlineImageData = activeImage ? {
            inlineData: { data: activeImage.split(",")[1] || activeImage, mimeType: "image/png" }
        } : null;

        let adData: BlueprintData | null = null;
        let lastError: Error | null = null;

        const geminiApiKey = process.env.GEMINI_API_KEY;
        if (geminiApiKey) {
            const genAI = new GoogleGenerativeAI(geminiApiKey);
            const geminiModels = ["gemini-2.0-flash", "gemini-1.5-pro"];

            for (const modelName of geminiModels) {
                try {
                    const model = genAI.getGenerativeModel({
                        model: modelName,
                        generationConfig: { responseMimeType: "application/json", responseSchema: currentSchema }
                    });
                    const promptPieces: (string | { inlineData: { data: string; mimeType: string } })[] = [systemPrompt, userPrompt];
                    if (inlineImageData) promptPieces.push(inlineImageData);
                    const result = await model.generateContent(promptPieces);
                    adData = JSON.parse(result.response.text()) as BlueprintData;
                    if (adData) break;
                } catch (err) {
                    lastError = err as Error;
                }
            }
        }

        if (!adData && process.env.GROQ_API_KEY) {
            try {
                const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
                const completion = await groq.chat.completions.create({
                    messages: [
                        { role: "system", content: systemPrompt + " Return JSON matching: " + JSON.stringify(currentSchema) },
                        { role: "user", content: userPrompt }
                    ],
                    model: "llama-3.3-70b-versatile",
                    response_format: { type: "json_object" }
                });
                adData = JSON.parse(completion.choices[0]?.message?.content || "{}") as BlueprintData;
            } catch (err) { lastError = err as Error; }
        }

        if (!adData) {
            return ResponseManager.error(`All models exhausted. Last Error: ${lastError?.message}`, 429);
        }

        // Persistence in Library
        const subject = (adData.scientific_subject || adData.core_prompt || adData.illustration_subject || "new-generation");
        const filename = `${subject.substring(0, 15).toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`;

        await promptService.savePrompt({
            name: filename,
            type: mode,
            content: adData
        });

        return ResponseManager.success({
            data: adData,
            promptFile: filename,
            folder: folderMap[mode] || "prompts"
        });

    } catch (error) {
        console.error("Critical Multi-AI Error:", error);
        return ResponseManager.error((error as Error).message);
    }
}
