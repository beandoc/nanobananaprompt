import { NextRequest, NextResponse } from "next/server";
import { promptService } from "@/lib/prompt-service";
import { ResponseManager } from "@/lib/api-response";

export async function GET() {
    try {
        const prompts = await promptService.getPrompts();
        return ResponseManager.success(prompts);
    } catch (e: any) {
        return ResponseManager.error(e.message);
    }
}
