/**
 * Auto-scrubber for diffusion prompts.
 * Strips SVG/CSS technical leaks and replaces them with natural language descriptors.
 */
export const scrubDiffusionPrompt = (prompt: string): string => {
  if (!prompt) return "";
  
  let clean = prompt;

  // 1. Replace Hex Codes with descriptive color names
  const hexMap: Record<string, string> = {
    "#ff0000": "vibrant surgical red",
    "#0000ff": "deep venous blue",
    "#008b8b": "nejm teal",
    "#ffffff": "sterile white",
    "#000000": "high-contrast black",
    "#c5a059": "scholarly gold",
    "#ff7f50": "inflammatory coral",
  };

  clean = clean.replace(/#[0-9a-fA-F]{6}/g, (match) => {
    return hexMap[match.toLowerCase()] || "specified clinical color";
  });

  // 2. Replace SVG/CSS parameters with descriptive language
  clean = clean.replace(/stroke_width\s*[:=]\s*["']?(\d+)["']?/g, (_, val) => {
    return parseInt(val) > 1 ? "bold anatomical outlines" : "delicate structural boundaries";
  });

  clean = clean.replace(/z_index\s*[:=]\s*["']?(\d+)["']?/g, (_, val) => {
    return parseInt(val) > 5 ? "foreground focus" : "background contextual layer";
  });

  clean = clean.replace(/stroke_dasharray\s*[:=]\s*["']?[\d\s,]+["']?/g, "stippled line texture");

  // 3. Remove coordinate leaks and JSON property names
  clean = clean.replace(/\{\s*[xy]:\s*-?\d+\.?\d*,\s*[xy]:\s*-?\d+\.?\d*\s*\}/g, "aligned precisely within the anatomical space");
  clean = clean.replace(/ent_|panel_|p1_|p2_|p3_|\w+_\w+[:=]/g, "");

  return clean.trim();
};

/**
 * Cross-checks tissue and flow dynamics for physical contradictions.
 */
const validatePhysicsAlignment = (tissue: string = "", flow: any = {}): string[] => {
  const issues: string[] = [];
  const t = tissue.toLowerCase();
  const f = JSON.stringify(flow).toLowerCase();

  const domains = [
    { name: "Cardiac", triggers: ["myocard", "ventricle", "aorta", "valve", "atrium", "heart"], flowTriggers: ["perfusion", "systole", "diastole", "regurgitation", "stenosis", "blood_flow"] },
    { name: "Renal", triggers: ["glomerul", "nephr", "kidney", "renal", "ureter", "podocyte"], flowTriggers: ["filtration", "ultrafiltration", "reabsorption", "clearance", "dialysis"] },
    { name: "Pulmonary", triggers: ["lung", "pulmonary", "alveol", "bronch"], flowTriggers: ["gas exchange", "ventilation", "respiration", "oxygenation"] },
    { name: "Neurology", triggers: ["brain", "neuro", "cortex", "neuron", "synapse", "csf"], flowTriggers: ["conduction", "signal", "neurotransmission", "perfusion"] }
  ];

  // Identify primary domain of the tissue
  const activeDomain = domains.find(d => d.triggers.some(trig => t.includes(trig)));
  
  if (activeDomain) {
    // Check if flow dynamics contain terms from a DIFFERENT incompatible domain
    const otherDomains = domains.filter(d => d.name !== activeDomain.name);
    for (const other of otherDomains) {
      if (other.flowTriggers.some(trig => f.includes(trig))) {
        issues.push(`PHYSICS CONTRADICTION: Tissue is ${activeDomain.name} ("${tissue}"), but flow dynamics describe ${other.name}-specific processes. Ensure biological alignment.`);
      }
    }
  }

  return issues;
};

/**
 * Post-generation validator for medical JSON output.
 * Returns { valid: boolean, issues: string[] }
 */
export const validateMedicalOutput = (data: any): { valid: boolean; issues: string[] } => {
  const issues: string[] = [];
  const subject = (data?.metadata?.subject || data?.scientific_subject || "").toLowerCase();
  const isSurgical = subject.match(/surgery|resection|dissection|laparoscop|robotic|endoscop|incision/);

  // 0. SVSP v1.0 BLOCKERS (Hard Rejects)
  const masterPrompt = (data?.diffusion_synthesis?.master_prompt || "").toLowerCase();
  
  if (isSurgical) {
    if (masterPrompt.includes("anamorphic") || masterPrompt.includes("35mm") || masterPrompt.includes("cinematic lens")) {
      issues.push("SVSP BLOCKER: Cinematic optics detected in surgical view (anamorphic/35mm). These are prohibited for endoscopy.");
    }
    if (masterPrompt.includes("chiaroscuro") || masterPrompt.includes("dramatic shadows")) {
      issues.push("SVSP BLOCKER: Cinematic lighting detected in surgical view (chiaroscuro). Use fiber-optic uniform illumination.");
    }
    if (masterPrompt.includes("bokeh") || masterPrompt.includes("shallow cinematic")) {
      issues.push("SVSP BLOCKER: Cinematic Depth-of-Field (bokeh) prohibited in surgical view.");
    }
    
    // Internal View Ethnicity Check
    const ethnicityKeywords = ["indian", "south asian", "ethnic", "character", "age", "male", "female"];
    if (ethnicityKeywords.some(kw => masterPrompt.includes(kw))) {
      issues.push("SVSP FLAG: Ethnicity or character descriptors in internal surgical view. Removing conceptual leakage—internal tissue is identity-neutral.");
      // Auto-scrub internal identity
      ethnicityKeywords.forEach(kw => {
        data.diffusion_synthesis.master_prompt = data.diffusion_synthesis.master_prompt.replace(new RegExp(kw, "gi"), "");
      });
    }

    // 🔬 SVSP Complexity Guard (Surgical Pruning)
    if (data.cellular && data.cellular.length > 0 && isSurgical) {
      issues.push("SVSP WARNING: Redundant 'cellular' layer detected in macro-surgical view. These add noise without visual payoff. Suggest pruning for NEJM-level clarity.");
    }
    if (data.molecular && Object.keys(data.molecular).length > 0 && isSurgical) {
      issues.push("SVSP WARNING: Redundant 'molecular' layer detected. These are non-visual in operative endoscopy. Suggest pruning.");
    }
    
    // Heuristic Correction
    const cysticHeuristic = masterPrompt.match(/pulsation|pulsing|beat/i);
    if (cysticHeuristic && subject.includes("cholecystectomy")) {
      issues.push("SVSP ERROR: Cystic artery identified by 'pulsation' (incorrect). Correct identification must rely on anatomical course and relation within Calot’s triangle.");
    }
  }

  // 1. Strict Physics Validation
  const physicsIssues = validatePhysicsAlignment(data?.metadata?.subject || data?.scientific_subject || data?.tissue?.name, data?.flow_dynamics);
  issues.push(...physicsIssues);

  // 2. Check pathophysiology cascade is populated
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

  // 3. Check anatomical zones are populated
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

  // 4. Check visual panels exist
  const panels = data?.spatial_layout?.panels;
  if (!Array.isArray(panels) || panels.length < 1) {
    issues.push("spatial_layout.panels must have at least 1 panel");
  }

  // 5. Check diffusion_synthesis and SCRUB it
  const ds = data?.diffusion_synthesis;
  if (!ds) {
    issues.push("diffusion_synthesis (Layer 5) is entirely missing");
  } else {
    // Perform Auto-Scrubbing on the master_prompt
    if (ds.master_prompt) {
      const original = ds.master_prompt;
      ds.master_prompt = scrubDiffusionPrompt(original);
      if (original !== ds.master_prompt) {
        console.log("[Sovereign Scrubber] Technical leaks identified and translated to natural language.");
      }
    }

    if (!ds.master_prompt || ds.master_prompt.trim().length < 50) {
      issues.push("diffusion_synthesis.master_prompt is missing or too short");
    }
    
    // Final check for remaining leaks post-scrub
    const svgLeakPattern = /stroke_dasharray|stroke_width|z_index|#[0-9a-fA-F]{6}/;
    if (svgLeakPattern.test(ds.master_prompt || "")) {
      issues.push("diffusion_synthesis.master_prompt still contains unresolved SVG/CSS markers after scrubbing.");
    }
  }

  return { valid: issues.length === 0, issues };
};

/**
 * Post-generation validator for infographic JSON output.
 */
export const validateInfographicOutput = (data: any, selectedStyle: string): { valid: boolean; issues: string[] } => {
  const issues: string[] = [];
  const js = data?.metadata?.journal_standard;
  const style = typeof selectedStyle === "string" ? selectedStyle.toLowerCase() : "";

  // Check medical content
  const interventions = data?.medical_content?.interventions;
  if (!Array.isArray(interventions) || interventions.length === 0) {
    issues.push("medical_content.interventions is missing trial arms");
  }

  // --- STYLE LOCK VALIDATION (P0) ---
  if (style.includes("cjasn") && js !== "CJASN_Blue_Standard") {
    data.metadata.journal_standard = "CJASN_Blue_Standard";
  }
  if (style.includes("nejm") && js !== "NEJM_Dense_Slab") {
    data.metadata.journal_standard = "NEJM_Dense_Slab";
  }
  if (style.includes("nature") && js !== "Nature_Flow_WCN") {
    data.metadata.journal_standard = "Nature_Flow_WCN";
  }

  // Check for Layer 5 and Scrub
  const ds = data?.diffusion_synthesis;
  if (ds?.master_prompt) {
    ds.master_prompt = scrubDiffusionPrompt(ds.master_prompt);
  }

  if (!ds) {
    issues.push("diffusion_synthesis (Layer 5) is missing");
  } else {
    const wordCount = (ds.master_prompt || "").split(/\s+/).length;
    if (wordCount < 100) {
      issues.push(`diffusion_synthesis.master_prompt too short: ${wordCount} words`);
    }
  }

  return { valid: issues.length === 0, issues };
};

