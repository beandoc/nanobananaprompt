import { Schema, SchemaType } from "@google/generative-ai";

export const adCreativeSchema: Schema = {
    description: "Schema for Ad Creative prompts",
    type: SchemaType.OBJECT,
    properties: {
        core_prompt: {
            type: SchemaType.STRING,
            description: "CRITICAL: The product must be the VISUAL HERO. Model (Indian descent) must have an expression matching the brief (e.g. smile, closed eyes). If no expression is given, de-emphasize face (cropped or looking down). Background must be simple and clean. The product must be the sharpest element. Describe the scene's emotional resolution of a pain point."
        },
        lighting: {
            type: SchemaType.STRING,
            description: "Natural lighting preferred (Golden hour, diffused daylight). Product must catch light directly.",
            format: "enum",
            enum: ["soft-natural-daylight", "golden-hour", "studio-softbox", "harsh-direct-flash", "moody-rim-lighting", "microscopic-focused", "bioluminescence"]
        },
        camera_settings: {
            type: SchemaType.OBJECT,
            description: "Composition: Subject/Product right 60%, Copy left 40%.",
            properties: {
                lens: { type: SchemaType.STRING, format: "enum", enum: ["14mm-ultrawide", "35mm-documentary", "50mm-standard", "85mm-portrait", "100mm-macro"] },
                shot_type: { type: SchemaType.STRING, format: "enum", enum: ["extreme-close-up", "medium-shot", "full-body", "overhead-flatlay"] },
                aesthetic: { type: SchemaType.STRING, format: "enum", enum: ["ugc-iphone-selfie", "high-end-editorial", "raw-polaroid", "clean-ecom", "3d-medical-render", "histology-stained"] }
            },
            required: ["lens", "shot_type", "aesthetic"]
        },
        exact_text: {
            type: SchemaType.STRING,
            description: "CRITICAL: The exact typographic string to be rendered. Must be a punchy, emotional headline (3-7 words). ALL CAPS. No duplicate words. No internal bracket notation."
        },
        negative_prompt: {
            type: SchemaType.STRING,
            description: "DENSE NEGATIVE STACK: jewelry, styled hair, heavy makeup, influencer look, studio backgrounds, blurry edges, plastic textures, watermark, signature, cropped product."
        },
        aspect_ratio: {
            type: SchemaType.STRING,
            format: "enum",
            enum: ["1:1", "4:5", "9:16", "16:9"]
        }
    },
    required: ["core_prompt", "lighting", "camera_settings", "exact_text", "negative_prompt", "aspect_ratio"]
};
