"use client";

import { useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { Mode, AssetType, GenerationResult, GenerateRequest } from "@/types";

export function useGenerate() {
    const [brief, setBrief] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<GenerationResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const generateBlueprint = useCallback(async ({
        mode,
        isStoryboard,
        selectedStyle,
        assetImage,
        assetType,
        isRefinement = false,
        refinement = ""
    }: {
        mode: Mode,
        isStoryboard: boolean,
        selectedStyle: string,
        assetImage: string | null,
        assetType: AssetType,
        isRefinement?: boolean,
        refinement?: string
    }) => {
        let activeBrief = isRefinement ? refinement : brief;

        if (!isRefinement && selectedStyle) {
            activeBrief = `[STYLE: ${selectedStyle}] ${activeBrief}`;
        }

        if (!activeBrief.trim() && !assetImage) return null;

        setIsLoading(true);
        setError(null);

        const processedBrief = isRefinement
            ? `TECHNICAL CORRECTION: ${activeBrief}. Maintain the core structure of the previous blueprint but apply these specific changes.`
            : activeBrief;

        const body: GenerateRequest = {
            brief: processedBrief,
            mode,
            isStoryboard,
            style: selectedStyle,
            image: assetImage,
            previousImage: null, // renderedImage removed, so previousImage is null
            assetInstruction: assetType,
            parentPrompt: isRefinement ? result?.data : null,
        };

        try {
            const data = await apiClient.generateBlueprint(body);
            setResult(data);
            
            // If the API returned an expanded/refined prompt, update the local text area
            if (data.refinedPrompt) {
                setBrief(data.refinedPrompt);
            } else if (!isRefinement) {
                setBrief("");
            }
            
            return data;
        } catch (err) {
            const error = err as Error;
            setError(error.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [brief, result?.data]);

    return { brief, setBrief, isLoading, setIsLoading, result, setResult, error, generateBlueprint };
}
