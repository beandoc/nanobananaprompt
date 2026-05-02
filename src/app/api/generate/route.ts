import { NextRequest } from "next/server";
import { ResponseManager } from "@/lib/api-response";
import { atlasService } from "@/lib/atlas-service";
import { promptService } from "@/lib/prompt-service";
import { GenerationService } from "@/lib/services/generation-service";

import { schemaMap, agentConfigs } from "@/lib/config/generation";
import { validateMedicalOutput, validateInfographicOutput } from "@/lib/validators/output-validators";
import { compileMedicalPrompt, compileVideoPrompt } from "@/lib/compilers/prompt-compiler";
import { getProtocol, getDynamicBlacklist, pruneDescriptions, scrubSubject, setNestedValue, getNestedValue } from "@/lib/utils";
import { storyboardSchema } from "@/lib/schemas/storyboard";
import { comicStripSchema } from "@/lib/schemas/comic-strip";
import { medicalIllustrationSchema } from "@/lib/schemas/medical-illustration";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode = "medical", brief = "", style = "Watercolor-Field-Notes", isStoryboard = false, image = null, lightweight = false, cinema = null } = body;
    const normalizedStyle = style && style !== "" && style !== "-" ? style : mode === "infographic" ? "Nature-Gold-Standard" : mode === "medical" ? "NEJM" : "Modern";

    if (!brief) return ResponseManager.badRequest("No brief provided");

    const config = agentConfigs[mode] || agentConfigs.medical;
    let providerHistory: any[] = [];
    let finalBriefForJson = brief;

    // --- PHASE 1: EXPANSION ---
    if (!lightweight) {
      const atlasContext = mode === "medical" || mode === "infographic" ? atlasService.getAtlasContext(brief) : "";
      const dynamicBlacklist = mode === "medical" || mode === "infographic" ? getDynamicBlacklist(brief) : "";

      let expansionSystemPrompt = "";

      if (mode === "infographic") {
        expansionSystemPrompt = `### ROLE: Principal Visual Abstract Director
                Refine the user's brief into a high-fidelity 'Visual Abstract Design Specification'.
                1. EXTRACT ALL CLINICAL DATA: Identify N-values, p-values, HR, CI, and primary results.
                2. CLINICAL ARCHITECTURE: Organize the content logically to best represent trial data.
                3. NO TEXT BAN EXEMPTION: This is a text-heavy infographic. Preserve all numbers and metrics.
                ${dynamicBlacklist}
                ${config.expansionRules.join("\n        ")}
                STYLE PROTOCOL: ${getProtocol(mode, normalizedStyle)}
                ${atlasContext ? `\nMEDICAL REFERENCE DATA:\n${atlasContext}` : ""}`;
      } else if (mode === "video" || mode === "comic" || mode === "ad") {
        expansionSystemPrompt = `### ROLE: ELITE CINEMATIC DIRECTOR
Refine the user's brief into a 'Masterclass Cinematic Specification' using the CINEMATIC ONTOLOGY:
1. OPTICS: Use a ${cinema?.lens || "35mm-documentary"} lens, aperture set to ${cinema?.aperture || "f/2.8"} for optimal depth-of-field. Shot type: ${cinema?.shot_type || "cinematic"}.
2. LIGHTING: ${cinema?.lighting || "dramatic lighting"}, Chiaroscuro shadows, volumetric lighting, dramatic rim-lighting.
3. CAUSALITY: Emotional weight and narrative pacing.
4. IDENTITY: Strict South Asian character lock (skin tone, modern urban Indian styling).

### MANDATORY RULES:
- Word Count: 180-250 words.
- Resolve all visual contradictions.
${config.expansionRules.join("\n")}
### STYLE PROTOCOL: ${normalizedStyle}`;
      } else {
        const isSurgical = brief.toLowerCase().match(/surgery|resection|dissection|laparoscop|robotic|endoscop|incision/);
        const isCardiac = brief.match(/cardiac|coronar|myocard|atheroscler|aorta|heart|MI|infarct/i);

        if (isSurgical) {
          expansionSystemPrompt = `### ROLE: PRINCIPAL MEDICAL ILLUSTRATOR (SVSP v1.1 - PRUNING MODE)
Refine into a 'Surgical Specification' using STRASBERG'S CRITICAL VIEW logic:
1. IMAGING: Stereoscopic 30° endoscopy, uniform surgical illumination, no chiaroscuro, no bokeh.
2. ANATOMICAL RELATIONS: Identify structures by their COURSE and RELATION to landmarks, NOT by visual artifacts like 'pulsation'.
3. PRUNING MANDATE (CRITICAL): 
   - ZERO-OUT the 'cellular' and 'molecular' layers. They provide NO visual payoff in macro-surgical views.
   - Focus 100% on TISSUE PLANES, TENSION, and OPERATIVE ANATOMY.
4. IDENTITY: Neutral/Achromatic. Inside the surgical site, skin-tone is non-visible.

### MANDATORY RULES:
- Word Count: 180-250 words.
- Visual Payoff: If it can't be seen on a 4K surgical monitor, don't describe it.
- STYLE: NEJM-Style clarity. Reduce detail by 30% to favor diagrammatic photorealism over simulation-density.
${dynamicBlacklist}
${config.expansionRules.join("\n        ")}
STYLE PROTOCOL: ${getProtocol(mode, normalizedStyle)}
${atlasContext ? `\nMEDICAL REFERENCE DATA:\n${atlasContext}` : ""}
HARD ZERO-TEXT BAN: Terminate with: "No text characters, no labels."`;
        } else if (isCardiac) {
          expansionSystemPrompt = `### ROLE: PRINCIPAL MEDICAL ILLUSTRATOR (CARDIOLOGY SPECIALIST)
Refine into a 'Gross Pathology Specification' for Cardiac/Vascular disease:
1. IMAGING: Cross-sectional anatomical view, high-fidelity gross pathology rendering.
2. ANATOMICAL RELATIONS: Clear depiction of vessel lumens, arterial walls (intima/media), and plaque morphology.
3. PRUNING MANDATE: Maintain tissue-level realism. Focus on luminal obstruction and myocardial texture.
4. IDENTITY: South Asian (Indian) descent for all human representations.

### MANDATORY RULES:
- Word Count: 180-250 words.
- STYLE: NEJM/Lancet Scholarly Plate. 
${dynamicBlacklist}
${config.expansionRules.join("\n        ")}
STYLE PROTOCOL: ${getProtocol(mode, normalizedStyle)}
${atlasContext ? `\nMEDICAL REFERENCE DATA:\n${atlasContext}` : ""}
HARD ZERO-TEXT BAN: Terminate with: "No text characters, no labels."`;
        } else {
          expansionSystemPrompt = `### ROLE: PRINCIPAL MEDICAL ILLUSTRATOR
Refine the brief into a high-fidelity 'Disease Mapping Blueprint'.
1. IMAGING: Multi-scale biological view (Tissue → Cellular → Molecular).
2. IDENTITY: All human characters MUST be of South Asian (Indian) descent.
3. PRUNING: Only include structures relevant to the mechanism.

### MANDATORY RULES:
- Word Count: 180-250 words.
- STYLE: Scholarly BioRender/NEJM.
${dynamicBlacklist}
${config.expansionRules.join("\n        ")}
STYLE PROTOCOL: ${getProtocol(mode, normalizedStyle)}
${atlasContext ? `\nMEDICAL REFERENCE DATA:\n${atlasContext}` : ""}
HARD ZERO-TEXT BAN: Terminate with: "No text characters, no labels."`;
        }
      }

      const { refinedText, providerHistory: expHistory } = await GenerationService.expandBrief(brief, expansionSystemPrompt, image || "");
      finalBriefForJson = refinedText || brief;
      providerHistory.push(...expHistory);
    }

    const currentSchema = mode === "comic" && isStoryboard ? comicStripSchema : isStoryboard ? storyboardSchema : schemaMap[mode] || medicalIllustrationSchema;
    const minSchema = JSON.parse(JSON.stringify(currentSchema));
    pruneDescriptions(minSchema);
    const schemaStr = JSON.stringify(minSchema);

    const systemInstruction = lightweight
      ? `Return ONLY valid JSON for: "${mode}". SCHEMA: ${schemaStr}`
      : `### ROLE: ${config.jsonRole}
            ${config.jsonInstructions ? config.jsonInstructions(normalizedStyle) : ""}
            SCHEMA MANDATE: Return JSON strictly following schema: ${schemaStr}
            NO TEXT LABELS (Only applies to medical illustrations).`;

    // --- PHASE 2: JSON GENERATION ---
    const { adData, providerHistory: jsonHistory, error } = await GenerationService.generateJson(finalBriefForJson, systemInstruction, schemaStr, lightweight);
    providerHistory.push(...jsonHistory);

    if (!adData) return ResponseManager.error(`Sovereign Sequence Failure: ${error?.message || "All cores failed."}`, 500);

    // --- POST-GENERATION PROCESS ---
    let validationResult: { valid: boolean; issues: string[] } | null = null;
    if (mode === "medical") {
      validationResult = validateMedicalOutput(adData);
      compileMedicalPrompt(adData);
    } else if (mode === "infographic") {
      validationResult = validateInfographicOutput(adData, normalizedStyle);
    } else if (mode === "video") {
      const { hard_reject, validation_results } = compileVideoPrompt(adData);
      if (hard_reject) {
        const blockers = (validation_results || []).filter((r: any) => r.severity === "blocker" || r.status === "fail");
        const errorMessage = `Quality Failure: ${blockers.map((b: any) => b.rule + ": " + b.detail).join(" | ")}`;
        return ResponseManager.error(errorMessage, 422, { validation_errors: blockers });
      }
    }

    // Sanitize medical citation
    if (mode === "medical" && adData.metadata) {
      delete adData.metadata.citation;
      delete adData.metadata.doi;
    }

    // Set paths
    const finalSubject = scrubSubject(brief);
    const subPath = config.subjectPath || config.subjectField;
    const stylePath = config.stylePath || config.styleField;
    const sanitizedStyleName = normalizedStyle.split(" ")[0].replace(/[-,]/g, "");

    if (subPath) {
      const val = getNestedValue(adData, subPath);
      if (!val || val.toLowerCase().includes("subject") || val.trim().length < 5) {
        setNestedValue(adData, subPath, finalSubject);
      }
    }
    if (stylePath) {
      setNestedValue(adData, stylePath, sanitizedStyleName + (config.styleSuffix ? `-${config.styleSuffix}` : ""));
    }

    const filename = `gen-${Date.now()}.json`;
    await promptService.savePrompt({ name: filename, type: mode, content: adData });

    return ResponseManager.success({
      data: adData,
      refinedPrompt: finalBriefForJson,
      promptFile: filename,
      folder: mode + "_prompts",
      providerHistory,
      // Imagen 4 / Gemini web optimized prompt — paste this directly into Gemini web
      ...(mode === "medical" && adData.diffusion_synthesis?.imagen_prompt
        ? { geminiWebPrompt: adData.diffusion_synthesis.imagen_prompt }
        : {}),
      ...(validationResult && !validationResult.valid ? { _validation_warnings: validationResult.issues } : {}),
    });
  } catch (error: any) {
    console.error("Single-Shot Engine Failure:", error);
    return ResponseManager.error(error.message, 500);
  }
}

export const maxDuration = 60;
