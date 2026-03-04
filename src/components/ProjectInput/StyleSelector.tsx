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
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-xs font-bold text-slate-700 outline-none hover:border-indigo-200 transition-all cursor-pointer appearance-none shadow-sm focus:ring-2 focus:ring-indigo-500/10"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem center', backgroundSize: '1rem' }}
                >
                    {stylePresets.map((style) => (
                        <option key={style.label} value={style.value}>{style.label}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}
