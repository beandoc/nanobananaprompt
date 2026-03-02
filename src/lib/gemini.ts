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
            description: "Specific anatomical structure or surgical process. If a patient or clinician is visible, ALWAYS specify them as Indian for textbook consistency."
        },
        illustration_style: {
            type: SchemaType.STRING,
            enum: ["photorealistic-electron-microscopy", "3d-medical-render", "clean-surgical-sketch", "scientific-diagram", "histology-stained"]
        } as any,
        visual_accuracy: {
            type: SchemaType.OBJECT,
            properties: {
                textures: { type: SchemaType.STRING, description: "Description of tissue textures, e.g., 'fibrous', 'aqueous', 'granulated'." },
                lighting: { type: SchemaType.STRING, enum: ["internal-bioluminescence", "diffused-lab-lighting", "microscopic-focused", "rim-lit-anatomical"] } as any,
                labeling_safe_zones: { type: SchemaType.STRING, description: "Areas to leave clear for future text annotations." }
            },
            required: ["textures", "lighting"]
        },
        journal_standard: {
            type: SchemaType.STRING,
            enum: ["NEJM-classic", "Nature-modern", "Lancet-descriptive", "Gray-Anatomy-sketch"]
        } as any,
        negative_prompt: {
            type: SchemaType.STRING,
            description: "Exclude: 'cartoonish, low-resolution, inaccurate anatomy, messy labels, blood-horror (unless surgical), vibrant-neon'."
        },
        consistent_character: {
            type: SchemaType.STRING,
            enum: ["Male-Subject-A", "Female-Subject-B", "No-Human-Figure"],
            description: "Locks the physical characteristics of the human figure for textbook-wide consistency."
        } as any,
        visual_theme: {
            type: SchemaType.STRING,
            enum: ["Clinical-Neutral", "Surgical-Blue", "Anatomy-White-Background"],
            description: "Forces a consistent color palette across different images."
        } as any
    },
    required: ["scientific_subject", "illustration_style", "visual_accuracy", "journal_standard", "negative_prompt", "consistent_character", "visual_theme"]
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

export const getGeminiModel = (mode: "ad" | "medical" | "vector" = "ad") => {
    let schema = adCreativeSchema;
    if (mode === "medical") schema = medicalIllustrationSchema;
    if (mode === "vector") schema = vectorIllustrationSchema;

    return genAI.getGenerativeModel({
        model: "gemini-flash-latest",
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema,
        },
    });
};
