"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { LibraryItem } from "@/types";

interface LibraryPanelProps {
    showLibrary: boolean;
    setShowLibrary: (val: boolean) => void;
    isLoadingLibrary: boolean;
    library: LibraryItem[];
    loadFromLibrary: (item: LibraryItem) => void;
}

export function LibraryPanel({
    showLibrary,
    setShowLibrary,
    isLoadingLibrary,
    library,
    loadFromLibrary
}: LibraryPanelProps) {
    return (
        <>
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
        </>
    );
}
