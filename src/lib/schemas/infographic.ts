import { z } from "zod";

// ============================================================
// SOVEREIGN 18.0: COUPLED COGNITIVE NARRATIVE SCHEMA
// Designed for System-Level NEJM Visual Abstracts.
// ============================================================

export const infographicSchema = {
  type: "object",
  description: "SOVEREIGN v30 FINAL - Visual Abstract Scholarly Plate Protocol",
  properties: {
    // --- LAYER 5: DIFFUSION SYNTHESIS ★ (THE HERO LAYER) ---
    diffusion_synthesis: {
      type: "object",
      description: "CORE RENDERING SIGNAL: This layer distills the entire trial data and layout into a coherent NATURAL LANGUAGE prompt. It is the PRIMARY authoritative signal for image generation.",
      properties: {
        master_prompt: { 
          type: "string", 
          description: "HERO FIELD: 150-250 word summary of the scholarly plate. Describe the structured panels, the clinical subjects (South Asian heritage), and the trial conclusion. NO HEX CODES, NO PIXEL COORDINATES." 
        },
        spatial_narrative: {
            type: "string",
            description: "ANATOMICAL COMPOSITION: Describe the layout using spatial language (e.g., 'a wide population sidebar on the left with two outcome panels arranged vertically on the right'). NO COORDINATES."
        },
        render_language: {
            type: "array",
            items: { type: "string" },
            description: "Style-specific rendering cues: e.g. ['high-contrast vector icons', 'academic serifs', 'clean flat UI', 'muted clinical palette']."
        },
        style_descriptors: {
          type: "array",
          items: { type: "string" },
          description: "e.g. ['NEJM Scholarly Aesthetic', 'Muted Gold and Navy', 'Heavy Ink Textures', 'Fine-Grain Parchment']"
        },
        color_language: {
          type: "array",
          items: { type: "string" },
          description: "Natural language descriptions of the color palette (e.g. 'Dusky crimson for intervention arms', 'Creamy parchment for background')."
        },
        negative_prompt: { type: "string" }
      },
      required: ["master_prompt", "spatial_narrative", "render_language", "style_descriptors", "color_language", "negative_prompt"]
    },

    // --- LAYER 1: METADATA ---
    metadata: {
      type: "object",
      properties: {
        title: { type: "string", description: "Verbatim title (Max 15 words)." },
        subject: { type: "string", description: "Primary clinical trial / pathophysiologic focus." },
        journal_standard: { enum: ["CJASN_Blue_Standard", "NEJM_Dense_Slab", "Nature_Flow_WCN"] }
      },
      required: ["title", "journal_standard"]
    },

    // --- LAYER 2: MEDICAL CONTENT ---
    medical_content: {
      type: "object",
      properties: {
        primary_endpoint_headline: { type: "string" },
        cohort: {
          type: "object",
          properties: {
            n: { type: "string" },
            population_description: { type: "string" }
          }
        },
        interventions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              n: { type: "string" },
              outcome_value: { type: "string" },
              sub_stat: { type: "string" }
            }
          }
        },
        interpretation: { type: "string" },
        conclusion: { type: "string" }
      },
      required: ["primary_endpoint_headline", "interventions", "conclusion"]
    },

    // --- LAYER 3: SPATIAL ARCHITECTURE (Language-Based) ---
    visual_specification: {
      type: "object",
      properties: {
        panels: {
          type: "array",
          items: {
            type: "object",
            properties: {
              panel_id: { type: "string" },
              header: { type: "string" },
              semantic_role: { 
                type: "string", 
                description: "Purpose of this panel (e.g. 'Flowchart of patient allocation', 'Line graph of mortality')."
              },
              relative_placement: { type: "string", description: "Where this panel sits in the scene (e.g., 'Top-half hero section', 'Bottom-left quadrant')." },
              content_items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { enum: ["icon_stat", "allocation_block", "coupled_outcome", "subtext"] },
                    icon: { type: "string" },
                    value: { type: "string" },
                    label: { type: "string" },
                    spatial_context: { type: "string", description: "Relative position within the panel (e.g., 'To the right of the icon', 'Centered below the header')." }
                  }
                }
              }
            }
          }
        }
      },
      required: ["panels"]
    }
  },
  required: ["metadata", "medical_content", "visual_specification", "diffusion_synthesis"]
};


