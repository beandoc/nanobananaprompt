/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Terminal, Camera, Zap, AlertCircle, Loader2, Download, Image as ImageIcon, Microscope, Stethoscope, Dna, FileText, History, X, Check, ArrowRight, CornerDownRight, Upload, Layers, Eye, RefreshCw, ShieldCheck, Search, Database } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Client-side Script Loader helper
const loadScript = (src: string) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

export default function Home() {
  const [brief, setBrief] = useState("");
  // ... existing states ...
  const [isVectorizing, setIsVectorizing] = useState(false);

  useEffect(() => {
    loadScript("https://cdn.jsdelivr.net/gh/jseidelin/exif-js/exif.js");
    loadScript("https://cdnjs.cloudflare.com/ajax/libs/imagetracerjs/1.2.6/imagetracer_v1.2.6.js");
  }, []);

  const vectorizeToSVG = () => {
    if (!renderedImage || typeof window === 'undefined') return;
    const ImageTracer = (window as any).ImageTracer;
    if (!ImageTracer) {
      alert("Vectorization engine still loading... please try again in a second.");
      return;
    }

    setIsVectorizing(true);
    try {
      // Trace the rendered PNG to SVG
      ImageTracer.imageToSVG(renderedImage, (svgString: string) => {
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `nano-vector-${Date.now()}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsVectorizing(false);
      }, {
        numberofcolors: 16,
        strokewidth: 1,
        viewbox: true,
        linefilter: true
      });
    } catch (err) {
      console.error(err);
      setIsVectorizing(false);
    }
  };
  const [refinement, setRefinement] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [renderedImage, setRenderedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [mode, setMode] = useState<"ad" | "medical" | "vector">("ad");
  const [showLibrary, setShowLibrary] = useState(false);
  const [library, setLibrary] = useState<any[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);

  const [assetImage, setAssetImage] = useState<string | null>(null);
  const [assetType, setAssetType] = useState<"style" | "subject" | "structure">("style");
  const [selectedStyle, setSelectedStyle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stylePresets = [
    { label: "Default Training", value: "" },
    { label: "Corporate Memphis (Trending)", value: "Corporate Memphis illustration, flat design, vibrant primary colors, abstract characters" },
    { label: "3D Claymorphism", value: "3D claymorphism style, soft lighting, matte finish, playful and rounded proportions" },
    { label: "Glassmorphism UI", value: "Glassmorphism design, frosted glass textures, vibrant gradients, modern interface aesthetic" },
    { label: "Minimalist Editorial", value: "High-end minimalist editorial photography, muted tones, sharp focus, clean composition" },
    { label: "Isometric Vector", value: "Isometric vector illustration, clean lines, technical perspective, soft shadows" },
    { label: "Bento Box Grid", value: "Modern bento-style layout illustration, modular glass panels, tech-startup aesthetic" },
    { label: "Cyberpunk Professional", value: "Cyberpunk aesthetic, neon accents, high-tech interface, moody professional lighting" },
    { label: "Hand-drawn Charcoal", value: "Rough hand-drawn charcoal sketch, organic textures, fine art architectural style" },
    { label: "Synthwave Retro", value: "80s synthwave style, retro-futurism, grid floors, purple and pink gradients" },
    { label: "Micro-3D Technical", value: "Macro-3D technical render, internal cross-sections, hyper-detailed textures, laboratory lighting" }
  ];

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
    let activeBrief = isRefinement ? refinement : brief;

    // Inject Style Preset if active
    if (!isRefinement && selectedStyle) {
      activeBrief = `[STYLE: ${selectedStyle}] ${activeBrief}`;
    }

    if (!activeBrief.trim() && !assetImage) return;

    setIsLoading(true);
    setError(null);
    setRenderError(null);

    const body: any = {
      brief: activeBrief,
      mode,
      image: assetImage,
      assetInstruction: assetType,
    };

    if (isRefinement) {
      body.parentPrompt = result?.data;
      body.previousImage = renderedImage;
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
        body: JSON.stringify({
          promptData: result.data,
          mode,
          parentImage: renderedImage // Force structural consistency
        }),
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
    <main className="min-h-screen bg-[#FDFDFD] text-slate-900 selection:bg-indigo-100 font-sans overflow-x-hidden">
      {/* Dynamic Professional Backgrounds */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.03),transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[#f8fafc]/50 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#e5e7eb 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />

      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border transition-all duration-500",
              mode === "ad" ? "bg-indigo-600 border-indigo-400/20" :
                mode === "medical" ? "bg-emerald-600 border-emerald-400/20" :
                  "bg-orange-600 border-orange-400/20"
            )}>
              {mode === "ad" ? <Sparkles className="w-5 h-5 text-white" /> :
                mode === "medical" ? <Microscope className="w-5 h-5 text-white" /> :
                  <Layers className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none mb-1">Nano Banana</h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Intelligence Pipeline</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button onClick={() => setMode("ad")} className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2", mode === "ad" ? "bg-white text-indigo-600 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700")}>
              <Zap className="w-3.5 h-3.5" /> DTC Creative
            </button>
            <button onClick={() => setMode("medical")} className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2", mode === "medical" ? "bg-white text-emerald-600 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700")}>
              <Stethoscope className="w-3.5 h-3.5" /> Medical
            </button>
            <button onClick={() => setMode("vector")} className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2", mode === "vector" ? "bg-white text-orange-600 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700")}>
              <Layers className="w-3.5 h-3.5" /> Vector
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setShowLibrary(true)} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-all shadow-sm">
              <History className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-200 border border-white" />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-12 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: Project Input */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <div className={cn("w-1.5 h-6 rounded-full", mode === "ad" ? "bg-indigo-500" : mode === "medical" ? "bg-emerald-500" : "bg-orange-500")} />
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">Project Definition</h2>
            </div>

            <motion.div layout className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span className="font-bold text-xs text-slate-400 uppercase tracking-tighter">Drafting Board</span>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className={cn("px-4 py-2 rounded-full text-[10px] font-black border uppercase transition-all flex items-center gap-2", assetImage ? "bg-indigo-50 text-indigo-600 border-indigo-200" : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100")}>
                  <Upload className="w-3.5 h-3.5" /> {assetImage ? "Asset Loaded" : "Link Reference"}
                </button>
              </div>

              {/* New Style Selector */}
              <div className="mb-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Layers className="w-3 h-3" /> Visual Direction Matrix
                </p>
                <select
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-300 appearance-none cursor-pointer"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1rem' }}
                >
                  {stylePresets.map((style) => (
                    <option key={style.label} value={style.value}>{style.label}</option>
                  ))}
                </select>
              </div>

              {assetImage && (
                <div className="mb-8 p-6 bg-slate-50 rounded-[1.5rem] border border-slate-200 flex gap-6 items-center">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-white shadow-sm ring-1 ring-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={assetImage} alt="Reference" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Asset Intent</p>
                    <div className="flex gap-2">
                      {["style", "subject", "structure"].map((type) => (
                        <button key={type} onClick={() => setAssetType(type as any)} className={cn("px-4 py-1.5 rounded-lg text-[9px] font-black border transition-all uppercase tracking-widest", assetType === type ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300")}>{type}</button>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => setAssetImage(null)} className="p-2 hover:bg-slate-200 rounded-full transition-all"><X className="w-4 h-4 text-slate-400" /></button>
                </div>
              )}

              <textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder={mode === "ad" ? "Specify your campaign parameters and visual narrative..." : "Describe clinical findings, pathology, or surgical sequences..."}
                className="w-full h-48 bg-slate-50/50 border border-slate-200 rounded-2xl p-6 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300 transition-all resize-none text-sm leading-relaxed"
              />

              <div className="mt-8 flex justify-between items-center bg-slate-50 -mx-8 -mb-8 p-8 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-[10px] text-slate-600 font-bold uppercase tracking-tight">Indian Identity Locked</span>
                </div>
                <button onClick={() => handleGenerate()} disabled={isLoading} className={cn("px-10 py-4 text-white rounded-2xl font-black text-xs uppercase tracking-[0.15em] flex items-center gap-3 transition-all shadow-lg active:scale-95 disabled:opacity-50", mode === "ad" ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200")}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                  {isLoading ? "Analyzing..." : "Process Brief"}
                </button>
              </div>
            </motion.div>
          </section>

          {/* Right: Technical Output + Preview */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-6 bg-slate-300 rounded-full" />
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">Intelligent Output</h2>
            </div>

            <AnimatePresence mode="wait">
              {result ? (
                <motion.div key="result" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  {/* JSON Blueprint Console */}
                  <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-xl relative overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3 text-slate-400">
                        <Terminal className="w-4 h-4" />
                        <h3 className="font-black uppercase tracking-widest text-[10px]">
                          {mode === "ad" ? "Art Direction" : mode === "medical" ? "Technical Blueprint" : "Vector Blueprint"}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const val = prompt("Paste your Technical JSON here:");
                            if (val) {
                              try {
                                const parsed = JSON.parse(val);
                                setResult({ ...result, data: parsed });
                              } catch (e) {
                                alert("Invalid JSON format. Please ensure you copy the exact output from the web or app.");
                              }
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-400 hover:bg-slate-100 transition-all border border-slate-200 flex items-center gap-1.5"
                        >
                          <Upload className="w-3 h-3" /> Import
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify(result.data, null, 2));
                            alert("Technical JSON copied to clipboard. You can now paste this into Gemini Web for rendering.");
                          }}
                          className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-400 hover:bg-slate-100 transition-all border border-slate-200 flex items-center gap-1.5"
                        >
                          <Database className="w-3 h-3" /> Copy JSON
                        </button>
                        <button onClick={handleRenderImage} disabled={isRendering} className={cn(
                          "px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase flex items-center gap-2 transition-all shadow-sm",
                          mode === "ad" ? "bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100" :
                            mode === "medical" ? "bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100" :
                              "bg-orange-50 text-orange-600 border border-orange-100 hover:bg-orange-100"
                        )}>
                          {isRendering ? <Loader2 className="w-3 h-3 animate-spin" /> : <Eye className="w-3 h-3" />}
                          {isRendering ? "Rendering..." : "Execute Render"}
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 max-h-[220px] overflow-auto mb-6 group/code relative">
                      <textarea
                        value={JSON.stringify(result.data, null, 2)}
                        onChange={(e) => {
                          try {
                            const parsed = JSON.parse(e.target.value);
                            setResult({ ...result, data: parsed });
                          } catch (err) {
                            // Allow typing even if invalid JSON temporarily
                          }
                        }}
                        className="w-full h-full min-h-[150px] bg-transparent text-[11px] text-slate-500 font-mono leading-relaxed outline-none resize-none"
                      />
                      <div className="absolute top-2 right-2 opacity-0 group-hover/code:opacity-100 transition-opacity bg-white text-[9px] font-bold px-2 py-1 rounded border border-slate-200 text-slate-400 pointer-events-none">
                        LIVE EDITOR ACTIVE
                      </div>
                    </div>

                    <div className="p-6 bg-indigo-50/30 rounded-2xl border border-indigo-100 relative">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase italic tracking-widest">
                          <RefreshCw className="w-3.5 h-3.5" /> Technical Correction Mode
                        </div>
                        {renderedImage && (
                          <div className="flex items-center gap-2 px-3 py-1 bg-white border border-indigo-200 rounded-lg shadow-sm">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-bold text-indigo-600 uppercase">Visual Reference Locked</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <input value={refinement} onChange={(e) => setRefinement(e.target.value)} placeholder="e.g., 'Make the efferent arteriole blue'..." className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-300" />
                        <button onClick={() => handleGenerate(true)} disabled={isLoading || !refinement.trim()} className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-indigo-100">Update</button>
                      </div>
                      {renderedImage && (
                        <div className="mt-4 flex items-center gap-3 p-3 bg-white/50 rounded-xl border border-indigo-50">
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-indigo-100">
                            <img src={renderedImage} className="w-full h-full object-cover opacity-50 grayscale" alt="Ref" />
                          </div>
                          <div className="text-[9px] text-slate-400 font-bold uppercase leading-tight">
                            Consistency Engine Active:<br />
                            <span className="text-indigo-400">Rendering relative to previous frame</span>
                          </div>
                        </div>
                      )}
                      {isLoading && (
                        <div className="mt-4 w-full h-1 bg-indigo-100 rounded-full overflow-hidden">
                          <motion.div initial={{ x: "-100%" }} animate={{ x: "0%" }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="w-full h-full bg-indigo-500" />
                        </div>
                      )}
                      {renderError && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-[10px] font-bold">
                          <AlertCircle className="w-4 h-4" />
                          <span>{renderError}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Visual Console */}
                  <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-xl overflow-hidden group">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-black uppercase tracking-widest text-[10px] text-slate-400">Vison Console</h3>
                      {renderedImage && (
                        <div className="flex gap-2">
                          {mode === "vector" && (
                            <button
                              onClick={vectorizeToSVG}
                              disabled={isVectorizing}
                              className="flex items-center gap-2 px-6 py-2 bg-orange-600 shadow-lg shadow-orange-100 rounded-xl text-[10px] font-black text-white hover:bg-orange-700 transition-all uppercase tracking-widest disabled:opacity-50"
                            >
                              {isVectorizing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Layers className="w-3.5 h-3.5" />}
                              {isVectorizing ? "Tracing..." : "Vectorize (SVG)"}
                            </button>
                          )}
                          <button onClick={downloadImage} className="flex items-center gap-2 px-6 py-2 bg-slate-900 shadow-lg shadow-slate-200 rounded-xl text-[10px] font-black text-white hover:bg-black transition-all uppercase tracking-widest">
                            <Download className="w-3.5 h-3.5" /> Export DPI
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="w-full relative aspect-[16/9] rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden shadow-inner">
                      {renderedImage ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={renderedImage} alt="Analysis Result" className="w-full h-full object-contain" />
                      ) : (
                        <div className="flex flex-col items-center gap-6 text-slate-300">
                          <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center"><ImageIcon className="w-8 h-8 opacity-40" /></div>
                          <span className="text-[10px] font-black tracking-[0.3em] uppercase">Ready for processing</span>
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white via-white/80 to-transparent p-6 pointer-events-none">
                        <h4 className="text-sm font-black text-slate-800 mb-2 uppercase tracking-tighter truncate">{result.data.scientific_subject || result.data.core_prompt}</h4>
                        <div className="flex gap-2">
                          <span className="text-[9px] px-3 py-1 bg-slate-100 text-slate-500 rounded-lg border border-slate-200 uppercase font-black">Ref: {mode}</span>
                          <span className="text-[9px] px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100 uppercase font-black tracking-widest">V-Intelligence</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full bg-white border border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center p-16 text-center text-slate-300 min-h-[600px] shadow-sm">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8 border border-slate-100">
                    <Layers className="w-10 h-10 opacity-30" />
                  </div>
                  <h3 className="text-lg font-black text-slate-400 uppercase tracking-widest mb-2 italic">Awaiting Protocol</h3>
                  <p className="max-w-[240px] text-[11px] font-bold text-slate-400 uppercase tracking-tight leading-relaxed">Initialize a campaign brief or clinical case to begin multimodal analysis.</p>
                </div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </div>

      {/* Slide-out Library Panel */}
      <AnimatePresence>
        {showLibrary && (
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed inset-y-0 right-0 w-[400px] bg-white shadow-2xl z-[60] border-l border-slate-200 flex flex-col">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">Resource Library</h2>
                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Persistent Asset History</p>
              </div>
              <button onClick={() => setShowLibrary(false)} className="p-2.5 hover:bg-slate-50 rounded-xl border border-slate-100 transition-all"><X className="w-5 h-5 text-slate-500" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
              {isLoadingLibrary ? (
                <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-200" /></div>
              ) : library.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4 opacity-50">
                  <Database className="w-12 h-12" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">No records found</span>
                </div>
              ) : library.map((item, i) => (
                <button key={i} onClick={() => loadFromLibrary(item)} className="w-full text-left bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group relative overflow-hidden">
                  <div className={cn("absolute top-0 left-0 w-1.5 h-full", item.type === "ad" ? "bg-indigo-500" : item.type === "medical" ? "bg-emerald-500" : "bg-orange-500")} />
                  <div className="flex items-center justify-between mb-3">
                    <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                      item.type === "ad" ? "bg-indigo-50 text-indigo-600" :
                        item.type === "medical" ? "bg-emerald-50 text-emerald-600" :
                          "bg-orange-50 text-orange-600"
                    )}>{item.type}</span>
                    <span className="text-[8px] font-bold text-slate-400 font-mono">{new Date(item.timestamp).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-tighter truncate pr-4">{item.content.scientific_subject || item.content.core_prompt || item.content.illustration_subject}</h4>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showLibrary && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLibrary(false)} className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm z-50" />
      )}

      {/* Global Aesthetics */}
      <style jsx global>{`
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
        
        pre::-webkit-scrollbar { height: 4px; }
        pre::-webkit-scrollbar-thumb { background: #cbd5e1; }
      `}</style>
    </main>
  );
}
