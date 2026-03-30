import { z } from "zod";

// ============================================================
// SOVEREIGN 18.0: COUPLED COGNITIVE NARRATIVE SCHEMA
// Designed for System-Level NEJM Visual Abstracts.
// ============================================================

export const infographicSchema = {
  type: "object",
  description: "SOVEREIGN v30 FINAL - Visual Abstract Scholarly Plate Protocol",
  properties: {
    // --- LAYER 1: METADATA ---
    metadata: {
      type: "object",
      properties: {
        title: { type: "string", description: "Verbatim title (Max 15 words)." },
        subject: { type: "string", description: "Primary clinical trial / pathophysiologic focus." },
        journal_standard: { enum: ["NEJM_visual_abstract", "Nature_Methodology", "Lancet_Minimalist"] },
        citation: {
          type: "object",
          properties: {
            authors_short: { type: "string" },
            doi: { type: "string" }
          }
        }
      },
      required: ["title", "journal_standard"]
    },

    // --- LAYER 2: MEDICAL CONTENT (The trial data) ---
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

    // --- LAYER 3: VISUAL SPECIFICATION (The layout) ---
    visual_specification: {
      type: "object",
      properties: {
        canvas: {
          type: "object",
          properties: {
            width: { type: "number", default: 680 },
            height: { type: "number", default: 840 },
            background: { type: "string", default: "#faf9f7" }
          }
        },
        panels: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              header: { type: "string" },
              // ★ DIFFUSION SIGNAL — describe the panel purpose in natural language
              semantic_role: { 
                type: "string", 
                description: "★ DIFFUSION SIGNAL: Natural language description of what this panel shows (e.g. 'Flowchart of patient allocation showing randomization into three arms', 'Line graph with error bars showing primary endpoint mortality over 24 months')."
              },
              bounds: {
                type: "object",
                properties: {
                  x: { type: "number" },
                  y: { type: "number" },
                  width: { type: "number" },
                  height: { type: "number" }
                }
              },
              content_items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { enum: ["icon_stat", "allocation_block", "coupled_outcome", "subtext"] },
                    icon: { type: "string" },
                    value: { type: "string" },
                    label: { type: "string" },
                    primary: { type: "boolean" },
                    outcome_value: { type: "string" },
                    sub_stat: { type: "string" },
                    visual_type: { enum: ["proportional_bars", "trend_arrow", "none"] },
                    position: {
                      type: "object",
                      properties: {
                        x: { type: "number" },
                        y: { type: "number" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        color_palette: {
          type: "object",
          properties: {
            accent: { type: "string", description: "Primary scholarly accent (e.g. #0A1F44)" },
            // ★ DIFFUSION SIGNAL — translate hex to natural language
            accent_semantic_name: { type: "string", description: "Natural language name for accent color (e.g. 'Deep Scholarly Navy')" },
            outcome: { type: "string" },
            neutral: { type: "string" }
          }
        }
      },
      required: ["canvas", "panels", "color_palette"]
    },

    // --- LAYER 4: RENDERING INSTRUCTIONS ---
    rendering_instructions: {
      type: "object",
      properties: {
        stroke_specifications: {
          type: "object",
          properties: {
            default_width: { type: "number", default: 0.5 },
            emphasis_width: { type: "number", default: 1.5 }
          }
        },
        diffusion_aesthetic: {
          type: "object",
          properties: {
            global_style: { type: "string" },
            iconography_style: { type: "string" },
            negative_prompt: { type: "string" }
          },
          required: ["global_style", "iconography_style", "negative_prompt"]
        }
      },
      required: ["diffusion_aesthetic"]
    },

    // --- ★ LAYER 5: DIFFUSION SYNTHESIS (MANDATORY) ---
    // This layer distills the entire trial data and layout into a coherent NATURAL LANGUAGE prompt.
    // It is the ONLY field used by diffusion models (Flux/Imagen/Midjourney).
    diffusion_synthesis: {
      type: "object",
      properties: {
        master_prompt: { 
          type: "string", 
          description: "★ DIFFUSION SIGNAL: 150-200 word summary of the scholarly plate. Describe the heavy parchment background, the structured panels, the clinical subjects (Indian heritage), and the overarching trial conclusion. NO HEX CODES, NO PIXEL COORDINATES." 
        },
        composition_summary: {
          type: "string",
          description: "Summary of spatial layout: which panels are prominent and how the eye should flow from Interventions to Conclusion."
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
      required: ["master_prompt", "style_descriptors", "color_language", "negative_prompt"]
    }
  },
  required: ["metadata", "medical_content", "visual_specification", "rendering_instructions", "diffusion_synthesis"]
};


