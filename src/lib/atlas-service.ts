import atlasData from "./atlas/anatomy-atlas.json";
import glossaryData from "./atlas/medical-ai-glossary.json";


export const atlasService = {
    getAtlasContext(brief: string): string {
        const lowerBrief = brief.toLowerCase();
        let context = "\nANATOMY ATLAS REFERENCE (STRICT ADHERENCE REQUIRED):\n";
        let found = false;

        // 1. Search Anatomy Atlas
        const categories = Object.keys(atlasData).filter(k => k !== "style_protocols");
        
        for (const cat of categories) {
            const structures = atlasData[cat as keyof typeof atlasData];
            for (const [key, data] of Object.entries(structures)) {
                if (lowerBrief.includes(key.replace('_', ' ')) || key.split('_').some(word => lowerBrief.includes(word))) {
                    found = true;
                    context += `- ${key.toUpperCase()}:\n`;
                    if (data.layers) context += `  * LAYERS: ${data.layers.join(", ")}\n`;
                    if (data.structures) context += `  * STRUCTURES: ${data.structures.join(", ")}\n`;
                    if (data.bones) context += `  * BONES: ${data.bones.join(", ")}\n`;
                    if (data.muscles) context += `  * MUSCLES: ${data.muscles.join(", ")}\n`;
                    if (data.features) context += `  * KEY FEATURES: ${data.features.join(", ")}\n`;
                    if (data.landmarks) context += `  * LANDMARKS: ${data.landmarks.join(", ")}\n`;
                    if (data.spaces) context += `  * SPACES: ${data.spaces.join(", ")}\n`;
                    if (data.lobes) context += `  * LOBES: ${data.lobes.join(", ")}\n`;
                    if (data.ligaments) context += `  * LIGAMENTS/ATTACHMENTS: ${data.ligaments.join(", ")}\n`;
                    if (data.biliary_tree) context += `  * BILIARY TREE: ${data.biliary_tree.join(", ")}\n`;
                    if (data.functions) context += `  * BIOLOGICAL FUNCTIONS: ${data.functions.join(", ")}\n`;
                    if (data.cell_types) context += `  * CELL TYPES: ${data.cell_types.join(", ")}\n`;
                    if (data.innate_cells) context += `  * INNATE IMMUNE CELLS: ${data.innate_cells.join(", ")}\n`;
                    if (data.adaptive_cells) context += `  * ADAPTIVE IMMUNE CELLS: ${data.adaptive_cells.join(", ")}\n`;
                    if (data.cell_distribution) {
                        context += `  * CELLULAR ARCHITECTURE:\n`;
                        for (const [zone, cells] of Object.entries(data.cell_distribution)) {
                            context += `    - ${zone.toUpperCase()}: ${(cells as string[]).join(", ")}\n`;
                        }
                    }
                    if (data.morphology) context += `  * CELLULAR MORPHOLOGY: ${data.morphology}\n`;
                    if (data.chemical_bonds) context += `  * CHEMICAL BONDS: ${data.chemical_bonds.join(", ")}\n`;
                    if (data.cellular_elements) context += `  * CELLULAR ELEMENTS: ${data.cellular_elements.join(", ")}\n`;
                    if (data.pathways) context += `  * SIGNALING PATHWAYS: ${data.pathways.join(", ")}\n`;
                    if (data.clinical_features) context += `  * CLINICAL MANIFESTATIONS: ${data.clinical_features.join(", ")}\n`;
                    if (data.symptoms) context += `  * SUBJECTIVE SYMPTOMS: ${data.symptoms.join(", ")}\n`;
                    if (data.cardinal_signs) context += `  * CARDINAL SIGNS OF INFLAMMATION: ${data.cardinal_signs.join(", ")}\n`;
                    if (data.complications) context += `  * POTENTIAL COMPLICATIONS: ${data.complications.join(", ")}\n`;
                    if (data.phases) context += `  * PROCESS PHASES: ${data.phases.join(" → ")}\n`;
                    if (data.mediators) context += `  * CHEMICAL MEDIATORS: ${data.mediators.join(", ")}\n`;
                    if (data.sites) {
                        context += `  * MICROBIAL DISTRIBUTION BY SITE:\n`;
                        for (const [site, flora] of Object.entries(data.sites)) {
                            context += `    - ${site.toUpperCase()}: ${(flora as string[]).join(", ")}\n`;
                        }
                    }
                    if (data.infection_sites) {
                        context += `  * INFECTION SOURCES & PATHOGENS:\n`;
                        for (const [site, pathogens] of Object.entries(data.infection_sites)) {
                            context += `    - ${site.toUpperCase()}: ${(pathogens as string[]).join(", ")}\n`;
                        }
                    }
                    if (data.procedure) context += `  * CLINICAL PROCEDURE: ${data.procedure}\n`;
                    if (data.steps) context += `  * PROCEDURAL STEPS: ${data.steps.join(" → ")}\n`;
                    if (data.systemic_observations) context += `  * SYSTEMIC OBSERVATIONS: ${data.systemic_observations.join(", ")}\n`;
                    if (data.head_and_neck_findings) context += `  * HEAD/NECK FINDINGS: ${data.head_and_neck_findings.join(", ")}\n`;
                    if (data.lymphadenopathy_sites) context += `  * LYMPHADENOPATHY SITES: ${data.lymphadenopathy_sites.join(", ")}\n`;
                    if (data.thoracic_findings) context += `  * THORACIC FINDINGS: ${data.thoracic_findings.join(", ")}\n`;
                    if (data.abdominal_findings) context += `  * ABDOMINAL FINDINGS: ${data.abdominal_findings.join(", ")}\n`;
                    if (data.neurological_findings) context += `  * NEUROLOGICAL FINDINGS: ${data.neurological_findings.join(", ")}\n`;
                    if (data.skeletal_survey) context += `  * SKELETAL FINDINGS: ${data.skeletal_survey.join(", ")}\n`;
                    if (data.peripheral_cutaneous) context += `  * CUTANEOUS/PERIPHERAL FINDINGS: ${data.peripheral_cutaneous.join(", ")}\n`;
                    if (data.cytotoxic_chemotherapy) context += `  * CYTOTOXIC TOXICITIES: ${data.cytotoxic_chemotherapy.join(", ")}\n`;
                    if (data.immunotherapy_irAEs) context += `  * IMMUNOTHERAPY-RELATED (irAEs): ${data.immunotherapy_irAEs.join(", ")}\n`;
                    if (data.targeted_therapy) context += `  * TARGETED THERAPY TOXICITIES: ${data.targeted_therapy.join(", ")}\n`;
                    if (data.radiotherapy_local) context += `  * RADIOTHERAPY LOCAL EFFECTS: ${data.radiotherapy_local.join(", ")}\n`;
                    if (data.hormone_therapy) context += `  * HORMONE THERAPY SIDE EFFECTS: ${data.hormone_therapy.join(", ")}\n`;
                    if (data.neurological) context += `  * NEUROLOGICAL SYMPTOMS: ${data.neurological.join(", ")}\n`;
                    if (data.head_and_neck) context += `  * HEAD/NECK FINDINGS: ${data.head_and_neck.join(", ")}\n`;
                    if (data.respiratory) context += `  * RESPIRATORY FINDINGS: ${data.respiratory.join(", ")}\n`;
                    if (data.cardiovascular) context += `  * CARDIOVASCULAR FINDINGS: ${data.cardiovascular.join(", ")}\n`;
                    if (data.cutaneous) context += `  * CUTANEOUS FINDINGS: ${data.cutaneous.join(", ")}\n`;
                    if (data.gastrointestinal) context += `  * GASTROINTESTINAL FINDINGS: ${data.gastrointestinal.join(", ")}\n`;
                    if (data.monitoring) context += `  * CLINICAL MONITORING: ${data.monitoring.join(", ")}\n`;
                    if (data.interventions) context += `  * MEDICAL INTERVENTIONS: ${data.interventions.join(", ")}\n`;
                    if (data.clinical_markers) context += `  * CLINICAL MARKERS: ${data.clinical_markers.join(", ")}\n`;
                    if (data.macrovascular) context += `  * MACROVASCULAR LEVEL: ${data.macrovascular.join(", ")}\n`;
                    if (data.microvascular) context += `  * MICROVASCULAR LEVEL: ${data.microvascular.join(", ")}\n`;
                    if (data.cellular) context += `  * CELLULAR/MOLECULAR LEVEL: ${data.cellular.join(", ")}\n`;
                    if (data.identity_standard) context += `  * IDENTITY STANDARD: ${data.identity_standard}\n`;
                    if (data.microscopy_styles) context += `  * MICROSCOPY STANDARDS: ${data.microscopy_styles.join(", ")}\n`;
                    if (data.sinuses) context += `  * ANATOMICAL SINUSES: ${data.sinuses.join(", ")}\n`;
                    if (data.testicular_micro) context += `  * TESTICULAR MICRO-ANATOMY: ${data.testicular_micro.join(", ")}\n`;
                    if (data.neurovascular) context += `  * NEUROVASCULAR: ${data.neurovascular.join(", ")}\n`;
                    if (data.arteries) context += `  * ARTERIES: ${data.arteries.join(", ")}\n`;
                    if (data.veins) context += `  * VEINS: ${data.veins.join(", ")}\n`;
                    if (data.textures) context += `  * TARGET TEXTURES: ${data.textures}\n`;
                    if (data.physics) context += `  * TISSUE PHYSICS: ${data.physics}\n`;
                    if (data.neighboring_structures) context += `  * NEIGHBORING ASSETS: ${data.neighboring_structures.join(", ")}\n`;
                    context += "\n";
                }
            }
        }

        // 2. Search Medical AI Glossary (Key Skin Disorders & Lesions)
        const glossaryCategories = Object.keys(glossaryData);
        for (const cat of glossaryCategories) {
            const structures = (glossaryData as any)[cat];
            for (const [key, data] of Object.entries(structures as any)) {
                if (lowerBrief.includes(key.toLowerCase().replace('_', ' ')) || key.toLowerCase().split('_').some(word => lowerBrief.includes(word))) {
                    found = true;
                    const d = data as any;
                    context += `- [GLOSSARY] ${key.toUpperCase()}:\n`;
                    if (d.appearance) context += `  * KEY APPEARANCE: ${d.appearance}\n`;
                    if (d.lesion_type) context += `  * LESION TYPE: ${d.lesion_type}\n`;
                    if (d.color_palette) context += `  * COLOR PALETTE: ${d.color_palette.join(", ")}\n`;
                    if (d.textures) context += `  * SPECIFIC TEXTURES: ${d.textures.join(", ")}\n`;
                    if (d.distribution) context += `  * COMMON DISTRIBUTION: ${d.distribution}\n`;
                    if (d.clinical_notes) context += `  * CLINICAL NOTES: ${d.clinical_notes}\n`;
                    context += "\n";
                }
            }
        }

        return found ? context : "";
    },

    getStyleProtocol(style: string): string {
        const lowerStyle = style.toLowerCase();
        if (lowerStyle.includes("nejm")) {
            const p = atlasData.style_protocols.NEJM;
            return `\nNEJM PUBLICATION PROTOCOL:\n- Shading: ${p.shading}\n- Borders: ${p.borders}\n- Palette: ${p.colors}\n`;
        }
        if (lowerStyle.includes("biorender")) {
            const p = atlasData.style_protocols.BioRender;
            return `\nBIORENDER ASSET PROTOCOL:\n- Shading: ${p.shading}\n- Borders: ${p.borders}\n- Palette: ${p.colors}\n`;
        }
        return "";
    }
};
