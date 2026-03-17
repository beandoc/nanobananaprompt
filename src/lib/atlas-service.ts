import atlasData from "./atlas/anatomy-atlas.json";

export const atlasService = {
    getAtlasContext(brief: string): string {
        const lowerBrief = brief.toLowerCase();
        let context = "\nANATOMY ATLAS REFERENCE (STRICT ADHERENCE REQUIRED):\n";
        let found = false;

        // Flatten search
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
