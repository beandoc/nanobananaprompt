export type Mode = 'ad' | 'medical' | 'vector' | 'video' | 'storyboard' | 'manga' | 'comic' | 'food' | 'infographic';
export type AssetType = 'style' | 'subject' | 'structure';

export interface StylePreset {
    label: string;
    value: string;
    previewUrl?: string;
    description?: string;
}

export interface CameraSettings {
    lens: string;
    shot_type: string;
    aesthetic: string;
}

export interface VisualAccuracy {
    textures: string;
    lighting: string;
    tissue_physics?: string;
    crosstalk_integration?: string;
    anatomical_keys?: string;
    labeling_safe_zones?: string;
}

export interface MedicalHierarchy {
    macro?: {
        anatomy: string;
        identity_standard: string;
    };
    organ?: {
        name: string;
        pathology: string;
        visual_markers: string[];
    }[];
    micro?: {
        tissue_type: string;
        cellular_structures: string[];
        texture_logic: string;
    };
    molecular?: {
        signal_name: string;
        representation: string;
        directional_flow: string;
    }[];
}

export interface MedicalLayout {
    type: string;
    panels?: number;
    directionality?: string;
}


export interface ProVideoShot {
    composition: string;
    lens: string;
    frame_rate: string;
    camera_movement: string;
}

export interface ProVideoSubject {
    description: string;
    props: string;
}

export interface ProVideoScene {
    location: string;
    time_of_day: string;
    environment: string;
}

export interface ProVideoVisualDetails {
    action: string;
    special_effects: string;
    hair_clothing_motion: string;
}

export interface ProVideoCinematography {
    lighting: string;
    color_palette: string;
    tone: string;
}

export interface ProVideoAudio {
    music: string;
    ambient: string;
    sound_effects: string;
    mix_level: string;
}

export interface BlueprintData {
    // Ad Creative fields
    core_prompt?: string;
    lighting?: string;
    camera_settings?: CameraSettings;
    headline_copy?: string;
    subline_copy?: string;
    aspect_ratio?: string;

    // Medical Master fields
    scientific_subject?: string;
    illustration_style?: string | {
        primary: string;
        rendering: string;
        palette: {
            tissue: string;
            cellular: string;
            molecular: string;
            signaling: string;
        };
    };
    layout?: {
        type: string;
        orientation: string;
        overlay_mode: string;
        depth_order: string[];
        zoom_focus: string;
    };
    layout_composition?: string | MedicalLayout;
    hierarchy?: MedicalHierarchy;
    biological_systems?: {
        tissue: {
            structures: string[];
            pathology_manifestation: string;
            spatial_logic: string;
        };
        cellular: {
            resident_cells: string[];
            infiltrating_cells: string[];
            cellular_activity: string[];
        };
        molecular: {
            complexes_used: string[];
            deposition_rules: string;
            concentration_gradients: string[];
        };
    };
    signaling_pathways?: {
        pathway_name: string;
        sequence_of_events: string[];
        feedback_logic: string;
        pathological_outcome: string;
    }[];
    annotation_system?: {
        hierarchy: {
            major: string[];
            minor: string[];
        };
        label_style: string;
    };
    visual_constraints?: {
        spatial_accuracy: string;
        arrows: {
            enabled: boolean;
            logic_types: string[];
        };
        labels: boolean;
    };
    render_layers?: string[];
    journal_standard?: string;
    consistent_character?: string;
    visual_theme?: string;
    negative_prompt?: string;
    visual_accuracy?: VisualAccuracy;




    // Vector fields
    illustration_subject?: string;
    style_framework?: string;
    geometric_logic?: string;
    stroke_weight?: string;
    color_profile?: string;
    shading_type?: string;
    background_setting?: string;
    complexity?: string; // Legacy

    // Video/Storyboard fields
    video_subject?: string;
    motion_dynamics?: string;
    camera_movement?: string;
    temporal_storyboard?: string[];
    visual_style?: string;
    total_project_duration?: string;
    
    // Pro Video (Nano Banana Pro / Veo 3)
    description?: string;
    style?: string;
    camera?: string;
    lens?: string;
    environment?: string;
    audio?: string;
    elements?: string[];
    motion?: string;
    ending?: string;
    text?: string;

    // Legacy Nested Video structures
    shot?: ProVideoShot;
    subject?: ProVideoSubject;
    scene?: ProVideoScene;
    visual_details?: ProVideoVisualDetails;
    cinematography?: ProVideoCinematography;
    audio_nested?: ProVideoAudio;

    // Manga/Comic Multi-Universe
    manga_subject?: string;
    panels?: MangaPanel[];

    // Comic Strip (Narrative Sequential)
    narrative_arc?: string;
    comic_panels?: ComicPanel[];
    lettering_style?: string;
    art_style?: string;
    layout_type?: 'vertical' | 'grid' | 'splash' | 'manga';
    production_credits?: string;
    is_model_sheet?: boolean;
    comic_title?: string;
    logline?: string;
    global_color_grade?: 'Golden Hour Mumbai' | 'Retro 4-Color Print' | 'Nocturnal Neon' | 'Classic Marvel Primary';
    pacing_energy?: 'high' | 'low';

    comic_pages?: ComicPage[];
    scenes?: StoryboardScene[];

    // Infographic fields
    infographic_title?: string;
    subtitle?: string;
    edition_tag?: string;
    aesthetic_style?: 'NEJM-Editorial' | 'BioRender-Technical' | 'Modern-Minimalist' | 'Painterly-Editorial' | 'Watercolor-Field-Notes' | 'Organic-Collage';
    color_palette?: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        zone_colors?: string[];
    };
    layout_structure?: 'central-hero-diagram' | 'organic-flow' | 'hub-and-spoke' | 'anatomical-overlay' | 'editorial-magazine' | 'tiered-narrative';
    central_visual_metaphor?: {
        concept: string;
        style?: string;
        rendering_detail?: string;
        dominant_element?: string;
        hero_icon_id?: string;
    };
    global_stat_callout?: {
        stat: string;
        label: string;
        source?: string;
    };
    pull_quotes?: Array<{
        quote: string;
        attribution?: string;
    }>;
    sections?: InfographicSection[];
    directional_flow?: InfographicFlow[];
    footer_methodology?: string;

    // Common
    keywords?: string[];
}

export interface InfographicSection {
    section_id: number;
    headline: string;
    visual_concept: string;
    color_zone?: string;
    callout_type?: 'stat-hero' | 'comparison-table' | 'process-steps' | 'evidence-list' | 'myth-vs-fact' | 'mechanism-explainer' | 'risk-spectrum';
    detailed_narrative?: string;
    stat_highlight?: { value: string; label: string; };
    annotations?: string[];
    key_data_points?: string[];
    comparison?: { left_label: string; left_value: string; right_label: string; right_value: string; };
    process_steps?: string[];
    iconography?: string[];
    spatial_anchor?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center-left' | 'center-right' | 'floating-overlap' | 'full-width-band';
    visual_weight?: 'hero' | 'major' | 'minor';
    x_percent?: number;
    y_percent?: number;
}

export interface InfographicFlow {
    from_section_id: number;
    to_section_id: number;
    relationship_type: 'leads_to' | 'inhibits' | 'enhances' | 'compares_to' | 'causes' | 'prevents';
    flow_label?: string;
}

export interface MangaPanel {
    panel_number: number;
    universe: string;
    art_style: string;
    outfit: string;
    environment: string;
    angle?: string;
    expression?: string;
    pose?: string;
}

export interface ComicPanel {
    panel_number: number;
    shot_type: string;
    characters: string;
    action: string;
    background: string;
    dialogue?: string;
    thought_bubble?: string;
    narrative_caption?: string;
    onomatopoeia?: string;
    inking_style?: 'G-Pen' | 'Real G-Pen' | 'Watercolor' | 'Airbrush';
    lighting_setup?: string;
    effect_lines?: string;
    perspective?: 'high-angle' | 'eye-level' | 'low-angle' | 'pov';
    visual_texture?: string;
    lettering_weight?: 'Action' | 'Whimsy' | 'Regular';
}

export interface StoryboardScene {
    scene_number: number;
    shot_duration?: string;
    visual_prompt: string;
    narration_vo: string;
    motion_instruction?: string;
}

export interface ComicPage {
    page_number: number;
    panels: ComicPanel[];
}

export interface LibraryItem {
    name: string;
    type: Mode;
    content: BlueprintData;
    timestamp: number;
}

export interface GenerationResult {
    data: BlueprintData;
    promptFile: string;
    folder: string;
    refinedPrompt?: string;
    activeProvider?: string;
}

export interface RenderRequest {
    promptData: BlueprintData;
    mode: Mode;
    parentImage: string | null;
    refinedPrompt?: string;
}

export interface GenerateRequest {
    brief: string;
    mode: Mode;
    isStoryboard: boolean;
    style: string;
    image?: string | null;
    previousImage?: string | null;
    assetInstruction?: AssetType;
    parentPrompt?: BlueprintData | null;
}

export interface RefineRequest {
    brief: string;
    mode: Mode;
    isStoryboard: boolean;
    style: string;
    image: string | null;
}
