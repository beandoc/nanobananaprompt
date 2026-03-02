/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const adPromptsDir = path.join(process.cwd(), 'prompts');
        const medicalPromptsDir = path.join(process.cwd(), 'medical_prompts');
        const vectorPromptsDir = path.join(process.cwd(), 'vector_prompts');

        let prompts: any[] = [];

        const readDir = (dir: string, type: string) => {
            if (fs.existsSync(dir)) {
                const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
                return files.map(file => ({
                    name: file,
                    type,
                    content: JSON.parse(fs.readFileSync(path.join(dir, file), 'utf-8')),
                    timestamp: fs.statSync(path.join(dir, file)).mtime
                }));
            }
            return [];
        };

        prompts = [
            ...readDir(adPromptsDir, 'ad'),
            ...readDir(medicalPromptsDir, 'medical'),
            ...readDir(vectorPromptsDir, 'vector')
        ];

        // Sort by most recent
        prompts.sort((a, b) => b.timestamp - a.timestamp);

        return NextResponse.json({ success: true, prompts });
    } catch (error) {
        console.error('Error fetching library:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch library' }, { status: 500 });
    }
}
