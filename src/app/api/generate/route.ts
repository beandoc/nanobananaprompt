import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60; // Extend Vercel Serverless function timeout to 60s (Hobby max)

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
    ugc: `\nUGC CREATIVE PROTOCOL:\n- Aesthetic: Raw, candid, shot on mobile device.\n- Lighting: Natural, imperfect, multi-directional ambient light.\n- Texture: Pores visible, authentic fabric folds.\n`,
    editorial: `\nHIGH-END EDITORIAL PROTOCOL:\n- Aesthetic: Vogue/Harper's Bazaar style, extremely polished.\n- Lighting: Cinematic moody-rim or softbox beauty lighting.\n`,
    ecom: `\nCLEAN E-COMMERCE PROTOCOL:\n- Aesthetic: Minimalist, Apple/Dyson style, distraction-free.\n- Lighting: Bright-diffused daylight, sharp shadow definition on product.\n`
};

const agentConfigs: any = {
    ad: {
        expansionRole: "Elite Art Director and Prompt Engineer",
        expansionRules: ["1. IDENTITY: South Asian heritage only.", "2. SENSORY: Use rich texture keywords."],
        jsonRole: "High-Performance DTC Ad Director",
        jsonInstructions: (style: string) => `CORE DIRECTIVE: Convert brief into Ad JSON. Style: ${style}.`
    },
    medical: {
        expansionRole: "Sovereign Medical Visual Grammar Engine (v32.50 - PATHODYNAMIC MASTER)",
        expansionRules: [
            "1. IDENTITY LOCK: All human clinical subjects, patients, and surgical teams MUST be of South Asian (Indian) descent with authentic features and warm skin tones.",
            "2. ANTI-LEAKAGE: STRICTLY NO TEXT LABELS. Do NOT render JSON keys, entity IDs (e.g., ent_beta), coordinates, or numbers in the image.",
            "3. CAUSAL SEPARATION: Separate disease pathogenesis (e.g., high glucose in T1DM) from treatment complications (e.g., iatrogenic hypoglycemia). Do NOT blend them.",
            "4. PATHODYNAMIC LAW: Mandate flow direction vectors and concentration gradients.",
            "5. NARRATIVE PROGRESSION: For complex briefs, use a 3-panel sequential layout for high-fidelity storytelling.",
            "6. SILENT-MASTER: In diffusion_synthesis.master_prompt, describe visuals using terminology (e.g., 'medial', 'proximal', 'stippled texture')—NEVER use JSON property names, IDs, or numeric coordinates."
        ],
        jsonRole: "Director of Dynamic Clinical Physics",
        jsonInstructions: (style: string) => {
            const styleLock = style.toLowerCase().includes('nejm') || style.toLowerCase().includes('journal') || style.toLowerCase().includes('scholarly') ? 'SCHOLARLY_NEJM' : 'BIORENDER_MODERN';
            return `### SOVEREIGN v32.50 MEDICAL ILLUSTRATION PROTOCOL
1. STYLE: Apply ${styleLock} aesthetic to the anatomical scene.
2. IDENTITY: Mandate South Asian (Indian) descent in diffusion_synthesis.
3. ANTI-LEAK: Explicitly ban JSON keys, IDs, and coordinates from the visual rendering.
4. ARCHITECTURE: 3-Panel Sequential Narrative (Trigger -> Execution -> Systemic Result).`;
        },
        subjectPath: "metadata.subject",
        stylePath: "metadata.journal_standard",
        styleSuffix: "v32.50_ILLUSTRATION"
    },
    infographic: {
        expansionRole: "Principal NEJM Scholarly Plate Architect (SVAE v3.50 - NEJM-COLUMNAR Standard)",
        expansionRules: [
            "1. NEJM VERTICALITY: Strict 3-Column Layout: Left (Population/Sidebar) | Middle (Treatment/Intervention) | Right (Placebo/Comparator).",
            "2. ENDPOINT ROWS: outcomes must be rendered as horizontal rows crossing the Middle and Right columns.",
            "3. STATISTICAL SUB-TEXT: HR, 95% CI, and P-values must be placed immediately under the primary result in each cell.",
            "4. COLUMNAR SHADING: Apply unique fill colors to Middle and Right columns for visual separation.",
            "5. HEADER PRIMITIVES: Place primary clinical mechanism (Syringe, Pill, IV Bag) in the top-header of each column.",
            "6. NO FLOATING CARDS: This is a single, integrated horizontal-vertical grid."
        ],
        jsonRole: "Director of High-Impact Visual Abstracts",
        jsonInstructions: (style: string) => `### SVAE v3.50 NEJM-COLUMNAR PROTOCOL
1. ARCHITECTURE: Population (Sidebar) | Intervention (Col A) | Control (Col B).
2. ENDPOINTS: Map clinical results horizontally across Col A and Col B.
3. STATISTICS: Pair every result with its (HR, 95% CI, P) block.
4. PRIMITIVES: Header Mechanism Icons for each column.
5. IDENTITY: South Asian patient silhouettes in the Population sidebar.`,
        subjectPath: "metadata.subject",
        stylePath: "metadata.journal_standard",
        styleSuffix: "v3.50_NEJM_COLUMNAR"
    },
    vector: {
        expansionRole: "Principal Brand Designer",
        expansionRules: ["1. IDENTITY: South Asian heritage only.", "2. AESTHETIC: Clean geometric lines."],
        jsonRole: "Master Brand Architect",
        jsonInstructions: (style: string) => `CORE DIRECTIVE: Convert brief into Vector JSON. Style: ${style}.`
    },
    video: {
        expansionRole: "Cinematic Director",
        expansionRules: ["1. IDENTITY: South Asian heritage only.", "2. MOTION: Describe camera dolly/pan."],
        jsonRole: "Chief Cinematic Engineer",
        jsonInstructions: (style: string) => `CORE DIRECTIVE: Convert brief into Video JSON. Style: ${style}.`
    },
    manga: {
        expansionRole: "Manga Concept Artist",
        expansionRules: ["1. IDENTITY: South Asian characters only.", "2. AESTHETIC: Pro Manga inking."],
        jsonRole: "Lead Manga Editor",
        jsonInstructions: (style: string) => `CORE DIRECTIVE: Convert to Manga JSON.`
    },
    food: {
        expansionRole: "Industrial Food Infographic Artist",
        expansionRules: ["1. IDENTITY: Indian heritage for chefs.", "2. TEXTURES: Glistening/Steam."],
        jsonRole: "Culinary Visual Director",
        jsonInstructions: (style: string) => `CORE DIRECTIVE: Convert to Food JSON. Journal: ${style}.`
    },
    comic: {
        expansionRole: "Sequential Art Director",
        expansionRules: ["1. IDENTITY: South Asian heritage only.", "2. AESTHETIC: Pro Graphic Novel and cinematic lighting."],
        jsonRole: "Lead Comic Art Director",
        jsonInstructions: (style: string) => `CORE DIRECTIVE: Convert to Comic Script JSON.`
    },
    storyboard: {
        expansionRole: "Storyboarding Previs Director",
        expansionRules: ["1. IDENTITY: South Asian heritage only.", "2. CONTINUITY: Consistent appearance."],
        jsonRole: "Chief Storyboard Supervisor",
        jsonInstructions: (style: string) => `CORE DIRECTIVE: Convert to Storyboard JSON.`
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

/**
 * Derives a dynamic anatomical blacklist from the user's brief.
 * Extracts the primary anatomical subject and bans unrelated canonical landmarks
 * to prevent the model from hallucinating anatomy from previous requests.
 */
const getDynamicBlacklist = (brief: string): string => {
    const list = atlasService.getBlacklist(brief);
    if (list.length > 0) {
        return `ANATOMICAL BLACKLIST (derived from your brief): ${list.map(b => `"${b}"`).join(", ")}. These structures are FORBIDDEN. Do NOT include, reference, or imply them.`;
    }
    return `ANATOMICAL BLACKLIST: "Foot-process", "Glomerulus", "Tumor core", "Sano Shunt". These structures are FORBIDDEN unless explicitly in the brief.`;
};

/**
 * Post-generation validator for medical JSON output.
 * Returns { valid: boolean, issues: string[] }
 */
const validateMedicalOutput = (data: any): { valid: boolean; issues: string[] } => {
    const issues: string[] = [];

    // Check pathophysiology cascade is populated
    const cascade = data?.medical_content?.pathophysiology?.cascade;
    if (!Array.isArray(cascade) || cascade.length === 0) {
        issues.push("pathophysiology.cascade is empty or missing");
    } else {
        const placeholderPattern = /^(step|event|mechanism|consequence|placeholder|\[|TBD|N\/A)$/i;
        cascade.forEach((step: any, i: number) => {
            if (!step.event || placeholderPattern.test(step.event.trim())) {
                issues.push(`pathophysiology.cascade[${i}].event is a placeholder or empty: "${step.event}"`);
            }
        });
    }

    // Check anatomical zones are populated
    const zones = data?.medical_content?.anatomical_zones;
    if (!Array.isArray(zones) || zones.length === 0) {
        issues.push("medical_content.anatomical_zones is empty or missing");
    } else {
        zones.forEach((z: any, i: number) => {
            if (!z.definition || z.definition.trim().length < 5) {
                issues.push(`anatomical_zones[${i}].definition is missing or too short`);
            }
        });
    }

    // Check visual panels exist
    const panels = data?.visual_specification?.panels;
    if (!Array.isArray(panels) || panels.length < 2) {
        issues.push("visual_specification.panels must have at least 2 panels (macro + micro)");
    }

    // Check diffusion_synthesis is populated (the critical Layer 5)
    const ds = data?.diffusion_synthesis;
    if (!ds) {
        issues.push("diffusion_synthesis (Layer 5) is entirely missing — diffusion models have no rendering signal");
    } else {
        if (!ds.master_prompt || ds.master_prompt.trim().length < 50) {
            issues.push("diffusion_synthesis.master_prompt is missing or too short (needs 150-220 words)");
        }
        if (!Array.isArray(ds.style_descriptors) || ds.style_descriptors.length < 3) {
            issues.push("diffusion_synthesis.style_descriptors must have at least 3 entries");
        }
        if (!Array.isArray(ds.color_language) || ds.color_language.length === 0) {
            issues.push("diffusion_synthesis.color_language is empty — hex codes from Layer 3 were not translated to natural language");
        }
        if (!ds.negative_prompt || ds.negative_prompt.trim().length < 10) {
            issues.push("diffusion_synthesis.negative_prompt is missing");
        }
        // Guard against SVG bleed-through (common model error: copying coordinates into master_prompt)
        const svgLeakPattern = /stroke_dasharray|stroke_width|z_index|\{\s*x:\s*\d|\{\s*y:\s*\d|#[0-9a-fA-F]{6}/;
        if (svgLeakPattern.test(ds.master_prompt || "")) {
            issues.push("diffusion_synthesis.master_prompt contains SVG/CSS values or hex codes — these are invisible to diffusion models and must be translated to natural language");
        }

        // Guard against ID/Property name leakage (e.g., 'ent_beta' or 'p1_micro' appearing in text)
        const idLeakPattern = /ent_|panel_|p1_|p2_|p3_|\w+_\w+/;
        if (idLeakPattern.test(ds.master_prompt || "")) {
            issues.push("diffusion_synthesis.master_prompt contains internal JSON property names or IDs (e.g., 'ent_beta') — this causes 'ID Leakage' in the rendered image. Remove these technical markers.");
        }
    }

    return { valid: issues.length === 0, issues };
};

/**
 * Post-generation validator for infographic JSON output.
 */
const validateInfographicOutput = (data: any): { valid: boolean; issues: string[] } => {
    const issues: string[] = [];

    // Check medical content
    const interventions = data?.medical_content?.interventions;
    if (!Array.isArray(interventions) || interventions.length === 0) {
        issues.push("medical_content.interventions is missing trial arms");
    }

    // Check for Layer 5
    const ds = data?.diffusion_synthesis;
    if (!ds) {
        issues.push("diffusion_synthesis (Layer 5) is missing");
    } else {
        if (!ds.master_prompt || ds.master_prompt.trim().length < 50) {
            issues.push("diffusion_synthesis.master_prompt is too short");
        }
        const svgLeakPattern = /stroke_dasharray|stroke_width|z_index|\{\s*x:\s*\d|\{\s*y:\s*\d|#[0-9a-fA-F]{6}/;
        if (svgLeakPattern.test(ds.master_prompt || "")) {
            issues.push("diffusion_synthesis.master_prompt contains SVG/CSS or hex leaks");
        }
    }

    return { valid: issues.length === 0, issues };
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
            const atlasContext = (mode === 'medical' || mode === 'infographic') ? atlasService.getAtlasContext(brief) : "";
            const isInfographic = mode === 'infographic';
            const dynamicBlacklist = (mode === 'medical' || mode === 'infographic') ? getDynamicBlacklist(brief) : "";
            const expansionSystemPrompt = isInfographic 
                ? `### ROLE: Principal Visual Abstract Director
                Refine the user's brief into a high-fidelity 'Visual Abstract Design Specification'.
                1. EXTRACT ALL CLINICAL DATA: Identify N-values, p-values, HR, CI, and primary results.
                2. NEJM ARCHITECTURE: Organize into Cohort, Interventions, and Results.
                3. NO TEXT BAN EXEMPTION: This is a text-heavy infographic. Preserve all numbers and metrics.
                ${dynamicBlacklist}
                ${config.expansionRules.join('\n        ')}
                STYLE PROTOCOL: ${getProtocol(mode, normalizedStyle)}
                ${atlasContext ? `\nMEDICAL REFERENCE DATA:\n${atlasContext}` : ""}`
                : `RULE 0 (CRITICAL): MEMORY PURGE. Flush previous anatomy. Focus EXCLUSIVELY on: ${brief.substring(0, 50)}...
                ${dynamicBlacklist}
                You are a ${config.expansionRole}. Refine into high-fidelity scientific spec.
                ${config.expansionRules.join('\n        ')}
                STYLE PROTOCOL: ${getProtocol(mode, normalizedStyle)}
                ${atlasContext ? `\nMEDICAL REFERENCE DATA:\n${atlasContext}` : ""}
                HARD ZERO-TEXT BAN: Terminate with: "No text characters, no labels."`;

            if (process.env.GEMINI_API_KEY) {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
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
                        providerHistory.push({ phase: "expansion", model: m, status: "fail", error: err.message, isQuota });
                        
                        if (isQuota) {
                            console.warn(`[SOVEREIGN FAILOVER] Expansion quota hit on ${m}. Breaking Gemini loop and pivoting to Groq...`);
                            break; // Aggressively break out of the Google loop to reach Groq
                        }
                        continue; // For other errors (like 404), try the next Gemini model
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
        
        // --- SCHEMA MINIFICATION (v32.51) ---
        // Prevents Buffer Overflow errors for large schemas (e.g., medical-illustration 28KB)
        const minSchema = JSON.parse(JSON.stringify(currentSchema));
        const pruneDescriptions = (obj: any) => {
            if (obj.description) delete obj.description;
            if (obj.properties) {
                for (let k in obj.properties) pruneDescriptions(obj.properties[k]);
            }
            if (obj.items) pruneDescriptions(obj.items);
        };
        pruneDescriptions(minSchema);
        const schemaStr = JSON.stringify(minSchema);

        const systemInstruction = lightweight ? `Return ONLY valid JSON for: "${mode}". SCHEMA: ${schemaStr}` : 
            `### ROLE: ${config.jsonRole}
            ${config.jsonInstructions ? config.jsonInstructions(normalizedStyle) : ""}
            SCHEMA MANDATE: Return JSON strictly following schema: ${schemaStr}
            NO TEXT LABELS (This rule only applies to medical illustrations, ignore if mode is infographic).`;

        let adData: any = null;
        let generationError: Error | null = null;

        // --- PHASE 2: JSON GENERATION (RESILIENT) ---
        if (process.env.GEMINI_API_KEY) {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            // Optimized models list: removed 1.5-pro bounds token exhaustion as it's heavily rate limited on free tier (2 RPM)
            const jsonModels = lightweight ? ["gemini-1.5-flash"] : ["gemini-1.5-flash", "gemini-2.0-flash"];
            
            for (const m of jsonModels) {
                try {
                    const model = genAI.getGenerativeModel({ 
                        model: m, 
                        // v32.55 HOTFIX: Use minSchema in Google's generationConfig to prevent sending 28KB JSON schema inside payload
                        generationConfig: { responseMimeType: "application/json", responseSchema: minSchema },
                        safetySettings
                    });
                    const result = await model.generateContent([systemInstruction, `GENERATE JSON BLUEPRINT FOR: ${finalBriefForJson}`]);
                    adData = JSON.parse(result.response.text());
                    if (adData) {
                        providerHistory.push({ phase: "json", model: m, status: "success" });
                        break;
                    }
                } catch (err: any) { 
                    const isQuota = err.message?.includes("429") || err.message?.toLowerCase().includes("quota") || err.message?.includes("limit");
                    const isNotFound = err.message?.includes("404") || err.message?.toLowerCase().includes("not found");
                    const isDecommissioned = err.message?.includes("400") || err.message?.toLowerCase().includes("decommissioned");
                    
                    providerHistory.push({ phase: "json", model: m, status: "fail", error: err.message, isQuota, isNotFound, isDecommissioned });
                    
                    if (isQuota) {
                        console.warn(`[SOVEREIGN FAILOVER] Gemini quota hit on ${m}. Dumping Google provider and pivoting to Groq...`);
                        break; // Aggressive dump: skip all other Gemini models and hit Groq immediately
                    }
                    if (isNotFound || isDecommissioned) {
                        console.warn(`[SOVEREIGN FAILOVER] Gemini model ${m} not found/retired. Trying next Google core...`);
                        continue; // Hop to next Gemini model
                    }
                    generationError = err as Error; 
                }
            }
        }

        // --- FINAL EMERGENCY FALLBACK (GROQ MULTIMAL-MODEL HOPPING) ---
        if (!adData && process.env.GROQ_API_KEY) {
            console.log("[SOVEREIGN RECOVERY] Gemini exhausted. Entering Groq Multi-Model Recovery...");
            const groqModels = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "llama3-70b-8192", "gemma2-9b-it"];
            const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
            
            const schemaRequiredFields = (currentSchema as any)?.required ?? [];
            const schemaFieldGuide = schemaRequiredFields.length > 0
                ? `\n\nREQUIRED TOP-LEVEL FIELDS:\n${schemaRequiredFields.map((f: string) => `- "${f}"`).join('\n')}`
                : "";

            const groqSystemPrompt = [
                systemInstruction,
                `SCHEMA STRUCTURE:`,
                JSON.stringify(currentSchema, null, 2),
                schemaFieldGuide,
                `CRITICAL: Return ONLY valid JSON. No markdown. No chatter.`
            ].join('\n\n');

            for (const gm of groqModels) {
                try {
                    console.log(`[SOVEREIGN ATTEMPT] Trying Groq Core: ${gm}...`);
                    const completion = await groq.chat.completions.create({
                        messages: [
                            { role: "system", content: groqSystemPrompt },
                            { role: "user", content: `GENERATE JSON BLUEPRINT: ${finalBriefForJson}` }
                        ],
                        model: gm,
                        response_format: { type: "json_object" },
                        temperature: 0.1
                    });
                    const rawContent = completion.choices[0]?.message?.content || "{}";
                    adData = JSON.parse(rawContent);
                    if (adData) {
                        providerHistory.push({ phase: "json", model: gm, status: "success" });
                        console.log(`[SOVEREIGN SUCCESS] Recovered with ${gm}.`);
                        break;
                    }
                } catch (err: any) {
                    console.error(`[SOVEREIGN FAIL] ${gm} failed: ${err.message}`);
                    providerHistory.push({ phase: "json", model: gm, status: "fail", error: err.message });
                    continue; // Instantly hop to the next Groq model
                }
            }
        }

        if (!adData) return ResponseManager.error(`Sovereign Sequence Failure: ${generationError?.message || refinementError?.message || "All cores failed."}`, 500);

        // --- POST-GENERATION VALIDATION ---
        let validationResult: { valid: boolean; issues: string[] } | null = null;
        if (adData) {
            if (mode === 'medical') {
                validationResult = validateMedicalOutput(adData);
            } else if (mode === 'infographic') {
                validationResult = validateInfographicOutput(adData);
            }
            
            if (validationResult && !validationResult.valid) {
                 console.warn(`[SOVEREIGN VALIDATION] ${mode} output issue:`, validationResult.issues);
            }
        }

        const scrubSubject = (s: string) => s.replace(/^(create|generate|show|make|build|give me|render|draw|an)\s+(an|a|the|image of|illustration of|diagram of|blueprint of|map for)\s+/gi, "").trim();
        const finalSubject = scrubSubject(brief);
        
        if (adData) {
            // --- v32.44 CITATION-ERASER HOOK ---
            if (mode === 'medical' && adData.metadata) {
                console.log("[SOVEREIGN SANITIZER] Stripping halluncinated citation artifacts...");
                delete adData.metadata.citation;
                delete adData.metadata.doi;
            }

            const setNestedValue = (obj: any, path: string, value: any) => {
                const parts = path.split('.');
                let current = obj;
                for (let i = 0; i < parts.length - 1; i++) {
                    if (!current[parts[i]]) current[parts[i]] = {};
                    current = current[parts[i]];
                }
                current[parts[parts.length - 1]] = value;
            };

            const getNestedValue = (obj: any, path: string) => {
                return path.split('.').reduce((o, i) => o?.[i], obj);
            };

            const subPath = config.subjectPath || config.subjectField;
            const stylePath = config.stylePath || config.styleField;

            if (subPath) {
                const val = getNestedValue(adData, subPath);
                if (!val || val.toLowerCase().includes("subject") || val.trim().length < 5) {
                    setNestedValue(adData, subPath, finalSubject);
                }
            }
            if (stylePath) {
                setNestedValue(adData, stylePath, sanitizedStyleName + (config.styleSuffix ? `-${config.styleSuffix}` : ""));
            }
        }

        const filename = `gen-${Date.now()}.json`;
        await promptService.savePrompt({ name: filename, type: mode, content: adData });

        return ResponseManager.success({
            data: adData,
            refinedPrompt: finalBriefForJson,
            promptFile: filename,
            folder: mode + "_prompts",
            providerHistory,
            ...(validationResult && !validationResult.valid ? { _validation_warnings: validationResult.issues } : {})
        });

    } catch (error: any) {
        console.error("Single-Shot Engine Failure:", error);
        return ResponseManager.error(error.message, 500);
    }
}

