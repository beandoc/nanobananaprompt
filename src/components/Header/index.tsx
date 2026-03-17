"use client";

import { motion } from "framer-motion";
import { Sparkles, Microscope, Layers, Zap, Stethoscope, Camera, History, LogOut } from "lucide-react";
import { Tooltip } from "../Shared/Tooltip";
import { Mode } from "@/types";
import { cn } from "@/lib/utils";

interface HeaderProps {
    mode: Mode;
    setMode: (mode: Mode) => void;
    setShowLibrary: (show: boolean) => void;
    onLogout?: () => void;
}

export function Header({ mode, setMode, setShowLibrary, onLogout }: HeaderProps) {
    return (
        <header className="sticky top-0 z-[60] bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-[0_1px_10px_rgba(0,0,0,0.02)]">
            <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
                <div className="flex items-center gap-5">
                    <motion.div
                        whileHover={{ rotate: 5, scale: 1.05 }}
                        className={cn(
                            "w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg border transition-all duration-500",
                            mode === "ad" ? "bg-gradient-to-br from-indigo-500 to-indigo-700 border-indigo-400/30 shadow-indigo-200/50" :
                                mode === "medical" ? "bg-gradient-to-br from-emerald-500 to-emerald-700 border-emerald-400/30 shadow-emerald-200/50" :
                                    mode === "vector" ? "bg-gradient-to-br from-orange-500 to-orange-700 border-orange-400/30 shadow-orange-200/50" :
                                        "bg-gradient-to-br from-violet-500 to-violet-700 border-violet-400/30 shadow-violet-200/50"
                        )}
                    >
                        {mode === "ad" ? <Sparkles className="w-6 h-6 text-white" /> :
                            mode === "medical" ? <Microscope className="w-6 h-6 text-white" /> :
                                mode === "vector" ? <Layers className="w-6 h-6 text-white" /> :
                                    <Camera className="w-6 h-6 text-white" />}
                    </motion.div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-slate-900 leading-none mb-1">Nano Banana</h1>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Intelligence Pipeline</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-500 animate-pulse">v2.5 Pro</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 border border-slate-200 rounded-[1.25rem] shadow-inner">
                    <Tooltip content="Switch to DTC Creative mode for skincare and brand ads.">
                        <button
                            onClick={() => setMode("ad")}
                            className={cn(
                                "px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2",
                                mode === "ad" ? "bg-white text-indigo-600 shadow-md border border-slate-200/60" : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                            )}
                        >
                            <Zap className="w-3.5 h-3.5" /> DTC Creative
                        </button>
                    </Tooltip>
                    <Tooltip content="Switch to Medical mode for anatomical and clinical illustrations.">
                        <button
                            onClick={() => setMode("medical")}
                            className={cn(
                                "px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2",
                                mode === "medical" ? "bg-white text-emerald-600 shadow-md border border-slate-200/60" : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                            )}
                        >
                            <Stethoscope className="w-3.5 h-3.5" /> Medical
                        </button>
                    </Tooltip>
                    <Tooltip content="Switch to Vector mode for clean illustrations and SVG tracing.">
                        <button
                            onClick={() => setMode("vector")}
                            className={cn(
                                "px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2",
                                mode === "vector" ? "bg-white text-orange-600 shadow-md border border-slate-200/60" : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                            )}
                        >
                            <Layers className="w-3.5 h-3.5" /> Vector
                        </button>
                    </Tooltip>
                    <Tooltip content="Switch to Video mode for 8-second cinematic motion sequences.">
                        <button
                            onClick={() => setMode("video")}
                            className={cn(
                                "px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2",
                                mode === "video" ? "bg-white text-violet-600 shadow-md border border-slate-200/60" : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                            )}
                        >
                            <Camera className="w-3.5 h-3.5" /> Video
                        </button>
                    </Tooltip>
                    <Tooltip content="Switch to Manga mode for multi-universe character grids.">
                        <button
                            onClick={() => setMode("manga")}
                            className={cn(
                                "px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2",
                                mode === "manga" ? "bg-white text-rose-600 shadow-md border border-slate-200/60" : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                            )}
                        >
                            <Sparkles className="w-3.5 h-3.5 text-rose-500" /> Manga
                        </button>
                    </Tooltip>
                    <Tooltip content="Switch to Comic Strip mode for sequential storytelling.">
                        <button
                            onClick={() => setMode("comic")}
                            className={cn(
                                "px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2",
                                mode === "comic" ? "bg-white text-blue-600 shadow-md border border-slate-200/60" : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                            )}
                        >
                            <Layers className="w-3.5 h-3.5 text-blue-500" /> Comic
                        </button>
                    </Tooltip>
                </div>

                <div className="flex items-center gap-4">
                    <Tooltip content="View previously generated blueprints and case studies.">
                        <button onClick={() => setShowLibrary(true)} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-all shadow-sm">
                            <History className="w-5 h-5" />
                        </button>
                    </Tooltip>
                    {onLogout && (
                        <Tooltip content="Logout and lock pipeline access.">
                            <button onClick={onLogout} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-rose-500 hover:border-rose-100 transition-all shadow-sm">
                                <LogOut className="w-5 h-5" />
                            </button>
                        </Tooltip>
                    )}
                    <div className="w-8 h-8 rounded-full bg-slate-200 border border-white" />
                </div>
            </div>
        </header>
    );
}
