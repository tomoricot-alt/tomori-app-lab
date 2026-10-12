import { describe, expect, it } from 'vitest';
import { parseAppInfo, validateAppInfo } from '../lib/app-info.mjs';
import { goodInfo } from './helpers.mjs';

const repo = 'tomori-test-007';

describe('app-info.json validation', () => {
  it('accepts a complete file', () => {
    expect(validateAppInfo(goodInfo('007', repo), { repo })).toEqual([]);
  });
  it('rejects missing required fields and wrong types', () => {
    const bad = goodInfo('007', repo);
    delete bad.tagline;
    bad.features = 'not an array';
    const errors = validateAppInfo(bad, { repo }).join('\n');
    expect(errors).toContain('tagline');
    expect(errors).toContain('features');
  });
  it('requires 3-5 usage steps', () => {
    expect(validateAppInfo(goodInfo('007', repo, { usageSteps: ['a', 'b'] }), { repo }).join()).toContain('usageSteps');
    expect(validateAppInfo(goodInfo('007', repo, { usageSteps: ['a', 'b', 'c', 'd', 'e', 'f'] }), { repo }).join()).toContain('usageSteps');
  });
  it('requires id to match the repository number', () => {
    expect(validateAppInfo(goodInfo('008', repo), { repo }).join()).toContain('id');
  });
  it('requires appUrl to be this repository\'s Pages URL (no arbitrary links)', () => {
    expect(validateAppInfo(goodInfo('007', repo, { appUrl: 'https://evil.example.com/' }), { repo }).join()).toContain('appUrl');
  });
  it('checks optional fields only when present', () => {
    expect(validateAppInfo(goodInfo('007', repo, { faq: [{ q: 'Q', a: 'A' }], userGuideUrl: `https://github.com/tomoricot-alt/${repo}/blob/main/docs/USER_GUIDE.md` }), { repo })).toEqual([]);
    expect(validateAppInfo(goodInfo('007', repo, { faq: [{ q: 'Q' }] }), { repo }).join()).toContain('faq');
    expect(validateAppInfo(goodInfo('007', repo, { userGuideUrl: 'https://evil.example.com/' }), { repo }).join()).toContain('userGuideUrl');
  });
  it('reports broken JSON without throwing', () => {
    const r = parseAppInfo('{ nope', { repo });
    expect(r.ok).toBe(false);
  });
  it('drops unknown keys such as status / publishedAt (decided from real GitHub state)', () => {
    const r = parseAppInfo(JSON.stringify({ ...goodInfo('007', repo), status: 'published', publishedAt: '2020-01-01' }), { repo });
    expect(r.ok).toBe(true);
    expect(r.info.status).toBeUndefined();
    expect(r.info.publishedAt).toBeUndefined();
  });
});
