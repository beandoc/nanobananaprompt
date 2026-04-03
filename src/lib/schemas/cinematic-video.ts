import { Schema, SchemaType } from "@google/generative-ai";

/**
 * SOVEREIGN CINEMATIC ENGINE v6.0 — Google Flow / Veo 3.1 Native Compliance
 *
 * 7-RULE PRODUCTION PROTOCOL (Audit-Hardened):
 *   Rule 1 — Duration Contract    : 4s / 6s / 8s only. Auto-split if > 8s.
 *   Rule 2 — Prompt Formula       : Shot → Subject → Action → Setting → Aesthetics → Audio (100–150 words)
 *   Rule 3 — Kill Timecodes       : JSON keyframes for planning only; NEVER in compiled output
 *   Rule 4 — Audio as Inline      : Audio appended as 2–3 sentences inside compiled prompt
 *   Rule 5 — Identity Front-Load  : Identity lock block is sentence 2 of compiled prompt — always
 *   Rule 6 — Negative Discipline  : Max 3 critical exclusions
 *   Rule 7 — Style Tag Normalise  : Veo-native vocabulary only
 *
 * TARGET: Google Flow (Veo 3.1), Kling AI 2.0, Seedance 2.0, Runway Gen-4
 */
export const videoIllustrationSchema: Schema = {
    description: "Sovereign Cinematic Engine v6.0 — Google Flow / Veo 3.1 Native Compliance",
    type: SchemaType.OBJECT,
    properties: {

        // --- VEO CLIP SPEC ---
        veo_clip: {
            type: SchemaType.OBJECT,
            description: "Rule 1: Duration contract. Flow only accepts 4s, 6s, or 8s. Default is 8s for single clip.",
            properties: {
                duration_seconds: {
                    type: SchemaType.NUMBER,
                    description: "Hard constraint: 4, 6, or 8 only. If the brief needs >8s, set this to 8 and populate clip_2."
                },
                resolution: {
                    type: SchemaType.STRING,
                    description: "Target resolution: '1080p' or '720p'. Default '1080p'."
                },
                aspect_ratio: {
                    type: SchemaType.STRING,
                    description: "Frame ratio: '16:9' (default), '9:16' (vertical), '1:1' (square)."
                },
                audio_enabled: {
                    type: SchemaType.BOOLEAN,
                    description: "Always true for Google Flow. Set to false only if the engine is Kling (no native audio)."
                },
                clip_2: {
                    type: SchemaType.OBJECT,
                    description: "Rule 1 Multi-Clip: Populated ONLY if brief duration > 8s. Contains 4s or 6s resolution clip with first/last frame handoff instructions.",
                    properties: {
                        duration_seconds: { type: SchemaType.NUMBER },
                        first_frame_handoff: { type: SchemaType.STRING, description: "Description of the LAST frame of Clip 1 to use as first-frame of Clip 2." },
                        action: { type: SchemaType.STRING, description: "Action sequence for this clip." }
                    }
                }
            },
            required: ["duration_seconds", "resolution", "aspect_ratio", "audio_enabled"]
        },

        // --- SCENE CORE ---
        scene_core: {
            type: SchemaType.OBJECT,
            description: "Layer 1: Who, what, where — the structural foundation.",
            properties: {
                subject: {
                    type: SchemaType.STRING,
                    description: "One-line subject description (used for planning only, NOT compiled output). E.g., 'Indian male craftsman carving clay elephant'."
                },
                identity_locks: {
                    type: SchemaType.ARRAY,
                    description: "Rule 5: Front-loaded identity blocks. Every co-subject with more than 2 seconds of screen time needs its own lock. These are woven into sentence 2 of compiled_master_prompt.",
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            age_descriptor: { type: SchemaType.STRING, description: "E.g., 'Senior', 'Young adult', 'Approx 5-8 years old'." },
                            ethnicity: { type: SchemaType.STRING, description: "MANDATORY: 'Indian' or 'South Asian'. Must appear verbatim." },
                            gender: { type: SchemaType.STRING },
                            physical_features: {
                                type: SchemaType.ARRAY,
                                description: "Specific facial/physical features.",
                                items: { type: SchemaType.STRING }
                            },
                            skin_descriptor: { type: SchemaType.STRING },
                            garment: { type: SchemaType.STRING, description: "E.g., 'hand-woven cotton sari', 'simple cotton kurtas'." },
                            material_cue: { type: SchemaType.STRING }
                        },
                        required: ["age_descriptor", "ethnicity", "gender", "garment"]
                    }
                },
                action_sequence: {
                    type: SchemaType.ARRAY,
                    description: "Rule 3: Sequential action beats in plain prose. NO timecodes. These are converted to a flowing action paragraph in compiled_master_prompt.",
                    items: {
                        type: SchemaType.STRING,
                        description: "One action beat (e.g., 'He carves a miniature wooden elephant with deliberate strokes')."
                    }
                },
                environment: {
                    type: SchemaType.STRING,
                    description: "Scene location and atmospheric context."
                },
                world_material: {
                    type: SchemaType.STRING,
                    description: "What everything is made of (especially critical for stop-motion). E.g., 'The entire world is matte clay: thumbprint impressions on every surface'."
                }
            },
            required: ["subject", "identity_locks", "action_sequence", "environment"]
        },

        // --- CINEMATOGRAPHY ---
        cinematography: {
            type: SchemaType.OBJECT,
            description: "Layer 2: Camera and lighting specifications.",
            properties: {
                shot_type: {
                    type: SchemaType.STRING,
                    description: "E.g., 'Extreme close-up', 'Wide establishing shot', 'Medium over-the-shoulder'."
                },
                camera_movement: {
                    type: SchemaType.STRING,
                    description: "E.g., 'Slow dolly-in', 'Locked tripod', '360-degree orbit'. Avoid complex multi-move rigs for 8s clips."
                },
                lens: {
                    type: SchemaType.STRING,
                    description: "E.g., 'Macro lens', '85mm portrait', '24mm anamorphic'."
                },
                depth_of_field: {
                    type: SchemaType.STRING,
                    description: "E.g., 'Shallow depth of field', 'Rack focus from hands to face'."
                },
                lighting: {
                    type: SchemaType.OBJECT,
                    description: "Rule 2: Technical lighting spec with Kelvin and Hz values.",
                    properties: {
                        type: { type: SchemaType.STRING, description: "E.g., 'Single point candle', 'Three-point studio', 'Natural window'." },
                        colour_temp_K: { type: SchemaType.NUMBER, description: "Colour temperature in Kelvin. E.g., 3200 for tungsten, 5600 for daylight." },
                        intensity: { type: SchemaType.STRING, description: "E.g., 'Low', 'Medium-high', 'Harsh direct'." },
                        flicker_hz: { type: SchemaType.NUMBER, description: "For candle/fire: 0.8. For neon: 2.0. For steady: 0." }
                    },
                    required: ["type", "colour_temp_K"]
                },
                color_grade: {
                    type: SchemaType.STRING,
                    description: "E.g., 'Warm honey-toned', 'Teal-orange cinematic', 'Desaturated Fincher noir'."
                }
            },
            required: ["shot_type", "camera_movement", "lens", "lighting", "color_grade"]
        },

        // --- MOTION PHYSICS ---
        motion_physics: {
            type: SchemaType.OBJECT,
            description: "Layer 3: Physics-based motion for temporal consistency.",
            properties: {
                subject_motion: {
                    type: SchemaType.STRING,
                    description: "PBR material motion. E.g., 'Clay surface PBR matte diffuse, specular: 0.1, sub-millimeter tool-mark displacement'."
                },
                environmental_dynamics: {
                    type: SchemaType.STRING,
                    description: "How the world reacts. E.g., 'Candle flame animated at 0.8Hz, casting hard-edge shadow at 15° falloff'."
                },
                speed_ramp: {
                    type: SchemaType.STRING,
                    description: "FPS changes. E.g., 'Constant 12fps stutter throughout', '24fps standard'."
                }
            },
            required: ["subject_motion"]
        },

        // --- TEMPORAL ARC (Internal only — Rule 3) ---
        temporal_arc: {
            type: SchemaType.OBJECT,
            description: "Rule 3: INTERNAL planning structure only. Keyframes are converted to prose in compiled_master_prompt. NEVER include timecodes in compiled output.",
            properties: {
                total_duration_seconds: {
                    type: SchemaType.NUMBER,
                    description: "Total intended duration. If > 8, the compiler will auto-split into veo_clip + clip_2."
                },
                keyframes: {
                    type: SchemaType.ARRAY,
                    description: "Planning keyframes — used by the compiler to generate the sequential action prose. NOT directly included in compiled output.",
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            phase: { type: SchemaType.STRING, description: "E.g., 'Opening', 'Mid Action', 'Resolution'." },
                            beat_index: { type: SchemaType.NUMBER, description: "1, 2, 3 — maps to action_sequence beats." },
                            visual_state: { type: SchemaType.STRING },
                            camera_state: { type: SchemaType.STRING }
                        },
                        required: ["phase", "visual_state"]
                    }
                }
            },
            required: ["total_duration_seconds", "keyframes"]
        },

        // --- STYLE ---
        style: {
            type: SchemaType.OBJECT,
            description: "Rule 7: Veo-native style vocabulary only.",
            properties: {
                veo_native_tags: {
                    type: SchemaType.ARRAY,
                    description: "MUST use exact Veo-trained strings: 'claymation style', 'stop-motion animation', 'Pixar-like 3D animation', 'cel-shaded animation', 'shot on 16mm film, film grain'. No invented tags.",
                    items: { type: SchemaType.STRING }
                },
                fps: {
                    type: SchemaType.NUMBER,
                    description: "12 for stop-motion/claymation stutter. 24 for cinematic. 60 for smooth action."
                },
                motion_quality: {
                    type: SchemaType.STRING,
                    description: "E.g., 'stuttered 12fps kinetics', 'smooth hyperrealistic', 'hand-drawn motion smear'."
                }
            },
            required: ["veo_native_tags", "fps"]
        },

        // --- AUDIO (Rule 4) ---
        audio: {
            type: SchemaType.OBJECT,
            description: "Rule 4: Audio spec. The compiler will convert this into 2–3 inline sentences INSIDE compiled_master_prompt — non-optional.",
            properties: {
                ambient_bed: {
                    type: SchemaType.STRING,
                    description: "Primary ambient sound. E.g., 'rhythmic clay scraping', 'city traffic rain'."
                },
                specific_sfx: {
                    type: SchemaType.STRING,
                    description: "Specific sound effect with timing. E.g., 'soft candlewick crackle, intermittent', 'slow exhale at end'."
                },
                no_dialogue: { type: SchemaType.BOOLEAN, description: "Always true." },
                no_subtitles: { type: SchemaType.BOOLEAN, description: "Always true." },
                no_smooth_interpolation: {
                    type: SchemaType.BOOLEAN,
                    description: "Rule 4: For stop-motion — replaces 'no morphing' tag. Must be true for claymation/stop-motion briefs."
                }
            },
            required: ["ambient_bed", "specific_sfx", "no_dialogue", "no_subtitles"]
        },

        // --- NEGATIVE PROMPTS (Rule 6) ---
        negative_prompts: {
            type: SchemaType.ARRAY,
            description: "Rule 6: Stop-motion failure-mode prevention only. ALWAYS output exactly these 3 for claymation/stop-motion: ['No smooth motion interpolation', 'No morphing between frames', 'No subtitles or text on screen']. ZERO aesthetic negatives.",
            items: { type: SchemaType.STRING }
        },

        // --- COMPILED MASTER PROMPT ★ (THE HERO — Rules 2, 3, 4, 5) ---
        compiled_master_prompt: {
            type: SchemaType.STRING,
            description: "HERO FIELD: Synthesis Layer. 100–150 words of FLUID CINEMATIC PROSE. DO NOT dump tags. Convert all keyframes and beats into a continuous story paragraph with cause-and-effect transitions. Formula: [SHOT] + [SUBJECTS + identity_locks woven] + [ACTION as causal prose] + [SETTING/world_material] + [AESTHETICS] + [AUDIO]. This is the ONLY text sent to Google Flow."
        },

        video_type: {
            type: SchemaType.STRING,
            description: "Classification: 'live-action-photorealistic', '3d-animation', '2d-animation', 'anime', 'stop-motion-claymation', 'mixed-media'."
        }
    },
    required: ["veo_clip", "scene_core", "cinematography", "motion_physics", "temporal_arc", "style", "audio", "negative_prompts", "compiled_master_prompt", "video_type"]
};
