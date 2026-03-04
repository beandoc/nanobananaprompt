"use client";

import { useState, useRef, useCallback } from "react";

const COMPRESSION_LIMIT = 1024;
const QUALITY_SETTING = 0.8;

export function useFileUpload() {
    const [assetImage, setAssetImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const compressImage = useCallback((base64: string, maxWidth = COMPRESSION_LIMIT): Promise<string> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = base64;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', QUALITY_SETTING));
            };
        });
    }, []);

    const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>, callback?: (compressed: string) => void) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const compressedBase64 = await compressImage(reader.result as string);
                setAssetImage(compressedBase64);
                if (callback) callback(compressedBase64);
            };
            reader.readAsDataURL(file);
        }
    }, [compressImage]);

    const handleExternalUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>, callback?: (compressed: string) => void) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const result = reader.result;
                if (typeof result === 'string') {
                    const compressedBase64 = await compressImage(result);
                    if (callback) callback(compressedBase64);
                }
            };
            reader.readAsDataURL(file);
        }
    }, [compressImage]);

    const clearAsset = useCallback(() => setAssetImage(null), []);

    return {
        assetImage,
        setAssetImage,
        fileInputRef,
        handleFileUpload,
        handleExternalUpload,
        clearAsset,
        compressImage
    };
}
