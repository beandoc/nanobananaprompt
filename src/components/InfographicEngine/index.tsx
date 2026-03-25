"use client";

import { motion } from "framer-motion";
import { BlueprintData } from "@/types";
import { cn } from "@/lib/utils";
import { Layout, ArrowRight, Info, Palette } from "lucide-react";

interface InfographicEngineProps {
    data: BlueprintData;
}

export function InfographicEngine({ data }: InfographicEngineProps) {
    if (!data.sections) return null;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header / Meta Section */}
            <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] p-8 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-100">
                                {data.aesthetic_style || "Professional Infographic"}
                            </span>
                            <span className="px-3 py-1 bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-slate-100 uppercase">
                                {data.aspect_ratio || "Single Sheet"}
                            </span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2 italic">
                            {data.infographic_title || "Untitled Infographic"}
                        </h1>
                        <p className="text-sm font-medium text-slate-500 max-w-2xl leading-relaxed">
                            {data.scientific_subject}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        {data.color_palette && (
                            <div className="flex -space-x-2">
                                {Object.entries(data.color_palette).map(([key, color]) => (
                                    <div 
                                        key={key}
                                        style={{ backgroundColor: color }}
                                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                                        title={`${key}: ${color}`}
                                    />
                                ))}
                            </div>
                        )}
                        <button 
                            onClick={() => {
                                navigator.clipboard.writeText(JSON.stringify(data, null, 2));
                                alert("Infographic JSON copied to clipboard");
                            }}
                            className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2"
                        >
                            Export JSON
                        </button>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Layout Matrix</span>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                            <Layout className="w-3.5 h-3.5 text-indigo-500" />
                            {data.layout_structure || "Standard Grid"}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Color System</span>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase">
                            <Palette className="w-3.5 h-3.5 text-rose-500" />
                            {data.color_palette?.primary ? "Custom Brand" : "Standard Muted"}
                        </div>
                    </div>
                    <div className="space-y-1 col-span-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Global Restrictions</span>
                        <p className="text-[10px] text-slate-500 truncate">{data.negative_prompt}</p>
                    </div>
                </div>

                {data.central_visual_metaphor && (
                    <div className="mt-8 p-8 bg-slate-900 text-white rounded-[2rem] border border-slate-800 shadow-2xl relative overflow-hidden group/hero">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[100px] -mr-32 -mt-32" />
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8">
                            <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center shrink-0 border border-white/20 shadow-xl group-hover/hero:scale-110 transition-transform">
                                <Layout className="w-10 h-10 text-indigo-400" />
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] block mb-2">Central Hero Metaphor</span>
                                <h2 className="text-2xl font-black italic tracking-tight leading-none mb-3">
                                    {data.central_visual_metaphor.concept}
                                </h2>
                                <p className="text-sm font-medium text-slate-400 leading-relaxed max-w-3xl">
                                    {data.central_visual_metaphor.rendering_detail || data.central_visual_metaphor.style || "Cohesive visual center piece to unify all narrative elements."}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Sections Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {data.sections.map((section, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white/40 backdrop-blur-sm rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all group/section relative overflow-hidden"
                    >
                        <div className="flex items-start justify-between mb-6">
                            <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-black text-slate-500">
                                {String(section.section_id).padStart(2, '0')}
                            </div>
                            {section.spatial_anchor && (
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                    Anchor: {section.spatial_anchor}
                                </span>
                            )}
                        </div>
                        
                        <h3 className="text-lg font-black text-slate-900 leading-tight mb-3">
                            {section.headline}
                        </h3>

                        <div className="bg-slate-900/5 rounded-2xl p-4 mb-4 flex-1">
                            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block mb-2">Visual Mapping</span>
                            <p className="text-[11px] text-slate-600 font-medium leading-relaxed italic">
                                "{section.visual_concept}"
                            </p>
                        </div>

                        {section.key_data_points && section.key_data_points.length > 0 && (
                            <div className="space-y-2 mt-auto">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Data Points</span>
                                <ul className="space-y-1.5">
                                    {section.key_data_points.map((pt, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-[10px] font-bold text-slate-700 leading-tight">
                                            <div className="w-1 h-1 rounded-full bg-indigo-500 mt-1.5" />
                                            {pt}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {section.iconography && section.iconography.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
                                {section.iconography.map((icon, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-white border border-slate-100 rounded-lg text-[8px] font-black text-slate-400 uppercase tracking-tight">
                                        {icon}
                                    </span>
                                ))}
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Flow Dynamics Section */}
            {data.directional_flow && data.directional_flow.length > 0 && (
                <div className="bg-indigo-950 text-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] -mr-32 -mt-32" />
                    
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                            <ArrowRight className="w-6 h-6 text-indigo-300" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-widest italic">Directional Flow Logic</h2>
                            <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-[0.2em] mt-1">Sovereign Vector Connectivity</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data.directional_flow.map((flow, idx) => {
                            const fromLabel = data.sections?.find(s => s.section_id === flow.from_section_id)?.headline || `Node ${flow.from_section_id}`;
                            const toLabel = data.sections?.find(s => s.section_id === flow.to_section_id)?.headline || `Node ${flow.to_section_id}`;
                            
                            return (
                                <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between group hover:bg-white/10 transition-all">
                                    <div className="flex flex-col gap-1 flex-1">
                                        <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{fromLabel}</span>
                                        <div className="flex items-center gap-3">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter",
                                                flow.relationship_type === 'leads_to' ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                                                flow.relationship_type === 'inhibits' ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" :
                                                "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                                            )}>
                                                {flow.relationship_type}
                                            </span>
                                        </div>
                                        <span className="text-[9px] font-black text-white uppercase tracking-widest mt-1 truncate">{toLabel}</span>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors ml-4" />
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </motion.div>
    );
}
