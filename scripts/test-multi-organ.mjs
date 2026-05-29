/**
 * Multi-organ prompt compiler test runner
 * Run with: node --experimental-vm-modules scripts/test-multi-organ.mjs
 * Uses tsx for TypeScript execution
 */

// We import via tsx/ts-node — invoked from package.json script
import { compileMedicalPrompt } from "../src/lib/compilers/prompt-compiler.ts";

function compile(blueprint, brief = "") {
  const bp = JSON.parse(JSON.stringify(blueprint));
  compileMedicalPrompt(bp, brief);
  return {
    gemini: bp.diffusion_synthesis?.imagen_prompt || "",
    chatgpt: bp.diffusion_synthesis?.chatgpt_prompt || "",
    compiled: bp,
  };
}

// ─── CASE 1: Pulmonary-Renal Syndrome (DAH + Crescentic GN) ─────────────────
// Elderly man — diffuse alveolar hemorrhage + crescentic glomerulonephritis
// Classic anti-GBM / Goodpasture's / ANCA vasculitis presentation
const CASE1_BRIEF = "elderly man, lungs show diffuse alveolar hemorrhage, kidney biopsy shows crescentic glomerulonephritis";

const case1Blueprint = {
  metadata: {
    title: "Pulmonary-Renal Syndrome — Anti-GBM / ANCA Vasculitis",
    subject: "diffuse alveolar hemorrhage with crescentic glomerulonephritis in pulmonary-renal syndrome",
    journal_standard: "NEJM_SCHOLARLY_v30_FINAL",
  },
  medical_content: {
    mechanism: "Anti-GBM antibody or ANCA-mediated vasculitis causing simultaneous glomerular and alveolar capillary destruction",
    pathophysiology_cascade: [
      "Circulating anti-GBM antibodies or MPO/PR3-ANCA bind alveolar and glomerular basement membranes",
      "Neutrophil and macrophage activation triggers capillary necrosis in both lung and kidney",
      "Fibrin exudation into alveolar spaces (DAH) and Bowman's space (crescent formation)",
      "Parietal epithelial cell and macrophage proliferation form cellular crescents compressing the glomerular tuft",
    ],
    cellular_markers: ["Anti-GBM IgG", "MPO-ANCA", "fibrin", "parietal epithelial cells", "macrophages", "neutrophils"],
    anatomical_zones: [
      { zone_id: "z1", definition: "Alveolar spaces filled with erythrocytes and hemosiderin-laden macrophages", spatial_orientation: "Left panel — lung" },
      { zone_id: "z2", definition: "Alveolar walls with capillary necrosis and fibrin thrombi", spatial_orientation: "Left panel — lung" },
      { zone_id: "z3", definition: "Glomerulus with cellular crescent in Bowman's space", spatial_orientation: "Right panel — kidney" },
      { zone_id: "z4", definition: "Glomerular tuft compressed by crescentic fibrin and epithelial cells", spatial_orientation: "Right panel — kidney" },
    ],
  },
  spatial_layout: {
    panels: [
      { panel_id: "p1", semantic_role: "Lung H&E section — diffuse alveolar hemorrhage", relative_placement: "Left half of frame", visual_anchor: "Blood-filled alveoli" },
      { panel_id: "p2", semantic_role: "Kidney H&E section — crescentic glomerulonephritis", relative_placement: "Right half of frame", visual_anchor: "Crescentic glomerulus" },
    ],
  },
  biological_graph: {
    entities: [
      { id: "ent_1", label: "Blood-filled alveoli", anatomical_placement: "Lung parenchyma", functional_state: "Flooded with erythrocytes", role: "primary", priority: "high", type: "anatomical_structure" },
      { id: "ent_2", label: "Hemosiderin-laden macrophages", anatomical_placement: "Alveolar spaces", functional_state: "Phagocytosing RBCs", role: "primary", priority: "high", type: "anatomical_structure" },
      { id: "ent_3", label: "Cellular crescent", anatomical_placement: "Bowman's space", functional_state: "Compressing glomerular tuft", role: "primary", priority: "high", type: "anatomical_structure" },
      { id: "ent_4", label: "Compressed glomerular tuft", anatomical_placement: "Central glomerulus", functional_state: "Ischemic collapse", role: "primary", priority: "high", type: "anatomical_structure" },
    ],
    interactions: [
      { source: "Anti-GBM antibodies", target: "Alveolar capillaries", relationship: "destroys" },
      { source: "Anti-GBM antibodies", target: "Glomerular basement membrane", relationship: "destroys" },
      { source: "Cellular crescent", target: "Glomerular tuft", relationship: "compresses" },
    ],
  },
  diffusion_synthesis: {
    master_prompt: "Left panel — Lung H&E section: alveolar spaces are densely packed with intact and lysed erythrocytes giving a deep crimson-red appearance. Alveolar walls are intact but capillary necrosis is evident. Hemosiderin-laden macrophages (golden-brown granular cytoplasm) are present within alveoli. Fibrin thrombi appear as pale eosinophilic wisps. Right panel — Kidney H&E section: a glomerulus showing a cellular crescent filling Bowman's space. The crescent is composed of pale, proliferating parietal epithelial cells and macrophages arranged in a layered arc. The glomerular tuft is compressed and shows ischemic collapse — pale pink wrinkled capillary loops. The glomerular basement membrane is fragmented. Normal tubules are visible in the background.",
    spatial_narrative: "Left panel occupies the left half: blood-filled alveoli dominate the field. Right panel occupies the right half: a single representative glomerulus with crescent is centred. A thin white divider separates the two panels. Both panels are at identical light microscopy magnification (H&E, 200x).",
    style_descriptors: [
      "H&E histopathology dual-panel illustration",
      "NEJM case report figure",
      "light microscopy 200x magnification",
      "white background",
      "scholarly histopathology plate",
      "matte clean illustration",
    ],
    color_language: [
      { zone: "alveolar erythrocytes", color_descriptor: "dense crimson-red homogeneous fill" },
      { zone: "hemosiderin-laden macrophages", color_descriptor: "golden-brown granular cytoplasm" },
      { zone: "cellular crescent", color_descriptor: "pale pink-violet layered epithelial cells" },
      { zone: "compressed glomerular tuft", color_descriptor: "eosinophilic wrinkled pink capillary loops" },
      { zone: "alveolar fibrin", color_descriptor: "pale eosinophilic wisps" },
    ],
    pathophysiology_visual_summary: "Both panels depict the same systemic autoimmune attack: anti-GBM or ANCA-driven destruction of basement membranes simultaneously floods alveoli with blood (left) and triggers crescentic obliteration of glomeruli (right), the defining dual-organ signature of pulmonary-renal syndrome.",
    negative_prompt: "no text, no labels, no arrows, no annotations, no dark background, no photorealism, no single-organ view",
    priority_weighting: {
      primary_focus: ["Blood-filled alveoli (lung panel)", "Cellular crescent in Bowman's space (kidney panel)", "Hemosiderin-laden macrophages", "Compressed glomerular tuft"],
      secondary_context: ["Alveolar wall capillary necrosis", "Fragmented glomerular basement membrane", "Normal renal tubules"],
      tertiary_background: ["Clean white divider between panels", "Uniform H&E staining palette"],
    },
  },
};

// ─── CASE 2: SLE — Skin + Kidney + Joint ────────────────────────────────────
// Butterfly rash + lupus nephritis (wire-loop) + synovitis — three-organ SLE
const CASE2_BRIEF = "young woman with SLE — butterfly rash on face, lupus nephritis wire-loop lesion on kidney biopsy, and synovitis of knee joint";

const case2Blueprint = {
  metadata: {
    title: "Systemic Lupus Erythematosus — Triple Organ Involvement",
    subject: "SLE with skin butterfly rash, lupus nephritis wire-loop lesion, and synovitis",
    journal_standard: "NEJM_SCHOLARLY_v30_FINAL",
  },
  medical_content: {
    mechanism: "Type III hypersensitivity — immune complex (dsDNA-anti-dsDNA) deposition activating complement cascade in multiple organ basement membranes",
    pathophysiology_cascade: [
      "dsDNA-anti-dsDNA immune complexes deposit in skin, glomerular mesangium and subendothelial space, and synovium",
      "Complement activation (C3, C4 depletion) triggers neutrophil and macrophage recruitment",
      "Skin: interface dermatitis with basal cell vacuolation; Kidney: wire-loop subendothelial deposits; Joints: synovial hypertrophy",
    ],
    cellular_markers: ["anti-dsDNA IgG", "C3", "C4", "complement", "neutrophils", "plasma cells"],
    anatomical_zones: [
      { zone_id: "z1", definition: "Facial skin — interface dermatitis with malar rash", spatial_orientation: "Left panel" },
      { zone_id: "z2", definition: "Kidney glomerulus — wire-loop subendothelial deposits", spatial_orientation: "Centre panel" },
      { zone_id: "z3", definition: "Knee synovium — villous hypertrophy with plasma cell infiltrate", spatial_orientation: "Right panel" },
    ],
  },
  spatial_layout: {
    panels: [
      { panel_id: "p1", semantic_role: "Skin histology — interface dermatitis", relative_placement: "Left third", visual_anchor: "Basal cell vacuolation" },
      { panel_id: "p2", semantic_role: "Kidney histology — wire-loop glomerulus", relative_placement: "Centre third", visual_anchor: "Wire-loop lesion" },
      { panel_id: "p3", semantic_role: "Synovium histology — lupus synovitis", relative_placement: "Right third", visual_anchor: "Plasma cell infiltrate" },
    ],
  },
  biological_graph: {
    entities: [
      { id: "ent_1", label: "Basal cell vacuolation", anatomical_placement: "Dermo-epidermal junction", functional_state: "Interface dermatitis", role: "primary", priority: "high", type: "anatomical_structure" },
      { id: "ent_2", label: "Wire-loop lesion", anatomical_placement: "Glomerular capillary wall", functional_state: "Subendothelial immune deposits", role: "primary", priority: "high", type: "anatomical_structure" },
      { id: "ent_3", label: "Synovial villous hypertrophy", anatomical_placement: "Knee joint synovium", functional_state: "Plasma cell and lymphocyte infiltrate", role: "primary", priority: "high", type: "anatomical_structure" },
    ],
    interactions: [
      { source: "Immune complexes", target: "Glomerular capillary wall", relationship: "deposits in subendothelial space of" },
      { source: "Immune complexes", target: "Dermo-epidermal junction", relationship: "deposits along" },
      { source: "Complement activation", target: "Synovium", relationship: "recruits neutrophils into" },
    ],
  },
  diffusion_synthesis: {
    master_prompt: "Three-panel H&E histopathology plate. Left panel — skin: epidermal interface dermatitis with basal cell vacuolation along the dermo-epidermal junction; lichenoid lymphocytic infiltrate in the superficial dermis; epidermal keratinocytes show apoptosis. Centre panel — kidney glomerulus: wire-loop lesions visible as thick, homogeneous, pale eosinophilic deposits lining the inner aspect of glomerular capillary walls, creating a rigid glassy appearance; the glomerular tuft is hypercellular. Right panel — synovium: villous synovial hypertrophy with marked plasma cell and lymphocyte infiltration; synoviocyte proliferation; fibrin deposits on the synovial surface.",
    spatial_narrative: "Three equal-width panels separated by thin white dividers. Left panel shows skin layers from epidermis (top) to dermis (bottom). Centre panel shows a single glomerulus with wire-loop capillaries in full view. Right panel shows synovial villi with cellular infiltrate.",
    style_descriptors: [
      "H&E histopathology triptych",
      "NEJM case report figure",
      "light microscopy uniform magnification",
      "white background",
      "scholarly three-panel plate",
    ],
    color_language: [
      { zone: "wire-loop deposits", color_descriptor: "homogeneous pale eosinophilic glassy bands" },
      { zone: "basal cell vacuolation", color_descriptor: "clear vacuoles at DEJ with pink surrounding keratinocytes" },
      { zone: "synovial plasma cells", color_descriptor: "deep violet clock-face nuclei" },
      { zone: "glomerular hypercellularity", color_descriptor: "crowded blue-purple nuclei" },
    ],
    pathophysiology_visual_summary: "Three organs, one mechanism: immune complex deposition driven by anti-dsDNA autoantibodies simultaneously damages skin (interface dermatitis), kidney (wire-loop glomerular deposits), and joints (plasma cell synovitis) — the histological signature of systemic lupus erythematosus.",
    negative_prompt: "no text, no labels, no arrows, no photorealism, no dark background, no single-organ crop",
    priority_weighting: {
      primary_focus: ["Wire-loop lesion (kidney panel)", "Basal cell vacuolation at DEJ (skin panel)", "Synovial plasma cell infiltrate (joint panel)"],
      secondary_context: ["Lichenoid lymphocytic infiltrate", "Glomerular hypercellularity", "Synovial villous hypertrophy"],
      tertiary_background: ["White panel dividers", "Uniform H&E palette"],
    },
  },
};

// ─── CASE 3: ANCA Vasculitis — Lung + Kidney + Skin ─────────────────────────
// Necrotizing granulomatous vasculitis (GPA) — pulmonary cavitating nodule,
// pauci-immune crescentic GN, and leukocytoclastic vasculitis of skin
const CASE3_BRIEF = "patient with GPA (granulomatosis with polyangiitis) — pulmonary cavitating granuloma, pauci-immune crescentic glomerulonephritis, and leukocytoclastic vasculitis of skin";

const case3Blueprint = {
  metadata: {
    title: "GPA — Pulmonary Granuloma + Crescentic GN + Skin Vasculitis",
    subject: "granulomatosis with polyangiitis affecting lung, kidney, and skin simultaneously",
    journal_standard: "NEJM_SCHOLARLY_v30_FINAL",
  },
  medical_content: {
    mechanism: "PR3-ANCA mediated neutrophil degranulation causing necrotizing granulomatous vasculitis in small vessels across multiple organs",
    pathophysiology_cascade: [
      "PR3-ANCA activates primed neutrophils → degranulation → endothelial damage",
      "Lung: palisading necrotizing granuloma with central geographic necrosis and surrounding epithelioid histiocytes",
      "Kidney: pauci-immune focal necrotizing and crescentic GN — no immune complex deposits on IF",
      "Skin: leukocytoclastic vasculitis — fibrinoid necrosis of small dermal vessels with neutrophilic infiltrate and nuclear dust (karyorrhexis)",
    ],
    cellular_markers: ["PR3-ANCA", "neutrophils", "epithelioid histiocytes", "giant cells", "fibrinoid necrosis", "karyorrhexis"],
    anatomical_zones: [
      { zone_id: "z1", definition: "Lung — necrotizing granuloma with central necrosis and palisading histiocytes", spatial_orientation: "Left panel" },
      { zone_id: "z2", definition: "Kidney — focal glomerular necrosis and crescent formation", spatial_orientation: "Centre panel" },
      { zone_id: "z3", definition: "Skin — leukocytoclastic vasculitis with fibrinoid necrosis of dermal vessel", spatial_orientation: "Right panel" },
    ],
  },
  spatial_layout: {
    panels: [
      { panel_id: "p1", semantic_role: "Lung H&E — necrotizing granuloma", relative_placement: "Left third", visual_anchor: "Geographic necrosis zone" },
      { panel_id: "p2", semantic_role: "Kidney H&E — crescentic GN, pauci-immune", relative_placement: "Centre third", visual_anchor: "Cellular crescent" },
      { panel_id: "p3", semantic_role: "Skin H&E — leukocytoclastic vasculitis", relative_placement: "Right third", visual_anchor: "Fibrinoid necrosis of vessel" },
    ],
  },
  biological_graph: {
    entities: [
      { id: "ent_1", label: "Geographic necrosis", anatomical_placement: "Pulmonary granuloma centre", functional_state: "Pink acellular necrosis", role: "primary", priority: "high", type: "anatomical_structure" },
      { id: "ent_2", label: "Palisading epithelioid histiocytes", anatomical_placement: "Granuloma rim", functional_state: "Surrounding necrosis", role: "primary", priority: "high", type: "anatomical_structure" },
      { id: "ent_3", label: "Cellular crescent (pauci-immune)", anatomical_placement: "Bowman's space", functional_state: "No immune deposits", role: "primary", priority: "high", type: "anatomical_structure" },
      { id: "ent_4", label: "Fibrinoid necrosis of dermal vessel", anatomical_placement: "Superficial dermis", functional_state: "Bright pink homogeneous necrosis", role: "primary", priority: "high", type: "anatomical_structure" },
      { id: "ent_5", label: "Nuclear dust (karyorrhexis)", anatomical_placement: "Perivascular dermis", functional_state: "Neutrophilic debris", role: "primary", type: "anatomical_structure" },
    ],
    interactions: [
      { source: "PR3-ANCA", target: "Neutrophils", relationship: "activates causing degranulation in" },
      { source: "Epithelioid histiocytes", target: "Geographic necrosis", relationship: "palisade around" },
      { source: "Fibrinoid necrosis", target: "Dermal vessel wall", relationship: "replaces smooth muscle of" },
    ],
  },
  diffusion_synthesis: {
    master_prompt: "Three-panel H&E histopathology plate showing GPA. Left panel — lung: a necrotizing granuloma with a central zone of pale pink acellular geographic necrosis, sharply demarcated and irregular in outline. Around the necrosis, palisading epithelioid histiocytes form a radial arc. Scattered multinucleated giant cells. Lymphocytic cuff at the periphery. Centre panel — kidney: focal glomerular necrosis with a cellular crescent in Bowman's space (pauci-immune pattern — no immune complex deposits). The uninvolved glomerular capillaries are patent. Right panel — skin: a small dermal vessel showing fibrinoid necrosis of the vessel wall (bright homogeneous pink replacement of the wall), surrounded by neutrophilic infiltrate with nuclear dust (basophilic karyorrhectic debris) — leukocytoclastic vasculitis pattern.",
    spatial_narrative: "Three equal-width panels. Left: granuloma with necrotic centre and palisading rim. Centre: glomerulus with focal necrosis and crescent. Right: dermal vessel cross-section with fibrinoid wall necrosis and neutrophilic cuff.",
    style_descriptors: [
      "H&E histopathology triptych",
      "NEJM case report figure",
      "light microscopy 200x",
      "white background",
      "high-fidelity scholarly plate",
    ],
    color_language: [
      { zone: "geographic necrosis (lung)", color_descriptor: "pale pink acellular homogeneous ghost tissue" },
      { zone: "palisading histiocytes", color_descriptor: "elongated pale nuclei in radial arrangement" },
      { zone: "cellular crescent (kidney)", color_descriptor: "pale pink-violet layered cells in Bowman's space" },
      { zone: "fibrinoid necrosis (skin vessel)", color_descriptor: "bright homogeneous deep eosinophilic pink wall replacement" },
      { zone: "karyorrhexis / nuclear dust", color_descriptor: "fragmented basophilic blue nuclear debris" },
    ],
    pathophysiology_visual_summary: "PR3-ANCA drives simultaneous necrotizing granulomatous inflammation in the lung (geographic necrosis with histiocytic palisade), pauci-immune crescent formation in the kidney (no immune complex signature), and leukocytoclastic vasculitis in the skin — the triad that defines granulomatosis with polyangiitis.",
    negative_prompt: "no text, no labels, no arrows, no annotations, no immunofluorescence overlay, no photorealism",
    priority_weighting: {
      primary_focus: [
        "Geographic necrosis with palisading histiocytes (lung panel)",
        "Cellular crescent pauci-immune pattern (kidney panel)",
        "Fibrinoid vessel wall necrosis with karyorrhexis (skin panel)",
      ],
      secondary_context: ["Multinucleated giant cells", "Normal adjacent glomeruli", "Perivascular neutrophilic cuff"],
      tertiary_background: ["Uniform H&E staining", "White panel separators"],
    },
  },
};

// ─── RUN & PRINT ─────────────────────────────────────────────────────────────

const cases = [
  { label: "CASE 1 — Pulmonary-Renal Syndrome (DAH + Crescentic GN)", brief: CASE1_BRIEF, blueprint: case1Blueprint },
  { label: "CASE 2 — SLE Triple Organ (Skin + Kidney + Joint)", brief: CASE2_BRIEF, blueprint: case2Blueprint },
  { label: "CASE 3 — GPA Triptych (Lung + Kidney + Skin)", brief: CASE3_BRIEF, blueprint: case3Blueprint },
];

for (const { label, brief, blueprint } of cases) {
  console.log("\n" + "═".repeat(90));
  console.log(`  ${label}`);
  console.log("═".repeat(90));
  const { gemini, chatgpt, compiled } = compile(blueprint, brief);

  // Multi-organ detection analysis
  const ds = compiled.diffusion_synthesis;
  const scale = ds.imagen_prompt?.match(/composite|dual.panel|triptych|split.panel/i) ? "COMPOSITE ✓" : "SINGLE ✗";
  const panelCount = (blueprint.spatial_layout?.panels || []).length;

  console.log(`\n  Brief: "${brief}"`);
  console.log(`  Panels declared: ${panelCount} | Scale detected: ${scale}`);

  console.log("\n  ── GEMINI / IMAGEN 4 PROMPT ──────────────────────────────────────────────────");
  console.log(gemini);

  console.log("\n  ── CHATGPT / DALL-E 3 PROMPT ─────────────────────────────────────────────────");
  console.log(chatgpt);

  // Automated checks
  console.log("\n  ── AUTOMATED QUALITY CHECKS ──────────────────────────────────────────────────");

  const checks = [
    { name: "Multi-organ composite detected in gemini prompt", pass: /composite|dual.panel|triptych|split.panel|panel 1|panel 2/i.test(gemini) },
    { name: "Multi-organ composite detected in chatgpt prompt", pass: /composite|dual.panel|triptych|split.panel|panel 1|panel 2/i.test(chatgpt) },
    { name: "Lung/pulmonary finding mentioned", pass: /alveol|lung|pulmonar|bronch|granuloma.*lung|left panel/i.test(gemini) },
    { name: "Kidney/renal finding mentioned", pass: /glomerul|kidney|renal|crescent|nephritis|right panel|centre panel/i.test(gemini) },
    { name: "No single-organ collapse (opening not kidney-only)", pass: !/^A.*kidney/i.test(gemini) },
    { name: "Prose negatives (no bracket style)", pass: /do not include/i.test(gemini) && !/ ^\[negative/im.test(gemini) },
    { name: "Word count 80–500", pass: (() => { const wc = gemini.split(/\s+/).length; return wc >= 80 && wc <= 500; })() },
    { name: "No schema leakage (ent_, panel_ IDs)", pass: !/\bent_\w+|\bpanel_\w+/i.test(gemini) },
    { name: "Color language present", pass: /crimson|eosinophil|pink|violet|ochre|pale|golden|blue|amber/i.test(gemini) },
    { name: "Unifying mechanism named", pass: /anti.gbm|anca|vasculitis|immune complex|complement|pr3|dsdna/i.test(gemini) },
  ];

  let passed = 0;
  for (const c of checks) {
    const icon = c.pass ? "✓" : "✗";
    if (c.pass) passed++;
    console.log(`  ${icon} ${c.name}`);
  }
  console.log(`\n  Score: ${passed}/${checks.length} checks passed`);
}

console.log("\n" + "═".repeat(90));
console.log("  DONE");
console.log("═".repeat(90) + "\n");
