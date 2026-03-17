import { Schema, SchemaType } from "@google/generative-ai";

export const medicalIllustrationSchema: Schema = {
    description: "Schema for High-Impact Medical Illustrations",
    type: SchemaType.OBJECT,
    properties: {
        scientific_subject: {
            type: SchemaType.STRING,
            description: "Detailed description of the anatomical or clinical subject."
        },
        layout_composition: {
            type: SchemaType.STRING,
            format: "enum",
            enum: ["central-figure-with-callouts", "side-by-side-comparison", "micro-macro-inset", "full-body-pathology-map", "linear-process-flow", "isolated-asset-only"],
            description: "Defines the infographic arrangement. Essential for complex multi-organ views."
        },
        illustration_style: {
            type: SchemaType.STRING,
            format: "enum",
            enum: ["photorealistic-electron-microscopy", "3d-medical-render", "biorender-scientific-vector", "biorender-icon-asset", "biorender-equipment-render", "biorender-musculoskeletal", "biorender-histology-layer", "biorender-pathology-comparison", "biorender-pathway-diagram", "biorender-silhouette-icon", "biorender-systemic-network", "biorender-schematic-flowchart", "biorender-gallery-layout", "biorender-multisystem-pathology", "biorender-mechanism-action", "clean-surgical-sketch", "scientific-diagram", "histology-stained"]
        },
        visual_accuracy: {
            type: SchemaType.OBJECT,
            properties: {
                textures: { type: SchemaType.STRING, description: "Description of tissue textures, e.g., 'fibrous', 'aqueous', 'granulated'." },
                lighting: { type: SchemaType.STRING, format: "enum", enum: ["internal-bioluminescence", "diffused-lab-lighting", "microscopic-focused", "rim-lit-anatomical", "even-ambient-clean", "inflammation-glow"] },
                tissue_physics: { type: SchemaType.STRING, description: "How light interacts with tissue (e.g., 'subsurface scattering in flesh', 'high specular reflection on mucosa')." },
                anatomical_keys: { type: SchemaType.STRING, description: "Critical cellular/anatomical markers to emphasize for publication accuracy." },
                labeling_safe_zones: { type: SchemaType.STRING, description: "Areas to leave clear for future text annotations." }
            },
            required: ["textures", "lighting", "tissue_physics", "anatomical_keys"]
        },
        journal_standard: {
            type: SchemaType.STRING,
            format: "enum",
            enum: ["NEJM-classic", "Nature-modern", "Lancet-descriptive", "Gray-Anatomy-sketch", "BioRender-standard"]
        },
        negative_prompt: {
            type: SchemaType.STRING,
            description: "MANDATORY EXCLUSIONS (always include ALL of these): 'ABSOLUTELY NO TEXT of any kind - no labels, no captions, no titles, no words, no letters, no numbers. No arrows, no leader-lines, no annotations, no callout boxes with text. No medical devices, implants, pacemakers, stents, catheters, or surgical hardware UNLESS explicitly requested in the scientific_subject. No cartoonish rendering, no low-resolution, no inaccurate anatomy, no blood-horror (unless surgical context), no vibrant-neon, no grids, no excessive-gradients'."
        },
        consistent_character: {
            type: SchemaType.STRING,
            format: "enum",
            enum: ["Male-Subject-A", "Female-Subject-B", "No-Human-Figure"],
            description: "Locks the physical characteristics of the human figure for textbook-wide consistency."
        },
        visual_theme: {
            type: SchemaType.STRING,
            format: "enum",
            enum: ["Clinical-Neutral", "Surgical-Blue", "Anatomy-White-Background", "BioRender-Pastel", "Asset-Solo-White", "Ghosted-Anatomy", "Comparison-Split", "Pathway-Logic-Clean", "Silhouette-Blue-Medical", "Inflammation-Overlay", "Systemic-Green-Lymphatic", "Schematic-Logic-White", "Disease-Mapping-Vibrant", "Systemic-Pathogenesis", "BioRender-Warm-Tonal-Ghosting"],
            description: "Forces a consistent color palette across different images. 'BioRender-Warm-Tonal-Ghosting' uses translucent Indian skin tones instead of light gray for ghosted figures."
        }
    },
    required: ["scientific_subject", "layout_composition", "illustration_style", "visual_accuracy", "journal_standard", "negative_prompt", "consistent_character", "visual_theme"]
};
