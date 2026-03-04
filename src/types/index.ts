export type Mode = 'ad' | 'medical' | 'vector' | 'video' | 'storyboard';
export type AssetType = 'style' | 'subject' | 'structure';

export interface StylePreset {
    label: string;
    value: string;
}

export interface CameraSettings {
    lens: string;
    shot_type: string;
    aesthetic: string;
}

export interface VisualAccuracy {
    textures: string;
    lighting: string;
    labeling_safe_zones?: string;
}

export interface BlueprintData {
    // Ad Creative fields
    core_prompt?: string;
    lighting?: string;
    camera_settings?: CameraSettings;
    exact_text?: string;
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
    vector_style?: string;
    color_palette?: string;
    background?: string;
    complexity?: string;

    // Video/Storyboard fields
    video_subject?: string;
    motion_dynamics?: string;
    camera_movement?: string;
    temporal_storyboard?: string[];
    visual_style?: string;
    total_project_duration?: string;
    scenes?: StoryboardScene[];

    // Common
    negative_prompt?: string;
}

export interface StoryboardScene {
    scene_number: number;
    shot_duration?: string;
    visual_prompt: string;
    narration_vo: string;
    motion_instruction?: string;
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
