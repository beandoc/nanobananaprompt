---
name: nanobanana
description: Convert creative briefs and medical descriptions into structured JSON for high-fidelity generation.
---

# Nano Banana & Medical Illustrator Skill

Purpose:
Convert plain-text ad creative briefs or scientific medical descriptions into structured JSON prompts that generate hyper-realistic, on-brand ads (Nano Banana 2) or high-impact medical illustrations (Nature/NEJM standard).

## JSON Prompt Schema
Always structure prompts as JSON with these fields:

### Lighting Parameters
- `soft-natural-daylight`: Soft diffused daylight. Lifestyle and UGC.
- `golden-hour`: Warm directional sunlight. Outdoor lifestyle.
- `studio-softbox`: Controlled, even lighting. Product hero shots.
- `bathroom-vanity`: Warm overhead mirror reflection. Skincare and beauty.
- `dramatic-rim`: Hard backlight edge. Premium and moody.

### Camera Parameters
- `lens`: `24mm`, `35mm`, `50mm`, `85mm`, `100mm-macro`
- `angle`: `eye-level`, `low-angle`, `high-angle`, `overhead-flat-lay`
- `framing`: `extreme-close-up`, `close-up`, `medium-close-up`, `medium-shot`, `full-body`
- `depth_of_field`: `shallow` (blurred background), `deep` (everything in focus)
- `color_grading`: `warm`, `cool`, `muted`, `vibrant`

### Platform-Specific Defaults
- Facebook/Instagram Feed: 4:5 aspect ratio
- Stories/Reels: 9:16 aspect ratio
- Landing page Hero: 16:9 aspect ratio

### Medical Illustrator Mode (Scientific Journal Standard)
- **Subject Precision**: Anatomical structures (e.g., "Podocytes", "Glomerular Basement Membrane").
- **Styles**: `photorealistic-electron-microscopy`, `3d-medical-render`, `histology-stained`.
- **Journals**: `Nature-modern`, `NEJM-classic`, `Lancet-descriptive`.

## Skill Rules
1. ALWAYS use JSON. Never plain-text prompts. Use Native Structured Outputs where possible.
2. For Ad UGC-style, mention "shot on iPhone", "slight motion blur", "imperfect lighting".
3. For Medical-style, prioritize scientific integrity and textural definition (fibrous, aqueous, granulated).
4. For text/labels on products, spell out EXACTLY what it should say in quotes.
5. ALWAYS save prompts as .json files in `prompts/` (Ad) or `medical_prompts/` (Medical).
6. ALWAYS save images in matching `images/` or `medical_images/` subfolder.
7. Name files consistently: `[mode]-[subject]-[variation].json`.

## Usage Example
If the user says: "Generate studio product shots of this protein powder tub. White background, harsh shadows. Need it for carousel and 4:5 for feed."

Action: Generate JSON with `studio-softbox` lighting, `85mm` lens, and `4:5` aspect ratio. Save to `prompts/protein-studio-01.json`.
