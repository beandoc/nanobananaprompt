import atlasData from "./atlas/anatomy-atlas.json";
import glossaryData from "./atlas/medical-ai-glossary.json";

const MEDICAL_SYNONYMS: Record<string, string[]> = {
    "mi": ["myocardial_infarction", "heart_attack", "coronary_occlusion"],
    "hcm": ["hypertrophic_cardiomyopathy", "asymmetric_septal_hypertrophy"],
    "copd": ["chronic_obstructive_pulmonary_disease", "emphysema", "bronchitis"],
    "dvt": ["deep_venous_thrombosis", "venous_thromboembolism"],
    "pe": ["pulmonary_embolism"],
    "ckd": ["chronic_kidney_disease", "renal_failure"],
    "sle": ["systemic_lupus_erythematosus", "lupus"],
    "ra": ["rheumatoid_arthritis"],
    "dm": ["diabetes_mellitus", "diabetic"],
    "gn": ["glomerulonephritis"],
    "ns": ["nephrotic_syndrome"],
    "hf": ["heart_failure", "congestive_heart_failure"],
    "afib": ["atrial_fibrillation"],
    "asv": ["asymmetric_septal_hypertrophy", "cardiomyopathy"],
    "scc": ["squamous_cell_carcinoma"],
    "bcc": ["basal_cell_carcinoma"]
};

export const atlasService = {
    /**
     * Retrieves relevant medical context from the atlas and glossary.
     * Implements relevance ranking and a token-saving limit.
     */
    getAtlasContext(brief: string, maxEntries: number = 4): string {
        const lowerBrief = brief.toLowerCase();
        const tokens = lowerBrief.split(/\W+/);
        
        let context = "\nANATOMY ATLAS REFERENCE & SPATIAL STANDARDS (STRICT ADHERENCE REQUIRED):\n";
        let found = false;

        // 0. Always include Spatial Standards
        const spatial = (atlasData as any).spatial_and_orientational_standards;
        if (spatial) {
            context += `- ORIENTATION & PLANES [GLOBAL STANDARD]:\n`;
            if (spatial.anatomical_planes) {
                context += `  * PLANES: ${Object.entries(spatial.anatomical_planes).map(([k,v]) => `${k.toUpperCase()}(${v})`).join(" | ")}\n`;
            }
            if (spatial.directional_vectors) {
                context += `  * VECTORS: ${Object.entries(spatial.directional_vectors).map(([k,v]) => `${k.toUpperCase()}: ${Array.isArray(v) ? v.join("/") : v}`).join(" | ")}\n`;
            }
            context += `\n`;
        }

        const matches: { title: string; content: string; score: number }[] = [];

        // Helper to check for matches including synonyms
        const getMatchScore = (key: string): number => {
            const cleanKey = key.toLowerCase().replace(/_/g, ' ');
            if (lowerBrief.includes(cleanKey)) return 100;
            
            // Check synonyms
            for (const [abbr, expanded] of Object.entries(MEDICAL_SYNONYMS)) {
                if (tokens.includes(abbr) || lowerBrief.includes(abbr + " ")) {
                    if (expanded.includes(key.toLowerCase())) return 90;
                }
            }

            // Partial word match
            if (key.split('_').some(word => word.length > 3 && lowerBrief.includes(word))) return 50;
            
            return 0;
        };

        // 1. Search Anatomy Atlas
        const categories = Object.keys(atlasData).filter(k => k !== "style_protocols" && k !== "spatial_and_orientational_standards");
        for (const cat of categories) {
            const structures = (atlasData as any)[cat];
            for (const [key, data] of Object.entries(structures as any)) {
                const score = getMatchScore(key);
                if (score > 0) {
                    let entry = `- ${key.toUpperCase()}:\n`;
                    for (const [k, v] of Object.entries(data as any)) {
                        if (k === 'view' || k === 'identity_standard') continue;
                        const label = k.replace(/_/g, ' ').toUpperCase();
                        if (Array.isArray(v)) entry += `  * ${label}: ${v.join(", ")}\n`;
                        else if (typeof v === 'string') entry += `  * ${label}: ${v}\n`;
                    }
                    matches.push({ title: key, content: entry, score });
                }
            }
        }

        // 2. Search Medical AI Glossary
        const glossaryCategories = Object.keys(glossaryData);
        for (const cat of glossaryCategories) {
            const structures = (glossaryData as any)[cat];
            for (const [key, data] of Object.entries(structures as any)) {
                const score = getMatchScore(key);
                if (score > 0) {
                    let entry = `- [GLOSSARY] ${key.toUpperCase()}:\n`;
                    for (const [k, v] of Object.entries(data as any)) {
                        const label = k.replace(/_/g, ' ').toUpperCase();
                        if (Array.isArray(v)) entry += `  * ${label}: ${v.join(", ")}\n`;
                        else if (typeof v === 'string') entry += `  * ${label}: ${v}\n`;
                    }
                    matches.push({ title: key, content: entry, score });
                }
            }
        }

        // Rank by score and limit
        matches.sort((a, b) => b.score - a.score);
        const uniqueMatches = matches.filter((v, i, a) => a.findIndex(t => t.title === v.title) === i);
        
        for (const m of uniqueMatches.slice(0, maxEntries)) {
            found = true;
            context += m.content + "\n";
        }

        return found ? context : "";
    },

    /**
     * Derives a targeted anatomical blacklist based on the primary subject
     */
    getBlacklist(brief: string): string[] {
        const lb = brief.toLowerCase();
        const tokens = lb.split(/\W+/);
        
        const isCardiac = tokens.includes("mi") || tokens.includes("hcm") || ["heart", "cardiac", "myocard", "ventricle", "aorta"].some(k => lb.includes(k));
        const isRenal = tokens.includes("ckd") || tokens.includes("gn") || ["kidney", "renal", "glomerul", "nephr"].some(k => lb.includes(k));
        const isNeuro = ["brain", "neuro", "cortex", "neuron", "synapse"].some(k => lb.includes(k));
        const isPulmonary = tokens.includes("copd") || tokens.includes("pe") || ["lung", "pulmonary", "alveol", "bronch"].some(k => lb.includes(k));

        const baseBanned = ["Tumor core", "Sano Shunt"];

        if (isCardiac) return [...baseBanned, "Glomerulus", "Foot-process", "Alveolus", "Hepatocyte"];
        if (isRenal) return [...baseBanned, "Sarcomere", "Chordae tendineae", "Alveolus"];
        if (isPulmonary) return [...baseBanned, "Glomerulus", "Foot-process", "Sarcomere"];
        if (isNeuro) return [...baseBanned, "Alveolus", "Glomerulus", "Podocyte"];

        return ["Foot-process", "Glomerulus", "Tumor core", "Sano Shunt"];
    },

    getStyleProtocol(style: string): string {
        const lowerStyle = style.toLowerCase();
        const protocols = (atlasData as any).style_protocols || {};
        
        for (const [key, p] of Object.entries(protocols) as [string, any][]) {
            if (lowerStyle.includes(key.toLowerCase())) {
                return `\n${key.toUpperCase()} PUBLICATION PROTOCOL:\n- Shading: ${p.shading}\n- Borders: ${p.borders}\n- Palette: ${p.colors}\n- Metadata: ${p.metadata || 'Scientific Standard'}\n`;
            }
        }
        return "";
    }
};
