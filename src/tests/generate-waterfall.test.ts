import { describe, it, expect, vi, beforeEach } from 'vitest';

// GenerationService creates its Gemini/Groq clients in static field initializers,
// which run at module-import time — BEFORE any beforeEach — and the vi.mock
// factories below are hoisted above the imports. So both the env vars and the
// mock fns must be established inside vi.hoisted(), which runs first of all.
const { generateContentMock, groqCreateMock } = vi.hoisted(() => {
    process.env.GEMINI_API_KEY = 'test-gemini';
    process.env.GROQ_API_KEY = 'test-groq';
    return {
        generateContentMock: vi.fn(),
        groqCreateMock: vi.fn(),
    };
});

vi.mock('@google/generative-ai', () => {
    return {
        GoogleGenerativeAI: vi.fn().mockImplementation(function () {
            return {
                getGenerativeModel: vi.fn(() => ({
                    generateContent: generateContentMock
                }))
            };
        }),
        SchemaType: {
            OBJECT: 'OBJECT',
            STRING: 'STRING',
            NUMBER: 'NUMBER',
            ARRAY: 'ARRAY'
        },
        // safetySettings in config/generation.ts references these enums at import time
        HarmCategory: {
            HARM_CATEGORY_HARASSMENT: 'HARM_CATEGORY_HARASSMENT',
            HARM_CATEGORY_HATE_SPEECH: 'HARM_CATEGORY_HATE_SPEECH',
            HARM_CATEGORY_SEXUALLY_EXPLICIT: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            HARM_CATEGORY_DANGEROUS_CONTENT: 'HARM_CATEGORY_DANGEROUS_CONTENT'
        },
        HarmBlockThreshold: {
            BLOCK_NONE: 'BLOCK_NONE',
            BLOCK_ONLY_HIGH: 'BLOCK_ONLY_HIGH',
            BLOCK_MEDIUM_AND_ABOVE: 'BLOCK_MEDIUM_AND_ABOVE',
            BLOCK_LOW_AND_ABOVE: 'BLOCK_LOW_AND_ABOVE'
        }
    };
});

vi.mock('groq-sdk', () => {
    return {
        Groq: vi.fn().mockImplementation(function () {
            return {
                chat: {
                    completions: {
                        create: groqCreateMock,
                    },
                },
            };
        }),
    };
});

// Imported after env + mocks are in place so the static SDK clients pick up the keys.
import { POST } from '../app/api/generate/route';
import { NextRequest } from 'next/server';

const adJson = (corePrompt: string) => JSON.stringify({ core_prompt: corePrompt });

const makeRequest = () => new NextRequest('http://localhost/api/generate', {
    method: 'POST',
    body: JSON.stringify({ brief: 'test brief', mode: 'ad' }),
});

describe('API Route: /api/generate Waterfall Logic', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns the Gemini result when Gemini succeeds', async () => {
        generateContentMock.mockResolvedValue({
            response: { text: () => adJson('Gemini Success') }
        });

        const response = await POST(makeRequest());
        const data = await response.json();

        expect(data.success).toBe(true);
        // Route nests the model JSON under data.data
        expect(data.data.data.core_prompt).toBe('Gemini Success');
    });

    it('falls back to Groq when Gemini fails', async () => {
        generateContentMock.mockRejectedValue(new Error('Gemini Down'));
        groqCreateMock.mockResolvedValue({
            choices: [{ message: { content: adJson('Groq Result') } }]
        });

        const response = await POST(makeRequest());
        const data = await response.json();

        expect(data.success).toBe(true);
        expect(data.data.data.core_prompt).toBe('Groq Result');
    });

    it('fails cleanly with a 500 when every provider is exhausted', async () => {
        generateContentMock.mockRejectedValue(new Error('Gemini Down'));
        groqCreateMock.mockRejectedValue(new Error('Groq Down'));

        const response = await POST(makeRequest());
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.success).toBe(false);
        expect(data.error).toContain('Sovereign Sequence Failure');
    });
});
