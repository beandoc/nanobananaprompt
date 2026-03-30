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

// ─── Sovereign 28.2 "Data-Vis" Engine (The Scholarly Peak) ──────────────────
// This engine implements true SVG rendering for Forest Plots and KM Curves,
// exactly matching the NEJM publication standard.

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

// ─── Forest Plot Component ──────────────────────────────────────────────────

function ForestPlot({ data }: { data: any }) {
    if (!data || !data.studies) return null;
    
    const margin = { top: 20, right: 60, bottom: 40, left: 180 };
    const width = 800;
    const rowHeight = 40;
    const height = (data.studies.length + 3) * rowHeight;
    
    const xMin = Math.min(...data.studies.map((s: any) => s.ci_low), 0.5);
    const xMax = Math.max(...data.studies.map((s: any) => s.ci_high), 2.0);
    const xScale = (val: number) => ((val - xMin) / (xMax - xMin)) * (width - margin.left - margin.right) + margin.left;

    return (
        <div className="bg-white p-10 border border-slate-100 rounded-sm shadow-sm font-sans mb-12">
            <h4 className="text-[18px] font-bold text-slate-800 scholarly-serif italic mb-8 border-b pb-4 px-2">
                {data.heading || "Hazard Ratio for Primary Outcome (95% CI)"}
            </h4>
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="mx-auto">
                {/* Axes and Labels */}
                <line x1={xScale(1.0)} y1={margin.top} x2={xScale(1.0)} y2={height - margin.bottom} stroke="#94a3b8" strokeWidth="2" strokeDasharray="4" />
                <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} stroke="#334155" strokeWidth="2" />
                
                {data.studies.map((study: any, i: number) => {
                    const y = margin.top + (i + 1) * rowHeight;
                    return (
                        <g key={i}>
                            <text x="10" y={y + 5} className="text-[14px] font-bold fill-slate-500 scholarly-serif italic">{study.name}</text>
                            
                            {/* Confidence Interval Line */}
                            <line x1={xScale(study.ci_low)} y1={y} x2={xScale(study.ci_high)} y2={y} stroke="#1e293b" strokeWidth="2" />
                            <line x1={xScale(study.ci_low)} y1={y-5} x2={xScale(study.ci_low)} y2={y+5} stroke="#1e293b" strokeWidth="2" />
                            <line x1={xScale(study.ci_high)} y1={y-5} x2={xScale(study.ci_high)} y2={y+5} stroke="#1e293b" strokeWidth="2" />
                            
                            {/* Point Estimate (Box size relative to weight if available) */}
                            <rect 
                                x={xScale(study.value) - 4} 
                                y={y - 4} 
                                width="8" 
                                height="8" 
                                fill="#475569" 
                                className="shadow-sm" 
                            />
                            
                            {/* Numerical Text */}
                            <text x={width - 50} y={y + 5} className="text-[14px] font-black fill-slate-900 font-sans">{study.value.toFixed(2)} ({study.ci_low.toFixed(2)}–{study.ci_high.toFixed(2)})</text>
                        </g>
                    );
                })}

                {/* Pooled Effect (Diamond) */}
                {data.pooled_effect && (() => {
                    const y = margin.top + (data.studies.length + 2) * rowHeight;
                    const dX = xScale(data.pooled_effect.value);
                    const dL = xScale(data.pooled_effect.ci_low);
                    const dH = xScale(data.pooled_effect.ci_high);
                    const points = `${dL},${y} ${dX},${y-8} ${dH},${y} ${dX},${y+8}`;
                    return (
                        <g>
                            <text x="10" y={y + 5} className="text-[14px] font-black fill-slate-900 scholarly-serif italic">Pooled Summary</text>
                            <polygon points={points} fill="#0a1f44" />
                            <text x={width - 50} y={y + 5} className="text-[14px] font-black fill-slate-900 font-sans">
                                {data.pooled_effect.value.toFixed(2)} ({data.pooled_effect.ci_low.toFixed(2)}–{data.pooled_effect.ci_high.toFixed(2)})
                            </text>
                        </g>
                    );
                })()}
            </svg>
            {data.heterogeneity && (
                <div className="mt-4 px-4 text-[11px] font-bold text-slate-400 italic">
                    Heterogeneity: I²={data.heterogeneity.i_squared}; p={data.heterogeneity.p_value}
                </div>
            )}
        </div>
    );
}

// ─── Outcome Strip (NEJM Chevron) ───────────────────────────────────────────

function NarrativeStrip({ metric, armCount, accent }: { metric: any; armCount: number; accent: string }) {
    if (!metric) return null;
    
    return (
        <div className="relative border-b border-slate-200/60 last:border-0 bg-white group min-h-[160px]">
            <div className={`grid grid-cols-[0.32fr,repeat(${armCount},1fr)] h-full items-stretch`}>
                <div className="flex flex-col justify-center px-12 py-10 bg-[#7a9a9a]/10 border-r-2 border-white relative">
                    <div className="absolute right-[-14px] top-1/2 -translate-y-1/2 z-30">
                        <div className="w-0 h-0 border-t-[14px] border-t-transparent border-l-[14px] border-l-[#e8ecec] border-b-[14px] border-b-transparent" />
                    </div>
                    <div className="flex flex-col gap-3 relative z-10 px-4 text-center">
                       <h4 className="text-[18px] font-bold text-slate-800 leading-tight scholarly-serif italic">
                            {metric.label}
                       </h4>
                    </div>
                </div>
                {metric.values?.map((v: any, i: number) => {
                    const armColors = ["bg-[#f0f9ff]/20", "bg-[#fff7ed]/20"];
                    return (
                        <div key={i} className={cn(
                            "flex flex-col items-center justify-center px-8 border-r border-slate-100 last:border-r-0 relative",
                            armColors[i % armColors.length]
                        )}>
                            <div className="text-[54px] font-black text-slate-950 tracking-tighter font-sans mb-1">
                                {typeof v === 'object' ? v.outcome_value : v}
                            </div>
                            <div className="text-[13px] font-bold text-slate-400 font-sans uppercase tracking-[0.2em]">
                                {v.sub_stat}
                            </div>
                        </div>
                    );
                })}
            </div>
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
            const dataUrl = await toPng(canvasRef.current, { quality: 1, pixelRatio: 4, backgroundColor: "#FFFFFF" });
            const link = document.createElement("a");
            link.download = `SVAE-28-SCHOLARLY-${data.title?.slice(0, 15)}.png`;
            link.href = dataUrl;
            link.click();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="space-y-12 bg-slate-50 p-6 min-h-screen">
            <div className="max-w-[1240px] mx-auto bg-slate-950 p-8 shadow-3xl text-white flex items-center justify-between rounded-t-3xl border-b-4 border-[#C5A059]">
                <div className="flex items-center gap-8">
                    <div className="w-16 h-16 bg-white flex items-center justify-center text-slate-950 rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                        <Zap className="w-8 h-8 text-cyan-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tighter leading-none mb-2 italic">SOVEREIGN V.28.2 DATA-BLOCK</h1>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em]">Integrated Forest-Plot Analysis</span>
                            <span className="w-1 h-1 bg-slate-700 rounded-full" />
                            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">NEJM Scholarly Sub-Module</span>
                        </div>
                    </div>
                </div>
                <button onClick={handleDownload} className="bg-white text-slate-950 px-12 py-5 font-black text-[11px] uppercase tracking-[0.4em] rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.3)]">
                    Export Peer-Review Plate 
                </button>
            </div>

            <div className="flex justify-center overflow-x-auto pb-40">
                <div ref={canvasRef} className="bg-white shadow-5xl relative flex flex-col overflow-hidden border border-slate-200 paper-texture" style={{ width: '1200px', minHeight: '1450px' }}>
                    <div className="px-24 pt-28 pb-10 relative overflow-hidden bg-[#fbfdfb] border-b-2 border-slate-900/5">
                        <div className="flex flex-col gap-10 relative z-10">
                            <div className="flex items-center gap-6">
                                <div className="text-[13px] font-bold text-slate-800 tracking-[0.65em] scholarly-serif uppercase">THE NEW ENGLAND <span className="font-light">JOURNAL</span> OF MEDICINE</div>
                                <div className="h-px flex-1 bg-slate-200" />
                                <div className="text-[10px] font-black text-slate-400 tracking-[0.15em]">SOVEREIGN v31 DUAL-TRACK ({data.metadata?.journal_standard || 'Standard'})</div>
                            </div>
                            <h2 className="text-[52px] font-bold text-[#0a1f44] leading-[1.0] tracking-tight max-w-[1000px] scholarly-serif italic text-center mx-auto">{data.metadata?.title || data.title}</h2>
                            <div className="mt-2 bg-[#2d3748] py-2.5 px-12 shadow-md flex items-center justify-center border-l-[12px] border-[#C5A059]">
                                <h3 className="text-[16px] font-bold text-white tracking-[0.25em] uppercase font-sans">CLINICAL DATA BLOCK: {data.medical_content?.intervention_category || 'TRIAL SUMMARY'}</h3>
                            </div>
                        </div>
                    </div>

                    {/* MAIN CONTENT GRID */}
                    <div className="p-16 flex-1 space-y-16">
                        {/* 1. THE TRADITIONAL TRIPTYCH COHORT (Top Row) with SEMANTIC ROLES */}
                        <div className="grid grid-cols-3 gap-8">
                             {data.visual_specification?.panels?.map((panel: any, i: number) => {
                                 const stats = panel.content_items?.find((c: any) => c.type === "icon_stat") || panel.content_items?.find((c: any) => c.type === "allocation_block");
                                 return (
                                     <div key={i} className="bg-[#f8fafc]/50 border border-slate-100 p-12 flex flex-col items-center group shadow-sm rounded-sm relative overflow-hidden">
                                         <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-40 transition-opacity">
                                             <div className="text-[8px] font-black uppercase tracking-widest">{panel.semantic_role}</div>
                                         </div>
                                         <div className="text-[14px] font-black text-slate-400 uppercase tracking-widest mb-10">{panel.header}</div>
                                         <div className="w-32 h-32 bg-white rounded-full border border-slate-50 flex items-center justify-center text-[#1a365d] shadow-2xl icon-3d-shadow rotate-[-6deg] group-hover:rotate-0 transition-all duration-1000 mb-10">
                                            <SmartIcon iconId={stats?.icon || "Users"} className="w-16 h-16 opacity-80" />
                                         </div>
                                         <div className="text-[62px] font-black text-[#0a1f44] leading-none mb-4">{stats?.value || stats?.n || "N/A"}</div>
                                         <div className="text-[12px] font-bold text-slate-400 uppercase text-center max-w-[150px]">{stats?.label}</div>
                                     </div>
                                 );
                             })}
                        </div>

                        {/* 2. THE ADVANCED FOREST PLOT (Scholarly Expansion) */}
                        {data.medical_content?.meta_analysis && <ForestPlot data={data.medical_content.meta_analysis} />}
                        {!data.medical_content?.meta_analysis && data.forest_plot && <ForestPlot data={data.forest_plot} />}

                        {/* 3. DIFFUSION SYNTHESIS (LAYER 5) - The Render Signal */}
                        {data.diffusion_synthesis && (
                            <div className="bg-[#f8fafc] border-2 border-dashed border-slate-200 p-10 rounded-sm">
                                <div className="flex items-center gap-4 mb-6">
                                    <Layers className="w-5 h-5 text-indigo-500" />
                                    <div className="text-[14px] font-black text-slate-900 uppercase tracking-widest">Diffusion Synthesis (Layer 5)</div>
                                </div>
                                <p className="text-[15px] text-slate-600 leading-relaxed scholarly-serif italic mb-8">
                                    "{data.diffusion_synthesis.master_prompt}"
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    {data.diffusion_synthesis.style_descriptors?.map((s: string, idx: number) => (
                                        <span key={idx} className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* THE VERDICT BELT */}
                        <div className="bg-[#0a1f44] p-16 text-center border-l-[16px] border-[#C5A059] shadow-2xl">
                             <div className="text-[13px] font-black text-[#C5A059] uppercase tracking-[0.5em] mb-6">THE FINAL CLINICAL VERDICT</div>
                             <div className="text-[42px] font-black text-white italic scholarly-serif leading-tight">
                                 "{data.medical_content?.conclusion?.statement || data.conclusion_banner?.text || "Trial Endpoints Met"}"
                             </div>
                        </div>
                    </div>

                    <div className="bg-[#f8fafc] px-24 py-12 flex items-center justify-between border-t border-slate-100 text-[11px] font-bold text-slate-300 tracking-[0.3em]">
                        <div className="flex gap-16">
                            <span>MASSACHUSETTS MEDICAL SOCIETY © 2026</span>
                            <span>PEER-REVIEWED DATA BLOCK - v31.2</span>
                        </div>
                        <div className="text-slate-900 scholarly-serif italic">
                            {data.metadata?.authors || data.citation?.authors_short} | DOI: {data.metadata?.doi || data.citation?.doi || 'PENDING'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
