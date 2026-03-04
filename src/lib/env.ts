export const requiredEnvVars = [
    "GEMINI_API_KEY",
    "APP_ADMIN_SECRET",
    "UPSTASH_REDIS_REST_URL",
    "UPSTASH_REDIS_REST_TOKEN"
] as const;

export function validateEnv() {
    const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);

    if (missing.length > 0) {
        const errorMsg = `❌ Missing required environment variables: ${missing.join(", ")}`;
        console.error(errorMsg);

        // In production, we want to fail fast if critical keys are missing
        if (process.env.NODE_ENV === 'production') {
            throw new Error(errorMsg);
        }
    } else {
        console.log("✅ Environment validation successful.");
    }
}

// Optional: specific getters with type safety
export const getEnv = (name: typeof requiredEnvVars[number]): string => {
    const val = process.env[name];
    if (!val) {
        throw new Error(`Environment variable ${name} is not set`);
    }
    return val;
};
