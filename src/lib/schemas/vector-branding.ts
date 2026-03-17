import { Schema, SchemaType } from "@google/generative-ai";

export const vectorIllustrationSchema: Schema = {
    description: "Principal Brand Designer JSON Schema for Scalable Vector Illustrations",
    type: SchemaType.OBJECT,
    properties: {
        illustration_subject: {
            type: SchemaType.STRING,
            description: "The main subject of the vector illustration. If human, MUST be Indian descent/South Asian features."
        },
        style_framework: {
            type: SchemaType.STRING,
            description: "Core aesthetic framework (e.g., 'Flat Minimalism', 'Isometric 2.5D', 'Bold Line Art', 'Corporate Memphis')."
        },
        geometric_logic: {
            type: SchemaType.STRING,
            description: "Rules for shapes and lines (e.g., 'perfectly circular corners', 'sharp 45-degree angles', 'organic hand-drawn curves')."
        },
        stroke_weight: {
            type: SchemaType.STRING,
            description: "Line thickness and consistent border rules (e.g., 'uniform 3px bold outlines', 'variable line weights', 'no outlines/flat edges')."
        },
        color_profile: {
            type: SchemaType.STRING,
            description: "Specific color palette logic (e.g., 'Vibrant Indian festival colors', 'Monochrome Tech Blue', 'Pastel Professional')."
        },
        shading_type: {
            type: SchemaType.STRING,
            description: "How depth is handled (e.g., 'Zero shading/pure flat', 'Hard cell-shaded shadows', 'Soft grain gradients')."
        },
        background_setting: {
            type: SchemaType.STRING,
            description: "Environment context (e.g., 'Isolated on pure white #FFFFFF', 'Subtle geometric pattern background')."
        },
        negative_prompt: {
            type: SchemaType.STRING,
            description: "Exclusions to ensure vector cleanlines (e.g., 'photorealistic, textures, noise, blur, 3D shadows')."
        },
        keywords: {
            type: SchemaType.ARRAY,
            description: "Brand tags for consistency.",
            items: { type: SchemaType.STRING }
        }
    },
    required: ["illustration_subject", "style_framework", "geometric_logic", "color_profile", "negative_prompt", "keywords"]
};
