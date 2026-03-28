import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Download, 
    Zap, 
    Users, 
    Activity, 
    Calendar, 
    Database, 
    Layers, 
    Heart, 
    Brain, 
    Baby, 
    Syringe, 
    Pill, 
    Droplet, 
    ClipboardList, 
    MapPin, 
    Beaker, 
    ArrowDown,
    Shield,
    Stethoscope,
    Microscope,
    Thermometer,
    Tablets,
    Scale
} from "lucide-react";
import { toPng } from "html-to-image";
import { cn } from "@/lib/utils";

// ─── Sovereign 18.0 Clinical Icon Registry ────────────────────────────────────
const ICON_MAP: Record<string, React.ReactNode> = {
    Heart: <Heart />,
    Kidney: <Database />,
    Lungs: <Layers />,
    Baby: <Baby />,
    Brain: <Brain />,
    Activity: <Activity />,
    Users: <Users />,
    Calendar: <Calendar />,
    MapPin: <MapPin />,
    Database: <Database />,
    Beaker: <Beaker />,
    Droplet: <Droplet />,
    Zap: <Zap />,
    ClipboardList: <ClipboardList />,
    Syringe: <Syringe />,
    Pill: <Pill />,
    Shield: <Shield />,
    IV_Bag: <Droplet />,
    Steroid_Vial: <Beaker />,
    Infusion: <Droplet />,
    Vial: <Beaker />,
    Patient_Group: <Users />,
    ICU_Patient: <Activity />,
    Ventilator: <Activity />
};

const SmartIcon = ({ iconId, className, style }: { iconId: string; className?: string; style?: React.CSSProperties }) => {
    // Map icons to registry or fuzzy match
    const IconNode = (ICON_MAP[iconId] || ICON_MAP[Object.keys(ICON_MAP).find(k => iconId.toLowerCase().includes(k.toLowerCase())) || "Activity"] || <Activity />) as React.ReactElement<{ className?: string; style?: React.CSSProperties }>;
    return React.cloneElement(IconNode, { className, style });
};

// ─── Sovereign 18.0 Components ────────────────────────────────────────────────

function ProportionalBar({ value, color, scale }: { value: string; color: string; scale?: string }) {
    // Parse numeric value for bar width (e.g. "21.8%" -> 21.8)
    const numeric = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
    
    // Determine Scale (e.g. "0_to_40_percent" -> 40)
    const scaleMax = scale ? (parseInt(scale.split("_to_")[1]) || 100) : 100;
    const width = Math.min((numeric / scaleMax) * 100, 100);

    return (
        <div className="w-full h-4 bg-slate-100 mt-4 relative overflow-hidden flex items-center">
            <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${width}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full"
                style={{ backgroundColor: color }}
            />
        </div>
    );
}

function PanelRenderer({ panel, accent, isCenter }: { panel: any; accent: string; isCenter: boolean }) {
    if (!panel) return null;
    
    return (
        <div className={cn(
            "flex flex-col h-full border-r border-slate-100 last:border-r-0",
            isCenter ? "bg-white" : "bg-slate-50/10"
        )}>
            {/* Panel Header (UPPERCASE SEMANTIC ANCHOR) */}
            <div className="px-10 py-8 border-b border-slate-50">
                <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-400 leading-none">
                    {panel.header || "Section"}
                </h3>
            </div>

            {/* Panel Content (Vertical Couple Narrative) */}
            <div className="flex-1 p-10 flex flex-col gap-12">
                {panel.content?.map((item: any, i: number) => {
                    if (item.type === 'icon_stat' || item.type === 'allocation_block') {
                        return (
                            <div key={i} className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-white border border-slate-100 flex items-center justify-center mb-6 shadow-sm">
                                    <SmartIcon iconId={item.icon || "Activity"} className="w-8 h-8 text-slate-400" />
                                </div>
                                <div className="text-[32px] font-black text-slate-900 leading-none tracking-tighter mb-2">
                                    {item.value}
                                </div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight max-w-[140px]">
                                    {item.label}
                                </div>
                            </div>
                        );
                    }
                    if (item.type === 'primary_outcome' || item.type === 'coupled_outcome') {
                        return (
                            <div key={i} className="flex flex-col items-center text-center mt-4">
                                <div className={cn(
                                    "text-[72px] font-black text-slate-950 leading-none tracking-tighter",
                                    item.primary ? "scale-110 mb-2" : "text-[54px] opacity-80"
                                )}>
                                    {item.outcome_value || item.value}
                                </div>
                                {item.label && (
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{item.label}</div>
                                )}
                                {item.sub_stat && (
                                    <div className="text-[12px] font-medium text-slate-500 italic mb-4">{item.sub_stat}</div>
                                )}
                                {item.visual_type === 'proportional_bars' && (
                                    <ProportionalBar value={item.outcome_value || item.value} color={accent} scale={item.scale} />
                                )}
                            </div>
                        );
                    }
                    if (item.type === 'subtext') {
                        return (
                            <div key={i} className="text-[14px] font-medium text-slate-500 text-center leading-relaxed italic px-4">
                                {item.text}
                            </div>
                        );
                    }
                    return null;
                })}
            </div>
        </div>
    );
}

export function InfographicEngine({ data }: { data: any }) {
    const canvasRef = useRef<HTMLDivElement>(null);
    const accent = data.color_scheme?.accent || "#1A365D";
    
    // Force Sans-Serif (Arial/Helvetica Mirror)
    const systemFont = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

    const handleDownload = async () => {
        if (!canvasRef.current) return;
        try {
            const dataUrl = await toPng(canvasRef.current, { quality: 1, pixelRatio: 3 });
            const link = document.createElement("a");
            link.download = `SVAE-18-${data.title?.slice(0, 15)}.png`;
            link.href = dataUrl;
            link.click();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="space-y-10" style={{ fontFamily: systemFont }}>
            {/* Header Controls */}
            <div className="bg-white p-6 shadow-2xl flex items-center justify-between border-b-4 border-slate-950">
                <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-slate-950 flex items-center justify-center text-white">
                        <Zap className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">{data.title}</h1>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Sovereign 18.0 Editorial System</p>
                    </div>
                </div>
                <button 
                    onClick={handleDownload}
                    className="bg-slate-950 hover:bg-black text-white px-8 py-3 font-black text-[12px] uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all"
                >
                    Export 8K Plate
                </button>
            </div>

            {/* Poster Blueprint */}
            <div className="flex justify-center bg-slate-100 p-12 overflow-x-auto min-h-screen">
                <div 
                    ref={canvasRef}
                    className="bg-white shadow-3xl relative flex flex-col overflow-hidden"
                    style={{ width: '1200px', minHeight: '850px' }}
                >
                    {/* Logotype (NEJM Editorial Plate) */}
                    <div className="px-16 pt-16 flex justify-between items-end border-b border-slate-100 pb-10">
                        <div>
                            <div className="text-[14px] font-black text-slate-900 opacity-60 uppercase tracking-[0.5em] mb-4 italic">
                                THE NEW ENGLAND <span className="font-light">JOURNAL</span> OF MEDICINE
                            </div>
                            <h2 className="text-[44px] font-black text-slate-950 leading-[1.05] tracking-tighter max-w-[850px]">
                                {data.title}
                            </h2>
                        </div>
                        <div className="text-right">
                            <div className="text-[12px] font-black text-slate-300 tracking-widest uppercase mb-1">Source authority</div>
                            <div className="text-[20px] font-black text-slate-950 italic">{data.journal_style === "NEJM_visual_abstract" ? "NEJM" : "PHASE 3 TRIAL"}</div>
                        </div>
                    </div>

                    {/* Primary Outcome Belt (High-Hierarchy Placement) */}
                    {data.primary_endpoint_headline && (
                        <div className="w-full bg-[#1A365D]/5 border-b border-slate-100 px-16 py-6">
                            <div className="flex items-center gap-6">
                                <div className="h-6 w-1 bg-[#1A365D]" />
                                <div className="text-[16px] font-bold text-[#1A365D] uppercase tracking-[0.1em] opacity-80 italic">
                                    {data.primary_endpoint_headline.text}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Coupled Narrative Column Grid */}
                    <div className="flex-1 grid grid-cols-[0.32fr,0.34fr,0.34fr] border-b border-slate-100">
                        <PanelRenderer panel={data.panels?.find((p: any) => p.position === "left")} accent={accent} isCenter={false} />
                        <PanelRenderer panel={data.panels?.find((p: any) => p.position === "center")} accent={accent} isCenter={true} />
                        <PanelRenderer panel={data.panels?.find((p: any) => p.position === "right")} accent={accent} isCenter={false} />
                    </div>

                    {/* The Clinical Verdict (Strict Neutrality) */}
                    {data.interpretation_belt && (
                        <div className="w-full py-6 px-16 flex justify-center bg-slate-50/50 border-b border-slate-100 relative">
                             <div className="text-[18px] font-bold text-slate-600 italic tracking-tight opacity-90 px-12 text-center max-w-4xl relative z-10">
                                {data.interpretation_belt.text}
                            </div>
                        </div>
                    )}

                    <div className="bg-slate-950 px-16 py-10 text-center text-white">
                        <div className="text-[22px] font-black text-white tracking-wide uppercase leading-relaxed max-w-5xl mx-auto italic drop-shadow-sm">
                            {data.conclusion_banner?.text}
                        </div>
                    </div>

                    {/* Citation Edge (System Metadata) */}
                    <div className="p-10 flex items-center justify-between text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] bg-white border-t border-slate-50">
                        <div className="flex gap-10">
                            <div>{data.citation?.doi || "10.1056/NEJMoa"}</div>
                            <div>© 2026 MASSACHUSETTS MEDICAL SOCIETY</div>
                        </div>
                        <div className="italic text-slate-400">{data.citation?.authors_short || "FINFER ET AL."}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
