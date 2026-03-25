import { z } from "zod";

// ============================================================
// SOVEREIGN INFOGRAPHIC SCHEMA — NotebookLM Gold Standard
// Designed for magazine-quality, editorial-dense output.
// ============================================================

export const infographicSchema = {
  type: "object",
  properties: {
    infographic_title: { type: "string", description: "A powerful, punchy headline — max 8 words. Should feel like a Nature or Time magazine cover." },
    subtitle: { type: "string", description: "A 10-20 word explanatory subtitle that frames the scientific argument." },
    scientific_subject: { type: "string" },
    edition_tag: { type: "string", description: "A short editorial tag (e.g. 'Kidney Health Special', 'Neuroscience Deep Dive')" },
    aspect_ratio: { enum: ["portrait", "landscape"] },
    aesthetic_style: {
      enum: ["NEJM-Editorial", "BioRender-Technical", "Modern-Minimalist", "Painterly-Editorial", "Watercolor-Field-Notes", "Organic-Collage"]
    },
    color_palette: {
      type: "object",
      properties: {
        primary: { type: "string", description: "Hex code. The dominant brand color for headers and hero zones." },
        secondary: { type: "string", description: "Hex code. Support color for section backgrounds." },
        accent: { type: "string", description: "Hex code. High-contrast accent for stats and callouts." },
        background: { type: "string", description: "Hex code. The page background." },
        zone_colors: {
          type: "array",
          items: { type: "string" },
          description: "An array of 4-6 distinct hex codes, one per section, for color-coded zones."
        }
      }
    },
    layout_structure: {
      enum: ["central-hero-diagram", "organic-flow", "hub-and-spoke", "anatomical-overlay", "editorial-magazine", "tiered-narrative"]
    },
    central_visual_metaphor: {
      type: "object",
      properties: {
        concept: { type: "string", description: "The central unifying image (e.g. 'A cross-sectioned kidney divided into dietary zones', 'A silhouette of a brain with neural pathways as rivers')" },
        style: { type: "string" },
        rendering_detail: { type: "string", description: "Exhaustive visual description: materials, textures, lighting, scale." },
        dominant_element: { type: "string", description: "The single most visually arresting element (e.g. 'A blazing sun representing inflammation')" },
        hero_icon_id: { type: "string", description: "The ID of a vector icon to render (Heart, Brain, Wind, Stethoscope, Microscope, Activity, Shield, Zap, Leaf, Sun, Droplets, FlaskConical, Thermometer, BrainCircuit, Dna, Bone, Eye)." }
      },
      required: ["concept", "rendering_detail", "dominant_element", "hero_icon_id"]
    },
    global_stat_callout: {
      type: "object",
      description: "A single, dominant, poster-sized statistic that anchors the entire infographic (e.g. '10M+ Indians affected').",
      properties: {
        stat: { type: "string", description: "The number/percentage. MUST be big and bold (e.g. '37%', '10 Billion', '3x faster')" },
        label: { type: "string", description: "One-line context for the stat." },
        source: { type: "string", description: "Scientific source or study attribution." }
      },
      required: ["stat", "label"]
    },
    pull_quotes: {
      type: "array",
      description: "2-3 short, impactful quoted soundbites or key findings to scatter across the layout.",
      items: {
        type: "object",
        properties: {
          quote: { type: "string", description: "A punchy, 10-15 word quote from research or expert consensus." },
          attribution: { type: "string", description: "Journal or expert source (e.g. 'NEJM, 2023')" }
        },
        required: ["quote"]
      }
    },
    sections: {
      type: "array",
      description: "The core content blocks. Each section is a color-coded zone in the layout.",
      items: {
        type: "object",
        properties: {
          section_id: { type: "number" },
          headline: { type: "string", description: "Section title — short and punchy, max 5 words." },
          color_zone: { type: "string", description: "The hex color for this section's background zone." },
          callout_type: {
            enum: ["stat-hero", "comparison-table", "process-steps", "evidence-list", "myth-vs-fact", "mechanism-explainer", "risk-spectrum"],
            description: "The visual archetype that best represents this section's data."
          },
          visual_concept: {
            type: "string",
            description: "How this section is PHYSICALLY INTEGRATED into the central metaphor. Describe it as part of the hero diagram."
          },
          detailed_narrative: {
            type: "string",
            description: "The 'Why' and 'How' — the educational narrative with scientific reasoning. Min 2 sentences."
          },
          stat_highlight: {
            type: "object",
            description: "The single most important number for this section.",
            properties: {
              value: { type: "string", description: "The number (e.g. '↓40%', '3x', '850mg')" },
              label: { type: "string", description: "One-line context for the value." }
            }
          },
          annotations: {
            type: "array",
            items: { type: "string" },
            description: "3-5 micro-annotations — short explanatory bullets with benefit/reasoning."
          },
          key_data_points: { type: "array", items: { type: "string" } },
          comparison: {
            type: "object",
            description: "A head-to-head comparison (Before/After, Myth/Fact, Western/Optimal).",
            properties: {
              left_label: { type: "string" },
              left_value: { type: "string" },
              right_label: { type: "string" },
              right_value: { type: "string" }
            }
          },
          process_steps: {
            type: "array",
            description: "Numbered steps for a mechanism or protocol.",
            items: { type: "string" }
          },
          iconography: { type: "array", items: { type: "string" } },
          spatial_anchor: {
            enum: ["top-left", "top-right", "bottom-left", "bottom-right", "center-left", "center-right", "floating-overlap", "full-width-band"]
          },
          visual_weight: {
            enum: ["hero", "major", "minor"],
            description: "Controls the rendered size. 'hero' = full-width, 'major' = half-width, 'minor' = 1/3 width."
          },
          x_percent: { type: "number", description: "Coordinate (0-100) for pinning this section to the central hero visual horizontal axis." },
          y_percent: { type: "number", description: "Coordinate (0-100) for pinning this section to the central hero visual vertical axis." }
        },
        required: ["section_id", "headline", "visual_concept", "spatial_anchor", "visual_weight", "callout_type", "detailed_narrative", "x_percent", "y_percent"]
      }
    },
    directional_flow: {
      type: "array",
      items: {
        type: "object",
        properties: {
          from_section_id: { type: "number" },
          to_section_id: { type: "number" },
          relationship_type: { enum: ["leads_to", "inhibits", "enhances", "compares_to", "causes", "prevents"] },
          flow_label: { type: "string", description: "A short 2-4 word label for the arrow (e.g. 'reduces inflammation')" }
        }
      }
    },
    footer_methodology: { type: "string", description: "A brief 1-2 sentence methodology note or key references to establish scientific credibility." },
    negative_prompt: { type: "string" }
  },
  required: [
    "infographic_title", "subtitle", "scientific_subject", "aspect_ratio", "aesthetic_style",
    "central_visual_metaphor", "global_stat_callout", "sections", "pull_quotes", "negative_prompt"
  ]
};
