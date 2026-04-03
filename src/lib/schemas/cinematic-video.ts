import { Schema, SchemaType } from "@google/generative-ai";

/**
 * SOVEREIGN CINEMATIC ENGINE v5.0 — Production-Grade Video Blueprint
 *
 * FIVE-LAYER ARCHITECTURE (mirrors the medical engine's rigor):
 *   Layer 1 — scene_core        : Subject, environment, narrative action
 *   Layer 2 — cinematography    : Camera, lens, lighting, color grade
 *   Layer 3 — motion_physics    : Subject motion, environmental dynamics, physics simulation
 *   Layer 4 — temporal_arc      : How the shot evolves over its duration (start → mid → end)
 *   Layer 5 — diffusion_synthesis : ★ The compiled natural-language master prompt for the engine
 *
 * TARGET ENGINES: Google Veo 3, Kling AI 2.0, ByteDance Seedance 2.0,
 *                 Runway Gen-4, OpenAI Sora, Pika 2.0, Luma Dream Machine
 *
 * DESIGN PRINCIPLE:
 *   The JSON gives the AI structured data to reason about.
 *   Layer 5 (diffusion_synthesis) distills ALL layers into engine-ready natural language.
 *   Video models respond to dense, temporally-sequenced natural language — not JSON keys.
 */
export const videoIllustrationSchema: Schema = {
    description: "Sovereign Cinematic Engine v5.0 — Industry-Grade Video Prompt Blueprint",
    type: SchemaType.OBJECT,
    properties: {

        // --- LAYER 1: SCENE CORE ---
        scene_core: {
            type: SchemaType.OBJECT,
            description: "Layer 1: The fundamental scene — who, what, where.",
            properties: {
                subject: {
                    type: SchemaType.STRING,
                    description: "Primary subject with hyper-detailed appearance. MUST be Indian/South Asian if human. Include clothing, expression, body language, and distinguishing features."
                },
                action: {
                    type: SchemaType.STRING,
                    description: "What the subject is doing — described as a continuous verb phrase (e.g., 'slowly turning to face the camera while rain streaks down her face')."
                },
                environment: {
                    type: SchemaType.STRING,
                    description: "Exhaustive scene location with atmospheric details (e.g., 'a rain-soaked Mumbai alleyway at 2AM, neon signs reflecting in puddles, steam rising from a chai stall')."
                },
                secondary_elements: {
                    type: SchemaType.ARRAY,
                    description: "Background subjects, props, or environmental details that must appear.",
                    items: { type: SchemaType.STRING }
                },
                narrative_context: {
                    type: SchemaType.STRING,
                    description: "The emotional or narrative beat of this moment (e.g., 'reunion after years apart', 'the calm before the storm')."
                }
            },
            required: ["subject", "action", "environment"]
        },

        // --- LAYER 2: CINEMATOGRAPHY ---
        cinematography: {
            type: SchemaType.OBJECT,
            description: "Layer 2: Professional camera, lens, and lighting specifications.",
            properties: {
                camera_movement: {
                    type: SchemaType.STRING,
                    description: "Complex camera choreography (e.g., 'Steadicam orbiting 180° around subject, then crane-up to bird's-eye', 'locked-off tripod with subtle breathing')."
                },
                lens: {
                    type: SchemaType.STRING,
                    description: "Lens specification (e.g., '85mm f/1.4 portrait', '24mm anamorphic with barrel distortion', 'probe-lens macro')."
                },
                shot_type: {
                    type: SchemaType.STRING,
                    description: "Framing (e.g., 'extreme close-up on eyes', 'wide establishing shot', 'medium over-the-shoulder')."
                },
                depth_of_field: {
                    type: SchemaType.STRING,
                    description: "Focus strategy (e.g., 'shallow DoF with bokeh orbs', 'deep focus sharp foreground-to-background', 'rack focus from subject to background')."
                },
                lighting: {
                    type: SchemaType.STRING,
                    description: "Primary light source and quality (e.g., 'golden-hour backlight with lens flare', 'harsh top-down fluorescent with green cast', 'volumetric god-rays through dust')."
                },
                color_grade: {
                    type: SchemaType.STRING,
                    description: "Post-production color treatment (e.g., 'teal-and-orange blockbuster grade', 'desaturated Fincher noir', 'warm Kodak Vision3 500T film emulation')."
                },
                aspect_ratio: {
                    type: SchemaType.STRING,
                    description: "Frame ratio (e.g., '16:9', '2.39:1 anamorphic widescreen', '9:16 vertical', '1:1 square')."
                }
            },
            required: ["camera_movement", "lens", "shot_type", "lighting", "color_grade"]
        },

        // --- LAYER 3: MOTION PHYSICS ---
        motion_physics: {
            type: SchemaType.OBJECT,
            description: "Layer 3: Physics-based motion description for temporal consistency.",
            properties: {
                subject_motion: {
                    type: SchemaType.STRING,
                    description: "How the subject moves with physical realism (e.g., 'hair catches crosswind with 0.5s delay, silk dupatta billows with weight, footsteps splash in 2cm puddles')."
                },
                environmental_dynamics: {
                    type: SchemaType.STRING,
                    description: "How the world moves around the subject (e.g., 'rain falls at 45° angle driven by wind, neon signs flicker at 2Hz, steam curls upward in turbulent wisps')."
                },
                particle_effects: {
                    type: SchemaType.STRING,
                    description: "Atmospheric particles (e.g., 'dust motes in volumetric light', 'embers floating upward', 'snowflakes with varied fall speeds')."
                },
                speed_ramp: {
                    type: SchemaType.STRING,
                    description: "Speed changes over the shot (e.g., 'begins at 120fps slow-motion, ramps to real-time at the 6s mark', 'constant 24fps')."
                }
            },
            required: ["subject_motion", "environmental_dynamics"]
        },

        // --- LAYER 4: TEMPORAL ARC ---
        temporal_arc: {
            type: SchemaType.OBJECT,
            description: "Layer 4: How the shot evolves over its duration — the keyframe blueprint.",
            properties: {
                duration: {
                    type: SchemaType.STRING,
                    description: "Target duration for a single generation (e.g., '8s', '15s', '30s'). Push to the maximum supported by the target engine."
                },
                frame_rate: {
                    type: SchemaType.STRING,
                    description: "Target FPS (e.g., '24fps cinematic', '60fps smooth', '120fps slow-motion source')."
                },
                resolution: {
                    type: SchemaType.STRING,
                    description: "Target resolution (e.g., '1080p', '4K UHD', '720p draft')."
                },
                keyframes: {
                    type: SchemaType.ARRAY,
                    description: "Ordered temporal keyframes describing what happens at each phase of the shot. Minimum 3 keyframes (opening, midpoint, closing).",
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            timestamp: { type: SchemaType.STRING, description: "Approximate time mark (e.g., '0s - 3s', '3s - 6s', '6s - 8s')." },
                            visual_state: { type: SchemaType.STRING, description: "What the viewer sees at this moment." },
                            camera_state: { type: SchemaType.STRING, description: "Camera position/movement at this moment." },
                            audio_state: { type: SchemaType.STRING, description: "Sound design or music at this moment." }
                        },
                        required: ["timestamp", "visual_state"]
                    }
                }
            },
            required: ["duration", "frame_rate", "resolution", "keyframes"]
        },

        // --- LAYER 5: DIFFUSION SYNTHESIS ★ (THE HERO LAYER) ---
        diffusion_synthesis: {
            type: SchemaType.OBJECT,
            description: "CORE RENDERING SIGNAL: The compiled natural-language master prompt. This is the ONLY layer video AI models actually read. Must be populated FIRST with the highest descriptive density.",
            properties: {
                master_prompt: {
                    type: SchemaType.STRING,
                    description: "HERO FIELD: 200-400 word consolidated prompt. Open with the subject and action, layer with environment and cinematography, close with motion physics and temporal progression. Use ONLY natural language — no JSON keys, no technical IDs."
                },
                style_tags: {
                    type: SchemaType.ARRAY,
                    description: "8-15 engine-optimization tags (e.g., 'cinematic', '4K', 'temporal consistency', 'no morphing', 'photorealistic', 'volumetric lighting').",
                    items: { type: SchemaType.STRING }
                },
                negative_prompt: {
                    type: SchemaType.STRING,
                    description: "Strict exclusions (e.g., 'no morphing, no face distortion, no text overlays, no watermarks, no sudden cuts, no 3D render aesthetic, no cartoonish proportions')."
                },
                audio_design: {
                    type: SchemaType.STRING,
                    description: "Sound and music specification (e.g., '3D spatial rain, distant thunder, melancholic sarangi melody, muffled city traffic')."
                },
                engine_hints: {
                    type: SchemaType.OBJECT,
                    description: "Engine-specific optimization hints.",
                    properties: {
                        kling_ai: { type: SchemaType.STRING, description: "Kling-specific tags (e.g., 'professional mode, 1080p, 10s, high quality')." },
                        seedance: { type: SchemaType.STRING, description: "Seedance-specific tags (e.g., 'keyframe guidance, motion intensity: high')." },
                        veo: { type: SchemaType.STRING, description: "Google Veo-specific tags (e.g., 'photorealistic, 8s, 720p')." },
                        runway: { type: SchemaType.STRING, description: "Runway Gen-4 tags (e.g., 'motion brush: full frame, 10s extend')." }
                    }
                }
            },
            required: ["master_prompt", "style_tags", "negative_prompt", "audio_design"]
        },

        // --- METADATA ---
        video_type: {
            type: SchemaType.STRING,
            description: "Classification: 'live-action-photorealistic', '3d-animation', '2d-animation', 'anime', 'stop-motion', 'mixed-media'."
        },
        keywords: {
            type: SchemaType.ARRAY,
            description: "15-25 descriptive tags for discoverability and engine optimization.",
            items: { type: SchemaType.STRING }
        }
    },
    required: ["scene_core", "cinematography", "motion_physics", "temporal_arc", "diffusion_synthesis", "video_type", "keywords"]
};
