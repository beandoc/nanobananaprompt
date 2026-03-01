"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Terminal, Camera, Zap, AlertCircle, Loader2, Download, Image as ImageIcon, Microscope, Stethoscope, Dna, FileText } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Home() {
  const [brief, setBrief] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"ad" | "medical">("ad");

  const handleGenerate = async () => {
    if (!brief.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const resp = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief, mode }),
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Failed to generate");

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30 font-sans">
      {/* Background Gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.05),transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none brightness-50 contrast-150" />

      <div className="max-w-6xl mx-auto px-6 py-12 relative">
        {/* Header */}
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
          <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-white/5 mb-8">
            <button
              onClick={() => setMode("ad")}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2",
                mode === "ad" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Zap className="w-4 h-4" /> DTC Ad Creative
            </button>
            <button
              onClick={() => setMode("medical")}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2",
                mode === "medical" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Stethoscope className="w-4 h-4" /> Medical Journal
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Input */}
          <section className="space-y-6">
            <motion.div
              layout
              className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden group"
            >
              <div className="flex items-center gap-3 mb-6 transition-colors duration-500" style={{ color: mode === "ad" ? "rgb(129, 140, 248)" : "rgb(52, 211, 153)" }}>
                <Terminal className="w-5 h-5" />
                <h2 className="font-semibold uppercase tracking-wider text-xs">{mode === "ad" ? "Creative Brief" : "Clinical Description"}</h2>
              </div>

              <textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder={mode === "ad" ? "e.g., Generate studio product shots of this protein powder tub. White background, harsh shadows. Need it for 4:5 feed." : "e.g., A high-fidelity 3D medical render of a human kidney showing podocyte foot process effacement for a Nature Nephrology figure."}
                className="w-full h-48 bg-slate-800/50 border border-white/5 rounded-2xl p-5 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 transition-all resize-none shadow-inner"
                style={{ borderColor: mode === "ad" ? undefined : "rgba(16, 185, 129, 0.1)" }}
              />

              <div className="mt-6 flex justify-between items-center">
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-full bg-slate-800 border border-white/5 text-[10px] text-slate-400 flex items-center gap-1.5">
                    {mode === "ad" ? <Zap className="w-3 h-3" /> : <Dna className="w-3 h-3" />} {mode === "ad" ? "DTC Strategy" : "Peer Review Std"}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-slate-800 border border-white/5 text-[10px] text-slate-400 flex items-center gap-1.5">
                    {mode === "ad" ? <Camera className="w-3 h-3" /> : <FileText className="w-3 h-3" />} {mode === "ad" ? "Pro Lighting" : "Accruate Anatomy"}
                  </span>
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={isLoading || !brief.trim()}
                  className={cn(
                    "px-8 py-3 text-white rounded-xl font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed",
                    mode === "ad" ? "bg-indigo-600 hover:bg-indigo-500 shadow-[0_4px_20px_rgba(79,70,229,0.3)]" : "bg-emerald-600 hover:bg-emerald-500 shadow-[0_4px_20px_rgba(16,185,129,0.3)]",
                    isLoading && "animate-pulse"
                  )}
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 fill-current" />}
                  {isLoading ? "Generating..." : "Generate JSON"}
                </button>
              </div>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm">{error}</p>
              </motion.div>
            )}
          </section>

          {/* Right: Preview */}
          <section className="space-y-6">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  {/* JSON Output */}
                  <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden relative">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3 transition-colors duration-500" style={{ color: mode === "ad" ? "rgb(129, 140, 248)" : "rgb(52, 211, 153)" }}>
                        <Terminal className="w-5 h-5" />
                        <h2 className="font-semibold uppercase tracking-wider text-xs">Structured Payload</h2>
                      </div>
                      <span className="text-[10px] text-slate-500">Saved in /{result.folder}</span>
                    </div>
                    <div className="bg-black/50 rounded-xl p-4 border border-white/5 max-h-[300px] overflow-auto custom-scrollbar">
                      <pre className={cn(
                        "text-[13px] font-mono leading-relaxed transition-colors duration-500",
                        mode === "ad" ? "text-indigo-300/80" : "text-emerald-300/80"
                      )}>
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  </div>

                  {/* Rendering Preview */}
                  <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl relative group">
                    <div className="flex items-center gap-3 mb-6 transition-colors duration-500" style={{ color: mode === "ad" ? "rgb(129, 140, 248)" : "rgb(52, 211, 153)" }}>
                      <ImageIcon className="w-5 h-5" />
                      <h2 className="font-semibold uppercase tracking-wider text-xs">{mode === "ad" ? "Nano Banana Simulation" : "High-Impact Illustration"}</h2>
                    </div>
                    <div className={cn(
                      "aspect-[4/5] w-full rounded-2xl flex flex-col items-center justify-center border-2 border-dashed relative overflow-hidden transition-all duration-500 bg-slate-800/50",
                      mode === "ad" ? "border-indigo-500/10" : "border-emerald-500/10"
                    )}>
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8">
                        <h3 className="text-xl font-bold mb-2 tracking-tight">
                          {mode === "ad" ? "DTC Creative Prototype" : result.data.scientific_subject}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                          {mode === "ad" ? result.data.core_prompt : result.data.visual_accuracy.textures + ". " + result.data.negative_prompt}
                        </p>
                      </div>
                      <div className="z-10 text-white/5 flex flex-col items-center gap-4">
                        {mode === "ad" ? <Sparkles className="w-20 h-20" /> : <Microscope className="w-20 h-20" />}
                        <span className="text-[10px] uppercase font-black tracking-[0.4em] text-white/10">
                          {mode === "ad" ? "NANO BANANA ENGINE" : result.data.journal_standard + " STD"}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full bg-slate-900/30 border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center p-12 text-center"
                >
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                    {mode === "ad" ? <Sparkles className="w-8 h-8 text-slate-600" /> : <Microscope className="w-8 h-8 text-slate-600" />}
                  </div>
                  <h3 className="text-lg font-medium text-slate-400 mb-2">Ready for Analysis</h3>
                  <p className="text-slate-600 text-sm max-w-xs">Enter your {mode === "ad" ? "creative brief" : "clinical case"} to generate a high-precision {mode === "ad" ? "ad prompt" : "scientific illustration"} blueprint.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </div>
    </main>
  );
}
