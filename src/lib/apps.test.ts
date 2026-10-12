import { describe, expect, it } from 'vitest';
import { apps, type AppInfo } from '../data/apps';
import curated from '../data/curated-apps.json';
import { findApp, validateApps } from './apps';
import { GOAL_COUNT, mergeApps, progressPercent, publishedCount } from './registry';

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
  it('registers APP 001-006 with correct URLs', () => {
    expect(apps.map((a) => a.id)).toEqual(['001', '002', '003', '004', '005', '006']);
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
    expect(publishedCount(apps)).toBe(6);
    expect(publishedCount([sample('007'), sample('008', { status: 'coming-soon' })])).toBe(1);
  });
  it('computes progress against the 50-app goal', () => {
    expect(GOAL_COUNT).toBe(50);
    expect(progressPercent(6)).toBe(12);
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
    expect(mergeApps(curated as AppInfo[], none)).toHaveLength(6);
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
