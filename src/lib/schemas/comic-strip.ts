import { Schema, SchemaType } from "@google/generative-ai";

export const comicStripSchema: Schema = {
    description: "Sequential Narrative Comic Strip Blueprint",
    type: SchemaType.OBJECT,
    properties: {
        comic_title: { type: SchemaType.STRING },
        logline: { type: SchemaType.STRING },
        narrative_arc: {
            type: SchemaType.STRING,
            description: "A brief summary of the story being told in this strip."
        },
        cast_of_characters: {
            type: SchemaType.ARRAY,
            description: "List of all recurring characters with highly detailed visual anchors to ensure identity locking across all panels.",
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    name: { type: SchemaType.STRING, description: "Character name or ID (e.g., 'Character Subject A', 'Grandmother')." },
                    description: { type: SchemaType.STRING, description: "Hyper-detailed physical description (e.g., 'Indian male, mid-30s, sharp jawline, messy hair, wearing a worn grey trench coat')." },
                    role: { type: SchemaType.STRING, description: "Role in the story (e.g., 'Protagonist', 'Mentor')." }
                },
                required: ["name", "description"]
            }
        },
        consistent_character: {
            type: SchemaType.STRING,
            description: "A summary string of all characters (legacy support for simple renders)."
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
        },
        comic_pages: {
            type: SchemaType.ARRAY,
            description: "Multi-page structure for Graphic Novels / E-Books",
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    page_number: { type: SchemaType.NUMBER },
                    panels: {
                        type: SchemaType.ARRAY,
                        items: {
                            type: SchemaType.OBJECT,
                            properties: {
                                panel_number: { type: SchemaType.NUMBER },
                                shot_type: { type: SchemaType.STRING },
                                characters: { type: SchemaType.STRING },
                                action: { type: SchemaType.STRING },
                                background: { type: SchemaType.STRING },
                                dialogue: { type: SchemaType.STRING },
                                narrative_caption: { type: SchemaType.STRING },
                                inking_style: { type: SchemaType.STRING },
                                lighting_setup: { type: SchemaType.STRING },
                                perspective: { type: SchemaType.STRING }
                            },
                            required: ["panel_number", "shot_type", "characters", "action", "background"]
                        }
                    }
                },
                required: ["page_number", "panels"]
            }
        }
    },
    required: ["narrative_arc", "comic_title", "logline", "consistent_character", "art_style", "lettering_style", "comic_panels", "negative_prompt"]
};
