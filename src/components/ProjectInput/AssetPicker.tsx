"use client";

import { motion, AnimatePresence } from "framer-motion";
import { History, X, Plus, Check } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { AssetHistoryItem } from "@/hooks/useAssetHistory";

interface AssetPickerProps {
  history: AssetHistoryItem[];
  onSelect: (url: string) => void;
  onRemove: (id: string) => void;
  selectedUrl: string | null;
  onUploadClick: () => void;
}

export function AssetPicker({
  history,
  onSelect,
  onRemove,
  selectedUrl,
  onUploadClick,
}: AssetPickerProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-slate-400" />
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Asset History</h3>
        </div>
        <button
          onClick={onUploadClick}
          className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-600 hover:bg-indigo-100 transition-colors"
        >
          <Plus className="w-3 h-3" />
          <span className="text-[9px] font-black uppercase">New Upload</span>
        </button>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
        <AnimatePresence>
          {history.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={cn(
                "group relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer",
                selectedUrl === item.url
                  ? "border-indigo-500 ring-2 ring-indigo-500/20"
                  : "border-transparent hover:border-slate-200"
              )}
              onClick={() => onSelect(item.url)}
            >
              <Image
                src={item.url}
                alt="History item"
                fill
                className="object-cover"
                unoptimized={item.url.startsWith('blob:')}
              />
              
              {selectedUrl === item.url && (
                <div className="absolute inset-0 bg-indigo-600/20 flex items-center justify-center">
                  <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                </div>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(item.id);
                }}
                className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-rose-500"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {history.length === 0 && (
          <div className="col-span-full py-8 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center gap-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase">No history yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
