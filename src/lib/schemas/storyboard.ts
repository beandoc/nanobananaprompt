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
                    shot_duration: { type: SchemaType.STRING, description: "Usually '8 seconds'." },
                    visual_prompt: { type: SchemaType.STRING, description: "Detailed cinematic prompt specifically for the 8s animation." },
                    narration_vo: { type: SchemaType.STRING, description: "The script text to be read/generated as VO for this segment." },
                    motion_instruction: { type: SchemaType.STRING, description: "Specific camera/motion dynamics for this shot." }
                },
                required: ["scene_number", "visual_prompt", "narration_vo"]
            }
        },
        consistent_character: { type: SchemaType.STRING, description: "Detailed physical description of the primary character to maintain consistent identity (South Asian descent)." }
    },
    required: ["total_project_duration", "scenes", "consistent_character"]
};
