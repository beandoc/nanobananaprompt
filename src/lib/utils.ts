import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { creativeProtocols } from "@/lib/config/generation";

import { atlasService } from "./atlas-service";

export const getProtocol = (mode: string, style: string) => {
  const lStyle = style.toLowerCase();
  if (mode === "ad" || mode === "food") {
    if (lStyle.includes("ugc")) return creativeProtocols.ugc;
    if (lStyle.includes("editorial")) return creativeProtocols.editorial;
    if (lStyle.includes("ecom")) return creativeProtocols.ecom;
  }
  return atlasService.getStyleProtocol(style);
};

export const getDynamicBlacklist = (brief: string): string => {
  const list = atlasService.getBlacklist(brief);
  if (list.length > 0) {
    return `ANATOMICAL BLACKLIST (derived from your brief): ${list.map((b) => `"${b}"`).join(", ")}. These structures are FORBIDDEN. Do NOT include, reference, or imply them.`;
  }
  return `ANATOMICAL BLACKLIST: "Foot-process", "Glomerulus", "Tumor core", "Sano Shunt". These structures are FORBIDDEN unless explicitly in the brief.`;
};

export const pruneDescriptions = (obj: any) => {
  if (obj.description) delete obj.description;
  if (obj.properties) {
    for (let k in obj.properties) pruneDescriptions(obj.properties[k]);
  }
  if (obj.items) pruneDescriptions(obj.items);
};

export const scrubSubject = (s: string) =>
  s
    .replace(/^(create|generate|show|make|build|give me|render|draw|an)\s+(an|a|the|image of|illustration of|diagram of|blueprint of|map for)\s+/gi, "")
    .trim();

export const setNestedValue = (obj: any, path: string, value: any) => {
  const parts = path.split(".");
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) current[parts[i]] = {};
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;
};

export const getNestedValue = (obj: any, path: string) => {
  return path.split(".").reduce((o, i) => o?.[i], obj);
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

