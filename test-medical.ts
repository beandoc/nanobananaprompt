import { GenerationService } from "./src/lib/services/generation-service";

const examples = [
    {
        name: "Diabetic Nephropathy",
        brief: "Diabetic nephropathy with podocyte effacement and glomerular basement membrane thickening",
        mode: "medical",
        style: "NEJM"
    },
    {
        name: "Laparoscopic Surgery",
        brief: "Laparoscopic cholecystectomy showing Calot's triangle and the cystic artery",
        mode: "medical",
        style: "BioRender"
    }
];

async function runTests() {
    for (const ex of examples) {
        console.log(`\n--- TESTING: ${ex.name} ---`);
        console.log(`Brief: ${ex.brief}`);
        
        // Mocking the system prompt logic from route.ts
        const isSurgical = ex.brief.toLowerCase().match(/surgery|resection|dissection|laparoscop|robotic|endoscop|incision/);
        let systemPrompt = "";
        
        if (isSurgical) {
            systemPrompt = `### ROLE: PRINCIPAL MEDICAL ILLUSTRATOR (SVSP v1.1 - PRUNING MODE)
Refine into a 'Surgical Specification' using STRASBERG'S CRITICAL VIEW logic.
- Word Count: 180-250 words.
- STYLE: NEJM-Style clarity.
- IDENTITY: Neutral/Achromatic inside surgical site.
HARD ZERO-TEXT BAN: Terminate with: "No text characters, no labels."`;
        } else {
            systemPrompt = `### ROLE: PRINCIPAL MEDICAL ILLUSTRATOR
Refine the brief into a high-fidelity 'Disease Mapping Blueprint'.
- Word Count: 180-250 words.
- IDENTITY: All human characters must be of Indian/South Asian descent.
HARD ZERO-TEXT BAN: Terminate with: "No text characters, no labels."`;
        }

        const result = await GenerationService.expandBrief(ex.brief, systemPrompt);
        console.log("Refined Prompt:");
        console.log(result.refinedText);
        console.log("----------------------------");
    }
}

runTests().catch(console.error);
