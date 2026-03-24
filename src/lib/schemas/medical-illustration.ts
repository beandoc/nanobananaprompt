import { Schema, SchemaType } from "@google/generative-ai";

/**
 * PRODUCTION-GRADE 12/12 Medical Illustration Schema - Nature/NEJM/Lancet Gold Standard
 * STRICT HIERARCHY: tissue → micro → cellular → molecular → flow_dynamics → annotations → layout → render_layers
 * RULES: Zero-Narrative (No sentences), Mechanism-Encoding, Identity-Locked (South Asian)
 */
export const medicalIllustrationSchema: Schema = {
    description: "Sovereign Build Protocol - 12/12 Gold Standard Schema",
    type: SchemaType.OBJECT,
    properties: {
        scientific_subject: { type: SchemaType.STRING },
        illustration_style: {
            type: SchemaType.OBJECT,
            properties: {
                rendering_protocol: { type: SchemaType.STRING },
                palette_hex_logic: { 
                    type: SchemaType.OBJECT, 
                    properties: {
                        tissue: { type: SchemaType.STRING },
                        cellular: { type: SchemaType.STRING },
                        pathological: { type: SchemaType.STRING }
                    }
                }
            }
        },
        
        // --- LEVEL 1: TISSUE ---
        tissue: {
            type: SchemaType.OBJECT,
            properties: {
                target_anatomy: { type: SchemaType.STRING },
                structural_modifications: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
            }
        },

        // --- LEVEL 2: MICRO ---
        micro: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    anatomical_segment: { type: SchemaType.STRING },
                    morphological_integrity: { type: SchemaType.STRING },
                    pathology_markers: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
                }
            }
        },

        // --- LEVEL 3: CELLULAR ---
        cellular: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    cell_population: { type: SchemaType.STRING },
                    pathophysiological_state: { type: SchemaType.STRING },
                    marker_expression: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
                }
            }
        },

        // --- LEVEL 4: MOLECULAR ---
        molecular: {
            type: SchemaType.OBJECT,
            properties: {
                signaling_cascade: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            trigger: { type: SchemaType.STRING },
                            mediator: { type: SchemaType.STRING },
                            outcome: { type: SchemaType.STRING }
                        }
                    }
                },
                biochemical_complexes: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
            }
        },

        // --- LEVEL 5: FLOW DYNAMICS ---
        flow_dynamics: {
            type: SchemaType.OBJECT,
            properties: {
                pathological_flows: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            origin: { type: SchemaType.STRING },
                            destination: { type: SchemaType.STRING },
                            driver: { type: SchemaType.STRING },
                            magnitude: { type: SchemaType.STRING }
                        }
                    }
                }
            }
        },

        // --- LEVEL 6: ANNOTATIONS ---
        annotations: {
            type: SchemaType.OBJECT,
            properties: {
                major: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                minor: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
            }
        },

        // --- LEVEL 7: LAYOUT ---
        layout: {
            type: SchemaType.OBJECT,
            properties: {
                composition_frame: { type: SchemaType.STRING },
                panels: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            id: { type: SchemaType.STRING },
                            focus_anatomy: { type: SchemaType.STRING },
                            zoom_resolution: { type: SchemaType.STRING },
                            bound_vectors: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                            active_layers: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                            rendering_features: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
                        }
                    }
                }
            }
        },

        // --- LEVEL 8: RENDER LAYERS ---
        render_layers: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },

        journal_standard: { type: SchemaType.STRING },
        negative_prompt: { type: SchemaType.STRING }
    },
    required: [
        "scientific_subject", "illustration_style", "tissue", "micro", "cellular", 
        "molecular", "flow_dynamics", "annotations", "layout", "render_layers", 
        "journal_standard", "negative_prompt"
    ]
};

