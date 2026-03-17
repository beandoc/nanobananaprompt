import { Schema, SchemaType } from "@google/generative-ai";

export const mangaCharacterSchema: Schema = {
    description: "Multi-Universe Manga Character Blueprint",
    type: SchemaType.OBJECT,
    properties: {
        manga_subject: {
            type: SchemaType.STRING,
            description: "Description of the base character (must be Indian/South Asian as per standard)"
        },
        layout: {
            type: SchemaType.STRING,
            description: "e.g. '3x3 grid layout (nine panels)'"
        },
        panels: {
            type: SchemaType.ARRAY,
            description: "Nine panels, each representing a different manga universe",
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    panel_number: { type: SchemaType.NUMBER },
                    universe: { type: SchemaType.STRING, description: "e.g. 'One Piece', 'Naruto', 'Dragon Ball'" },
                    art_style: { type: SchemaType.STRING, description: "Specific art style of that manga universe" },
                    outfit: { type: SchemaType.STRING, description: "Character outfit adapted to that world" },
                    environment: { type: SchemaType.STRING, description: "Background setting from that world" }
                },
                required: ["panel_number", "universe", "art_style", "outfit", "environment"]
            }
        },
        negative_prompt: {
            type: SchemaType.STRING,
            description: "Global exclusions"
        }
    },
    required: ["manga_subject", "layout", "panels", "negative_prompt"]
};
