/**
 * MEDICAL_PRIMITIVES - Common Icon Taxonomy v2.0 (CIT-100+)
 * 
 * A Universal Visual Vocabulary for Biomedical Systems.
 * Organized into 13 Categorical Pillars for Deterministic Assembly.
 */
export const MEDICAL_PRIMITIVES: any = {
  // 1. CELLULAR & SUBCELLULAR
  CELLULAR: [
    "cell_generic", "cell_epithelial", "cell_immune", "cell_neuron", "cell_muscle", "cell_tumor", "cell_stem",
    "nucleus", "nucleolus", "mitochondria", "ribosome", "endoplasmic_reticulum", "golgi_apparatus",
    "lysosome", "cell_membrane", "membrane_channel", "vesicle", "exosome"
  ],

  // 2. MOLECULAR & SIGNALING
  MOLECULAR: [
    "ligand_small", "ligand_protein", "antibody_Y_shape", "enzyme_blob", "receptor_membrane", "gpcr_receptor",
    "signal_arrow", "signal_inhibition_T", "phosphorylation_marker", "dna_double_helix", "mrna_linear",
    "secondary_messenger_dot", "gene_expression_arrow"
  ],

  // 3. FLOW, FIELD & TRANSPORT
  FLOW_PHYSICS: [
    "diffusion_cloud", "gradient_radial", "flow_streamlines_parallel", "flow_streamlines_curved",
    "flow_turbulence_swirl", "vector_field_gradient", "active_transport_arrow", "blood_flow_arrow", "lymphatic_flow"
  ],

  // 4. TISSUE & ORGAN
  ANATOMY: [
    "tissue_block_epithelium", "organ_heart", "organ_lung", "organ_kidney", "organ_liver", "organ_brain",
    "vessel_artery", "vessel_vein", "capillary_network", "alveoli_cluster", "glomerulus_mesh", "nephron_unit"
  ],

  // 5. MECHANICAL & DEVICE
  DEVICES: [
    "catheter_tube", "guidewire", "stent_mesh", "prosthetic_valve", "surgical_scalpel", "robotic_arm",
    "dialysis_filter", "implant_plate", "joint_prosthesis", "implant_screw"
  ],

  // 6. PATHOGEN & IMMUNE
  PATHOGENS_IMMUNE: [
    "virus_spherical", "virus_enveloped", "virus_spike", "bacteria_rod", "bacteria_coccus", "biofilm_matrix",
    "t_cell", "b_cell", "macrophage", "antigen_epitope", "mhc_complex", "cytokine_particle"
  ],

  // 7. GENETIC & SYNTHETIC BIO
  SYNTH_BIO: [
    "dna_double_helix", "crispr_complex", "cas9_scissors", "mrna_strand", "lipid_nanoparticle",
    "viral_vector", "car_t_cell", "bite_antibody"
  ],

  // 8. IMAGING & RADIOLOGY
  RADIOLOGY: [
    "ct_slice", "mri_slice", "ultrasound_probe", "grayscale_hu_map", "hyperintensity_zone",
    "segmentation_overlay", "doppler_flow_red_blue", "xray_projection"
  ],

  // 9. HISTOPATHOLOGY
  PATHOLOGY: [
    "he_tissue_section", "nuclei_purple", "cytoplasm_pink", "pleomorphic_nuclei", "mitotic_figure",
    "normal_architecture", "fibrosis_collagen", "necrosis_zone"
  ],

  // 10. VASCULAR & HEMODYNAMIC
  HEMODYNAMICS: [
    "lumen_tube", "plaque_eccentric", "plaque_calcified", "thrombus_mesh", "flow_laminar",
    "flow_turbulent", "shear_stress_heatmap", "aneurysm_dilation", "stenosis_narrowing"
  ],

  // 11. ORTHOPEDIC & BIOMECHANICS
  ORTHO_PHYSICS: [
    "bone_cortical", "bone_trabecular", "fracture_line", "load_vector_arrow", "stress_heatmap",
    "joint_space", "cartilage_layer", "bone_remodeling", "callus_formation"
  ],

  // 12. DATA VISUALIZATION
  DATA_VIZ: [
    "axis_labels", "data_point_circle", "line_curve", "step_curve_km", "confidence_interval_bar",
    "error_bar", "confidence_band", "forest_plot_diamond", "p_value_label", "hazard_ratio_marker"
  ],

  // 13. UI / ANNOTATION / META
  ANNOTATION: [
    "zoom_in_connector", "zoom_out_connector", "highlight_ring", "comparison_bracket",
    "before_after_state", "arrow_transition", "timeline_axis"
  ]
};
