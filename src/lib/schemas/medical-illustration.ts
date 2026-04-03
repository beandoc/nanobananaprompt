import { Schema, SchemaType } from "@google/generative-ai";

/**
 * SOVEREIGN v31 DUAL-TRACK Medical Illustration Schema — Nature/NEJM/Lancet Gold Standard
 *
 * FIVE-LAYER ARCHITECTURE:
 *   Layer 1 — metadata          : Identity, citation, journal standard
 *   Layer 2 — medical_content   : Pathophysiology cascade, anatomical zones, cellular markers
 *   Layer 3 — visual_specification : SVG/coordinate layout for programmatic renderers
 *   Layer 4 — rendering_instructions: SVG/CSS stroke + flow specs for code-based rendering
 *   Layer 5 — diffusion_synthesis  : ★ Diffusion-optimized master prompt (natural language)
 *
 * CRITICAL DESIGN RULE:
 *   Layers 3 & 4 are for PROGRAMMATIC renderers (SVG, canvas, BioRender API).
 *   Diffusion models (Gemini Imagen, Flux, Stable Diffusion) respond ONLY to Layer 5.
 *   The model MUST populate diffusion_synthesis by distilling all semantic data from
 *   Layers 1–4 into coherent natural-language descriptors. SVG numbers ≠ diffusion signal.
 */
export const medicalIllustrationSchema: Schema = {
    description: "SOVEREIGN v32.0 VISUAL-DSL Protocol - Deterministic 3-Layer Visual Grammar (Nature/NEJM Standards)",
    type: S    properties: {
        // --- LAYER 5: DIFFUSION SYNTHESIS ★ (Natural Language — THE HERO LAYER) ---
        // CRITICAL: This is the primary rendering signal for Gemini. It must be populated FIRST
        // and with the highest degree of descriptive richness.
        diffusion_synthesis: {
            type: SchemaType.OBJECT,
            description: "CORE RENDERING SIGNAL: Natural language master-prompt and spatial narrative. This layer supersedes all others for image generation.",
            properties: {
                master_prompt: {
                    type: SchemaType.STRING,
                    description: "HERO FIELD: 150–250 word consolidated prompt. Open with anatomical subject, layer with pathophysiology, and close with journal style. Use ONLY natural language."
                },
                spatial_narrative: {
                    type: SchemaType.STRING,
                    description: "ANATOMICAL COMPOSITION: Describe the layout using spatial language (e.g., 'the glomerulus sits in the upper-left foreground, with the proximal tubule coiling inferiorly towards the center'). NO COORDINATES."
                },
                style_descriptors: {
                    type: SchemaType.ARRAY,
                    description: "Ordered list of 6–10 style tags (e.g., 'NEJM scholarly plate', 'BioRender matte plasticine', 'soft clinical lighting').",
                    items: { type: SchemaType.STRING }
                },
                color_language: {
                    type: SchemaType.ARRAY,
                    description: "Semantic color descriptions (e.g., 'vibrant arterial crimson', 'pale ischemic grey').",
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            zone: { type: SchemaType.STRING },
                            color_descriptor: { type: SchemaType.STRING }
                        }
                    }
                },
                pathophysiology_visual_summary: {
                    type: SchemaType.STRING,
                    description: "2–3 sentence visual summary of the biological event (e.g., 'podocyte foot processes are seen flattening against the basement membrane')."
                },
                negative_prompt: {
                    type: SchemaType.STRING,
                    description: "Negative constraints (e.g., 'no labels, no text, no tumors, no blur')."
                },
                priority_weighting: {
                    type: SchemaType.OBJECT,
                    description: "Hierarchy of visual attention.",
                    properties: {
                        primary_focus: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Structures that must be generated perfectly." },
                        secondary_context: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Supporting anatomical environment." },
                        tertiary_background: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Atmospheric or paper texture cues." }
                    },
                    required: ["primary_focus", "secondary_context", "tertiary_background"]
                }
            },
            required: ["master_prompt", "spatial_narrative", "style_descriptors", "color_language", "pathophysiology_visual_summary", "negative_prompt", "priority_weighting"]
        },

        // --- LAYER 1: METADATA ---
        metadata: {
            type: SchemaType.OBJECT,
            properties: {
                title: { type: SchemaType.STRING },
                subject: { type: SchemaType.STRING },
                journal_standard: { 
                    type: SchemaType.STRING, 
                    format: "enum",
                    enum: ["NEJM_SCHOLARLY_v30_FINAL", "BioRender_Clinical", "Lancet_Minimalist", "Nature_Structural_Biology"],
                    description: "High-impact journal stylistic standard" 
                }
            },
            required: ["title", "subject", "journal_standard"]
        },

        // --- LAYER 2: MEDICAL CONTENT ---
        medical_content: {
            type: SchemaType.OBJECT,
            properties: {
                pathophysiology: {
                    type: SchemaType.OBJECT,
                    properties: {
                        description: { type: SchemaType.STRING },
                        cascade: {
                            type: SchemaType.ARRAY,
                            items: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    step: { type: SchemaType.NUMBER },
                                    event: { type: SchemaType.STRING },
                                    mechanism: { type: SchemaType.STRING },
                                    consequence: { type: SchemaType.STRING }
                                }
                            }
                        }
                    }
                },
                anatomical_zones: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            zone_id: { type: SchemaType.STRING },
                            definition: { type: SchemaType.STRING },
                            spatial_orientation: { type: SchemaType.STRING, description: "Relative positioning (e.g., 'Upper-right quadrant, superficial to the cortex')" }
                        }
                    }
                }
            },
            required: ["pathophysiology", "anatomical_zones"]
        },

        // --- LAYER 3: SPATIAL ARCHITECTURE (Language-Based) ---
        spatial_layout: {
            type: SchemaType.OBJECT,
            description: "Layer 3: Compositional arrangement using relative spatial language instead of coordinates.",
            properties: {
                panels: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            panel_id: { type: SchemaType.STRING },
                            semantic_role: { type: SchemaType.STRING, description: "Purpose of this panel (e.g., 'Macro view of the entire organ')" },
                            relative_placement: { type: SchemaType.STRING, description: "Where this panel sits in the scene (e.g., 'Left-most third of the frame')" },
                            visual_anchor: { type: SchemaType.STRING, description: "The primary structure that anchors this section" }
                        }
                    }
                }
            },
            required: ["panels"]
        },

        // --- LAYER 4: BIOLOGICAL ENTITIES ---
        biological_graph: {
            type: SchemaType.OBJECT,
            description: "Layer 4: Primitives and their interactions.",
            properties: {
                entities: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            id: { type: SchemaType.STRING },
                            label: { type: SchemaType.STRING },
                            anatomical_placement: { type: SchemaType.STRING, description: "Relative position (e.g., 'Internal to the basement membrane, clustered on the left')" },
                            functional_state: { type: SchemaType.STRING }
                        }
                    }
                }
            },
            required: ["entities"]
        }
    },
    required: ["metadata", "medical_content", "spatial_layout", "biological_graph", "diffusion_synthesis"]ts"]
        }
    },
    required: ["metadata", "medical_content", "visual_specification", "rendering_instructions", "diffusion_synthesis"]
};


