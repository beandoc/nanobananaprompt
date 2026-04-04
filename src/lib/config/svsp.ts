export const SVSP_V1 = {
  style_id: "SURGICAL_VISUALIZATION",
  domain: "clinical_imaging",
  
  imaging_system: {
    modality: "stereoscopic_endoscopy",
    available_lenses: ["0_degree_scope", "30_degree_scope"],
    fov: "wide",
    depth_of_field: "moderate",
    resolution: ["1080p", "4K"],
  },

  lighting: {
    illumination: "fiber_optic_uniform",
    shadow_profile: "minimal_soft",
    color_temp: "4500K",
    contrast: "clinical_balanced",
    specular: "controlled_highlights_on_wet_tissue"
  },

  tissue_rendering: {
    fat: "yellow",
    muscle: "reddish_brown",
    fascia: "translucent_whitish",
    vascular: "dark_red_blue",
    surface: "reflective_due_to_irrigation",
    deformation: "elastic_realistic"
  },

  negative_constraints: [
    "cinematic_lighting",
    "anamorphic_lens",
    "bokeh_effects",
    "dramatic_shadows",
    "chiaroscuro",
    "anime_style",
    "hyper_glow",
    "fantasy_colors"
  ],

  master_template: `
    A high-definition stereoscopic endoscopic view of a [SUBJECT] within the [ANATOMY]. 
    The scene is illuminated by uniform fiber-optic lighting, providing clear visualization of anatomical planes with minimal shadowing. 
    Moist, glistening tissue surfaces reflect controlled highlights from irrigation fluid. 
    Tissue behavior follows realistic elastic deformation under surgical traction. 
    Field remains clean and clinically accurate, prioritizing anatomical clarity over stylistic effects. 
    No cinematic lighting, no exaggerated depth of field, and no non-physiological coloration.
  `
};
