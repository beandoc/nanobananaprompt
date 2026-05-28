
import { GenerationService } from "./src/lib/services/generation-service";

async function test() {
    console.log("Starting simple test...");
    const result = await GenerationService.expandBrief("Test brief", "Test system prompt");
    console.log("Result:", result.refinedText);
}

test().catch(console.error);
