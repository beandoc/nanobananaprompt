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

  // --- IMMUNOLOGY & ONCOLOGY (Onco-Pharma Library v1.0) ---
  IMMUNE_ONCOLOGY: {
    // Core Cellular
    tumor_cell: "Irregular membrane tumor cell with high nucleus-to-cytoplasm ratio and dense surface receptors.",
    cytotoxic_t_cell: "Activated spherical CD8+ T-cell with TCR clusters and cd8 co-receptors.",
    exhausted_t_cell: "Rounded, signal-attenuated T-cell with high PD-1 expression and reduced TCR signaling.",
    antigen_presenting_cell: "Irregular membrane cell with surface MHC complexes and co-stimulatory molecules.",
    
    // Molecular Interface (The Core)
    tcr_mhc_binding_complex: "A lock-and-key interface between the T-cell receptor (TCR) and the tumor-antigen-MHC-I complex.",
    pd1_receptor: "A membrane-bound inhibitory checkpoint receptor located on the T-cell surface.",
    pdl1_ligand: "An immune-inhibitory ligand expressed on the tumor cell surface.",
    pd1_pdl1_binding: "A tight surface lock-and-key contact between PD-1 and PD-L1, mediating T-cell inhibition.",
    
    // Functional / Signaling
    t_cell_activation_signal: "Bright directional intracellular signal vector originating from TCR-MHC binding.",
    checkpoint_inhibition_signal: "Diffuse signal-suppression field originating from PD-1:PD-L1 binding.",
    cytotoxic_release: "Directional release of perforin and granzyme granules toward the tumor cell.",
    t_cell_signal_attenuation: "Fading or broken signal lines representing reduced cytotoxicity and exhaustion.",
    
    // Legacy support (to be phased out)
    microglial_activation: "A ramified immune cell with multiple branching processes.",
    tumor_microenvironment_stroma: "A fibrous extracellular matrix with cancer-associated fibroblasts.",
    angiogenic_vessel_sprouting: "Abnormal new vascular structures branching from an existing vessel.",
    metastatic_intravasation_event: "A malignant cell entering a vascular lumen through a disrupted barrier."
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

  // --- NEPHROLOGY (Renal Mesh v1.0) ---
  KIDNEY: {
    // Macro
    kidney_organ: "Bean-shaped renal capsule showing cortex, medulla pyramids, and hilum entry.",
    corticomedullary_axis: "Radial gradient layers showing the cortex, outer medulla, and inner medulla.",
    
    // Micro (The Mesh System)
    fenestrated_endothelium: "A perforated endothelial sheet with uniform porous openings for filtration.",
    glomerular_basement_membrane: "A dense, layered molecular filter showing charge-selective barriers.",
    podocyte_foot_process_mesh: "An interdigitating mesh of foot-processes (pedicels) with regular slit diaphragms.",
    
    // Pathology
    foot_process_effacement: "A flattened, continuous epithelial sheet resulting from the loss of the podocyte foot-process mesh.",
    protein_leak_flux: "A directional particle stream migrating from the capillary through the mesh into the urinary space.",
    glomerulosclerosis_lesion: "Segmental or global capillary collapse with extracellular matrix expansion.",
    crescent_formation: "Semilunar fill of Bowman's space with proliferating cells and fibrin."
  },

  // --- CARDIOLOGY (Electrophysiology Physics v1.0) ---
  CARDIOLOGY: {
    ion_channel_cluster: "Membrane-embedded nodes representing Na+, K+, and Ca2+ channel clusters.",
    action_potential_waveform: "A chronological mapping of voltage-time phases from depolarization to repolarization.",
    electrical_wavefront: "A moving activation front with clear directionality and velocity properties.",
    reentry_circuit: "A circular wavefront loop representing self-sustained arrhythmic activation.",
    sarcomere_contraction_vector: "A mechanical force vector coupled to the electrical activation wavefront."
  },

  // --- INFECTIOUS DISEASE (Pathogen Library v1.0) ---
  PATHOGENS: {
    // Viral
    viral_capsid: "Protective icosahedral protein shell enclosing a coiled genomic core (RNA/DNA).",
    viral_spike_proteins: "Surface-protruding trimers (e.g. Spike/Hemagglutinin) mediating host receptor binding.",
    virus_host_fusion_interface: "A transitional membrane-merging zone facilitating viral entry into the host cell.",
    endocytic_vesicle: "Membrane-enclosed sphere facilitating the internalization of viral particles.",
    
    // Bacterial
    peptidoglycan_mesh: "A crosslinked polymer lattice (cell wall) providing structural rigidity and porosity.",
    biofilm_matrix: "A gel-like extracellular field composed of polysaccharides, proteins, and DNA fragments.",
    diffusion_barrier_field: "A dense gradient zone within a biofilm matrix that reduces antibiotic penetration.",
    
    // Resistance & Transport
    efflux_pump: "A membrane-spanning channel facilitating the active export of drugs from the intracellular space.",
    antibiotic_particle: "A diffusive particle field targeting specific bacterial structural components."
  },

  // --- SYNTHETIC IMMUNOLOGY (Next-Gen Pharma v1.0) ---
  SYNTHETIC_BIOLOGY: {
    // Engineered Cellular
    car_t_cell: "T-cell with specialized chimeric antigen receptor (CAR) clusters and CD3z/CD28 signaling domains.",
    tumor_cell_antigen_positive: "Irregular tumor cell surface expressing a high density of the target antigen.",
    
    // Synthetic Interface (The Core)
    car_antigen_binding_interface: "A dense, MHC-independent multivalent contact zone between CAR and antigen.",
    synthetic_immunological_synapse: "Flattened interface disk with central activation and peripheral adhesion zones.",
    bite_antibody_bridge: "Flexible dual-arm antibody connector bridging CD3 on T-cells and tumor antigens.",
    
    // Intracellular Signaling
    car_signal_cascade: "Intracellular branching signal pathway (CD3z/costimulatory activation) within a CAR-T cell.",
    directed_cytotoxic_release: "Focused vector release of perforin and granzyme granules toward the synapse center.",
    
    // Delivery Systems (mRNA / LNP)
    lipid_nanoparticle: "Spherical lipid bilayer shell containing an encapsulated mRNA core.",
    endosomal_escape_event: "Membrane disruption burst triggering mRNA release from an endosome into the cytoplasm.",
    mrna_translation_process: "Ribosomal linear track process showing therapeutic protein expression output."
  },

  // --- MECHANICAL & INTERVENTIONAL (Device Library v1.0) ---
  MECHANICAL_DEVICES: {
    // Structural Materials
    metallic_mesh_structure: "Repeating lattice network (Nitinol/Cobalt-Chromium) with radial expandability and shape memory.",
    polymer_tubing: "Flexible hollow cylinder with high bendability and pressure resistance for catheters and dialysis lines.",
    angioplasty_balloon: "Expandable cylindrical membrane with primary states of inflation and deflation, applying radial force.",
    
    // Instrumentation
    surgical_grasper: "Articulated clamp with multi-axis rotation for precise tissue manipulation.",
    robotic_arm_module: "Multi-joint articulated link with precision rotation and remote actuation capabilities.",
    endoscopic_camera: "Slender probe with an optical tip providing a real-time intra-luminal visual field.",
    
    // Mechanical-Biological Interface
    device_tissue_interface: "Contact surface zone where compression, friction, and shear forces are exchanged.",
    radial_force_field: "Outward directional vector field used to simulate lumen expansion during stent deployment.",
    device_flow_stream: "Directed streamlines through a device showing velocity gradients and pressure drops."
  },

  // --- IMMUNOLOGY (Signaling Fields v1.0) ---
  SIGNALING_PHYSICS: {
    cytokine_cloud: "A diffuse radial molecular field representing local IL-6 and TNF-alpha concentrations.",
    receptor_internalization: "A membrane-bound lock-and-key cluster undergoing active endocytosis.",
    jak_stat_cascade: "A nucleus-directed signal chain showing STAT phosphorylation and translocation.",
    signaling_field_gradient: "A vector field showing continuous curved streamlines of a diffusion gradient.",
    neuroinflammatory_field: "A zone of diffuse cell activation and cytokine diffusion gradients."
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
