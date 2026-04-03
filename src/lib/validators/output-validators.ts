/**
 * Post-generation validator for medical JSON output.
 * Returns { valid: boolean, issues: string[] }
 */
export const validateMedicalOutput = (data: any): { valid: boolean; issues: string[] } => {
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
  const panels = data?.spatial_layout?.panels;
  if (!Array.isArray(panels) || panels.length < 1) {
    issues.push("spatial_layout.panels must have at least 1 panel");
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
      issues.push("diffusion_synthesis.master_prompt contains internal JSON property names or IDs — this causes 'ID Leakage' in the rendered image. Remove these technical markers.");
    }

    // Check for spatial language in master_prompt
    if (!ds.spatial_narrative || ds.spatial_narrative.trim().length < 20) {
      issues.push("diffusion_synthesis.spatial_narrative is missing or too short");
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
  // Enforce that the output journal matches the UI selection
  if (style.includes("cjasn") && js !== "CJASN_Blue_Standard") {
    console.log("[v2.0 Validator] Forcing CJASN Blue Standard alignment");
    data.metadata.journal_standard = "CJASN_Blue_Standard";
  }
  if (style.includes("nejm") && js !== "NEJM_Dense_Slab") {
    console.log("[v2.0 Validator] Forcing NEJM Dense Slab alignment");
    data.metadata.journal_standard = "NEJM_Dense_Slab";
  }
  if (style.includes("nature") && js !== "Nature_Flow_WCN") {
    console.log("[v2.0 Validator] Forcing Nature Flow alignment");
    data.metadata.journal_standard = "Nature_Flow_WCN";
  }

  // Check for Layer 5
  const ds = data?.diffusion_synthesis;
  if (!ds) {
    issues.push("diffusion_synthesis (Layer 5) is missing");
  } else {
    const wordCount = (ds.master_prompt || "").split(/\s+/).length;
    if (wordCount < 100) {
      issues.push(`diffusion_synthesis.master_prompt too short: ${wordCount} words (min: 150)`);
    }
    const svgLeakPattern = /stroke_dasharray|stroke_width|z_index|\{\s*x:\s*\d|\{\s*y:\s*\d|#[0-9a-fA-F]{6}/;
    if (svgLeakPattern.test(ds.master_prompt || "")) {
      issues.push("diffusion_synthesis.master_prompt contains SVG/CSS or hex leaks");
    }
  }

  return { valid: issues.length === 0, issues };
};
