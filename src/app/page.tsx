"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Terminal, Camera, Zap, AlertCircle, Loader2, Download, Image as ImageIcon, Microscope, Stethoscope, Dna, FileText, History, X, Check, ArrowRight, CornerDownRight, Upload, Layers } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Home() {
  const [brief, setBrief] = useState("");
  const [refinement, setRefinement] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"ad" | "medical">("ad");
  const [showLibrary, setShowLibrary] = useState(false);
  const [library, setLibrary] = useState<any[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);

  // Asset Upload State
  const [assetImage, setAssetImage] = useState<string | null>(null);
  const [assetType, setAssetType] = useState<"style" | "subject" | "structure">("style");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchLibrary = async () => {
    setIsLoadingLibrary(true);
    try {
      const resp = await fetch("/api/library");
      const data = await resp.json();
      if (data.success) {
        setLibrary(data.prompts);
      }
    } catch (err) {
      console.error("Failed to fetch library", err);
    } finally {
      setIsLoadingLibrary(false);
    }
  };

  useEffect(() => {
    if (showLibrary) fetchLibrary();
  }, [showLibrary]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAssetImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async (refiningPrompt: any = null) => {
    const activeBrief = refiningPrompt ? refinement : brief;
    if (!activeBrief.trim() && !assetImage) return;

    setIsLoading(true);
    setError(null);
    if (!refiningPrompt) setResult(null);

    try {
      const resp = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brief: activeBrief,
          mode,
          image: assetImage, // Pass the uploaded asset
          assetInstruction: assetType, // Tell AI how to use the asset
          parentPrompt: refiningPrompt ? result?.data : null
        }),
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Failed to generate");

      setResult(data);
      setRefinement("");
      if (refiningPrompt) setBrief("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromLibrary = (item: any) => {
    setResult({
      data: item.content,
      folder: item.type === 'ad' ? 'prompts' : 'medical_prompts',
      promptFile: item.name
    });
    setMode(item.type);
    setShowLibrary(false);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30 font-sans overflow-x-hidden">
      {/* Background Gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.05),transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none brightness-50 contrast-150" />

      <div className="max-w-6xl mx-auto px-6 py-12 relative">
        {/* Header Content... (Keeping it the same) */}
        <header className="mb-12 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-2xl border transition-colors duration-500",
              mode === "ad" ? "bg-indigo-600 border-indigo-400/20 shadow-indigo-500/30" : "bg-emerald-600 border-emerald-400/20 shadow-emerald-500/30"
            )}
          >
            {mode === "ad" ? <Sparkles className="w-8 h-8 text-white" /> : <Microscope className="w-8 h-8 text-white" />}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400"
          >
            Nano Banana <span className={mode === "ad" ? "text-indigo-400" : "text-emerald-400"}>{mode === "ad" ? "Ad Creative" : "Medical Illustrator"}</span>
          </motion.h1>
          <p className="text-slate-500 text-sm mb-8 font-medium tracking-widest uppercase flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-slate-500" /> Multimodal Asset Intelligence <span className="w-1 h-1 rounded-full bg-slate-500" />
          </p>

          <div className="flex items-center gap-4 mb-8">
            <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-white/5">
              <button onClick={() => setMode("ad")} className={cn("px-6 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2", mode === "ad" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200")}>
                <Zap className="w-4 h-4" /> DTC Ad Creative
              </button>
              <button onClick={() => setMode("medical")} className={cn("px-6 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2", mode === "medical" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-200")}>
                <Stethoscope className="w-4 h-4" /> Medical Journal
              </button>
            </div>
            <button onClick={() => setShowLibrary(true)} className="p-3 bg-slate-900 hover:bg-slate-800 rounded-2xl border border-white/5 text-slate-400 hover:text-white transition-all shadow-xl"><History className="w-6 h-6" /></button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Multimodal Input */}
          <section className="space-y-6">
            <motion.div layout className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3 transition-colors duration-500" style={{ color: mode === "ad" ? "rgb(129, 140, 248)" : "rgb(52, 211, 153)" }}>
                  <Terminal className="w-5 h-5" />
                  <h2 className="font-semibold uppercase tracking-wider text-xs">{mode === "ad" ? "Creative Brief" : "Clinical Description"}</h2>
                </div>
                {/* Asset Upload Toggle */}
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-bold border flex items-center gap-2 transition-all",
                    assetImage ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-400" : "bg-slate-800 border-white/5 text-slate-400 hover:text-white"
                  )}
                >
                  <Upload className="w-3 h-3" /> {assetImage ? "Asset Loaded" : "Upload Reference Asset"}
                </button>
              </div>

              {/* Asset Config Bar (Show if image uploaded) */}
              <AnimatePresence>
                {assetImage && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-6 overflow-hidden">
                    <div className="bg-slate-800/80 rounded-2xl p-4 border border-white/5 flex gap-4 items-center">
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 bg-black">
                        <img src={assetImage} alt="Reference" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest leading-none">Use Asset As:</p>
                        <div className="flex gap-2">
                          {["style", "subject", "structure"].map((type) => (
                            <button
                              key={type}
                              onClick={() => setAssetType(type as any)}
                              className={cn(
                                "px-3 py-1 rounded-md text-[10px] font-bold border transition-all uppercase",
                                assetType === type ? "bg-white text-black border-white" : "bg-slate-900 text-slate-500 border-white/5 hover:border-white/20"
                              )}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>
                      <button onClick={() => setAssetImage(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-4 h-4 text-slate-500" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder={mode === "ad" ? "Paste brief or instruction on how to use the uploaded asset..." : "Paste clinical case or instruction on how to use the reference image..."}
                className="w-full h-40 bg-slate-800/50 border border-white/5 rounded-2xl p-5 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 transition-all resize-none shadow-inner"
              />

              <div className="mt-6 flex justify-between items-center">
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-full bg-slate-800 border border-white/5 text-[10px] text-slate-400 flex items-center gap-1.5 font-medium">
                    {assetImage ? <Layers className="w-3 h-3 text-indigo-400" /> : <Check className="w-3 h-3 text-green-500" />} {assetImage ? "Multimodal Logic Active" : "Text-Only Logic"}
                  </span>
                </div>
                <button
                  onClick={() => handleGenerate()}
                  disabled={isLoading || (!brief.trim() && !assetImage)}
                  className={cn(
                    "px-8 py-3 text-white rounded-xl font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed",
                    mode === "ad" ? "bg-indigo-600 hover:bg-indigo-500 shadow-[0_4px_20px_rgba(79,70,229,0.3)]" : "bg-emerald-600 hover:bg-emerald-500 shadow-[0_4px_20px_rgba(16,185,129,0.3)]",
                    isLoading && "animate-pulse"
                  )}
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 fill-current" />}
                  {isLoading ? "Running Multimodal Inference..." : "Generate AI Blueprint"}
                </button>
              </div>
            </motion.div>

            {error && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm">{error}</p>
              </motion.div>
            )}
          </section>

          {/* Right: Preview & Refinement (Keeping existing logic but with better visuals) */}
          <section className="space-y-6">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div key="result" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                  {/* JSON Output */}
                  <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden relative group">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3 transition-colors duration-500" style={{ color: mode === "ad" ? "rgb(129, 140, 248)" : "rgb(52, 211, 153)" }}>
                        <Terminal className="w-5 h-5" />
                        <h2 className="font-semibold uppercase tracking-wider text-xs">Engine Output</h2>
                      </div>
                      <span className="text-[10px] text-slate-500">Resource Captured in /{result.folder}</span>
                    </div>
                    <div className="bg-black/50 rounded-xl p-4 border border-white/5 max-h-[250px] overflow-auto custom-scrollbar italic text-slate-400/80">
                      <pre className="text-[13px] font-mono leading-relaxed">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>

                    {/* Refinement UI */}
                    <div className="mt-8 pt-8 border-t border-white/5">
                      <div className="flex items-center gap-3 mb-4 text-slate-400">
                        <CornerDownRight className="w-4 h-4" />
                        <h3 className="text-[10px] font-bold uppercase tracking-widest italic">Anatomical Correction Mode</h3>
                      </div>
                      <div className="flex gap-3">
                        <input value={refinement} onChange={(e) => setRefinement(e.target.value)} placeholder="Tweak anatomy, pose, or brand consistency..." className="flex-1 bg-slate-800 border border-white/5 rounded-xl px-4 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
                        <button onClick={() => handleGenerate(true)} disabled={isLoading || !refinement.trim()} className="px-5 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 rounded-xl text-xs font-bold transition-all disabled:opacity-30 flex items-center gap-2">
                          {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ArrowRight className="w-3 h-3" />}
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Visual Simulation Display */}
                  <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl relative group overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3 transition-colors duration-500" style={{ color: mode === "ad" ? "rgb(129, 140, 248)" : "rgb(52, 211, 153)" }}>
                        <ImageIcon className="w-5 h-5" />
                        <h2 className="font-semibold uppercase tracking-wider text-xs">{mode === "ad" ? "Brand Visualization" : "Scientific Render"}</h2>
                      </div>
                      <button className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] uppercase font-black tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-indigo-500/20 active:scale-95">
                        <Zap className="w-3 h-3 fill-current" /> Render Pixel Image
                      </button>
                    </div>
                    <div className={cn(
                      "aspect-[16/9] w-full rounded-2xl flex flex-col items-center justify-center border-2 border-dashed relative overflow-hidden transition-all duration-500 bg-slate-800/80",
                      mode === "ad" ? "border-indigo-500/10" : "border-emerald-500/10"
                    )}>
                      {/* Asset Overlay Preview (Small ghost image of the reference used) */}
                      {assetImage && (
                        <div className="absolute top-4 left-4 w-12 h-12 rounded border border-white/20 overflow-hidden opacity-30">
                          <img src={assetImage} alt="Anchor" className="w-full h-full object-cover grayscale" />
                        </div>
                      )}

                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6">
                        <h3 className="text-lg font-bold mb-1 tracking-tight">
                          {mode === "ad" ? "Indian Heritage Brand Simulation" : result.data.scientific_subject}
                        </h3>
                        <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed italic">
                          "{mode === "ad" ? result.data.core_prompt : result.data.visual_accuracy.textures}"
                        </p>
                      </div>
                      <div className="z-10 text-white/5 flex flex-col items-center gap-4">
                        {mode === "ad" ? <Sparkles className="w-16 h-16" /> : <Microscope className="w-16 h-16" />}
                        <span className="text-[10px] uppercase font-black tracking-[0.4em] text-white/10 italic">
                          {mode === "ad" ? "Locked to Indian Identity" : "Locked to Scientific Structural Grounding"}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full bg-slate-900/30 border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center p-12 text-center text-slate-500">
                  <Layers className="w-12 h-12 mb-6 text-slate-700" />
                  <h3 className="text-lg font-medium mb-2">Multimodal Interface Ready</h3>
                  <p className="text-xs max-w-xs leading-relaxed">Upload a reference image to anchor your brand style or medical structure. The engine will bridge your text instructions with the visual asset.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </div>

      {/* Library Sidebar... (Keeping it the same) */}
      <AnimatePresence>
        {showLibrary && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLibrary(false)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="relative w-full max-w-md bg-slate-900 border-l border-white/10 h-full shadow-2xl flex flex-col">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2 font-mono"><History className="w-5 h-5 text-indigo-400" /> PROMPT ARCHIVE</h2>
                <button onClick={() => setShowLibrary(false)} className="p-2 hover:bg-white/5 rounded-lg transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <div className="flex-1 overflow-auto p-6 space-y-4 custom-scrollbar">
                {isLoadingLibrary ? (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-4"><Loader2 className="w-8 h-8 animate-spin" /><p className="text-sm">Fetching Archives...</p></div>
                ) : library.length > 0 ? (
                  library.map((item, idx) => (
                    <div key={idx} onClick={() => loadFromLibrary(item)} className="bg-slate-800/30 hover:bg-slate-800 border border-white/5 rounded-2xl p-4 cursor-pointer transition-all hover:border-indigo-500/30 group">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={cn("p-2 rounded-lg", item.type === 'ad' ? "bg-indigo-500/10 text-indigo-400" : "bg-emerald-500/10 text-emerald-400")}>{item.type === 'ad' ? <Sparkles className="w-3 h-3" /> : <Microscope className="w-3 h-3" />}</div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{item.type}</span>
                        <span className="text-[10px] text-slate-700 ml-auto">{new Date(item.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed italic">"{item.type === 'ad' ? item.content.core_prompt : item.content.scientific_subject}"</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12"><History className="w-12 h-12 text-slate-800 mx-auto mb-4" /><p className="text-slate-500 text-sm">Vault Empty.</p></div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.1); }
      `}</style>
    </main>
  );
}
