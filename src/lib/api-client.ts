import {
    Mode,
    GenerationResult,
    LibraryItem,
    GenerateRequest,
    RenderRequest,
    RefineRequest
} from "@/types";
import { AUTH_CONSTANTS } from "./constants";
import { ApiResponse } from "./api-response";

const getHeaders = () => {
    const secret = typeof window !== 'undefined' ? localStorage.getItem(AUTH_CONSTANTS.LOCAL_STORAGE_KEY) : null;
    return {
        "Content-Type": "application/json",
        ...(secret ? { "Authorization": `Bearer ${secret}` } : {})
    };
};

async function handleResponse<T>(resp: Response): Promise<T> {
    const body: ApiResponse<T> = await resp.json();
    if (!resp.ok || !body.success) {
        throw new Error(body.error || `Request failed with status ${resp.status}`);
    }
    return body.data as T;
}

export const apiClient = {
    setSecret(secret: string) {
        if (typeof window !== 'undefined') {
            localStorage.setItem(AUTH_CONSTANTS.LOCAL_STORAGE_KEY, secret);
        }
    },

    getSecret() {
        return typeof window !== 'undefined' ? localStorage.getItem(AUTH_CONSTANTS.LOCAL_STORAGE_KEY) : null;
    },

    async generateBlueprint(body: GenerateRequest): Promise<GenerationResult> {
        const resp = await fetch("/api/generate", {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(body),
        });
        return handleResponse<GenerationResult>(resp);
    },

    async renderImage(body: RenderRequest): Promise<{ imageUrl: string; localPath?: string }> {
        const resp = await fetch("/api/render", {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(body),
        });
        return handleResponse<{ imageUrl: string; localPath?: string }>(resp);
    },

    async refinePrompt(body: RefineRequest): Promise<{ refinedPrompt: string }> {
        const resp = await fetch("/api/refine", {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(body)
        });
        return handleResponse<{ refinedPrompt: string }>(resp);
    },

    async fetchLibrary(): Promise<LibraryItem[]> {
        const resp = await fetch("/api/library", {
            headers: getHeaders(),
        });
        const data = await handleResponse<{ prompts: LibraryItem[] }>(resp);
        return data.prompts;
    }
};
