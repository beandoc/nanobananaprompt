// ─── ORGAN DETECTION ────────────────────────────────────────────────────────
//
// Rules:
// 1. Clinical signs (purpura, petechiae, ecchymoses, rash) are SYMPTOMS, not
//    histological organs — they must NOT fire the skin/dermal organ panel.
//    Skin only fires on explicit histological skin structure terms.
// 2. Blood/hematology is a distinct specimen type (peripheral smear, bone marrow)
//    and gets its own panel when schistocytes, blasts, or smear findings appear.
// 3. Brain/CNS fires on microvessel, cerebral, or CNS terms — not on generic
//    "neurological symptoms" which are clinical, not histological.

const detectMultiOrganCase = (subject: string, primaryFocus: string[], brief?: string): string[] => {
  const all = `${subject} ${primaryFocus.join(" ")} ${brief || ""}`.toLowerCase();
  const organs: { label: string; pattern: RegExp }[] = [
    // Hematology — peripheral blood smear / bone marrow: must be detected FIRST
    // so schistocytes, blasts etc. get their own panel, not dumped into kidney/brain
    { label: "hematology/blood smear", pattern: /\b(schistocyte|schistocyt|peripheral.blood.smear|blood.smear|hemolytic.anemia|microangiopathic|blast|red.cell.fragment|helmet.cell|bone.marrow|erythrocyte.fragment|rouleaux|anisocytosis|poikilocytosis)\b/ },
    { label: "lung/pulmonary",          pattern: /\b(lung|pulmonar|alveol|bronch|pleura|pneumo|hemoptysis|alveolar.hemorrhage|diffuse.alveolar)\b/ },
    { label: "kidney/renal",            pattern: /\b(kidney|renal|glomerul|nephron|tubul|crescent|glomerulonephritis|nephrotic|nephritic|arteriole.*renal|renal.*arteriole)\b/ },
    { label: "heart/cardiac",           pattern: /\b(heart|cardiac|coronar|myocard|pericardi|endocardi|ventricle|atrium|aorta)\b/ },
    { label: "liver/hepatic",           pattern: /\b(liver|hepat|cirrhosis|fibrosis.*liver|portal.hypertension)\b/ },
    // Skin fires ONLY on histological skin structures or skin explicitly — NOT clinical signs like purpura/petechiae
    { label: "skin/dermal",             pattern: /\b(epiderm|dermis|dermo|keratinocyte|melanocyte|skin|squamous.*skin|basal.cell|skin.biopsy)\b/ },
    { label: "brain/neurological",      pattern: /\b(brain|cerebr|cerebral.microvessel|cerebral.arteriole|encephalit|meningi|spinal|cortical.microvessel|cns.microvessel)\b/ },
    { label: "joint/synovial",          pattern: /\b(joint|synovi|cartilage|arthritis|articular)\b/ },
  ];
  const detected = organs.filter(o => o.pattern.test(all)).map(o => o.label);

  // Check for clinical symptoms/actions in the brief
  const b = (brief || "").toLowerCase();
  const hasClinicalSymptom = /\b(coughing|cough|hemoptysis|hurting|pain|ache|rash|purpura|petechiae|swelling|shortness.of.breath|dyspnea|fatigue|fever|bleeding.*nose|clinical.presentation|symptom)\b/i.test(b);

  if (hasClinicalSymptom && detected.length > 0) {
    detected.unshift("clinical");
  }
  return detected;
};

// ─── SCALE INFERENCE ────────────────────────────────────────────────────────
const inferScale = (subject: string, primaryFocus: string[], brief?: string): string => {
  const all = `${subject} ${primaryFocus.join(" ")} ${brief || ""}`.toLowerCase();
  const organs = detectMultiOrganCase(subject, primaryFocus, brief);
  if (organs.length >= 2) {
    if (organs.includes("clinical")) {
      return `composite-${organs.length} clinical-and-microscopic-scale`;
    }
    return `composite-${organs.length} light microscopy-scale`;
  }

  // Surgical field takes precedence over gross anatomy if surgical keywords are present
  if (/surgical|laparoscop|endoscop|operative|cholecystectom|appendectom|trocar|retract|cauteriz|debride|anastomosis|suture|clamp|staple|\bdissection\b|\bresection\b|\bincision\b|\bexcision\b/.test(all))
    return "surgical field-scale";

  // Explicit histology overrides take precedence over gross anatomy for purely microscopic findings
  if (/histolog|microscop|h&e|stain|biopsy|neutrophil.infiltrat|coagulative.necrosis/.test(all))
    return "light microscopy-scale";

  // Gross anatomy takes ABSOLUTE PRIORITY — vascular cross-sections are gross pathology,
  // not histology, even when macrophages/foam cells are mentioned in mechanism text.
  if (/coronary.*cross|cross.section.*coronary|atheroscler|fibrous.cap|necrotic.lipid|lipid.core|plaque.rupture|vulnerable.plaque|carotid|aortic.dissect|aneurysm|\binfarct\b|infarction|stemi|nstemi|gross.path|4.chamber|cross.section.*heart|heart.*cross.section|ventricle|aorta|myocardium|kidney|lung|liver|brain|organ.*cross|cortex|medulla|lobe|pancreas|spleen|colon|bowel|intestine|gallbladder|trachea|bronchus|pleura|peritoneum|mesentery|diaphragm|femur|spine/.test(all))
    return "gross anatomy-scale";

  // Light microscopy pathology terms take PRIORITY over EM cellular terms.
  // Wire-loop, crescent, glomerulonephritis, endocapillary — these are H&E findings
  // even when the LLM expansion mentions podocytes or foot processes.
  // Note: foam.cell excluded — foam cells appear in atherosclerosis (gross anatomy), handled above.
  if (/wire.loop|wire loop|endocapillary|crescent|glomerulonephritis|nephritis|mesangiolysis|mesangial.expand|tubular.atrophy|interstitial.fibros|h&e|histopath|histolog|stain|biopsy/.test(all))
    return "light microscopy-scale";

  if (/foot.process|podocyte|endosome|receptor|gpcr|membrane.channel|ribosome|mitochondri|vesicle|lysosome|nucleus|chromatin|exosome|pore.complex|actin|cytoskeleton|tight.junction|desmoso|integrin|caveola|clathrin|golgi/.test(all))
    return "electron microscopy-scale";
  if (/surgical|laparoscop|endoscop|operative|cholecystectom|appendectom|trocar|retract|cauteriz|debride|anastomosis|suture|clamp|staple|\bdissection\b|\bresection\b|\bincision\b|\bexcision\b/.test(all))
    return "surgical field-scale";
  if (/\binfarct\b|infarction|stemi|nstemi|gross.path|4.chamber|cross.section.*heart|heart.*cross.section|ventricle|aorta|myocardium|kidney|lung|liver|brain|organ.*cross|cortex|medulla|lobe|pancreas|spleen|colon|bowel|intestine|gallbladder|trachea|bronchus|pleura|peritoneum|mesentery|diaphragm|femur|spine|coronary.*cross|cross.section.*coronary|atheroscler|fibrous.cap|necrotic.lipid|lipid.core|plaque.rupture|vulnerable.plaque|carotid|aortic.dissect|aneurysm/.test(all))
    return "gross anatomy-scale";
  if (/glomerul|nephron|alveol|synapse|capillar|tubule|histolog|h&e|histopath|stain|biopsy|\bsection\b|acinus|islet|follicle|villus|crypt|arteriole|venule|lymphocyte|neutrophil|macrophage|fibroblast|hepatocyte|cardiomyocyte|neuron|axon|myelin/.test(all))
    return "light microscopy-scale";
  if (/pathway|signaling|cascade|protein|kinase|phosphorylat|mutation|gene|dna|rna|transcription|translation|apoptosis|necrosis|autophagy|ubiquitin|proteasome|cytokine|interleukin|chemokine|toll.like|complement|antibody|antigen|mhc|tcr/.test(all))
    return "molecular biology-scale";
  return "medical illustration-scale";
};

// ─── MECHANISTIC CAUSALITY ──────────────────────────────────────────────────
const extractMechanisticCausality = (adData: any): string => {
  const mc = adData.medical_content || {};
  const pathoObj = mc.pathophysiology || {};
  const pathoDesc = pathoObj.description || "";
  const pathoCascade: any[] = pathoObj.cascade || mc.pathophysiology_cascade || [];
  const cellularMarkers: string[] = mc.cellular_markers || mc.molecular_markers || [];
  const mechanism: string = mc.mechanism || mc.primary_mechanism || "";

  const parts: string[] = [];
  if (pathoDesc) parts.push(`Pathophysiology: ${pathoDesc}`);
  if (mechanism && !pathoDesc) parts.push(`The pathophysiological mechanism is ${mechanism.toLowerCase()}`);
  
  if (pathoCascade.length > 0) {
    const cascadeStrings = pathoCascade.map(c => {
      if (typeof c === "string") return c;
      return [c.event, c.mechanism, c.consequence].filter(Boolean).join(" ");
    });
    const cascade = cascadeStrings.slice(0, 3).join(", leading to ");
    parts.push(`Causal sequence: ${cascade}`);
  }
  if (cellularMarkers.length > 0) {
    parts.push(`Key molecular markers include ${cellularMarkers.slice(0, 4).join(", ")}`);
  }
  return parts.length > 0 ? parts.join(". ") + "." : "";
};

// ─── BIOLOGICAL ENTITY EXTRACTION ──────────────────────────────────────────
const extractBiologicalEntities = (adData: any): { primaryEntities: string[]; interactions: string[] } => {
  const bg = adData.biological_graph || {};
  const entities: any[] = bg.entities || bg.nodes || [];
  const interactions: any[] = bg.interactions || bg.edges || [];

  const primaryEntities = entities
    .filter((e: any) => e.role === "primary" || e.priority === "high" || e.type === "anatomical_structure")
    .map((e: any) => e.name || e.label || e.id)
    .filter(Boolean)
    .slice(0, 5);

  const interactionLabels = interactions
    .map((i: any) => {
      const src = i.source || i.from || "";
      const tgt = i.target || i.to || "";
      const rel = i.relationship || i.type || i.label || "interacts with";
      if (!src || !tgt) return "";
      const relLower = rel.toLowerCase();
      const tgtLower = tgt.toLowerCase();
      const targetAlreadyInRel = tgtLower.split(" ").some((w: string) => w.length > 4 && relLower.includes(w));
      if (targetAlreadyInRel) return `${src} ${rel}`;
      const prepMatch = rel.match(/^(\w+)\s+(to|into|through|from|toward|onto|across)\s+(.+)$/i);
      if (prepMatch) return `${src} ${prepMatch[1]} ${tgt} ${prepMatch[2]} ${prepMatch[3]}`;
      const endsWithNoun = /\b(necrosis|fibrosis|expansion|compression|hypertrophy|atrophy|inflammation|damage|injury|activation|suppression|dysfunction)\s*$/i.test(rel);
      if (endsWithNoun) return `${src} ${rel} in ${tgt}`;
      return `${src} ${rel} ${tgt}`;
    })
    .filter(Boolean)
    .slice(0, 3);

  return { primaryEntities, interactions: interactionLabels };
};

// ─── UNIFYING MECHANISM RESOLVER ────────────────────────────────────────────
//
// Extracts the disease-specific unifying mechanism from the JSON output.
// Falls back gracefully — NEVER uses the old generic "immune-mediated systemic vasculitis"
// which is medically wrong for most systemic diseases (TTP, Goodpasture, SLE, ANCA, etc.)

const resolveUnifyingMechanism = (adData: any, brief?: string): string => {
  const mc = adData?.medical_content || {};

  // Priority 1: explicit mechanism field from JSON
  if (mc.mechanism && mc.mechanism.length > 10) return mc.mechanism;
  if (mc.primary_mechanism && mc.primary_mechanism.length > 10) return mc.primary_mechanism;

  // Priority 2: first step of pathophysiology cascade
  const cascade: any[] = mc.pathophysiology?.cascade || mc.pathophysiology_cascade || [];
  if (cascade.length > 0) {
    const first = cascade[0];
    if (typeof first === "string" && first.length > 10) return first;
    if (first?.mechanism && first.mechanism.length > 10) return first.mechanism;
    if (first?.event && first.event.length > 10) return first.event;
  }

  // Priority 3: disease-specific keyword inference from brief — avoids wrong generic fallback
  const b = (brief || "").toLowerCase();
  if (/adamts13|ttp|thrombotic.thrombocytopenic/.test(b))
    return "ADAMTS13 deficiency leading to uncleaved ultra-large vWF multimers, spontaneous platelet aggregation, and thrombotic microangiopathy";
  if (/anti.gbm|goodpasture/.test(b))
    return "anti-glomerular basement membrane antibody deposition targeting type IV collagen in alveolar and glomerular basement membranes";
  if (/anca|anti.neutrophil/.test(b))
    return "ANCA-mediated neutrophil activation causing pauci-immune necrotizing vasculitis of small vessels";
  if (/sle|lupus/.test(b))
    return "immune complex deposition activating complement, causing multi-organ endothelial injury";
  if (/hus|hemolytic.uremic/.test(b))
    return "Shiga toxin-mediated endothelial injury causing thrombotic microangiopathy predominantly in renal microvasculature";
  if (/ige|anaphyla|mast.cell/.test(b))
    return "IgE-mediated mast cell degranulation releasing histamine, tryptase, and leukotrienes";
  if (/atheroscler|plaque|coronar|stemi|lad.occlusion/.test(b))
    return "plaque rupture with superimposed thrombus causing acute coronary occlusion and downstream ischemic necrosis";

  // Last resort: generic but accurate for most inflammatory cases
  return "systemic inflammatory cascade causing multi-organ microvascular injury";
};

// ─── PANEL ITEM ROUTER ───────────────────────────────────────────────────────
//
// Routes primary_focus items to their correct organ panel.
// Each organ has explicit keyword patterns so items are never misassigned.

const routeItemToOrgan = (item: string, organKey: string): boolean => {
  const t = item.toLowerCase();
  switch (organKey) {
    case "clinical":
      return /coughing|cough|hemoptysis|hurting|pain|ache|rash|purpura|petechiae|swelling|shortness|dyspnea|fatigue|fever|patient/.test(t);
    case "hematology":
      // "platelet" alone is too broad — matches "platelet-rich thrombus in cerebral microvessel".
      // Require hematology-specimen context: smear, thrombocytopenia, or morphology terms.
      return /schistocyte|blood.smear|peripheral.smear|hemolytic|anemia|red.cell.fragment|helmet.cell|elliptocyte|spherocyte|blasts|thrombocytopenia|bone.marrow/.test(t)
        || (/platelet/.test(t) && /smear|thrombocytopenia|count|peripheral/.test(t));
    case "lung":
      return /lung|pulmonar|alveol|hemorrhage|dah|bronch|pneum|hemoptysis|capillar.*lung|alveolar.capillar/.test(t);
    case "kidney":
      // "renal cortical" must be detected before brain's "cortical" fires.
      return /kidney|renal|glomerul|crescent|nephron|gbm|tubul|bowman|renal.*arteriole|arteriole.*renal|podocyte|mesangi/.test(t);
    case "brain":
      // "cortical" alone is too broad — "renal cortical arteriole" would match.
      // Require brain-specific qualifiers.
      return /brain|cerebr|cerebral.microvessel|cerebral.arteriole|cortical.microvessel|cortical.neuron|cns|encephal|meningi|neural/.test(t)
        || (/\bcortical\b/.test(t) && !/renal/.test(t));
    case "heart":
      return /heart|cardiac|myocard|coronar|ventricle|atrium|endocard|epicard|pericard/.test(t);
    case "liver":
      return /liver|hepat|hepatocyte|sinusoid|portal|lobul/.test(t);
    case "skin":
      return /epiderm|dermis|keratinocyte|melanocyte|basal.cell|squamous/.test(t);
    case "joint":
      return /joint|synovi|cartilage|articular|pannus/.test(t);
    default:
      return false;
  }
};

// ─── H&E COLOR PALETTE ──────────────────────────────────────────────────────
//
// Validated H&E-accurate color descriptors per structure type.
// Used to override or supplement LLM-generated color_language when
// the LLM produces non-histological colors (blue-grey, flesh tone, etc.)

const HE_COLOR_CORRECTIONS: Record<string, string> = {
  // Thrombi
  "platelet.rich.microthrombus|platelet.thrombus|white.thrombus": "granular pale eosinophilic pink, filling the arteriolar lumen in cross-section, with visible platelet clumping",
  "hyaline.thrombus|hyaline.microthrombus": "glassy homogeneous deeply eosinophilic pink, occluding the microvessel lumen without fibrin strands",
  "fibrin.thrombus|red.thrombus": "pale eosinophilic fibrin mesh with entrapped erythrocytes appearing deep red",

  // Erythrocytes and smear findings
  "schistocyte|red.cell.fragment|helmet.cell": "hyperchromatic fragmented erythrocytes — helmet-shaped or triangular, deep red-orange against a pale pink background",
  "erythrocyte|red.blood.cell": "biconcave disc, uniform deep eosinophilic red-orange",

  // Necrosis types
  "coagulative.necrosis": "pale homogeneous eosinophilic ghost outlines of myocytes, nuclear pyknosis and karyolysis, loss of cross-striations",
  "contraction.band.necrosis": "hypereosinophilic transverse bands across myocyte cytoplasm, deep pink, irregular band spacing",
  "liquefactive.necrosis": "pale amorphous eosinophilic debris with nuclear shadows",
  "caseous.necrosis": "structureless pale pink granular material with dystrophic calcification foci",

  // Glomerular structures
  "crescent|cellular.crescent": "dense pale pink proliferating parietal epithelial cells and macrophages filling Bowman's space, compressing the glomerular tuft",
  "glomerular.tuft": "compact capillary loops with mesangial expansion, deep eosinophilic basement membranes",
  "bowman.space": "clear crescentic space between Bowman's capsule parietal layer and glomerular tuft",
  "fibrin.strands": "delicate pale yellow interwoven filaments within the crescent",

  // Alveolar structures
  "blood.filled.alveoli|alveolar.hemorrhage": "dark red-brown erythrocytes filling alveolar airspaces, obscuring the delicate alveolar septae",
  "hemosiderin.laden.macrophage": "golden-brown coarse granular cytoplasmic deposits within macrophages, best seen on Prussian blue stain appearing deep blue",
  "alveolar.septa": "thin pale pink fibrous walls with minimal cellularity in normal zones",

  // Glomerulonephritis — immune complex deposits
  "wire.loop|wire loop|subendothelial.deposit|immune.complex.deposit": "thick rigid deeply eosinophilic pale pink-white bands, almost refractile, expanding the capillary wall to 3-4x normal thickness",
  "endocapillary.proliferat|endocapillary.cell": "pale eosinophilic cytoplasm with oval vesicular nuclei packed within obliterated capillary loops",
  "mesangial.matrix|mesangial.expansion": "pale eosinophilic cream matrix expanded between capillary loops, with enlarged oval mesangial cell nuclei",

  // Vascular
  "cerebral.microvessel|cortical.microvessel": "thin-walled endothelium-lined channels, pale pink walls, red cell content",
  "renal.arteriole|cortical.arteriole": "thick muscular wall with pale eosinophilic smooth muscle, round lumen",
};

// Returns a corrected color description if the zone matches a known H&E pattern
const getHeColor = (zone: string): string | null => {
  const z = zone.toLowerCase();
  for (const [pattern, color] of Object.entries(HE_COLOR_CORRECTIONS)) {
    if (new RegExp(pattern).test(z)) return color;
  }
  return null;
};

// Validates and corrects color_language entries — replaces non-H&E colors
const sanitizeColorLanguage = (colorLang: any[]): any[] => {
  if (!Array.isArray(colorLang)) return [];
  return colorLang.map((c: any) => {
    const zone = c.zone || "";
    const desc = c.color_descriptor || "";
    // Flag non-H&E colors. Lavender/violet are immunofluorescence colors, not H&E.
    // Blue-grey, flesh tone, yellow-green, purple-red also invalid for H&E plates.
    const isNonHE = /blue.grey|flesh.tone|yellow.green|purple.red|mottled.purple|ischemic.blue|\blavender\b|pale.lavender|rosy.lavender|violet.pink|lilac/.test(desc.toLowerCase());
    if (isNonHE) {
      const corrected = getHeColor(zone);
      if (corrected) return { ...c, color_descriptor: corrected };
    }
    return c;
  });
};

// ─── HISTOLOGY INSET RENDERER ───────────────────────────────────────────────
//
// When a case has both gross anatomy and histology findings (e.g. STEMI with
// gross cardiac cross-section + histology inset), generates an explicit
// rendering contract for the inset so Gemini/ChatGPT knows exactly what to render.

const buildHistologyInsetBlock = (brief?: string): string => {
  if (!brief) return "";
  const b = brief.toLowerCase();
  const hasHistoInset = /histolog|h&e|inset|biopsy|microscop|contraction.band|wavy.fiber|schistocyte|cellular.crescent|foam.cell/.test(b);
  const hasGross = /gross|cross.section|infarct|ventricle|organ|4.chamber|stemi|nstemi/.test(b);
  if (!hasHistoInset || !hasGross) return "";

  return " A rectangular H&E histology inset occupies the lower-right quadrant of the frame, bordered by a thin white frame, rendered at 40x magnification on a pale pink eosinophilic background.";
};

// ─── TEMPORAL PATHOLOGY CORRECTOR ───────────────────────────────────────────
//
// Corrects medically inaccurate timing claims in the generated text.
// E.g. neutrophil infiltration at 6h post-STEMI is wrong — it peaks at 24-72h.
// This runs on the compiled prompt text before output.

const applyTemporalCorrections = (text: string, brief?: string): string => {
  if (!brief) return text;
  const b = brief.toLowerCase();

  // 6-hour STEMI: neutrophil infiltration is wrong — correct to margination
  if (/6.hour|6h\b|6hrs/.test(b) && /stemi|infarct|myocard/.test(b)) {
    text = text
      .replace(/frank neutrophil infiltration/gi, "early neutrophil margination at the hyperemic border zone")
      .replace(/neutrophil infiltration/gi, "early neutrophil margination at the ischemic border zone")
      .replace(/neutrophils infiltrat/gi, "neutrophils beginning to marginate at the ischemic periphery");
  }

  return text;
};

// ─── SURGICAL CONTEXT ENRICHER ──────────────────────────────────────────────
//
// Enriches surgical/laparoscopic prompts to enforce anatomical boundaries,
// correct instrument representations, and add critical landmarks like lymph nodes.
const enrichSurgicalContext = (text: string, brief?: string): string => {
  if (!brief) return text;
  const b = brief.toLowerCase();
  
  let enriched = text;

  // 1. Instrument correction (clip applier vs scissors/dissectors)
  if (/\b(clamp|clip|clip.applier)\b/i.test(b)) {
    // Standard placeholder technique to prevent double-replacement, consuming any existing "metallic" or "surgical" prefixes to avoid duplicate tokens
    enriched = enriched.replace(/\b(metallic\s+)?(surgical\s+)?clamp\b/gi, "___SURGICAL_CLAMP___");
    enriched = enriched.replace(/\b(metallic\s+)?(surgical\s+)?clip\b/gi, "___SURGICAL_CLIP___");
    
    enriched = enriched.replace(/___SURGICAL_CLAMP___/g, "metallic clip applier jaws clamping the cystic artery (with blunt parallel jaws, no scissors or cutting blades visible)");
    enriched = enriched.replace(/___SURGICAL_CLIP___/g, "metallic titanium clip");
  }

  // 2. Calot's triangle demarcation & Cystic lymph node
  if (/calot|cholecystectom/i.test(b)) {
    // Inject Calot's triangle demarcation and the cystic lymph node (Lund's node)
    if (!enriched.toLowerCase().includes("lymph node")) {
      const supportPattern = /(supporting anatomical context:|supporting anatomy includes)/i;
      if (supportPattern.test(enriched)) {
        enriched = enriched.replace(
          supportPattern,
          "$1 the small oval pale-yellow cystic lymph node (lymph node of Lund) situated in the hepatocystic angle, "
        );
      } else {
        enriched += " Supporting anatomical context includes the small oval pale-yellow cystic lymph node (lymph node of Lund) situated in the hepatocystic angle.";
      }
    }
    
    // Ensure the lymph node is in the color protocol/palette so the image model draws it
    if (!enriched.toLowerCase().includes("lymph node in") && !enriched.toLowerCase().includes("lymph node: ")) {
      const colorPattern = /(color palette:|color protocol:|color treatment: use|color treatment:)/i;
      if (colorPattern.test(enriched)) {
        enriched = enriched.replace(
          colorPattern,
          "$1 cystic lymph node in pale yellow, small oval structure; "
        );
      }
    }

    // Demarcate boundaries clearly
    const demarcation = " Calot's triangle is clearly demarcated, defined medially by the common hepatic duct, laterally by the cystic duct, and superiorly by the liver edge, with all boundaries sharply outlined.";
    if (!enriched.toLowerCase().includes("demarcated") && !enriched.toLowerCase().includes("demarcation")) {
      enriched += demarcation;
    }
  }

  return enriched;
};

// ─── NEGATIVE PROMPT BUILDER ─────────────────────────────────────────────────
//
// Produces a single, clean, non-redundant negative directive.
// Fixes the "Do not include: Do not show..." double-negative formatter bug.

const buildNegativeDirective = (ds: any, isGemini: boolean, scale: string = "", brief: string = "", subject: string = ""): string => {
  // Strip the raw negative_prompt of its own prefix words
  const raw = (ds.negative_prompt || "")
    .replace(/^(negative constraints?:?\s*|avoid:?\s*|do not include:?\s*|do not show:?\s*)/i, "")
    .trim();

  // ── ChatGPT / DALL-E 3 ──────────────────────────────────────────────────
  if (!isGemini) {
    return " Pure visual anatomy — no text, no labels, no annotations, photographed as a clean scientific plate on a plain background.";
  }

  // ── Gemini / Imagen 4 ───────────────────────────────────────────────────
  const isClinical = scale.includes("clinical");
  const isEM = scale.includes("electron");
  const isCardiac = /heart|cardiac|myocard|coronar|ventricle|atrium/.test(`${brief} ${subject}`.toLowerCase());
  
  let baseExclusions = "cartoonish or unrealistic colors, blurry or low-resolution rendering, abstract non-medical imagery, 3D photorealistic rendering, human face or portrait, tissue texture as background, red or pink background fill, myocardial muscle fibers as background, any background other than solid white";
  
  if (isClinical) {
    baseExclusions = baseExclusions.replace(", human face or portrait", "");
  }
  if (isEM) {
    baseExclusions = baseExclusions.replace(", any background other than solid white", ", any background other than solid black");
  }
  if (isCardiac) {
    baseExclusions = baseExclusions.replace(", myocardial muscle fibers as background", "");
  }
  
  const textExclusion = "any text characters, written labels, numeric markers, arrows, annotations, or diagram callouts anywhere in the image";

  // Always include baseExclusions — raw from LLM adds extra specifics, never replaces the base.
  const combined = raw
    ? `${textExclusion}, ${baseExclusions}, ${raw}`
    : `${textExclusion}, ${baseExclusions}`;

  return ` Do not include: ${combined}.`;
};

// ─── RENDER STYLE RESOLVER ───────────────────────────────────────────────────
//
// Dispatches opening sentence and reinforcement style based on:
// (1) user's selected style (userStyle — highest priority)
// (2) LLM-generated style_descriptors (styleTokens)
// (3) scale (composite, surgical, gross, light microscopy, etc.)
//
// The composite branch now correctly respects userStyle (NEJM vs BioRender)
// instead of hardcoding NEJM for all multi-organ cases.

const resolveRenderStyle = (styleTokens: string[], scale: string, userStyle?: string): { opening: string; reinforcement: string } => {
  const joined = (styleTokens.join(" ") + " " + (userStyle || "")).toLowerCase();

  const isBiorender = joined.includes("biorender") || joined.includes("plasticine") || joined.includes("2.5d");
  const isNejm     = joined.includes("nejm") || joined.includes("scholarly") || joined.includes("netter");
  const isNature   = joined.includes("nature") || joined.includes("structural");

  // ── Composite multi-organ ────────────────────────────────────────────────
  if (scale.includes("composite")) {
    const panelCountMatch = scale.match(/composite-(\d+)/);
    const n = panelCountMatch ? parseInt(panelCountMatch[1]) : 2;
    const panelWord = n === 2 ? "dual-panel" : n === 3 ? "triptych three-panel" : `${n}-panel`;
    const panelDivider = n === 2
      ? "left panel and right panel clearly separated by a thin white divider"
      : `${n} equal-width panels separated by thin white dividers`;

    if (scale.includes("clinical-and-microscopic")) {
      const clinicalDesc = "a clinical scene depicting a South Asian (Indian) patient experiencing the symptoms (with realistic, textbook clinical presentation, no text overlays)";
      const microDesc = isBiorender
        ? "BioRender 2.5D matte plasticine histopathology view"
        : "NEJM watercolor-and-ink histopathology view";
      
      return {
        opening: `A ${panelWord} multi-scale illustration showing both the clinical presentation and the microscopic pathology`,
        reinforcement: `comprising ${panelDivider}, where Panel 1 depicts ${clinicalDesc}, and the subsequent panels depict the corresponding histopathology under H&E staining (${microDesc}), solid white background, no text or annotations`,
      };
    }

    if (isBiorender) {
      return {
        opening: `A ${panelWord} BioRender-standard scientific illustration depicting systemic disease across ${n} organs`,
        reinforcement: `rendered with clean 2.5D vector assets and matte plastic textures, ${panelDivider}, each panel depicting the corresponding organ's histopathology, soft ambient clinical lighting, pastel anatomical color palette, white background, no labels or text`,
      };
    }
    // NEJM is the default for composite (histopathology plate)
    return {
      opening: `A ${panelWord} histopathology illustration depicting systemic disease across ${n} organs`,
      reinforcement: `in the style of a NEJM case report figure, H&E staining palette, ${panelDivider}, each panel labeled by organ, crisp tissue section detail, white background, no annotations`,
    };
  }

  // ── Electron microscopy ──────────────────────────────────────────────────
  if (scale.includes("electron")) {
    return {
      opening: "A high-resolution transmission electron microscopy (TEM) scientific illustration",
      reinforcement: "rendered in the style of a Nature Cell Biology figure plate, dark-field black background, precise ultrastructural detail, muted scientific color palette, zero text or labels",
    };
  }

  // ── Light microscopy / histology ─────────────────────────────────────────
  if (scale.includes("light microscopy")) {
    if (isBiorender) {
      return {
        opening: "A BioRender-standard histopathology illustration",
        reinforcement: "clean 2.5D vector rendering, H&E staining color palette, crisp tissue section detail, white background, soft clinical lighting, no annotations",
      };
    }
    return {
      opening: "A photorealistic light microscopy histological illustration",
      reinforcement: "in the style of a NEJM case report figure, H&E or immunofluorescence staining palette, crisp tissue section detail, white background, no annotations",
    };
  }

  // ── Surgical field ───────────────────────────────────────────────────────
  if (scale.includes("surgical")) {
    if (isBiorender) {
      return {
        opening: "A BioRender-style laparoscopic surgical illustration",
        reinforcement: "rendered with clean 2.5D vector assets and flat-lit matte plasticine textures, depicting the operative view inside a circular laparoscopic port-view frame, clinical gross pathology colors, isolated against a solid plain white background, no text or annotations",
      };
    }
    if (isNejm) {
      return {
        opening: "A NEJM-style surgical anatomy illustration",
        reinforcement: "in the style of a Netter surgical anatomy plate, watercolor-and-ink rendering, diagrammatic photorealism, tissue planes clearly differentiated by color and reflectivity, clean white background, no text annotations",
      };
    }
    if (isNature) {
      return {
        opening: "A Nature journal high-impact surgical illustration",
        reinforcement: "photorealistic 3D laparoscopic view with high-contrast volumetric lighting, crisp tissue boundaries, circular endoscope frame, clean background, no labels",
      };
    }
    return {
      opening: "A 4K surgical field illustration under cold LED operative lighting",
      reinforcement: "in the style of a Netter surgical anatomy plate, diagrammatic photorealism, tissue planes clearly differentiated by color and reflectivity, sterile field background, no text overlays",
    };
  }

  // ── Molecular / pathway ──────────────────────────────────────────────────
  if (scale.includes("molecular")) {
    return {
      opening: "A clean scientific pathway diagram illustration",
      reinforcement: "in the style of a Cell or Nature Reviews mechanistic figure, flat 2D vector style, white background, color-coded molecular components, no text labels",
    };
  }

  // ── Gross anatomy / default ──────────────────────────────────────────────
  if (isBiorender) {
    return {
      opening: "A BioRender-style gross anatomy medical illustration",
      reinforcement: "matte plastic 2.5D rendering, soft ambient clinical lighting, gross pathology color palette (not H&E), solid plain white background with NO surrounding tissue texture, the specimen floats isolated against white, isometric anatomical view, no labels or text",
    };
  }
  if (isNejm) {
    return {
      opening: "A NEJM-standard anatomical illustration",
      reinforcement: "Netter-style watercolor-and-ink rendering, muted clinical palette, fine stipple shading, white background, scholarly medical plate aesthetic, no text annotations",
    };
  }
  if (isNature) {
    return {
      opening: "A Nature journal high-impact scientific illustration",
      reinforcement: "photorealistic 3D render with ambient occlusion, vibrant scientifically accurate colors, high contrast, white background, no labels",
    };
  }
  return {
    opening: "A high-fidelity medical scientific illustration",
    reinforcement: "clean matte 3D render, white background, anatomically accurate, scholarly journal plate quality, no text or labels",
  };
};

// ─── ASPECT RATIO ────────────────────────────────────────────────────────────
//
// Aspect ratio is determined by TRUE panel count (from organs array),
// NOT from spatial_layout.panels (which may be wrong) and NOT from
// false-positive organ counts (purpura triggering skin panel).

const inferAspectRatio = (scale: string, trueOrganCount: number): string => {
  if (scale.includes("composite")) {
    return trueOrganCount >= 3
      ? "wide landscape format (16:9 aspect ratio)"
      : "landscape format (4:3 aspect ratio)";
  }
  if (scale.includes("surgical")) return "wide landscape format (16:9 aspect ratio)";
  if (scale.includes("gross anatomy")) return "landscape format (4:3 aspect ratio)";
  if (scale.includes("electron") || scale.includes("light microscopy")) return "square format (1:1 aspect ratio)";
  return "landscape format (4:3 aspect ratio)";
};

// ─── DEDUPLICATION ───────────────────────────────────────────────────────────
const deduplicateMasterAndSpatial = (master: string, spatial: string): string => {
  if (!spatial || !master) return master;
  const spatialWords = spatial.toLowerCase().split(/\s+/).slice(0, 12);
  const sentences = master.split(/(?<=[.!?])\s+/);
  const filtered = sentences.filter(sentence => {
    const sWords = sentence.toLowerCase().split(/\s+/).slice(0, 8);
    const overlap = sWords.filter(w => w.length > 5 && spatialWords.includes(w)).length;
    return overlap < 3;
  });
  return filtered.join(" ").trim();
};

// ─── MULTI-ORGAN PANEL BLOCK ─────────────────────────────────────────────────
//
// Builds the panel composition description injected immediately after the
// opening sentence in both Gemini and ChatGPT prompts.
//
// Fixes:
// - Organ routing: each primary_focus item is routed to the correct organ panel
//   using routeItemToOrgan(), not heuristic substring matching
// - Unifying mechanism: uses resolveUnifyingMechanism(), never the generic fallback
// - Color language: sanitized for H&E accuracy before inclusion
// - Hematology panel: gets its own explicit rendering instruction (smear, not tissue section)

const buildMultiOrganPanelComposition = (
  organs: string[],
  primary: string,
  ds: any,
  adData: any,
  brief?: string
): { panelBlock: string; panelColors: string } => {
  const unifyingMechanism = resolveUnifyingMechanism(adData, brief);
  const primaryItems: string[] = ds.priority_weighting?.primary_focus || [];

  const panels = organs.map((organ, i) => {
    const organKey = organ.split("/")[0]; // "hematology", "lung", "kidney", "brain", etc.

    // Route items to this organ using the explicit router
    const organItems = primaryItems.filter(item => routeItemToOrgan(item, organKey));

    // Fallback: distribute unrouted items evenly
    const unroutedItems = primaryItems.filter(item =>
      !organs.some(o => routeItemToOrgan(item, o.split("/")[0]))
    );
    const fallbackItems = unroutedItems.filter((_, idx) => idx % organs.length === i);

    const panelItems = organItems.length > 0 ? organItems : fallbackItems;
    const panelLabel = organ.replace("/", " or ");
    const panelDesc = panelItems.length > 0
      ? panelItems.join(", ")
      : organKey === "clinical"
      ? "macroscopic clinical presentation of patient symptoms"
      : `${organ} histopathology`;

    // Clinical and Hematology panels get explicit specimen rendering instructions
    const specimenNote = organKey === "clinical"
      ? " (clinical illustration of a South Asian patient, natural warm lighting, clinical environment)"
      : organKey === "hematology"
      ? " (peripheral blood smear, Wright-Giemsa stain, 100x oil immersion magnification)"
      : "";

    return `Panel ${i + 1} (${panelLabel}${specimenNote}): ${panelDesc}`;
  });

  const hasClinical = organs.includes("clinical");
  const panelBlock = hasClinical
    ? `This is a ${organs.length}-panel composite illustration. ${panels.join(". ")}. Panel 1 shows the macroscopic clinical symptom of the patient, while the other panels show the microscopic histopathology, connected by the unifying disease mechanism: ${unifyingMechanism}.`
    : `This is a ${organs.length}-panel composite illustration. ${panels.join(". ")}. All panels share the same scale and staining style, connected by the unifying disease mechanism: ${unifyingMechanism}.`;

  // Sanitize color language for H&E validity before emitting
  const rawColorLang: any[] = ds.color_language || [];
  const sanitizedColors = sanitizeColorLanguage(rawColorLang);
  const panelColors = sanitizedColors.length
    ? sanitizedColors.map((c: any) => `${c.zone}: ${c.color_descriptor}`).join("; ")
    : "";

  return { panelBlock, panelColors };
};

// ─── CHATGPT / DALL-E 3 PROMPT BUILDER ──────────────────────────────────────
const buildChatGPTPrompt = (ds: any, subject: string, adData?: any, brief?: string, userStyle?: string): string => {
  const pw = ds.priority_weighting || {};
  const primary = (pw.primary_focus || []).join(", ");
  const secondary = (pw.secondary_context || []).join(", ");
  const styleTokens: string[] = ds.style_descriptors || [];
  const organs = detectMultiOrganCase(subject, pw.primary_focus || [], brief);
  const scale = inferScale(subject, pw.primary_focus || [], brief);
  const { opening, reinforcement } = resolveRenderStyle(styleTokens, scale, userStyle);
  const aspectRatio = inferAspectRatio(scale, organs.length);

  const subjectPhrase = subject || primary;
  const styleDirective = `${opening} of ${subjectPhrase}.`;

  // Multi-organ panel block
  let multiOrganBlock = "";
  if (organs.length >= 2 && adData) {
    const { panelBlock, panelColors } = buildMultiOrganPanelComposition(organs, primary, ds, adData, brief);
    multiOrganBlock = ` ${panelBlock}`;
    if (panelColors) multiOrganBlock += ` Color protocol per panel: ${panelColors}.`;
  }

  // Histology inset contract (for gross+histology dual-scale cases)
  const insetBlock = buildHistologyInsetBlock(brief);

  const physioHook = ds.pathophysiology_visual_summary
    ? ` The illustration shows: ${ds.pathophysiology_visual_summary.replace(/\.$/, "")}.`
    : "";

  const cleanMaster = deduplicateMasterAndSpatial(ds.master_prompt || "", ds.spatial_narrative || "");
  const spatialClean = ds.spatial_narrative ? ds.spatial_narrative.replace(/\.+$/, "") : "";
  const spatial = spatialClean ? ` Layout: ${spatialClean}.` : "";
  const core = cleanMaster ? ` ${cleanMaster}` : "";

  // Colors only for single-organ (multi-organ colors are in the panel block)
  const colors = organs.length < 2 && Array.isArray(ds.color_language) && ds.color_language.length
    ? ` Color treatment: ${sanitizeColorLanguage(ds.color_language).map((c: any) => `use ${c.color_descriptor} for ${c.zone}`).join("; ")}.`
    : "";

  const secondarySentence = secondary ? ` Supporting anatomy includes ${secondary}.` : "";
  const mechanistic = adData ? extractMechanisticCausality(adData) : "";
  const mechanisticSentence = mechanistic ? ` Depict the mechanism: ${mechanistic}` : "";
  const styleFooter = ` Rendering style: ${reinforcement}.`;
  const canvasDirective = ` Canvas: ${aspectRatio}.`;
  const negatives = buildNegativeDirective(ds, false, scale, brief, subject);

  let result = `${styleDirective}${multiOrganBlock}${insetBlock}${physioHook}${spatial}${core}${colors}${secondarySentence}${mechanisticSentence}${styleFooter}${canvasDirective}${negatives}`
    .replace(/\s{2,}/g, " ")
    .trim();

  result = applyTemporalCorrections(result, brief);
  result = enrichSurgicalContext(result, brief);
  return result;
};

// ─── GEMINI / IMAGEN 4 PROMPT BUILDER ───────────────────────────────────────
const buildImagenPrompt = (ds: any, subject: string, adData?: any, brief?: string, userStyle?: string): string => {
  const pw = ds.priority_weighting || {};
  const primary = (pw.primary_focus || []).join(", ");
  const secondary = (pw.secondary_context || []).join(", ");
  const styleTokens: string[] = ds.style_descriptors || [];
  const organs = detectMultiOrganCase(subject, pw.primary_focus || [], brief);
  const scale = inferScale(subject, pw.primary_focus || [], brief);
  const { opening, reinforcement } = resolveRenderStyle(styleTokens, scale, userStyle);
  const aspectRatio = inferAspectRatio(scale, organs.length);

  const subjectPhrase = subject || primary;
  const physioHook = ds.pathophysiology_visual_summary
    ? `, showing ${ds.pathophysiology_visual_summary.replace(/\.$/, "")}`
    : "";
  const openingSentence = `${opening} of ${subjectPhrase}${physioHook}.`;

  // Multi-organ panel block
  let multiOrganBlock = "";
  if (organs.length >= 2 && adData) {
    const { panelBlock, panelColors } = buildMultiOrganPanelComposition(organs, primary, ds, adData, brief);
    multiOrganBlock = ` ${panelBlock}`;
    if (panelColors) multiOrganBlock += ` Color protocol: ${panelColors}.`;
  }

  // Histology inset contract
  const insetBlock = buildHistologyInsetBlock(brief);

  const spatialClean = ds.spatial_narrative ? ds.spatial_narrative.replace(/\.+$/, "") : "";
  const spatial = spatialClean ? ` ${spatialClean}.` : "";

  const cleanMaster = deduplicateMasterAndSpatial(ds.master_prompt || "", ds.spatial_narrative || "");
  const core = cleanMaster ? ` ${cleanMaster.trim()}` : "";

  const mechanistic = adData ? extractMechanisticCausality(adData) : "";
  const mechanisticSentence = mechanistic ? ` ${mechanistic}` : "";

  const { primaryEntities, interactions } = adData ? extractBiologicalEntities(adData) : { primaryEntities: [], interactions: [] };
  const bioGraphSentence = interactions.length > 0
    ? ` Biological interactions depicted: ${interactions.join("; ")}.`
    : primaryEntities.length > 0 && !primary.includes(primaryEntities[0])
    ? ` Key entities: ${primaryEntities.join(", ")}.`
    : "";

  const secondarySentence = secondary ? ` Supporting anatomical context: ${secondary}.` : "";

  const colors = organs.length < 2 && Array.isArray(ds.color_language) && ds.color_language.length
    ? ` Color palette: ${sanitizeColorLanguage(ds.color_language).map((c: any) => `${c.zone} in ${c.color_descriptor}`).join("; ")}.`
    : "";

  const canvasDirective = ` ${aspectRatio}.`;
  const styleFooter = ` ${reinforcement}.`;
  const negatives = buildNegativeDirective(ds, true, scale, brief, subject);

  let result = `${openingSentence}${multiOrganBlock}${insetBlock}${spatial}${core}${mechanisticSentence}${bioGraphSentence}${secondarySentence}${colors}${canvasDirective}${styleFooter}${negatives}`
    .replace(/\s{2,}/g, " ")
    .trim();

  result = applyTemporalCorrections(result, brief);
  result = enrichSurgicalContext(result, brief);
  return result;
};

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
export const compileMedicalPrompt = (adData: any, brief?: string, userStyle?: string) => {
  if (adData.diffusion_synthesis && typeof adData.diffusion_synthesis === "object") {
    console.log("[SOVEREIGN COMPILER v2.0] Compiling with medical accuracy gates...");
    let cleanMaster = adData.diffusion_synthesis.master_prompt || "";

    // Noise pruning — strip SVG/schema artifacts that bleed through from JSON
    cleanMaster = cleanMaster.replace(/stroke_dasharray|stroke_width|z_index|opacity|#[0-9a-fA-F]{6}|\{\s*x:\s*\d.*?\}/g, "");
    cleanMaster = cleanMaster.replace(/ent_\w+|panel_\w+|p1_\w+|p2_\w+|p3_\w+/g, "");
    adData.diffusion_synthesis.master_prompt = cleanMaster;

    const ds = adData.diffusion_synthesis;
    const subject = adData.metadata?.subject || adData.scientific_subject || "";

    // Legacy block format (kept for non-diffusion renderers)
    const compiledBlocks: string[] = [];
    if (ds.priority_weighting) {
      const pw = ds.priority_weighting;
      if (pw.primary_focus?.length)     compiledBlocks.push(`[PRIMARY FOCUS]:\n${pw.primary_focus.join(", ")}`);
      if (pw.secondary_context?.length) compiledBlocks.push(`[SECONDARY CONTEXT]:\n${pw.secondary_context.join(", ")}`);
    }
    if (ds.spatial_narrative)          compiledBlocks.push(`[SPATIAL ARRANGEMENT]:\n${ds.spatial_narrative}`);
    compiledBlocks.push(`[DETAILED SPECIFICATION]:\n${cleanMaster.trim()}`);
    if (ds.style_descriptors?.length)  compiledBlocks.push(`[STYLE PROTOCOL]:\n${ds.style_descriptors.join(", ")}`);
    if (ds.color_language?.length) {
      const colorDesc = sanitizeColorLanguage(ds.color_language).map((c: any) => `${c.zone}: ${c.color_descriptor}`).join("; ");
      compiledBlocks.push(`[COLOR PROTOCOL]:\n${colorDesc}`);
    }
    if (ds.pathophysiology_visual_summary) compiledBlocks.push(`[PATHOPHYSIOLOGY NARRATIVE]:\n${ds.pathophysiology_visual_summary}`);
    if (ds.negative_prompt)             compiledBlocks.push(`[NEGATIVE CONSTRAINTS]:\n${ds.negative_prompt}`);
    adData.diffusion_synthesis.compiled_prompt = compiledBlocks.join("\n\n");

    // Gemini / Imagen 4 prose prompt
    adData.diffusion_synthesis.imagen_prompt = buildImagenPrompt(ds, subject, adData, brief, userStyle);

    // ChatGPT / DALL-E 3 prose prompt
    adData.diffusion_synthesis.chatgpt_prompt = buildChatGPTPrompt(ds, subject, adData, brief, userStyle);
  }
};

export const compileVideoPrompt = (adData: any) => {
  console.log("[SOVEREIGN CINEMATIC COMPILER v7.0] Hard Constraints & Prose Synthesis Layer...");
  const cin = adData.cinematography || {};
  const style = adData.style || {};
  const negatives: string[] = (adData.negative_prompts || []).slice(0, 3);
  const veoClip = adData.veo_clip || {};
  const fps = style.fps || 24;

  const ALLOWED_DURATIONS = [4, 6, 8];
  let finalDuration = veoClip.duration_seconds || 8;
  if (!ALLOWED_DURATIONS.includes(finalDuration)) finalDuration = 8;

  adData.veo_clip.duration_seconds = finalDuration;
  if (adData.clip_strategy) adData.clip_strategy.duration_seconds = finalDuration;
  if (adData.temporal_arc) adData.temporal_arc.total_duration_seconds = finalDuration;

  if (veoClip.resolution === "4K UHD" || veoClip.resolution === "4K") {
    console.log("[v7.0 Validator] 4K not supported by Veo 3.1. Capping to 1080p.");
    adData.veo_clip.resolution = "1080p";
    veoClip.resolution = "1080p";
  }

  let processedNegatives = negatives.map((neg: string) => {
    const lower = neg.toLowerCase();
    if (lower.startsWith("no urban") || lower.includes("no modern")) return "natural rural elements only";
    if (lower.match(/^no [a-zA-Z]+$/)) return neg.replace(/^no /i, "exclude ");
    return neg;
  });

  let compiledPrompt = adData.compiled_master_prompt || "";

  if (compiledPrompt && !compiledPrompt.includes("Exclude:")) {
    const negBlock = processedNegatives.length > 0 ? processedNegatives.join(". ") + "." : "No morphing. No subtitles.";
    compiledPrompt = `${compiledPrompt.trim()} Exclude: ${negBlock}`;
    adData.compiled_master_prompt = compiledPrompt;
  }

  const visualMode = adData.style?.visual_mode || "";
  const rawStyle = typeof style === "string" ? style.toLowerCase() : visualMode.toLowerCase();
  const vTags: string[] = [];
  let forcedFps = 24;
  let isStylised = false;
  let forcedAspectRatio = "16:9";
  let forcedColorTemp = 5500;
  let forcedStock = "";
  let forcedShadows = "soft-natural";
  let forcedGrade = "natural-rec709";

  if (rawStyle.includes("80s") || rawStyle.includes("vintage")) {
    vTags.push("Kodak 5247 film stock", "heavy 35mm grain", "analog gate weave", "magenta/cyan neon practicals");
    forcedFps = 24; forcedAspectRatio = "4:3"; forcedColorTemp = 3200;
    forcedStock = "Kodak 5247 color negative"; forcedShadows = "hard"; forcedGrade = "vintage-warm";
  } else if (rawStyle.includes("noir")) {
    vTags.push("high-contrast Chiaroscuro lighting", "anamorphic prime lens", "deep blacks", "moody rim lighting", "shallow vertical depth of field");
    forcedAspectRatio = "2.39:1"; forcedColorTemp = 3200;
    forcedStock = "ARRI Alexa 65 Noir-tuned"; forcedShadows = "hard-defined-silhouette"; forcedGrade = "cinematic-noir-high-contrast";
    if (adData.motion_physics) {
      adData.motion_physics.dust_dynamics = {
        behavior: "slow gravitational fall with light turbulence",
        particle_size: "mixed microscopic and coarse wood-shavings",
      };
    }
  } else if (rawStyle.includes("cyberpunk") || rawStyle.includes("neon") || rawStyle.includes("anime")) {
    if (adData.motion_physics) {
      adData.motion_physics.rain_interaction = {
        tire_spray: "directional streaks", surface_response: "rippled reflections", impact_pattern: "high-speed splatter",
      };
    }
  } else if (rawStyle.includes("ghibli") || rawStyle.includes("skytale")) {
    vTags.push("Studio Ghibli hand-painted style", "watercolor textures"); forcedFps = 12; isStylised = true; forcedAspectRatio = "16:9";
  } else if (rawStyle.includes("photorealistic")) {
    vTags.push("clean ultra-realistic 8k", "sharp optical focus", "global illumination"); forcedFps = 24; forcedAspectRatio = "16:9"; forcedStock = "RED Monstro 8K VV";
  } else if (rawStyle.includes("picture book")) {
    vTags.push("soft watercolor painting", "pastel tones", "paper texture"); forcedFps = 12; isStylised = true; forcedAspectRatio = "4:3";
  } else if (rawStyle.includes("3d cartoon") || rawStyle.includes("hyper cartoon")) {
    vTags.push("Pixar-like 3D CGI", "subsurface scattering", "squash-and-stretch motion"); forcedFps = 24; isStylised = true; forcedAspectRatio = "16:9";
  } else if (rawStyle.includes("retro comics")) {
    vTags.push("vintage comic book cel-shading", "Ben-Day dot halftone", "heavy ink contours"); forcedFps = 12; isStylised = true; forcedAspectRatio = "4:3";
  } else if (rawStyle.includes("pixel art")) {
    vTags.push("16-bit pixel art", "crisp square pixels", "retro gaming aesthetic"); forcedFps = 8; isStylised = true; forcedAspectRatio = "4:3";
  } else if (rawStyle.includes("illustration") || rawStyle.includes("minimalist")) {
    vTags.push("flat vector illustration", "clean minimalist linework", "high negative space"); forcedFps = 12; isStylised = true; forcedAspectRatio = "16:9";
  } else if (rawStyle.includes("dreamtale")) {
    vTags.push("ethereal bloom", "soft focus magical glowing particles", "pastel volumetric lighting"); forcedFps = 24; forcedColorTemp = 4500; forcedAspectRatio = "16:9";
  } else if (rawStyle.includes("horror")) {
    vTags.push("underexposed moody rim lighting", "eerie volumetric fog", "cold desaturated shadows"); forcedFps = 24; forcedColorTemp = 3200; forcedAspectRatio = "2.39:1";
  } else if (rawStyle.includes("sketchbook")) {
    vTags.push("raw charcoal pencil sketch", "rough hand-drawn motion", "visible parchment grain"); forcedFps = 8; isStylised = true; forcedAspectRatio = "1:1";
  } else if (rawStyle.includes("drone")) {
    vTags.push("aerial drone cinematography", "hyper-smooth gimbal stabilization", "sweeping landscape view"); forcedFps = 24; forcedAspectRatio = "16:9"; forcedStock = "DJI Inspire 3 ProRes Raw";
  }

  if (adData.veo_clip) adData.veo_clip.aspect_ratio = forcedAspectRatio;
  if (adData.style) { adData.style.fps = forcedFps; adData.style.grade_profile = forcedGrade; }
  if (adData.lighting) { adData.lighting.colour_temp_K = forcedColorTemp; adData.lighting.shadow_behavior = forcedShadows; }

  if (adData.cinematography) {
    const c = adData.cinematography;
    if (c.camera_platform === "hand-held" && c.camera_movement && c.camera_movement.toLowerCase().includes("zoom")) {
      adData.cinematography.camera_movement = "gradual dolly push";
      adData.cinematography.stabilization = "high-performance gimbal";
    }
  }

  if (rawStyle.includes("noir")) {
    const sections = adData.compiled_master_prompt.split("Exclude:");
    let positivePrompt = sections[0];
    let negativePrompt = sections.length > 1 ? "Exclude: " + sections[1] : "";
    positivePrompt = positivePrompt
      .replace(/sun-drenched|bright airy|warm golden|golden hour|soft natural daylight/gi, (match: string) => {
        return positivePrompt.includes("moody low-key") ? "" : "moody low-key";
      })
      .replace(/5500K/g, "3200K");
    negativePrompt = negativePrompt.replace(/no dark shadows|no deep blacks|no moody atmosphere|no low-key lighting/gi, "");
    adData.compiled_master_prompt = (positivePrompt.trim() + " " + negativePrompt.trim()).trim();
  }

  const prose_word_count = (adData.compiled_master_prompt || "").split(/\s+/).length;
  if (prose_word_count < 140 && Array.isArray(adData.scene_core?.action_sequence)) {
    console.log("[v20.0 Lombardi Synthesis] Final Gold Standard Synthesis.");

    const isAnimated = rawStyle.includes("animated") || rawStyle.includes("pixar") || rawStyle.includes("ghibli") || rawStyle.includes("anime") || rawStyle.includes("3d cartoon") || rawStyle.includes("illustration") || rawStyle.includes("manga");
    const isCyberpunk = rawStyle.includes("cyberpunk") || rawStyle.includes("neon") || rawStyle.includes("futuristic");
    const isDrone = rawStyle.includes("drone") || rawStyle.includes("aerial");
    const isNoir = rawStyle.includes("noir");

    const rawSubject = adData.scene_core.subject || "subject";
    const isVehicle = rawSubject.toLowerCase().includes("car") || rawSubject.toLowerCase().includes("vehicle") || rawSubject.toLowerCase().includes("vessel") || rawSubject.toLowerCase().includes("bike");
    const formattedSubject = isVehicle ? (rawSubject.match(/^(a|an|the)\s/i) ? rawSubject : `a ${rawSubject}`) : (rawSubject.match(/^(a|an|the)\s/i) ? rawSubject : `an Indian ${rawSubject}`);
    const location = adData.scene_core?.environment?.location || "scene";

    if (adData.cinematography) {
      adData.cinematography.shot_type = "high_speed_tracking";
      adData.cinematography.camera_movement = "tracking shot";
    }

    let finalProse = "";

    if (isAnimated) {
      const styleDesc = isCyberpunk ? "stylized cyberpunk anime aesthetic" : `${rawStyle} rendering style`;
      const lightingGrammar = isCyberpunk ? "neon signage in magenta and cyan, creating layered light patterns that ripple across the wet asphalt" : `palette-driven lighting with ${isNoir ? "high-contrast shadows" : "vivid saturation"}`;
      const animeMotifs = isCyberpunk ? "holographic billboards, suspended signage, and foreground cables creating layered depth" : "hand-painted backgrounds and textured brushwork";
      const opening = `A high-speed tracking shot establishes ${formattedSubject} within a ${location}, rendered in a ${styleDesc}. ${lightingGrammar}.`;
      const subjectRef = isVehicle ? "The vehicle" : "The subject";
      const motionBody = (adData.scene_core.action_sequence || [])
        .map((b: any, index: number) => {
          if (index === 0) return `${subjectRef} races steadily, its motion accentuated by elongated motion smears and deliberate squash-and-stretch deformation.`;
          if (index === 1) return `The movement flows into ${b.action.toLowerCase()}, where stylized light trails and ${isCyberpunk ? "chromatic aberration" : "visual artifacts"} catch the glow from neon sources.`;
          return `The sequence resolves with smooth, continuous motion as it reaches ${b.action.toLowerCase()}.`;
        })
        .join(" ");
      const physicsDetail = isCyberpunk ? "Rain-streaks diagonally across the frame, catching light from holographic billboards above. Directional tire spray and high-speed splatter define the contact with the rain-slick surface." : "Physics govern the movement with consistent stylistic continuity and clean rendering. No digital artifacts.";
      const technicalFooter = `Visual composition relies on ${animeMotifs}, with ${isCyberpunk ? "bloom and light scattering" : "clean linework"} defining the frame. Saturated highlight roll-off ensures deep stylistic depth.`;
      finalProse = `${opening} ${motionBody} ${physicsDetail} ${technicalFooter}`;
    } else {
      const opening = `A professional tracking shot frames ${formattedSubject} in ${isNoir ? "low-key" : "natural"} ${forcedColorTemp}K lighting, his weathered features catching a narrow shaft of light within a ${location}.`;
      const motionBody = (adData.scene_core.action_sequence || [])
        .map((b: any, index: number) => {
          if (index === 0) return `He ${b.action.toLowerCase()} steadily, the motion deliberate and weighted, as deep shadows pool across the textured surface.`;
          if (index === 1) return `The movement flows into ${b.action.toLowerCase()}; fine particulates drift into the light, briefly suspended in the air.`;
          return `He finishes ${b.action.toLowerCase()} with quiet rhythm as the shot resolves.`;
        })
        .join(" ");
      const physicsDetail = isDrone ? "Hyper-smooth gimbal stabilization ensures zero vibration, maintaining a cinematic drift." : "Volumetric beams cut through the moisture-laden atmosphere, revealing slow-falling particles shaped by subtle air currents.";
      const technicalFooter = `Captured on an ${forcedStock || "industry-standard 35mm camera"} at ${forcedFps}fps, with a premium cinematic lens and selective focus. High-contrast chiaroscuro defines the scene, with deep blacks and a controlled rim light separating subject from background.`;
      finalProse = `${opening} ${motionBody} ${physicsDetail} ${technicalFooter}`;
    }

    const finalNegatives = (adData.negative_prompts || []).length > 0 ? `Exclude ${adData.negative_prompts.join(", ")}.` : `Exclude ${isAnimated ? "photorealism, camera-based artifacts, and physical lens behavior" : "high-key lighting, warm daylight, and digital artifacts"}.`;
    adData.compiled_master_prompt = `${finalProse} ${finalNegatives} The ${finalDuration}-second shot maintains absolute visual coherence.`.replace(/[{}[\]"]/g, "");
  }

  const final_prose = adData.compiled_master_prompt || "";
  const final_word_count = final_prose.trim().split(/\s+/).length;
  const validation_results: any[] = [];
  let hard_reject = false;

  if (final_word_count < 80) {
    validation_results.push({ rule: "R9", status: "fail", severity: "blocker", detail: `Insufficient Prose Density (${final_word_count} words). 120+ words required for Sovereign status.` });
    hard_reject = true;
  }

  if (!final_prose.toLowerCase().includes("indian") && !final_prose.toLowerCase().includes("south asian")) {
    adData.compiled_master_prompt = `[MANDATORY IDENTITY: Indian/South Asian descent] ${final_prose}`;
  }

  if (!hard_reject) {
    adData.engine_prompts = { veo: adData.compiled_master_prompt };
    adData._quality_flags = {
      validation_status: "PASSED",
      engine: "Sovereign v20.5 [Gold Standard Final]",
      prose_word_count: final_word_count,
      prose_gate_passed: true,
    };
  }

  return { hard_reject, validation_results };
};
