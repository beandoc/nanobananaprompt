"use client";

import { Terminal, Database, Eye, Loader2, RefreshCw, Film, Clapperboard, Clock, Gauge, Monitor } from "lucide-react";
import { Tooltip } from "../Shared/Tooltip";
import { cn } from "@/lib/utils";
import { Mode, BlueprintData } from "@/types";
import { useState } from "react";

interface BlueprintConsoleProps {
    mode: Mode;
    data: BlueprintData;
    isLoading: boolean;
    refinement: string;
    setRefinement: (val: string) => void;
    handleRefine: () => void;
    activeProvider?: string;
    expansionText?: string;
}

type VideoEngine = 'kling' | 'seedance' | 'veo' | 'runway' | 'generic';

const ENGINE_META: Record<VideoEngine, { label: string; color: string; url?: string }> = {
    kling: { label: "Kling AI", color: "bg-violet-500", url: "https://klingai.com" },
    seedance: { label: "Seedance", color: "bg-rose-500", url: "https://seedance.ai" },
    veo: { label: "Google Flow (Veo)", color: "bg-blue-600", url: "https://labs.google/fx/tools/flow" },
    runway: { label: "Runway", color: "bg-emerald-500", url: "https://app.runwayml.com" },
    generic: { label: "Universal", color: "bg-slate-600" }
};

export function BlueprintConsole({
    mode,
    data,
    isLoading,
    refinement,
    setRefinement,
    handleRefine,
    activeProvider = "Gemini-Elite",
    expansionText
}: BlueprintConsoleProps) {
    const [copiedEngine, setCopiedEngine] = useState<string | null>(null);
    const isVideo = mode === 'video';
    const videoData = data as any;

    const copyEnginePrompt = (engine: VideoEngine) => {
        const enginePrompts = videoData?.diffusion_synthesis?.engine_prompts;
        const prompt = enginePrompts?.[engine] || videoData?.diffusion_synthesis?.compiled_prompt || videoData?.diffusion_synthesis?.master_prompt || "";
        navigator.clipboard.writeText(prompt);
        setCopiedEngine(engine);
        setTimeout(() => setCopiedEngine(null), 2000);

        const meta = ENGINE_META[engine];
        if (meta.url) {
            window.open(meta.url, "_blank");
        }
    };

    return (
        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl md:rounded-[2.5rem] p-5 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative overflow-hidden group/console">
            <div className="flex items-center justify-between mb-6 md:mb-8">
                <div className="flex items-center gap-3">
                    <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shadow-lg shrink-0", isVideo ? "bg-rose-600" : "bg-slate-900")}>
                        {isVideo ? <Film className="w-4 h-4 text-white" /> : <Terminal className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <div>
                        <h3 className="font-black uppercase tracking-[0.2em] text-[9px] md:text-[10px] text-slate-400">
                            {mode === "ad" ? "Art Direction" : 
                             mode === "medical" ? "Technical Blueprint" : 
                             mode === "video" ? "Cinematic Engine v5.0" :
                             mode === "manga" ? "Manga Grid Logic" :
                             mode === "comic" ? "Sequential Narrative" :
                             mode === "infographic" ? "Visual Abstract" :
                             "Vector Blueprint"}
                        </h3>
                        <p className="text-[8px] md:text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Compiler: {activeProvider}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {!isVideo && expansionText && (
                        <Tooltip content="Copy ONLY the Masterclass Refined Text (Phase 1). No JSON metadata.">
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(expansionText);
                                    window.open("https://gemini.google.com/app", "_blank");
                                }}
                                className="bg-emerald-600 hover:bg-emerald-500 text-[10px] md:text-[11px] text-white font-black uppercase tracking-widest px-4 md:px-5 py-2.5 rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-2"
                            >
                                <Eye className="w-3.5 h-3.5" />
                                Copy Refined Text
                            </button>
                        </Tooltip>
                    )}
                    {!isVideo && (
                        <Tooltip content="Copy exactly the targeted prompt designed for Imagen 3 (Gemini Web).">
                            <button
                                onClick={() => {
                                    const jsonPrompt = (data as any)?.diffusion_synthesis?.compiled_prompt || (data as any)?.diffusion_synthesis?.master_prompt || (data as any)?.prompt || "";
                                    const masterPrompt = (expansionText && (expansionText.length > jsonPrompt.length)) ? expansionText : jsonPrompt;
                                    const negPrompt = (data as any)?.diffusion_synthesis?.negative_prompt || "no text, no 3d render";
                                    const finalPrompt = `Strictly follow this prompt:\n\n${masterPrompt}\n\nNegative Constraints:\n${negPrompt}`;
                                    navigator.clipboard.writeText(finalPrompt || "Failed to generate prompt.");
                                    window.open("https://gemini.google.com/app", "_blank");
                                }}
                                className="bg-indigo-600 hover:bg-indigo-500 text-[10px] md:text-[11px] text-white font-black uppercase tracking-widest px-4 md:px-5 py-2.5 rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-2"
                            >
                                <Terminal className="w-3.5 h-3.5" />
                                Copy Imagen Prompt
                            </button>
                        </Tooltip>
                    )}
                    <Tooltip content="Copy RAW JSON (For Developer/Programmatic Use)">
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(JSON.stringify(data, null, 2));
                            }}
                            className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:border-indigo-100 transition-all shadow-sm"
                        >
                            <Database className="w-4 h-4" />
                        </button>
                    </Tooltip>
                </div>
            </div>

            {/* --- VIDEO ENGINE SELECTOR (v5.0) --- */}
            {isVideo && videoData?.diffusion_synthesis && (
                <div className="mb-6 md:mb-8 space-y-4">
                    {/* Cinematic Spec Badges */}
                    <div className="flex flex-wrap gap-2">
                        {videoData.temporal_arc?.duration && (
                            <div className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-[8px] font-black text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Clock className="w-3 h-3" />
                                {videoData.temporal_arc.duration}
                            </div>
                        )}
                        {videoData.temporal_arc?.frame_rate && (
                            <div className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-[8px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Gauge className="w-3 h-3" />
                                {videoData.temporal_arc.frame_rate}
                            </div>
                        )}
                        {videoData.temporal_arc?.resolution && (
                            <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[8px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Monitor className="w-3 h-3" />
                                {videoData.temporal_arc.resolution}
                            </div>
                        )}
                        {videoData.video_type && (
                            <div className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[8px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                                <Clapperboard className="w-3 h-3" />
                                {videoData.video_type}
                            </div>
                        )}
                    </div>

                    {/* Per-Engine Copy Buttons */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                        {(Object.keys(ENGINE_META) as VideoEngine[]).map((engine) => {
                            const meta = ENGINE_META[engine];
                            const isCopied = copiedEngine === engine;
                            return (
                                <button
                                    key={engine}
                                    onClick={() => copyEnginePrompt(engine)}
                                    className={cn(
                                        "px-3 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5 border",
                                        isCopied
                                            ? "bg-emerald-500 text-white border-emerald-400 shadow-emerald-200"
                                            : "bg-white text-slate-600 border-slate-200 hover:border-indigo-200 hover:text-indigo-600 hover:shadow-md"
                                    )}
                                >
                                    <div className={cn("w-2 h-2 rounded-full shrink-0", meta.color)} />
                                    {isCopied ? "Copied!" : meta.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Refined Text Button for Video */}
                    {expansionText && (
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(expansionText);
                                setCopiedEngine('text');
                                setTimeout(() => setCopiedEngine(null), 2000);
                            }}
                            className={cn(
                                "w-full px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 border",
                                copiedEngine === 'text'
                                    ? "bg-emerald-500 text-white border-emerald-400"
                                    : "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100"
                            )}
                        >
                            <Eye className="w-3.5 h-3.5" />
                            {copiedEngine === 'text' ? "Copied Masterclass Text!" : "Copy Phase 1 Cinematic Text (Raw Prose)"}
                        </button>
                    )}
                </div>
            )}

            {/* JSON Preview */}
            <div className="bg-slate-900 rounded-2xl md:rounded-[2rem] p-5 md:p-8 border border-white/5 max-h-[250px] overflow-auto mb-6 md:mb-8 shadow-2xl relative group/code">
                <pre className="text-[10px] md:text-[11px] text-indigo-300 font-mono leading-relaxed whitespace-pre-wrap">
                    {JSON.stringify(data, null, 2)}
                </pre>
                <div className="absolute top-4 right-4 items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 hidden sm:flex">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Validated</span>
                </div>
            </div>

            <div className="p-5 md:p-8 bg-slate-50/80 rounded-2xl md:rounded-[2rem] border border-slate-200 relative">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                    <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-black text-indigo-500 uppercase italic tracking-widest px-1">
                        <RefreshCw className="w-4 h-4 animate-spin-slow" /> Technical Refinement
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        value={refinement}
                        onChange={(e) => setRefinement(e.target.value)}
                        placeholder={isVideo ? "e.g., 'Make it slow-motion at 120fps'..." : "e.g., 'Change the camera angle'..."}
                        className="flex-1 bg-white border border-slate-200 rounded-xl md:rounded-[1.25rem] px-4 md:px-5 py-3 md:py-4 text-xs text-slate-700 placeholder:text-slate-300 outline-none hover:border-indigo-200 transition-all shadow-sm"
                    />
                    <button
                        onClick={handleRefine}
                        disabled={isLoading || !refinement.trim()}
                        className="px-6 md:px-8 py-3 md:py-4 bg-slate-900 text-white rounded-xl md:rounded-[1.25rem] text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95 disabled:opacity-30"
                    >
                        Update
                    </button>
                </div>
            </div>
        </div>
    );
}
