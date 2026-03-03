/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Refined Ad Creative Schema (Nano Banana 2 Optimized)
export const adCreativeSchema: Schema = {
    description: "Schema for Ad Creative prompts",
    type: SchemaType.OBJECT,
    properties: {
        core_prompt: {
            type: SchemaType.STRING,
            description: "The main subject and action. If human characters are involved, ALWAYS specify them as Indian/South Asian for brand consistency."
        },
        lighting: {
            type: SchemaType.STRING,
            enum: ["soft-natural-daylight", "golden-hour", "studio-softbox", "harsh-direct-flash", "moody-rim-lighting"]
        } as any,
        camera_settings: {
            type: SchemaType.OBJECT,
            properties: {
                lens: { type: SchemaType.STRING, enum: ["14mm-ultrawide", "35mm-documentary", "50mm-standard", "85mm-portrait", "100mm-macro"] } as any,
                shot_type: { type: SchemaType.STRING, enum: ["extreme-close-up", "medium-shot", "full-body", "overhead-flatlay"] } as any,
                aesthetic: { type: SchemaType.STRING, enum: ["ugc-iphone-selfie", "high-end-editorial", "raw-polaroid", "clean-ecom"] } as any
            },
            required: ["lens", "shot_type", "aesthetic"]
        },
        exact_text: {
            type: SchemaType.STRING,
            description: "Any exact text that must appear on the product or in the scene, wrapped in quotes."
        },
        negative_prompt: {
            type: SchemaType.STRING,
            description: "Elements to exclude. ALWAYS include: 'plastic skin, over-retouched, deformed fingers, warped text, watermarks, CGI, 3D render'."
        },
        aspect_ratio: {
            type: SchemaType.STRING,
            enum: ["1:1", "4:5", "9:16", "16:9"]
        } as any
    },
    required: ["core_prompt", "lighting", "camera_settings", "negative_prompt", "aspect_ratio"]
};

// Medical Illustration Schema (High-Impact Journal/Book Quality)
export const medicalIllustrationSchema: Schema = {
    description: "Schema for High-Impact Medical Illustrations",
    type: SchemaType.OBJECT,
    properties: {
        scientific_subject: {
            type: SchemaType.STRING,
            description: "Detailed description of the anatomical or clinical subject."
        },
        layout_composition: {
            type: SchemaType.STRING,
            enum: ["central-figure-with-callouts", "side-by-side-comparison", "micro-macro-inset", "full-body-pathology-map", "linear-process-flow", "isolated-asset-only"],
            description: "Defines the infographic arrangement. Essential for complex multi-organ views."
        } as any,
        illustration_style: {
            type: SchemaType.STRING,
            enum: ["photorealistic-electron-microscopy", "3d-medical-render", "biorender-scientific-vector", "biorender-icon-asset", "biorender-equipment-render", "biorender-musculoskeletal", "biorender-histology-layer", "biorender-pathology-comparison", "biorender-pathway-diagram", "biorender-silhouette-icon", "biorender-systemic-network", "biorender-schematic-flowchart", "biorender-gallery-layout", "biorender-multisystem-pathology", "biorender-mechanism-action", "clean-surgical-sketch", "scientific-diagram", "histology-stained"]
        } as any,
        visual_accuracy: {
            type: SchemaType.OBJECT,
            properties: {
                textures: { type: SchemaType.STRING, description: "Description of tissue textures, e.g., 'fibrous', 'aqueous', 'granulated'." },
                lighting: { type: SchemaType.STRING, enum: ["internal-bioluminescence", "diffused-lab-lighting", "microscopic-focused", "rim-lit-anatomical", "even-ambient-clean", "inflammation-glow"] } as any,
                labeling_safe_zones: { type: SchemaType.STRING, description: "Areas to leave clear for future text annotations." }
            },
            required: ["textures", "lighting"]
        },
        journal_standard: {
            type: SchemaType.STRING,
            enum: ["NEJM-classic", "Nature-modern", "Lancet-descriptive", "Gray-Anatomy-sketch", "BioRender-standard"]
        } as any,
        negative_prompt: {
            type: SchemaType.STRING,
            description: "Exclude: 'cartoonish, low-resolution, inaccurate anatomy, messy labels, blood-horror (unless surgical), vibrant-neon, text, arrows, leader-lines, annotations, grids, excessive-gradients'."
        },
        consistent_character: {
            type: SchemaType.STRING,
            enum: ["Male-Subject-A", "Female-Subject-B", "No-Human-Figure"],
            description: "Locks the physical characteristics of the human figure for textbook-wide consistency."
        } as any,
        visual_theme: {
            type: SchemaType.STRING,
            enum: ["Clinical-Neutral", "Surgical-Blue", "Anatomy-White-Background", "BioRender-Pastel", "Asset-Solo-White", "Ghosted-Anatomy", "Comparison-Split", "Pathway-Logic-Clean", "Silhouette-Blue-Medical", "Inflammation-Overlay", "Systemic-Green-Lymphatic", "Schematic-Logic-White", "Disease-Mapping-Vibrant", "Systemic-Pathogenesis", "BioRender-Warm-Tonal-Ghosting"],
            description: "Forces a consistent color palette across different images. 'BioRender-Warm-Tonal-Ghosting' uses translucent Indian skin tones instead of light gray for ghosted figures."
        } as any
    },
    required: ["scientific_subject", "layout_composition", "illustration_style", "visual_accuracy", "journal_standard", "negative_prompt", "consistent_character", "visual_theme"]
};

// Vector Branding Schema (Optimized for Corporate Styles & SVG conversion)
export const vectorIllustrationSchema: Schema = {
    description: "Schema for Vector Illustrations and Branding Assets",
    type: SchemaType.OBJECT,
    properties: {
        illustration_subject: {
            type: SchemaType.STRING,
            description: "The main subject of the vector illustration. Describe actions and objects clearly."
        },
        vector_style: {
            type: SchemaType.STRING,
            enum: ["corporate-memphis", "flat-minimalist", "isometric-clean", "bold-line-art", "gradient-tech-glass"]
        } as any,
        color_palette: {
            type: SchemaType.STRING,
            enum: ["vibrant-primary", "startup-pastel", "monochrome-slate", "high-contrast-neon", "brand-custom"]
        } as any,
        background: {
            type: SchemaType.STRING,
            enum: ["pure-white-for-vectorization", "transparent-grid-style", "solid-brand-color"]
        } as any,
        complexity: {
            type: SchemaType.STRING,
            enum: ["simple-iconic", "medium-detailed", "comprehensive-scene"]
        } as any,
        negative_prompt: {
            type: SchemaType.STRING,
            description: "Exclude: 'photorealistic, complex gradients, noisy textures, 3D shadows, motion blur, hand-drawn charcoal'."
        }
    },
    required: ["illustration_subject", "vector_style", "color_palette", "background", "complexity", "negative_prompt"]
};

// Cinematic Video Schema (Optimized for Veo/Sora/Luma 8sec sequences)
export const videoIllustrationSchema: Schema = {
    description: "Schema for Cinematic Motion and Video Generation prompts",
    type: SchemaType.OBJECT,
    properties: {
        video_subject: {
            type: SchemaType.STRING,
            description: "The core subject performing a specific 8-second sequence of actions."
        },
        motion_dynamics: {
            type: SchemaType.STRING,
            description: "Describe the speed, fluidity, and specific physical motion (e.g., 'slow-motion cell division', 'rapid water splash', 'dynamic camera orbit')."
        },
        camera_movement: {
            type: SchemaType.STRING,
            enum: ["static", "slow-push-in", "dolly-zoom", "360-orbit", "handheld-tracking", "drone-overhead", "macro-pan"],
            description: "The cinematic camera path for the 8-second shot."
        } as any,
        temporal_storyboard: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: "A 3-part breakdown of what happens at 0s, 4s, and 8s."
        } as any,
        visual_style: {
            type: SchemaType.STRING,
            description: "Art direction (e.g., 'National Geographic 8K RAW', 'Cyberpunk Neon Cinematic', 'Medical Documentary Gray-Scale')."
        },
        negative_prompt: {
            type: SchemaType.STRING,
            description: "Exclude: 'shaky camera, low framerate, flickering, distorted faces, text, watermarks, morphing artifacts'."
        }
    },
    required: ["video_subject", "motion_dynamics", "camera_movement", "temporal_storyboard", "visual_style", "negative_prompt"]
};

// Long-form Cinematic Storyboard Schema (Multi-Scene breakdown)
export const storyboardSchema: Schema = {
    description: "Schema for multi-scene video storyboard generation",
    type: SchemaType.OBJECT,
    properties: {
        total_project_duration: { type: SchemaType.STRING, description: "Total duration (e.g., '60 seconds')." },
        scenes: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    scene_number: { type: SchemaType.NUMBER },
                    shot_duration: { type: SchemaType.STRING, description: "Usually '8 seconds'." },
                    visual_prompt: { type: SchemaType.STRING, description: "Detailed cinematic prompt specifically for the 8s animation." },
                    narration_vo: { type: SchemaType.STRING, description: "The script text to be read/generated as VO for this segment." },
                    motion_instruction: { type: SchemaType.STRING, description: "Specific camera/motion dynamics for this shot." }
                },
                required: ["scene_number", "visual_prompt", "narration_vo"]
            }
        }
    },
    required: ["total_project_duration", "scenes"]
};

export const getGeminiModel = (mode: "ad" | "medical" | "vector" | "video" | "storyboard" = "ad") => {
    let schema = adCreativeSchema;
    if (mode === "medical") schema = medicalIllustrationSchema;
    if (mode === "vector") schema = vectorIllustrationSchema;
    if (mode === "video") schema = videoIllustrationSchema;
    if (mode === "storyboard") schema = storyboardSchema;

    return genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema,
        },
    });
};
