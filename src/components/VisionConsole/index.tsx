"use client";

import { motion } from "framer-motion";
import { ImageIcon, Loader2, Layers, Zap, Download, Upload, Eye } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Mode, GenerationResult } from "@/types";

interface VisionConsoleProps {
    mode: Mode;
    result: GenerationResult | null;
    renderedImage: string | null;
    isRendering: boolean;
    vectorizeToSVG: () => void;
    isVectorizing: boolean;
    isEngineReady: boolean;
    downloadImage: () => void;
    setAssetImage: (val: string | null) => void;
    renderError: string | null;
    externalRenderRef: React.RefObject<HTMLInputElement | null>;
    handleExternalUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function VisionConsole({
    mode,
    result,
    renderedImage,
    isRendering,
    vectorizeToSVG,
    isVectorizing,
    isEngineReady,
    downloadImage,
    setAssetImage,
    renderError,
    externalRenderRef,
    handleExternalUpload
}: VisionConsoleProps) {
    return (
        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden group/vision">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h3 className="font-black uppercase tracking-[0.2em] text-[10px] text-slate-400">Vision Console</h3>
                </div>
                <div className="flex gap-2">
                    {renderedImage && (
                        <>
                            {mode === "vector" && (
                                <button
                                    onClick={vectorizeToSVG}
                                    disabled={isVectorizing || !isEngineReady}
                                    className="flex items-center gap-3 px-6 py-3 bg-orange-600 text-white shadow-xl shadow-orange-100 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest active:scale-95"
                                >
                                    {isVectorizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
                                    Tracing SVG
                                </button>
                            )}
                            <button
                                onClick={() => { setAssetImage(renderedImage); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                            >
                                <Zap className="w-5 h-5" />
                            </button>
                            <button
                                onClick={downloadImage}
                                className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xl shadow-slate-200 hover:bg-black transition-all active:scale-95"
                            >
                                <Download className="w-5 h-5" />
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="w-full relative aspect-[16/10] rounded-[2rem] bg-slate-950 border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl group-hover/vision:shadow-indigo-200/20 transition-all duration-700">
                {isRendering && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/40 backdrop-blur-sm">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full border-t-2 border-indigo-500 animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-indigo-400 uppercase tracking-widest">Rendering</div>
                        </div>
                    </div>
                )}

                {renderedImage ? (
                    <div className="relative w-full h-full">
                        <Image
                            src={renderedImage}
                            alt="Analysis Result"
                            fill
                            className="object-contain"
                            priority
                            unoptimized={renderedImage.startsWith('data:') || renderedImage.startsWith('blob:')}
                        />
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-8 group/placeholder">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full border border-dashed border-slate-700 flex items-center justify-center group-hover/placeholder:border-indigo-500/50 transition-colors">
                                <ImageIcon className="w-10 h-10 text-slate-500 group-hover/placeholder:text-indigo-400" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-slate-800 rounded-full border border-slate-700 animate-pulse" />
                        </div>

                        {result?.data ? (
                            <div className="flex flex-col items-center gap-6">
                                <span className="text-[11px] font-black tracking-[0.4em] uppercase text-indigo-400">Blueprint Loaded</span>
                                <button
                                    onClick={() => (window as any).triggerGlobalRender?.()}
                                    className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-3"
                                >
                                    <Zap className="w-4 h-4" />
                                    Begin High-Fidelity Render
                                </button>
                            </div>
                        ) : (
                            <span className="text-[11px] font-black tracking-[0.4em] uppercase text-slate-500 opacity-40">Awaiting Signal</span>
                        )}
                    </div>
                )}

                {result?.data && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6 pointer-events-none">
                        <h4 className="text-sm font-black text-white mb-2 uppercase tracking-tighter truncate">{result.data.scientific_subject || result.data.core_prompt || result.data.illustration_subject}</h4>
                        <div className="flex gap-2">
                            <span className="text-[9px] px-3 py-1 bg-white/10 text-white/60 rounded-lg border border-white/10 uppercase font-black">Ref: {mode}</span>
                            <span className="text-[9px] px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg border border-indigo-500/20 uppercase font-black tracking-widest text-glow-indigo">V-Intelligence</span>
                        </div>
                    </div>
                )}
                {renderedImage && (renderedImage.includes("pollinations.ai") || renderedImage.includes("redirect")) && (
                    <div className="absolute top-6 right-6 z-10">
                        <button
                            onClick={() => window.open(renderedImage, '_blank')}
                            className="px-6 py-3 bg-slate-900/60 backdrop-blur-xl text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl border border-white/20 hover:bg-slate-900 hover:border-indigo-400/50 transition-all shadow-2xl shadow-black/40 group/source flex items-center gap-3 active:scale-95"
                        >
                            <Eye className="w-4 h-4 text-indigo-400 group-hover/source:scale-125 transition-transform" />
                            Explore Original
                        </button>
                    </div>
                )}
            </div>
            {renderError && <div className="mt-4 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-[11px] font-bold uppercase">{renderError}</div>}
        </div>
    );
}
