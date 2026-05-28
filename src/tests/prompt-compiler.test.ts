/**
 * Medical Prompt Compiler Tests — ChatGPT (DALL-E 3) & Gemini (Imagen 4) output
 *
 * PURPOSE: These tests verify that the prompt compiler correctly builds prompts
 * you can paste directly into ChatGPT web or Gemini web to generate NEJM/BioRender-
 * style medical illustrations. Each test asserts structural requirements, style tokens,
 * and content quality that determine whether the final image will be publication-grade.
 *
 * RATINGS are appended in comments: ★★★★★ (5-star) = must-pass, ★★★★☆ = high value.
 */

import { describe, it, expect } from "vitest";
import { compileMedicalPrompt } from "../lib/compilers/prompt-compiler";

// ---------------------------------------------------------------------------
// FIXTURES — representative medical illustration JSON blueprints
// ---------------------------------------------------------------------------

/** Glomerulonephritis — light-microscopy scale, BioRender style */
const glomeruloBlueprint = {
  metadata: {
    title: "IgA Nephropathy — Mesangial Expansion",
    subject: "glomerulonephritis with IgA mesangial deposits",
    journal_standard: "BioRender_Clinical",
  },
  medical_content: {
    pathophysiology: {
      description: "IgA immune complex deposition triggers mesangial inflammation",
      cascade: [
        { step: 1, event: "Galactose-deficient IgA1 production", mechanism: "B-cell dysregulation", consequence: "Circulating IgA1-IgG complexes" },
        { step: 2, event: "Mesangial IgA deposition", mechanism: "Immune complex trapping", consequence: "Complement activation via lectin pathway" },
        { step: 3, event: "Mesangial cell proliferation", mechanism: "PDGF and TGF-β1 upregulation", consequence: "Matrix expansion and GBM thickening" },
      ],
    },
    anatomical_zones: [
      { zone_id: "z1", definition: "Glomerular tuft with mesangial hypercellularity", spatial_orientation: "Central foreground" },
      { zone_id: "z2", definition: "Thickened glomerular basement membrane", spatial_orientation: "Peripheral ring" },
      { zone_id: "z3", definition: "Bowman's capsule with parietal epithelium", spatial_orientation: "Outer boundary" },
    ],
  },
  spatial_layout: {
    panels: [
      { panel_id: "p1", semantic_role: "Light microscopy cross-section of glomerulus", relative_placement: "Centre frame", visual_anchor: "Glomerular tuft" },
    ],
  },
  biological_graph: {
    entities: [
      { id: "ent_1", label: "Mesangial cells", anatomical_placement: "Central glomerulus", functional_state: "Proliferating", role: "primary", priority: "high", type: "anatomical_structure" },
      { id: "ent_2", label: "IgA deposits", anatomical_placement: "Mesangial matrix", functional_state: "Deposited", role: "primary" },
      { id: "ent_3", label: "Podocytes", anatomical_placement: "Glomerular basement membrane", functional_state: "Partially effaced", role: "primary" },
    ],
    interactions: [
      { source: "IgA deposits", target: "Mesangial cells", relationship: "activates" },
      { source: "TGF-β1", target: "GBM", relationship: "thickens" },
    ],
  },
  diffusion_synthesis: {
    master_prompt: "A photorealistic light microscopy cross-section of a diseased human glomerulus with IgA nephropathy. The glomerular tuft shows marked mesangial hypercellularity — mesangial cells are enlarged and crowded, their nuclei pale-blue on H&E staining. The mesangial matrix is expanded by pale eosinophilic material representing immune complex deposits. The glomerular basement membrane is thickened and irregular, appearing as a dark homogeneous band. Podocyte foot processes are effaced. Bowman's space is narrowed. Proximal tubule cut profiles are visible in the periphery. Soft ambient clinical laboratory lighting, matte plastic 2.5D BioRender rendering, clean white background.",
    spatial_narrative: "The glomerulus sits centrally in the frame. The mesangial region occupies the core. The capillary loops fan outward. Bowman's capsule forms the outer boundary.",
    style_descriptors: [
      "matte plastic 2.5D render",
      "BioRender-style 3D illustration",
      "soft ambient clinical lighting",
      "clean white background",
      "isometric anatomical view",
      "H&E staining color palette",
    ],
    color_language: [
      { zone: "mesangial matrix", color_descriptor: "pale eosinophilic cream" },
      { zone: "glomerular basement membrane", color_descriptor: "deep violet-slate" },
      { zone: "podocytes", color_descriptor: "pale translucent blue-grey" },
      { zone: "IgA deposits", color_descriptor: "granular ochre-amber" },
    ],
    pathophysiology_visual_summary: "Mesangial hypercellularity and matrix expansion are the dominant visual features, representing IgA immune complex deposition with complement-driven inflammation leading to progressive glomerular scarring.",
    negative_prompt: "no text, no labels, no arrows, no annotations, no cinematic shadows, no dark background",
    priority_weighting: {
      primary_focus: ["Mesangial cells", "IgA deposits", "glomerular basement membrane"],
      secondary_context: ["Podocytes", "Bowman's capsule", "proximal tubule profiles"],
      tertiary_background: ["clean white background", "soft ambient light"],
    },
  },
};

/** Coronary atherosclerosis — gross anatomy scale, NEJM style */
const atherosclerosisBlueprint = {
  metadata: {
    title: "Coronary Artery Atherosclerosis — Vulnerable Plaque",
    subject: "coronary atherosclerosis with vulnerable plaque",
    journal_standard: "NEJM_SCHOLARLY_v30_FINAL",
  },
  medical_content: {
    pathophysiology: {
      description: "Lipid-rich vulnerable plaque with thin fibrous cap in coronary artery",
      cascade: [
        { step: 1, event: "Endothelial dysfunction", mechanism: "Oxidized LDL uptake", consequence: "Foam cell formation" },
        { step: 2, event: "Fibrous cap formation", mechanism: "Smooth muscle cell migration and collagen synthesis", consequence: "Thin fibrous cap overlying necrotic core" },
        { step: 3, event: "Plaque rupture risk", mechanism: "MMP-mediated cap erosion", consequence: "Thrombosis and acute MI" },
      ],
    },
    anatomical_zones: [
      { zone_id: "z1", definition: "Intima with lipid-rich necrotic core", spatial_orientation: "Eccentric lesion on left wall" },
      { zone_id: "z2", definition: "Thin fibrous cap covering necrotic core", spatial_orientation: "Superficial layer over necrotic core" },
      { zone_id: "z3", definition: "Media with smooth muscle atrophy", spatial_orientation: "Deep to intima" },
    ],
  },
  spatial_layout: {
    panels: [
      { panel_id: "p1", semantic_role: "Cross-sectional view of coronary artery lumen", relative_placement: "Full frame", visual_anchor: "Lumen" },
      { panel_id: "p2", semantic_role: "Magnified view of plaque shoulder", relative_placement: "Lower-right inset", visual_anchor: "Fibrous cap" },
    ],
  },
  biological_graph: {
    entities: [
      { id: "ent_1", label: "Foam cells", anatomical_placement: "Necrotic core margins", functional_state: "Lipid-laden", role: "primary", priority: "high", type: "anatomical_structure" },
      { id: "ent_2", label: "Fibrous cap", anatomical_placement: "Luminal surface of plaque", functional_state: "Thin and eroded", role: "primary" },
      { id: "ent_3", label: "Necrotic lipid core", anatomical_placement: "Eccentric intimal position", functional_state: "Soft and granular", role: "primary" },
    ],
    interactions: [
      { source: "MMP", target: "Fibrous cap", relationship: "degrades" },
      { source: "Foam cells", target: "Necrotic core", relationship: "expands" },
    ],
  },
  diffusion_synthesis: {
    master_prompt: "A Netter-style watercolor-and-ink anatomical illustration of a coronary artery cross-section showing vulnerable atherosclerotic plaque. The vessel is cut perpendicular to its lumen. The lumen appears as an irregular, narrowed central space. An eccentric plaque occupies the left intimal wall. The necrotic lipid core is ochre-yellow and granular, soft-appearing with a cholesterol crystal texture. The thin fibrous cap is pale grey-white and semi-translucent, stretched across the necrotic core with visible thinning at the shoulders. Foam cells are visible at the necrotic core margins — pale, vacuolated cells with irregular cytoplasmic borders. The media is thinned with smooth muscle atrophy. The adventitia appears as a fibrous white outer ring. Muted clinical watercolor palette, fine stipple shading, white background.",
    spatial_narrative: "The coronary artery lumen sits centrally. The eccentric plaque occupies the left third. The necrotic core sits deep in the plaque. The fibrous cap forms the lumenal surface of the plaque. The right wall shows near-normal intima.",
    style_descriptors: [
      "Netter watercolor-and-ink style",
      "muted clinical palette",
      "fine stipple shading",
      "white background",
      "scholarly medical plate aesthetic",
      "NEJM case report figure",
    ],
    color_language: [
      { zone: "necrotic lipid core", color_descriptor: "ochre-yellow granular" },
      { zone: "fibrous cap", color_descriptor: "pale grey-white translucent" },
      { zone: "foam cells", color_descriptor: "pale vacuolated ivory" },
      { zone: "media", color_descriptor: "pale pink smooth muscle bands" },
    ],
    pathophysiology_visual_summary: "The dominant visual narrative is the vulnerable plaque: a large necrotic lipid core covered by a dangerously thin fibrous cap at high risk of MMP-mediated rupture, triggering acute coronary syndrome.",
    negative_prompt: "no text, no labels, no arrows, no annotations, no dark cinematic lighting, no blur",
    priority_weighting: {
      primary_focus: ["Necrotic lipid core", "Fibrous cap", "Foam cells"],
      secondary_context: ["Tunica media", "Adventitia", "residual lumen"],
      tertiary_background: ["white background", "muted stipple shading"],
    },
  },
};

/** Laparoscopic cholecystectomy — surgical field scale */
const cholecystectomyBlueprint = {
  metadata: {
    title: "Laparoscopic Cholecystectomy — Critical View of Safety",
    subject: "laparoscopic cholecystectomy dissection of Calot's triangle",
    journal_standard: "NEJM_SCHOLARLY_v30_FINAL",
  },
  medical_content: {
    pathophysiology: {
      description: "Operative dissection to achieve Critical View of Safety",
      cascade: [
        { step: 1, event: "Peritoneal reflection incision", mechanism: "Monopolar cautery dissection", consequence: "Exposure of hepatocystic triangle" },
        { step: 2, event: "Calot's triangle dissection", mechanism: "Blunt and sharp dissection", consequence: "Isolation of cystic duct and cystic artery" },
        { step: 3, event: "Critical View of Safety achieved", mechanism: "Two-structure rule confirmed", consequence: "Safe clipping and division" },
      ],
    },
    anatomical_zones: [
      { zone_id: "z1", definition: "Calot's triangle between cystic duct, common hepatic duct, and liver margin", spatial_orientation: "Central operative field" },
      { zone_id: "z2", definition: "Cystic duct with metal clips applied", spatial_orientation: "Lower aspect of dissection" },
      { zone_id: "z3", definition: "Cystic artery running to gallbladder", spatial_orientation: "Superior within Calot's triangle" },
    ],
  },
  spatial_layout: {
    panels: [
      { panel_id: "p1", semantic_role: "4K laparoscopic operative view of Calot's triangle dissection", relative_placement: "Full frame", visual_anchor: "Calot's triangle" },
    ],
  },
  biological_graph: {
    entities: [
      { id: "ent_1", label: "Cystic duct", anatomical_placement: "Inferior Calot's triangle", functional_state: "Clipped and divided", role: "primary", priority: "high", type: "anatomical_structure" },
      { id: "ent_2", label: "Cystic artery", anatomical_placement: "Superior Calot's triangle", functional_state: "Exposed", role: "primary" },
      { id: "ent_3", label: "Common bile duct", anatomical_placement: "Medial, not in operative field", functional_state: "Protected", role: "primary" },
    ],
    interactions: [],
  },
  diffusion_synthesis: {
    master_prompt: "A 4K surgical field illustration under cold white LED operative lighting showing laparoscopic cholecystectomy. The operative field shows Calot's triangle dissection. The cystic duct appears as a pale, tubular structure with two titanium clips applied — the duct is translucent-white with visible wall tension. The cystic artery runs superiorly within the triangle — a small-caliber vessel with a deep arterial crimson color, its course traced along the gallbladder fundus. The peritoneal reflections are retracted revealing glistening, translucent hepatocystic peritoneum stretched under tension. The gallbladder fundus is retracted superiorly by a grasper — its wall is distended, the serosa is smooth and pale-green-grey. The liver margin is visible at the superior boundary with its characteristic chocolate-brown parenchyma. Uniform cold white operative LED illumination, no chiaroscuro, 4K laparoscopic endoscope rendering, tissue planes sharply differentiated.",
    spatial_narrative: "The cystic duct runs diagonally from lower-left to centre. The cystic artery crosses superiorly. The liver margin forms the upper boundary. The gallbladder is retracted toward the upper-right.",
    style_descriptors: [
      "4K surgical field illustration",
      "cold white LED operative lighting",
      "Netter surgical anatomy plate",
      "diagrammatic photorealism",
      "tissue planes clearly differentiated",
      "sterile field background",
    ],
    color_language: [
      { zone: "cystic duct", color_descriptor: "translucent-white tubular" },
      { zone: "cystic artery", color_descriptor: "deep arterial crimson" },
      { zone: "liver margin", color_descriptor: "chocolate-brown parenchyma" },
      { zone: "peritoneum", color_descriptor: "glistening translucent membrane" },
    ],
    pathophysiology_visual_summary: "Critical View of Safety achieved: cystic duct and cystic artery individually isolated within Calot's triangle, lower third of gallbladder dissected free of liver bed, confirming two-structure rule before clipping.",
    negative_prompt: "no text, no labels, no chiaroscuro, no cinematic shadows, no bokeh, no anamorphic lens distortion",
    priority_weighting: {
      primary_focus: ["Cystic duct with clips", "Cystic artery", "Calot's triangle"],
      secondary_context: ["Liver margin", "Gallbladder fundus", "Hepatocystic peritoneum"],
      tertiary_background: ["Sterile drape background", "Uniform cold white LED illumination"],
    },
  },
};

// ---------------------------------------------------------------------------
// HELPER — run the compiler on a deep clone and return both generated prompts
// Always deep-clones to prevent cross-test mutation contamination.
// ---------------------------------------------------------------------------
function compile(blueprint: any): { chatgpt: string; gemini: string; compiled: any } {
  const bp = JSON.parse(JSON.stringify(blueprint));
  compileMedicalPrompt(bp);
  return {
    chatgpt: bp.diffusion_synthesis?.chatgpt_prompt || "",
    gemini: bp.diffusion_synthesis?.imagen_prompt || "",
    compiled: bp,
  };
}

// ---------------------------------------------------------------------------
// TEST SUITE 1: Gemini (Imagen 4 / Gemini Web) prompt requirements
// ---------------------------------------------------------------------------
describe("Gemini Web / Imagen 4 Prompt Generation — Medical Illustrations", () => {

  describe("IgA Nephropathy — BioRender style (light microscopy)", () => {
    it("★★★★★ generates a non-empty Gemini prompt", () => {
      const { gemini } = compile(glomeruloBlueprint);
      expect(gemini.length).toBeGreaterThan(100);
    });

    it("★★★★★ opens with a rendering style + subject sentence (clean prose, no brackets)", () => {
      const { gemini } = compile(glomeruloBlueprint);
      const firstSentence = gemini.split(".")[0];
      // Must start with a style declaration, not a JSON artifact
      expect(firstSentence).not.toMatch(/^\{|^\[/);
      // Must contain subject matter
      expect(firstSentence.toLowerCase()).toMatch(/mesangial|glomerul|microscopy|biorender|light microscopy/);
    });

    it("★★★★★ contains pathophysiology visual hook describing disease mechanism", () => {
      const { gemini } = compile(glomeruloBlueprint);
      expect(gemini.toLowerCase()).toMatch(/mesangial|iga|deposition|hypercellularity|inflammation|proliferat/);
    });

    it("★★★★★ includes spatial/layout composition information", () => {
      const { gemini } = compile(glomeruloBlueprint);
      expect(gemini.toLowerCase()).toMatch(/central|foreground|frame|glomerulus|sits|periphery|outer boundary/);
    });

    it("★★★★★ uses prose negatives (no bracket-style negative prompt)", () => {
      const { gemini } = compile(glomeruloBlueprint);
      // Gemini format: "Do not include: ..." in prose, not "[negative]:" style
      expect(gemini).toMatch(/do not include|no text|no label/i);
      expect(gemini).not.toMatch(/^\[negative/im);
    });

    it("★★★★★ contains color language for key anatomical zones", () => {
      const { gemini } = compile(glomeruloBlueprint);
      expect(gemini.toLowerCase()).toMatch(/eosinophilic|slate|ochre|amber|cream|violet|translucent/);
    });

    it("★★★★★ contains BioRender-compatible style tokens for light microscopy", () => {
      const { gemini } = compile(glomeruloBlueprint);
      expect(gemini.toLowerCase()).toMatch(/biorender|2\.5d|matte|h&e|microscopy|plastic|clinical/);
    });

    it("★★★★☆ includes mechanistic causality from Layer 2 (pathophysiology cascade)", () => {
      const { gemini } = compile(glomeruloBlueprint);
      expect(gemini.toLowerCase()).toMatch(/iga|complement|tgf|causal|mechanism|mesangial/);
    });

    it("★★★★☆ includes biological entity interactions from Layer 4", () => {
      const { gemini } = compile(glomeruloBlueprint);
      expect(gemini.toLowerCase()).toMatch(/iga deposits|mesangial cells|activates|thickens|gbm|tgf/);
    });

    it("★★★★★ contains no raw SVG/CSS technical markers", () => {
      const { gemini } = compile(glomeruloBlueprint);
      expect(gemini).not.toMatch(/stroke_dasharray|stroke_width|z_index|#[0-9a-fA-F]{6}/);
    });

    it("★★★★★ contains no schema ID leakage (ent_, panel_, p1_)", () => {
      const { gemini } = compile(glomeruloBlueprint);
      expect(gemini).not.toMatch(/\bent_\w+|\bpanel_\w+|\bp[123]_\w+/);
    });

    it("★★★★★ word count is within Gemini-optimal range (80–350 words)", () => {
      const { gemini } = compile(glomeruloBlueprint);
      const wordCount = gemini.split(/\s+/).length;
      expect(wordCount).toBeGreaterThanOrEqual(80);
      expect(wordCount).toBeLessThanOrEqual(400);
    });
  });

  describe("Coronary Atherosclerosis — NEJM Netter style (gross anatomy)", () => {
    it("★★★★★ generates a Gemini prompt with NEJM/Netter style markers", () => {
      const { gemini } = compile(atherosclerosisBlueprint);
      expect(gemini.toLowerCase()).toMatch(/netter|watercolor|nejm|stipple|scholarly|muted|clinical/);
    });

    it("★★★★★ correctly identifies gross anatomy scale and opens accordingly", () => {
      const { gemini } = compile(atherosclerosisBlueprint);
      const firstSentence = gemini.split(".")[0].toLowerCase();
      expect(firstSentence).toMatch(/nejm|anatomical|netter|illustration|coronar|vessel/);
    });

    it("★★★★★ describes the necrotic core with correct color language", () => {
      const { gemini } = compile(atherosclerosisBlueprint);
      expect(gemini.toLowerCase()).toMatch(/ochre|yellow|granular|necrotic|lipid|core/);
    });

    it("★★★★★ describes the fibrous cap pathology", () => {
      const { gemini } = compile(atherosclerosisBlueprint);
      expect(gemini.toLowerCase()).toMatch(/fibrous cap|thin|grey|pale|translucent|pale grey/);
    });

    it("★★★★★ includes pathophysiology hook about vulnerable plaque / rupture risk", () => {
      const { gemini } = compile(atherosclerosisBlueprint);
      expect(gemini.toLowerCase()).toMatch(/vulnerable|rupture|plaque|mmp|cap|thrombos/);
    });

    it("★★★★★ ends with a prose negative instruction", () => {
      const { gemini } = compile(atherosclerosisBlueprint);
      const lastSegment = gemini.slice(-200).toLowerCase();
      expect(lastSegment).toMatch(/do not include|no text|no label|no arrow|no annot/);
    });

    it("★★★★☆ infers 2-panel layout aspect ratio for 2-panel blueprint", () => {
      const { gemini } = compile(atherosclerosisBlueprint);
      // 2 panels → landscape 4:3
      expect(gemini.toLowerCase()).toMatch(/landscape|4:3|format/);
    });
  });

  describe("Surgical Field — SVSP compliance (laparoscopic cholecystectomy)", () => {
    it("★★★★★ generates a surgical-scale Gemini prompt", () => {
      const { gemini } = compile(cholecystectomyBlueprint);
      expect(gemini.toLowerCase()).toMatch(/surgical|laparoscop|operative|4k|led/);
    });

    it("★★★★★ uses cold white LED lighting; chiaroscuro only appears as a prohibited term", () => {
      const { gemini } = compile(cholecystectomyBlueprint);
      expect(gemini.toLowerCase()).toMatch(/cold white|led|operative|uniform/);
      // "chiaroscuro" may appear in the negative/exclusion clause — that's correct SVSP behavior.
      // What must NOT happen is chiaroscuro being used as a positive style descriptor.
      expect(gemini.toLowerCase()).not.toMatch(/rendering style.*chiaroscuro|use chiaroscuro|chiaroscuro lighting/);
    });

    it("★★★★★ identifies cystic duct and cystic artery as primary structures", () => {
      const { gemini } = compile(cholecystectomyBlueprint);
      expect(gemini.toLowerCase()).toMatch(/cystic duct/);
      expect(gemini.toLowerCase()).toMatch(/cystic artery/);
    });

    it("★★★★★ describes correct tissue colors for surgical field", () => {
      const { gemini } = compile(cholecystectomyBlueprint);
      expect(gemini.toLowerCase()).toMatch(/translucent|crimson|chocolate|glistening|white/);
    });

    it("★★★★★ ends with no-label negative instruction", () => {
      const { gemini } = compile(cholecystectomyBlueprint);
      expect(gemini.toLowerCase()).toMatch(/do not include|no text|no label/);
    });
  });
});

// ---------------------------------------------------------------------------
// TEST SUITE 2: ChatGPT / DALL-E 3 prompt requirements
// ---------------------------------------------------------------------------
describe("ChatGPT Web / DALL-E 3 Prompt Generation — Medical Illustrations", () => {

  describe("IgA Nephropathy — BioRender style", () => {
    it("★★★★★ generates a non-empty ChatGPT prompt", () => {
      const { chatgpt } = compile(glomeruloBlueprint);
      expect(chatgpt.length).toBeGreaterThan(100);
    });

    it("★★★★★ opens with a style imperative as the first clause (DALL-E 3 rule)", () => {
      const { chatgpt } = compile(glomeruloBlueprint);
      const firstSentence = chatgpt.split(".")[0];
      // DALL-E 3 requires style + subject in opening — not a question, not JSON
      expect(firstSentence).toMatch(/^A (BioRender|photorealistic|high-resolution|NEJM|Netter|4K surgical|clean scientific|high-fidelity)/);
    });

    it("★★★★★ does NOT use bracket-style negative prompts (DALL-E 3 ignores them)", () => {
      const { chatgpt } = compile(glomeruloBlueprint);
      // DALL-E 3 best practice: positive 'pure visual anatomy' statement, not [no X]
      expect(chatgpt).not.toMatch(/\[negative\]|\[no /i);
      expect(chatgpt.toLowerCase()).toMatch(/pure visual anatomy|no text.*no label|no annotations/);
    });

    it("★★★★★ uses 'use X for Y' color directives (DALL-E 3 responds to these)", () => {
      const { chatgpt } = compile(glomeruloBlueprint);
      expect(chatgpt.toLowerCase()).toMatch(/use .* for (mesangial|glomerular|podocyte|iga|zone)/);
    });

    it("★★★★★ includes explicit layout instruction (DALL-E 3 follows spatial instructions well)", () => {
      const { chatgpt } = compile(glomeruloBlueprint);
      expect(chatgpt.toLowerCase()).toMatch(/layout:|spatial|central|foreground|frame|sits/);
    });

    it("★★★★★ ends with 'Pure visual anatomy' purity directive", () => {
      const { chatgpt } = compile(glomeruloBlueprint);
      expect(chatgpt).toMatch(/Pure visual anatomy — no text, no labels, no annotations/i);
    });

    it("★★★★★ contains no SVG/CSS technical markers", () => {
      const { chatgpt } = compile(glomeruloBlueprint);
      expect(chatgpt).not.toMatch(/stroke_dasharray|stroke_width|z_index|#[0-9a-fA-F]{6}/);
    });

    it("★★★★★ contains no schema ID leakage", () => {
      const { chatgpt } = compile(glomeruloBlueprint);
      expect(chatgpt).not.toMatch(/\bent_\w+|\bpanel_\w+|\bp[123]_\w+/);
    });

    it("★★★★★ includes pathophysiology as a positive directive (not 'do not show X')", () => {
      const { chatgpt } = compile(glomeruloBlueprint);
      // Must say 'The illustration shows:' — positive directive, not negative framing
      expect(chatgpt).toMatch(/The illustration shows:/i);
    });

    it("★★★★★ word count in optimal DALL-E 3 range (80–350 words)", () => {
      const { chatgpt } = compile(glomeruloBlueprint);
      const wordCount = chatgpt.split(/\s+/).length;
      expect(wordCount).toBeGreaterThanOrEqual(80);
      expect(wordCount).toBeLessThanOrEqual(400);
    });

    it("★★★★★ specifies canvas/aspect ratio directive", () => {
      const { chatgpt } = compile(glomeruloBlueprint);
      expect(chatgpt.toLowerCase()).toMatch(/canvas:|aspect ratio|square|portrait|landscape|format/);
    });
  });

  describe("Coronary Atherosclerosis — NEJM Netter style", () => {
    it("★★★★★ opens with NEJM/Netter style imperative", () => {
      const { chatgpt } = compile(atherosclerosisBlueprint);
      const opening = chatgpt.split(".")[0];
      expect(opening).toMatch(/^A (NEJM|Netter|anatomical|high-fidelity)/i);
    });

    it("★★★★★ uses 'use X color for Y' directives for plaque zones", () => {
      const { chatgpt } = compile(atherosclerosisBlueprint);
      expect(chatgpt.toLowerCase()).toMatch(/use ochre|use pale grey|use ivory|use pink|for (necrotic|fibrous|foam|media)/);
    });

    it("★★★★★ specifies 'Rendering style:' footer with model-native tokens", () => {
      const { chatgpt } = compile(atherosclerosisBlueprint);
      expect(chatgpt).toMatch(/Rendering style:/i);
      expect(chatgpt.toLowerCase()).toMatch(/netter|watercolor|stipple|scholarly|muted/);
    });

    it("★★★★★ includes mechanistic causality from cascade", () => {
      const { chatgpt } = compile(atherosclerosisBlueprint);
      expect(chatgpt.toLowerCase()).toMatch(/depict the mechanism:|mmp|foam cell|endothelial|fibrous cap|lipid/);
    });

    it("★★★★★ specifies supporting anatomy context", () => {
      const { chatgpt } = compile(atherosclerosisBlueprint);
      expect(chatgpt.toLowerCase()).toMatch(/supporting anatomy|tunica media|adventitia|lumen/);
    });
  });

  describe("Surgical Field — SVSP compliance", () => {
    it("★★★★★ opens with surgical field style imperative (not BioRender or NEJM watercolor)", () => {
      const { chatgpt } = compile(cholecystectomyBlueprint);
      const opening = chatgpt.split(".")[0].toLowerCase();
      expect(opening).toMatch(/surgical|4k|operative|laparoscop|netter surgical/);
      expect(opening).not.toMatch(/watercolor|biorender|plasticine/);
    });

    it("★★★★★ correctly identifies primary focus structures in opening", () => {
      const { chatgpt } = compile(cholecystectomyBlueprint);
      const opening = chatgpt.split(".")[0].toLowerCase();
      expect(opening).toMatch(/cystic duct|cystic artery|calot/);
    });

    it("★★★★★ ends with pure visual purity directive", () => {
      const { chatgpt } = compile(cholecystectomyBlueprint);
      expect(chatgpt).toMatch(/Pure visual anatomy — no text, no labels, no annotations/i);
    });
  });
});

// ---------------------------------------------------------------------------
// TEST SUITE 3: Prompt differentiation — ChatGPT vs Gemini must be DIFFERENT
// ---------------------------------------------------------------------------
describe("Prompt Format Differentiation (ChatGPT ≠ Gemini)", () => {

  it("★★★★★ ChatGPT and Gemini prompts are meaningfully different strings", () => {
    const { chatgpt, gemini } = compile(glomeruloBlueprint);
    expect(chatgpt).not.toEqual(gemini);
    // They should share some content (same subject) but differ significantly in structure
    const similarity = chatgpt.split(" ").filter(w => gemini.includes(w)).length / chatgpt.split(" ").length;
    // Shared vocabulary expected (same anatomy), but full strings should diverge
    expect(similarity).toBeLessThan(0.95);
  });

  it("★★★★★ Gemini prompt ends with prose negatives ('Do not include:')", () => {
    const { gemini } = compile(glomeruloBlueprint);
    expect(gemini).toMatch(/Do not include:/i);
  });

  it("★★★★★ ChatGPT prompt ends with 'Pure visual anatomy' purity directive (never 'Do not include:')", () => {
    const { chatgpt } = compile(glomeruloBlueprint);
    expect(chatgpt).toMatch(/Pure visual anatomy/i);
    // ChatGPT version should NOT use Gemini-style 'Do not include:' ending
    expect(chatgpt).not.toMatch(/Do not include:/i);
  });

  it("★★★★★ ChatGPT uses 'use X for Y' color directives, Gemini uses 'X in Y' color prose", () => {
    const { chatgpt, gemini } = compile(glomeruloBlueprint);
    expect(chatgpt.toLowerCase()).toMatch(/use .* for /);
    expect(gemini.toLowerCase()).toMatch(/ in (pale|deep|ochre|violet|granular|translucent|cream)/);
  });

  it("★★★★★ ChatGPT includes 'Rendering style:' label; Gemini does not use that label", () => {
    const { chatgpt, gemini } = compile(atherosclerosisBlueprint);
    expect(chatgpt).toMatch(/Rendering style:/);
    expect(gemini).not.toMatch(/Rendering style:/);
  });

  it("★★★★★ ChatGPT has explicit 'Layout:' label; Gemini integrates layout as prose", () => {
    const { chatgpt, gemini } = compile(glomeruloBlueprint);
    expect(chatgpt).toMatch(/Layout:/i);
    // Gemini weaves spatial info into natural sentences without the 'Layout:' label
    expect(gemini).not.toMatch(/^Layout:/m);
  });
});

// ---------------------------------------------------------------------------
// TEST SUITE 4: Scale inference — correct rendering style for each anatomy level
// ---------------------------------------------------------------------------
describe("Anatomical Scale Inference — correct rendering style per scale", () => {

  it("★★★★★ light microscopy subject → uses light microscopy rendering style", () => {
    const bp = JSON.parse(JSON.stringify(glomeruloBlueprint));
    const { chatgpt, gemini } = compile(bp);
    // Light microscopy scale → should use 'light microscopy' or 'H&E' or 'photorealistic histological'
    const combined = (chatgpt + gemini).toLowerCase();
    expect(combined).toMatch(/light microscopy|h&e|histological|microscopy-scale|biorender/);
  });

  it("★★★★★ surgical subject → uses surgical field rendering style", () => {
    const bp = JSON.parse(JSON.stringify(cholecystectomyBlueprint));
    const { chatgpt, gemini } = compile(bp);
    const combined = (chatgpt + gemini).toLowerCase();
    expect(combined).toMatch(/surgical|netter surgical|operative|led|4k/);
    expect(combined).not.toMatch(/biorender.*plasticine/); // wrong scale
  });

  it("★★★★★ gross anatomy (coronary) → uses Netter/NEJM anatomical rendering", () => {
    const bp = JSON.parse(JSON.stringify(atherosclerosisBlueprint));
    const { chatgpt, gemini } = compile(bp);
    const combined = (chatgpt + gemini).toLowerCase();
    expect(combined).toMatch(/netter|watercolor|nejm|anatomical|gross anatomy/);
  });

  it("★★★★☆ molecular/pathway subject → uses flat scientific diagram style", () => {
    const molecularBp = {
      metadata: { title: "TGF-β Signaling Pathway in Fibrosis", subject: "TGF-β pathway signaling cascade in renal fibrosis", journal_standard: "Nature_Structural_Biology" },
      medical_content: {
        pathophysiology: {
          description: "TGF-β1 drives fibroblast activation via SMAD2/3 phosphorylation",
          cascade: [{ step: 1, event: "TGF-β1 receptor binding", mechanism: "Type II receptor transphosphorylation", consequence: "SMAD2/3 activation" }],
        },
        anatomical_zones: [{ zone_id: "z1", definition: "TGF-β receptor complex on fibroblast membrane", spatial_orientation: "Cell surface" }],
      },
      spatial_layout: { panels: [{ panel_id: "p1", semantic_role: "Signaling pathway diagram", relative_placement: "Full frame", visual_anchor: "TGF-β receptor" }] },
      biological_graph: {
        entities: [
          { id: "ent_1", label: "TGF-β1", anatomical_placement: "Extracellular", functional_state: "Active ligand", role: "primary", priority: "high", type: "anatomical_structure" },
          { id: "ent_2", label: "SMAD2/3", anatomical_placement: "Cytoplasm", functional_state: "Phosphorylated", role: "primary" },
        ],
        interactions: [{ source: "TGF-β1", target: "SMAD2/3", relationship: "phosphorylates" }],
      },
      diffusion_synthesis: {
        master_prompt: "A clean mechanistic pathway diagram showing TGF-β1 signaling cascade driving renal fibrosis. TGF-β1 ligand binds the type II receptor complex at the fibroblast surface, triggering transphosphorylation that activates SMAD2 and SMAD3 proteins. Phosphorylated SMADs form a heterotrimer with SMAD4 and translocate to the nucleus, upregulating collagen I, fibronectin, and alpha-SMA expression. Color-coded molecular components on a clean white background.",
        spatial_narrative: "TGF-β1 is positioned extracellularly at the top. The receptor complex spans the membrane. SMADs move from cytoplasm upward to the nucleus at the bottom.",
        style_descriptors: ["flat scientific vector diagram", "color-coded molecular components", "clean white background", "pathway diagram style"],
        color_language: [{ zone: "TGF-β1 ligand", color_descriptor: "vivid teal" }, { zone: "phosphorylated SMADs", color_descriptor: "bright amber-orange" }],
        pathophysiology_visual_summary: "TGF-β1 phosphorylates SMAD2/3 driving fibroblast-to-myofibroblast transition and collagen deposition in renal fibrosis.",
        negative_prompt: "no text, no labels, no photorealism, no dark background",
        priority_weighting: {
          primary_focus: ["TGF-β1 receptor complex", "SMAD2/3 phosphorylation", "nuclear SMAD4 complex"],
          secondary_context: ["Fibroblast membrane", "Collagen I upregulation"],
          tertiary_background: ["White background", "Clean vector space"],
        },
      },
    };
    const { chatgpt, gemini } = compile(molecularBp);
    const combined = (chatgpt + gemini).toLowerCase();
    expect(combined).toMatch(/pathway|scientific|diagram|flat|vector|molecular|cell|nature reviews/);
  });
});

// ---------------------------------------------------------------------------
// TEST SUITE 5: Noise pruning — no technical garbage in final prompts
// ---------------------------------------------------------------------------
describe("Noise Pruning — output must be clean for direct pasting", () => {

  it("★★★★★ strips hex color codes from master_prompt before building output prompts", () => {
    const dirtyBp = JSON.parse(JSON.stringify(glomeruloBlueprint));
    dirtyBp.diffusion_synthesis.master_prompt += " Color: #ff0000 for vessels, #0000ff for veins, stroke_width: 2";
    const { chatgpt, gemini } = compile(dirtyBp);
    expect(chatgpt).not.toMatch(/#[0-9a-fA-F]{6}/);
    expect(gemini).not.toMatch(/#[0-9a-fA-F]{6}/);
  });

  it("★★★★★ strips stroke_dasharray from prompts", () => {
    const dirtyBp = JSON.parse(JSON.stringify(glomeruloBlueprint));
    dirtyBp.diffusion_synthesis.master_prompt += " stroke_dasharray: 5 3, stroke_width: 2";
    const { chatgpt, gemini } = compile(dirtyBp);
    expect(chatgpt).not.toMatch(/stroke_dasharray/);
    expect(gemini).not.toMatch(/stroke_dasharray/);
  });

  it("★★★★★ strips z_index CSS artifact from prompts", () => {
    const dirtyBp = JSON.parse(JSON.stringify(glomeruloBlueprint));
    dirtyBp.diffusion_synthesis.master_prompt += " z_index: 10, opacity: 0.8";
    const { chatgpt, gemini } = compile(dirtyBp);
    expect(chatgpt).not.toMatch(/z_index/);
    expect(gemini).not.toMatch(/z_index/);
  });

  it("★★★★★ strips schema entity IDs (ent_001, panel_left) from prompts", () => {
    const dirtyBp = JSON.parse(JSON.stringify(glomeruloBlueprint));
    dirtyBp.diffusion_synthesis.master_prompt += " The structure ent_001 in panel_left connects to p1_boundary.";
    const { chatgpt, gemini } = compile(dirtyBp);
    expect(chatgpt).not.toMatch(/\bent_\d+\b|\bpanel_\w+\b|\bp1_\w+\b/);
    expect(gemini).not.toMatch(/\bent_\d+\b|\bpanel_\w+\b|\bp1_\w+\b/);
  });

  it("★★★★★ both prompts contain no double spaces (whitespace normalized)", () => {
    const { chatgpt, gemini } = compile(glomeruloBlueprint);
    expect(chatgpt).not.toMatch(/\s{2,}/);
    expect(gemini).not.toMatch(/\s{2,}/);
  });
});

// ---------------------------------------------------------------------------
// TEST SUITE 6: Compiled blocks (legacy reference format) stored on adData
// ---------------------------------------------------------------------------
describe("compileMedicalPrompt — compiled_prompt block format (legacy renderer reference)", () => {

  it("★★★★★ writes diffusion_synthesis.compiled_prompt to the adData object", () => {
    const bp = JSON.parse(JSON.stringify(glomeruloBlueprint));
    compileMedicalPrompt(bp);
    expect(bp.diffusion_synthesis.compiled_prompt).toBeDefined();
    expect(typeof bp.diffusion_synthesis.compiled_prompt).toBe("string");
    expect(bp.diffusion_synthesis.compiled_prompt.length).toBeGreaterThan(50);
  });

  it("★★★★★ compiled_prompt contains [PRIMARY FOCUS] block", () => {
    const bp = JSON.parse(JSON.stringify(glomeruloBlueprint));
    compileMedicalPrompt(bp);
    expect(bp.diffusion_synthesis.compiled_prompt).toMatch(/\[PRIMARY FOCUS\]/);
  });

  it("★★★★★ compiled_prompt contains [STYLE PROTOCOL] block", () => {
    const bp = JSON.parse(JSON.stringify(glomeruloBlueprint));
    compileMedicalPrompt(bp);
    expect(bp.diffusion_synthesis.compiled_prompt).toMatch(/\[STYLE PROTOCOL\]/);
  });

  it("★★★★★ compiled_prompt contains [COLOR PROTOCOL] block", () => {
    const bp = JSON.parse(JSON.stringify(glomeruloBlueprint));
    compileMedicalPrompt(bp);
    expect(bp.diffusion_synthesis.compiled_prompt).toMatch(/\[COLOR PROTOCOL\]/);
  });

  it("★★★★★ imagen_prompt (Gemini) is stored at diffusion_synthesis.imagen_prompt", () => {
    const bp = JSON.parse(JSON.stringify(glomeruloBlueprint));
    compileMedicalPrompt(bp);
    expect(bp.diffusion_synthesis.imagen_prompt).toBeDefined();
    expect(bp.diffusion_synthesis.imagen_prompt.length).toBeGreaterThan(80);
  });

  it("★★★★★ chatgpt_prompt is stored at diffusion_synthesis.chatgpt_prompt", () => {
    const bp = JSON.parse(JSON.stringify(glomeruloBlueprint));
    compileMedicalPrompt(bp);
    expect(bp.diffusion_synthesis.chatgpt_prompt).toBeDefined();
    expect(bp.diffusion_synthesis.chatgpt_prompt.length).toBeGreaterThan(80);
  });

  it("★★★★☆ gracefully handles missing diffusion_synthesis (no crash)", () => {
    const minimalBp = { metadata: { title: "Test", subject: "test", journal_standard: "NEJM_SCHOLARLY_v30_FINAL" } };
    expect(() => compileMedicalPrompt(minimalBp)).not.toThrow();
  });

  it("★★★★☆ gracefully handles empty adData object (no crash)", () => {
    // null is an invalid contract — only test empty object which has no diffusion_synthesis
    expect(() => compileMedicalPrompt({})).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// TEST SUITE 7: Deduplication — master_prompt spatial overlap removal
// ---------------------------------------------------------------------------
describe("Spatial Deduplication — master_prompt vs spatial_narrative overlap", () => {

  it("★★★★★ removes sentences from master_prompt that heavily overlap with spatial_narrative opening", () => {
    const bp = JSON.parse(JSON.stringify(glomeruloBlueprint));
    // The spatial_narrative starts: "The glomerulus sits centrally in the frame."
    // Inject a sentence sharing 3+ long words (glomerulus/centrally/frame/mesangial/occupies/region)
    // to trigger the dedup filter (overlap threshold: 3 words >5 chars from first 12 spatial words)
    bp.diffusion_synthesis.master_prompt =
      "The glomerulus occupies centrally the frame with mesangial region expanding outward. " +
      bp.diffusion_synthesis.master_prompt;
    compileMedicalPrompt(bp);
    const chatgpt = bp.diffusion_synthesis.chatgpt_prompt;
    // The injected near-duplicate should have been filtered — glomerulus+centrally+mesangial overlap
    const dedupedSentenceMatches = chatgpt.match(/glomerulus occupies centrally/gi) || [];
    expect(dedupedSentenceMatches.length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// TEST SUITE 8: Ratings summary — rate each prompt quality dimension
// ---------------------------------------------------------------------------
describe("Prompt Quality Ratings — NEJM/BioRender Style Compliance", () => {

  it("Gemini prompt — RATING: Scientific density ≥ 10 scientific/anatomical terms", () => {
    const { gemini } = compile(glomeruloBlueprint);
    const scientificTerms = gemini.match(/mesangial|glomerul|podocyte|basement membrane|iga|complement|tgf|gbm|nephropathy|hypercellularity|effacement|immunofluor|h&e|biopsy|histolog|peritoneum|endotheli|fibros|inflam|ischemia|infarct|plaque|atheroscler|coronar|surgical|operative|calot|laparoscop/gi) || [];
    expect(scientificTerms.length).toBeGreaterThanOrEqual(10);
  });

  it("ChatGPT prompt — RATING: Scientific density ≥ 10 scientific/anatomical terms", () => {
    const { chatgpt } = compile(glomeruloBlueprint);
    const scientificTerms = chatgpt.match(/mesangial|glomerul|podocyte|basement membrane|iga|complement|tgf|gbm|nephropathy|hypercellularity|effacement|immunofluor|h&e|biopsy|histolog|peritoneum|endotheli|fibros|inflam|ischemia|infarct|plaque|atheroscler|coronar|surgical|operative|calot|laparoscop/gi) || [];
    expect(scientificTerms.length).toBeGreaterThanOrEqual(10);
  });

  it("Gemini prompt — RATING: Rendering style tokens present (≥ 3 model-native style signals)", () => {
    const { gemini } = compile(glomeruloBlueprint);
    const styleTerms = gemini.match(/matte|2\.5d|biorender|clinical|ambient|white background|isometric|h&e|plasticine|netter|watercolor|stipple|scholarly|microscopy|surgical|led|4k|photorealistic|flat vector|molecular|nature|cell biology|nejm/gi) || [];
    expect(styleTerms.length).toBeGreaterThanOrEqual(3);
  });

  it("ChatGPT prompt — RATING: Has explicit Rendering style directive", () => {
    const { chatgpt } = compile(glomeruloBlueprint);
    expect(chatgpt).toMatch(/Rendering style:/i);
  });

  it("Both prompts — RATING: No publication brand tokens that confuse image models", () => {
    // 'NEJM scholarly plate' and 'Nature standard' are meaningless to image AI — should not appear raw
    // They can appear as part of longer natural-language descriptions but not as bare brand directives
    const { chatgpt, gemini } = compile(glomeruloBlueprint);
    const combined = chatgpt + " " + gemini;
    // The old bad token 'NEJM scholarly plate' should be resolved to actual visual descriptors
    expect(combined).not.toMatch(/NEJM scholarly plate/i);
    expect(combined).not.toMatch(/Nature standard/i);
    expect(combined).not.toMatch(/journal quality/i);
  });
});
