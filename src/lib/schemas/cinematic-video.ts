import { Schema, SchemaType } from "@google/generative-ai";

export const videoIllustrationSchema: Schema = {
    description: "Google Veo 3 JSON Blueprint Generator",
    type: SchemaType.OBJECT,
    properties: {
        description: { 
            type: SchemaType.STRING, 
            description: "Cinematic summary of the scene - what happens visually. Must feature Indian/South Asian characters if human." 
        },
        style: { 
            type: SchemaType.STRING, 
            description: "Visual mood or aesthetic (e.g. cinematic, magical realism, high-fashion editorial)." 
        },
        camera: { 
            type: SchemaType.STRING, 
            description: "Camera movement or framing (e.g. dolly-in, fixed wide shot, slow tracking pan)." 
        },
        lens: { 
            type: SchemaType.STRING, 
            description: "Lens or framing type (e.g. 35mm anamorphic, 100mm macro, 14mm ultra-wide)." 
        },
        lighting: { 
            type: SchemaType.STRING, 
            description: "How the scene is lit (e.g. neon glow, golden hour sunset, harsh direct flash, soft studio light)." 
        },
        environment: { 
            type: SchemaType.STRING, 
            description: "Detailed scene location or space (e.g. bustling Mumbai spice market, rain-slicked rooftop in Neo-Tokyo)." 
        },
        audio: { 
            type: SchemaType.STRING, 
            description: "Music or sound design instructions (e.g. rhythmic tabla beats, heavy rain, distant cyber-sirens)." 
        },
        elements: { 
            type: SchemaType.ARRAY, 
            description: "List of objects, subjects, or visual items that must appear in the shot.",
            items: { type: SchemaType.STRING }
        },
        motion: { 
            type: SchemaType.STRING, 
            description: "How objects move or transform in the scene (e.g. fabric blowing in desert wind, sparks flying from metal)." 
        },
        ending: { 
            type: SchemaType.STRING, 
            description: "What the final visual moment or shot looks like (e.g. fade to silhouette, camera tilts to the moon)." 
        },
        text: { 
            type: SchemaType.STRING, 
            description: "Usually 'none' unless on-screen text is mentioned." 
        },
        keywords: { 
            type: SchemaType.ARRAY, 
            description: "Descriptive tags that reinforce theme, tone, or subject.",
            items: { type: SchemaType.STRING }
        }
    },
    required: ["description", "style", "camera", "lighting", "elements", "motion", "ending", "text", "keywords"]
};
