import { describe, it, expect } from 'vitest';
import { atlasService } from '../lib/atlas-service';

describe('Sovereign v31 Protocol Tests', () => {
    describe('Atlas Service: Medical Synonym Mapping', () => {
        it('expands common abbreviations (MI, HCM, COPD)', () => {
            const hcmContext = atlasService.getAtlasContext('patient with hcm');
            expect(hcmContext.toLowerCase()).toContain('hypertrophic_cardiomyopathy');

            const miContext = atlasService.getAtlasContext('acute mi case');
            expect(miContext.toLowerCase()).toContain('myocardial_infarction');

            const copdContext = atlasService.getAtlasContext('copd study');
            expect(copdContext.toLowerCase()).toContain('chronic_obstructive_pulmonary_disease');
        });

        it('ranks results by relevance', () => {
            // A brief about MI should prioritize the heart over generic terms
            const context = atlasService.getAtlasContext('myocardial infarction');
            const lines = context.split('\n');
            const firstCategory = lines.find(l => l.startsWith('- '));
            expect(firstCategory).toContain('MYOCARDIAL_INFARCTION');
        });

        it('respects the max entries limit to save tokens', () => {
            const context = atlasService.getAtlasContext('MI, HCM, COPD, DVT, SLE, RA', 3);
            const entryCount = (context.match(/^- /gm) || []).length;
            expect(entryCount).toBeLessThanOrEqual(3);
        });
    });

    describe('Atlas Service: Dynamic Blacklisting', () => {
        it('generates a cardiac-specific blacklist', () => {
            const blacklist = atlasService.getBlacklist('cardiac arrest');
            expect(blacklist).toContain('Glomerulus'); // Renal
            expect(blacklist).toContain('Alveolus');   // Pulmonary
            expect(blacklist).not.toContain('Sarcomere'); // Cardiac (should not be banned)
        });

        it('generates a renal-specific blacklist', () => {
            const blacklist = atlasService.getBlacklist('renal failure ckd');
            expect(blacklist).toContain('Sarcomere'); // Cardiac
            expect(blacklist).toContain('Alveolus');  // Pulmonary
            expect(blacklist).not.toContain('Glomerulus'); // Renal
        });
    });
});
