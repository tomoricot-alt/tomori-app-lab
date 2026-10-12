import { describe, expect, it } from 'vitest';
import { apps, type AppInfo } from '../data/apps';
import curated from '../data/curated-apps.json';
import { findApp, validateApps } from './apps';
import { GOAL_COUNT, mergeApps, progressPercent, publishedCount } from './registry';

const CURATED_IDS = ['001', '002', '003', '004', '005', '006'];
const idOf = (n: number) => String(n).padStart(3, '0');
/** APP 007〜(6+count) の自動登録アプリ (テスト用データ) を作る */
const discoveredSamples = (count: number): AppInfo[] => Array.from({ length: count }, (_, i) => sample(idOf(7 + i)));

const sample = (id: string, extra: Partial<AppInfo> = {}): AppInfo => ({
  ...(curated[0] as AppInfo),
  id,
  name: `TEST APP ${id}`,
  appUrl: `https://tomoricot-alt.github.io/tomori-test-${id}/`,
  ...extra,
});

describe('apps data', () => {
  it('has no validation errors', () => {
    expect(validateApps(apps)).toEqual([]);
  });
  it('registers APP 001-006 with correct URLs (extra auto-registered apps are allowed)', () => {
    const ids = apps.map((a) => a.id);
    expect(ids.slice(0, 6)).toEqual(CURATED_IDS);
    expect(new Set(ids).size).toBe(ids.length);
    expect(apps.length).toBeLessThanOrEqual(GOAL_COUNT);
    expect(findApp('001')?.name).toBe('TOMORI FOCUS');
    expect(findApp('002')?.appUrl).toBe('https://tomoricot-alt.github.io/tomori-idea-002/');
    expect(findApp('003')?.usageSteps).toHaveLength(5);
    expect(findApp('004')?.appUrl).toBe('https://tomoricot-alt.github.io/tomori-cards-004/');
    expect(findApp('005')?.appUrl).toBe('https://tomoricot-alt.github.io/tomori-homework-005/');
    expect(findApp('006')?.appUrl).toBe('https://tomoricot-alt.github.io/tomori-pocket-006/');
    expect(findApp('999')).toBeUndefined();
  });
  it('every app has 3-5 usage steps and its own app URL', () => {
    for (const a of apps) {
      expect(a.usageSteps.length).toBeGreaterThanOrEqual(3);
      expect(a.usageSteps.length).toBeLessThanOrEqual(5);
      expect(a.appUrl).toContain(`-${a.id}/`);
    }
  });
});

describe('published count and progress', () => {
  it('counts published apps from data', () => {
    // 件数を固定せず、データ (status === 'published') から数えた値と一致することを確認する
    expect(publishedCount(apps)).toBe(apps.filter((a) => a.status === 'published').length);
    expect(publishedCount(apps)).toBeGreaterThanOrEqual(CURATED_IDS.length);
    expect(publishedCount([sample('007'), sample('008', { status: 'coming-soon' })])).toBe(1);
  });
  it('computes progress against the 50-app goal', () => {
    expect(GOAL_COUNT).toBe(50);
    expect(progressPercent(6)).toBe(12);
    expect(progressPercent(10)).toBe(20);
    expect(progressPercent(apps.length)).toBe(Math.min(100, Math.round((apps.length / GOAL_COUNT) * 100)));
    expect(progressPercent(0)).toBe(0);
    expect(progressPercent(50)).toBe(100);
    expect(progressPercent(60)).toBe(100);
  });
});

describe('mergeApps', () => {
  const none = { apps: [], verifiedDates: {} };
  it('adds a discovered APP 007 (test data only, never written to production data)', () => {
    const merged = mergeApps(curated as AppInfo[], { apps: [sample('007')], verifiedDates: {} });
    expect(merged.map((a) => a.id)).toEqual(['001', '002', '003', '004', '005', '006', '007']);
    expect(publishedCount(merged)).toBe(7);
    expect(validateApps(merged)).toEqual([]);
  });
  it('does not register the same id twice', () => {
    const merged = mergeApps(curated as AppInfo[], {
      apps: [sample('007'), sample('007', { name: 'DUP' }), sample('001', { name: 'HIJACK' })],
      verifiedDates: {},
    });
    expect(merged.filter((a) => a.id === '007')).toHaveLength(1);
    expect(merged.find((a) => a.id === '007')?.name).toBe('TEST APP 007');
    expect(merged.find((a) => a.id === '001')?.name).toBe('TOMORI FOCUS');
  });
  it('is stable when called again with the same data', () => {
    const d = { apps: [sample('007')], verifiedDates: {} };
    expect(mergeApps(curated as AppInfo[], d)).toEqual(mergeApps(curated as AppInfo[], d));
  });
  it('applies verified publish dates and ignores malformed ones', () => {
    const merged = mergeApps(curated as AppInfo[], { apps: [], verifiedDates: { '001': '2026-10-11', '002': 'bad' } });
    expect(merged[0].publishedAt).toBe('2026-10-11');
    expect(merged[1].publishedAt).toBe((curated[1] as AppInfo).publishedAt);
  });
  it('keeps the production site unchanged when nothing was discovered', () => {
    expect(mergeApps(curated as AppInfo[], none)).toHaveLength(curated.length);
  });
  it.each([4, 10, 44])('scales with %i auto-registered apps up to the 50-app goal', (count) => {
    const merged = mergeApps(curated as AppInfo[], { apps: discoveredSamples(count), verifiedDates: {} });
    expect(merged).toHaveLength(curated.length + count);
    expect(merged.slice(0, 6).map((a) => a.id)).toEqual(CURATED_IDS);
    expect(merged.map((a) => a.id)).toEqual([...merged.map((a) => a.id)].sort());
    expect(publishedCount(merged)).toBe(merged.length);
    expect(progressPercent(publishedCount(merged))).toBe(Math.round((merged.length / GOAL_COUNT) * 100));
    expect(validateApps(merged)).toEqual([]);
  });
  it('counts only published apps among auto-registered ones', () => {
    const list = discoveredSamples(44).map((a, i) => (i % 4 === 0 ? { ...a, status: 'coming-soon' as const } : a));
    const merged = mergeApps(curated as AppInfo[], { apps: list, verifiedDates: {} });
    expect(publishedCount(merged)).toBe(merged.filter((a) => a.status === 'published').length);
    expect(publishedCount(merged)).toBe(curated.length + 44 - 11);
  });
  it('keeps curated apps 001-006 untouched even when hijack attempts come from discovered data', () => {
    const hijack = CURATED_IDS.map((id) => sample(id, { name: 'HIJACK' }));
    const merged = mergeApps(curated as AppInfo[], { apps: [...hijack, ...discoveredSamples(4)], verifiedDates: {} });
    expect(merged.filter((a) => a.name === 'HIJACK')).toEqual([]);
    expect(merged).toHaveLength(curated.length + 4);
  });
});

describe('validateApps catches bad data', () => {
  it('reports duplicate ids, duplicate URLs and bad step counts', () => {
    const errors = validateApps([sample('007'), sample('007', { usageSteps: ['a'] })]);
    expect(errors.join('\n')).toContain('idが重複');
    expect(errors.join('\n')).toContain('usageSteps');
    expect(errors.join('\n')).toContain('appUrlが他のアプリと重複');
  });
});
