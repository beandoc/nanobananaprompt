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

// ─── Sovereign 26.2 "Stratified" Engine (The NEJM Gold Standard) ─────────────
// This engine implements the Chevron logic and stratified vertical arm washes 
// seen in high-impact trials like Mitapivat and Nasal High-Flow Therapy.

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

// ─── Outcome Strip (The NEJM "Chevron" Strip) ────────────────────────────────

function NarrativeStrip({ metric, armCount, accent }: { metric: any; armCount: number; accent: string }) {
    if (!metric) return null;
    
    return (
        <div className="relative border-b border-slate-200/60 last:border-0 bg-white group min-h-[160px]">
            <div className={`grid grid-cols-[0.32fr,repeat(${armCount},1fr)] h-full items-stretch`}>
                
                {/* THE NEJM "CHEVRON" ANCHOR (Sage/Slate Label) */}
                <div className="flex flex-col justify-center px-12 py-10 bg-[#7a9a9a]/10 border-r-2 border-white relative group-hover:bg-[#7a9a9a]/20 transition-colors">
                    {/* The Chevron Pointer (▶) */}
                    <div className="absolute right-[-14px] top-1/2 -translate-y-1/2 z-30">
                        <div className="w-0 h-0 border-t-[14px] border-t-transparent border-l-[14px] border-l-[#e8ecec] border-b-[14px] border-b-transparent" />
                    </div>

                    <div className="flex flex-col gap-3 relative z-10 px-4">
                       <h4 className="text-[18px] font-bold text-slate-800 leading-tight scholarly-serif italic antialiased drop-shadow-sm">
                            {metric.label}
                       </h4>
                    </div>
                </div>

                {/* THE RESULT CELLS (Alternating vertical arm washes) */}
                {metric.values?.map((v: any, i: number) => {
                    const armColors = ["bg-[#f0f9ff]/20", "bg-[#fff7ed]/20"];
                    return (
                        <div key={i} className={cn(
                            "flex flex-col items-center justify-center px-8 border-r border-slate-100 last:border-r-0 relative",
                            armColors[i % armColors.length]
                        )}>
                            <div className="text-[54px] font-black text-slate-950 tracking-tighter font-sans antialiased mb-1">
                                {typeof v === 'object' ? v.outcome_value : v}
                            </div>
                            <div className="text-[13px] font-bold text-slate-400 font-sans tracking-widest opacity-60">
                                {v.sub_stat}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* THE EFFECT OVERLAY (The floating scientific annotation) */}
            {metric.effect && (
                <div className="absolute right-12 bottom-6 flex items-center gap-4 bg-white/80 backdrop-blur-sm px-5 py-2.5 border border-slate-100 shadow-xl rounded-sm z-10 font-sans italic text-[14px] font-bold text-slate-500">
                    {metric.effect} {metric.p_value ? `| p=${metric.p_value}` : ""}
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
            link.download = `SVAE-26-NEJM-STRATIFIED-${data.title?.slice(0, 15)}.png`;
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
                            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em]">Sovereign 26.2 Stratified Mode</span>
                            <span className="w-1 h-1 bg-slate-700 rounded-full" />
                            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">NEJM Multi-Tier Synthesis</span>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={handleDownload}
                    className="bg-white hover:bg-cyan-50 text-slate-950 px-12 py-5 font-black text-[11px] uppercase tracking-[0.4em] active:scale-95 transition-all shadow-[0_15px_40px_rgba(0,0,0,0.3)] rounded-xl"
                >
                    Export NEJM Plate 
                </button>
            </div>

            {/* THE MASTER CANVAS (1200px Grid Locked) */}
            <div className="flex justify-center overflow-x-auto pb-40">
                <div 
                    ref={canvasRef}
                    className="bg-white shadow-5xl relative flex flex-col overflow-hidden border border-slate-200 paper-texture"
                    style={{ width: '1200px', minHeight: '1150px' }}
                >
                    {/* MASTER FRONT-MATTER (The "Mitapivat" Letterhead) */}
                    <div className="px-24 pt-28 pb-10 relative overflow-hidden bg-[#f8fafc]">
                        <div className="flex flex-col gap-10 relative z-10">
                            {/* THE NEJM MASTER LOGO-MARK */}
                            <div className="flex items-center gap-6">
                                <div className="text-[13px] font-bold text-slate-800 tracking-[0.65em] scholarly-serif uppercase">
                                    THE NEW ENGLAND <span className="font-light">JOURNAL</span> OF MEDICINE
                                </div>
                                <div className="h-px flex-1 bg-slate-200" />
                                <div className="text-[10px] font-black text-slate-400 tracking-[0.15em]">PRINT-SPEC v26.2</div>
                            </div>
                            
                            <h2 className="text-[54px] font-bold text-[#0a1f44] leading-[1.0] tracking-tight max-w-[1000px] scholarly-serif italic antialiased text-center mx-auto">
                                {data.title}
                            </h2>

                            {/* THE "VADADUSTAT" STUDY BELT (Charcoal Small-Caps) */}
                            <div className="mt-2 bg-[#2d3748] py-2.5 px-12 shadow-md flex items-center justify-center">
                                <h3 className="text-[15px] font-bold text-white tracking-[0.25em] uppercase font-sans antialiased opacity-90">
                                    {data.primary_endpoint_headline?.text || "RANDOMIZED, CONTROLLED TRIAL"}
                                </h3>
                            </div>
                        </div>
                    </div>

                    {/* TOP TIER: STRATIFIED TRIPTYCH */}
                    <div className="grid grid-cols-[0.32fr,1fr,1fr] relative z-20">
                        {/* COHORT PANEL (Sage-Blue Wash) */}
                        <div className="px-16 py-24 flex flex-col items-center text-center border-r border-slate-200 bg-[#E6EDF0]/50">
                             <div className="w-28 h-28 rounded-full bg-white border border-slate-50 flex items-center justify-center text-[#1a365d] mb-12 shadow-[0_15px_40px_rgba(0,0,0,0.05)] icon-3d-shadow overflow-hidden">
                                <Users className="w-12 h-12 opacity-80" />
                             </div>
                             <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.65em] mb-16">PARTICIPANTS</h3>
                             <div className="space-y-8">
                                <div className="text-[88px] font-black text-[#0a1f44] leading-[0.7] tracking-tighter font-sans antialiased">
                                    {data.panels?.find((p: any) => p.position === "left")?.content?.find((c: any) => c.type === "icon_stat")?.value}
                                </div>
                                <div className="text-[14px] font-bold text-slate-700 uppercase tracking-[0.1em] leading-relaxed max-w-[180px] scholarly-serif opacity-80">
                                    {data.panels?.find((p: any) => p.position === "left")?.content?.find((c: any) => c.type === "icon_stat")?.label}
                                </div>
                             </div>
                        </div>

                        {/* INTERVENTION ARMS (Stratified Vertical Washes) */}
                        <div className="col-span-2 grid grid-cols-2">
                             {data.panels?.filter((p: any) => p.position !== "left").map((arm: any, i: number) => {
                                 const alloc = arm.content?.find((c: any) => c.type === "allocation_block");
                                 const armColors = [
                                     "bg-gradient-to-b from-[#f0f9ff]/50 to-white",
                                     "bg-gradient-to-b from-[#fff7ed]/50 to-white"
                                 ];
                                 return (
                                     <div key={i} className={cn(
                                         "px-14 py-24 flex flex-col items-center justify-start border-r border-slate-100 last:border-r-0 relative group min-h-[480px]",
                                         armColors[i % armColors.length]
                                     )}>
                                        <div className="text-[20px] font-black text-[#1a365d] uppercase tracking-[0.1em] scholarly-serif mb-24 leading-none border-b-2 border-slate-200 pb-4">
                                            {arm.header}
                                        </div>
                                        {/* Physical Asset Spacing */}
                                        <div className="flex flex-col items-center gap-14">
                                            <div className="w-48 h-48 bg-white rounded-full border border-slate-50 flex items-center justify-center text-[#1a365d] shadow-[0_30px_70px_rgba(0,0,0,0.08)] icon-3d-shadow overflow-hidden group-hover:scale-105 transition-transform duration-1000">
                                                <SmartIcon iconId={alloc?.icon || "Pill"} className="w-28 h-28 opacity-90" />
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <div className="text-[64px] font-black text-[#0a1f44] leading-none tracking-tighter font-sans mb-4 drop-shadow-sm">
                                                    n={alloc?.n}
                                                </div>
                                                <div className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.35em] font-sans">
                                                    {alloc?.label}
                                                </div>
                                            </div>
                                        </div>
                                     </div>
                                 );
                             })}
                        </div>
                    </div>

                    {/* BODY TIER: NEJM CHEVRON STRIPS */}
                    <div className="flex-1 bg-white relative z-10 border-t border-slate-200">
                        {data.results_grid?.metrics?.map((m: any, i: number) => (
                            <NarrativeStrip key={i} metric={m} armCount={armCount} accent={accent} />
                        ))}
                    </div>

                    {/* FOOTER TIER: THE CLINICAL SUMMATION */}
                    <div className="bg-[#2d3748] px-24 py-20 text-center relative overflow-hidden">
                         <div className="absolute inset-0 bg-white/5 pointer-events-none" />
                         <div className="mb-8">
                            <span className="text-[11px] font-black bg-[#C5A059] text-slate-900 px-6 py-2 uppercase tracking-[0.6em] italic shadow-lg">THE CLINICAL VERDICT</span>
                         </div>
                         <div className="text-[36px] font-bold text-white tracking-[0.01em] scholarly-serif italic leading-tight max-w-[1000px] mx-auto antialiased">
                            "{data.conclusion_banner?.text}"
                         </div>
                         
                         <div className="mt-16 pt-10 border-t border-white/10 flex items-center justify-between text-[11px] font-black text-white/30 uppercase tracking-[0.5em]">
                            <div className="flex gap-16">
                                <span>MASSACHUSETTS MEDICAL SOCIETY</span>
                                <span>NEJM FIDELITY V26.2</span>
                            </div>
                            <div className="italic text-white scholarly-serif tracking-widest">
                                {data.citation?.authors_short || "NEJM"} DOI: {data.citation?.doi || "10.1056"}
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
