import { Schema, SchemaType } from "@google/generative-ai";

export const medicalIllustrationSchema: Schema = {
    description: "UHF (Ultra-High-Fidelity) Medical Illustration Schema - Nature/NEJM Gold Standard",
    type: SchemaType.OBJECT,
    properties: {
        scientific_subject: { type: SchemaType.STRING },
        illustration_style: {
            type: SchemaType.OBJECT,
            properties: {
                primary: { type: SchemaType.STRING },
                palette: { type: SchemaType.STRING, description: "Detailed color mapping for major compartments/fluids." },
                rendering: { type: SchemaType.STRING }
            }
        },
        layout: {
            type: SchemaType.OBJECT,
            properties: {
                type: { type: SchemaType.STRING },
                panels: { type: SchemaType.NUMBER },
                zoom_logic: { type: SchemaType.STRING, description: "Target and magnification for inset panels." },
                sequence: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Logical flow sequence for hardware or pathways." }
            }
        },
        hierarchy: {
            type: SchemaType.OBJECT,
            properties: {
                macro: { type: SchemaType.STRING },
                organ: { type: SchemaType.ARRAY, items: { type: SchemaType.OBJECT, properties: { name: { type: SchemaType.STRING }, pathology: { type: SchemaType.STRING } } } },
                micro: { type: SchemaType.OBJECT, properties: { tissue: { type: SchemaType.STRING }, cellular: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } } } },
                molecular: { 
                    type: SchemaType.ARRAY, 
                    items: { 
                        type: SchemaType.OBJECT, 
                        properties: { 
                            name: { type: SchemaType.STRING }, 
                            representation: { type: SchemaType.STRING }, 
                            behavior: { type: SchemaType.STRING, description: "Direction, efficiency, and role." } 
                        } 
                    } 
                }
            }
        },
        flow_dynamics: {
            type: SchemaType.OBJECT,
            properties: {
                compartments: { type: SchemaType.STRING },
                mechanisms: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Diffusion, Convection, Active Transport parameters." },
                solute_vectors: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
            }
        },
        hemodynamics: {
            type: SchemaType.OBJECT,
            properties: {
                pressure_map: { type: SchemaType.STRING, description: "Arterial/Venous/Transmembrane pressure definitions." },
                driving_forces: { type: SchemaType.STRING }
            }
        },
        visual_constraints: {
            type: SchemaType.OBJECT,
            properties: {
                arrows: { type: SchemaType.BOOLEAN },
                labels: { type: SchemaType.BOOLEAN },
                safe_zones: { type: SchemaType.BOOLEAN }
            }
        },
        render_layers: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        journal_standard: { type: SchemaType.STRING },
        negative_prompt: { type: SchemaType.STRING }
    },
    required: ["scientific_subject", "illustration_style", "layout", "hierarchy", "flow_dynamics", "render_layers", "journal_standard", "negative_prompt"]
};
