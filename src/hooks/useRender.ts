"use client";

import { useState, useCallback, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { Mode, BlueprintData, RenderRequest } from "@/types";

export function useRender() {
    const [isRendering, setIsRendering] = useState(false);
    const [renderedImage, setRenderedImage] = useState<string | null>(null);
    const [renderError, setRenderError] = useState<string | null>(null);

    const renderBlueprint = useCallback(async (promptData: BlueprintData, mode: Mode, parentImage: string | null, refinedPrompt: string = "") => {
        if (!promptData) return null;

        setIsRendering(true);
        setRenderError(null);

        const request: RenderRequest = { promptData, mode, parentImage, refinedPrompt };

        try {
            const data = await apiClient.renderImage(request);

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
