"use client";

import { useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { Mode } from "@/types";

export function useRefine() {
    const [isRefining, setIsRefining] = useState(false);

    const refineBrief = useCallback(async (
        brief: string,
        mode: Mode,
        isStoryboard: boolean,
        selectedStyle: string,
        assetImage: string | null
    ) => {
        if (!brief && !assetImage) return null;

        setIsRefining(true);
        try {
            const result = await apiClient.refinePrompt({ brief, mode, isStoryboard, style: selectedStyle, image: assetImage });
            return result.refinedPrompt;
        } catch (error) {
            console.error("Refinement failed:", error);
            return null;
        } finally {
            setIsRefining(false);
        }
    }, []);

    return { isRefining, refineBrief };
}
