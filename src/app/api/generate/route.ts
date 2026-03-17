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
import { Mode, BlueprintData, GenerateRequest } from "@/types";
import { ResponseManager } from "@/lib/api-response";
import { promptService } from "@/lib/prompt-service";
import { validateEnv } from "@/lib/env";

export const runtime = "edge";

const schemaMap: Record<Mode, Schema> = {
    ad: adCreativeSchema,
    medical: medicalIllustrationSchema,
    vector: vectorIllustrationSchema,
    video: videoIllustrationSchema,
    storyboard: storyboardSchema,
    manga: mangaCharacterSchema,
    comic: comicStripSchema
};

const folderMap: Record<Mode, string> = {
    ad: "prompts",
    medical: "medical_prompts",
    vector: "vector_prompts",
    video: "video_prompts",
    storyboard: "storyboards",
    manga: "manga_prompts",
    comic: "comic_strips"
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
      "dialogue": "Look, Meera! The wind is finally on our side."
    },
    {
      "panel_number": 2,
      "shot_type": "Extreme Close-up",
      "characters": "Grandfather's wrinkled, calloused hands skillfully tying the 'Manjha' thread to the kite spine.",
      "action": "Precise knot-tying, thread pulled taut.",
      "background": "Blurred rooftop floor with a wooden spool (Charkhi).",
      "onomatopoeia": "SNIP!"
    }
  ]
}
`;

const MANGA_FEW_SHOT = `
EXAMPLE 1 (Legendary Manga Grid):
{
  "manga_subject": "Young Indian man with sharp features and messy black hair, using provided image as face reference.",
  "layout": "3x3 grid layout (nine panels)",
  "panels": [
    { "panel_number": 1, "universe": "One Piece", "art_style": "Eiichiro Oda's bold lines, exaggerated expressions", "outfit": "Straw Hat pirate vest and sash", "environment": "Deck of a wooden ship, blue sea" },
    { "panel_number": 2, "universe": "Dragon Ball Z", "art_style": "Akira Toriyama's angular muscle definition, spiky hair", "outfit": "Orange martial arts gi", "environment": "Rocky wasteland with floating mountains" }
  ]
}
`;

const MEDICAL_FEW_SHOT = `
EXAMPLE 1 (Perfect Medical Blueprint):
{
  "scientific_subject": "Coronary Arterial Stent Deployment",
  "biological_context": "Intravascular cross-section of a coronary artery showing atherosclerotic plaque.",
  "illustration_style": "BioRender standard, 2.5D matte technical render, clinical soft palette",
  "visual_theme": "High-transparency vessel walls with realistic particle flow for blood cells",
  "consistent_character": "None",
  "labels_required": [],
  "aspect_ratio": "16:9"
}

EXAMPLE 2 (Perfect Vector Icon):
{
  "illustration_subject": "DNA Double Helix Abstract Logo",
  "vector_style": "Modern flat vector with geometric symmetry, bold outlines",
  "color_palette": "Indigo-600, Sky-400, White",
  "complexity_level": "Minimalist"
}
`;

const JSON_PROMPTING_PHILOSOPHY = `
JSON PROMPTING PHILOSOPHY:
1. Structured Input: Eliminate ambiguity by defining attributes separately (subject, action, environment, style).
2. Detail Precision: Specify textural details, surface properties (reflections, matte), and specific lighting directions/effects.
3. Model Adherence: Use technical terminology that aligns with AI training data (e.g., 'f/1.8', 'telephoto', 'subtle highlights').
4. Accuracy > Natural Language: Think in key-value pairs to ensure the AI understands the physical composition of the scene.
5. Iterative Refinement: Use JSON to easily adjust single parameters (like lighting or camera) without regenerating the entire context.
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

export async function POST(req: NextRequest) {
    validateEnv();
    try {
        const body: GenerateRequest = await req.json();
        const { mode = "ad", brief, image, previousImage, parentPrompt, isStoryboard, style = "" } = body;

        if (!brief && !image) {
            return ResponseManager.badRequest("No brief or image provided");
        }

        const currentSchema = isStoryboard ? storyboardSchema : schemaMap[mode];

        let domainInstruction = JSON_PROMPTING_PHILOSOPHY + "\n";
        if (mode === "ad") {
            domainInstruction += `You are an Elite Performance Creative Director. CORE MISSION: Transform mundane briefs into scroll-stopping ad creatives. 
            RULES: 
            1. PRODUCT IS THE HERO: Product must be the sharpest, most lit element. Entire product must be in frame. 
            2. RELATABLE MODELS: Use Indian everyday people (mid-30s/40s). No influencers, no jewelry, no styled hair. 
            3. FACE DE-EMPHASIS: Model's face MUST be partially cropped at top or looking down at product. 
            4. PAIN-POINT COPY: Headline must be a direct question or bold statement naming a frustration (e.g. 'STILL FREEZING?'). NO duplicate words. 
            5. COMPOSITION: Product/Subject on Right, Copy on Left (40% width). Background simple and blurry.
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
            domainInstruction = `You are a Google Veo 3 JSON Blueprint Generator. 
            CORE REQUIREMENT: All human subjects MUST be of Indian descent (South Asian features, warm skin tones, modern Indian styling).
            
            RULES:
            1. Use a consistent format. Never deviate from the layout provided.
            2. Language: Mandatory cinematic, specific, and visually rich language. Avoid generic terms.
            3. Structure: Follow the mandatory flat JSON structure: description, style, camera, lens, lighting, environment, audio, elements, motion, ending, text, keywords.
            4. Detail: If the user brief is vague, invent specific cinematic details to fill the fields (e.g. specific lenses, lighting types, and environmental physics).
            
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
            domainInstruction = `You are a Master Comic Scriptwriter & Director.
            MISSION: Generate a vivid, sequential comic strip blueprint that tells a compelling visual story.
            IDENTITY: All characters MUST be of Indian descent (South Asian features, authentic styling).
            CINEMATOGRAPHY: Vary shot types (Close-ups for emotion, Wide for scale, Dutch angles for tension).
            NARRATIVE: Ensure each panel advances the plot or character development. Use dialog and onomatopoeia to bring the page to life.
            ART DIRECTION: Define a consistent, premium comic art style for the entire strip.
            
            ${COMIC_FEW_SHOT}`;
        } else {
            domainInstruction = `You are a PhD Medical Illustrator. 
            CORE MISSION: Anatomical precision for high-impact journals (Nature, NEJM).
            IDENTITY: All patients and surgical teams MUST be Indian descent (South Asian features).
            PRECISION: Define exact tissue textures and specific 'tissue_physics' (how light reacts to biological surfaces).
            CHECKS: Emphasize 'anatomical_keys' that a specialist would look for.
            STRICT RULE: NEVER add medical devices UNLESS explicitly mentioned. 
            
            ${MEDICAL_FEW_SHOT.split('EXAMPLE 2')[0]}`;
        }

        let systemPrompt = domainInstruction + (isStoryboard ? ` Break down a script into exactly 8 segments of 8 seconds each for a cinematic 64-second production.` : ` ZERO TEXT POLICY.`);

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
