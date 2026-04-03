export const compileMedicalPrompt = (adData: any) => {
  if (adData.diffusion_synthesis && typeof adData.diffusion_synthesis === "object") {
    console.log("[SOVEREIGN COMPILER] Compiling final prompt with Principle-based pruning...");
    let cleanMaster = adData.diffusion_synthesis.master_prompt || "";

    // 1. Noise Pruning (Principle 8)
    cleanMaster = cleanMaster.replace(/stroke_dasharray|stroke_width|z_index|opacity|#[0-9a-fA-F]{6}|\{\s*x:\s*\d.*?\}/g, "");
    cleanMaster = cleanMaster.replace(/ent_\w+|panel_\w+|p1_\w+|p2_\w+|p3_\w+/g, "");

    // 2. Structural/Compositional Normalization
    const ds = adData.diffusion_synthesis;
    let compiledBlocks = [];

    // Priority Weighting
    if (ds.priority_weighting) {
      const pw = ds.priority_weighting;
      if (pw.primary_focus?.length) compiledBlocks.push(`[PRIMARY FOCUS]:\n${pw.primary_focus.join(", ")}`);
      if (pw.secondary_context?.length) compiledBlocks.push(`[SECONDARY CONTEXT]:\n${pw.secondary_context.join(", ")}`);
    }

    // Spatial Narrative (New Hero Signal)
    if (ds.spatial_narrative) {
      compiledBlocks.push(`[SPATIAL ARRANGEMENT]:\n${ds.spatial_narrative}`);
    }

    compiledBlocks.push(`[DETAILED SPECIFICATION]:\n${cleanMaster.trim()}`);
    if (ds.style_descriptors?.length) compiledBlocks.push(`[STYLE PROTOCOL]:\n${ds.style_descriptors.join(", ")}`);

    adData.diffusion_synthesis.compiled_prompt = compiledBlocks.join("\n\n");
  }
};

export const compileVideoPrompt = (adData: any) => {
  console.log("[SOVEREIGN CINEMATIC COMPILER v7.0] Hard Constraints & Prose Synthesis Layer...");
  const cin = adData.cinematography || {};
  const style = adData.style || {};
  const negatives: string[] = (adData.negative_prompts || []).slice(0, 3);
  const veoClip = adData.veo_clip || {};
  const fps = style.fps || 24;

  // --- RULE 1: Duration enforcement (4 / 6 / 8 only) ---
  const ALLOWED_DURATIONS = [4, 6, 8];
  let finalDuration = veoClip.duration_seconds || 8;
  if (!ALLOWED_DURATIONS.includes(finalDuration)) {
    finalDuration = 8;
  }

  // GLOBAL DURATION SYNC (Resolver)
  adData.veo_clip.duration_seconds = finalDuration;
  if (adData.clip_strategy) adData.clip_strategy.duration_seconds = finalDuration;
  if (adData.temporal_arc) adData.temporal_arc.total_duration_seconds = finalDuration;

  // --- v7.0: Resolution Constraint Validator ---
  if (veoClip.resolution === "4K UHD" || veoClip.resolution === "4K") {
    console.log("[v7.0 Validator] 4K not supported by Veo 3.1. Capping to 1080p.");
    adData.veo_clip.resolution = "1080p";
    veoClip.resolution = "1080p";
  }

  // --- v7.0: Negative Prompt Validator ---
  let processedNegatives = negatives.map((neg: string) => {
    const lower = neg.toLowerCase();
    if (lower.startsWith("no urban") || lower.includes("no modern")) {
      return "natural rural elements only";
    }
    if (lower.match(/^no [a-zA-Z]+$/)) {
      // simple adjective block
      return neg.replace(/^no /i, "exclude ");
    }
    return neg;
  });

  // --- v6.1 SYNTHESIS LAYER ---
  // We rely on the LLM's fluid prose in adData.compiled_master_prompt.
  let compiledPrompt = adData.compiled_master_prompt || "";

  // --- RULE 6: Negative prompt enforcement ---
  // If the LLM missed 'Exclude:' in the prose, we inject it based on negative_prompts
  if (compiledPrompt && !compiledPrompt.includes("Exclude:")) {
    const negBlock = processedNegatives.length > 0 ? processedNegatives.join(". ") + "." : "No morphing. No subtitles.";
    compiledPrompt = `${compiledPrompt.trim()} Exclude: ${negBlock}`;
    adData.compiled_master_prompt = compiledPrompt;
  }

  // --- v9.5: CINEMASTER TECHNICAL LOOKUP & PHYSICS VALIDATOR ---
  const visualMode = adData.style?.visual_mode || "";
  const rawStyle = typeof style === "string" ? style.toLowerCase() : visualMode.toLowerCase();
  const vTags: string[] = [];
  let forcedFps = 24;
  let isStylised = false;
  let forcedAspectRatio = "16:9";
  let forcedColorTemp = 5500;
  let forcedStock = "";
  let forcedShadows = "soft-natural";
  let forcedGrade = "natural-rec709";

  if (rawStyle.includes("80s") || rawStyle.includes("vintage")) {
    vTags.push("Kodak 5247 film stock", "heavy 35mm grain", "analog gate weave", "magenta/cyan neon practicals");
    forcedFps = 24;
    forcedAspectRatio = "4:3";
    forcedColorTemp = 3200;
    forcedStock = "Kodak 5247 color negative";
    forcedShadows = "hard";
    forcedGrade = "vintage-warm";
  } else if (rawStyle.includes("noir")) {
    vTags.push("high-contrast Chiaroscuro lighting", "anamorphic prime lens", "deep blacks", "moody rim lighting", "shallow vertical depth of field");
    forcedAspectRatio = "2.39:1";
    forcedColorTemp = 3200;
    forcedStock = "ARRI Alexa 65 Noir-tuned";
    forcedShadows = "hard-defined-silhouette";
    forcedGrade = "cinematic-noir-high-contrast";
    // Physics override for noir
    if (adData.motion_physics) {
      adData.motion_physics.dust_dynamics = {
        behavior: "slow gravitational fall with light turbulence",
        particle_size: "mixed microscopic and coarse wood-shavings",
      };
    }
  } else if (rawStyle.includes("cyberpunk") || rawStyle.includes("neon") || rawStyle.includes("anime")) {
    // Physics for Cyberpunk
    if (adData.motion_physics) {
      adData.motion_physics.rain_interaction = {
        tire_spray: "directional streaks",
        surface_response: "rippled reflections",
        impact_pattern: "high-speed splatter",
      };
    }
  } else if (rawStyle.includes("ghibli") || rawStyle.includes("skytale")) {
    vTags.push("Studio Ghibli hand-painted style", "watercolor textures");
    forcedFps = 12;
    isStylised = true;
    forcedAspectRatio = "16:9";
  } else if (rawStyle.includes("photorealistic")) {
    vTags.push("clean ultra-realistic 8k", "sharp optical focus", "global illumination");
    forcedFps = 24;
    forcedAspectRatio = "16:9";
    forcedStock = "RED Monstro 8K VV";
  } else if (rawStyle.includes("picture book")) {
    vTags.push("soft watercolor painting", "pastel tones", "paper texture");
    forcedFps = 12;
    isStylised = true;
    forcedAspectRatio = "4:3";
  } else if (rawStyle.includes("3d cartoon") || rawStyle.includes("hyper cartoon")) {
    vTags.push("Pixar-like 3D CGI", "subsurface scattering", "squash-and-stretch motion");
    forcedFps = 24;
    isStylised = true;
    forcedAspectRatio = "16:9";
  } else if (rawStyle.includes("retro comics")) {
    vTags.push("vintage comic book cel-shading", "Ben-Day dot halftone", "heavy ink contours");
    forcedFps = 12;
    isStylised = true;
    forcedAspectRatio = "4:3";
  } else if (rawStyle.includes("anime")) {
    vTags.push("high-energy anime style", "dynamic action smears", "flat shading");
    forcedFps = 24;
    isStylised = true;
    forcedAspectRatio = "16:9";
  } else if (rawStyle.includes("pixel art")) {
    vTags.push("16-bit pixel art", "crisp square pixels", "retro gaming aesthetic");
    forcedFps = 8;
    isStylised = true;
    forcedAspectRatio = "4:3";
  } else if (rawStyle.includes("illustration") || rawStyle.includes("minimalist")) {
    vTags.push("flat vector illustration", "clean minimalist linework", "high negative space");
    forcedFps = 12;
    isStylised = true;
    forcedAspectRatio = "16:9";
  } else if (rawStyle.includes("dreamtale")) {
    vTags.push("ethereal bloom", "soft focus magical glowing particles", "pastel volumetric lighting");
    forcedFps = 24;
    forcedColorTemp = 4500;
    forcedAspectRatio = "16:9";
  } else if (rawStyle.includes("horror")) {
    vTags.push("underexposed moody rim lighting", "eerie volumetric fog", "cold desaturated shadows");
    forcedFps = 24;
    forcedColorTemp = 3200;
    forcedAspectRatio = "2.39:1";
  } else if (rawStyle.includes("sketchbook")) {
    vTags.push("raw charcoal pencil sketch", "rough hand-drawn motion", "visible parchment grain");
    forcedFps = 8;
    isStylised = true;
    forcedAspectRatio = "1:1";
  } else if (rawStyle.includes("drone")) {
    vTags.push("aerial drone cinematography", "hyper-smooth gimbal stabilization", "sweeping landscape view");
    forcedFps = 24;
    forcedAspectRatio = "16:9";
    forcedStock = "DJI Inspire 3 ProRes Raw";
  }

  // --- GLOBAL STYLE RESOLVER (Resolver) ---
  if (adData.veo_clip) adData.veo_clip.aspect_ratio = forcedAspectRatio;
  if (adData.style) {
    adData.style.fps = forcedFps;
    adData.style.grade_profile = forcedGrade;
  }
  if (adData.lighting) {
    adData.lighting.colour_temp_K = forcedColorTemp;
    adData.lighting.shadow_behavior = forcedShadows;
  }

  // --- CINEMATOGRAPHY CONTRADICTION FIXER ---
  if (adData.cinematography) {
    const c = adData.cinematography;
    if (c.camera_platform === "hand-held" && c.camera_movement && c.camera_movement.toLowerCase().includes("zoom")) {
      console.log("[v12.0 Physics] Fixing handheld-zoom contradiction -> Changing to 'Dolly Push'");
      adData.cinematography.camera_movement = "gradual dolly push";
      adData.cinematography.stabilization = "high-performance gimbal";
    }
  }

  // --- STYLE CONTRADICTION PRUNER (v15.0) ---
  if (rawStyle.includes("noir")) {
    const sections = adData.compiled_master_prompt.split("Exclude:");
    let positivePrompt = sections[0];
    let negativePrompt = sections.length > 1 ? "Exclude: " + sections[1] : "";

    positivePrompt = positivePrompt
      .replace(/sun-drenched|bright airy|warm golden|golden hour|soft natural daylight/gi, (match: string) => {
        return positivePrompt.includes("moody low-key") ? "" : "moody low-key";
      })
      .replace(/5500K/g, "3200K");

    negativePrompt = negativePrompt.replace(/no dark shadows|no deep blacks|no moody atmosphere|no low-key lighting/gi, "");

    adData.compiled_master_prompt = (positivePrompt.trim() + " " + negativePrompt.trim()).trim();
  }

  // --- v20.0 THE LOMBARDI SYNTHESIS ---
  const prose_word_count = (adData.compiled_master_prompt || "").split(/\s+/).length;
  if (prose_word_count < 140 && Array.isArray(adData.scene_core?.action_sequence)) {
    console.log("[v20.0 Lombardi Synthesis] Final Gold Standard Synthesis.");

    const isAnimated = rawStyle.includes("animated") || rawStyle.includes("pixar") || rawStyle.includes("ghibli") || rawStyle.includes("anime") || rawStyle.includes("3d cartoon") || rawStyle.includes("illustration") || rawStyle.includes("manga");
    const isCyberpunk = rawStyle.includes("cyberpunk") || rawStyle.includes("neon") || rawStyle.includes("futuristic");
    const isDrone = rawStyle.includes("drone") || rawStyle.includes("aerial");
    const isNoir = rawStyle.includes("noir");

    const rawSubject = adData.scene_core.subject || "subject";
    const isVehicle = rawSubject.toLowerCase().includes("car") || rawSubject.toLowerCase().includes("vehicle") || rawSubject.toLowerCase().includes("vessel") || rawSubject.toLowerCase().includes("bike");
    const formattedSubject = isVehicle ? (rawSubject.match(/^(a|an|the)\s/i) ? rawSubject : `a ${rawSubject}`) : (rawSubject.match(/^(a|an|the)\s/i) ? rawSubject : `an Indian ${rawSubject}`);
    const location = adData.scene_core?.environment?.location || "scene";

    if (adData.cinematography) {
      adData.cinematography.shot_type = "high_speed_tracking";
      adData.cinematography.camera_movement = "tracking shot";
    }

    let finalProse = "";

    if (isAnimated) {
      const styleDesc = isCyberpunk ? "stylized cyberpunk anime aesthetic" : `${rawStyle} rendering style`;
      const lightingGrammar = isCyberpunk ? "neon signage in magenta and cyan, creating layered light patterns that ripple across the wet asphalt" : `palette-driven lighting with ${isNoir ? "high-contrast shadows" : "vivid saturation"}`;
      const animeMotifs = isCyberpunk ? "holographic billboards, suspended signage, and foreground cables creating layered depth" : "hand-painted backgrounds and textured brushwork";

      const opening = `A high-speed tracking shot establishes ${formattedSubject} within a ${location}, rendered in a ${styleDesc}. ${lightingGrammar}.`;

      const subjectRef = isVehicle ? "The vehicle" : "The subject";
      const motionBody = (adData.scene_core.action_sequence || [])
        .map((b: any, index: number) => {
          if (index === 0) return `${subjectRef} races steadily, its motion accentuated by elongated motion smears and deliberate squash-and-stretch deformation.`;
          if (index === 1) return `The movement flows into ${b.action.toLowerCase()}, where stylized light trails and ${isCyberpunk ? "chromatic aberration" : "visual artifacts"} catch the glow from neon sources.`;
          return `The sequence resolves with smooth, continuous motion as it reaches ${b.action.toLowerCase()}.`;
        })
        .join(" ");

      const physicsDetail = isCyberpunk ? "Rain-streaks diagonally across the frame, catching light from holographic billboards above. Directional tire spray and high-speed splatter define the contact with the rain-slick surface." : "Physics govern the movement with consistent stylistic continuity and clean rendering. No digital artifacts.";
      const technicalFooter = `Visual composition relies on ${animeMotifs}, with ${isCyberpunk ? "bloom and light scattering" : "clean linework"} defining the frame. Saturated highlight roll-off ensures deep stylistic depth.`;

      finalProse = `${opening} ${motionBody} ${physicsDetail} ${technicalFooter}`;
    } else {
      const opening = `A professional tracking shot frames ${formattedSubject} in ${isNoir ? "low-key" : "natural"} ${forcedColorTemp}K lighting, his weathered features catching a narrow shaft of light within a ${location}.`;

      const motionBody = (adData.scene_core.action_sequence || [])
        .map((b: any, index: number) => {
          if (index === 0) return `He ${b.action.toLowerCase()} steadily, the motion deliberate and weighted, as deep shadows pool across the textured surface.`;
          if (index === 1) return `The movement flows into ${b.action.toLowerCase()}; fine particulates drift into the light, briefly suspended in the air.`;
          return `He finishes ${b.action.toLowerCase()} with quiet rhythm as the shot resolves.`;
        })
        .join(" ");

      const physicsDetail = isDrone ? "Hyper-smooth gimbal stabilization ensures zero vibration, maintaining a cinematic drift." : "Volumetric beams cut through the moisture-laden atmosphere, revealing slow-falling particles shaped by subtle air currents.";
      const technicalFooter = `Captured on an ${forcedStock || "industry-standard 35mm camera"} at ${forcedFps}fps, with a premium cinematic lens and selective focus. High-contrast chiaroscuro defines the scene, with deep blacks and a controlled rim light separating subject from background.`;

      finalProse = `${opening} ${motionBody} ${physicsDetail} ${technicalFooter}`;
    }

    const finalNegatives = (adData.negative_prompts || []).length > 0 ? `Exclude ${adData.negative_prompts.join(", ")}.` : `Exclude ${isAnimated ? "photorealism, camera-based artifacts, and physical lens behavior" : "high-key lighting, warm daylight, and digital artifacts"}.`;

    adData.compiled_master_prompt = `${finalProse} ${finalNegatives} The ${finalDuration}-second shot maintains absolute visual coherence.`.replace(/[{}[\]"]/g, "");
  }

  // --- v20.5 SOVEREIGN QUALITY GATE (FINAL) ---
  const final_prose = adData.compiled_master_prompt || "";
  const final_word_count = final_prose.trim().split(/\s+/).length;

  const validation_results: any[] = [];
  let hard_reject = false;

  if (final_word_count < 80) {
    validation_results.push({ rule: "R9", status: "fail", severity: "blocker", detail: `Insufficient Prose Density (${final_word_count} words). 120+ words required for Sovereign status.` });
    hard_reject = true;
  }

  if (!final_prose.toLowerCase().includes("indian") && !final_prose.toLowerCase().includes("south asian")) {
    adData.compiled_master_prompt = `[MANDATORY IDENTITY: Indian/South Asian descent] ${final_prose}`;
  }

  if (!hard_reject) {
    adData.engine_prompts = { veo: adData.compiled_master_prompt };
    adData._quality_flags = {
      validation_status: "PASSED",
      engine: "Sovereign v20.5 [Gold Standard Final]",
      prose_word_count: final_word_count,
      prose_gate_passed: true,
    };
  }

  return { hard_reject, validation_results };
};
