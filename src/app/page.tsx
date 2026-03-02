"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Terminal, Camera, Zap, AlertCircle, Loader2, Download, Image as ImageIcon, Microscope, Stethoscope, Dna, FileText, History, X, Check, ArrowRight, CornerDownRight, Upload, Layers, Eye, RefreshCw, ShieldCheck } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Home() {
  const [brief, setBrief] = useState("");
  const [refinement, setRefinement] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [renderedImage, setRenderedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [mode, setMode] = useState<"ad" | "medical">("ad");
  const [showLibrary, setShowLibrary] = useState(false);
  const [library, setLibrary] = useState<any[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);

  const [assetImage, setAssetImage] = useState<string | null>(null);
  const [assetType, setAssetType] = useState<"style" | "subject" | "structure">("style");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchLibrary = async () => {
    setIsLoadingLibrary(true);
    try {
      const resp = await fetch("/api/library");
      const data = await resp.json();
      if (data.success) setLibrary(data.prompts);
    } catch (err) { console.error(err); } finally { setIsLoadingLibrary(false); }
  };

  useEffect(() => { if (showLibrary) fetchLibrary(); }, [showLibrary]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAssetImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async (isRefinement: boolean = false) => {
    const activeBrief = isRefinement ? refinement : brief;
    if (!activeBrief.trim() && !assetImage) return;

    setIsLoading(true);
    setError(null);
    setRenderError(null);

    // Logic: If refining, we pass the current result AND the current render back to Gemini
    const body: any = {
      brief: activeBrief,
      mode,
      image: assetImage,
      assetInstruction: assetType,
    };

    if (isRefinement) {
      body.parentPrompt = result?.data;
      body.previousImage = renderedImage; // Crucial: Gemini sees the "buggy" image to fix it
    } else {
      setResult(null);
      setRenderedImage(null);
    }

    try {
      const resp = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Failed to generate blueprint");

      setResult(data);
      setRefinement("");
      if (!isRefinement) setBrief("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenderImage = async () => {
    if (!result?.data) return;
    setIsRendering(true);
    setRenderError(null);
    try {
      const resp = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptData: result.data, mode }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Render failed");
      setRenderedImage(data.imageUrl);
    } catch (err: any) {
      setRenderError(err.message);
    } finally {
      setIsRendering(false);
    }
  };

  const downloadImage = () => {
    if (!renderedImage) return;
    const link = document.createElement("a");
    link.href = renderedImage;
    link.download = `nano-banana-${mode}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const loadFromLibrary = (item: any) => {
    setResult({ data: item.content, folder: item.type === 'ad' ? 'prompts' : 'medical_prompts', promptFile: item.name });
    setRenderedImage(null);
    setMode(item.type);
    setShowLibrary(false);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30 font-sans overflow-x-hidden">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.05),transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none brightness-50 contrast-150" />

      <div className="max-w-6xl mx-auto px-6 py-12 relative">
        <header className="mb-12 flex flex-col items-center text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-2xl border transition-all duration-500", mode === "ad" ? "bg-indigo-600 border-indigo-400/20" : "bg-emerald-600 border-emerald-400/20 shadow-emerald-500/30 font-bold")}>
            {mode === "ad" ? <Sparkles className="w-8 h-8 text-white" /> : <Microscope className="w-8 h-8 text-white" />}
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
            Nano Banana <span className={mode === "ad" ? "text-indigo-400" : "text-emerald-400"}>{mode === "ad" ? "Ad Creative" : "Medical Illustrator"}</span>
          </motion.h1>
          <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-white/5 mb-12">
            <button onClick={() => setMode("ad")} className={cn("px-6 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2", mode === "ad" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200")}><Zap className="w-4 h-4" /> DTC Ad Creative</button>
            <button onClick={() => setMode("medical")} className={cn("px-6 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2", mode === "medical" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-200")}><Stethoscope className="w-4 h-4" /> Medical Journal</button>
            <button onClick={() => setShowLibrary(true)} className="ml-2 p-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-white/5 text-slate-400 transition-all"><History className="w-5 h-5" /></button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Input */}
          <section className="space-y-6">
            <motion.div layout className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3 text-indigo-400">
                  <Terminal className="w-5 h-5 text-slate-500" />
                  <h2 className="font-semibold uppercase tracking-wider text-xs">{mode === "ad" ? "Campaign Brief" : "Clinical Case Description"}</h2>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className={cn("px-4 py-1.5 rounded-full text-[10px] font-bold border flex items-center gap-2 transition-all", assetImage ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-400" : "bg-slate-800 border-white/5 text-slate-400")}>
                  <Upload className="w-3 h-3" /> {assetImage ? "Asset Active" : "Reference Asset"}
                </button>
              </div>

              {assetImage && (
                <div className="mb-6 bg-slate-800/80 rounded-2xl p-4 border border-white/5 flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10 bg-black"><img src={assetImage} className="w-full h-full object-cover" /></div>
                  <div className="flex-1 flex gap-2">
                    {["style", "subject", "structure"].map((type) => (
                      <button key={type} onClick={() => setAssetType(type as any)} className={cn("px-3 py-1 rounded-md text-[9px] font-bold border transition-all uppercase", assetType === type ? "bg-white text-black border-white" : "bg-slate-900 text-slate-500 border-white/5")}>{type}</button>
                    ))}
                  </div>
                  <button onClick={() => setAssetImage(null)}><X className="w-4 h-4 text-slate-500" /></button>
                </div>
              )}

              <textarea value={brief} onChange={(e) => setBrief(e.target.value)} placeholder={mode === "ad" ? "Describe your brand campaign..." : "Describe the anatomical case with specific pathology details..."} className="w-full h-40 bg-slate-800/50 border border-white/5 rounded-2xl p-5 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 transition-all resize-none shadow-inner" />

              <div className="mt-6 flex justify-between items-center">
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-full bg-slate-800 border border-white/5 text-[10px] text-slate-400 flex items-center gap-1.5 font-bold italic">
                    <ShieldCheck className="w-3 h-3 text-indigo-400" /> INDIAN IDENTITY LOCKED
                  </span>
                </div>
                <button onClick={() => handleGenerate()} disabled={isLoading} className={cn("px-8 py-3 text-white rounded-xl font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50", mode === "ad" ? "bg-indigo-600 hover:bg-indigo-500" : "bg-emerald-600 hover:bg-emerald-500")}>
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 fill-current" />} Analyze Brief
                </button>
              </div>
            </motion.div>
          </section>

          {/* Right: Results + Technical Correction Layer */}
          <section className="space-y-6">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div key="result" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  {/* JSON Result + Correction Console */}
                  <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl relative">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3 text-indigo-400">
                        <Terminal className="w-5 h-5" />
                        <h2 className="font-semibold uppercase tracking-wider text-xs">Technical Blueprint</h2>
                      </div>
                      <button onClick={handleRenderImage} disabled={isRendering} className={cn("px-5 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase flex items-center gap-2 transition-all hover:scale-105", mode === "ad" ? "bg-indigo-600 text-white shadow-indigo-500/20" : "bg-emerald-600 text-white shadow-emerald-500/20")}>
                        {isRendering ? <Loader2 className="w-3 h-3 animate-spin" /> : <Eye className="w-3 h-3" />}
                        {isRendering ? "Simulating..." : "Execute Render"}
                      </button>
                    </div>

                    <div className="bg-black/40 rounded-xl p-4 border border-white/5 max-h-[150px] overflow-auto custom-scrollbar italic text-slate-500 text-[11px] mb-6">
                      <pre>{JSON.stringify(result.data, null, 2)}</pre>
                    </div>

                    {/* Technical Correction Input */}
                    <div className="bg-slate-800/50 rounded-2xl p-4 border border-indigo-500/10">
                      <div className="flex items-center gap-2 mb-3 text-[10px] font-bold text-indigo-300 uppercase italic leading-none">
                        <RefreshCw className="w-3 h-3" /> Technical Correction Mode
                      </div>
                      <div className="flex gap-2">
                        <input value={refinement} onChange={(e) => setRefinement(e.target.value)} placeholder="e.g., 'The pedicels look too thick, make them more hair-like'..." className="flex-1 bg-slate-900 border border-white/5 rounded-xl px-4 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
                        <button onClick={() => handleGenerate(true)} disabled={isLoading || !refinement.trim()} className="px-5 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-400 rounded-xl text-xs font-bold transition-all">Surgically Update</button>
                      </div>
                      {renderedImage && (
                        <p className="mt-2 text-[9px] text-slate-500 italic">Visible Render attached to context. AI will now 'Study' the current image to fix it.</p>
                      )}
                    </div>
                  </div>

                  {/* High Quality Visual Console */}
                  <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-semibold uppercase tracking-wider text-xs text-slate-400">Vison Console</h2>
                      {renderedImage && (
                        <button onClick={downloadImage} className="flex items-center gap-2 px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-bold text-white transition-all">
                          <Download className="w-3 h-3" /> Download High-DPI
                        </button>
                      )}
                    </div>
                    <div className="w-full relative aspect-[16/9] rounded-2xl bg-slate-950/50 border border-white/5 flex items-center justify-center overflow-hidden">
                      {renderedImage ? (
                        <img src={renderedImage} className="w-full h-full object-contain" />
                      ) : (
                        <div className="flex flex-col items-center gap-4 text-slate-800"><Sparkles className="w-12 h-12 opacity-20" /><span className="text-[10px] font-black tracking-widest">AWAITING RENDER EXECUTION</span></div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-6 pointer-events-none">
                        <h3 className="text-sm font-bold text-white mb-1 uppercase tracking-tight">{result.data.scientific_subject || result.data.core_prompt}</h3>
                        <div className="flex gap-2">
                          <span className="text-[8px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded border border-emerald-500/30 uppercase font-bold">Scientific Std</span>
                          <span className="text-[8px] px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded border border-indigo-500/30 uppercase font-bold">Indian Heritage</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full bg-slate-900/30 border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center p-12 text-center text-slate-800 min-h-[500px]">
                  <Layers className="w-16 h-16 opacity-10 mb-8" />
                  <p className="text-xs uppercase tracking-[0.2em] font-black opacity-30 italic">Initialize Blueprint to start</p>
                </div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
      `}</style>
    </main>
  );
}
