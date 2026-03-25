import { z } from "zod";

export const infographicSchema = {
  type: "object",
  properties: {
    infographic_title: { type: "string" },
    scientific_subject: { type: "string" },
    aspect_ratio: { enum: ["portrait", "landscape"] },
    aesthetic_style: { 
      enum: ["NEJM-Editorial", "BioRender-Technical", "Modern-Minimalist", "Painterly-Editorial", "Watercolor-Field-Notes", "Organic-Collage"] 
    },
    color_palette: {
      type: "object",
      properties: {
        primary: { type: "string" },
        secondary: { type: "string" },
        accent: { type: "string" },
        background: { type: "string" }
      }
    },
    layout_structure: { 
      enum: ["central-hero-diagram", "organic-flow", "hub-and-spoke", "anatomical-overlay"] 
    },
    central_visual_metaphor: {
      type: "object",
      properties: {
        concept: { type: "string", description: "The central unifying image (e.g. 'A divided kidney plate', 'A balanced scale')" },
        style: { type: "string" },
        rendering_detail: { type: "string" }
      },
      required: ["concept"]
    },
    sections: {
      type: "array",
      items: {
        type: "object",
        properties: {
          section_id: { type: "number" },
          headline: { type: "string" },
          visual_concept: { 
            type: "string", 
            description: "How this item is physically integrated into the central metaphor (e.g. 'Watercolor garlic bulbs taped onto the top-left of the plate like a sticker collage')" 
          },
          key_data_points: { type: "array", items: { type: "string" } },
          iconography: { type: "array", items: { type: "string" } },
          spatial_anchor: { enum: ["top-left", "top-right", "bottom-left", "bottom-right", "center-left", "center-right", "floating-overlap"] }
        },
        required: ["section_id", "headline", "visual_concept", "spatial_anchor"]
      }
    },
    directional_flow: {
      type: "array",
      items: {
        type: "object",
        properties: {
          from_section_id: { type: "number" },
          to_section_id: { type: "number" },
          relationship_type: { enum: ["leads_to", "inhibits", "enhances", "compares_to"] }
        }
      }
    },
    negative_prompt: { type: "string" }
  },
  required: [
    "infographic_title", "scientific_subject", "aspect_ratio", "aesthetic_style", 
    "central_visual_metaphor", "sections", "negative_prompt"
  ]
};
