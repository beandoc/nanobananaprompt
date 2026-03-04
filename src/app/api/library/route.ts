import { ResponseManager } from '@/lib/api-response';
import { promptService } from '@/lib/prompt-service';
import { validateEnv } from "@/lib/env";

export const runtime = "edge";

export async function GET() {
    validateEnv();
    try {
        const prompts = await promptService.getPrompts();
        return ResponseManager.success({ prompts });
    } catch (error) {
        console.error('Error fetching library:', error);
        return ResponseManager.error('Failed to fetch library');
    }
}
