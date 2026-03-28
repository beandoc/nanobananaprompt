import { z } from "zod";

// ============================================================
// SOVEREIGN 18.0: COUPLED COGNITIVE NARRATIVE SCHEMA
// Designed for System-Level NEJM Visual Abstracts.
// ============================================================

export const infographicSchema = {
  type: "object",
  properties: {
    // ── NARRATIVE ANCHORS ──
    title: { type: "string", description: "Verbatim title (Max 15 words)." },
    journal_style: { enum: ["NEJM_visual_abstract", "Nature_Methodology"] },
    citation: {
      type: "object",
      properties: {
        authors_short: { type: "string" },
        doi: { type: "string" }
      }
    },
    
    // ── THE PRIMARY ANCHOR ──
    primary_endpoint_headline: { 
      type: "object",
      description: "Embedded headline for the outcome panel.",
      properties: {
        text: { type: "string", description: "e.g. Death or Renal-Replacement Therapy at Day 90" }
      },
      required: ["text"]
    },

    // ── COLOR SYSTEM ──
    color_system: {
      type: "object",
      properties: {
        accent: { type: "string", description: "SINGLE ACCENT ONLY. No secondary colors." },
        neutral_light: { type: "string", default: "#F1F5F9" }
      }
    },

    // ── LAYOUT ENGINE ──
    canvas: {
      type: "object",
      properties: {
        grid_type: { enum: ["horizontal_triptych", "centered_pivot"] },
        column_width_ratio: { type: "array", items: { type: "number" }, description: "[0.32, 0.34, 0.34]" }
      }
    },

    // ── PANEL-DRIVEN NARRATIVE ──
    panels: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          position: { enum: ["left", "center", "right"] },
          header: { type: "string", description: "UPPERCASE SEMANTIC ANCHOR (e.g. PATIENTS, TREATMENT)" },
          layout: { enum: ["vertical_stack", "horizontal_equal"] },
          content: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { enum: ["icon_stat", "allocation_block", "coupled_outcome", "subtext"] },
                // icon_stat props
                icon: { type: "string" },
                value: { type: "string" },
                label: { type: "string" },
                // coupled_outcome props
                primary: { type: "boolean", description: "Elevate visual hierarchy." },
                outcome_value: { type: "string" },
                sub_stat: { type: "string", description: "IQR or raw count" },
                visual_type: { enum: ["proportional_bars", "trend_arrow", "none"] },
                scale: { type: "string", description: "e.g. 0_to_40_percent" }
              }
            }
          }
        }
      }
    },

    // ── CLINICAL VERDICT ──
    interpretation_belt: {
      type: "object",
      properties: {
        text: { type: "string", description: "Effect estimate summary (Diff, CI, P-value)" }
      }
    },
    conclusion_banner: {
      type: "object",
      properties: {
        text: { type: "string", description: "NEUTRAL INFERENCE ONLY. Max 10 words." }
      },
      required: ["text"]
    },

    rendering_rules: {
      type: "object",
      properties: {
        symmetry_enforced: { type: "boolean", default: true },
        max_words_per_panel: { type: "number", default: 10 }
      }
    },

    // ── DIFFUSION AESTHETIC DIRECTIVES (To fix Gemini vs DALL-E Gap) ──
    diffusion_aesthetic: {
      type: "object",
      description: "Explicit prompts to force high-fidelity 3D scholarly aesthetics in diffusion models (Nano Banana/Gemini).",
      properties: {
        global_style: { 
          type: "string", 
          description: "e.g., 'Hyper-realistic scholarly medical illustration, print-grade CMYK, macroscopic textures'" 
        },
        iconography_style: { 
          type: "string", 
          description: "e.g., 'Detailed 3D renders with subsurface scattering, fluid condensation, soft studio lighting. STRICTLY NO FLAT VECTOR UI.'"
        },
        negative_prompt: { 
          type: "string", 
          description: "e.g., 'Flat UI, vector, clipart, corporate dashboard, wireframe, app mockups'" 
        }
      },
      required: ["global_style", "iconography_style", "negative_prompt"]
    }
  },
  required: ["title", "panels", "conclusion_banner", "diffusion_aesthetic"]
};

