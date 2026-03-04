import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../app/api/generate/route';
import { NextRequest } from 'next/server';

// shared mocks
const generateContentMock = vi.fn();
const groqCreateMock = vi.fn();
const anthropicCreateMock = vi.fn();

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

vi.mock('@anthropic-ai/sdk', () => {
    return {
        Anthropic: vi.fn().mockImplementation(function () {
            return {
                messages: {
                    create: anthropicCreateMock,
                },
            };
        }),
    };
});

describe('API Route: /api/generate Waterfall Logic', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.GEMINI_API_KEY = 'test-gemini';
        process.env.GROQ_API_KEY = 'test-groq';
        process.env.ANTHROPIC_API_KEY = 'test-anthropic';
    });

    it('successfully handles Gemini success', async () => {
        generateContentMock.mockResolvedValue({
            response: {
                text: () => JSON.stringify({ core_prompt: 'Gemini Success' })
            }
        });

        const req = new NextRequest('http://localhost/api/generate', {
            method: 'POST',
            body: JSON.stringify({ brief: 'test brief', mode: 'ad' }),
        });

        const response = await POST(req);
        const data = await response.json();

        expect(data.success).toBe(true);
        expect(data.data.core_prompt).toBe('Gemini Success');
    });

    it('falls back to Groq if Gemini fails', async () => {
        generateContentMock.mockRejectedValue(new Error('Gemini Down'));

        groqCreateMock.mockResolvedValue({
            choices: [{ message: { content: JSON.stringify({ core_prompt: 'Groq Result' }) } }]
        });

        const req = new NextRequest('http://localhost/api/generate', {
            method: 'POST',
            body: JSON.stringify({ brief: 'test brief', mode: 'ad' }),
        });

        const response = await POST(req);
        const data = await response.json();

        expect(data.success).toBe(true);
        expect(data.data.core_prompt).toBe('Groq Result');
    });

    it('falls back to Anthropic if Gemini and Groq fail', async () => {
        generateContentMock.mockRejectedValue(new Error('Gemini Down'));
        groqCreateMock.mockRejectedValue(new Error('Groq Down'));

        anthropicCreateMock.mockResolvedValue({
            content: [{ text: JSON.stringify({ core_prompt: 'Anthropic Result' }) }]
        });

        const req = new NextRequest('http://localhost/api/generate', {
            method: 'POST',
            body: JSON.stringify({ brief: 'test brief', mode: 'ad' }),
        });

        const response = await POST(req);
        const data = await response.json();

        expect(data.success).toBe(true);
        expect(data.data.core_prompt).toBe('Anthropic Result');
    });

    it('returns 429 if all models fail', async () => {
        generateContentMock.mockRejectedValue(new Error('Gemini Down'));
        groqCreateMock.mockRejectedValue(new Error('Groq Down'));
        anthropicCreateMock.mockRejectedValue(new Error('Anthropic Down'));

        const req = new NextRequest('http://localhost/api/generate', {
            method: 'POST',
            body: JSON.stringify({ brief: 'test brief', mode: 'ad' }),
        });

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(429);
        expect(data.error).toContain('All models exhausted');
    });
});
