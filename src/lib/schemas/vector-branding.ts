import { Schema, SchemaType } from "@google/generative-ai";

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
            format: "enum",
            enum: ["corporate-memphis", "flat-minimalist", "isometric-clean", "bold-line-art", "gradient-tech-glass"]
        },
        color_palette: {
            type: SchemaType.STRING,
            format: "enum",
            enum: ["vibrant-primary", "startup-pastel", "monochrome-slate", "high-contrast-neon", "brand-custom"]
        },
        background: {
            type: SchemaType.STRING,
            format: "enum",
            enum: ["pure-white-for-vectorization", "transparent-grid-style", "solid-brand-color"]
        },
        complexity: {
            type: SchemaType.STRING,
            format: "enum",
            enum: ["simple-iconic", "medium-detailed", "comprehensive-scene"]
        },
        negative_prompt: {
            type: SchemaType.STRING,
            description: "Exclude: 'photorealistic, complex gradients, noisy textures, 3D shadows, motion blur, hand-drawn charcoal'."
        }
    },
    required: ["illustration_subject", "vector_style", "color_palette", "background", "complexity", "negative_prompt"]
};
