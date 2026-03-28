"use client";

import { motion } from "framer-motion";
import { 
    BookOpen, Check, MessageSquare, Zap, Target, 
    Image as ImageIcon, Palette, Settings2, 
    Layers, MousePointer2, Wand2, UploadCloud,
    History, Users, Sparkles, Globe, PenTool,
    Sun, Move, Layout, Dices, Quote, Type,
    FileText, Layers2, AlignLeft
} from "lucide-react";
import { Tooltip } from "../Shared/Tooltip";
import { cn } from "@/lib/utils";
import { ComicPanel, ComicPage } from "@/types";
import { useState } from "react";

interface ComicEngineProps {
    comicTitle?: string;
    logline?: string;
    narrativeArc: string;
    panels?: ComicPanel[];
    comicPages?: ComicPage[];
    artStyle?: string;
    letteringStyle?: string;
    layoutType?: string;
    globalColorGrade?: string;
    pacingEnergy?: string;
    productionCredits?: string;
    consistentCharacter?: string;
    castOfCharacters?: Array<{ name: string; description: string; role?: string }>;
    handleCopy: (text: string, id: string) => void;
    onRender?: (data: any) => void;
    copySuccess: string | null;
}

export function ComicEngine({
    comicTitle,
    logline,
    narrativeArc,
    panels = [],
    comicPages = [],
    artStyle,
    letteringStyle,
    layoutType = 'vertical',
    globalColorGrade,
    pacingEnergy,
    productionCredits,
    consistentCharacter,
    castOfCharacters = [],
    handleCopy,
    onRender,
    copySuccess
}: ComicEngineProps) {
    const [selectedModel, setSelectedModel] = useState<'nano' | 'seedream'>('nano');
    const [isSettingsOpen, setIsSettingsOpen] = useState(true);
    const [viewMode, setViewMode] = useState<'scroll' | 'pages'>(comicPages.length > 0 ? 'pages' : 'scroll');

    const renderPanel = (panel: ComicPanel, idx: number, isGrid = false) => {
        if (isGrid) {
            // MANGA INSPIRED COMPACT GRID VIEW
            return (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border-2 border-slate-900 rounded-[2rem] p-6 shadow-[8px_8px_0_rgba(15,23,42,0.05)] hover:shadow-[12px_12px_0_rgba(15,23,42,0.1)] transition-all group/panel relative overflow-hidden flex flex-col h-full"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white text-[10px] font-black">
                            {panel.panel_number || idx + 1}
                        </div>
                        <div className="flex gap-2">
                             <Tooltip content="Generate Render">
                                <button
                                    onClick={() => onRender?.({ ...panel, comic_title: comicTitle, art_style: artStyle, global_color_grade: globalColorGrade, consistent_character: consistentCharacter })}
                                    className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                                >
                                    <ImageIcon className="w-3.5 h-3.5" />
                                </button>
                            </Tooltip>
                            <Tooltip content="Copy Script">
                                <button
                                    onClick={() => handleCopy(`${panel.characters}. ${panel.action}`, `p-${idx}`)}
                                    className={cn(
                                        "w-8 h-8 rounded-lg border flex items-center justify-center transition-colors",
                                        copySuccess === `p-${idx}` ? "bg-emerald-500 text-white border-emerald-400" : "border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200"
                                    )}
                                >
                                    {copySuccess === `p-${idx}` ? <Check className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                                </button>
                            </Tooltip>
                        </div>
                    </div>

                    <div className="space-y-4 flex-1">
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 italic text-[11px] font-bold text-slate-600 leading-relaxed group-hover/panel:bg-white transition-colors">
                            "{panel.action}"
                        </div>
                        
                        {panel.dialogue && (
                            <div className="bg-white border-2 border-slate-900 p-3 rounded-2xl relative shadow-sm">
                                <p className="text-[10px] font-black text-slate-900 uppercase leading-tight text-center">
                                    {panel.dialogue}
                                </p>
                                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r-2 border-b-2 border-slate-900 rotate-45" />
                            </div>
                        )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                         <span className="px-2 py-0.5 bg-slate-100 rounded text-[8px] font-black text-slate-400 uppercase tracking-widest">{panel.shot_type || 'Medium'}</span>
                         <span className="px-2 py-0.5 bg-indigo-50 rounded text-[8px] font-black text-indigo-400 uppercase tracking-widest">{panel.inking_style || 'Digital'}</span>
                    </div>
                </motion.div>
            );
        }

        // ORIGINAL FULL-WIDTH VIEW
        return (
            <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                    "group relative",
                    idx === 0 && layoutType === 'splash' ? "md:col-span-full" : ""
                )}
            >
                <div className="bg-white border-4 border-slate-950 rounded-[4rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.1)] hover:shadow-[0_60px_120px_rgba(0,0,0,0.15)] transition-all duration-700 relative">
                    <div className="absolute top-10 right-10 flex flex-col items-center gap-4 z-20">
                        <div className="w-16 h-16 rounded-[2rem] bg-slate-950 flex items-center justify-center text-white text-xl font-black border-4 border-white rotate-6 transition-transform group-hover:rotate-0 shadow-2xl">
                            {panel.panel_number || idx + 1}
                        </div>
                    </div>

                    <div className={cn(
                        "grid overflow-hidden lg:grid-cols-2",
                        layoutType === 'splash' && idx === 0 ? "lg:grid-cols-5" : ""
                    )}>
                        <div className={cn(
                            "p-12 space-y-10 bg-slate-50 border-r-4 border-slate-950 group-hover:bg-indigo-50/10 transition-colors duration-700 font-sans",
                            layoutType === 'splash' && idx === 0 ? "lg:col-span-3" : ""
                        )}>
                            <div className="space-y-8">
                                 <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm space-y-2">
                                        <div className="flex items-center gap-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                            <PenTool className="w-3.5 h-3.5" /> Tooling
                                        </div>
                                        <p className="text-[10px] font-black text-slate-900">{panel.inking_style || 'G-Pen Heavy'}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm space-y-2">
                                        <div className="flex items-center gap-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                            <Target className="w-3.5 h-3.5" /> Perspective
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
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6 border-t border-slate-200/50">
                                <button
                                    onClick={() => onRender?.({ ...panel, comic_title: comicTitle, art_style: artStyle, global_color_grade: globalColorGrade, consistent_character: consistentCharacter })}
                                    className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all flex-1 justify-center bg-white text-slate-500 border border-slate-200 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50"
                                >
                                    <ImageIcon className="w-4 h-4" /> Generate Render
                                </button>
                            </div>
                        </div>

                        <div className="p-12 flex flex-col justify-center gap-10 bg-white relative">
                            {panel.narrative_caption && (
                                <div className="bg-yellow-100 border-4 border-slate-950 p-8 rounded-3xl shadow-[12px_12px_0_rgba(0,0,0,0.05)] -mx-6 rotate-[-1deg] group-hover:rotate-0 transition-transform">
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
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="flex flex-col xl:flex-row gap-4 xl:gap-8 mb-10 md:mb-20 relative font-sans">
            {/* Left Sidebar: Production Control - Hidden on Mobile, can be toggled if needed */}
            {isSettingsOpen && (
                <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full xl:w-80 shrink-0 flex flex-col gap-6 xl:sticky xl:top-24 xl:h-[calc(100vh-8rem)]"
                >
                    <div className="bg-white border-2 md:border-4 border-slate-900 rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 shadow-xl flex flex-col gap-6 md:gap-8 overflow-y-auto">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-900">Production Hub</h3>
                            <button onClick={() => setIsSettingsOpen(false)} className="text-slate-300 hover:text-rose-500 transition-colors">
                                <Settings2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">View Perspective</label>
                            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 md:p-1.5 rounded-xl md:rounded-2xl border-2 border-slate-100">
                                <button 
                                    onClick={() => setViewMode('scroll')}
                                    className={cn(
                                        "px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all gap-2 flex items-center justify-center",
                                        viewMode === 'scroll' ? "bg-black text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    <AlignLeft className="w-3 md:w-3.5 h-3 md:h-3.5" /> Strip
                                </button>
                                <button 
                                    onClick={() => setViewMode('pages')}
                                    className={cn(
                                        "px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all gap-2 flex items-center justify-center",
                                        viewMode === 'pages' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    <Layers2 className="w-3 md:w-3.5 h-3 md:h-3.5" /> Pages
                                </button>
                            </div>
                        </div>

                         {/* Model Selector */}
                         <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Art Engine Algorithm</label>
                            <div className="grid grid-cols-1 gap-2">
                                <button className="w-full px-4 md:px-5 py-3 rounded-xl bg-black text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-between group">
                                    Nano Banana 2.0
                                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                                </button>
                            </div>
                        </div>

                        {/* Cast of Characters Tray */}
                        {(castOfCharacters.length > 0 || consistentCharacter) && (
                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                                    <Users className="w-3 h-3" /> Cast of Characters
                                </label>
                                <div className="space-y-3">
                                    {castOfCharacters.length > 0 ? (
                                        castOfCharacters.map((char, cIdx) => (
                                            <div key={cIdx} className="bg-slate-50 border border-slate-100 rounded-xl p-3 hover:border-indigo-200 transition-colors group/char">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-[10px] font-black text-slate-900 uppercase truncate">{char.name}</span>
                                                    {char.role && <span className="text-[8px] font-black text-indigo-400 bg-indigo-50 px-1.5 py-0.5 rounded uppercase">{char.role}</span>}
                                                </div>
                                                <p className="text-[9px] font-bold text-slate-500 leading-tight line-clamp-2 group-hover/char:line-clamp-none transition-all">
                                                    {char.description}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3">
                                            <span className="text-[10px] font-black text-indigo-900 uppercase block mb-1">Primary Anchor</span>
                                            <p className="text-[9px] font-bold text-indigo-600 leading-tight">
                                                {consistentCharacter}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Creative Spark / Randomize */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Creative Spark</label>
                            <button className="w-full h-16 md:h-20 rounded-2xl md:rounded-[1.5rem] bg-slate-100 text-slate-400 flex flex-col items-center justify-center gap-1 md:gap-2 hover:bg-slate-200 transition-all border-2 border-slate-200 border-dashed">
                                <Dices className="w-5 md:w-6 h-5 md:h-6" />
                                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest">Randomize Story</span>
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Main Content Area */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="flex-1 space-y-8 md:space-y-12 px-1 md:px-2"
            >
                {/* Global Narrative Unit - MASTER TITLE CARD */}
                <div className="bg-slate-950 rounded-[2rem] md:rounded-[3.5rem] p-8 md:p-16 relative overflow-hidden shadow-2xl border-b-[8px] md:border-b-[12px] border-indigo-600">
                    {!isSettingsOpen && (
                        <button onClick={() => setIsSettingsOpen(true)} className="absolute top-4 md:top-8 left-4 md:left-8 p-2.5 md:p-3 rounded-full bg-white/10 text-white/40 hover:text-white transition-colors z-20">
                            <Settings2 className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                    )}
                    <div className="absolute top-0 right-0 w-[20rem] md:w-[40rem] h-[20rem] md:h-[40rem] bg-indigo-500/20 blur-[100px] md:blur-[150px] -mr-[10rem] md:-mr-[20rem] -mt-[10rem] md:-mt-[20rem]" />
                    <div className="relative z-10 flex flex-col gap-6 md:gap-10">
                        <div className="space-y-3 md:space-y-4">
                             <div className="flex items-center gap-3 md:gap-4 text-[9px] md:text-[11px] font-black text-indigo-400 uppercase tracking-[0.4em] md:tracking-[0.6em]">
                                <Type className="w-4 md:w-5 h-4 md:h-5" /> Official Graphic Novel
                            </div>
                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-[0.9] selection:bg-indigo-500 tracking-tighter uppercase italic break-words">
                                {comicTitle || "Untitled Creation"}
                            </h1>
                        </div>

                        <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-start">
                            <div className="flex-1 space-y-6 md:space-y-8">
                                <div className="space-y-3 md:space-y-4">
                                    <div className="flex items-center gap-3 md:gap-4 text-[9px] md:text-[11px] font-black text-rose-400 uppercase tracking-[0.3em] md:tracking-[0.5em]">
                                        <Quote className="w-4 md:w-5 h-4 md:h-5" /> Logline
                                    </div>
                                    <p className="text-lg md:text-xl font-bold text-slate-300 leading-relaxed max-w-2xl italic">
                                        "{logline || narrativeArc}"
                                    </p>
                                </div>

                                {consistentCharacter && (
                                    <div className="bg-indigo-500/10 border-2 border-indigo-500/20 p-5 md:p-6 rounded-2xl md:rounded-[2rem] flex flex-col gap-2 md:gap-3 relative group overflow-hidden">
                                        <div className="flex items-center gap-2 md:gap-3 text-[9px] md:text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                                            <Target className="w-3.5 md:w-4 h-3.5 md:h-4 animate-pulse" /> Identity Locked
                                        </div>
                                        <p className="text-xs md:text-sm font-bold text-white leading-relaxed opacity-90">
                                            {consistentCharacter}
                                        </p>
                                    </div>
                                )}
                            </div>
                            
                            {productionCredits && (
                                <div className="w-full md:w-80 bg-white/5 backdrop-blur-xl rounded-2xl md:rounded-[2.5rem] p-6 md:p-8 border border-white/10 shrink-0 space-y-4 md:space-y-6">
                                    <div className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-3 md:pb-4">Production Ledger</div>
                                    <pre className="text-[10px] md:text-xs font-black text-indigo-200 font-mono leading-relaxed opacity-80 whitespace-pre-wrap">
                                        {productionCredits}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content Stream */}
                {viewMode === 'pages' && comicPages.length > 0 ? (
                    <div className="space-y-16 md:space-y-24">
                        {comicPages.map((page, pIdx) => (
                            <div key={pIdx} className="space-y-8 md:space-y-12">
                                <div className="flex items-center gap-4 md:gap-6 px-2 md:px-4">
                                    <div className="h-px bg-slate-200 flex-1" />
                                    <div className="px-4 md:px-6 py-1.5 md:py-2 bg-slate-900 text-white rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em]">
                                        Page {page.page_number || pIdx + 1}
                                    </div>
                                    <div className="h-px bg-slate-200 flex-1" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                    {page.panels.map((p, idx) => renderPanel(p, idx + (pIdx * 10), true))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={cn(
                        "grid gap-8 md:gap-16",
                        layoutType === 'grid' ? "md:grid-cols-2" : "grid-cols-1"
                    )}>
                        {(panels.length > 0 ? panels : (comicPages[0]?.panels || [])).map((panel, idx) => renderPanel(panel, idx))}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
