interface MedicalTemplate {
  required_primitives: string[];
  required_relations: string[];
}

export const MEDICAL_MECHANISM_TEMPLATES: Record<string, MedicalTemplate> = {
  // --- VASCULAR OCCLUSION (e.g. Sickle Cell VOC) ---
  vascular_occlusion: {
    required_primitives: [
      "lumen_tubular_corridor",
      "endothelial_lining_cell_chain",
      "rbc_sickled_crescent",
      "rbc_adhesion_cluster",
      "adhesion_contact_zone"
    ],
    required_relations: [
      "rbc_sickled_crescent -> adheres_to -> endothelial_lining_cell_chain",
      "rbc_adhesion_cluster -> obstructs -> lumen_tubular_corridor"
    ]
  },
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
  },

  // --- SYNTHETIC IMMUNOLOGY & GENE THERAPY (Next-Gen MoA Library) ---
  car_t_synapse_formation: {
    required_primitives: [
      "car_t_cell",
      "tumor_cell_antigen_positive",
      "synthetic_immunological_synapse",
      "car_signal_cascade",
      "directed_cytotoxic_release"
    ],
    required_relations: [
      "car_t_cell -> engineered_recognition_of -> tumor_cell_antigen_positive",
      "car_t_cell -> forms_synthetic_synapse_with -> tumor_cell_antigen_positive",
      "synthetic_immunological_synapse -> triggers_branching -> car_signal_cascade",
      "car_signal_cascade -> induces_focused -> directed_cytotoxic_release"
    ]
  },
  bite_antibody_bridging: {
    required_primitives: [
      "cytotoxic_t_cell",
      "tumor_cell_antigen_positive",
      "bite_antibody_bridge"
    ],
    required_relations: [
      "bite_antibody_bridge -> cross_links_cd3_on_tcell_to -> tumor_cell_antigen_positive",
      "bite_antibody_bridge -> forces_artificial_proximity_to -> cytotoxic_t_cell"
    ]
  },
  mrna_lnp_delivery: {
    required_primitives: [
      "lipid_nanoparticle",
      "endosomal_escape_event",
      "mrna_translation_process"
    ],
    required_relations: [
      "lipid_nanoparticle -> undergoes_endocytosis_and -> endosomal_escape_event",
      "endosomal_escape_event -> releases_mrna_for -> mrna_translation_process"
    ]
  },

  // --- INFECTIOUS DISEASE (Global-Summit Library) ---
  viral_entry_uncoating: {
    required_primitives: [
      "viral_capsid",
      "viral_spike_proteins",
      "host_receptor",
      "virus_host_fusion_interface",
      "endocytic_vesicle"
    ],
    required_relations: [
      "viral_spike_proteins -> binds_to -> host_receptor",
      "virus_host_fusion_interface -> mediates -> endocytic_vesicle"
    ]
  },
  bacterial_biofilm_formation: {
    required_primitives: [
      "peptidoglycan_mesh",
      "biofilm_matrix",
      "diffusion_barrier_field"
    ],
    required_relations: [
      "biofilm_matrix -> creates -> diffusion_barrier_field"
    ]
  },
  antibiotic_resistance_efflux: {
    required_primitives: [
      "efflux_pump",
      "antibiotic_particle"
    ],
    required_relations: [
      "efflux_pump -> expels -> antibiotic_particle"
    ]
  },

  // --- ENDOCRINOLOGY (Metabolic MoA Library) ---
  insulin_glucose_homeostasis: {
    required_primitives: [
      "endocrine_gland_node",
      "hormone_diffusion_field",
      "hormone_receptor_binding",
      "transporter_translocation"
    ],
    required_relations: [
      "endocrine_gland_node -> secretes -> hormone_diffusion_field",
      "hormone_diffusion_field -> triggers -> hormone_receptor_binding",
      "hormone_receptor_binding -> activates -> transporter_translocation"
    ]
  },
  insulin_resistance_pathophysiology: {
    required_primitives: [
      "hormone_diffusion_field",
      "receptor_resistance_state",
      "hormone_excess_gradient"
    ],
    required_relations: [
      "hormone_excess_gradient -> fails_to_activate -> receptor_resistance_state"
    ]
  },
  thyroid_axis_feedback_loop: {
    required_primitives: [
      "endocrine_gland_node",
      "negative_feedback_loop",
      "hormone_diffusion_field"
    ],
    required_relations: [
      "hormone_diffusion_field -> triggers -> negative_feedback_loop",
      "negative_feedback_loop -> suppresses -> endocrine_gland_node"
    ]
  },

  // --- CLINICAL EVIDENCE (Trial-Results Library) ---
  forest_plot_meta_analysis: {
    required_primitives: [
      "confidence_interval_bar",
      "effect_size_marker",
      "null_reference_line",
      "forest_plot_diamond"
    ],
    required_relations: [
      "individual_study_estimates -> plotted_relative_to -> null_reference_line",
      "study_weights -> determine -> effect_size_marker_scaling",
      "all_studies -> synthesized_into -> forest_plot_diamond"
    ]
  },
  kaplan_meier_survival_curve: {
    required_primitives: [
      "km_step_curve",
      "censor_tick",
      "confidence_band",
      "hazard_ratio_label"
    ],
    required_relations: [
      "treatment_vs_control -> mapped_as -> km_step_curve",
      "statistical_uncertainty -> represented_by -> confidence_band"
    ]
  },
  hazard_ratio_summary: {
    required_primitives: [
      "effect_size_marker",
      "confidence_interval_bar",
      "null_reference_line",
      "p_value_annotation"
    ],
    required_relations: [
      "point_estimate -> distance_from -> null_reference_line",
      "ci_range -> determines_significance -> crossing_null"
    ]
  },

  // --- DIAGNOSTICS (Imaging & Pathology Library) ---
  ct_anatomical_segmentation: {
    required_primitives: [
      "hounsfield_unit_field",
      "iso_intensity_region",
      "imaging_slice_plane"
    ],
    required_relations: [
      "voxel_intensity -> mapped_to -> hounsfield_unit_field",
      "imaging_slice_plane -> captures -> iso_intensity_region"
    ]
  },
  mri_t2_hyperintensity: {
    required_primitives: [
      "t2_hyperintensity_zone",
      "imaging_slice_plane"
    ],
    required_relations: [
      "pathology_accumulation -> visible_as -> t2_hyperintensity_zone"
    ]
  },
  histopathology_he_stain: {
    required_primitives: [
      "he_stain_palette",
      "histology_section",
      "pleomorphic_nuclei"
    ],
    required_relations: [
      "histology_section -> stained_with -> he_stain_palette"
    ]
  },

  // --- MULTI-MODAL FUSION (Mechanism–Imaging–Pathology Fusion v1.0) ---
  multi_modal_clinical_fusion: {
    required_primitives: [
      "ligand_antibody",
      "hounsfield_unit_field",
      "radiological_ghost_overlay",
      "he_stain_palette",
      "pleomorphic_nuclei",
      "disorganized_tissue_architecture"
    ],
    required_relations: [
      "PANEL_A: drug_binding -> inhibits -> cellular_signaling",
      "PANEL_B: ct_scan_pre_post -> shows -> lesion_reduction_on_hounsfield_field",
      "PANEL_C: biopsy_pre_post -> confirms -> histologic_normalization_on_he_stain",
      "LINKAGE: molecular_A -> correlates_to -> imaging_B -> confirmed_by -> pathology_C"
    ]
  },

  // --- META-SYNTHESIS (Bench-to-Bedside Scale Logic v2.0 - FULL EVIDENCE PACK) ---
  bench_to_bedside_synthesis: {
    required_primitives: [
      "protein_leak_flux",
      "receptor_internalization",
      "signaling_field_gradient",
      "km_step_curve",
      "hounsfield_unit_field",
      "he_stain_palette"
    ],
    required_relations: [
      "PANEL_A (Molecular): ligand_antibody -> binding_interface -> target_receptor",
      "PANEL_B (Cellular): receptor_activation -> modulates -> signaling_field_gradient",
      "PANEL_C (Diagnostic): imaging_focus -> visible_on -> hounsfield_unit_field",
      "PANEL_D (Evidence): cellular_state_change -> translates_into -> km_step_curve",
      "CAUSALITY: A_molecular -> drives_B_cellular -> proves_C_diagnostic -> proves_D_evidence"
    ]
  }
} as const;

export type MedicalMechanismTemplateId = keyof typeof MEDICAL_MECHANISM_TEMPLATES;
