import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });


async function test() {
    console.log("Starting simple test...");
    const { GenerationService } = await import("./src/lib/services/generation-service");
    const result = await GenerationService.expandBrief("Test brief", "Test system prompt");
    console.log("Result:", result.refinedText);
    console.log("Error:", result.error);
    console.log("History:", JSON.stringify(result.providerHistory, null, 2));
}

test().catch(console.error);
