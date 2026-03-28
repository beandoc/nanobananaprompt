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
    cast_of_characters?: ComicCastItem[];
    global_color_grade?: 'Golden Hour Mumbai' | 'Retro 4-Color Print' | 'Nocturnal Neon' | 'Classic Marvel Primary';
    pacing_energy?: 'high' | 'low';

    comic_pages?: ComicPage[];
    scenes?: StoryboardScene[];

    // Visual Abstract / Poster fields
    title?: string;
    journal_or_conference?: string;
    color_scheme?: {
        title_bg: string;
        title_text: string;
        cohort_bg: string;
        results_bg: string;
        conclusion_bg: string;
        accent: string;
    };
    cohort?: {
        heading: string;
        watermark_icon?: string;
        items: VisualAbstractCohortItem[];
    };
    methods?: {
        heading: string;
        items: VisualAbstractMethodItem[];
    };
    results?: {
        heading: string;
        blocks: ResultBlock[];
    };
    conclusion?: {
        heading: string;
        text: string;
    };
    citation?: {
        authors: string;
        authors_short?: string;
        doi?: string;
        abstract_credit?: string;
    };

    // Sovereign 21.0: NEJM Visual Abstract fields
    journal_style?: string;
    primary_endpoint_headline?: { text: string };
    color_system?: { accent?: string; neutral_light?: string };
    canvas?: { grid_type?: string; column_width_ratio?: number[] };
    results_grid?: {
        metrics?: {
            label: string;
            primary?: boolean;
            values: { outcome_value: string; sub_stat?: string }[];
            effect?: string;
            p_value?: string;
        }[];
    };
    interpretation_belt?: { text: string };
    conclusion_banner?: { text: string };
    diffusion_aesthetic?: {
        global_style?: string;
        iconography_style?: string;
        negative_prompt?: string;
    };
    rendering_rules?: { symmetry_enforced?: boolean; max_words_per_panel?: number };

    // Common
    keywords?: string[];
}

export interface VisualAbstractCohortItem {
    icon_id: string;
    text: string;
    emphasis?: string;
}

export interface VisualAbstractMethodItem {
    icon_id: string;
    technique: string;
    detail?: string;
}

export interface ResultBlock {
    block_type: 'comparison_table' | 'stat_cards' | 'icon_text_pairs' | 'key_finding' | 'venn_overlap' | 'versus_grid' | 'mechanism_cycle';
    block_title?: string;
    table_data?: {
        column_headers: string[];
        rows: Array<{ label: string; values: string[]; p_value?: string }>;
    };
    stat_cards?: Array<{ label: string; value: string; color?: string }>;
    icon_pairs?: Array<{ icon_id: string; text: string; stat?: string }>;
    finding_text?: string;
    finding_stat?: string;
    finding_subtext?: string;
    venn_data?: {
        circles: Array<{ label: string; value: string; color?: string }>;
        overlap_label?: string;
    };
    versus_grid?: {
        arms: Array<{ name: string; n: string; icon_id?: string }>;
        metrics: Array<{ label: string; values: string[]; p_value?: string }>;
        verdict_tag?: string;
    };
    mechanism_cycle?: {
        steps: Array<{ label: string; icon_id: string }>;
        is_circular: boolean;
    };
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

export interface ComicCastItem {
    name: string;
    description: string;
    role?: string;
    visual_anchor?: string; // Optional specific prompt snippet
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
