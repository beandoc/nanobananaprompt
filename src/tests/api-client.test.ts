import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../lib/api-client';

describe('apiClient', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('sets and gets the admin secret correctly', () => {
        apiClient.setSecret('test-secret');
        expect(apiClient.getSecret()).toBe('test-secret');
        expect(localStorage.getItem('nb_admin_secret')).toBe('test-secret');
    });

    it('includes Authorization header when secret is present', async () => {
        const mockResponse = { success: true, prompts: [] };
        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
        });

        apiClient.setSecret('test-secret');
        await apiClient.fetchLibrary();

        expect(global.fetch).toHaveBeenCalledWith('/api/library', expect.objectContaining({
            headers: expect.objectContaining({
                'Authorization': 'Bearer test-secret'
            })
        }));
    });

    it('throws error when response is not ok', async () => {
        (global.fetch as any).mockResolvedValueOnce({
            ok: false,
            json: async () => ({ error: 'Unauthorized' }),
        });

        await expect(apiClient.fetchLibrary()).rejects.toThrow('Unauthorized');
    });

    it('generates blueprint with correct headers and body', async () => {
        const mockResult = { success: true, data: { core_prompt: 'test' } };
        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => mockResult,
        });

        const body = { brief: 'test brief', mode: 'medical' as const, isStoryboard: false, style: '', image: null, assetInstruction: 'style' as const };
        const result = await apiClient.generateBlueprint(body);

        expect(result).toEqual(mockResult);
        expect(global.fetch).toHaveBeenCalledWith('/api/generate', expect.objectContaining({
            method: 'POST',
            body: JSON.stringify(body)
        }));
    });
});
