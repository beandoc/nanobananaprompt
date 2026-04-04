import atlasData from "./atlas/anatomy-atlas.json";
import glossaryData from "./atlas/medical-ai-glossary.json";

// Subspecialty Atlases
import nephroData from "./atlas/subspecialties/nephrology-atlas.json";
import cardioData from "./atlas/subspecialties/cardiology-atlas.json";
import gastroData from "./atlas/subspecialties/gastroenterology-atlas.json";
import neuroData from "./atlas/subspecialties/neurology-atlas.json";

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

// Subspecialty Trigger Keywords
const SUBSPECIALTY_TRIGGERS: Record<string, string[]> = {
    "nephrology": ["kidney", "renal", "glomerul", "nephr", "dialysis", "creatinine", "ureter", "fistula", "urology"],
    "cardiology": ["heart", "cardiac", "mi", "myocard", "ventricle", "aorta", "valve", "ecg", "stent", "coronary", "st segment"],
    "gastroenterology": ["liver", "stomach", "portal", "gastro", "intestinal", "colon", "hepatic", "appendix", "esophagus"],
    "neurology": ["brain", "neuro", "cortex", "neuron", "synapse", "csf", "meninges", "stroke", "aneurysm", "cranial"]
};

interface AtlasEntry {
    title: string;
    keywords: string[];
    context: string;
    category: string;
    subspecialty?: string;
}

class AtlasServiceSingleton {
    private _index: AtlasEntry[] | null = null;
    private _keywordMap: Map<string, number[]> = new Map();

    private _initialize() {
        if (this._index) return;
        
        console.time("[Sovereign Atlas] Indexing Engine");
        const flatIndex: AtlasEntry[] = [];
        
        const renderData = (title: string, data: any, prefix: string = "", indent: string = ""): string => {
            if (!data) return "";
            let entry = title ? `${indent}${prefix}${title.toUpperCase()}:\n` : "";
            
            if (typeof data === 'string') return `${indent}${prefix}${title.toUpperCase()}: ${data}\n`;
            if (Array.isArray(data)) {
                data.forEach(item => {
                    if (typeof item === 'string') entry += `${indent}  * ${item.replace(/_/g, ' ')}\n`;
                    else entry += renderData("", item, "", indent + "  ");
                });
                return entry;
            }

            for (const [k, v] of Object.entries(data as any)) {
                if (['view', 'identity_standard', 'engine_name', 'version', 'base_identity'].includes(k)) continue;
                const label = k.replace(/_/g, ' ').toUpperCase();
                
                if (Array.isArray(v)) {
                    entry += `${indent}  * ${label}:\n`;
                    v.forEach(item => {
                        if (typeof item === 'string') entry += `${indent}    - ${item.replace(/_/g, ' ')}\n`;
                        else entry += renderData("", item, "", indent + "    ");
                    });
                } else if (typeof v === 'object' && v !== null) {
                    entry += renderData(k, v, "", indent + "  ");
                } else {
                    entry += `${indent}  * ${label}: ${String(v).replace(/_/g, ' ')}\n`;
                }
            }
            return entry;
        };

        const getKeywords = (title: string, extraData: any = null): string[] => {
            const cleanTitle = title.toLowerCase().replace(/_/g, ' ');
            const terms = [title.toLowerCase(), cleanTitle, ...cleanTitle.split(' ')];
            
            for (const [abbr, expanded] of Object.entries(MEDICAL_SYNONYMS)) {
                if (expanded.includes(title.toLowerCase())) terms.push(abbr);
            }

            if (extraData && typeof extraData === 'object') {
                const searchStr = JSON.stringify(extraData).toLowerCase();
                if (searchStr.includes("glomerulus")) terms.push("glomerulus");
                if (searchStr.includes("heart")) terms.push("heart");
            }

            return Array.from(new Set(terms.filter(t => t.length > 2)));
        };

        const addToIndex = (cat: string, key: string, data: any, prefix: string = "", sub?: string) => {
            const entry: AtlasEntry = {
                title: key,
                keywords: getKeywords(key, data),
                context: renderData(key, data, prefix),
                category: cat,
                subspecialty: sub
            };
            const idx = flatIndex.length;
            flatIndex.push(entry);
            entry.keywords.forEach(kw => {
                const list = this._keywordMap.get(kw) || [];
                list.push(idx);
                this._keywordMap.set(kw, list);
            });
        };

        // 1. Base Atlas
        const categories = Object.keys(atlasData).filter(k => k !== "style_protocols" && k !== "spatial_and_orientational_standards");
        categories.forEach(cat => {
            const structures = (atlasData as any)[cat];
            Object.entries(structures).forEach(([key, data]) => addToIndex(cat, key, data));
        });

        // 2. Subspecialties
        const subData = { nephrology: nephroData, cardiology: cardioData, gastroenterology: gastroData, neurology: neuroData };
        Object.entries(subData).forEach(([sub, data]) => {
            Object.entries(data).forEach(([key, val]) => {
                if (typeof val === 'object' && val !== null) {
                    addToIndex(sub.toUpperCase(), key, val, `[${sub.toUpperCase()}] `, sub);
                }
            });
        });

        // 3. Glossary
        Object.entries(glossaryData).forEach(([cat, structures]) => {
            Object.entries(structures as any).forEach(([key, data]) => addToIndex(cat, key, data, "[GLOSSARY] "));
        });

        this._index = flatIndex;
        console.timeEnd("[Sovereign Atlas] Indexing Engine");
    }

    getAtlasContext(brief: string, maxEntries: number = 4): string {
        this._initialize();
        if (!this._index) return "";

        const lowerBrief = brief.toLowerCase();
        const tokens = lowerBrief.split(/\W+/).filter(t => t.length > 2);
        
        // Detect Active Subspecialties
        const activeSubspecialties = Object.entries(SUBSPECIALTY_TRIGGERS)
            .filter(([_, triggers]) => triggers.some(t => lowerBrief.includes(t)))
            .map(([sub]) => sub);

        let context = "\nANATOMY ATLAS REFERENCE & SPATIAL STANDARDS (STRICT ADHERENCE REQUIRED):\n";

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

        const matchMap: Map<number, number> = new Map();

        for (const token of tokens) {
            const directMatches = this._keywordMap.get(token);
            if (directMatches) {
                directMatches.forEach(idx => {
                    let score = 100;
                    const entry = this._index![idx];
                    if (entry.subspecialty && activeSubspecialties.includes(entry.subspecialty)) score += 200; // HUGE boost for subspecialty relevance
                    matchMap.set(idx, (matchMap.get(idx) || 0) + score);
                });
            }

            for (const [kw, indices] of this._keywordMap.entries()) {
                if (kw.length > 5 && kw.includes(token)) {
                    indices.forEach(idx => {
                        let score = 30;
                        const entry = this._index![idx];
                        if (entry.subspecialty && activeSubspecialties.includes(entry.subspecialty)) score += 50;
                        matchMap.set(idx, (matchMap.get(idx) || 0) + score);
                    });
                }
            }
        }

        const sortedMatches = Array.from(matchMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, maxEntries);

        let found = false;
        for (const [idx] of sortedMatches) {
            found = true;
            context += this._index[idx].context + "\n";
        }

        return found ? context : "";
    }

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
    }

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
}

export const atlasService = new AtlasServiceSingleton();

