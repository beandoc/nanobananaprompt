"use client";

import { motion } from "framer-motion";
import { BlueprintData, InfographicSection } from "@/types";
import { cn } from "@/lib/utils";
import { 
    Download, Layers, MousePointer2, ZoomIn, ZoomOut, Share, Info, Zap, Type, Move,
    Heart, Brain, Wind, Stethoscope, Microscope, Activity, Shield, Leaf, Sun, Droplets,
    FlaskConical, Thermometer, BrainCircuit, Dna, Bone, Eye, BookOpen, LucideIcon
} from "lucide-react";
import { useState, useRef, useMemo } from "react";
import { toPng } from "html-to-image";

const ICON_MAP: Record<string, LucideIcon> = {
    Heart, Brain, Wind, Stethoscope, Microscope, Activity, Shield, Zap, Leaf, Sun, Droplets,
    FlaskConical, Thermometer, BrainCircuit, Dna, Bone, Eye
};

function HeroVector({ iconId, color, concept, detail }: { iconId?: string; color: string; concept: string; detail?: string }) {
    const Icon = (iconId && ICON_MAP[iconId]) ? ICON_MAP[iconId] : null;
    
    if (!Icon) return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center opacity-[0.05] pointer-events-none select-none">
            <h2 className="text-[60px] font-black uppercase tracking-[0.5em] mb-4">{concept}</h2>
            <p className="text-[20px] font-bold max-w-xl mx-auto italic">"{detail}"</p>
        </div>
    );

    return (
        <div className="relative w-full h-full flex items-center justify-center">
            {/* Layers of the Icon for watercolor bleed effect */}
            <motion.div 
                animate={{ scale: [1, 1.05, 1], opacity: [0.03, 0.08, 0.03] }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
                <Icon size={700} strokeWidth={0.5} style={{ color }} />
            </motion.div>
            
            <div className="relative z-10 flex flex-col items-center">
                <div className="p-20 rounded-full bg-white/40 backdrop-blur-3xl border-8 border-white shadow-2xl relative group">
                    <Icon size={340} strokeWidth={1} style={{ color }} className="drop-shadow-2xl" />
                    <div className="absolute inset-0 rounded-full bg-current opacity-[0.02]" style={{ color }} />
                </div>
                
                {/* Float concepts around it */}
                <div className="mt-14 px-12 py-5 bg-slate-900/90 backdrop-blur-3xl rounded-full text-white/90 border border-white/20 shadow-2xl text-[14px] font-black uppercase tracking-[0.4em] italic text-center max-w-[500px]">
                    {concept}
                </div>
            </div>
        </div>
    );
}

interface InfographicEngineProps {
    data: BlueprintData;
}

// ─── Canvas Dimensions ────────────────────────────────────────────────────────
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 1600;

// ─── Helper: Get Quadrant and Position ────────────────────────────────────────
interface PositionedSection extends InfographicSection {
    renderX: number;
    renderY: number;
    labelX: number;
    labelY: number;
    anchorSide: 'left' | 'right';
}

export function InfographicEngine({ data }: InfographicEngineProps) {
    const [viewMode, setViewMode] = useState<"canvas" | "blueprint">("canvas");
    const [scale, setScale] = useState(0.8);
    const canvasRef = useRef<HTMLDivElement>(null);

    const accent = data.color_palette?.accent ?? "#6366f1";
    const primary = data.color_palette?.primary ?? "#1e293b";
    const zoneColors = data.color_palette?.zone_colors ?? [];

    // ─── Phase 5.2: Smart Layout Calculation ───────────────────────────────────
    const positionedSections = useMemo(() => {
        if (!data.sections) return [];

        const sections = data.sections!.map((s, idx) => {
            const rx = (s.x_percent ?? 50) * 8 + 200; // Map to 200-1000 range inside 1200
            const ry = (s.y_percent ?? 50) * 5 + 850; // Map to 850-1350 range
            
            // Heuristic: Project label towards the nearest edge
            const anchorSide: 'left' | 'right' = rx < CANVAS_WIDTH / 2 ? 'left' : 'right';
            const labelX = anchorSide === 'left' ? 80 : CANVAS_WIDTH - 440; // Fixed gutter for labels
            
            // Vertical stacking to avoid overlapping labels on the same side
            const sameSideIdx = data.sections!.slice(0, idx).filter(prev => {
                const prevAnchor = ((prev.x_percent ?? 50) * 8 + 200) < CANVAS_WIDTH / 2 ? 'left' : 'right';
                return prevAnchor === anchorSide;
            }).length;

            const labelY = 850 + (sameSideIdx * 160); // 160px vertical separation

            return {
                ...s,
                renderX: rx,
                renderY: ry,
                labelX,
                labelY,
                anchorSide
            } as PositionedSection;
        });

        return sections;
    }, [data.sections]);

    const handleDownload = async () => {
        if (!canvasRef.current) return;
        const dataUrl = await toPng(canvasRef.current, { quality: 1, pixelRatio: 2 });
        const link = document.createElement("a");
        link.download = `${data.infographic_title || "infographic"}.png`;
        link.href = dataUrl;
        link.click();
    };

    if (!data.sections) return null;

    return (
        <div className="space-y-6">
            {/* Control Bar */}
            <div className="bg-white/90 backdrop-blur-xl border border-white rounded-[2rem] p-5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white shrink-0">
                        <Type className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none mb-1">
                            {data.infographic_title}
                        </h1>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                             AI COMPOSITION ENGINE • {data.edition_tag}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                        <button onClick={() => setViewMode("canvas")} className={cn("px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all", viewMode === "canvas" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400")}>Canvas</button>
                        <button onClick={() => setViewMode("blueprint")} className={cn("px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all", viewMode === "blueprint" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400")}>Blueprint</button>
                    </div>
                    <div className="h-8 w-[1px] bg-slate-200 mx-1" />
                    <button onClick={() => setScale(s => Math.max(0.4, s - 0.1))} className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"><ZoomOut className="w-4 h-4" /></button>
                    <span className="text-[10px] font-black text-slate-500 w-10 text-center">{Math.round(scale * 100)}%</span>
                    <button onClick={() => setScale(s => Math.min(1.5, s + 0.1))} className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"><ZoomIn className="w-4 h-4" /></button>
                    <button onClick={handleDownload} className="ml-2 px-6 py-2.5 bg-slate-900 text-white rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-2 shadow-xl hover:shadow-indigo-200 active:scale-95">
                        <Download className="w-4 h-4" /> Download PNG
                    </button>
                </div>
            </div>

            {/* Canvas Area */}
            {viewMode === "canvas" ? (
                <div className="relative w-full overflow-auto bg-[#f1f5f9] rounded-[3.5rem] p-16 min-h-[900px] flex justify-center">
                    <div 
                        ref={canvasRef}
                        style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
                        className="bg-white shadow-[0_60px_150px_rgba(0,0,0,0.12)] rounded-[0.25rem] relative shrink-0 border-[20px] border-white"
                    >
                        <div style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, backgroundColor: data.color_palette?.background || "#fdfdfb" }} className="relative font-sans text-slate-950 overflow-hidden">
                            
                            {/* Paper Grain Layer */}
                            <div className="absolute inset-0 opacity-[0.04] pointer-events-none z-[100]" style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/natural-paper.png")` }} />

                            {/* ════════ LAYER 1: MASTHEAD ════════ */}
                            <div className="absolute top-0 left-0 w-full p-28 z-20" style={{ backgroundColor: primary }}>
                                <div className="absolute top-0 right-0 w-[800px] h-[800px] blur-[250px] opacity-[0.14] rounded-full" style={{ backgroundColor: accent }} />
                                <div className="relative">
                                    <span className="inline-block px-5 py-2 rounded-full border-2 border-white/10 text-[13px] font-black uppercase tracking-[0.4em] text-white/40 mb-10">{data.edition_tag}</span>
                                    <h1 className="text-[110px] font-black text-white leading-[0.88] tracking-tighter mb-10 max-w-[900px] italic">
                                        {data.infographic_title}
                                    </h1>
                                    <p className="text-3xl font-medium text-white/40 max-w-[750px] leading-snug">
                                        {data.subtitle}
                                    </p>
                                </div>
                            </div>

                            {/* ════════ LAYER 2: GLOBAL STAT HOOK ════════ */}
                            <div className="absolute top-[520px] left-0 w-full px-28 py-32 flex items-center gap-20 border-b border-slate-100 bg-white shadow-sm">
                                <div className="text-[240px] font-black leading-none tracking-tighter" style={{ color: accent }}>
                                    {data.global_stat_callout?.stat}
                                </div>
                                <div className="max-w-xl">
                                    <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-300 block mb-4">A Sovereign Insight</span>
                                    <p className="text-4xl font-black text-slate-900 leading-tight mb-6">
                                        {data.global_stat_callout?.label}
                                    </p>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest border-l-2 border-slate-100 pl-4 py-1">Source: {data.global_stat_callout?.source}</p>
                                </div>
                            </div>

                            {/* ════════ LAYER 3: THE COMPOSITION CENTER (Pins + Lines + Labels) ════════ */}
                            <div className="absolute top-[900px] left-0 w-full h-[650px] z-30">
                                
                                {/* Central Hero Vector Visual */}
                                <HeroVector 
                                    iconId={data.central_visual_metaphor?.hero_icon_id} 
                                    color={accent} 
                                    concept={data.central_visual_metaphor?.concept || ""} 
                                    detail={data.central_visual_metaphor?.rendering_detail}
                                />

                                {/* Rendering Pins & Leader Lines */}
                                <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
                                    <defs>
                                        <filter id="hand-drawn" x="-20%" y="-20%" width="140%" height="140%">
                                            <feTurbulence type="fractalNoise" baseFrequency="0.1" numOctaves="3" result="noise" />
                                            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
                                        </filter>
                                    </defs>
                                    {positionedSections.map((s, idx) => (
                                        <motion.path 
                                            key={`line-${idx}`}
                                            initial={{ pathLength: 0, opacity: 0 }}
                                            animate={{ pathLength: 1, opacity: 0.15 }}
                                            transition={{ delay: 0.8 + idx * 0.1, duration: 1.5 }}
                                            d={`M ${s.renderX} ${s.renderY} Q ${(s.renderX + s.labelX + (s.anchorSide === 'left' ? 350 : 0)) / 2} ${s.renderY} ${s.anchorSide === 'left' ? s.labelX + 360 : s.labelX} ${s.labelY + 80}`}
                                            stroke={s.color_zone || accent}
                                            strokeWidth="3"
                                            strokeDasharray="6 10"
                                            fill="none"
                                            filter="url(#hand-drawn)"
                                        />
                                    ))}
                                </svg>

                                {/* Pins */}
                                {positionedSections.map((s, idx) => (
                                    <motion.div 
                                        key={`pin-${idx}`}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.8 + idx * 0.1, type: "spring" }}
                                        className="absolute w-14 h-14 -ml-7 -mt-7 rounded-full border-4 border-white shadow-2xl z-50 flex items-center justify-center text-xs font-black text-white cursor-pointer hover:scale-125 transition-transform"
                                        style={{ left: s.renderX, top: s.renderY, backgroundColor: s.color_zone || accent }}
                                    >
                                        {idx + 1}
                                        <div className="absolute inset-0 rounded-full animate-ping opacity-20 pointer-events-none" style={{ backgroundColor: s.color_zone || accent }} />
                                    </motion.div>
                                ))}

                                {/* Packed Callout Labels */}
                                {positionedSections.map((s, idx) => (
                                    <motion.div
                                        key={`label-${idx}`}
                                        initial={{ opacity: 0, x: s.anchorSide === 'left' ? -20 : 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 1 + idx * 0.12 }}
                                        className="absolute w-[360px] bg-white border border-slate-100/50 p-8 rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] z-40"
                                        style={{ left: s.labelX, top: s.labelY, borderLeft: s.anchorSide === 'left' ? `8px solid ${s.color_zone || accent}` : 'none', borderRight: s.anchorSide === 'right' ? `8px solid ${s.color_zone || accent}` : 'none' }}
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-xl font-black text-slate-900 leading-[1.1]">{s.headline}</h3>
                                            <span className="text-[10px] font-black text-slate-300">MOD {s.section_id}</span>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <p className="text-[42px] font-black leading-none tracking-tighter" style={{ color: s.color_zone || accent }}>
                                                {s.stat_highlight?.value}
                                            </p>
                                            <p className="text-[12px] font-bold text-slate-600 leading-snug underline decoration-slate-100 underline-offset-4 decoration-2">
                                                {s.detailed_narrative}
                                            </p>
                                            <div className="pt-2 space-y-2">
                                                {s.annotations?.slice(0, 2).map((ann, i) => (
                                                    <p key={i} className="text-[10px] font-bold text-slate-400 uppercase tracking-tight flex items-start gap-2">
                                                        <span style={{ color: s.color_zone || accent }}>•</span> {ann}
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* ════════ LAYER 4: PULL QUOTES & FOOTER ════════ */}
                            <div className="absolute bottom-[40px] left-0 w-full px-28 flex flex-col gap-12">
                                {/* Pull Quote Band */}
                                <div className="grid grid-cols-2 gap-12">
                                    {data.pull_quotes?.slice(0, 2).map((pq, i) => (
                                        <div key={i} className="relative p-10 bg-slate-50 border border-slate-100 rounded-[2.5rem] italic">
                                            <span className="absolute top-4 left-6 text-[80px] font-serif text-slate-200 leading-none">“</span>
                                            <p className="text-xl font-bold text-slate-800 leading-relaxed relative z-10 px-4">
                                                {pq.quote}
                                            </p>
                                            <p className="text-[11px] font-black uppercase tracking-widest text-indigo-400 mt-6 px-4">— {pq.attribution || "Research Note"}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Bibliography Footer */}
                                <div className="pt-12 border-t-2 border-slate-50 flex items-end justify-between">
                                    <div className="max-w-2xl">
                                        <span className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em] block mb-4">Methodology & Grounding</span>
                                        <p className="text-sm font-medium text-slate-500 italic leading-relaxed">
                                            {data.footer_methodology}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-3 mb-2 justify-end">
                                            <Zap className="w-5 h-5 text-amber-400" />
                                            <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 italic">Sovereign Engine v2.5</p>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">© 2024 • AI Data Visualization Protocol</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-12 shadow-2xl overflow-auto max-h-[1000px]">
                    <div className="flex items-center justify-between mb-10 border-b border-white/10 pb-6">
                        <span className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.4em]">Engine Blueprint Output</span>
                        <div className="flex gap-2">
                             <div className="w-3 h-3 rounded-full bg-rose-500" />
                             <div className="w-3 h-3 rounded-full bg-amber-500" />
                             <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        </div>
                    </div>
                    <pre className="text-xs font-mono text-slate-300 selection:bg-indigo-500/30">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                </div>
            )}

            {/* Controller Help */}
            <div className="flex flex-wrap items-center justify-center gap-10 py-10 bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-white">
                <div className="flex items-center gap-3 grayscale hover:grayscale-0 transition-all">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                        <Move className="w-4 h-4 text-indigo-500" />
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Collision Detection</span>
                </div>
                <div className="flex items-center gap-3 grayscale hover:grayscale-0 transition-all">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                        <Zap className="w-4 h-4 text-emerald-500" />
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Adaptive Framing</span>
                </div>
                <div className="flex items-center gap-3 grayscale hover:grayscale-0 transition-all">
                    <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-100">
                        <Layers className="w-4 h-4 text-orange-500" />
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Vector Pathing</span>
                </div>
                <div className="flex items-center gap-3 grayscale hover:grayscale-0 transition-all">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                        <Download className="w-4 h-4 text-slate-500" />
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">PNG Alpha Export</span>
                </div>
            </div>
        </div>
    );
}
