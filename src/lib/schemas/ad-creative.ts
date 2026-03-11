import { Schema, SchemaType } from "@google/generative-ai";

export const adCreativeSchema: Schema = {
    description: "Schema for Ad Creative prompts",
    type: SchemaType.OBJECT,
    properties: {
        core_prompt: {
            type: SchemaType.STRING,
            description: "CRITICAL: The product must be the VISUAL HERO. Model (Indian descent) must have face de-emphasized (cropped or looking down). Background must be simple and clean. The product must be the sharpest element. Describe the scene's emotional resolution of a pain point."
        },
        lighting: {
            type: SchemaType.STRING,
            description: "Natural lighting preferred (Golden hour, diffused daylight). Product must catch light directly.",
            format: "enum",
            enum: ["soft-natural-daylight", "golden-hour", "studio-softbox", "harsh-direct-flash", "moody-rim-lighting"]
        },
        camera_settings: {
            type: SchemaType.OBJECT,
            description: "Composition: Subject/Product right 60%, Copy left 40%.",
            properties: {
                lens: { type: SchemaType.STRING, format: "enum", enum: ["14mm-ultrawide", "35mm-documentary", "50mm-standard", "85mm-portrait", "100mm-macro"] },
                shot_type: { type: SchemaType.STRING, format: "enum", enum: ["extreme-close-up", "medium-shot", "full-body", "overhead-flatlay"] },
                aesthetic: { type: SchemaType.STRING, format: "enum", enum: ["ugc-iphone-selfie", "high-end-editorial", "raw-polaroid", "clean-ecom"] }
            },
            required: ["lens", "shot_type", "aesthetic"]
        },
        headline_copy: {
            type: SchemaType.STRING,
            description: "A 3-6 word PAIN-POINT headline (direct question or bold statement). ALL CAPS. Must address frustration (e.g., 'TIRED OF LOOKING INVISIBLE?'). No duplicate words. No internal bracket notation."
        },
        subline_copy: {
            type: SchemaType.STRING,
            description: "Urgency/Value line (e.g., 'Ends Tonight · Shop Now'). Title Case. Must be 35-40% size of headline. Use centered dot (·) separator."
        },
        negative_prompt: {
            type: SchemaType.STRING,
            description: "Exclude: 'jewelry, styled hair, heavy makeup, influencer look, studio backgrounds, metadata, bracket notation, duplicate text, blurry product, cropped product edges'."
        },
        aspect_ratio: {
            type: SchemaType.STRING,
            format: "enum",
            enum: ["1:1", "4:5", "9:16", "16:9"]
        }
    },
    required: ["core_prompt", "lighting", "camera_settings", "headline_copy", "subline_copy", "negative_prompt", "aspect_ratio"]
};
