import { Schema, SchemaType } from "@google/generative-ai";

/**
 * SOVEREIGN CINEMATIC ENGINE v10.0 — The Master Ontology
 * Single ontology: Grounded physical realism across all generation domains.
 */
export const videoIllustrationSchema: Schema = {
    description: "Sovereign Cinematic Engine v10.0 — Pure Photorealistic Single Ontology",
    type: SchemaType.OBJECT,
    properties: {
        veo_clip: {
            type: SchemaType.OBJECT,
            properties: {
                duration_seconds: { type: SchemaType.NUMBER },
                resolution: { type: SchemaType.STRING },
                aspect_ratio: { type: SchemaType.STRING },
                audio_enabled: { type: SchemaType.BOOLEAN }
            },
            required: ["duration_seconds", "resolution", "aspect_ratio", "audio_enabled"]
        },
        clip_strategy: {
            type: SchemaType.OBJECT,
            properties: {
                mode: { type: SchemaType.STRING },
                clip_count: { type: SchemaType.NUMBER },
                duration_seconds: { type: SchemaType.NUMBER },
                beat_count: { type: SchemaType.NUMBER },
                handoff_method: { type: SchemaType.STRING },
                split_recommended: { type: SchemaType.BOOLEAN }
            },
            required: ["mode", "clip_count", "duration_seconds", "beat_count", "split_recommended"]
        },
        scene_core: {
            type: SchemaType.OBJECT,
            properties: {
                subject: { type: SchemaType.STRING },
                identity_locks: {
                    type: SchemaType.OBJECT,
                    properties: {
                        age_descriptor: { type: SchemaType.STRING },
                        ethnicity: { type: SchemaType.STRING, description: "MANDATORY: 'Indian' or 'South Asian'." },
                        gender: { type: SchemaType.STRING },
                        build: { type: SchemaType.STRING },
                        wardrobe: {
                            type: SchemaType.OBJECT,
                            properties: {
                                primary: { type: SchemaType.STRING },
                                material_behavior: { type: SchemaType.STRING }
                            }
                        },
                        skin_tone: { type: SchemaType.STRING }
                    }
                },
                environment: {
                    type: SchemaType.OBJECT,
                    properties: {
                        location: { type: SchemaType.STRING },
                        surface: { type: SchemaType.STRING },
                        time_of_day: { type: SchemaType.STRING },
                        lighting_condition: { type: SchemaType.STRING }
                    }
                },
                action_sequence: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            beat: { type: SchemaType.NUMBER },
                            action: { type: SchemaType.STRING },
                            motion_quality: { type: SchemaType.STRING },
                            duration_ratio: { type: SchemaType.NUMBER }
                        }
                    }
                }
            },
            required: ["subject", "identity_locks", "environment", "action_sequence"]
        },
        cinematography: {
            type: SchemaType.OBJECT,
            properties: {
                shot_type: { type: SchemaType.STRING },
                camera_platform: { type: SchemaType.STRING },
                camera_movement: { type: SchemaType.STRING },
                stabilization: { type: SchemaType.STRING },
                lens: { type: SchemaType.STRING },
                depth_of_field: { type: SchemaType.STRING },
                framing_consistency: { type: SchemaType.STRING }
            },
            required: ["shot_type", "lens", "depth_of_field"]
        },
        lighting: {
            type: SchemaType.OBJECT,
            properties: {
                source: { type: SchemaType.STRING },
                colour_temp_K: { type: SchemaType.NUMBER },
                direction: { type: SchemaType.STRING },
                shadow_behavior: { type: SchemaType.STRING },
                volumetrics: { type: SchemaType.STRING }
            },
            required: ["source", "colour_temp_K"]
        },
        motion_physics: {
            type: SchemaType.OBJECT,
            properties: {
                wind_source: { type: SchemaType.STRING },
                cloth_simulation: { type: SchemaType.STRING },
                dust_dynamics: {
                    type: SchemaType.OBJECT,
                    properties: {
                        behavior: { type: SchemaType.STRING },
                        particle_size: { type: SchemaType.STRING }
                    }
                },
                rain_interaction: {
                    type: SchemaType.OBJECT,
                    properties: {
                        tire_spray: { type: SchemaType.STRING },
                        surface_response: { type: SchemaType.STRING },
                        impact_pattern: { type: SchemaType.STRING }
                    }
                },
                consistency_rules: {
                    type: SchemaType.ARRAY,
                    items: { type: SchemaType.STRING }
                }
            }
        },
        temporal_arc: {
            type: SchemaType.OBJECT,
            properties: {
                total_duration_seconds: { type: SchemaType.NUMBER },
                phases: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            phase: { type: SchemaType.STRING },
                            time_range: { type: SchemaType.STRING }
                        }
                    }
                }
            }
        },
        style: {
            type: SchemaType.OBJECT,
            properties: {
                visual_mode: { type: SchemaType.STRING },
                grade_profile: { type: SchemaType.STRING },
                fps: { type: SchemaType.NUMBER },
                motion_quality: { type: SchemaType.STRING }
            },
            required: ["visual_mode", "fps"]
        },
        audio: {
            type: SchemaType.OBJECT,
            properties: {
                ambient_bed: { type: SchemaType.STRING },
                specific_sfx: {
                    type: SchemaType.ARRAY,
                    items: { type: SchemaType.STRING }
                },
                dialogue: { type: SchemaType.STRING }
            }
        },
        constraints: {
            type: SchemaType.OBJECT,
            properties: {
                forbidden: {
                    type: SchemaType.ARRAY,
                    items: { type: SchemaType.STRING }
                },
                required_consistency: {
                    type: SchemaType.ARRAY,
                    items: { type: SchemaType.STRING }
                }
            }
        },
        validation_report: {
            type: SchemaType.OBJECT,
            properties: {
                style_check: { 
                    type: SchemaType.OBJECT,
                    properties: {
                        status: { type: SchemaType.STRING },
                        rule_id: { type: SchemaType.STRING }
                    }
                },
                physics_check: { 
                    type: SchemaType.OBJECT,
                    properties: {
                        status: { type: SchemaType.STRING },
                        rule_id: { type: SchemaType.STRING }
                    }
                },
                conflict_check: { 
                    type: SchemaType.OBJECT,
                    properties: {
                        status: { type: SchemaType.STRING },
                        rule_id: { type: SchemaType.STRING }
                    }
                }
            }
        },
        compiled_master_prompt: {
            type: SchemaType.STRING,
            description: "HERO FIELD: The final dense 150-word synthesis."
        }
    },
    required: ["veo_clip", "clip_strategy", "scene_core", "cinematography", "lighting", "motion_physics", "temporal_arc", "style", "audio", "constraints", "validation_report", "compiled_master_prompt"]
};
