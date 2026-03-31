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

  // --- NEURODEGENERATION (e.g. Alzheimer's Disease) ---
  alzheimers_pathophysiology: {
    required_primitives: [
      "laminar_cortex_band",
      "neuron_with_dendrites",
      "synaptic_bouton_cluster",
      "amyloid_extracellular_plaque",
      "intracellular_tau_tangle",
      "microglial_activation"
    ],
    required_relations: [
      "amyloid_extracellular_plaque -> activates -> microglial_activation",
      "microglial_activation -> damages -> synaptic_bouton_cluster",
      "intracellular_tau_tangle -> occupies -> neuron_with_dendrites"
    ]
  },

  // --- CARDIOLOGY (e.g. Myocardial Infarction) ---
  myocardial_infarction: {
    required_primitives: [
      "lumen_tubular_corridor",
      "thrombotic_occlusion_cluster",
      "cardiomyocytes_radial_alignment",
      "endothelial_lining_cell_chain"
    ],
    required_relations: [
      "thrombotic_occlusion_cluster -> blocks -> lumen_tubular_corridor",
      "lumen_tubular_corridor -> causes_ischemia_in -> cardiomyocytes_radial_alignment"
    ]
  },

  // --- ONCOLOGY (e.g. Tumor Angiogenesis) ---
  tumor_angiogenesis: {
    required_primitives: [
      "tumor_microenvironment_stroma",
      "angiogenic_vessel_sprouting",
      "endothelial_lining_cell_chain"
    ],
    required_relations: [
      "tumor_microenvironment_stroma -> triggers -> angiogenic_vessel_sprouting",
      "angiogenic_vessel_sprouting -> invades -> tumor_microenvironment_stroma"
    ]
  },

  // --- PULMONOLOGY (e.g. COPD / Alveolar Damage) ---
  copd_alveolar_damage: {
    required_primitives: [
      "alveolar_sac_cluster",
      "bronchial_smooth_muscle_hypertrophy",
      "mucus_hypersecretion_plug"
    ],
    required_relations: [
      "bronchial_smooth_muscle_hypertrophy -> constricts -> lumen_tubular_corridor",
      "mucus_hypersecretion_plug -> obstructs -> alveolar_sac_cluster"
    ]
  },

  // --- DIABETES (e.g. Insulin Resistance) ---
  insulin_resistance: {
    required_primitives: [
      "pancreatic_islet_beta_cell",
      "insulin_receptor_GLUT4_complex",
      "glucose_molecular_flux"
    ],
    required_relations: [
      "pancreatic_islet_beta_cell -> secretes -> insulin_receptor_GLUT4_complex",
      "glucose_molecular_flux -> failed_uptake_at -> insulin_receptor_GLUT4_complex"
    ]
  },

  // --- ATHEROSCLEROSIS (e.g. Plaque Formation) ---
  atherosclerosis: {
    required_primitives: [
      "multi_layer_vessel_wall",
      "endothelial_lining_cell_chain",
      "foam_cell_cluster",
      "macrophage_phagocytosis"
    ],
    required_relations: [
      "macrophage_phagocytosis -> transforms_into -> foam_cell_cluster",
      "foam_cell_cluster -> accumulates_in -> multi_layer_vessel_wall"
    ]
  },

  // --- HEPATOLOGY (e.g. Portal Hypertension & Cirrhosis) ---
  portal_hypertension_cirrhosis: {
    required_primitives: [
      "liver_lobule_hexagonal_unit",
      "fibrous_septa",
      "regenerative_nodule",
      "sinusoidal_channel",
      "portal_vein_branch",
      "splenic_congestion_zone"
    ],
    required_relations: [
      "fibrous_septa -> surrounds -> regenerative_nodule",
      "portal_vein_branch -> transmits_increased_pressure_to -> sinusoidal_channel",
      "sinusoidal_channel -> creates_resistance_in -> portal_vein_branch",
      "portal_vein_branch -> causes_backlog_in -> splenic_congestion_zone"
    ]
  }
} as const;

export type MedicalMechanismTemplateId = keyof typeof MEDICAL_MECHANISM_TEMPLATES;
