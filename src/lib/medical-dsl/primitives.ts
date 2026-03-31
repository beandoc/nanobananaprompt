/**
 * Sovereign v32.0 Medical Primitive Library
 * 
 * These define the visual-grammar 'Skeleton' for high-fidelity medical assets.
 * By using these instead of generic shapes (circle/ellipse), we force
 * deterministic biological rendering across all AI models.
 */

export const MEDICAL_PRIMITIVES = {
  // --- VASCULAR & CARDIOVASCULAR ---
  BLOOD_VESSEL: {
    lumen_tubular_corridor: "A smooth, neutral-toned vascular lumen with clear depth and a three-dimensional tubular surface.",
    endothelial_lining_cell_chain: "A continuous, slightly scalloped chain of flat endothelial cells lining the interior vessel wall.",
    multi_layer_vessel_wall: "A structurally accurate vessel wall showing the intima, media (smooth muscle), and adventitia layers.",
    concentric_layered_vessel_wall: "A circular, three-dimensional multi-layered anatomical cross-section showing concentric intima, media, and adventitia rings.",
    eccentric_plaque_protrusion: "An asymmetrical, bulging accumulation of atherosclerotic material protruding into a vessel lumen, causing narrowing.",
    fibrous_cap_over_lipid_core: "A thin, translucent fibrous protective layer covering a dense, yellowish necrotic lipid core within an atherosclerotic plaque.",
    macrophage_lipid_phagocyte: "A specialized, granular macrophage (Foam Cell) with a bubbly, lipid-laden interior following the phagocytosis of LDL molecules."
  },

  // --- HEMATOLOGY & CARDIOLOGY ---
  SICKLE_CELL: {
    rbc_normal_biconcave: "A smooth, red biconcave erythrocyte disk with a slight central indentation.",
    rbc_sickled_crescent: "A sharp, elongated, crescent-shaped erythrocyte with irregular, rigid margins and a pointed terminus.",
    rbc_adhesion_cluster: "A clump of sickled and normal erythrocytes physically adhering to the vessel wall endothelium.",
    intracellular_hbs_polymer: "Rigid, non-helical linear protein polymer fibers occupying the internal cytoplasm of the red cell.",
    cardiomyocytes_radial_alignment: "Volumetric, striated cardiac muscle cells arranged in a clean, parallel radial alignment.",
    thrombotic_occlusion_cluster: "A dense, fibrin-rich aggregation of platelets and erythrocytes forming a complete blockage within a lumen."
  },

  // --- NEUROLOGY ---
  BRAIN: {
    laminar_cortex_band: "A wide horizontal band of cortical tissue composed of 6 distinct parallel layers with subtle vertical striations.",
    neuron_with_dendrites: "A volumetric neuronal soma with complex dendritic branching and a clear, singular axon projection.",
    synaptic_bouton_cluster: "A series of small, bulbous axonal endings forming connections (synapses) with a dendritic spine.",
    amyloid_extracellular_plaque: "An irregular, fibrillar, bio-teal (#00796B) cluster of misfolded protein in the extracellular space.",
    intracellular_tau_tangle: "Spirally-curled, clinical purple (#673AB7) helical fibrils occupying the interior of a neuronal cell body."
  },

  // --- IMMUNOLOGY & ONCOLOGY ---
  IMMUNE_CELLS: {
    microglial_activation: "A ramified immune cell with multiple branching processes migrating toward a target structure.",
    macrophage_phagocytosis: "A granular, amorphous cell body in the process of engulfing cellular debris or deformed erythrocytes.",
    foam_cell_cluster: "A lipid-laden macrophage appearing as a bloated cell with a bubbly, translucent interior and yellowish hue.",
    tumor_microenvironment_stroma: "A dense, fibrous extracellular matrix populated by cancer-associated fibroblasts and tumor cells.",
    angiogenic_vessel_sprouting: "The formation of new, thin-walled vascular structures branching abnormally from an existing vessel.",
    metastatic_intravasation_event: "The physical entry of a malignant cell into a vascular lumen through a disrupted endothelial barrier."
  },

  // --- PULMONOLOGY & DIABETES ---
  METABOLIC_RESPIRATORY: {
    alveolar_sac_cluster: "A group of hollow, grape-like pulmonary air sacs with thin, translucent epithelial walls.",
    bronchial_smooth_muscle_hypertrophy: "A thickened, constricted layer of smooth muscle surrounding a narrowed bronchial airway.",
    mucus_hypersecretion_plug: "A viscous, semi-transparent accumulation of mucus obstructing a pulmonary lumen.",
    pancreatic_islet_beta_cell: "A specialized cluster of insulin-producing endocrine cells within a pancreatic islet.",
    insulin_receptor_GLUT4_complex: "A molecular-scale docking station on a cell membrane showing insulin binding and glucose transporter activation.",
    glucose_molecular_flux: "The directional movement of hexagonal glucose molecules across a cellular membrane barrier."
  },

  // --- GEOMETRY ENFORCEMENT ---
  LAYOUT: {
    tapered_zoom_linkage: "A trapezoidal geometric connector between a macro bounding box and its micro detailed panel.",
    adhesion_contact_zone: "A specific interface or 'docking' area where two cellular membranes are in direct physical contact."
  }
} as const;

export type MedicalPrimitiveId = keyof typeof MEDICAL_PRIMITIVES; 
