import { apps, type AppInfo } from '../data/apps';

export const findApp = (id: string | undefined): AppInfo | undefined =>
  apps.find((a) => a.id === id);

export const appLabel = (app: AppInfo): string => `APP ${app.id}`;

/** データの不備 (id重複・手順数の範囲外など) を返す。空配列なら問題なし */
export function validateApps(list: AppInfo[]): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  const urls = new Set<string>();
  for (const a of list) {
    if (!/^\d{3}$/.test(a.id)) errors.push(`${a.id}: idは3桁の数字にしてください`);
    if (seen.has(a.id)) errors.push(`${a.id}: idが重複しています`);
    seen.add(a.id);
    if (a.usageSteps.length < 3 || a.usageSteps.length > 5)
      errors.push(`${a.id}: usageStepsは3〜5個にしてください`);
    if (!/^https:\/\//.test(a.appUrl)) errors.push(`${a.id}: appUrlはhttpsで始めてください`);
    if (a.features.length === 0) errors.push(`${a.id}: featuresが空です`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(a.publishedAt)) errors.push(`${a.id}: publishedAtはYYYY-MM-DD形式にしてください`);
    if (!['published', 'beta', 'coming-soon'].includes(a.status)) errors.push(`${a.id}: statusが不正です`);
    if (urls.has(a.appUrl)) errors.push(`${a.id}: appUrlが他のアプリと重複しています`);
    urls.add(a.appUrl);
  }
  return errors;
}
