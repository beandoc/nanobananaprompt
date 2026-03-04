"use client";

import { useState, useCallback } from "react";
import { useEngineStatus } from "./useEngineStatus";

declare global {
    interface Window {
        ImageTracer: {
            imageToSVG: (
                url: string,
                callback: (svgString: string) => void,
                options: Record<string, any>
            ) => void;
        };
    }
}

export function useImageActions(renderedImage: string | null) {
    const [isVectorizing, setIsVectorizing] = useState(false);
    const { isEngineReady } = useEngineStatus();
    const [copySuccess, setCopySuccess] = useState<string | null>(null);

    const vectorizeToSVG = useCallback(() => {
        if (!renderedImage || typeof window === 'undefined') return;
        const ImageTracer = window.ImageTracer;
        if (!ImageTracer) {
            alert("Vectorization engine is still downloading from the cloud. Please wait 5-10 seconds for initial load.");
            return;
        }

        setIsVectorizing(true);
        try {
            ImageTracer.imageToSVG(renderedImage, (svgString: string) => {
                const blob = new Blob([svgString], { type: 'image/svg+xml' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `nano-vector-${Date.now()}.svg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                setIsVectorizing(false);
            }, {
                numberofcolors: 12,
                ltres: 1.0,
                qtres: 1.0,
                pathomit: 32,
                strokewidth: 0.5,
                blurradius: 0.5,
                blurdelta: 20,
                viewbox: true,
                linefilter: true,
                colorsampling: 1
            });
        } catch (err) {
            console.error(err);
            setIsVectorizing(false);
        }
    }, [renderedImage]);

    const downloadImage = useCallback(async (mode: string) => {
        if (!renderedImage) return;

        try {
            let blob: Blob;

            if (renderedImage.startsWith('data:')) {
                const parts = renderedImage.split(',');
                const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
                const bstr = atob(parts[1]);
                let n = bstr.length;
                const u8arr = new Uint8Array(n);
                while (n--) {
                    u8arr[n] = bstr.charCodeAt(n);
                }
                blob = new Blob([u8arr], { type: mime });
            } else {
                const response = await fetch(renderedImage);
                blob = await response.blob();
            }

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `nano-banana-${mode}-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(url), 100);
        } catch (err) {
            console.error("Download failed:", err);
            window.open(renderedImage, '_blank');
        }
    }, [renderedImage]);

    const handleCopy = useCallback((text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopySuccess(id);
        setTimeout(() => setCopySuccess(null), 2000);
    }, []);

    return {
        isVectorizing,
        isEngineReady,
        vectorizeToSVG,
        downloadImage,
        handleCopy,
        copySuccess
    };
}
