import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { apps, type AppInfo } from '../data/apps';
import curated from '../data/curated-apps.json';
import { KIDS_APP_IDS } from '../data/kids-apps';
import KidsBadge from '../components/KidsBadge';
import { isKidsApp, KIDS_BADGE_LABEL } from './kids';
import { mergeApps } from './registry';

const sample = (id: string): AppInfo => ({
  ...(curated[0] as AppInfo),
  id,
  name: `TEST APP ${id}`,
  appUrl: `https://tomoricot-alt.github.io/tomori-test-${id}/`,
});
const html = (id: string) => renderToStaticMarkup(KidsBadge({ app: { id } }) as never);

describe('kids badge', () => {
  it('targets exactly 005-011', () => {
    expect([...KIDS_APP_IDS]).toEqual(['005', '006', '007', '008', '009', '010', '011']);
    expect(KIDS_BADGE_LABEL).toBe('🧒 子ども向け');
  });
  it('marks only target apps; 001-004 and unknown ids are not marked', () => {
    for (const id of ['001', '002', '003', '004', '012', '050', '999']) expect(isKidsApp({ id })).toBe(false);
    for (const id of KIDS_APP_IDS) expect(isKidsApp({ id })).toBe(true);
  });
  it('renders the badge only for target apps', () => {
    expect(html('005')).toContain('子ども向け');
    expect(html('001')).toBe('');
  });
  it('does not force-register 011; it is marked once it is auto-registered', () => {
    const before = mergeApps(curated as AppInfo[], { apps: ['007', '008', '009', '010'].map(sample), verifiedDates: {} });
    expect(before.map((a) => a.id)).not.toContain('011');
    expect(apps.map((a) => a.id)).not.toContain('011');
    const after = mergeApps(curated as AppInfo[], { apps: ['007', '008', '009', '010', '011'].map(sample), verifiedDates: {} });
    expect(after.filter((a) => isKidsApp(a)).map((a) => a.id)).toEqual(['005', '006', '007', '008', '009', '010', '011']);
    expect(after.filter((a) => !isKidsApp(a)).map((a) => a.id)).toEqual(['001', '002', '003', '004']);
  });
});
