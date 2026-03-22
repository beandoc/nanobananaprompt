"use client";

import { motion } from "framer-motion";
import { Sparkles, Check, Globe, LayoutGrid, Palette, UserCircle, Camera, Smile } from "lucide-react";
import { Tooltip } from "../Shared/Tooltip";
import { cn } from "@/lib/utils";
import { MangaPanel } from "@/types";

interface MangaEngineProps {
    mangaSubject: string;
    panels: MangaPanel[];
    isModelSheet?: boolean;
    handleCopy: (text: string, id: string) => void;
    copySuccess: string | null;
}

export function MangaEngine({
    mangaSubject,
    panels,
    isModelSheet = false,
    handleCopy,
    copySuccess
}: MangaEngineProps) {
    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 mb-12">
            {/* Header */}
            <div className="flex items-center gap-5 px-4 mt-4">
                <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl border-2 border-white rotate-[-4deg]",
                    isModelSheet ? "bg-indigo-600 shadow-indigo-200" : "bg-rose-600 shadow-rose-200"
                )}>
                    {isModelSheet ? <UserCircle className="w-6 h-6 text-white" /> : <Sparkles className="w-6 h-6 text-white" />}
                </div>
                <div>
                    <h2 className="text-base font-black uppercase tracking-[0.3em] text-slate-900 leading-none mb-2">
                        {isModelSheet ? "Character Model Sheet" : "Multi-Universe Manga Grid"}
                    </h2>
                    <p className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border w-fit",
                        isModelSheet ? "text-indigo-500 bg-indigo-50 border-indigo-100" : "text-rose-500 bg-rose-50 border-rose-100"
                    )}>
                        {isModelSheet ? "Asset Consistency Matrix" : "Character Evolution Engine"}
                    </p>
                </div>
            </div>

            {/* Subject Summary */}
            <div className="bg-white border-2 md:border-4 border-slate-900 rounded-2xl md:rounded-[2.5rem] p-6 md:p-10 relative overflow-hidden shadow-[12px_12px_0_rgba(15,23,42,0.1)] mx-2">
                <div className="flex flex-col gap-3 md:gap-4">
                    <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <span className="w-5 md:w-6 h-1 bg-slate-900 rounded-full" />
                        Anchor Subject
                    </div>
                    <p className="text-lg md:text-xl font-black text-slate-900 leading-tight italic">
                        "{mangaSubject}"
                    </p>
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {panels.map((panel, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white/90 backdrop-blur-xl border border-white rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 shadow-[0_15px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.08)] transition-all group/scene relative overflow-hidden"
                    >
                        <div className="bg-white border-2 border-slate-100 rounded-2xl md:rounded-[2.5rem] p-6 md:p-8 h-full flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 border-b-6 md:border-b-8 border-r-6 md:border-r-8 border-slate-900/5 hover:border-slate-900/20">
                            {/* Universe / Pose Badge */}
                            <div className="flex items-center justify-between mb-4 md:mb-6">
                                <div className="px-4 md:px-5 py-2 bg-slate-900 text-white rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
                                    {isModelSheet ? (panel.pose || `Pose ${idx + 1}`) : panel.universe}
                                </div>
                                <Tooltip content="Copy Generation Prompt">
                                    <button
                                        onClick={() => {
                                            const base = `${mangaSubject} in ${panel.universe} universe, ${panel.art_style}, wearing ${panel.outfit}, set in ${panel.environment}`;
                                            const modelSheet = `Character model sheet entry for ${mangaSubject}: ${panel.angle} angle, expression: ${panel.expression}, pose: ${panel.pose}. ${panel.art_style}, set in ${panel.environment}.`;
                                            handleCopy(isModelSheet ? modelSheet : base, `m-p-${idx}`);
                                        }}
                                        className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm border",
                                            copySuccess === `m-p-${idx}` ? "bg-emerald-500 text-white border-emerald-400" : "bg-white text-slate-300 border-slate-200 hover:text-rose-500 hover:border-rose-100"
                                        )}
                                    >
                                        {copySuccess === `m-p-${idx}` ? <Check className="w-4 h-4" /> : <Palette className="w-4 h-4" />}
                                    </button>
                                </Tooltip>
                            </div>

                            <div className="space-y-6 flex-1 flex flex-col font-sans">
                                {isModelSheet ? (
                                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                <Camera className="w-3 md:w-3.5 h-3 md:h-3.5" /> Angle
                                            </div>
                                            <p className="text-[10px] md:text-xs font-bold text-slate-900 p-2.5 md:p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                {panel.angle || '3/4 View'}
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                <Smile className="w-3 md:w-3.5 h-3 md:h-3.5" /> Expression
                                            </div>
                                            <p className="text-[10px] md:text-xs font-bold text-slate-900 p-2.5 md:p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                {panel.expression || 'Neutral'}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                            <Palette className="w-3 md:w-3.5 h-3 md:h-3.5" /> Art Style
                                        </div>
                                        <p className="text-[10px] md:text-xs font-bold text-slate-900 leading-relaxed bg-slate-50 p-3 md:p-4 rounded-xl border border-slate-100 italic">
                                            {panel.art_style}
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                        <Globe className="w-3 md:w-3.5 h-3 md:h-3.5" /> Environment
                                    </div>
                                    <p className="text-[10px] md:text-xs font-medium text-slate-500 leading-relaxed">
                                        {panel.environment}
                                    </p>
                                </div>

                                <div className="mt-auto pt-4 md:pt-6 border-t border-slate-50 flex items-center gap-2 md:gap-3">
                                    <span className="text-[8px] md:text-[9px] font-black text-slate-300 uppercase tracking-widest">Outfit:</span>
                                    <span className="text-[9px] md:text-[10px] font-bold text-slate-600">{panel.outfit}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
