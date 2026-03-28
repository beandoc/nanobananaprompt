"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import dynamic from "next/dynamic";
import { Header } from "@/components/Header";
import { ProjectInput } from "@/components/ProjectInput";

// Lazy load heavy UI sections
const LibraryPanel = dynamic(() => import("@/components/LibraryPanel").then(mod => mod.LibraryPanel), { ssr: false });
const StoryboardEngine = dynamic(() => import("@/components/StoryboardEngine").then(mod => mod.StoryboardEngine), { ssr: false });
const ComicEngine = dynamic(() => import("@/components/ComicEngine").then(mod => mod.ComicEngine), { ssr: false });
const MangaEngine = dynamic(() => import("@/components/MangaEngine").then(mod => mod.MangaEngine), { ssr: false });
const BlueprintConsole = dynamic(() => import("@/components/VisionConsole/BlueprintConsole").then(mod => mod.BlueprintConsole), { ssr: false });
const VisionConsole = dynamic(() => import("@/components/VisionConsole").then(mod => mod.VisionConsole), { ssr: false });
const InfographicEngine = dynamic(() => import("@/components/InfographicEngine").then(mod => mod.InfographicEngine), { ssr: false });

import { useEngineStatus } from "@/hooks/useEngineStatus";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useLibrary } from "@/hooks/useLibrary";
import { useGenerate } from "@/hooks/useGenerate";
import { useRender } from "@/hooks/useRender";
import { useRefine } from "@/hooks/useRefine";
import { useImageActions } from "@/hooks/useImageActions";

import { Mode, AssetType, LibraryItem } from "@/types";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Lock, ShieldAlert, Key, Loader2 } from "lucide-react";
import { AUTH_CONSTANTS, APP_CONFIG, UI_CONSTANTS } from "@/lib/constants";

export default function Home() {
  // --- Grouped State: Auth ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authInput, setAuthInput] = useState("");
  const [authError, setAuthError] = useState(false);

  // --- Grouped State: Mode & Configuration ---
  const [mode, setMode] = useState<Mode>("medical");
  const [isStoryboard, setIsStoryboard] = useState(false);
  const [assetType, setAssetType] = useState<AssetType>("style");
  const [selectedStyle, setSelectedStyle] = useState("");

  // --- Grouped State: Navigation & Modals ---
  const [showLibrary, setShowLibrary] = useState(false);
  const [refinement, setRefinement] = useState("");

  // --- External Refs ---
  const externalRenderRef = useRef<HTMLInputElement>(null);

  // --- Auth Check ---
  useEffect(() => {
    const secret = apiClient.getSecret();
    if (secret) {
      setIsAuthenticated(true);
    } else {
      // Auto-Auth for local development - Synchronizing with .env.local
      apiClient.setSecret("nanobananaprompt");
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (authInput.trim()) {
      apiClient.setSecret(authInput);
      setIsAuthenticated(true);
      window.location.reload();
    }
  }, [authInput]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem(AUTH_CONSTANTS.LOCAL_STORAGE_KEY);
    setIsAuthenticated(false);
    window.location.reload();
  }, []);

  // --- Custom Hooks Integration ---
  const { isEngineReady } = useEngineStatus();
  const {
    assetImage,
    setAssetImage,
    fileInputRef,
    handleFileUpload,
    handleExternalUpload
  } = useFileUpload();

  const { library, isLoadingLibrary } = useLibrary(showLibrary);
  const { brief, setBrief, isLoading, result, setResult, error, generateBlueprint } = useGenerate();
  const { isRendering, renderedImage, setRenderedImage, renderError, renderBlueprint } = useRender();
  const { isRefining, refineBrief } = useRefine();

  const {
    isVectorizing,
    handleCopy,
    copySuccess,
    vectorizeToSVG,
    downloadImage
  } = useImageActions(renderedImage);

  // --- Core Handlers (Memoized) ---
  const loadFromLibrary = useCallback((item: LibraryItem) => {
    setResult({
      data: item.content,
      folder: item.type === 'ad' ? 'prompts' : 
              item.type === 'medical' ? 'medical_prompts' : 
              item.type === 'vector' ? 'vector_prompts' :
              item.type === 'video' ? 'video_prompts' :
              item.type === 'food' ? 'food_prompts' : 'prompts',
      promptFile: item.name
    });
    setMode(item.type);
    setShowLibrary(false);
  }, [setResult]);

  const onGenerate = useCallback(async () => {
    if (!brief) return;

    try {
      const res = await apiClient.generateBlueprint({
        mode,
        brief,
        isStoryboard,
        style: selectedStyle
      });

      // Update the text box with the refined paragraph automatically
      if (res.refinedPrompt) {
        setBrief(res.refinedPrompt);
      }

      setResult({
        data: res.data,
        promptFile: res.promptFile,
        folder: res.folder,
        refinedPrompt: res.refinedPrompt,
        activeProvider: res.activeProvider
      });
      
    } catch (err: any) {
      console.error("Single-Shot Generation Error:", err);
    }
  }, [brief, mode, isStoryboard, selectedStyle, setBrief, setResult]);

  // --- Manual Render Trigger for Vision Console ---
  useEffect(() => {
    (window as any).triggerGlobalRender = () => {
      if (result?.data) renderBlueprint(result.data, mode, assetImage, result.refinedPrompt);
    };
  }, [result, mode, assetImage, renderBlueprint]);

  const onRefine = useCallback(async () => {
    if (isStoryboard) {
      onGenerate();
      return;
    }
    const refined = await refineBrief(brief, mode, isStoryboard, selectedStyle, assetImage);
    if (refined) setBrief(refined);
  }, [isStoryboard, onGenerate, refineBrief, brief, mode, selectedStyle, assetImage, setBrief]);

  const onExternalUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleExternalUpload(e, (compressedUrl) => {
      setMode("vector");
      setResult({
        data: { illustration_subject: "External Manual Upload" },
        promptFile: "external",
        folder: "external"
      });
    });
  }, [handleExternalUpload, setResult]);

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4 md:p-6 font-sans">
        <div className="fixed inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl md:rounded-[2.5rem] p-8 md:p-12 relative z-10 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] -mr-16 -mt-16" />
          <div className="flex flex-col items-center text-center space-y-6 md:space-y-8">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-indigo-600 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/40">
              <Lock className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-[0.2em] mb-2 leading-none italic">Security Access</h1>
              <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">{APP_CONFIG.NAME} {APP_CONFIG.SUBTITLE} v{APP_CONFIG.VERSION}</p>
            </div>
            <form onSubmit={handleLogin} className="w-full space-y-4">
              <div className="relative group">
                <input
                  type="password"
                  value={authInput}
                  onChange={(e) => setAuthInput(e.target.value)}
                  placeholder="Enter Admin Secret..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl px-5 md:px-6 py-3.5 md:py-4 text-white text-center font-bold placeholder:text-slate-600 outline-none focus:border-indigo-500/50 transition-all shadow-inner text-sm md:text-base"
                />
                <Key className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 w-3.5 md:w-4 h-3.5 md:h-4 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl md:rounded-2xl py-3.5 md:py-4 font-black uppercase tracking-[0.2em] text-[10px] md:text-[11px] transition-all active:scale-95 shadow-xl shadow-indigo-500/20">Authorize Access</button>
            </form>
            <div className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-rose-500/5 border border-rose-500/20 rounded-lg md:rounded-xl">
              <ShieldAlert className="w-3 md:w-3.5 h-3 md:h-3.5 text-rose-500" />
              <span className="text-[8px] md:text-[9px] font-black text-rose-400 uppercase tracking-widest leading-none">Protection Layer: Active</span>
            </div>
          </div>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-indigo-100 font-sans overflow-x-hidden relative text-pretty">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-200/20 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-rose-200/10 blur-[120px] rounded-full animate-pulse [animation-delay:4s]" />
      </div>

      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: `${UI_CONSTANTS.GRID_SIZE}px ${UI_CONSTANTS.GRID_SIZE}px` }} />

      <Header mode={mode} setMode={setMode} setShowLibrary={setShowLibrary} onLogout={handleLogout} />

      <div className={cn(
        "mx-auto px-4 md:px-8 py-12 relative transition-all duration-500",
        result?.data?.comic_panels || result?.data?.scenes || result?.data?.panels ? "max-w-screen-2xl" : "max-w-7xl"
      )}>
        <div className={cn(
          "grid gap-12 items-start transition-all",
          result?.data?.comic_panels || result?.data?.scenes || result?.data?.panels 
            ? "grid-cols-1" 
            : "grid-cols-1 lg:grid-cols-2"
        )}>
          <ProjectInput
            mode={mode}
            brief={brief}
            setBrief={setBrief}
            isStoryboard={isStoryboard}
            setIsStoryboard={setIsStoryboard}
            assetImage={assetImage}
            setAssetImage={setAssetImage}
            assetType={assetType}
            setAssetType={setAssetType}
            selectedStyle={selectedStyle}
            setSelectedStyle={setSelectedStyle}
            isLoading={isLoading || isRefining}
            handleGenerate={onGenerate}
            refinePrompt={onGenerate}
            fileInputRef={fileInputRef}
            handleFileUpload={handleFileUpload}
          />

          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-6 bg-slate-300 rounded-full" />
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">Intelligent Output</h2>
            </div>

            <Suspense fallback={<div className="h-48 flex items-center justify-center bg-white/50 backdrop-blur rounded-[2.5rem] border border-white"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>}>
              {result?.data && !result?.data?.scenes && (
                <BlueprintConsole
                  mode={mode}
                  data={result.data}
                  isLoading={isLoading}
                  refinement={refinement}
                  setRefinement={setRefinement}
                  handleRefine={onGenerate}
                  activeProvider={result.activeProvider}
                />
              )}

              {result?.data?.scenes && (
                <StoryboardEngine
                  totalProjectDuration={result.data.total_project_duration || ""}
                  scenes={result.data.scenes}
                  handleCopy={handleCopy}
                  copySuccess={copySuccess}
                  isComicStoryboard={mode === 'comic'}
                />
              )}

              {(result?.data?.comic_panels || result?.data?.comic_pages) && (
                <ComicEngine
                  comicTitle={result.data.comic_title}
                  logline={result.data.logline}
                  narrativeArc={result.data.narrative_arc || ""}
                  panels={result.data.comic_panels}
                  comicPages={result.data.comic_pages}
                  artStyle={result.data.art_style}
                  letteringStyle={result.data.lettering_style}
                  layoutType={result.data.layout_type}
                  globalColorGrade={result.data.global_color_grade}
                  pacingEnergy={result.data.pacing_energy}
                  consistentCharacter={result.data.consistent_character}
                  castOfCharacters={result.data.cast_of_characters}
                  productionCredits={result.data.production_credits}
                  handleCopy={handleCopy}
                  onRender={(panelData) => renderBlueprint(panelData, 'comic', assetImage, result?.refinedPrompt)}
                  copySuccess={copySuccess}
                />
              )}

              {result?.data?.panels && (
                <MangaEngine
                  mangaSubject={result.data.manga_subject || ""}
                  panels={result.data.panels}
                  isModelSheet={result.data.is_model_sheet}
                  handleCopy={handleCopy}
                  copySuccess={copySuccess}
                />
              )}

              {(result?.data?.cohort || result?.data?.results) && (
                <InfographicEngine
                  data={result.data}
                />
              )}
            </Suspense>

            {(error || authError) && (
              <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-xs font-bold uppercase flex items-center justify-between">
                <span>{error || "Authentication Session Invalid"}</span>
                <button onClick={handleLogout} className="underline">Re-Auth</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showLibrary && (
        <Suspense fallback={null}>
          <LibraryPanel
            showLibrary={showLibrary}
            setShowLibrary={setShowLibrary}
            isLoadingLibrary={isLoadingLibrary}
            library={library}
            loadFromLibrary={loadFromLibrary}
          />
        </Suspense>
      )}

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
