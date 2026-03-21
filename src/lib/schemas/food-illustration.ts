import { Schema, SchemaType } from "@google/generative-ai";

export const foodIllustrationSchema: Schema = {
    description: "Schema for Industrial Food & Beverage Infographics",
    type: SchemaType.OBJECT,
    properties: {
        scientific_subject: {
            type: SchemaType.STRING,
            description: "Detailed description of the food/beverage hero product and its materials."
        },
        layout_composition: {
            type: SchemaType.STRING,
            format: "enum",
            enum: ["central-hero-with-callouts", "sequential-process-flow", "exploded-view-teardown", "macro-texture-inset", "flatlay-knolling-layout"],
            description: "Compositional arrangement for the culinary infographic."
        },
        illustration_style: {
            type: SchemaType.STRING,
            format: "enum",
            enum: ["hyper-realistic-food-photography", "industrial-design-sketch", "clean-vector-infographic", "3d-pbr-diorama", "macro-scientific-culinary"]
        },
        visual_accuracy: {
            type: SchemaType.OBJECT,
            properties: {
                textures: { type: SchemaType.STRING, description: "Description of food textures (e.g., 'viscous yogurt', 'glistening oils', 'fibrous zucchini')." },
                lighting: { type: SchemaType.STRING, format: "enum", enum: ["soft-directional-key", "high-speed-motion-freeze", "warm-ambient-kitchen", "cinematic-rim-lit"] },
                tissue_physics: { type: SchemaType.STRING, description: "Liquid/material physics (e.g., 'kinetic crown splash', 'subsurface scattering in fruit flesh')." },
                anatomical_keys: { type: SchemaType.STRING, description: "Specific ingredients or components to highlight (e.g., 'pine nuts', 'minced meat')." },
                labeling_safe_zones: { type: SchemaType.STRING, description: "Areas for golden leader lines and text annotations." }
            },
            required: ["textures", "lighting", "tissue_physics", "anatomical_keys"]
        },
        journal_standard: {
            type: SchemaType.STRING,
            format: "enum",
            enum: ["Michelin-Editorial", "Cooks-Illustrated-technical", "Industrial-Design-Manual", "High-End-DTC-Ad"]
        },
        negative_prompt: {
            type: SchemaType.STRING,
            description: "MANDATORY EXCLUSIONS: 'low quality, blurry, random text hallucinations, messy layout, overcrowding'."
        },
        consistent_character: {
            type: SchemaType.STRING,
            format: "enum",
            enum: ["Male-Subject-A", "Female-Subject-B", "No-Human-Figure"],
            description: "Optional human presence (Chef/User) of Indian descent."
        },
        visual_theme: {
            type: SchemaType.STRING,
            format: "enum",
            enum: ["Rustic-Kitchen-Warm", "Studio-White-Clean", "Modern-Muted-Design", "BioRender-Culinary-Pastel"],
            description: "Overall color and atmosphere theme."
        }
    },
    required: ["scientific_subject", "layout_composition", "illustration_style", "visual_accuracy", "journal_standard", "negative_prompt", "consistent_character", "visual_theme"]
};
