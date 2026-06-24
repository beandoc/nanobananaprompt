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

function finalizeBody<T>(body: ApiResponse<T>, resp: Response): T {
    // Every successful API response carries success:true. Anything else — an
    // explicit failure envelope, an error-only body, or a non-ok response — is
    // surfaced as an Error using the server's message when present.
    if (!body || !body.success) {
        throw new Error((body as any)?.error || `Request failed with status ${resp.status ?? "unknown"}`);
    }
    return body.data as T;
}

async function handleResponse<T>(resp: Response): Promise<T> {
    // Prefer reading via stream — works for both streaming and plain JSON
    // responses. Content-type sniffing is unreliable: Vercel's edge rewrites
    // headers on streaming responses, so we can't rely on "x-ndjson" being present.
    // Falls back to text()/json() when no readable stream is exposed (e.g. mocked
    // responses in tests, or runtimes that don't surface a ReadableStream body).
    const reader = resp.body?.getReader?.();

    if (!reader) {
        if (typeof (resp as any).text === "function") {
            const text = (await (resp as any).text())?.trim();
            if (text) {
                try {
                    return finalizeBody<T>(JSON.parse(text), resp);
                } catch {
                    throw new Error(`API returned unparseable response (status ${resp.status ?? "unknown"})`);
                }
            }
        }
        if (typeof (resp as any).json === "function") {
            return finalizeBody<T>(await (resp as any).json(), resp);
        }
        if (!resp.ok) throw new Error(`Request failed with status ${resp.status ?? "unknown"}`);
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
    const lastLine = raw.trim().split("\n").filter(Boolean).pop() || "";
    if (!lastLine) {
        if (!resp.ok) throw new Error(`Request failed with status ${resp.status ?? "unknown"}`);
        throw new Error("Empty response body");
    }

    let body: ApiResponse<T>;
    try {
        body = JSON.parse(lastLine);
    } catch {
        console.error("Failed to parse response:", raw.substring(0, 200));
        throw new Error(`API returned unparseable response (status ${resp.status ?? "unknown"})`);
    }

    return finalizeBody<T>(body, resp);
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
        // The /api/library route returns the LibraryItem[] directly as `data`.
        // Tolerate both the bare-array shape and a legacy { prompts: [...] } wrapper.
        const data = await handleResponse<LibraryItem[] | { prompts: LibraryItem[] }>(resp);
        return Array.isArray(data) ? data : (data?.prompts ?? []);
    }
};
