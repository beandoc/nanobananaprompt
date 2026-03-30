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
    description: "SOVEREIGN v31 DUAL-TRACK - Academic Visual Abstract Protocol (NEJM/Nature Gold Standard)",
    type: SchemaType.OBJECT,
    properties: {
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
                },
                citation: {
                    type: SchemaType.OBJECT,
                    properties: {
                        authors_short: { type: SchemaType.STRING },
                        doi: { type: SchemaType.STRING }
                    }
                }
            },
            required: ["title", "subject", "journal_standard"]
        },

        // --- LAYER 2: MEDICAL CONTENT (What story to tell) ---
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
                                    consequence: { type: SchemaType.STRING },
                                    reversibility: { 
                                        type: SchemaType.STRING, 
                                        format: "enum",
                                        enum: ["reversible", "irreversible", "time_dependent"],
                                        description: "Physiological potential for recovery" 
                                    }
                                }
                            }
                        }
                    }
                },
                temporal_cascade: {
                    type: SchemaType.OBJECT,
                    properties: {
                        phase: { type: SchemaType.STRING },
                        timebase_unit: { 
                            type: SchemaType.STRING,
                            format: "enum",
                            enum: ["seconds", "minutes", "hours", "days", "months", "years"],
                            description: "Unit of time for temporal progression"
                        },
                        phases: {
                            type: SchemaType.ARRAY,
                            items: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    phase_id: { type: SchemaType.NUMBER },
                                    name: { type: SchemaType.STRING },
                                    timepoint: { type: SchemaType.NUMBER },
                                    duration: { type: SchemaType.NUMBER },
                                    events: {
                                        type: SchemaType.ARRAY,
                                        items: {
                                            type: SchemaType.OBJECT,
                                            properties: {
                                                event: { type: SchemaType.STRING },
                                                consequence: { type: SchemaType.STRING },
                                                molecular_change: { type: SchemaType.STRING },
                                                visibility: { 
                                                    type: SchemaType.STRING,
                                                    format: "enum",
                                                    enum: ["microscopic", "macroscopic", "molecular", "hidden"],
                                                    description: "Scale of visual representation"
                                                },
                                                salvageability: { 
                                                    type: SchemaType.STRING,
                                                    format: "enum",
                                                    enum: ["high", "moderate", "low", "none", "critical"],
                                                    description: "Clinical priority for intervention"
                                                }
                                            }
                                        }
                                    }
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
                            color_key: { type: SchemaType.STRING, description: "Reference to color_palette key" }
                        }
                    }
                },
                cellular_markers: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            cell_type: { type: SchemaType.STRING },
                            compartment: { type: SchemaType.STRING },
                            change: { type: SchemaType.STRING },
                            driver: { type: SchemaType.STRING }
                        }
                    }
                }
            },
            required: ["pathophysiology", "anatomical_zones"]
        },

        // --- LAYER 3: VISUAL SPECIFICATION ---
        // RENDERER ROUTING:
        //   canvas.*          → PROGRAMMATIC_ONLY (SVG canvas dimensions — ignored by diffusion)
        //   panels[].bounds   → PROGRAMMATIC_ONLY (pixel coordinates — ignored by diffusion)
        //   panels[].entities[].position → PROGRAMMATIC_ONLY (pixel coordinates — ignored by diffusion)
        //   panels[].semantic_role       → ★ DIFFUSION SIGNAL: describe the panel's purpose in words
        //   panels[].entities[].semantic_label → ★ DIFFUSION SIGNAL: describe what this entity IS
        //   color_palette[].semantic_color_name → ★ DIFFUSION SIGNAL: natural language translation of hex
        visual_specification: {
            type: SchemaType.OBJECT,
            properties: {
                canvas: {
                    type: SchemaType.OBJECT,
                    description: "PROGRAMMATIC_ONLY: Canvas dimensions for SVG/code renderers. Diffusion models ignore these values.",
                    properties: {
                        width: { type: SchemaType.NUMBER, description: "PROGRAMMATIC_ONLY" },
                        height: { type: SchemaType.NUMBER, description: "PROGRAMMATIC_ONLY" },
                        background: { type: SchemaType.STRING, description: "Color token for SVG background. PROGRAMMATIC_ONLY." }
                    }
                },
                panels: {
                    type: SchemaType.ARRAY,
                    description: "Layout panels. Each MUST have a semantic_role (diffusion signal) in addition to coordinate bounds (SVG only).",
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            id: { type: SchemaType.STRING },
                            // ★ DIFFUSION SIGNAL — describe the panel purpose in natural language
                            semantic_role: {
                                type: SchemaType.STRING,
                                description: "★ DIFFUSION SIGNAL: Natural language description of what this panel shows and why (e.g. 'Macro cross-section of hypertrophied left ventricle showing asymmetric septal thickening and outflow tract obstruction'). This is the primary rendering cue for diffusion models."
                            },
                            // ★ DIFFUSION SIGNAL — macro or micro scale context
                            scale: {
                                type: SchemaType.STRING,
                                format: "enum",
                                enum: ["macro-organ", "micro-cellular", "molecular", "systemic"],
                                description: "★ DIFFUSION SIGNAL: Visual scale of this panel. Tells diffusion model the magnification level and expected level of anatomical detail."
                            },
                            bounds: {
                                type: SchemaType.OBJECT,
                                description: "PROGRAMMATIC_ONLY: Pixel coordinates for SVG layout. Diffusion models ignore x/y/width/height values entirely.",
                                properties: {
                                    x: { type: SchemaType.NUMBER, description: "PROGRAMMATIC_ONLY" },
                                    y: { type: SchemaType.NUMBER, description: "PROGRAMMATIC_ONLY" },
                                    width: { type: SchemaType.NUMBER, description: "PROGRAMMATIC_ONLY" },
                                    height: { type: SchemaType.NUMBER, description: "PROGRAMMATIC_ONLY" }
                                }
                            },
                            entities: {
                                type: SchemaType.ARRAY,
                                items: {
                                    type: SchemaType.OBJECT,
                                    properties: {
                                        id: { type: SchemaType.STRING },
                                        type: { type: SchemaType.STRING },
                                        // ★ DIFFUSION SIGNAL — what IS this entity?
                                        semantic_label: {
                                            type: SchemaType.STRING,
                                            description: "★ DIFFUSION SIGNAL: Natural language description of this entity (e.g. 'densely packed disorganized myofibrils with chaotic sarcomere alignment', 'fibrotic interstitial collagen deposits appearing as pale white strands between cardiomyocytes'). Diffusion models read this; position values are ignored."
                                        },
                                        position: {
                                            type: SchemaType.OBJECT,
                                            description: "PROGRAMMATIC_ONLY: SVG position. Diffusion models cannot process x/y coordinates.",
                                            properties: {
                                                x: { type: SchemaType.NUMBER, description: "PROGRAMMATIC_ONLY" },
                                                y: { type: SchemaType.NUMBER, description: "PROGRAMMATIC_ONLY" },
                                                width: { type: SchemaType.NUMBER, description: "PROGRAMMATIC_ONLY" },
                                                height: { type: SchemaType.NUMBER, description: "PROGRAMMATIC_ONLY" }
                                            }
                                        },
                                        shape: { type: SchemaType.STRING, description: "PROGRAMMATIC_ONLY: SVG shape primitive." }
                                    }
                                }
                            }
                        }
                    }
                },
                color_palette: {
                    type: SchemaType.ARRAY,
                    description: "Color definitions. hex is PROGRAMMATIC_ONLY. semantic_color_name is ★ DIFFUSION SIGNAL.",
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            key: { type: SchemaType.STRING },
                            hex: { type: SchemaType.STRING, description: "PROGRAMMATIC_ONLY: Hex code for SVG. Diffusion models cannot interpret hex values — use semantic_color_name instead." },
                            // ★ DIFFUSION SIGNAL — translate hex to natural language
                            semantic_color_name: {
                                type: SchemaType.STRING,
                                description: "★ DIFFUSION SIGNAL: Natural language color name that a painter or illustrator would use (e.g. 'muted arterial crimson', 'pale cerulean blue', 'deep necrotic charcoal', 'warm parchment ivory'). This is what diffusion models parse."
                            },
                            semantic: { type: SchemaType.STRING, description: "What physiological state this color encodes." },
                            usage: { type: SchemaType.STRING }
                        }
                    }
                }
            },
            required: ["canvas", "panels", "color_palette"]
        },

        // --- LAYER 4: RENDERING INSTRUCTIONS ---
        // RENDERER ROUTING:
        //   stroke_specifications.*     → PROGRAMMATIC_ONLY (SVG stroke values — ignored by diffusion)
        //   flow_visualization.origin/destination → PROGRAMMATIC_ONLY (pixel coords — ignored by diffusion)
        //   flow_visualization.semantic_description → ★ DIFFUSION SIGNAL
        //   flow_visualization.path_type → marginal diffusion signal (pulsatile/gradient_diffuse have semantic meaning)
        //   layer_stack.z_index/opacity → PROGRAMMATIC_ONLY (depth is inferred semantically by diffusion)
        //   layer_stack.depth_description → ★ DIFFUSION SIGNAL
        //   diffusion_aesthetic.global_style → ★ DIFFUSION SIGNAL (preserved, superseded by Layer 5)
        rendering_instructions: {
            type: SchemaType.OBJECT,
            properties: {
                stroke_specifications: {
                    type: SchemaType.ARRAY,
                    description: "PROGRAMMATIC_ONLY: SVG stroke definitions (stroke_width, stroke_dasharray, opacity). These are CSS/SVG properties — diffusion models cannot interpret numerical stroke values. Populate for SVG renderers only.",
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            id: { type: SchemaType.STRING },
                            stroke_width: { type: SchemaType.NUMBER, description: "PROGRAMMATIC_ONLY: SVG stroke-width in px." },
                            stroke_color: { type: SchemaType.STRING, description: "PROGRAMMATIC_ONLY: SVG stroke hex color." },
                            stroke_dasharray: { type: SchemaType.STRING, description: "PROGRAMMATIC_ONLY: SVG dasharray pattern (e.g. '4,3'). Diffusion models ignore this; describe texture in entities[].semantic_label instead." },
                            opacity: { type: SchemaType.NUMBER, description: "PROGRAMMATIC_ONLY: SVG opacity 0–1." }
                        }
                    }
                },
                flow_visualization: {
                    type: SchemaType.ARRAY,
                    description: "Flow pathway definitions. origin/destination coordinates are PROGRAMMATIC_ONLY. semantic_description is ★ DIFFUSION SIGNAL.",
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            entity_id: { type: SchemaType.STRING },
                            // ★ DIFFUSION SIGNAL — describe the flow in words
                            semantic_description: {
                                type: SchemaType.STRING,
                                description: "★ DIFFUSION SIGNAL: Natural language description of what is flowing, from where to where, and what it signifies visually (e.g. 'turbulent blood flow ejected from hypertrophied left ventricle through narrowed outflow tract, visualized as swirling crimson arrows indicating high-velocity obstruction'). path_type enum has marginal influence; this field is primary."
                            },
                            origin: {
                                type: SchemaType.OBJECT,
                                description: "PROGRAMMATIC_ONLY: SVG coordinate of flow source. Diffusion models ignore x/y pairs.",
                                properties: {
                                    x: { type: SchemaType.NUMBER, description: "PROGRAMMATIC_ONLY" },
                                    y: { type: SchemaType.NUMBER, description: "PROGRAMMATIC_ONLY" }
                                }
                            },
                            destination: {
                                type: SchemaType.OBJECT,
                                description: "PROGRAMMATIC_ONLY: SVG coordinate of flow destination. Diffusion models ignore x/y pairs.",
                                properties: {
                                    x: { type: SchemaType.NUMBER, description: "PROGRAMMATIC_ONLY" },
                                    y: { type: SchemaType.NUMBER, description: "PROGRAMMATIC_ONLY" }
                                }
                            },
                            path_type: { 
                                type: SchemaType.STRING,
                                format: "enum",
                                enum: ["curved", "straight", "pulsatile", "gradient_diffuse"],
                                description: "Marginal diffusion signal: 'pulsatile' and 'gradient_diffuse' carry semantic meaning for diffusion (rhythmic arterial pulse, concentration gradient spread). 'curved'/'straight' are SVG-only. Describe the full flow visually in semantic_description."
                            },
                            marker_end: { type: SchemaType.STRING, description: "PROGRAMMATIC_ONLY: SVG arrowhead marker ID." }
                        }
                    }
                },
                layer_stack: {
                    type: SchemaType.ARRAY,
                    description: "Depth/compositing stack. z_index and opacity are PROGRAMMATIC_ONLY. depth_description is ★ DIFFUSION SIGNAL — Gemini infers depth from spatial and semantic cues, not numerical z-values.",
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            z_index: { type: SchemaType.NUMBER, description: "PROGRAMMATIC_ONLY: CSS z-index for SVG compositing. Diffusion models infer depth from semantic context, not z-values." },
                            name: { type: SchemaType.STRING },
                            opacity: { type: SchemaType.NUMBER, description: "PROGRAMMATIC_ONLY: SVG opacity 0–1. Diffusion infers transparency from semantic descriptions like 'ghost underlay', 'translucent membrane', 'faded background'." },
                            // ★ DIFFUSION SIGNAL — describe depth/layering in words
                            depth_description: {
                                type: SchemaType.STRING,
                                description: "★ DIFFUSION SIGNAL: Natural language description of this layer's visual depth and relationship to other layers (e.g. 'background parchment texture layer, slightly grainy, sits behind all anatomical content', 'foreground molecular pathway overlay, semi-transparent to reveal cellular layer behind it'). This is the primary compositing cue for diffusion."
                            }
                        }
                    }
                },
                diffusion_aesthetic: {
                    type: SchemaType.OBJECT,
                    description: "Legacy diffusion style block. global_style is a ★ DIFFUSION SIGNAL. Superseded by diffusion_synthesis (Layer 5) but preserved for backward compatibility.",
                    properties: {
                        global_style: { type: SchemaType.STRING, description: "★ DIFFUSION SIGNAL: Global style descriptor for the entire illustration (e.g. 'NEJM scholarly medical plate on cream parchment, BioRender-style clinical accuracy, muted academic color palette, subtle paper grain texture')." },
                        negative_prompt: { type: SchemaType.STRING, description: "★ DIFFUSION SIGNAL: Negative prompt for diffusion model." }
                    }
                }
            },
            required: ["stroke_specifications", "layer_stack", "diffusion_aesthetic"]
        },

        // --- LAYER 5: DIFFUSION SYNTHESIS ★ (Natural Language — Diffusion-Optimized) ---
        // This layer is the PRIMARY signal for Gemini Imagen, Flux, and Stable Diffusion.
        // It MUST be populated by synthesizing the semantic richness of Layers 1–2
        // into coherent natural-language descriptors. SVG coordinates and stroke values
        // from Layers 3–4 are IGNORED by diffusion models and MUST NOT appear here.
        diffusion_synthesis: {
            type: SchemaType.OBJECT,
            description: "Diffusion-model master prompt layer. Natural language ONLY. No SVG values, no coordinates, no hex codes.",
            properties: {
                master_prompt: {
                    type: SchemaType.STRING,
                    description: "150–220 word consolidated prompt for diffusion. Opens with anatomical subject, layered with pathophysiology narrative, closes with journal aesthetic descriptors. Must be a single coherent paragraph."
                },
                anatomical_narrative: {
                    type: SchemaType.STRING,
                    description: "Spatial description of how structures are arranged. Use compass/anatomical terminology (superior, subendothelial, lateral) — NOT pixel coordinates."
                },
                style_descriptors: {
                    type: SchemaType.ARRAY,
                    description: "Ordered list of 6–10 diffusion-friendly style tags. Use terms like 'NEJM scholarly plate', 'BioRender aesthetic', 'heavy paper grain', 'muted clinical palette'. NO hex codes.",
                    items: { type: SchemaType.STRING }
                },
                color_language: {
                    type: SchemaType.ARRAY,
                    description: "Semantic color descriptions for each anatomical zone. Translate hex codes into natural descriptors (e.g. 'deep arterial crimson for ischemic zones', 'pale cerulean for healthy myocardium').",
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
                    description: "2–3 sentence natural-language summary of the key visual story (e.g. 'Sarcomere disarray seen as irregular fibril bundles in the hypertrophied left ventricle wall...'). This directly maps to what a diffusion model renders."
                },
                negative_prompt: {
                    type: SchemaType.STRING,
                    description: "Diffusion negative prompt. Explicitly ban non-anatomical or cross-domain hallucinations relevant to this brief (e.g. 'no glomeruli, no tumor masses, no IV lines, no text labels, no photorealism, no decorative borders')."
                }
            },
            required: ["master_prompt", "anatomical_narrative", "style_descriptors", "color_language", "pathophysiology_visual_summary", "negative_prompt"]
        }
    },
    required: ["metadata", "medical_content", "visual_specification", "rendering_instructions", "diffusion_synthesis"]
};


