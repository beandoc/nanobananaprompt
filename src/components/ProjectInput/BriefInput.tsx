"use client";

import { Mode } from "@/types";
import { cn } from "@/lib/utils";

interface BriefInputProps {
    mode: Mode;
    brief: string;
    onBriefChange: (val: string) => void;
}

export function BriefInput({ mode, brief, onBriefChange }: BriefInputProps) {
    return (
        <div className="relative">
            <textarea
                value={brief}
                onChange={(e) => onBriefChange(e.target.value)}
                placeholder={
                    mode === "ad" ? "Specify your campaign parameters and visual narrative..." : 
                    mode === "infographic" ? "Paste your research abstract, study summary, or markdown text here..." :
                    "Describe clinical findings, pathology, or surgical sequences..."
                }
                className={cn(
                    "w-full bg-white border border-slate-200 rounded-3xl md:rounded-[2rem] p-4 md:p-8 text-slate-800 placeholder:text-slate-300 outline-none hover:border-indigo-100 transition-all resize-none text-sm md:text-[15px] leading-relaxed shadow-inner",
                    mode === "infographic" ? "h-72 md:h-80" : "h-48 md:h-56"
                )}
            />
            {mode !== "infographic" && (
                <div className="absolute bottom-4 md:bottom-6 right-4 md:right-6 flex items-center gap-2 opacity-50">
                    <span className="text-[9px] md:text-[10px] font-black tracking-widest text-slate-400 uppercase">{(brief?.length || 0)} / 1000</span>
                </div>
            )}
        </div>
    );
}
