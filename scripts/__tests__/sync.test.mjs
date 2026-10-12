import { describe, expect, it } from 'vitest';
import { fingerprint, syncApps, toJstDate } from '../lib/sync-core.mjs';
import { fakeGitHub, goodInfo } from './helpers.mjs';

const curatedIds = new Set(['001', '002']);
const run = (w, prev = null) =>
  syncApps({ fetchImpl: fakeGitHub(w).fetchImpl, token: 'secret-token', curatedIds, prev, retryWaitMs: 1 });

const R7 = 'tomori-test-007';
const deployed = { [R7]: '2026-11-03T15:30:00Z' }; // UTC 15:30 → JST 翌日 00:30

describe('sync: discovering a new app (APP 007 test data)', () => {
  it('registers a fully published app with the JST publish date from the Pages deployment', async () => {
    const r = await run({ repos: ['tomori-app-lab', 'tomori-focus-001', R7], infos: { [R7]: goodInfo('007', R7) }, deploys: { ...deployed, 'tomori-focus-001': '2026-10-11T09:00:00Z' } });
    expect(r.aborted).toBe(false);
    expect(r.apps).toHaveLength(1);
    expect(r.apps[0]).toMatchObject({ id: '007', status: 'published', publishedAt: '2026-11-04', appUrl: 'https://tomoricot-alt.github.io/tomori-test-007/' });
    expect(r.verifiedDates).toEqual({ '001': '2026-10-11' });
    expect(r.held).toEqual([]);
  });
  it('ignores the list site itself and non-matching repos', async () => {
    const r = await run({ repos: ['tomori-app-lab', 'random-repo', 'tomori-Bad-007', 'tomori-x-7'] });
    expect(r.apps).toEqual([]);
    expect(r.held).toEqual([]);
  });
  it('is idempotent: running twice gives the same fingerprint', async () => {
    const w = { repos: [R7], infos: { [R7]: goodInfo('007', R7) }, deploys: deployed };
    const a = await run(w);
    const b = await run(w, { apps: a.apps, verifiedDates: a.verifiedDates });
    expect(await fingerprint(a.apps, a.verifiedDates)).toBe(await fingerprint(b.apps, b.verifiedDates));
  });
  it('keeps the original publish date of an already registered app', async () => {
    const first = await run({ repos: [R7], infos: { [R7]: goodInfo('007', R7) }, deploys: deployed });
    const again = await run({ repos: [R7], infos: { [R7]: goodInfo('007', R7) }, deploys: { [R7]: '2027-01-01T00:00:00Z' } }, { apps: first.apps, verifiedDates: {} });
    expect(again.apps[0].publishedAt).toBe('2026-11-04');
  });
});

describe('sync: apps that must NOT be published', () => {
  it('holds an app whose CI passed but has no GitHub Pages deployment', async () => {
    const r = await run({ repos: [R7], infos: { [R7]: goodInfo('007', R7) }, deploys: {} });
    expect(r.apps).toEqual([]);
    expect(r.held[0].reason).toContain('公開成功履歴');
  });
  it('holds an app whose public URL is not reachable', async () => {
    const r = await run({ repos: [R7], infos: { [R7]: goodInfo('007', R7) }, deploys: deployed, sites: { [R7]: 404 } });
    expect(r.apps).toEqual([]);
    expect(r.held[0].reason).toContain('404');
  });
  it('holds an app without app-info.json', async () => {
    const r = await run({ repos: [R7], deploys: deployed });
    expect(r.apps).toEqual([]);
    expect(r.held[0].reason).toContain('app-info.json がありません');
  });
  it('holds an app with invalid app-info.json (other apps are unaffected)', async () => {
    const R8 = 'tomori-test-008';
    const r = await run({ repos: [R7, R8], infos: { [R7]: goodInfo('007', R7, { usageSteps: ['only one'] }), [R8]: goodInfo('008', R8) }, deploys: { ...deployed, [R8]: '2026-11-05T00:00:00Z' } });
    expect(r.apps.map((a) => a.id)).toEqual(['008']);
    expect(r.held.map((h) => h.repo)).toEqual([R7]);
  });
  it('holds both repos when two repositories share the same number', async () => {
    const dup = 'tomori-other-007';
    const r = await run({ repos: [R7, dup], infos: { [R7]: goodInfo('007', R7), [dup]: goodInfo('007', dup) }, deploys: { ...deployed, [dup]: '2026-11-05T00:00:00Z' } });
    expect(r.apps).toEqual([]);
    expect(r.held).toHaveLength(2);
  });
  it('never overwrites a manually registered app', async () => {
    const r = await run({ repos: ['tomori-focus-001'], infos: { 'tomori-focus-001': goodInfo('001', 'tomori-focus-001', { name: 'HIJACK' }) }, deploys: { 'tomori-focus-001': '2026-10-11T00:00:00Z' } });
    expect(r.apps).toEqual([]);
  });
});

describe('sync: failures never break the existing site', () => {
  const prevApp = { ...goodInfo('007', R7), status: 'published', publishedAt: '2026-11-04' };
  const prev = { apps: [prevApp], verifiedDates: {} };

  it('aborts without touching anything when the GitHub API is down', async () => {
    const r = await run({ repos: [], apiDown: true }, prev);
    expect(r.aborted).toBe(true);
    expect(r.reason).toContain('リポジトリ一覧');
  });
  it('keeps the previous entry when one repository temporarily fails', async () => {
    const r = await run({ repos: [R7], failInfo: [R7], deploys: deployed }, prev);
    expect(r.apps).toEqual([prevApp]);
    expect(r.warnings.join()).toContain('維持');
  });
  it('keeps the previous entry when the site is temporarily unreachable', async () => {
    const r = await run({ repos: [R7], infos: { [R7]: goodInfo('007', R7) }, sites: { [R7]: 'error' } }, prev);
    expect(r.apps).toEqual([prevApp]);
  });
  it('keeps the previous entry when app-info.json becomes broken', async () => {
    const r = await run({ repos: [R7], infos: { [R7]: goodInfo('007', R7, { features: [] }) }, deploys: deployed }, prev);
    expect(r.apps).toEqual([prevApp]);
  });
  it('other apps still register when one repository fails', async () => {
    const R8 = 'tomori-test-008';
    const r = await run({ repos: [R7, R8], failInfo: [R7], infos: { [R8]: goodInfo('008', R8) }, deploys: { [R8]: '2026-11-05T00:00:00Z' } }, prev);
    expect(r.apps.map((a) => a.id)).toEqual(['007', '008']);
  });
  it('removes an app only when its repository is really gone from a successful listing', async () => {
    const r = await run({ repos: [] }, prev);
    expect(r.aborted).toBe(false);
    expect(r.apps).toEqual([]);
    expect(r.notices.join()).toContain('掲載から外しました');
  });
});

describe('misc', () => {
  it('converts to JST dates', () => {
    expect(toJstDate('2026-10-11T14:59:59Z')).toBe('2026-10-11');
    expect(toJstDate('2026-10-11T15:00:00Z')).toBe('2026-10-12');
  });
  it('never sends the token to non-GitHub-API hosts', async () => {
    const seen = [];
    const gh = fakeGitHub({ repos: [R7], infos: { [R7]: goodInfo('007', R7) }, deploys: deployed });
    await syncApps({ fetchImpl: async (u, o) => (seen.push([new URL(u).hostname, o?.headers?.Authorization]), gh.fetchImpl(u, o)), token: 'secret-token', curatedIds, prev: null, retryWaitMs: 1 });
    for (const [host, auth] of seen) if (host !== 'api.github.com') expect(auth).toBeUndefined();
    expect(seen.some(([h, a]) => h === 'api.github.com' && a === 'Bearer secret-token')).toBe(true);
  });
});
