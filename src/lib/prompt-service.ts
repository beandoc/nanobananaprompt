import { Redis } from "@upstash/redis";
import { LibraryItem } from "@/types";

const redis = Redis.fromEnv();

const PROMPT_LIBRARY_KEY = "nb_prompt_library";

export const promptService = {
    async savePrompt(item: Omit<LibraryItem, 'timestamp'>) {
        if (!process.env.UPSTASH_REDIS_REST_URL) return;

        const newItem: LibraryItem = {
            ...item,
            timestamp: Date.now()
        };

        try {
            // Use lpush to keep most recent at the top
            await redis.lpush(PROMPT_LIBRARY_KEY, JSON.stringify(newItem));
            // Keep library to a reasonable size (e.g., last 100 items)
            await redis.ltrim(PROMPT_LIBRARY_KEY, 0, 99);
        } catch (error) {
            console.error("Failed to save prompt to Redis:", error);
        }
    },

    async getPrompts(): Promise<LibraryItem[]> {
        if (!process.env.UPSTASH_REDIS_REST_URL) return [];

        try {
            const data = await redis.lrange(PROMPT_LIBRARY_KEY, 0, -1);
            return (data as any[]).map(item => {
                if (typeof item === 'string') return JSON.parse(item);
                return item;
            });
        } catch (error) {
            console.error("Failed to fetch prompts from Redis:", error);
            return [];
        }
    }
};
