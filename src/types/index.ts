export type Mode = 'ad' | 'medical' | 'vector' | 'video' | 'storyboard' | 'manga' | 'comic' | 'food';
export type AssetType = 'style' | 'subject' | 'structure';

export interface StylePreset {
    label: string;
    value: string;
    previewUrl?: string;
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
    anatomical_keys?: string;
    labeling_safe_zones?: string;
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

    // Medical fields
    scientific_subject?: string;
    layout_composition?: string;
    illustration_style?: string;
    visual_accuracy?: VisualAccuracy;
    journal_standard?: string;
    consistent_character?: string;
    visual_theme?: string;

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

    // Common
    negative_prompt?: string;
    keywords?: string[];
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
}

export interface RenderRequest {
    promptData: BlueprintData;
    mode: Mode;
    parentImage: string | null;
}

export interface GenerateRequest {
    brief: string;
    mode: Mode;
    isStoryboard: boolean;
    style: string;
    image: string | null;
    previousImage?: string | null;
    assetInstruction: AssetType;
    parentPrompt?: BlueprintData | null;
}

export interface RefineRequest {
    brief: string;
    mode: Mode;
    isStoryboard: boolean;
    style: string;
    image: string | null;
}
