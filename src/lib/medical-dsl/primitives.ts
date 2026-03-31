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

  // --- NEPHROLOGY (Renal v1.0) ---
  KIDNEY: {
    // Macro
    kidney_organ: "Bean-shaped renal capsule showing cortex, medulla pyramids, and hilum entry.",
    corticomedullary_axis: "Radial gradient layers showing the cortex, outer medulla, and inner medulla.",
    renal_vascular_tree: "Branching hierarchy: renal artery -> segmental -> arcuate -> afferent arteriole.",
    
    // Micro
    glomerulus_tuft: "Complex capillary ball cluster within Bowman's space with mesangial matrix.",
    filtration_barrier: "Three-layer barrier: fenestrated endothelium, basement membrane, and podocytes.",
    podocyte_cell: "Cell body with interdigitating foot processes (pedicels) and slit diaphragms.",
    nephron_tubule_chain: "Continuous coiled tubular path: proximal, loop of Henle, distal, and collecting duct.",
    
    // Pathology
    glomerulosclerosis_lesion: "Segmental or global capillary collapse with extracellular matrix expansion.",
    crescent_formation: "Semilunar fill of Bowman's space with proliferating cells and fibrin.",
    tubular_atrophy_segment: "Thinned, narrowed tubule segment with loss of epithelial lining.",
    protein_leak_stream: "Diffuse particle flow originating at the filtration barrier and entering the tubule.",
    
    // Hemodynamics
    glomerular_flow_vector: "Pressure-proportional directional vector from afferent to efferent arteriole.",
    filtration_gradient_field: "Pressure map showing high-gradient capillary to low-gradient Bowman's space."
  },

  // --- NEUROLOGY (Neuro v1.0) ---
  BRAIN_CNS: {
    // Macro
    brain_cortical_surface: "Gyral and sulcal folded sheet structure showing three-dimensional depth.",
    cortical_laminar_bands: "Six distinct parallel horizontal bands (Layer I-VI) with vertical striations.",
    white_matter_tract: "Bundled parallel fibers showing longitudinal signal flow polarity.",
    
    // Micro
    neuron_full_structure: "Volumetric soma with complex dendritic tree, axon, and synaptic terminals.",
    synaptic_junction: "Molecular gap between pre- and post-synaptic membranes with vesicle release.",
    microglial_cell: "Ramified branching cell (resting) or activated amoeboid immune cell.",
    astrocyte_cell: "Star-shaped support cell regulating the blood-brain barrier (BBB).",
    
    // Pathology
    amyloid_plaque: "Extracellular fibrillar protein cluster with a dense core and neuritic halo.",
    tau_neurofibrillary_tangle: "Intracellular twisted helical fibrils occupying the soma and axon.",
    synaptic_loss_pattern: "Visual representation of reduced synapse density and network disconnectivity.",
    neuroinflammatory_field: "Zone of diffuse microglial activation and cytokine diffusion gradients.",
    
    // Signaling
    synaptic_signal_vector: "Discrete signal pulse vector propagating from axon to synapse.",
    cytokine_diffusion_field: "Radial spread gradient originating from activated microglia."
  },

  // --- GEOMETRY ENFORCEMENT ---
  LAYOUT: {
    tapered_zoom_linkage: "A trapezoidal geometric connector between a macro bounding box and its micro detailed panel.",
    adhesion_contact_zone: "A specific interface or 'docking' area where two cellular membranes are in direct physical contact."
  }
} as const;

export type MedicalPrimitiveId = keyof typeof MEDICAL_PRIMITIVES; 
