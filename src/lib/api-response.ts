import { NextResponse } from "next/server";

export type ApiResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
    details?: any;
};

export class ResponseManager {
    static success<T>(data: T, status = 200) {
        return NextResponse.json({
            success: true,
            data
        }, { status });
    }

    static error(message: string, status = 500, details?: any) {
        return NextResponse.json({
            success: false,
            error: message,
            ...(details ? { details } : {})
        }, { status });
    }

    static unauthorized(message = "Unauthorized access") {
        return this.error(message, 401);
    }

    static badRequest(message = "Invalid request parameters") {
        return this.error(message, 400);
    }

    static rateLimited(message = "Too many requests. Please slow down.") {
        return this.error(message, 429);
    }
}
