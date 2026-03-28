import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { Groq } from "groq-sdk";
import { ResponseManager } from "@/lib/api-response";
import { atlasService } from "@/lib/atlas-service";
import { adCreativeSchema } from "@/lib/schemas/ad-creative";
import { medicalIllustrationSchema } from "@/lib/schemas/medical-illustration";
import { vectorIllustrationSchema } from "@/lib/schemas/vector-branding";
import { storyboardSchema } from "@/lib/schemas/storyboard";
import { comicStripSchema } from "@/lib/schemas/comic-strip";
import { mangaCharacterSchema } from "@/lib/schemas/manga-character";
import { videoIllustrationSchema } from "@/lib/schemas/cinematic-video";
import { foodIllustrationSchema } from "@/lib/schemas/food-illustration";
import { promptService } from "@/lib/prompt-service";
import { infographicSchema } from "@/lib/schemas/infographic";

const schemaMap: any = {
    ad: adCreativeSchema,
    medical: medicalIllustrationSchema,
    vector: vectorIllustrationSchema,
    video: videoIllustrationSchema,
    storyboard: storyboardSchema,
    manga: mangaCharacterSchema,
    comic: comicStripSchema,
    food: foodIllustrationSchema,
    infographic: infographicSchema
};

const creativeProtocols: any = {
    ugc: `\nUGC CREATIVE PROTOCOL:\n- Aesthetic: Raw, candid, shot on mobile device.\n- Lighting: Natural, imperfect, multi-directional ambient light.\n- Texture: Pores visible, slight motion blur, authentic fabric folds.\n- Composition: Uncentered, dynamic, 'in-the-moment' framing.\n`,
    editorial: `\nHIGH-END EDITORIAL PROTOCOL:\n- Aesthetic: Vogue/Harper's Bazaar style, extremely polished.\n- Lighting: Cinematic moody-rim or softbox beauty lighting.\n- Texture: Skin retouching (subtle), high-gloss surfaces, liquid flow physics.\n- Composition: Perfect rule of thirds, architectural depth.\n`,
    ecom: `\nCLEAN E-COMMERCE PROTOCOL:\n- Aesthetic: Minimalist, Apple/Dyson style, distraction-free.\n- Lighting: Bright-diffused daylight, sharp shadow definition on product.\n- Texture: Precise material rendering (matte/glass), crisp edges.\n- Composition: Centered or 60/40 hero product placement.\n`
};

const agentConfigs: any = {
    ad: {
        expansionRole: "Elite Art Director and Prompt Engineer for a high-end DTC creative agency",
        expansionRules: [
            "MISSION: Refine a raw brief into a high-converting 'Visual Ad Concept'.",
            "IDENTITY: IF human characters are featured, they MUST be of Indian descent (South Asian features, modern urban Indian styling, warm olive skin tones). Do not add humans to product-only scenes unless requested.",
            "SENSORY DETAIL EXAMPLES: Your descriptions MUST be exhaustive. Use texture keywords appropriate to the subject (e.g., 'viscous liquid', 'matte cardboard', 'brushed aluminum', 'glistening moisture'). DO NOT use these specific examples if they do not fit the actual subject.",
            "REALISM: Enforce photographic realism ('shot on iPhone 15 Pro' for UGC, '85mm/100mm macro' for Editorial). Capture facial expressions with nuanced emotional keywords (e.g., 'eyes squinted in genuine laughter', 'serene focus').",
            "STRICT BAN: NO conversational fillers, NO text/labels/names in the description paragraph, NO bracket notation.",
            "MATERIAL ATLAS Rule: Differentiate between glossy, matte, satin, and textured surfaces. If the subject is an fruit, focus on skin texture, stem detail, and waxy sheen. If it is hardware, focus on metallic grains and reflections."
        ],
        jsonRole: "High-Performance DTC Ad Director",
        jsonInstructions: (style: string) => `CORE DIRECTIVE: Convert the brief into a high-impact JSON Ad Blueprint.
        STYLE AUTHORITY: Follow a ${style} aesthetic. Use the local creative protocols.
        PROMPT DISTILLATION: In the "core_prompt" field, distill the refined brief into a 50-word HIGH-CONVERSION visual hook. Start with the HERO and end with the ATMOSPHERE. 
        SENSORY LOCK: Ensure at least 3 material texture descriptors (e.g., 'glistening', 'etched', 'velvety') are included in the core_prompt.
        TYPOGRAPHY: Use the "exact_text" field for any copy. Keep it punchy and emotional.
        IDENTITY STANDARD: South Asian features only.`,
    },
    medical: {
        expansionRole: "Principal Medical Illustrator and Scientific Director (SUPER-ENGINE PROTOCOL)",
        expansionRules: [
            "MISSION: Refine a raw brief into a high-fidelity 'Disease Mapping Blueprint' for Nature/NEJM/Lancet standards.",
            "1. STRICT HIERARCHY: Output MUST follow: tissue → micro → cellular → molecular → flow_dynamics → annotations → layout → render_layers.",
            "2. ZERO NARRATIVE: Strictly NO explanations, descriptions, or sentences. Use only structured, renderable data-points.",
            "3. MECHANISM ENCODING: All biological processes MUST be encoded as stepwise pathways/causal relationships (molecule → receptor → effect).",
            "4. SPATIAL ACCURACY: Explicitly define anatomical locations and spatial relationships (e.g. subendothelial vs subepithelial).",
            "5. SPATIAL RESOLUTION: Output MUST lock to High-Fidelity 8K precision. Use ultra-sharp vector line-work and Nature-Gold composition standards.",
            "6. WHITESPACE RULE: Maintain 30% technical whitespace to ensure resolution clarity and prevent label crowding.",
            "7. IDENTITY STANDARD: All human clinical subjects, surgical teams, and patients MUST be of South Asian (Indian) descent.",
            "8. CONSTRAINT RESOLUTION: If conflict occurs: prioritize biological accuracy → then spatial correctness → then visual clarity.",
            "9. ABSTRACTION CONTROL: Include only relevant structures; exclude unrelated anatomy; avoid duplication across layers.",
            "10. DIAGNOSTIC VERIFICATION: MANDATORY - Source 3 SPECIFIC pathognomonic visual markers for the EXACT diagnosis in the brief. STICTLY FORBID using markers from previous Turn-Context (e.g., NO 'Foot-process effacement' or 'Swollen lumen' for cardiac cases).",
            "11. EDITORIAL DIRECTIVES: (a) GRADIENT MANDATE: Use 'diffusion halos' in the visualization descriptions. (b) VECTOR HIERARCHY: Pathological flows MUST use 'fine-dotted' (Low), 'solid-directional' (Moderate), and 'bold-tapered' (High) styles. (c) WHITESPACE RULE: Prevent label overcrowding via logical grouping. (d) SPATIAL LOCK: Explicitly define compass-rule locations (Center-Right, Upper-Margin, etc.) for all major pathology markers. (e) MORPHOLOGY FEATURES: For each cell, describe visual pathological features (e.g. 'swelling', 'effacement'). (f) CAUSAL SEQUENCE: Distill the full mechanism into a linear, step-by-step causal chain. (g) CONTEXT ISOLATION: Purge all unrelated anatomical keywords; ensure EVERY field matches the TARGET anatomy only (e.g. No 'tumor core' in non-oncology briefs).",
            "12. BEHAVIORAL RENDERING: All flow vectors MUST describe their physical action (e.g. 'deflected away from core', 'chemically trapped'). All textures MUST be explicit (e.g. 'micro-fibrillar detailing', 'technical stippling')."
        ],
        jsonRole: "Ultimate Medical Art Director and Clinical Strategist",
        jsonInstructions: (style: string) => `CORE DIRECTIVE: Convert the brief into a Sovereign 12/12 JSON Blueprint (NotebookLM Gold Standard).
        STRICT COMPLIANCE: Adhere to the SUPER-ENGINE PROTOCOL (Hierarchy, Zero-Narrative, Mechanism-Encoding).
        SOVEREIGN POLISH: (1) Populate 'hierarchy' summary as a global attention anchor. (2) Provide 'behavioral rendering' in all visualization fields (action-oriented descriptions). (3) Define 'spatial_lock' for all markers. (4) Map 'optimization_flags' for minimalist clarity. (5) Use deep hex-code mapping in 'palette_hex_logic'.
        IDENTITY LOCK: Enforce South Asian heritage standard.
        STYLE AUTHORITY: Apply the ${style} standard with specific texture/lighting physics.`,
        subjectField: "scientific_subject",
        styleField: "journal_standard",
        styleSuffix: "standard"
    },
    vector: {
        expansionRole: "Principal Brand Designer for Scalable Vector Illustrations",
        expansionRules: [
            "MISSION: Refine a raw brief into a geometric 'Vector Logic Paragraph'.",
            "AESTHETIC: Focus on clean lines, geometric shapes, and flat colors.",
            "IDENTITY: IF human characters are present, they MUST be Indian descent/South Asian features.",
            "STRICT BAN: NO TEXT, noise, blur, or complex textures."
        ],
        jsonRole: "Master Brand Architect",
        jsonInstructions: (style: string) => `CORE DIRECTIVE: Convert the brief into a Scalable Vector JSON Blueprint.
        STYLE AUTHORITY: Use a ${style} framework.
        IDENTITY STANDARD: South Asian features for all human subjects.`,
        // No subjectField overwrite - illustration_subject is detailed
    },
    video: {
        expansionRole: "Cinematic Director for Generative Video Systems",
        expansionRules: [
            "MISSION: Refine a raw brief into a cinematic 'Visual Motion Paragraph'.",
            "MOTION: Describe camera movements (dolly, pan) and object dynamics.",
            "IDENTITY: IF human characters are featured, they MUST be of South Asian descent.",
            "VISUALS: Describe lighting (neon, golden hour) and environment in detail."
        ],
        jsonRole: "Chief Cinematic Engineer",
        jsonInstructions: (style: string) => `CORE DIRECTIVE: Convert the brief into a Video JSON Blueprint.
        STYLE AUTHORITY: Apply a ${style} cinematic aesthetic.`,
        // No subjectField overwrite - description is detailed
    },
    manga: {
        expansionRole: "Manga Concept Artist and Multi-Verse Designer",
        expansionRules: [
            "MISSION: Refine a raw brief into a 'Manga Universe Specification'.",
            "DIVERSITY: Describe how the character adapts across different manga styles (visuals only).",
            "IDENTITY: Character MUST be of Indian/South Asian descent.",
            "STRICT BAN: NO TEXT in the visual description."
        ],
        jsonRole: "Lead Manga Editor",
        jsonInstructions: (style: string) => `CORE DIRECTIVE: Convert the character into a Multi-Universe Manga JSON Blueprint.`,
        // No subjectField overwrite - manga_subject is detailed
    },
    food: {
        expansionRole: "Industrial Food & Beverage Infographic Artist and Culinary Visual Lead",
        expansionRules: [
            "MISSION: Refine a raw brief into a 'Culinary Macro Analysis'.",
            "TEXTURES: Focus on viscous, glistening, fibrous, and flaky textures. Specifically describe 'thermal vapor' (steam) or 'condensation beads' (chilled).",
            "PRODUCT FINISH: Describe glaze levels (e.g., 'high-gloss balsamic-reduction', 'matte flour dusting').",
            "IDENTITY: IF any human is present (chef/user), they MUST be of Indian descent. DO NOT ethnic-ize the food itself unless explicitly requested in the brief (e.g. an 'apple' remains an 'apple', not a 'samosa').",
            "STRICT BAN: NO TEXT or labels."
        ],
        jsonRole: "Culinary Visual Director",
        jsonInstructions: (style: string) => `CORE DIRECTIVE: Convert the brief into a Scientific Culinary JSON Blueprint.
        JOURNAL STANDARD: ${style}-Editorial.
        MATERIAL LOCK: Prioritize 'glistening' and 'texture-rich' descriptors in the scientific_subject.`,
        subjectField: "scientific_subject",
        styleField: "journal_standard",
        styleSuffix: "Editorial"
    },
    comic: {
        expansionRole: "Graphic Novel Stylist and Sequential Art Director",
        expansionRules: [
            "MISSION: Refine a raw brief into a 'Sequential Art Script'.",
            "AESTHETIC: Pro-Graphic Novel style. Heavy G-Pen inking, hand-drawn textures, paper-bleed effects, and subtle CMYK halftone dots.",
            "LIGHTING: High-contrast Chiaroscuro. Use deep, dramatic rim-lighting (golden/blue) and expressive shadows. No flat ambient light.",
            "IDENTITY: All leading characters MUST be of South Asian/Indian descent with rich, authentic skin textures (Shot on 35mm film grain look).",
            "CAST OF CHARACTERS: You MUST identify all recurring characters and populate the 'cast_of_characters' array with hyper-detailed visual anchors (specific face shape, clothing, age, heritage). This is CRITICAL for visual locking.",
            "STRICT BAN: Describe visuals only. No actual text or dialogue in the visual prompt."
        ],
        jsonRole: "Lead Comic Art Director",
        jsonInstructions: (style: string) => `CORE DIRECTIVE: Convert the brief into a 'Pro Graphic Novel' JSON Blueprint.
        ${style === 'marvel-hero-project' ? 'MARVEL-PRO MODE: Enforce vibrant primary colors, cinematic heroic lighting, dynamic low-angle perspective, and clean but expressive black inking. Posing MUST be dynamic (floating, powerful reach, energetic movement).' : ''}
        STYLE LOCK: Enforce high-contrast inking, gritty cinematic textures, and dramatic lighting for every panel. 
        IDENTITY LOCK: Populate the 'cast_of_characters' array with detailed visual descriptions for every recurring character.`
    },
    storyboard: {
        expansionRole: "Cinematic Storyboard Artist and Previs Director",
        expansionRules: [
            "MISSION: Refine a raw brief into a 'Multi-Scene Narrative Flow'.",
            "CONTINUITY: Describe character appearance consistently across all scenes.",
            "IDENTITY: All featured characters MUST be of South Asian descent.",
            "MOTION: Specify camera angles and timing for each shot."
        ],
        jsonRole: "Chief Storyboard Supervisor",
        jsonInstructions: (style: string) => `CORE DIRECTIVE: Convert the brief into a detailed multi-scene Storyboard JSON Blueprint.`
    },
    infographic: {
        expansionRole: "Principal Medical Illustrator and Scientific Director (Sovereign 18.0)",
        expansionRules: [
            "ACT AS A PRINCIPAL MEDICAL ILLUSTRATOR AND SCIENTIFIC DIRECTOR.",
            "FOLLOW THE NEJM DONANEMAB/FLOW SCHOLARLY STANDARDS.",
            "1. COUPLED NARRATIVE: Interventions and outcomes MUST be visually locked in the same vertical column.",
            "2. PRIMARY ENDPOINT: Anchor the central clinical target in the primary_endpoint_headline.",
            "3. SINGLE ACCENT LAW: Use only ONE accent color (e.g. #1A365D). No secondary colors.",
            "4. CLINICAL ICON PRECISION: Use 'IV_Bag', 'Steroid_Vial', 'Pill', 'Infusion', 'Vial', 'Patient_Group'.",
            "5. NEUTRAL INFERENCE: Conclusions must be neutral clinical facts. Avoid 'significantly', 'markedly', or 'dramatically'.",
            "6. 10-WORD VERDICT: Final conclusion must be strictly 5-10 words."
        ],
        jsonInstructions: (style: string) => `### SOVEREIGN 18.0 COUPLED NARRATIVE PROTOCOL
        1. THE NARRATIVE COLUMN: Your 'panels' MUST couple the treatment and its result. Type 'coupled_outcome' is mandatory.
        2. NEUTRALITY LAW: Your 'conclusion_banner.text' must be a neutral inference (e.g. 'No difference in mortality found').
        3. EXPLICIT SCALING: All 'coupled_outcome' units MUST include a 'scale' (e.g. '0_to_40_percent').
        4. PRIMARY SIGNAL: Set 'primary: true' for the central analytic result in the outcome panel.
        
        ### 10/10 JSON TEMPLATE (COUPLED NARRATIVE):
        {
          "title": "Balanced Solutions vs. Saline in Critically Ill Adults",
          "primary_endpoint_headline": { "text": "Death or Renal-Replacement Therapy at Day 90" },
          "panels": [
            { "id": "population", "position": "left", "header": "PARTICIPANTS", "content": [{ "type": "icon_stat", "value": "5037", "label": "Adults in the ICU requiring fluid resuscitation", "icon": "Patient_Group" }] },
            { "id": "arm_1", "position": "center", "header": "BALANCED SOLUTION", "content": [{ "type": "allocation_block", "n": "2515", "icon": "Infusion" }, { "type": "coupled_outcome", "primary": true, "outcome_value": "21.8%", "sub_stat": "N=548", "visual_type": "proportional_bars", "scale": "0_to_30_percent", "label": "Death at 90 days" }] },
            { "id": "arm_2", "position": "right", "header": "SALINE", "content": [{ "type": "allocation_block", "n": "2522", "icon": "Vial" }, { "type": "coupled_outcome", "primary": true, "outcome_value": "22.0%", "sub_stat": "N=556", "visual_type": "proportional_bars", "scale": "0_to_30_percent", "label": "Death at 90 days" }] }
          ],
          "conclusion_banner": { "text": "No significant difference in clinical outcomes between solutions" }
        }
        
        STYLE AUTHORITY: Follow the ${style} standard. Zero decorative noise. Pure clinical flow.`,
        subjectField: "title"
    }
};

const getProtocol = (mode: string, style: string) => {
    const lStyle = style.toLowerCase();
    if (mode === 'ad' || mode === 'food') {
        if (lStyle.includes('ugc')) return creativeProtocols.ugc;
        if (lStyle.includes('editorial')) return creativeProtocols.editorial;
        if (lStyle.includes('ecom')) return creativeProtocols.ecom;
    }
    return atlasService.getStyleProtocol(style);
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { mode = "medical", brief = "", style = "Watercolor-Field-Notes", isStoryboard = false, image = null, assetInstruction = "style", lightweight = false } = body;
        const normalizedStyle = style && style !== "" && style !== "-" ? style : (mode === 'infographic' ? "Nature-Gold-Standard" : (mode === 'medical' ? "NEJM" : "Modern"));

        if (!brief) return ResponseManager.badRequest("No brief provided");

        // Select Config
        const config = agentConfigs[mode] || agentConfigs.medical;

        let refinedText = "";
        let refinementError: Error | null = null;
        let providerHistory: any[] = [];

        const safetySettings = [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ];

        // --- PHASE 1: EXPANSION (STABILIZED) ---
        if (!lightweight) { 
            const atlasContext = mode === 'medical' ? atlasService.getAtlasContext(brief) : "";
            const isInfographic = mode === 'infographic';
            const expansionSystemPrompt = isInfographic 
                ? `### ROLE: Principal Visual Abstract Director
                Refine the user's brief into a high-fidelity 'Visual Abstract Design Specification'.
                1. EXTRACT ALL CLINICAL DATA: Identify N-values, p-values, HR, CI, and primary results.
                2. NEJM ARCHITECTURE: Organize into Cohort, Interventions, and Results.
                3. NO TEXT BAN EXEMPTION: This is a text-heavy infographic. Preserve all numbers and metrics.
                ${config.expansionRules.join('\n        ')}
                STYLE PROTOCOL: ${getProtocol(mode, normalizedStyle)}`
                : `RULE 0 (CRITICAL): MEMORY PURGE. Flush previous anatomy. Focus EXCLUSIVELY on: ${brief.substring(0, 50)}...
                ANATOMICAL BLACKLIST: "Foot-process", "Glomerulus", "Tumor core", "Sano Shunt".
                You are a ${config.expansionRole}. Refine into high-fidelity scientific spec.
                ${config.expansionRules.join('\n        ')}
                STYLE PROTOCOL: ${getProtocol(mode, normalizedStyle)}
                ${atlasContext ? `\nMEDICAL REFERENCE DATA:\n${atlasContext}` : ""}
                HARD ZERO-TEXT BAN: Terminate with: "No text characters, no labels."`;

            if (process.env.GEMINI_API_KEY) {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                // Stabilized IDs: gemini-1.5-flash is the primary to conserve quota
                const modelsToTry = ["gemini-1.5-flash", "gemini-2.0-flash"]; 
                for (const m of modelsToTry) {
                    try {
                        const model = genAI.getGenerativeModel({ model: m, safetySettings });
                        const userParts: any[] = [`EXPAND THIS BRIEF: ${brief}`];
                        if (image) {
                            const base64Data = image.split(',')[1];
                            const mimeType = image.split(';')[0].split(':')[1];
                            userParts.push({ inlineData: { data: base64Data, mimeType } });
                        }
                        const result = await model.generateContent([expansionSystemPrompt, ...userParts]);
                        refinedText = result.response.text().trim();
                        if (refinedText) {
                            providerHistory.push({ phase: "expansion", model: m, status: "success" });
                            break;
                        }
                    } catch (err: any) { 
                        const isQuota = err.message?.includes("429") || err.message?.toLowerCase().includes("quota");
                        const isNotFound = err.message?.includes("404") || err.message?.toLowerCase().includes("not found");
                        providerHistory.push({ phase: "expansion", model: m, status: "fail", error: err.message });
                        refinementError = err as Error;
                        if (isNotFound) continue; 
                        if (isQuota) break; 
                    }
                }
            }

            // Fallback to Groq for expansion
            if (!refinedText && process.env.GROQ_API_KEY) {
                try {
                    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
                    const completion = await groq.chat.completions.create({
                        messages: [
                            { role: "system", content: expansionSystemPrompt },
                            { role: "user", content: `REFINE THIS BRIEF: ${brief}` }
                        ],
                        model: "llama-3.1-8b-instant"
                    });
                    refinedText = completion.choices[0]?.message?.content?.trim() || "";
                    if (refinedText) providerHistory.push({ phase: "expansion", model: "groq-llama-3", status: "success" });
                } catch (err: any) { 
                    providerHistory.push({ phase: "expansion", model: "groq-error", status: "fail", error: err.message });
                    refinementError = err as Error;
                }
            }
        }

        const finalBriefForJson = (lightweight ? brief : refinedText) || brief;
        const currentSchema = (mode === 'comic' && isStoryboard) ? comicStripSchema : (isStoryboard ? storyboardSchema : (schemaMap[mode] || medicalIllustrationSchema));
        const sanitizedStyleName = normalizedStyle.split(' ')[0].replace(/[-,]/g, '');
        
        const systemInstruction = lightweight ? `Return ONLY valid JSON for: "${mode}". SCHEMA: ${JSON.stringify(currentSchema)}` : 
            `### ROLE: ${config.jsonRole}
            ${config.jsonInstructions ? config.jsonInstructions(normalizedStyle) : ""}
            SCHEMA MANDATE: Return JSON strictly following: ${JSON.stringify(currentSchema)}
            NO TEXT LABELS (This rule only applies to medical illustrations, ignore if mode is infographic).`;

        let adData: any = null;
        let generationError: Error | null = null;

        // --- PHASE 2: JSON GENERATION ---
        if (process.env.GEMINI_API_KEY) {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const jsonModels = lightweight ? ["gemini-1.5-flash"] : ["gemini-1.5-flash", "gemini-1.5-pro"];
            
            for (const m of jsonModels) {
                try {
                    const model = genAI.getGenerativeModel({ 
                        model: m, 
                        generationConfig: { responseMimeType: "application/json", responseSchema: currentSchema },
                        safetySettings
                    });
                    const userParts: any[] = [`GENERATE JSON BLUEPRINT FOR: ${finalBriefForJson}`];
                    if (image) {
                        const base64Data = image.split(',')[1];
                        const mimeType = image.split(';')[0].split(':')[1];
                        userParts.push({ inlineData: { data: base64Data, mimeType } });
                    }
                    const result = await model.generateContent([systemInstruction, ...userParts]);
                    adData = JSON.parse(result.response.text());
                    if (adData) {
                        providerHistory.push({ phase: "json", model: m, status: "success" });
                        break;
                    }
                } catch (err: any) { 
                    const isQuota = err.message?.includes("429") || err.message?.toLowerCase().includes("quota");
                    providerHistory.push({ phase: "json", model: m, status: "fail", error: err.message });
                    if (isQuota) break; 
                    generationError = err as Error; 
                }
            }
        }

        // Final Emergency Fallback
        if (!adData && process.env.GROQ_API_KEY) {
            try {
                const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
                const completion = await groq.chat.completions.create({
                    messages: [
                        { role: "system", content: systemInstruction + "\nSCHEMA:\n" + JSON.stringify(currentSchema) },
                        { role: "user", content: `JSON BLUEPRINT FOR: ${finalBriefForJson}` }
                    ],
                    model: "llama-3.1-8b-instant",
                    response_format: { type: "json_object" }
                });
                adData = JSON.parse(completion.choices[0]?.message?.content || "{}");
                if (adData) providerHistory.push({ phase: "json", model: "groq-llama-3", status: "success" });
            } catch (err: any) { 
                providerHistory.push({ phase: "json", model: "groq-fail", status: "fail", error: err.message });
                generationError = err as Error; 
            }
        }

        if (!adData) return ResponseManager.error(`Sovereign Sequence Failure: ${generationError?.message || refinementError?.message || "All cores failed."}`, 500);

        const scrubSubject = (s: string) => s.replace(/^(create|generate|show|make|build|give me|render|draw|an)\s+(an|a|the|image of|illustration of|diagram of|blueprint of|map for)\s+/gi, "").trim();
        const finalSubject = scrubSubject(brief);
        
        if (adData) {
            if (config.subjectField && (!adData[config.subjectField] || adData[config.subjectField].toLowerCase().includes("subject") || adData[config.subjectField].trim().length < 5)) {
                adData[config.subjectField] = finalSubject;
            }
            if (config.styleField && adData[config.styleField] !== undefined) {
                adData[config.styleField] = sanitizedStyleName + (config.styleSuffix ? `-${config.styleSuffix}` : "");
            }
        }

        const filename = `gen-${Date.now()}.json`;
        await promptService.savePrompt({ name: filename, type: mode, content: adData });

        return ResponseManager.success({
            data: adData,
            refinedPrompt: finalBriefForJson,
            promptFile: filename,
            folder: mode + "_prompts",
            providerHistory
        });

    } catch (error: any) {
        console.error("Single-Shot Engine Failure:", error);
        return ResponseManager.error(error.message, 500);
    }
}

