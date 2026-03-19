import { Schema, SchemaType } from "@google/generative-ai";

export const comicStripSchema: Schema = {
    description: "Sequential Narrative Comic Strip Blueprint",
    type: SchemaType.OBJECT,
    properties: {
        narrative_arc: {
            type: SchemaType.STRING,
            description: "A brief summary of the story being told in this strip."
        },
        consistent_character: {
            type: SchemaType.STRING,
            description: "Define the core visual anchor (e.g., 'Character Subject A: Indian male, mid-30s, sharp jawline, messy hair, wearing a worn grey trench coat'). This ensures identity locking across all panels."
        },
        art_style: {
            type: SchemaType.STRING,
            description: "Consistent visual style (e.g., 'Modern American Indie', 'Classic Marvel 90s', 'Noir Silhouettes')."
        },
        lettering_style: {
            type: SchemaType.STRING,
            description: "Description of dialogue bubbles and font style (e.g., 'Hand-drawn brush lettering', 'Bold sans-serif bubbles')."
        },
        comic_panels: {
            type: SchemaType.ARRAY,
            description: "Sequential panels telling the story",
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    panel_number: { type: SchemaType.NUMBER },
                    shot_type: { 
                        type: SchemaType.STRING, 
                        description: "Cinematic shot type (e.g., 'Extreme Close-up', 'Wide Establishing Shot', 'Low-Angle Hero Shot')." 
                    },
                    characters: { 
                        type: SchemaType.STRING, 
                        description: "Detailed description of characters and their expressions (must be Indian/South Asian as per standard)." 
                    },
                    action: { 
                        type: SchemaType.STRING, 
                        description: "The primary action or event in the panel." 
                    },
                    background: { 
                        type: SchemaType.STRING, 
                        description: "Detailed setting description." 
                    },
                    dialogue: { 
                        type: SchemaType.STRING, 
                        description: "Dialogue text to be placed in speech bubbles." 
                    },
                    thought_bubble: { 
                        type: SchemaType.STRING, 
                        description: "Internal monologue (represented as cloud bubbles in comics)." 
                    },
                    narrative_caption: { 
                        type: SchemaType.STRING, 
                        description: "Contextual narrative text (usually in a yellow/colored box at top/bottom)." 
                    },
                    onomatopoeia: { 
                        type: SchemaType.STRING, 
                        description: "Sound effect text (e.g., 'THWACK!', 'BZZZZT')." 
                    }
                },
                required: ["panel_number", "shot_type", "characters", "action", "background"]
            }
        },
        negative_prompt: {
            type: SchemaType.STRING,
            description: "Global exclusions to maintain visual clarity and consistency."
        },
        layout_type: {
            type: SchemaType.STRING,
            description: "The visual arrangement of panels (e.g., 'vertical', 'grid', 'splash')."
        },
        production_credits: {
            type: SchemaType.STRING,
            description: "Production team names (e.g., Writer: Aryan S., Artist: Meera K., Colorist: Rahul V.)."
        }
    },
    required: ["narrative_arc", "art_style", "lettering_style", "comic_panels", "negative_prompt"]
};
