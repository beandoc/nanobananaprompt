"use client";

import { motion } from "framer-motion";
import { 
    BookOpen, Check, MessageSquare, Zap, Target, 
    Image as ImageIcon, Palette, Settings2, 
    Layers, MousePointer2, Wand2, UploadCloud,
    History, Users, Sparkles, Globe, PenTool,
    Sun, Move, Layout, Dices, Quote, Type
} from "lucide-react";
import { Tooltip } from "../Shared/Tooltip";
import { cn } from "@/lib/utils";
import { ComicPanel } from "@/types";
import { useState } from "react";

interface ComicEngineProps {
    comicTitle?: string;
    logline?: string;
    narrativeArc: string;
    panels: ComicPanel[];
    artStyle?: string;
    letteringStyle?: string;
    layoutType?: string;
    globalColorGrade?: string;
    pacingEnergy?: string;
    productionCredits?: string;
    handleCopy: (text: string, id: string) => void;
    copySuccess: string | null;
}

export function ComicEngine({
    comicTitle,
    logline,
    narrativeArc,
    panels,
    artStyle,
    letteringStyle,
    layoutType = 'vertical',
    globalColorGrade,
    pacingEnergy,
    productionCredits,
    handleCopy,
    copySuccess
}: ComicEngineProps) {
    const [selectedModel, setSelectedModel] = useState<'nano' | 'seedream'>('nano');
    const [isSettingsOpen, setIsSettingsOpen] = useState(true);

    return (
        <div className="flex gap-8 mb-20 relative font-sans">
            {/* Left Sidebar: Production Control */}
            {isSettingsOpen && (
                <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-80 shrink-0 hidden xl:flex flex-col gap-6 sticky top-24 h-[calc(100vh-8rem)]"
                >
                    <div className="bg-white border-4 border-slate-900 rounded-[2.5rem] p-8 shadow-xl flex flex-col gap-8 overflow-y-auto">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-900">Production Hub</h3>
                            <button onClick={() => setIsSettingsOpen(false)} className="text-slate-300 hover:text-rose-500 transition-colors">
                                <Settings2 className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Creative Spark / Randomize (from user's latest context) */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Creative Spark</label>
                            <button className="w-full h-24 rounded-[2rem] bg-indigo-600 text-white flex flex-col items-center justify-center gap-2 hover:bg-indigo-700 transition-all border-4 border-indigo-100 shadow-xl shadow-indigo-100 relative group overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-rose-500/20 to-transparent translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
                                <Dices className="w-8 h-8 text-white relative z-10" />
                                <span className="text-[10px] font-black uppercase tracking-widest relative z-10">Generate New Outline</span>
                            </button>
                            <p className="text-[9px] text-slate-400 text-center leading-relaxed">
                                (inspired by AI Title & Outline toolsets)
                            </p>
                        </div>

                        {/* Model Selector */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Art Engine Algorithm</label>
                            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1.5 rounded-2xl border-2 border-slate-100">
                                <button 
                                    onClick={() => setSelectedModel('nano')}
                                    className={cn(
                                        "px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        selectedModel === 'nano' ? "bg-black text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    Nano Banana
                                </button>
                                <button 
                                    onClick={() => setSelectedModel('seedream')}
                                    className={cn(
                                        "px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        selectedModel === 'seedream' ? "bg-rose-500 text-white shadow-lg shadow-rose-200" : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    Seedream 4.0
                                </button>
                            </div>
                        </div>

                        {/* Asset Presets */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Asset Presets</label>
                            <div className="grid grid-cols-1 gap-2">
                                {['G-Pen Heavy', 'Real G-Pen Rugged', 'Watercolor Romance', 'Educational Vector', 'Soft Empathy Watercolor'].map(style => (
                                    <button 
                                        key={style}
                                        className="w-full text-left px-5 py-3 rounded-xl border-2 border-slate-100 text-[10px] font-bold text-slate-600 hover:border-slate-900 transition-all flex items-center justify-between group"
                                    >
                                        {style}
                                        <Palette className="w-3 h-3 text-slate-200 group-hover:text-slate-900" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Project Metadata */}
                        <div className="space-y-4 mt-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Project Technical Ledger</label>
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3">
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                    <span className="text-slate-400">Resolution</span>
                                    <span className="text-slate-900">300 DPI</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                    <span className="text-slate-400">Color Mode</span>
                                    <span className="text-slate-900">RGB Profile</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                    <span className="text-slate-400">Layout</span>
                                    <span className={cn(
                                        "uppercase px-2 py-0.5 rounded-md",
                                        pacingEnergy === 'high' ? "bg-rose-100 text-rose-600" : "text-slate-900"
                                    )}>
                                        {layoutType} {pacingEnergy === 'high' ? '🔥 High Energy' : ''}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                    <span className="text-slate-400">Color Grade</span>
                                    <span className="text-indigo-600 truncate max-w-[100px] text-right">{globalColorGrade || 'Standard Print'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Main Content Area */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="flex-1 space-y-12 px-2"
            >
                {/* Global Narrative Unit - MASTER TITLE CARD */}
                <div className="bg-slate-950 rounded-[3.5rem] p-16 relative overflow-hidden shadow-2xl border-b-[12px] border-indigo-600">
                    {!isSettingsOpen && (
                        <button 
                            onClick={() => setIsSettingsOpen(true)}
                            className="absolute top-8 left-8 p-3 rounded-full bg-white/10 text-white/40 hover:text-white transition-colors z-20"
                        >
                            <Settings2 className="w-5 h-5" />
                        </button>
                    )}
                    <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-500/20 blur-[150px] -mr-[20rem] -mt-[20rem]" />
                    <div className="relative z-10 flex flex-col gap-10">
                        <div className="space-y-4">
                             <div className="flex items-center gap-4 text-[11px] font-black text-indigo-400 uppercase tracking-[0.6em]">
                                <Type className="w-5 h-5" /> Official Production Title
                            </div>
                            <h1 className="text-6xl font-black text-white leading-[0.9] selection:bg-indigo-500 tracking-tighter uppercase italic">
                                {comicTitle || "Untitled Production"}
                            </h1>
                        </div>

                        <div className="flex flex-col md:flex-row gap-16 items-start">
                            <div className="flex-1 space-y-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 text-[11px] font-black text-rose-400 uppercase tracking-[0.5em]">
                                        <Quote className="w-5 h-5" /> Logline
                                    </div>
                                    <p className="text-xl font-bold text-slate-300 leading-relaxed max-w-2xl italic">
                                        "{logline || narrativeArc}"
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-4 pt-4">
                                    <div className="px-5 py-2 rounded-full bg-white/5 border border-white/10 flex items-center gap-3">
                                        <Sparkles className="w-4 h-4 text-rose-400" />
                                        <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{artStyle || 'Draft Mode'}</span>
                                    </div>
                                    <div className="px-5 py-2 rounded-full bg-white/5 border border-white/10 flex items-center gap-3">
                                        <Users className="w-4 h-4 text-indigo-400" />
                                        <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{panels.length} Story Units</span>
                                    </div>
                                </div>
                            </div>
                            
                            {productionCredits && (
                                <div className="w-full md:w-80 bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 shrink-0 space-y-6">
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-4">Creative Ledger</div>
                                    <pre className="text-xs font-black text-indigo-200 font-mono leading-relaxed opacity-80 whitespace-pre-wrap lowercase">
                                        {productionCredits}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Panels Stream */}
                <div className={cn(
                    "grid gap-16",
                    layoutType === 'grid' ? "md:grid-cols-2" : "grid-cols-1"
                )}>
                    {panels.map((panel, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className={cn(
                                "group relative",
                                idx === 0 && layoutType === 'splash' ? "md:col-span-full" : ""
                            )}
                        >
                            <div className="bg-white border-4 border-slate-950 rounded-[4rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.1)] hover:shadow-[0_60px_120px_rgba(0,0,0,0.15)] transition-all duration-700 relative">
                                {/* Panel Header Stats */}
                                <div className="absolute top-10 right-10 flex flex-col items-center gap-4 z-20">
                                    <div className="w-16 h-16 rounded-[2rem] bg-slate-950 flex items-center justify-center text-white text-xl font-black border-4 border-white rotate-6 transition-transform group-hover:rotate-0 shadow-2xl">
                                        {panel.panel_number || idx + 1}
                                    </div>
                                    <div className="px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-slate-100 text-[9px] font-black uppercase text-slate-400 flex items-center gap-2">
                                        {panel.shot_type || 'STANDARD VIEW'}
                                        {panel.lettering_weight === 'Action' && <Zap className="w-3 h-3 text-rose-500 fill-rose-500" />}
                                        {panel.lettering_weight === 'Whimsy' && <Sparkles className="w-3 h-3 text-indigo-500" />}
                                    </div>
                                </div>

                                <div className={cn(
                                    "grid overflow-hidden",
                                    layoutType === 'splash' && idx === 0 ? "lg:grid-cols-5" : "lg:grid-cols-2"
                                )}>
                                    {/* Visual Production Log */}
                                    <div className={cn(
                                        "p-12 space-y-10 bg-slate-50 border-r-4 border-slate-950 group-hover:bg-indigo-50/10 transition-colors duration-700 font-sans",
                                        layoutType === 'splash' && idx === 0 ? "lg:col-span-3" : ""
                                    )}>
                                        <div className="space-y-8">
                                             {/* Technical Spec Box */}
                                             <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm space-y-2">
                                                    <div className="flex items-center gap-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                                        <PenTool className="w-3 h-3" /> Tooling
                                                    </div>
                                                    <p className="text-[10px] font-black text-slate-900">{panel.inking_style || 'G-Pen Heavy'}</p>
                                                </div>
                                                <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm space-y-2">
                                                    <div className="flex items-center gap-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                                        <Sun className="w-3 h-3" /> Ambience
                                                    </div>
                                                    <p className="text-[10px] font-black text-slate-900 truncate">{panel.lighting_setup || 'High Contrast'}</p>
                                                </div>
                                                <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm space-y-2">
                                                    <div className="flex items-center gap-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                                        <Sparkles className="w-3 h-3" /> Visual Texture
                                                    </div>
                                                    <p className="text-[10px] font-black text-slate-900 truncate">{panel.visual_texture || 'Flat/Matte'}</p>
                                                </div>
                                                <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm space-y-2">
                                                    <div className="flex items-center gap-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                                        <Target className="w-3 h-3" /> Layout
                                                    </div>
                                                    <p className="text-[10px] font-black text-slate-900 truncate uppercase">{panel.perspective || 'Eye-Level'}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <p className="text-base font-black text-slate-950 leading-relaxed bg-white p-8 rounded-[2.5rem] border-4 border-slate-100 group-hover:border-indigo-100 transition-all shadow-sm">
                                                    {panel.characters}
                                                </p>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="relative group/action">
                                                    <p className="text-base font-bold text-slate-600 leading-relaxed italic bg-slate-100 p-8 rounded-[2.5rem] border-2 border-slate-200">
                                                        {panel.action}
                                                    </p>
                                                    <button className="absolute -bottom-4 left-8 px-5 py-2 bg-slate-950 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all opacity-0 group-hover/action:opacity-100 hover:scale-105 flex items-center gap-2">
                                                        <Wand2 className="w-3.5 h-3.5 text-rose-400" /> Refine Draft
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 pt-6 border-t border-slate-200/50">
                                            <button
                                                onClick={() => handleCopy(`${panel.characters}. ${panel.perspective} view. ${panel.action}. ${panel.background}`, `cp-v-${idx}`)}
                                                className={cn(
                                                    "px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all flex-1 justify-center",
                                                    copySuccess === `cp-v-${idx}` ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200" : "bg-white text-slate-500 border border-slate-200 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50"
                                                )}
                                            >
                                                <ImageIcon className="w-4 h-4" /> {copySuccess === `cp-v-${idx}` ? "Blueprint Copied" : "Generate Render"}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Script & Lettering Side */}
                                    <div className="p-12 flex flex-col justify-center gap-10 bg-white relative">
                                        {panel.narrative_caption && (
                                            <div className="bg-yellow-100 border-4 border-slate-950 p-8 rounded-3xl shadow-[12px_12px_0_rgba(0,0,0,0.05)] -mx-6 rotate-[-1deg] group-hover:rotate-0 transition-transform relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-2 h-full bg-slate-950 opacity-10" />
                                                <p className="text-xs font-black text-slate-950 uppercase tracking-tight leading-relaxed">
                                                    {panel.narrative_caption}
                                                </p>
                                            </div>
                                        )}

                                        {panel.dialogue && (
                                            <div className="relative group/bubble flex flex-col items-center w-full">
                                                <div className="bg-white border-[6px] border-slate-950 p-12 rounded-[5rem] shadow-2xl relative w-full group-hover/bubble:-translate-y-2 transition-transform duration-500">
                                                    <p className="text-2xl font-black text-slate-950 leading-[0.9] text-center tracking-tighter">
                                                        "{panel.dialogue.toUpperCase()}"
                                                    </p>
                                                    <div className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 w-16 h-16 bg-white border-r-[6px] border-b-[6px] border-slate-950 rotate-45" />
                                                </div>
                                                <div className="flex items-center gap-3 mt-16 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                     <p>Word Count: {panel.dialogue.split(' ').length} (Limit 25)</p>
                                                </div>
                                            </div>
                                        )}

                                        {panel.thought_bubble && (
                                            <div className="relative group/thought">
                                                <div className="bg-white border-4 border-dotted border-slate-300 p-10 rounded-[5rem] shadow-sm relative mt-2 group-hover/thought:-translate-y-1 transition-transform">
                                                    <p className="text-lg font-bold text-slate-400 leading-tight italic text-center">
                                                        "{panel.thought_bubble}"
                                                    </p>
                                                    <div className="absolute bottom-[-20px] right-1/4 w-6 h-6 bg-white border-2 border-slate-100 rounded-full" />
                                                    <div className="absolute bottom-[-35px] right-1/3 w-3 h-3 bg-white border border-slate-100 rounded-full" />
                                                </div>
                                            </div>
                                        )}

                                        {panel.onomatopoeia && (
                                            <div className="flex flex-col items-center justify-center py-10 scale-110">
                                                <motion.div
                                                    whileHover={{ scale: 1.15, rotate: 0 }}
                                                    initial={{ rotate: -8 }}
                                                    className="bg-black text-white px-12 py-6 rounded-3xl border-[6px] border-indigo-500 shadow-[15px_15px_0_rgba(79,70,229,0.2)] relative"
                                                >
                                                    <span className="text-5xl font-black italic tracking-[calc(-0.1em)] uppercase drop-shadow-[4px_4px_0_rgba(15,23,42,1)]">
                                                        {panel.onomatopoeia}
                                                    </span>
                                                </motion.div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
