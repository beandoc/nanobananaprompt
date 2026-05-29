import {
    Mode,
    GenerationResult,
    LibraryItem,
    GenerateRequest,
    RenderRequest,
    RefineRequest,
    ApiResponse
} from "@/types";
import { AUTH_CONSTANTS } from "./constants";

const getHeaders = () => {
    const secret = typeof window !== 'undefined' ? localStorage.getItem(AUTH_CONSTANTS.LOCAL_STORAGE_KEY) : null;
    return {
        "Content-Type": "application/json",
        ...(secret ? { "Authorization": `Bearer ${secret}` } : {})
    };
};

async function handleResponse<T>(resp: Response): Promise<T> {
    // Always read via stream — works for both streaming and plain JSON responses.
    // Content-type sniffing is unreliable: Vercel's edge rewrites headers on
    // streaming responses, so we can't rely on "x-ndjson" being present.
    const reader = resp.body?.getReader();
    if (!reader) {
        // No body reader — last-resort fallback
        if (!resp.ok) throw new Error(`Request failed with status ${resp.status}`);
        throw new Error("Empty response body");
    }

    const decoder = new TextDecoder();
    let raw = "";
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        raw += decoder.decode(value, { stream: true });
    }

    // Parse the last non-empty JSON line (handles both single-line and NDJSON)
    const lastLine = raw.trim().split("\n").filter(Boolean).pop() || "{}";
    let body: ApiResponse<T>;
    try {
        body = JSON.parse(lastLine);
    } catch {
        console.error("Failed to parse response:", raw.substring(0, 200));
        throw new Error(`API returned unparseable response (status ${resp.status})`);
    }

    if (!body.success) throw new Error((body as any).error || `Request failed with status ${resp.status}`);
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
        const resp = await fetch("/api/generate", {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ ...body, isExpansionRequest: true })
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
