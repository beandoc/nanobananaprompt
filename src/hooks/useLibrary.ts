"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { LibraryItem } from "@/types";

export function useLibrary(showLibrary: boolean) {
    const [library, setLibrary] = useState<LibraryItem[]>([]);
    const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);

    const fetchLibrary = useCallback(async () => {
        setIsLoadingLibrary(true);
        try {
            const prompts = await apiClient.fetchLibrary();
            setLibrary(prompts);
        } catch (err) {
            console.error("Failed to fetch library:", err);
        } finally {
            setIsLoadingLibrary(false);
        }
    }, []);

    useEffect(() => {
        if (showLibrary) {
            fetchLibrary();
        }
    }, [showLibrary, fetchLibrary]);

    return { library, isLoadingLibrary, fetchLibrary };
}
