"use client";

import { motion } from "framer-motion";
import { Upload, Zap, X, ShieldCheck, Loader2, Database, Sparkles, Film } from "lucide-react";
import Image from "next/image";
import { Tooltip } from "../Shared/Tooltip";
import { StyleSelector } from "./StyleSelector";
import { BriefInput } from "./BriefInput";
import { cn } from "@/lib/utils";
import { Mode, AssetType, StylePreset } from "@/types";

interface ProjectInputProps {
    mode: Mode;
    brief: string;
    setBrief: (val: string) => void;
    isStoryboard: boolean;
    setIsStoryboard: (val: boolean) => void;
    assetImage: string | null;
    setAssetImage: (val: string | null) => void;
    assetType: AssetType;
    setAssetType: (val: AssetType) => void;
    selectedStyle: string;
    setSelectedStyle: (val: string) => void;
    isLoading: boolean;
    handleGenerate: () => void;
    refinePrompt: () => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ALL_STYLE_PRESETS: Record<Mode, StylePreset[]> = {
    ad: [
        { label: "High-End Editorial", value: "high-end-editorial", description: "Vogue-style polished art direction with cinematic rim lighting and flawlessly retouched surfaces.", previewUrl: "/previews/high-end-editorial.png" },
        { label: "Clean Ecom", value: "clean-ecom", description: "Minimalist Apple-style product photography on pure neutral backgrounds with sharp shadow definition." },
        { label: "UGC iPhone Selfie", value: "ugc-iphone-selfie", description: "Authentic, candid social media aesthetic with natural lighting and slight motion blur." },
        { label: "[PRO] Integrated Geometric Sandwich", value: "The Sandwich Effect: Multi-layered geometric composition with muted sophisticated palettes (Sage, Slate, Terracotta).", description: "Creates a layered, modern architectural look by nesting the subject between geometric planes." },
        { label: "[PRO] Typographic Window Mask", value: "The Window Effect: Subject visible only through giant serif typography. Masking logic with high-contrast finish.", description: "Makes the subject appear 'inside' large bold letters for a high-impact graphic design look.", previewUrl: "/previews/typographic-mask.png" },
        { label: "[PRO] Sequential Recipe Infographic", value: "Culinary Blueprint: Central dish Hero, Ingredient nests on left, Semicircular glass step panels.", description: "A technical breakdown of food ingredients in a clean, scientific display.", previewUrl: "/previews/culinary-infographic.jpg" },
        { label: "[PRO] Isometric X-Ray Teardown", value: "Functional Hardware Teardown: 15% Accent Density (Red-Power, Blue-Data). Translucent cutaway logic.", description: "Shows the internal components of a product in an 'exploded view' technical diagram.", previewUrl: "/previews/isometric-teardown.png" },
        { label: "[PRO] AR Mixed-Reality FPV", value: "Gaze-responsive HUD: Peripheral shopping list, floating frosted glass data panels, realistic mixed reality.", description: "A first-person view through AR glasses with floating digital elements overlaying the real world.", previewUrl: "/previews/ar-fpv.png" },

        { label: "[PRO] Architectural Cyanotype", value: "Chalk-on-Blue Blueprint: Engineering load-flow mapping overlaid on real-world environment photography.", description: "Overlays white technical blueprint lines on top of realistic blue-tinted photography." },
        { label: "[PRO] Digital Collage Chaos", value: "Controlled Rebellion: Torn edges, layered textures, hand-drawn design elements, 2.5% typographic skew.", description: "A trendy 'scrapbook' look with torn paper edges, stickers, and mixed-media layers." },
        { label: "[PRO] Monoline Vector Sticker Sheet", value: "High-End Sticker Set: Thick uniform monoline weight, solid off-white fill, thick white die-cut borders.", description: "Converts the subject into a grid of clean, high-end vector stickers.", previewUrl: "/previews/sticker-sheet.png" },
        { label: "[PRO] Cinematic Long-Exposure", value: "Temporal Contrast: Sharp subject vs. directional motion-blur crowd streaks. 85mm story-lens finish.", description: "Sharp subject in the center with beautiful motion streaks in the background." },

        { label: "[PRO] Curled Paper Portrait Mosaic", value: "Physical Tiling: 3D paper fragments with curled corners and realistic shadows on concrete background.", description: "A physical 3D effect where the image is made of curled paper scraps pinned to a wall." },
        { label: "[PRO] Fashion Editorial Triptych", value: "Cinematic Triptych: 3 stacked panels, visual continuity locks, varying lighting signatures.", description: "Displays 3 different angles of the same scene in a vertical cinematic layout." },
        { label: "[PRO] B&W Technical Blueprint", value: "Engineering Study: Pure ink-on-photo, architectural drafting lines, functional movement arrows.", description: "Pure black and white technical draft with measurements and callouts." },
        { label: "[PRO] Mosaic Silhouette Tribute", value: "Dual Exposure Silhouette: Main subject profile acting as a window for micro-scaled lifestyle mosaic grid.", description: "A large silhouette that contains thousands of tiny related images inside it." },
        { label: "[PRO] High-Speed Beverage Splash", value: "Kinetic Crown Splash: viscous liquid physics, micro-condensation 'chilled sweat', 1/8000s freeze.", description: "Ultra-high-speed freeze frame of splashing liquid with extreme detail." },
        { label: "[PRO] Skincare Ecom Splash", value: "Minimalist Product Splash: Dewy droplets on label, centered top-down flatlay, directional sunlight shadows.", description: "Clean, dewy skincare aesthetic with soft natural light and water droplets." },
        { label: "[PRO] 3D City Map Diorama", value: "Macro-Scale Diorama: Miniature 3D architecture rising from a realistic geographic map surface. PBR materials.", description: "A miniature city landscape rising out of a paper map." },
        { label: "[PRO] PBR Educational Diorama", value: "Layered Step-Diorama: Stepped base showing ecological/mechanical stages. Faceless stylized figures.", description: "A museum-style cutout display showing a process or ecosystem." },
        { label: "[PRO] Ink-Flow Narrative Macro", value: "Literary Life: Liquid ink transforming into 3D miniature scenes as it touches the fiber of the paper.", description: "Surreal effect where ink spilled on paper turns into tiny realistic mountains and trees." },
        { label: "[PRO] Industrial Aviation Sketchbook", value: "Concept Designer Sheet: High-fidelity hero paint-render on top, rough technical pen sketches below.", description: "A designer's notebook look with a finished render and rough pen sketches.", previewUrl: "/previews/notebook-doodle.png" },
        { label: "[PRO] Product Heart Mosaic", value: "Valentine's Brand Momentum: Multiple 3D product items interlocked to form a perfect symmetrical heart shape on a flat vibrant background. Contact shadows and floating brand particles.", description: "Arranges multiple product units into a perfect geometric heart shape.", previewUrl: "/previews/product-heart-mosaic.jpg" },
        { label: "[PRO] Colossal Scale Landmark", value: "Monumental scale advertising: A giant-sized [PRODUCT] towering over a real-world landscape (Arctic, Desert, City). Tiny human figures included for extreme scale contrast. Photorealistic.", description: "Creates a sense of immense scale with a giant product as a landmark in a landscape." },
        { label: "[PRO] 3D Voxel Deconstruction", value: "Material Transformation: A [SUBJECT] partially deconstructing/pixelating into clean geometric 3D voxels and cubes. Clean studio backdrop.", description: "A digital deconstruction effect where the subject turns into 3D cubes." },
        { label: "[PRO] Levitating Island Diorama", value: "3D Geographic Diorama: A floating island shaped like the map of [REGION] levitating in the clouds with miniature landmarks and realistic topology.", description: "A floating island in the shape of a country with realistic mountains." },
        { label: "[PRO] Fourth-Wall Frame Pour", value: "Surreal Advertising: A subject within a golden picture frame pouring a liquid or reaching an object out of the frame into the real-world studio space.", description: "An object breaks the 'fourth wall' and spills out of a picture frame." },
        { label: "[PRO] Cybernetic Laser Gaze", value: "Experimental Portraiture: Single horizontal neon red laser beam slicing across the subject's eye. High-contrast noir lighting. Futuristic.", description: "A single sharp laser line across the subject's face for a high-tech vibe." },
        { label: "[PRO] Miniature Brand Storefront", value: "Macro-Isometric Retail: A high-detail miniature 3D architectural model of a [BRAND] store on a solid color baseplate. PBR Toy-aesthetic.", description: "A cute, highly detailed miniature 'toy' version of a retail building." }
    ],
    video: [
        { label: "Cinematic Noir (Veo 3 + FLUX.2)", value: "Cinematic Noir, gritty cyberpunk realism, 35mm Anamorphic, Neo-Mumbai aesthetic, rain-slicked surfaces", description: "Gritty, rainy cyberpunk atmosphere with high-contrast shadows and neon reflections." },
        { label: "High-Fashion Dior Style (Pro)", value: "High-fashion editorial, clean golden-hour desert landscape, flowing silk fabrics, Vogue aesthetic", description: "Soft golden light across desert vistas with elegant, flowing fabrics." },
        { label: "Cyberpunk Neon Burst (Fast)", value: "Vibrant Cyberpunk, harsh pink/cyan neon rim lighting, motion-blurred high-speed action, metallic textures", description: "High-energy action style with intense neon glow and motion blur." },
        { label: "Handheld Documentary 16mm", value: "Raw 16mm handheld documentary style, natural film grain, organic camera shake, realistic focus pulling", description: "Authentic 16mm film look with grain and organic camera movement." },
        { label: "Anamorphic 8K CGI (Pro)", value: "Anamorphic 2.39:1 widescreen, global illumination, 8K RED Helium look, deep depth of field", description: "Wide-screen cinematic CGI look with professional lighting and depth." },
        { label: "[PRO] Cinematic Wellness (Sauna)", value: "Ultra-luxury traditional sauna portrait. Volumetric steam, dewy skin texture, dewy ivory complexion, warm diffused ambient lighting (3200K).", description: "Ultra-high-end spa aesthetic with volumetric steam and dewy skin micro-textures.", previewUrl: "/previews/sauna-wellness.jpg" }
    ],

    medical: [
        { label: "Classic NEJM Editorial", value: "New England Journal of Medicine style, 2.5D soft volumetric digital painting, muted clinical colors, directional flow dynamics", description: "Classic 2.5D medical painting style with soft volumes and clinical palettes." },
        { label: "Professional BioRender Style", value: "BioRender-standard scientific illustration, clean 2.5D vector assets, matte plastic textures", description: "Standard BioRender vector aesthetic for professional scientific posters." },
        { label: "Macro-Probe Lens (Scientific)", value: "Ultra-macro probe lens movement, 1000fps slow motion, scientific microscopic focus", description: "Microscopic detail with extreme depth of field and slow-motion clarity." },
        { label: "[PRO] Isometric Technical Tear-down", value: "Exploded product infographic: isometric 3D perspective showing internal mechanics, micro screws, and components suspended in perfect alignment.", description: "A technical 'exploded view' showing internal medical components in 3D." }
    ],
    vector: [
        { label: "Isometric 2.5D Bold", value: "Isometric 2.5D, bold minimalist, flat geometric colors, clean outlines", description: "Trendy 2.5D vector style with bold geometric shapes and clean outlines." },
        { label: "Minimalist Brand Asset", value: "Ultra-minimalist brand asset, geometric symmetry, primary color profile, uniform strokes", description: "Pure geometric minimalism for logos and core brand assets." },
        { label: "[PRO] Monoline Sticker Sheet", value: "High-end sticker sheet set. Modern monoline vector line art. Uniform thick line weight, solid off-white fill, thick white die-cut borders.", description: "Converts the subject into a grid of uniform black-and-white monoline stickers." }
    ],
    manga: [
        { label: "Classic Shonen (Naruto/DBZ)", value: "Classic Shonen, bold action lines, high-contrast cel shading", description: "High-energy anime style with bold ink lines and dramatic cel-shading." },
        { label: "Seinen Noir (Akira/Ghost in Shell)", value: "Seinen Noir, intricate mechanical detail, muted tonal range, atmospheric lighting", description: "Detailed, atmospheric manga style with industrial grit and complex shading." },
        { label: "[PRO] Character Model Sheet", value: "Official character model sheet matrix: Frontal, 1/3, and profile poses. High-fidelity modern anime lineart. Uniform lighting and studio neutral gray environment.", description: "A professional character reference sheet showing front, side, and 3/4 views." }
    ],
    comic: [
        { label: "Golden Age Sequential", value: "golden-age", description: "Classic 1950s comic aesthetic with Ben-Day dots and vibrant primary colors." },
        { label: "Modern Graphic Novel", value: "modern-graphic-novel", description: "Painterly digital textures with moody lighting and cinematic framing." },
        { label: "[PRO] Marvel Hero Project", value: "marvel-hero-project", description: "High-end Marvel-style superhero aesthetic: vibrant primary colors, dynamic perspective, and cinematic action posing.", previewUrl: "/previews/marvel-hero-project.jpg" },
        { label: "[PRO] Dual Exposure Grid", value: "Complex dual exposure photo-grid composite. Silhouette acting as a vessel for action-shot photo mosaic grid. Halftone dots and mixed-media textures.", description: "A sophisticated silhouette-based mosaic grid with mixed-media textures." }
    ],
    storyboard: [
        { label: "[PRO] 3x3 Mockup Grid", value: "High-end designer storyboard presentation. 3x3 grid (9 equal panels). Focus on form, composition, and visual rhythm. Hero shot, close-ups, levitation, and geometric isometric angles.", description: "A 9-panel professional designer layout for cinematic storyboarding." }
    ],
    food: [
        { label: "Explosive Splash", value: "high-speed liquid splash crown, levitating ingredients, micro-condensation 'chilled sweat', 1/8000s freeze.", description: "Ultra-high-speed culinary photography with stunning liquid physics.", previewUrl: "/previews/food-explosive-splash.png" }
    ],
    infographic: [
        { label: "CJASN Blue Standard", value: "CJASN-Blue-Standard", description: "The gold standard for Nephrology: clean electric-blue blocks, rounded card-centric stats, and high-contrast clinical headers." },
        { label: "NEJM Dense Slab", value: "NEJM-Minimal", description: "Ultra-dense academic grid with saturated left-rail cells and tabular data stacking. Optimized for high-impact journals." },
        { label: "Nature Flow / WCN", value: "Nature-Bold", description: "Experimental causal flow with generous whitespace and monoline scientific iconography." }
    ]
};

const ASSET_TYPES: AssetType[] = ["style", "subject", "structure"];

export function ProjectInput({
    mode,
    brief,
    setBrief,
    isStoryboard,
    setIsStoryboard,
    assetImage,
    setAssetImage,
    assetType,
    setAssetType,
    selectedStyle,
    setSelectedStyle,
    isLoading,
    handleGenerate,
    refinePrompt,
    fileInputRef,
    handleFileUpload
}: ProjectInputProps) {
    return (
        <section className="space-y-4 md:space-y-6 lg:sticky lg:top-32 h-fit">
            <div className="flex items-center gap-3 px-2 md:px-4">
                <div className={cn("w-1.5 md:w-2 h-6 md:h-7 rounded-full", mode === "ad" ? "bg-indigo-500" : mode === "medical" ? "bg-emerald-500" : "bg-orange-500")} />
                <h2 className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-slate-500">Project Definition</h2>
            </div>

            <motion.div
                layout
                className="bg-white/90 backdrop-blur-2xl border border-white rounded-3xl md:rounded-[2.5rem] p-5 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.08)] relative group overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 blur-[50px] -mr-16 -mt-16 pointer-events-none" />

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 md:mb-10">
                    <div className="flex bg-slate-100 p-1 md:p-1.5 rounded-xl md:rounded-2xl border border-slate-200 shadow-inner w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={() => setIsStoryboard(false)}
                            className={cn("flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all", !isStoryboard ? "bg-white text-slate-800 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600")}
                        >
                            Single Shot
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsStoryboard(true)}
                            className={cn("flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5", isStoryboard ? "bg-white text-rose-600 shadow-sm border border-rose-100" : "text-slate-400 hover:text-slate-600")}
                        >
                            <Film className="w-3 h-3" /> Storyboard
                        </button>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                    <Tooltip content="Upload an image to extract its style, colors, or structure.">
                        <button type="button" onClick={() => fileInputRef.current?.click()} className={cn("w-full sm:w-auto px-4 py-2 rounded-full text-[10px] font-black border uppercase transition-all flex items-center justify-center gap-2", assetImage ? "bg-indigo-50 text-indigo-600 border-indigo-200" : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100")}>
                            <Upload className="w-3.5 h-3.5" /> {assetImage ? "Asset Loaded" : "Link Reference"}
                        </button>
                    </Tooltip>
                </div>

                <StyleSelector
                    selectedStyle={selectedStyle}
                    setSelectedStyle={setSelectedStyle}
                    stylePresets={ALL_STYLE_PRESETS[mode]}
                />

                {assetImage && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 md:mb-10 p-4 md:p-8 bg-indigo-50/40 rounded-2xl md:rounded-[2rem] border border-indigo-100 flex flex-col sm:flex-row gap-4 md:gap-8 items-center shadow-inner relative group/asset">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl overflow-hidden border-2 border-white shadow-xl ring-2 ring-indigo-500/20 group-hover/asset:scale-105 transition-transform duration-500 relative shrink-0">
                            <Image
                                src={assetImage}
                                alt="Reference"
                                fill
                                className="object-cover"
                                unoptimized={assetImage.startsWith('blob:')}
                            />
                        </div>
                        <div className="flex-1 w-full">
                            <div className="flex items-center justify-between mb-3 md:mb-4">
                                <p className="text-[9px] md:text-[10px] font-black text-indigo-400 uppercase tracking-widest italic flex items-center gap-2">
                                    <Zap className="w-3 h-3 md:w-3.5 md:h-3.5" /> Visual DNA Seed
                                </p>
                                <div className="flex items-center gap-1.5 px-2 md:px-3 py-1 bg-white/80 border border-indigo-100 rounded-lg shadow-sm">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                    <span className="text-[8px] md:text-[9px] font-black text-indigo-600 uppercase">Analysis ON</span>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {ASSET_TYPES.map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setAssetType(type)}
                                        className={cn("flex-1 sm:flex-none px-3 md:px-5 py-2 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black border transition-all uppercase tracking-widest shadow-sm", assetType === type ? "bg-indigo-600 text-white border-indigo-600 shadow-indigo-100" : "bg-white text-slate-400 border-slate-200 hover:border-indigo-200 hover:text-indigo-400")}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button type="button" onClick={() => setAssetImage(null)} className="absolute -top-2 -right-2 md:-top-3 md:-right-3 w-7 h-7 md:w-8 md:h-8 bg-white border border-slate-200 shadow-lg rounded-full flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 transition-all"><X className="w-4 h-4" /></button>
                    </motion.div>
                )}

                <BriefInput
                    mode={mode}
                    brief={brief}
                    onBriefChange={setBrief}
                />

                <div className="mt-8 md:mt-10 flex flex-col md:flex-row justify-between items-stretch md:items-center -mx-5 md:-mx-10 -mb-5 md:-mb-10 px-5 md:px-10 py-6 md:py-10 bg-slate-50/50 border-t border-slate-100 gap-6">
                    <div className="flex items-center gap-4 group/lock">
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-sm group-hover/lock:scale-110 transition-transform">
                            <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" />
                        </div>
                        <div>
                            <span className="block text-[9px] md:text-[10px] text-slate-600 font-black uppercase tracking-widest leading-none mb-1">Indian Identity</span>
                            <span className="text-[8px] md:text-[9px] text-emerald-500 font-bold uppercase tracking-tight">Biometric Lock: ACTIVE</span>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Tooltip content="Refine your raw ideas into a professional BioRender-standard prompt.">
                            <button type="button" onClick={() => refinePrompt()} disabled={isLoading} className="w-full sm:w-auto px-6 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:border-indigo-200 transition-all active:scale-95 disabled:opacity-50">
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-500" />}
                                {" Refine text"}
                            </button>
                        </Tooltip>
                        <Tooltip content="Analyze brief and generate a new technical JSON blueprint.">
                            <button
                                type="button"
                                onClick={() => handleGenerate()}
                                disabled={isLoading}
                                className={cn(
                                    "w-full sm:w-auto px-8 md:px-10 py-4 text-white rounded-[1.25rem] font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all relative overflow-hidden group/btn shadow-[0_10px_20px_rgba(0,0,0,0.1)] active:scale-95 disabled:opacity-50",
                                    mode === "ad" ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100/50" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100/50"
                                )}
                            >
                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                                {isLoading ? "Constructing..." : " Generate JSON"}
                            </button>
                        </Tooltip>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
