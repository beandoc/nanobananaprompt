import React, { useRef } from "react";
import { motion } from "framer-motion";
import { 
    Zap, 
    Users, 
    Activity, 
    Database, 
    Layers, 
    Heart, 
    Brain, 
    Baby, 
    Syringe, 
    Pill, 
    Droplet, 
    Beaker, 
    Shield,
    Clock,
    Skull,
    Stethoscope,
    ChevronRight,
    Search
} from "lucide-react";
import { toPng } from "html-to-image";
import { cn } from "@/lib/utils";

// ─── Sovereign 23.0 "Masterpiece" Engine (The Ultimate Synthesis) ───────────
// This engine replicates the physical depth and textural quality of DALL-E 3 
// but preserves the absolute clinical deterministic accuracy of React.

const ICON_MAP: Record<string, React.ReactNode> = {
    Heart: <Heart />,
    Kidney: <Database />,
    Lungs: <Layers />,
    Baby: <Baby />,
    Brain: <Brain />,
    Activity: <Activity />,
    Users: <Users />,
    Database: <Database />,
    Beaker: <Beaker />,
    Droplet: <Droplet />,
    Syringe: <Syringe />,
    Pill: <Pill />,
    Shield: <Shield />,
    Clock: <Clock />,
    Skull: <Skull />,
    IV_Bag: <Droplet />,
    Steroid_Vial: <Beaker />,
    Infusion: <Droplet />,
    Vial: <Beaker />,
    Patient_Group: <Users />,
    ICU_Patient: <Activity />,
    Ventilator: <Activity />
};

const SmartIcon = ({ iconId, className, style }: { iconId: string; className?: string; style?: React.CSSProperties }) => {
    const key = Object.keys(ICON_MAP).find(k => iconId.toLowerCase().includes(k.toLowerCase())) || "Activity";
    const IconNode = ICON_MAP[iconId] || ICON_MAP[key] || <Activity />;
    return React.cloneElement(IconNode as React.ReactElement<{ className?: string; style?: React.CSSProperties }>, { className, style });
};

// ─── Outcome Strip (The Hybrid DALL-E/React Strip) ───────────────────────────

function NarrativeStrip({ metric, armCount, accent }: { metric: any; armCount: number; accent: string }) {
    if (!metric) return null;
    
    return (
        <div className="relative border-b border-slate-100 last:border-0 bg-white group min-h-[140px]">
            <div className={`grid grid-cols-[0.32fr,repeat(${armCount},1fr)] h-full items-stretch`}>
                
                {/* THE LABEL ANCHOR (Extreme Contrast & Pro-Iconify) */}
                <div className="flex flex-col justify-center px-12 py-8 bg-[#f8fafc]/30 border-r border-slate-100">
                    <div className="flex items-center gap-5">
                       <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg overflow-hidden shrink-0 icon-3d-shadow">
                           <SmartIcon iconId={metric.label?.split(' ')[0] || "Activity"} className="w-6 h-6" />
                       </div>
                       <h4 className="text-[16px] font-bold text-slate-900 leading-tight scholarly-serif italic tracking-tight">
                            {metric.label}
                       </h4>
                    </div>
                    {/* The "Primary" Ribbon Marker */}
                    {metric.primary && (
                        <div className="mt-4 inline-flex items-center gap-2 bg-[#B04C4C] text-white px-2.5 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest italic animate-pulse">
                           Primary Endpoint
                        </div>
                    )}
                </div>

                {/* THE DATA ARMS (The "Journal-Print" Data Presentation) */}
                {metric.values?.map((v: any, i: number) => (
                    <div key={i} className={cn(
                        "flex flex-col items-center justify-center px-8 border-r border-slate-50 last:border-r-0 relative overflow-hidden",
                        i % 2 === 0 ? "bg-[#f8fafc]/10" : "bg-white"
                    )}>
                        {/* THE PROPORTIONAL GLOSS BAR (The 3D Hybrid Look) */}
                        <div className="w-full h-3 bg-slate-100 rounded-full mb-5 relative overflow-hidden shadow-inner">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${parseFloat(v.outcome_value) || 0}%` }}
                                transition={{ duration: 1.2, ease: "circOut" }}
                                className="h-full rounded-full shadow-[0_0_15px_rgba(0,0,0,0.1)]"
                                style={{ 
                                    backgroundColor: accent,
                                    backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.1) 100%)'
                                }}
                            />
                        </div>

                        <div className="text-[52px] font-black text-slate-950 leading-none tracking-tighter mb-1 font-sans antialiased drop-shadow-sm">
                            {typeof v === 'object' ? v.outcome_value : v}
                        </div>
                        <div className="text-[14px] font-bold text-slate-400 uppercase tracking-[0.2em] font-sans opacity-60">
                            {typeof v === 'object' ? v.sub_stat : ""}
                        </div>
                    </div>
                ))}
            </div>

            {/* THE EFFECT OVERLAY (The Floating Scientific Annotation) */}
            {metric.effect && (
                <div className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center gap-5 bg-white px-6 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-slate-100 z-10 scale-95 group-hover:scale-100 transition-all cursor-default">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                    <div className="text-[14px] font-bold text-slate-600 font-sans italic tracking-tight">
                        {metric.effect} {metric.p_value ? `| p=${metric.p_value}` : ""}
                    </div>
                </div>
            )}
        </div>
    );
}

export function InfographicEngine({ data }: { data: any }) {
    const canvasRef = useRef<HTMLDivElement>(null);
    const accent = data.color_scheme?.accent || "#1A365D";
    const armCount = data.panels?.filter((p: any) => p.position !== "left").length || 2;

    const handleDownload = async () => {
        if (!canvasRef.current) return;
        try {
            const dataUrl = await toPng(canvasRef.current, { 
                quality: 1, 
                pixelRatio: 4,
                backgroundColor: "#FFFFFF"
            });
            const link = document.createElement("a");
            link.download = `SVAE-23-MASTERPIECE-${data.title?.slice(0, 15)}.png`;
            link.href = dataUrl;
            link.click();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="space-y-12 bg-slate-50 p-6 min-h-screen">
            {/* MASTER CONTROL DECK */}
            <div className="max-w-[1240px] mx-auto bg-slate-950 p-8 shadow-3xl text-white flex items-center justify-between rounded-t-3xl">
                <div className="flex items-center gap-8">
                    <div className="w-16 h-16 bg-white flex items-center justify-center text-slate-950 rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                        <Zap className="w-8 h-8 text-cyan-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tighter leading-none mb-2">{data.title}</h1>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em]">Sovereign 23.0 Masterpiece Mode</span>
                            <span className="w-1 h-1 bg-slate-700 rounded-full" />
                            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Texture-Forced Hybrid Synthesis</span>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={handleDownload}
                    className="bg-white hover:bg-cyan-50 text-slate-950 px-12 py-5 font-black text-[11px] uppercase tracking-[0.4em] active:scale-95 transition-all shadow-[0_15px_40px_rgba(0,0,0,0.3)] rounded-xl"
                >
                    Export Masterpiece Plate 
                </button>
            </div>

            {/* THE MASTER CANVAS (1200px Grid Locked) */}
            <div className="flex justify-center overflow-x-auto pb-40">
                <div 
                    ref={canvasRef}
                    className="bg-white shadow-5xl relative flex flex-col overflow-hidden border border-slate-200 paper-texture"
                    style={{ width: '1200px', minHeight: '1150px' }}
                >
                    {/* MASTER FRONT-MATTER (Journal Ident) */}
                    <div className="px-24 pt-28 pb-12 relative overflow-hidden">
                        {/* THE PRO "EQUILIBRIUM" WASH */}
                        <div className="absolute inset-0 bg-gradient-to-b from-[#f8fafc] to-white pointer-events-none opacity-40" />
                        
                        <div className="flex flex-col gap-10 relative z-10">
                            <div className="flex items-center gap-6">
                                <div className="text-[12px] font-bold text-slate-500 tracking-[0.7em] scholarly-serif uppercase opacity-60">
                                    THE NEW ENGLAND <span className="font-light">JOURNAL</span> OF MEDICINE
                                </div>
                                <div className="h-px flex-1 bg-slate-100" />
                                <div className="text-[11px] font-black text-slate-300 tracking-[0.2em]">PRINT-SPEC V24.1</div>
                            </div>
                            
                            <h2 className="text-[58px] font-extrabold text-[#0a1f44] leading-[0.95] tracking-tight max-w-[1000px] scholarly-serif italic antialiased">
                                {data.title}
                            </h2>

                            {/* THE PRIMARY HEADLINE BELT - REDUCED HEIGHT FOR EQUILIBRIUM */}
                            <div className="mt-4 nejm-header-gradient py-4 px-10 shadow-[0_15px_40px_rgba(0,0,0,0.08)] border-l-[8px] border-[#C5A059] relative overflow-hidden">
                                <h3 className="text-[26px] font-bold text-white tracking-tight scholarly-serif italic antialiased opacity-95">
                                    {data.primary_endpoint_headline?.text || "Clinical Trial Abstract"}
                                </h3>
                            </div>

                            <div className="flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.5em] pt-4 mt-2 opacity-40 font-sans">
                                <span className="text-[#B04C4C] underline underline-offset-8 decoration-1">DOI: {data.citation?.doi?.split('/').pop() || "NEJMoa2204233"}</span>
                                <span className="text-slate-200">/</span>
                                <span className="text-slate-950 font-black">{data.citation?.authors_short || "FINFER ET AL."}</span>
                                <span className="ml-auto flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
                                    <span>PEER REVIEWED PUBLICATION</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* TOP TIER: TRIPTYCH HEADERS */}
                    <div className="grid grid-cols-[0.32fr,1fr,1fr] border-b border-slate-200/60 relative z-20">
                        {/* COHORT PANEL */}
                        <div className="px-16 py-20 flex flex-col items-center text-center border-r-2 border-slate-900/5 bg-[#f8fafc]/30">
                             <div className="w-24 h-24 rounded-full bg-white border border-slate-100 flex items-center justify-center text-[#1a365d] mb-10 shadow-2xl icon-3d-shadow">
                                <Users className="w-10 h-10" />
                             </div>
                             <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.6em] mb-14 drop-shadow-sm">PARTICIPANTS</h3>
                             <div className="space-y-6">
                                <div className="text-[92px] font-black text-[#0a1f44] leading-[0.7] tracking-tighter font-sans antialiased drop-shadow-sm">
                                    {data.panels?.find((p: any) => p.position === "left")?.content?.find((c: any) => c.type === "icon_stat")?.value}
                                </div>
                                <div className="text-[15px] font-bold text-slate-700 uppercase tracking-[0.1em] leading-relaxed max-w-[200px] italic scholarly-serif opacity-80">
                                    {data.panels?.find((p: any) => p.position === "left")?.content?.find((c: any) => c.type === "icon_stat")?.label}
                                </div>
                             </div>
                        </div>

                        {/* INTERVENTION ARMS */}
                        <div className="col-span-2 grid grid-cols-2">
                             {data.panels?.filter((p: any) => p.position !== "left").map((arm: any, i: number) => {
                                 const alloc = arm.content?.find((c: any) => c.type === "allocation_block");
                                 return (
                                     <div key={i} className={cn(
                                         "px-18 py-24 flex flex-col items-center justify-start border-r border-slate-100 last:border-r-0 relative group min-h-[500px]",
                                         i % 2 === 0 ? "bg-white" : "bg-slate-50/10"
                                     )}>
                                        <div className="text-[13px] font-bold text-slate-400 uppercase tracking-[0.5em] mb-28 border-b border-slate-100 pb-3">
                                            {arm.header}
                                        </div>
                                        {/* Physical Asset Spacing - THE "AIR" PATTERN */}
                                        <div className="flex flex-col items-center gap-16">
                                            <div className="w-48 h-48 bg-white rounded-full border border-slate-50 flex items-center justify-center text-[#1a365d] shadow-[0_20px_60px_rgba(0,0,0,0.06)] icon-3d-shadow rotate-[-8deg] group-hover:rotate-0 transition-all duration-1000 group-hover:scale-105">
                                                <SmartIcon iconId={alloc?.icon || "Pill"} className="w-32 h-32 opacity-80 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            <div className="flex flex-col items-center mt-4">
                                                <div className="text-[68px] font-black text-[#0a1f44] leading-none tracking-tighter font-sans mb-3 scale-x-[0.95]">
                                                    n={alloc?.n}
                                                </div>
                                                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-[0.4em] font-sans">
                                                    {alloc?.label}
                                                </div>
                                            </div>
                                        </div>
                                     </div>
                                 );
                             })}
                        </div>
                    </div>

                    {/* BODY TIER: HYBRID RESULT STRIPS */}
                    <div className="flex-1 bg-white relative z-10 border-t border-slate-200">
                        {data.results_grid?.metrics?.map((m: any, i: number) => (
                            <NarrativeStrip key={i} metric={m} armCount={armCount} accent={accent} />
                        ))}
                    </div>

                    {/* FOOTER TIER: THE CLINICAL SUMMATION (Zero Spelling Error Zone) */}
                    <div className="nejm-header-gradient px-24 py-20 text-center shadow-3xl relative overflow-hidden">
                         <div className="absolute inset-0 bg-white/5 pointer-events-none" />
                         {/* Verdict Ribbon */}
                         <div className="mb-8">
                            <span className="text-[11px] font-black bg-[#C5A059] text-slate-950 px-6 py-2 uppercase tracking-[0.6em] italic shadow-lg antialiased">THE CLINICAL VERDICT</span>
                         </div>
                         <div className="text-[38px] font-black text-white tracking-[0.01em] uppercase scholarly-serif italic leading-tight max-w-[1000px] mx-auto antialiased drop-shadow-2xl">
                            "{data.conclusion_banner?.text}"
                         </div>
                         
                         <div className="mt-16 pt-10 border-t border-white/10 flex items-center justify-between text-[11px] font-black text-white/40 uppercase tracking-[0.6em]">
                            <div className="flex gap-16">
                                <span>PRINTED IN THE UNITED STATES OF AMERICA</span>
                                <span>V.23.0 MASTERPIECE</span>
                            </div>
                            <div className="italic text-white scholarly-serif tracking-widest flex items-center gap-4">
                                <span className="opacity-30">AUTH_</span> {data.citation?.authors_short || "FINFER ET AL."}
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
