"use client";

import { Layers } from "lucide-react";
import { StylePreset } from "@/types";

interface StyleSelectorProps {
    selectedStyle: string;
    setSelectedStyle: (val: string) => void;
    stylePresets: StylePreset[];
}

export function StyleSelector({ selectedStyle, setSelectedStyle, stylePresets }: StyleSelectorProps) {
    return (
        <div className="mb-8">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2 px-1">
                <Layers className="w-3 h-3" /> Visual Direction Matrix
            </p>
            <div className="relative group/select">
                <select
                    value={selectedStyle}
                    onChange={(e) => setSelectedStyle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl px-4 md:px-5 py-3 md:py-4 text-xs font-bold text-slate-700 outline-none hover:border-indigo-200 transition-all cursor-pointer appearance-none shadow-sm focus:ring-2 focus:ring-indigo-500/10 whitespace-nowrap overflow-hidden text-ellipsis"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem center', backgroundSize: '1rem' }}
                >
                    {stylePresets.map((style) => (
                        <option key={style.label} value={style.value}>{style.label}</option>
                    ))}
                </select>
            </div>
            
            {(() => {
                const activePreset = stylePresets.find((p) => p.value === selectedStyle);
                const displayUrl = activePreset?.previewUrl || `https://placehold.co/600x400/e2e8f0/475569?text=${encodeURIComponent(activePreset?.label || 'Style Preview')}`;
                
                return (
                    <div className="mt-4 rounded-xl md:rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative h-32 md:h-48 bg-slate-900 flex items-center justify-center group">
                        <img
                            src={displayUrl}
                            alt={activePreset?.label || "Style Reference"}
                            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://placehold.co/600x400/e2e8f0/475569?text=${encodeURIComponent(activePreset?.label || 'Preview Unavailable')}`;
                            }}
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                            <p className="text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-between">
                                <span>Reference Visual</span>
                                {!activePreset?.previewUrl && <span className="opacity-60 lowercase">Placeholder</span>}
                            </p>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
