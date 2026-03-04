import { Schema, SchemaType } from "@google/generative-ai";

export const videoIllustrationSchema: Schema = {
    description: "Schema for Cinematic Motion and Video Generation prompts",
    type: SchemaType.OBJECT,
    properties: {
        video_subject: {
            type: SchemaType.STRING,
            description: "The core subject performing a specific 8-second sequence of actions."
        },
        motion_dynamics: {
            type: SchemaType.STRING,
            description: "Describe the speed, fluidity, and specific physical motion (e.g., 'slow-motion cell division', 'rapid water splash', 'dynamic camera orbit')."
        },
        camera_movement: {
            type: SchemaType.STRING,
            format: "enum",
            enum: ["static", "slow-push-in", "dolly-zoom", "360-orbit", "handheld-tracking", "drone-overhead", "macro-pan"],
            description: "The cinematic camera path for the 8-second shot."
        },
        temporal_storyboard: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: "A 3-part breakdown of what happens at 0s, 4s, and 8s."
        },
        visual_style: {
            type: SchemaType.STRING,
            description: "Art direction (e.g., 'National Geographic 8K RAW', 'Cyberpunk Neon Cinematic', 'Medical Documentary Gray-Scale')."
        },
        negative_prompt: {
            type: SchemaType.STRING,
            description: "Exclude: 'shaky camera, low framerate, flickering, distorted faces, text, watermarks, morphing artifacts'."
        }
    },
    required: ["video_subject", "motion_dynamics", "camera_movement", "temporal_storyboard", "visual_style", "negative_prompt"]
};
