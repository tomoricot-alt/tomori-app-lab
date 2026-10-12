import type { AppInfo } from '../data/apps';

/** 自動登録データ (scripts/sync-apps.mjs の出力) */
export interface DiscoveredData {
  apps: AppInfo[];
  /** GitHub Pagesの公開履歴で確認できた初回公開日 (id → YYYY-MM-DD) */
  verifiedDates: Record<string, string>;
}

/** 公開アプリ数の目標 */
export const GOAL_COUNT = 50;

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * 手動登録 + 自動登録を合体する。
 * - 同じidは手動登録が優先 (既存アプリの内容は自動処理で書き換えない)
 * - 自動登録どうしでidが重複したら、2件目以降は無視
 * - 公開日は、公開履歴で確認できたものがあればそれを優先
 */
export function mergeApps(curated: AppInfo[], discovered: DiscoveredData): AppInfo[] {
  const dates = discovered.verifiedDates ?? {};
  const withDate = (a: AppInfo): AppInfo => (DATE.test(dates[a.id] ?? '') ? { ...a, publishedAt: dates[a.id] } : a);
  const seen = new Set<string>();
  const result: AppInfo[] = [];
  for (const a of [...curated, ...(discovered.apps ?? [])]) {
    if (seen.has(a.id)) continue;
    seen.add(a.id);
    result.push(withDate(a));
  }
  return result.sort((a, b) => a.id.localeCompare(b.id));
}

/** 公開済み (published) のアプリ数。データから自動で数える */
export const publishedCount = (list: AppInfo[]): number => list.filter((a) => a.status === 'published').length;

/** 50アプリに対する進捗率 (0〜100の整数) */
export const progressPercent = (count: number, goal: number = GOAL_COUNT): number =>
  Math.max(0, Math.min(100, Math.round((count / goal) * 100)));
