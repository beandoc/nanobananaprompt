"use client";

import { useState, useCallback, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { Mode, BlueprintData, RenderRequest } from "@/types";

export function useRender() {
    const [isRendering, setIsRendering] = useState(false);
    const [renderedImage, setRenderedImage] = useState<string | null>(null);
    const [renderError, setRenderError] = useState<string | null>(null);

    const renderBlueprint = useCallback(async (promptData: BlueprintData, mode: Mode, parentImage: string | null) => {
        if (!promptData) return null;

        setIsRendering(true);
        setRenderError(null);

        const request: RenderRequest = { promptData, mode, parentImage };

        try {
            const data = await apiClient.renderImage(request);

            // Reverting to direct base64 for better compatibility with next/image in dev 
            // while minimizing state overhead elsewhere.
            if (data && data.imageUrl) {
                setRenderedImage(data.imageUrl);
                return data.imageUrl;
            }
            throw new Error("Invalid response format from render engine.");
        } catch (err) {
            const error = err as Error;
            setRenderError(error.message);
            console.error("Render Hook Error:", error);
            return null;
        } finally {
            setIsRendering(false);
        }
    }, []);

    return { isRendering, renderedImage, setRenderedImage, renderError, renderBlueprint };
}
