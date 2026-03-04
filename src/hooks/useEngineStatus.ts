"use client";

import { useState, useEffect } from "react";

export function useEngineStatus() {
    const [isEngineReady, setIsEngineReady] = useState(false);

    useEffect(() => {
        // Check if already loaded
        if ((window as any).ImageTracer) {
            setIsEngineReady(true);
            return;
        }

        const checkEngine = setInterval(() => {
            if ((window as any).ImageTracer) {
                setIsEngineReady(true);
                clearInterval(checkEngine);
            }
        }, 500);

        const timer = setTimeout(() => {
            if (!(window as any).ImageTracer) {
                console.warn("ImageTracer delay. Ensure network connectivity for CDN assets.");
            }
        }, 10000);

        return () => {
            clearInterval(checkEngine);
            clearTimeout(timer);
        };
    }, []);

    return { isEngineReady };
}
