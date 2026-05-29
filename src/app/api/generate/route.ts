import { NextRequest, NextResponse } from "next/server";
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

// Streams a single JSON payload as newline-delimited JSON events so Vercel Hobby's
// 10s wall-clock limit is bypassed — the connection stays alive while we work and
// flushes the final result when ready.
function streamJson(payload: object): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(JSON.stringify(payload) + "\n"));
      controller.close();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Transfer-Encoding": "chunked",
      "X-Accel-Buffering": "no", // disable Nginx proxy buffering on Vercel
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode = "medical", brief = "", style = "Watercolor-Field-Notes", isStoryboard = false, image = null, lightweight = false, cinema = null } = body;
    const normalizedStyle = style && style !== "" && style !== "-" ? style : mode === "infographic" ? "Nature-Gold-Standard" : mode === "medical" ? "NEJM" : "Modern";

    if (!brief) return ResponseManager.badRequest("No brief provided");

    const config = agentConfigs[mode] || agentConfigs.medical;
    let providerHistory: any[] = [];
    let finalBriefForJson = brief;

    // --- MULTI-ORGAN FAST-PATH (Part 1 of timeout fix) ---
    // Detect multi-organ systemic disease from the raw brief. When detected:
    // (a) skip Phase 1 expansion entirely — saves one full Gemini round-trip
    // (b) inject organ context directly into the JSON system instruction
    // This keeps us well under Vercel Hobby's 10s limit for these complex cases.
    const ORGAN_PATTERNS_EARLY: { label: string; pattern: RegExp }[] = [
      { label: "lung/pulmonary", pattern: /\b(lung|pulmonar|alveol|bronch|hemoptysis|diffuse.alveolar|pneum)\b/i },
      { label: "kidney/renal", pattern: /\b(kidney|renal|glomerul|nephron|crescent|glomerulonephritis|nephrotic|nephritic)\b/i },
      { label: "heart/cardiac", pattern: /\b(heart|cardiac|coronar|myocard|pericardi|ventricle|atrium)\b/i },
      { label: "skin/dermal", pattern: /\b(skin|derm|rash|purpura|vasculitis.*skin)\b/i },
      { label: "joints/synovial", pattern: /\b(joint|arthritis|synovit)\b/i },
      { label: "brain/CNS", pattern: /\b(brain|cerebr|encephalit|neurolog|cns)\b/i },
    ];
    const earlyOrgans = ORGAN_PATTERNS_EARLY.filter(o => o.pattern.test(brief)).map(o => o.label);
    const isMultiOrganFastPath = mode === "medical" && earlyOrgans.length >= 2;

    // --- PHASE 1: EXPANSION ---
    // Skipped for multi-organ fast-path — organ context is embedded in the JSON prompt instead
    if (!lightweight && !isMultiOrganFastPath) {
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

        // Multi-organ / multi-system syndromic detection
        // Catches: pulmonary-renal syndrome, Goodpasture's, ANCA vasculitis, SLE, etc.
        const ORGAN_PATTERNS: { label: string; pattern: RegExp }[] = [
          { label: "lung/pulmonary (alveolar hemorrhage, pneumonitis, etc.)", pattern: /\b(lung|pulmonar|alveol|bronch|hemoptysis|alveolar.hemorrhage|diffuse.alveolar|pneum)\b/i },
          { label: "kidney/renal (glomerulonephritis, crescentic nephritis, etc.)", pattern: /\b(kidney|renal|glomerul|nephron|crescent|glomerulonephritis|nephrotic|nephritic)\b/i },
          { label: "heart/cardiac", pattern: /\b(heart|cardiac|coronar|myocard|pericardi|endocardi|ventricle|atrium)\b/i },
          { label: "skin (vasculitic rash, purpura)", pattern: /\b(skin|derm|rash|purpura|vasculitis.*skin)\b/i },
          { label: "joints (arthritis)", pattern: /\b(joint|arthritis|synovit)\b/i },
          { label: "brain/CNS", pattern: /\b(brain|cerebr|encephalit|neurolog|cns)\b/i },
        ];
        const affectedOrgans = ORGAN_PATTERNS.filter(o => o.pattern.test(brief)).map(o => o.label);
        const isMultiOrgan = affectedOrgans.length >= 2;

        const multiOrganMandate = isMultiOrgan
          ? `\n\n### CRITICAL MULTI-ORGAN MANDATE (SYSTEMIC DISEASE DETECTED):
This brief involves a SYSTEMIC / MULTI-ORGAN disease affecting: ${affectedOrgans.join("; ")}.
You MUST describe ALL affected organs with equal specificity. DO NOT default to the most dramatic single organ.
- For EACH affected organ: provide (1) the specific histopathological finding, (2) its microscopic appearance, (3) its color and staining characteristics.
- The visual output will be a SPLIT-PANEL / COMPOSITE illustration — one panel per organ.
- Your expanded brief must contain a separate paragraph for EACH organ's pathology, of equal depth.
- The unifying systemic mechanism (e.g., anti-GBM antibodies, ANCA vasculitis, immune complex deposition) must be named and explained.
- FAILURE TO DESCRIBE ALL ORGANS = CRITICAL SPECIFICATION ERROR.`
          : "";

        if (isSurgical) {
          expansionSystemPrompt = `### ROLE: PRINCIPAL SURGICAL MEDICAL ILLUSTRATOR (SVSP v2.0 — OPERATIVE ANATOMY PROTOCOL)

You are an expert surgical anatomist and medical illustrator. Draw on your full surgical anatomy training knowledge to produce a precise operative specification.

### PHASE 1 — ANATOMICAL GROUNDING (use your medical knowledge):
Before describing the visual, answer internally:
- What are the exact tissue layers encountered at this surgical site, in order from superficial to deep?
- Which named vessels, nerves, and ducts run in the operative field and are at risk?
- What does the tissue look like intraoperatively? (color, tension, texture, glistening fascia, fat lobule appearance, peritoneal reflections)
- What is the critical anatomical landmark (e.g. Calot's triangle, Triangle of Doom, inferior epigastric vessels) that defines safe dissection?

### PHASE 2 — OPERATIVE VISUAL SPECIFICATION:
Translate Phase 1 knowledge into a visual description for a medical illustrator:
1. IMAGING: Stereoscopic 30° laparoscopic or open surgical view. Uniform cold-white LED surgical illumination. No chiaroscuro. No bokeh.
2. TISSUE PLANES: Describe tissue planes by color and tension (e.g., "the peritoneum appears as a glistening translucent membrane under tension, reflecting white light"; "Gerota's fascia presents as a pale yellow fibrofatty layer").
3. ANATOMICAL RELATIONS: Identify each structure by its COURSE and SPATIAL RELATION to named landmarks. Not by abstract descriptors.
4. OPERATIVE CONTEXT: Specify instrument position, retraction vectors, and which structures are under tension vs lax.
5. PRUNING MANDATE: ZERO-OUT cellular/molecular layers. Focus 100% on what is visible on a 4K surgical monitor.
6. IDENTITY: Surgical field — skin tone non-visible inside operative site.

### OUTPUT REQUIREMENTS:
- Word Count: 200-280 words of precise surgical prose.
- Every structure must have: (1) its anatomical name, (2) its visual appearance intraoperatively, (3) its spatial relation to the next structure.
- STYLE: NEJM operative plate clarity. Diagrammatic photorealism.
${dynamicBlacklist}
${config.expansionRules.join("\n")}
STYLE PROTOCOL: ${getProtocol(mode, normalizedStyle)}
${atlasContext ? `\nSURGICAL ANATOMY REFERENCE (integrate this data into your description):\n${atlasContext}` : ""}
HARD ZERO-TEXT BAN: Terminate with: "No text characters, no labels, no annotations."`;

        } else if (isCardiac) {
          expansionSystemPrompt = `### ROLE: PRINCIPAL CARDIOVASCULAR MEDICAL ILLUSTRATOR (Cardiopathology Specialist v2.0)

You are a cardiovascular pathologist and medical illustrator with deep knowledge of cardiac anatomy and vascular disease. Draw on your full cardiology training to produce a scientifically precise visual specification.

### PHASE 1 — DISEASE MECHANISM (use your medical knowledge — be specific):
Before describing the visual, establish the science:
- NORMAL ANATOMY BASELINE: What does the healthy structure look like? (e.g., "the coronary artery intima is a single layer of endothelial cells on a thin subendothelial layer; the media is composed of smooth muscle arranged in helical layers separated by elastic laminae")
- PATHOLOGICAL PROCESS: What is the precise cellular/molecular mechanism? Name the specific cells, proteins, and events. (e.g., "oxidized LDL crosses dysfunctional endothelium → foam cell formation from lipid-laden macrophages → fibrous cap synthesis by smooth muscle cells → vulnerable plaque with lipid core and thin fibrous cap")
- HISTOLOGICAL APPEARANCE: What does this look like under gross pathology and histology? (e.g., "the plaque appears as a yellow, lipid-rich eccentric lesion; fibrous cap is pale grey and firm; necrotic core is soft and granular")
- VISUAL CONSEQUENCE: How does the pathology alter the gross appearance of the organ or vessel?

### PHASE 2 — VISUAL SPECIFICATION FOR ILLUSTRATOR:
1. IMAGING: Cross-sectional anatomical view (vessel cut perpendicular to lumen, or 4-chamber cardiac view). High-fidelity gross pathology rendering.
2. TISSUE LAYERS: Explicitly describe each named layer's visual appearance (intima, media, adventitia; or endocardium, myocardium, epicardium) in both normal and diseased zones.
3. COLOR LANGUAGE: Use precise pathological color terms (e.g., "the necrotic lipid core is ochre-yellow and granular"; "the fibrous cap is pale grey-white and translucent at its shoulders"; "myocardium in the infarct zone is pale tan, losing its normal brick-red striations").
4. SPATIAL ARRANGEMENT: Describe what occupies each zone of the image using directional anatomical language.
5. IDENTITY: South Asian (Indian) descent for any visible patient representations.

### OUTPUT REQUIREMENTS:
- Word Count: 200-280 words.
- Every pathological structure must have: (1) its medical name, (2) the cellular mechanism causing it, (3) how it visually manifests.
- STYLE: NEJM/Lancet Scholarly Plate. Matte plasticine 2.5D BioRender or gross pathology photograph style.
${dynamicBlacklist}
${config.expansionRules.join("\n")}
STYLE PROTOCOL: ${getProtocol(mode, normalizedStyle)}
${atlasContext ? `\nCARDIOVASCULAR ANATOMY REFERENCE (integrate this data precisely into your description):\n${atlasContext}` : ""}
HARD ZERO-TEXT BAN: Terminate with: "No text characters, no labels, no annotations."`;

        } else {
          expansionSystemPrompt = `### ROLE: PRINCIPAL MEDICAL ILLUSTRATOR & PATHOPHYSIOLOGIST (Disease Mapping Protocol v3.0)

You are a medical expert — pathologist, cell biologist, and scientific illustrator combined. Your task is to draw on your complete biomedical training knowledge to transform a brief into a scientifically precise visual specification that a medical artist can execute and that ChatGPT/Gemini can render accurately.

### PHASE 1 — SCIENTIFIC GROUNDING (mandatory — use your full medical training knowledge):
Work through the following before writing the visual description:

A) NORMAL ANATOMY BASELINE:
   - Name the exact anatomical structures involved and describe their normal appearance (cell types present, tissue architecture, histological staining pattern under H&E or electron microscopy, gross color and texture).
   - Example: "The glomerulus normally contains a tuft of fenestrated capillaries lined by podocytes whose interdigitating foot processes bridge the glomerular basement membrane (GBM), a trilaminar structure of lamina rara interna, lamina densa, and lamina rara externa."

B) PATHOLOGICAL MECHANISM (name the specific molecules and cells):
   - What triggers the disease process? Name the initiating insult.
   - What cells respond, and how? (e.g., macrophage infiltration, T-cell activation, fibroblast transdifferentiation)
   - What proteins are up/downregulated or structurally altered? (e.g., TGF-β1, collagen IV, nephrin, podocin, VEGF)
   - What is the causal chain from trigger → cellular change → structural change → organ dysfunction?

C) HISTOLOGICAL & GROSS APPEARANCE:
   - How does the pathology appear under light microscopy? Under electron microscopy?
   - What does it look like to the naked eye (color, texture, size change, surface characteristics)?
   - What are the pathognomonic visual features that distinguish this disease from others?

### PHASE 2 — VISUAL SPECIFICATION FOR ILLUSTRATOR:
Translate Phase 1 into a precise visual brief:
1. SCALE & VIEW: Specify whether this is electron microscopy, light microscopy, gross anatomy, or multi-scale view. Choose the scale that shows the pathology most clearly.
2. STRUCTURAL INVENTORY: List every structure visible in the image, what it looks like normally, and how the disease has altered its appearance.
3. COLOR LANGUAGE: Use precise descriptive color language for each structure (e.g., "the thickened GBM appears as a homogeneous slate-grey band, losing its normal laminar transparency"; "foam cells appear as pale, vacuolated cells with irregular cytoplasmic borders").
4. SPATIAL COMPOSITION: Describe which structure occupies foreground/background/center using anatomical directional language (superior, inferior, lateral, medial).
5. PATHOPHYSIOLOGY VISUAL SUMMARY: Write 2-3 sentences describing what the viewer's eye should understand about the disease mechanism from looking at the image.
6. IDENTITY: All human representations must be South Asian (Indian) descent.

### OUTPUT REQUIREMENTS:
- Word Count: 220-300 words of precise scientific prose (add 80 words per additional organ if multi-organ case).
- Every structure must be described with: (1) anatomical name, (2) normal baseline appearance, (3) pathological change, (4) visual rendering instruction.
- Integrate all relevant data from the MEDICAL REFERENCE section below.
- STYLE: Scholarly BioRender matte plasticine 2.5D / NEJM plate.
${multiOrganMandate}
${dynamicBlacklist}
${config.expansionRules.join("\n")}
STYLE PROTOCOL: ${getProtocol(mode, normalizedStyle)}
${atlasContext ? `\nMEDICAL REFERENCE DATA (use these specific anatomical terms and structures in your output):\n${atlasContext}` : ""}
HARD ZERO-TEXT BAN: Terminate with: "No text characters, no labels, no annotations."`;
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

    const systemInstruction = isMultiOrganFastPath
      ? `### ROLE: ${config.jsonRole}
${config.jsonInstructions ? config.jsonInstructions(normalizedStyle) : ""}
SCHEMA MANDATE: Return JSON strictly following schema: ${schemaStr}
NO TEXT LABELS (Only applies to medical illustrations).

### CRITICAL MULTI-ORGAN COMPOSITE MANDATE:
This is a SYSTEMIC / MULTI-ORGAN disease case affecting: ${earlyOrgans.join("; ")}.
You MUST populate the JSON as a SPLIT-PANEL / COMPOSITE illustration:
- diffusion_synthesis.priority_weighting.primary_focus: include the key pathological finding for EACH organ (e.g. "Blood-filled alveoli (lung panel)", "Cellular crescent in Bowman's space (kidney panel)")
- spatial_layout.panels: create one panel entry per organ with clear relative_placement (e.g. "Left half — lung", "Right half — kidney")
- diffusion_synthesis.master_prompt: describe EACH organ's histopathology in a separate paragraph with equal depth — color, cellular architecture, staining appearance
- medical_content.mechanism: name the unifying systemic mechanism (e.g. anti-GBM antibodies, ANCA vasculitis, immune complex deposition)
- diffusion_synthesis.pathophysiology_visual_summary: explain how one mechanism causes damage in ALL affected organs simultaneously
DO NOT collapse to a single organ. Every organ listed above must appear in the JSON output.`
      : lightweight
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
      compileMedicalPrompt(adData, brief);
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

    const payload = {
      success: true,
      data: {
        data: adData,
        refinedPrompt: finalBriefForJson,
        promptFile: filename,
        folder: mode + "_prompts",
        providerHistory,
        ...(mode === "medical" && adData.diffusion_synthesis?.imagen_prompt
          ? { geminiWebPrompt: adData.diffusion_synthesis.imagen_prompt }
          : {}),
        ...(validationResult && !validationResult.valid ? { _validation_warnings: validationResult.issues } : {}),
      },
    };

    // Use streaming for all responses — keeps the Vercel connection alive and
    // bypasses the Hobby plan's 10s function timeout wall
    return streamJson(payload);
  } catch (error: any) {
    console.error("Single-Shot Engine Failure:", error);
    return streamJson({ success: false, error: error.message });
  }
}

export const maxDuration = 300;
