/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const adPromptsDir = path.join(process.cwd(), 'prompts');
        const medicalPromptsDir = path.join(process.cwd(), 'medical_prompts');

        let prompts: any[] = [];

        if (fs.existsSync(adPromptsDir)) {
            const files = fs.readdirSync(adPromptsDir).filter(f => f.endsWith('.json'));
            const data = files.map(file => ({
                name: file,
                type: 'ad',
                content: JSON.parse(fs.readFileSync(path.join(adPromptsDir, file), 'utf-8')),
                timestamp: fs.statSync(path.join(adPromptsDir, file)).mtime
            }));
            prompts = [...prompts, ...data];
        }

        if (fs.existsSync(medicalPromptsDir)) {
            const files = fs.readdirSync(medicalPromptsDir).filter(f => f.endsWith('.json'));
            const data = files.map(file => ({
                name: file,
                type: 'medical',
                content: JSON.parse(fs.readFileSync(path.join(medicalPromptsDir, file), 'utf-8')),
                timestamp: fs.statSync(path.join(medicalPromptsDir, file)).mtime
            }));
            prompts = [...prompts, ...data];
        }

        // Sort by most recent
        prompts.sort((a, b) => b.timestamp - a.timestamp);

        return NextResponse.json({ success: true, prompts });
    } catch (error) {
        console.error('Error fetching library:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch library' }, { status: 500 });
    }
}
