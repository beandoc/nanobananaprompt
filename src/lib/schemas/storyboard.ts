import { Schema, SchemaType } from "@google/generative-ai";

export const storyboardSchema: Schema = {
    description: "Schema for multi-scene video storyboard generation",
    type: SchemaType.OBJECT,
    properties: {
        total_project_duration: { type: SchemaType.STRING, description: "Total duration (e.g., '60 seconds')." },
        scenes: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    scene_number: { type: SchemaType.NUMBER },
                    shot_duration: { type: SchemaType.STRING, description: "Usually '4s', '6s', or '8s' for Google Flow." },
                    visual_prompt: { 
                        type: SchemaType.STRING, 
                        description: "HERO FIELD: 100-150 words of FLUID CINEMATIC PROSE. Formula: [SHOT] + [SUBJECTS w/ Identity Front-Loaded] + [ACTION as causal prose without timecodes] + [SETTING] + [AESTHETICS] + [AUDIO lines]. DO NOT dump tags. ZERO timecodes. Enforce maximum 3 negatives formatted as 'Exclude: {negative_prompts}' at the end of the prose." 
                    },
                    narration_vo: { type: SchemaType.STRING, description: "The script text to be read/generated as VO for this segment. Empty if none." },
                    motion_instruction: { type: SchemaType.STRING, description: "Specific camera/motion dynamics for this shot. E.g., 'Slow dolly-in'." }
                },
                required: ["scene_number", "shot_duration", "visual_prompt", "narration_vo"]
            }
        },
        consistent_character: { type: SchemaType.STRING, description: "Identity Lock: Detailed physical description of all primary characters to maintain consistent identity (South Asian descent mandatory)." }
    },
    required: ["total_project_duration", "scenes", "consistent_character"]
};
