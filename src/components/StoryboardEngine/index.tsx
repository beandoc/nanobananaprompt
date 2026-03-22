"use client";

import { motion } from "framer-motion";
import { Film, Check, Video, Mic } from "lucide-react";
import { Tooltip } from "../Shared/Tooltip";
import { cn } from "@/lib/utils";
import { StoryboardScene } from "@/types";

interface StoryboardEngineProps {
    totalProjectDuration: string;
    scenes: StoryboardScene[];
    handleCopy: (text: string, id: string) => void;
    copySuccess: string | null;
    isComicStoryboard?: boolean;
}

export function StoryboardEngine({
    totalProjectDuration,
    scenes,
    handleCopy,
    copySuccess,
    isComicStoryboard = false
}: StoryboardEngineProps) {
    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 mb-8">
            <div className="flex items-center gap-4 px-4 md:px-6">
                <div className="w-10 h-10 rounded-2xl bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-200 shrink-0">
                    <Film className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-900 leading-none mb-1">Production Storyboard</h2>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">{totalProjectDuration}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{scenes.length} Master Segments</span>
                    </div>
                </div>
            </div>
            <div className="grid gap-6">
                {scenes.map((scene, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white/90 backdrop-blur-xl border border-white rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 shadow-[0_15px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.08)] transition-all group/scene relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-1.5 md:w-2.5 h-full bg-rose-500 opacity-20" />
                        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 mb-6 md:mb-8">
                            <div className="flex items-center gap-4 md:gap-5">
                                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-[1.25rem] bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-base md:text-lg font-black text-white shadow-xl shadow-rose-200/50 shrink-0">
                                    {scene.scene_number || idx + 1}
                                </div>
                                <div>
                                    <h3 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">
                                        {scene.shot_duration?.toLowerCase().includes('panel') || scene.shot_duration?.toLowerCase().includes('shot') || isComicStoryboard ? "Comic Panel" : "Scene Segment"}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <div className="px-3 py-1 bg-slate-100 rounded-lg text-[9px] md:text-[10px] font-black text-slate-600 uppercase tracking-widest border border-slate-200 shadow-sm">
                                            {scene.shot_duration || (isComicStoryboard ? 'Standard Panel' : '8s')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <Tooltip content="Copy Visual Directive">
                                    <button
                                        onClick={() => handleCopy(scene.visual_prompt, `sc-v-${idx}`)}
                                        className={cn(
                                            "h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm border flex-1 sm:w-12",
                                            copySuccess === `sc-v-${idx}` ? "bg-emerald-500 text-white border-emerald-400 shadow-emerald-200" : "bg-white text-slate-400 border-slate-200 hover:text-indigo-500 hover:border-indigo-100 hover:bg-indigo-50/30"
                                        )}
                                    >
                                        {copySuccess === `sc-v-${idx}` ? <Check className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                                    </button>
                                </Tooltip>
                                <Tooltip content="Copy Audio Script">
                                    <button
                                        onClick={() => handleCopy(scene.narration_vo, `sc-n-${idx}`)}
                                        className={cn(
                                            "h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm border flex-1 sm:w-12",
                                            copySuccess === `sc-n-${idx}` ? "bg-amber-500 text-white border-amber-400 shadow-amber-200" : "bg-white text-slate-400 border-slate-200 hover:text-indigo-500 hover:border-indigo-100 hover:bg-indigo-50/30"
                                        )}
                                    >
                                        {copySuccess === `sc-n-${idx}` ? <Check className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                    </button>
                                </Tooltip>
                            </div>
                        </div>
                        <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
                            <div className="space-y-4 md:space-y-6">
                                <div className="p-6 md:p-8 bg-slate-50/50 rounded-2xl md:rounded-[1.5rem] border border-slate-100 group-hover/scene:bg-white transition-all duration-500">
                                    <div className="flex items-center gap-2 mb-3 md:mb-4 text-[10px] font-black text-amber-500 uppercase tracking-widest">
                                        <Mic className="w-4 h-4" /> Audio Narration
                                    </div>
                                    <p className="text-sm text-slate-600 font-medium leading-relaxed italic">&quot;{scene.narration_vo}&quot;</p>
                                </div>
                                {scene.motion_instruction && (
                                    <div className="flex items-center gap-3 text-[9px] md:text-[10px] font-black uppercase text-rose-500 tracking-widest bg-rose-50 px-4 md:px-5 py-2 md:py-2.5 rounded-xl w-fit border border-rose-100 shadow-sm">
                                        {scene.motion_instruction}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-4">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                    <Video className="w-4 h-4" /> Visual Directive
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed font-medium bg-slate-50/30 p-6 md:p-8 rounded-2xl md:rounded-[1.5rem] border border-slate-100/50 group-hover/scene:bg-white transition-all duration-500">
                                    {scene.visual_prompt}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
