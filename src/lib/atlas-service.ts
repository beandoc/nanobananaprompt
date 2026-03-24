import atlasData from "./atlas/anatomy-atlas.json";
import glossaryData from "./atlas/medical-ai-glossary.json";


export const atlasService = {
    getAtlasContext(brief: string): string {
        const lowerBrief = brief.toLowerCase();
        let context = "\nANATOMY ATLAS REFERENCE & SPATIAL STANDARDS (STRICT ADHERENCE REQUIRED):\n";
        let found = false;

        // 0. Always include Spatial Standards for core context
        const spatial = (atlasData as any).spatial_and_orientational_standards;
        if (spatial) {
            context += `- ORIENTATION & PLANES [GLOBAL STANDARD]:\n`;
            if (spatial.anatomical_planes) {
                context += `  * PLANES: ${Object.entries(spatial.anatomical_planes).map(([k,v]) => `${k.toUpperCase()}(${v})`).join(" | ")}\n`;
            }
            if (spatial.directional_vectors) {
                context += `  * VECTORS: ${Object.entries(spatial.directional_vectors).map(([k,v]) => `${k.toUpperCase()}: ${Array.isArray(v) ? v.join("/") : v}`).join(" | ")}\n`;
            }
            if (spatial.depth_hierarchy) {
                context += `  * DEPTH: ${spatial.depth_hierarchy.join(" → ")}\n`;
            }
            context += `\n`;
        }

        // 1. Search Anatomy Atlas
        const categories = Object.keys(atlasData).filter(k => k !== "style_protocols" && k !== "spatial_and_orientational_standards");
        
        for (const cat of categories) {
            const structures = atlasData[cat as keyof typeof atlasData];
            for (const [key, data] of Object.entries(structures)) {
                // Match based on key with underscores replaced
                const matchKey = key.replace(/_/g, ' ');
                if (lowerBrief.includes(matchKey) || key.split('_').some(word => word.length > 2 && lowerBrief.includes(word))) {
                    found = true;
                    context += `- ${key.toUpperCase()}:\n`;
                    for (const [k, v] of Object.entries(data as any)) {
                        if (k === 'view' || k === 'identity_standard') continue;
                        const label = k.replace(/_/g, ' ').toUpperCase();
                        
                        if (Array.isArray(v)) {
                            context += `  * ${label}: ${v.join(", ")}\n`;
                        } else if (typeof v === 'object' && v !== null) {
                             context += `  * ${label}:\n`;
                             for (const [subK, subV] of Object.entries(v)) {
                                 const subLabel = subK.replace(/_/g, ' ').toUpperCase();
                                 context += `    - ${subLabel}: ${Array.isArray(subV) ? subV.join(", ") : subV}\n`;
                             }
                        } else {
                            context += `  * ${label}: ${v}\n`;
                        }
                    }
                    context += "\n";
                }
            }
        }

        // 2. Search Medical AI Glossary
        const glossaryCategories = Object.keys(glossaryData);
        for (const cat of glossaryCategories) {
            const structures = (glossaryData as any)[cat];
            for (const [key, data] of Object.entries(structures as any)) {
                if (lowerBrief.includes(key.toLowerCase().replace(/_/g, ' ')) || key.toLowerCase().split('_').some(word => word.length > 2 && lowerBrief.includes(word))) {
                    found = true;
                    context += `- [GLOSSARY] ${key.toUpperCase()}:\n`;
                    for (const [k, v] of Object.entries(data as any)) {
                        const label = k.replace(/_/g, ' ').toUpperCase();
                        if (Array.isArray(v)) {
                            context += `  * ${label}: ${v.join(", ")}\n`;
                        } else {
                            context += `  * ${label}: ${v}\n`;
                        }
                    }
                    context += "\n";
                }
            }
        }

        return found ? context : "";
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
