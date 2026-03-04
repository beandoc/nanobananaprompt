import { Schema, SchemaType } from "@google/generative-ai";

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
            description: "Lighting environment",
            format: "enum",
            enum: ["soft-natural-daylight", "golden-hour", "studio-softbox", "harsh-direct-flash", "moody-rim-lighting"]
        },
        camera_settings: {
            type: SchemaType.OBJECT,
            properties: {
                lens: { type: SchemaType.STRING, format: "enum", enum: ["14mm-ultrawide", "35mm-documentary", "50mm-standard", "85mm-portrait", "100mm-macro"] },
                shot_type: { type: SchemaType.STRING, format: "enum", enum: ["extreme-close-up", "medium-shot", "full-body", "overhead-flatlay"] },
                aesthetic: { type: SchemaType.STRING, format: "enum", enum: ["ugc-iphone-selfie", "high-end-editorial", "raw-polaroid", "clean-ecom"] }
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
            format: "enum",
            enum: ["1:1", "4:5", "9:16", "16:9"]
        }
    },
    required: ["core_prompt", "lighting", "camera_settings", "negative_prompt", "aspect_ratio"]
};
