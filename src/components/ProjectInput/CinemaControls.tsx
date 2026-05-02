"use client";

import { motion } from "framer-motion";
import { Camera, Focus, Sun, Maximize } from "lucide-react";
import { cn } from "@/lib/utils";
import { CinemaPreferences } from "@/types";

interface CinemaControlsProps {
  cinema: CinemaPreferences;
  setCinema: (val: CinemaPreferences) => void;
  active: boolean;
}

const LENS_OPTIONS = [
  { label: "14mm Ultra-Wide", value: "14mm-ultrawide" },
  { label: "35mm Documentary", value: "35mm-documentary" },
  { label: "50mm Standard", value: "50mm-standard" },
  { label: "85mm Portrait", value: "85mm-portrait" },
  { label: "100mm Macro", value: "100mm-macro" },
];

const APERTURE_OPTIONS = [
  { label: "f/1.4 (Shallow)", value: "f/1.4" },
  { label: "f/2.8 (Balanced)", value: "f/2.8" },
  { label: "f/4.0 (Sharp)", value: "f/4.0" },
  { label: "f/8.0 (Technical)", value: "f/8.0" },
  { label: "f/11 (Deep Focus)", value: "f/11" },
];

const LIGHTING_OPTIONS = [
  { label: "Soft Daylight", value: "soft-natural-daylight" },
  { label: "Golden Hour", value: "golden-hour" },
  { label: "Studio Softbox", value: "studio-softbox" },
  { label: "Harsh Flash", value: "harsh-direct-flash" },
  { label: "Moody Rim", value: "moody-rim-lighting" },
];

const SHOT_TYPE_OPTIONS = [
  { label: "Extreme Close-up", value: "extreme-close-up" },
  { label: "Medium Shot", value: "medium-shot" },
  { label: "Full Body", value: "full-body" },
  { label: "Overhead Flatlay", value: "overhead-flatlay" },
];

export function CinemaControls({ cinema, setCinema, active }: CinemaControlsProps) {
  if (!active) return null;

  const updateCinema = (field: keyof CinemaPreferences, value: string) => {
    setCinema({ ...cinema, [field]: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="space-y-6 pt-6 border-t border-slate-100"
    >
      <div className="flex items-center gap-2 mb-2">
        <Camera className="w-4 h-4 text-indigo-500" />
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cinema Studio Controls</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lens Control */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Focus className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[9px] font-bold uppercase text-slate-400">Optic Lens</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {LENS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateCinema("lens", opt.value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-tight transition-all border",
                  cinema.lens === opt.value
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-white text-slate-500 border-slate-200 hover:border-indigo-200 hover:text-indigo-400"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Aperture Control */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Maximize className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[9px] font-bold uppercase text-slate-400">Aperture (DoF)</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {APERTURE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateCinema("aperture", opt.value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-tight transition-all border",
                  cinema.aperture === opt.value
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-white text-slate-500 border-slate-200 hover:border-indigo-200 hover:text-indigo-400"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lighting Control */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sun className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[9px] font-bold uppercase text-slate-400">Lighting Environment</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {LIGHTING_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateCinema("lighting", opt.value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-tight transition-all border",
                  cinema.lighting === opt.value
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-white text-slate-500 border-slate-200 hover:border-indigo-200 hover:text-indigo-400"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Shot Type Control */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Camera className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[9px] font-bold uppercase text-slate-400">Cinematic Framing</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SHOT_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateCinema("shot_type", opt.value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-tight transition-all border",
                  cinema.shot_type === opt.value
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-white text-slate-500 border-slate-200 hover:border-indigo-200 hover:text-indigo-400"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
