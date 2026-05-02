"use client";

import { useState, useEffect, useCallback } from "react";

const HISTORY_KEY = "nanobananaprompt_asset_history";
const MAX_HISTORY = 12;

export interface AssetHistoryItem {
  id: string;
  url: string; // base64 or hosted URL
  timestamp: number;
}

export function useAssetHistory() {
  const [history, setHistory] = useState<AssetHistoryItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load asset history", e);
      }
    }
  }, []);

  const saveHistory = useCallback((items: AssetHistoryItem[]) => {
    setHistory(items);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
  }, []);

  const addAsset = useCallback((url: string) => {
    const newItem: AssetHistoryItem = {
      id: Date.now().toString(),
      url,
      timestamp: Date.now(),
    };

    // Filter out duplicates (simple check by URL)
    const filtered = history.filter((item) => item.url !== url);
    const updated = [newItem, ...filtered].slice(0, MAX_HISTORY);
    saveHistory(updated);
  }, [history, saveHistory]);

  const removeAsset = useCallback((id: string) => {
    const updated = history.filter((item) => item.id !== id);
    saveHistory(updated);
  }, [history, saveHistory]);

  return { history, addAsset, removeAsset };
}
