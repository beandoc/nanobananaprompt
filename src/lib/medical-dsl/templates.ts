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
    required_relations: [
      "rbc_sickled_crescent -> adheres_to -> endothelial_lining_cell_chain",
      "rbc_adhesion_cluster -> obstructs -> lumen_tubular_corridor"
    ]
  },

  // --- NEPHROLOGY (e.g. Glomerular Filtration Barrier Damage MoA) ---
  renal_filtration_failure: {
    required_primitives: [
      "fenestrated_endothelium",
      "glomerular_basement_membrane",
      "podocyte_foot_process_mesh",
      "foot_process_effacement",
      "protein_leak_flux"
    ],
    required_relations: [
      "podocyte_foot_process_mesh -> transforms_into -> foot_process_effacement",
      "foot_process_effacement -> increases_permeability_to -> protein_leak_flux",
      "protein_leak_flux -> passes_through -> glomerular_basement_membrane"
    ]
  },

  // --- IMMUNOLOGY (e.g. Cytokine Storm Signaling Field MoA) ---
  cytokine_signaling_cascade: {
    required_primitives: [
      "cytokine_cloud",
      "signaling_field_gradient",
      "jak_stat_cascade",
      "receptor_internalization"
    ],
    required_relations: [
      "cytokine_cloud -> creates -> signaling_field_gradient",
      "signaling_field_gradient -> activates -> receptor_internalization",
      "receptor_internalization -> triggers -> jak_stat_cascade"
    ]
  },

  // --- CARDIOLOGY (e.g. Cardiac Action Potential Wavefront MoA) ---
  cardiac_electrophysiology: {
    required_primitives: [
      "ion_channel_cluster",
      "electrical_wavefront",
      "reentry_circuit",
      "sarcomere_contraction_vector"
    ],
    required_relations: [
      "ion_channel_cluster -> triggers -> electrical_wavefront",
      "electrical_wavefront -> propagates_into -> reentry_circuit",
      "reentry_circuit -> causes -> sarcomere_contraction_vector"
    ]
  },

  // --- NEURODEGENERATION (e.g. Alzheimer's Pathology - Deep Causality) ---
  alzheimers_neurodegeneration: {
    required_primitives: [
      "cortical_laminar_bands",
      "neuron_full_structure",
      "amyloid_plaque",
      "tau_neurofibrillary_tangle",
      "synaptic_loss_pattern",
      "microglial_cell",
      "cytokine_diffusion_field"
    ],
    required_relations: [
      "amyloid_plaque -> triggers_activation_of -> microglial_cell",
      "microglial_cell -> releases -> cytokine_diffusion_field",
      "tau_neurofibrillary_tangle -> causes_apoptosis_in -> neuron_full_structure",
      "neuron_full_structure -> leading_to -> synaptic_loss_pattern"
    ]
  },

  // --- ONCOLOGY (e.g. PD-L1 Immune Checkpoint Inhibition MoA) ---
  oncology_checkpoint_inhibition: {
    required_primitives: [
      "tumor_cell",
      "cytotoxic_t_cell",
      "pdl1_ligand",
      "pd1_receptor",
      "pd1_pdl1_binding",
      "tcr_mhc_binding_complex",
      "exhausted_t_cell"
    ],
    required_relations: [
      "tumor_cell -> presents -> tcr_mhc_binding_complex",
      "pdl1_ligand -> binds_to -> pd1_receptor",
      "pd1_pdl1_binding -> triggers -> checkpoint_inhibition_signal",
      "checkpoint_inhibition_signal -> causes -> t_cell_signal_attenuation",
      "t_cell_signal_attenuation -> inhibits -> cytotoxic_release"
    ]
  }
} as const;

export type MedicalMechanismTemplateId = keyof typeof MEDICAL_MECHANISM_TEMPLATES;
