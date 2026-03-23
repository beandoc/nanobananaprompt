import { Schema, SchemaType } from "@google/generative-ai";

export const medicalIllustrationSchema: Schema = {
    description: "MASTER-GRADE Medical Illustration Schema - Nature/NEJM Disease Mapping Standard",
    type: SchemaType.OBJECT,
    properties: {
        scientific_subject: { type: SchemaType.STRING },
        illustration_style: {
            type: SchemaType.OBJECT,
            properties: {
                primary: { type: SchemaType.STRING },
                rendering: { type: SchemaType.STRING },
                palette: { 
                    type: SchemaType.OBJECT, 
                    properties: {
                        tissue: { type: SchemaType.STRING },
                        cellular: { type: SchemaType.STRING },
                        molecular: { type: SchemaType.STRING },
                        signaling: { type: SchemaType.STRING }
                    }
                }
            }
        },
        layout: {
            type: SchemaType.OBJECT,
            properties: {
                type: { type: SchemaType.STRING },
                orientation: { type: SchemaType.STRING },
                overlay_mode: { type: SchemaType.STRING },
                depth_order: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                zoom_focus: { type: SchemaType.STRING }
            }
        },
        biological_systems: {
            type: SchemaType.OBJECT,
            properties: {
                tissue: {
                    type: SchemaType.OBJECT,
                    properties: {
                        structures: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                        pathology_manifestation: { type: SchemaType.STRING },
                        spatial_logic: { type: SchemaType.STRING }
                    }
                },
                cellular: {
                    type: SchemaType.OBJECT,
                    properties: {
                        resident_cells: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                        infiltrating_cells: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                        cellular_activity: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
                    }
                },
                molecular: {
                    type: SchemaType.OBJECT,
                    properties: {
                        complexes_used: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                        deposition_rules: { type: SchemaType.STRING },
                        concentration_gradients: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
                    }
                }
            }
        },
        signaling_pathways: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    pathway_name: { type: SchemaType.STRING },
                    sequence_of_events: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                    feedback_logic: { type: SchemaType.STRING },
                    pathological_outcome: { type: SchemaType.STRING }
                }
            }
        },
        annotation_system: {
            type: SchemaType.OBJECT,
            properties: {
                hierarchy: {
                    type: SchemaType.OBJECT,
                    properties: {
                        major: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                        minor: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
                    }
                },
                label_style: { type: SchemaType.STRING }
            }
        },
        visual_constraints: {
            type: SchemaType.OBJECT,
            properties: {
                spatial_accuracy: { type: SchemaType.STRING },
                arrows: { 
                    type: SchemaType.OBJECT,
                    properties: {
                        enabled: { type: SchemaType.BOOLEAN },
                        logic_types: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
                    }
                },
                labels: { type: SchemaType.BOOLEAN }
            }
        },
        render_layers: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        journal_standard: { type: SchemaType.STRING },
        negative_prompt: { type: SchemaType.STRING }
    },
    required: ["scientific_subject", "illustration_style", "layout", "biological_systems", "signaling_pathways", "render_layers", "journal_standard", "negative_prompt"]
};
