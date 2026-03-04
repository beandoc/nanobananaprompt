"use client";

import { Terminal, Database, Eye, Loader2, RefreshCw } from "lucide-react";
import { Tooltip } from "../Shared/Tooltip";
import { cn } from "@/lib/utils";
import { Mode, BlueprintData } from "@/types";

interface BlueprintConsoleProps {
    mode: Mode;
    data: BlueprintData;
    isLoading: boolean;
    refinement: string;
    setRefinement: (val: string) => void;
    handleRefine: () => void;
}

export function BlueprintConsole({
    mode,
    data,
    isLoading,
    refinement,
    setRefinement,
    handleRefine
}: BlueprintConsoleProps) {
    return (
        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative overflow-hidden group/console">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg">
                        <Terminal className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="font-black uppercase tracking-[0.2em] text-[10px] text-slate-400">
                            {mode === "ad" ? "Art Direction" : mode === "medical" ? "Technical Blueprint" : "Vector Blueprint"}
                        </h3>
                        <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Compiler: Gemini 2.5 Pro</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Tooltip content="Copy the current blueprint to take it to Gemini Web for rendering.">
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(JSON.stringify(data, null, 2));
                                alert("Technical JSON copied to clipboard.");
                            }}
                            className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:border-indigo-100 transition-all shadow-sm"
                        >
                            <Database className="w-4 h-4" />
                        </button>
                    </Tooltip>
                </div>
            </div>

            <div className="bg-slate-900 rounded-[2rem] p-8 border border-white/5 max-h-[250px] overflow-auto mb-8 shadow-2xl relative group/code">
                <pre className="text-[11px] text-indigo-300 font-mono leading-relaxed whitespace-pre-wrap">
                    {JSON.stringify(data, null, 2)}
                </pre>
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Validated Blueprint</span>
                </div>
            </div>

            <div className="p-8 bg-slate-50/80 rounded-[2rem] border border-slate-200 relative">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase italic tracking-widest px-1">
                        <RefreshCw className="w-4 h-4 animate-spin-slow" /> Technical Refinement
                    </div>
                </div>
                <div className="flex gap-3">
                    <input
                        value={refinement}
                        onChange={(e) => setRefinement(e.target.value)}
                        placeholder="e.g., 'Change the camera angle to low-orbit'..."
                        className="flex-1 bg-white border border-slate-200 rounded-[1.25rem] px-5 py-4 text-xs text-slate-700 placeholder:text-slate-300 outline-none hover:border-indigo-200 transition-all shadow-sm"
                    />
                    <button
                        onClick={handleRefine}
                        disabled={isLoading || !refinement.trim()}
                        className="px-8 py-4 bg-slate-900 text-white rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95 disabled:opacity-30"
                    >
                        Update
                    </button>
                </div>
            </div>
        </div>
    );
}
