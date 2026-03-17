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
        { label: "High-End Editorial", value: "high-end-editorial" },
        { label: "Clean Ecom", value: "clean-ecom" },
        { label: "UGC iPhone Selfie", value: "ugc-iphone-selfie" },
        { label: "Outdoor/Rugged", value: "Outdoor/Rugged: Earthy tones (forest green, rust, mud brown)" },
        { label: "Beauty/Wellness", value: "Beauty/Wellness: Soft warm tones (peach, ivory, blush)" }
    ],
    video: [
        { label: "Cinematic Noir (Veo 3 + FLUX.2)", value: "Cinematic Noir, gritty cyberpunk realism, 35mm Anamorphic, Neo-Mumbai aesthetic, rain-slicked surfaces" },
        { label: "High-Fashion Dior Style (Pro)", value: "High-fashion editorial, clean golden-hour desert landscape, flowing silk fabrics, Vogue aesthetic" },
        { label: "Cyberpunk Neon Burst (Fast)", value: "Vibrant Cyberpunk, harsh pink/cyan neon rim lighting, motion-blurred high-speed action, metallic textures" },
        { label: "Handheld Documentary 16mm", value: "Raw 16mm handheld documentary style, natural film grain, organic camera shake, realistic focus pulling" },
        { label: "Anamorphic 8K CGI (Pro)", value: "Anamorphic 2.39:1 widescreen, global illumination, 8K RED Helium look, deep depth of field" }
    ],
    medical: [
        { label: "Classic NEJM Editorial", value: "New England Journal of Medicine style, 2.5D soft volumetric digital painting, muted clinical colors, directional flow dynamics" },
        { label: "Professional BioRender Style", value: "BioRender-standard scientific illustration, clean 2.5D vector assets, matte plastic textures" },
        { label: "Macro-Probe Lens (Scientific)", value: "Ultra-macro probe lens movement, 1000fps slow motion, scientific microscopic focus" }
    ],
    vector: [
        { label: "Isometric 2.5D Bold", value: "Isometric 2.5D, bold minimalist, flat geometric colors, clean outlines" },
        { label: "Minimalist Brand Asset", value: "Ultra-minimalist brand asset, geometric symmetry, primary color profile, uniform strokes" }
    ],
    manga: [
        { label: "Classic Shonen (Naruto/DBZ)", value: "Classic Shonen, bold action lines, high-contrast cel shading" },
        { label: "Seinen Noir (Akira/Ghost in Shell)", value: "Seinen Noir, intricate mechanical detail, muted tonal range, atmospheric lighting" }
    ],
    comic: [
        { label: "Golden Age Sequential", value: "Golden Age comic style, vibrant primary colors, heavy ink outlines, ben-day dots" },
        { label: "Modern Graphic Novel", value: "Modern graphic novel, cinematic framing, painterly digital textures, sophisticated palettes" }
    ],
    storyboard: []
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
        <section className="space-y-6 lg:sticky lg:top-32 h-fit">
            <div className="flex items-center gap-3 px-4">
                <div className={cn("w-2 h-7 rounded-full", mode === "ad" ? "bg-indigo-500" : mode === "medical" ? "bg-emerald-500" : "bg-orange-500")} />
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">Project Definition</h2>
            </div>

            <motion.div
                layout
                className="bg-white/90 backdrop-blur-2xl border border-white rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.08)] relative group"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 blur-[50px] -mr-16 -mt-16 pointer-events-none" />

                <div className="flex items-center justify-between mb-10">
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
                        <button
                            type="button"
                            onClick={() => setIsStoryboard(false)}
                            className={cn("px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all", !isStoryboard ? "bg-white text-slate-800 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600")}
                        >
                            Single Shot
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsStoryboard(true)}
                            className={cn("px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5", isStoryboard ? "bg-white text-rose-600 shadow-sm border border-rose-100" : "text-slate-400 hover:text-slate-600")}
                        >
                            <Film className="w-3 h-3" /> Storyboard
                        </button>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                    <Tooltip content="Upload an image to extract its style, colors, or structure.">
                        <button type="button" onClick={() => fileInputRef.current?.click()} className={cn("px-4 py-2 rounded-full text-[10px] font-black border uppercase transition-all flex items-center gap-2", assetImage ? "bg-indigo-50 text-indigo-600 border-indigo-200" : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100")}>
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
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-10 p-8 bg-indigo-50/40 rounded-[2rem] border border-indigo-100 flex gap-8 items-center shadow-inner relative group/asset">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white shadow-xl ring-2 ring-indigo-500/20 group-hover/asset:scale-105 transition-transform duration-500 relative">
                            <Image
                                src={assetImage}
                                alt="Reference"
                                fill
                                className="object-cover"
                                unoptimized={assetImage.startsWith('blob:')}
                            />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic flex items-center gap-2">
                                    <Zap className="w-3.5 h-3.5" /> Visual DNA Seed
                                </p>
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-white/80 border border-indigo-100 rounded-lg shadow-sm">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                    <span className="text-[9px] font-black text-indigo-600 uppercase">Analysis Engine ON</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {ASSET_TYPES.map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setAssetType(type)}
                                        className={cn("px-5 py-2 rounded-xl text-[9px] font-black border transition-all uppercase tracking-widest shadow-sm", assetType === type ? "bg-indigo-600 text-white border-indigo-600 shadow-indigo-100" : "bg-white text-slate-400 border-slate-200 hover:border-indigo-200 hover:text-indigo-400")}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button type="button" onClick={() => setAssetImage(null)} className="absolute -top-3 -right-3 w-8 h-8 bg-white border border-slate-200 shadow-lg rounded-full flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 transition-all"><X className="w-4 h-4" /></button>
                    </motion.div>
                )}

                <BriefInput
                    mode={mode}
                    brief={brief}
                    onBriefChange={setBrief}
                />

                <div className="mt-10 flex justify-between items-center -mx-10 -mb-10 px-10 py-10 bg-slate-50/50 border-t border-slate-100">
                    <div className="flex items-center gap-4 group/lock">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-sm group-hover/lock:scale-110 transition-transform">
                            <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <span className="block text-[10px] text-slate-600 font-black uppercase tracking-widest leading-none mb-1">Indian Identity</span>
                            <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-tight">Biometric Lock: ACTIVE</span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Tooltip content="Refine your raw ideas into a professional BioRender-standard prompt.">
                            <button type="button" onClick={() => refinePrompt()} disabled={isLoading} className="px-6 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:border-indigo-200 transition-all active:scale-95 disabled:opacity-50">
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-500" />}
                                Refine
                            </button>
                        </Tooltip>
                        <Tooltip content="Analyze brief and generate a new technical JSON blueprint.">
                            <button
                                type="button"
                                onClick={() => handleGenerate()}
                                disabled={isLoading}
                                className={cn(
                                    "px-10 py-4 text-white rounded-[1.25rem] font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-3 transition-all relative overflow-hidden group/btn shadow-[0_10px_20px_rgba(0,0,0,0.1)] active:scale-95 disabled:opacity-50",
                                    mode === "ad" ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100/50" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100/50"
                                )}
                            >
                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                                {isLoading ? "Analyzing..." : "Process Brief"}
                            </button>
                        </Tooltip>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
