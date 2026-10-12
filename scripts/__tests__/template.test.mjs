import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { validateAppInfo } from '../lib/app-info.mjs';

const read = (p) => readFileSync(new URL(`../../${p}`, import.meta.url), 'utf8');

describe('templates/app-template', () => {
  it('app-info.json sample passes validation', () => {
    const info = JSON.parse(read('templates/app-template/app-info.json'));
    expect(validateAppInfo(info, { repo: 'tomori-sample-007' })).toEqual([]);
  });
  it('validator copies match the list-site originals (no drift)', () => {
    expect(read('templates/app-template/scripts/lib/app-info.mjs')).toBe(read('scripts/lib/app-info.mjs'));
    expect(read('templates/app-template/scripts/validate-app-info.mjs')).toBe(read('scripts/validate-app-info.mjs'));
  });
  it('contains every required template file', () => {
    for (const f of ['README.md', 'CLAUDE.md', 'docs/USER_GUIDE.md', 'docs/DEV_REPORT.md', '.github/workflows/deploy.yml']) {
      expect(read(`templates/app-template/${f}`).length).toBeGreaterThan(50);
    }
  });
});
