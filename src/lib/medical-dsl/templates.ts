/**
 * Sovereign v32.0 Medical Mechanism Templates
 * 
 * Each template explicitly mandates which primitives and relations
 * MUST be present in the generated JSON. This ensures clinical accuracy
 * regardless of the LLM's inherent medical knowledge.
 */

export const MEDICAL_MECHANISM_TEMPLATES = {
  // --- VASCULAR OCCLUSION (e.g. Sickle Cell VOC) ---
  vascular_occlusion: {
    required_primitives: [
      "lumen_tubular_corridor",
      "endothelial_lining_cell_chain",
      "rbc_sickled_crescent",
      "rbc_adhesion_cluster",
      "adhesion_contact_zone"
    ],
  // --- CARDIOLOGY (Master Library) ---
  atherothrombosis_rupture: {
    required_primitives: ["concentric_layered_vessel_wall", "eccentric_plaque_protrusion", "fibrous_cap_over_lipid_core", "thrombotic_occlusion_cluster"],
    required_relations: ["fibrous_cap_over_lipid_core -> thins_and_ruptures -> eccentric_plaque_protrusion", "exposure -> triggers -> thrombotic_occlusion_cluster"]
  },
  coronary_flow_stenosis: {
    required_primitives: ["lumen_tubular_corridor", "pressure_gradient_field"],
    required_relations: ["lumen_tubular_corridor -> creates_resistance_in -> pressure_gradient_field"]
  },
  valve_regurgitation_dynamics: {
    required_primitives: ["electrical_wavefront", "pressure_gradient_field"],
    required_relations: ["pressure_gradient_field -> generates_backflow -> electrical_wavefront"] 
  },

  // --- NEUROLOGY (Master Library) ---
  bbb_disruption: {
    required_primitives: ["endothelial_lining_cell_chain", "astrocyte_cell", "cytokine_diffusion_field"],
    required_relations: ["cytokine_diffusion_field -> breaks_tight_junctions_in -> endothelial_lining_cell_chain", "endothelial_lining_cell_chain -> causes_edema_around -> astrocyte_cell"]
  },
  excitotoxicity_cascade: {
    required_primitives: ["neuron_full_structure", "synaptic_junction", "cytokine_diffusion_field"],
    required_relations: ["synaptic_junction -> releases_excess_glutamate -> cytokine_diffusion_field", "cytokine_diffusion_field -> causes_calcium_overload_in -> neuron_full_structure"]
  },
  demyelination_conduction_block: {
    required_primitives: ["white_matter_tract", "synaptic_signal_vector"],
    required_relations: ["white_matter_tract -> loses_myelin_leading_to -> synaptic_signal_vector"]
  },

  // --- NEPHROLOGY (Master Library) ---
  tubuloglomerular_feedback: {
    required_primitives: ["glomerulus_tuft", "nephron_tubule_chain", "filtration_gradient_field"],
    required_relations: ["nephron_tubule_chain -> senses_nacl_and_signals -> glomerulus_tuft", "glomerulus_tuft -> reduces_gfr_via -> filtration_gradient_field"]
  },
  atn_ischemia_reperfusion: {
    required_primitives: ["nephron_tubule_chain", "macrophage_phagocytosis", "neuroinflammatory_field"],
    required_relations: ["nephron_tubule_chain -> undergoes_necrosis_releasing -> neuroinflammatory_field"]
  },
  nephrotic_protein_leak: {
    required_primitives: ["podocyte_foot_process_mesh", "foot_process_effacement", "protein_leak_flux"],
    required_relations: ["podocyte_foot_process_mesh -> effaces_at -> foot_process_effacement", "foot_process_effacement -> allows_flux_of -> protein_leak_flux"]
  },

  // --- IMMUNOLOGY / ONCOLOGY (Master Library) ---
  car_t_targeting: {
    required_primitives: ["tumor_cell", "cytotoxic_t_cell", "tcr_mhc_binding_complex"],
    required_relations: ["cytotoxic_t_cell -> engineered_binding_to -> tumor_cell", "tcr_mhc_binding_complex -> triggers -> cytotoxic_release"]
  },
  adc_internalization: {
    required_primitives: ["tumor_cell", "receptor_internalization", "cytotoxic_release"],
    required_relations: ["tumor_cell -> binds_and_internalizes -> receptor_internalization", "receptor_internalization -> releases_cytotoxic_payload -> tumor_cell"]
  },
  cytokine_storm_systemic: {
    required_primitives: ["cytokine_cloud", "signaling_field_gradient", "neuroinflammatory_field"],
    required_relations: ["cytokine_cloud -> creates_global -> signaling_field_gradient"]
  },

  // --- PULMONOLOGY (Master Library) ---
  ards_alveolar_leak: {
    required_primitives: ["alveolar_sac_cluster", "endothelial_lining_cell_chain", "cytokine_diffusion_field"],
    required_relations: ["cytokine_diffusion_field -> causes_leakage_into -> alveolar_sac_cluster"]
  },
  vq_mismatch_hypoxemia: {
    required_primitives: ["alveolar_sac_cluster", "lumen_tubular_corridor", "pressure_gradient_field"],
    required_relations: ["lumen_tubular_corridor -> perfusion_mismatch_with -> alveolar_sac_cluster"]
  },

  // --- ENDOCRINOLOGY (Master Library) ---
  insulin_pi3k_akt_signaling: {
    required_primitives: ["pancreatic_islet_beta_cell", "jak_stat_cascade", "glucose_molecular_flux"],
    required_relations: ["pancreatic_islet_beta_cell -> triggers_signaling_for -> glucose_molecular_flux"]
  },
  thyroid_feedback_loop: {
    required_primitives: ["jak_stat_cascade", "cytokine_diffusion_field"],
    required_relations: ["cytokine_diffusion_field -> inhibits -> jak_stat_cascade"]
  },

  // --- HEMATOLOGY (Master Library) ---
  coagulation_amplification: {
    required_primitives: ["thrombotic_occlusion_cluster", "lumen_tubular_corridor"],
    required_relations: ["lumen_tubular_corridor -> supports -> thrombotic_occlusion_cluster"]
  },
  sickle_cell_voc_adhesion: {
    required_primitives: ["rbc_sickled_crescent", "rbc_adhesion_cluster", "endothelial_lining_cell_chain"],
    required_relations: ["rbc_sickled_crescent -> adheres_and_blocks -> endothelium_lining_cell_chain"]
  },
  // --- INTERVENTIONAL & SURGICAL (Device MoA Library) ---
  stent_deployment_sequence: {
    required_primitives: [
      "metallic_mesh_structure",
      "angioplasty_balloon",
      "polymer_tubing",
      "radial_force_field",
      "device_tissue_interface"
    ],
    required_relations: [
      "angioplasty_balloon -> expands_to_deploy -> metallic_mesh_structure",
      "metallic_mesh_structure -> exerts -> radial_force_field",
      "radial_force_field -> restores -> lumen_tubular_corridor"
    ]
  },
  robotic_tme_surgery: {
    required_primitives: [
      "robotic_arm_module",
      "surgical_grasper",
      "endoscopic_camera",
      "device_tissue_interface"
    ],
    required_relations: [
      "robotic_arm_module -> provides_precision_to -> surgical_grasper",
      "surgical_grasper -> performs_traction_at -> device_tissue_interface"
    ]
  },
  hollow_fiber_dialysis: {
    required_primitives: [
      "polymer_tubing",
      "device_flow_stream",
      "filtration_barrier",
      "pressure_gradient_field"
    ],
    required_relations: [
      "device_flow_stream -> undergoes_countercurrent_exchange -> filtration_barrier",
      "pressure_gradient_field -> drives_ultrafiltration_at -> filtration_barrier"
    ]
  }
} as const;

export type MedicalMechanismTemplateId = keyof typeof MEDICAL_MECHANISM_TEMPLATES;
