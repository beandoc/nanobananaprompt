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

  // --- NEPHROLOGY (e.g. Nephrotic Syndrome / FSGS) ---
  nephrotic_syndrome_damage: {
    required_primitives: [
      "glomerulus_tuft",
      "filtration_barrier",
      "podocyte_cell",
      "glomerulosclerosis_lesion",
      "protein_leak_stream",
      "filtration_gradient_field"
    ],
    required_relations: [
      "glomerulosclerosis_lesion -> collapses -> glomerulus_tuft",
      "podocyte_cell -> foot_process_effacement_at -> filtration_barrier",
      "filtration_barrier -> permits_leakage_of -> protein_leak_stream",
      "protein_leak_stream -> enters -> nephron_tubule_chain"
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

  // --- ONCOLOGY (e.g. PD-L1 Immune Checkpoint MoA) ---
  oncology_immune_evasion: {
    required_primitives: [
      "tumor_microenvironment_stroma",
      "angiogenic_vessel_sprouting",
      "microglial_activation",
      "macrophage_phagocytosis"
    ],
    required_relations: [
      "tumor_microenvironment_stroma -> suppresses -> microglial_activation",
      "angiogenic_vessel_sprouting -> sustains -> tumor_microenvironment_stroma"
    ]
  }
} as const;

export type MedicalMechanismTemplateId = keyof typeof MEDICAL_MECHANISM_TEMPLATES;
