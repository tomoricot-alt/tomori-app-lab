export type AppStatus = 'published' | 'beta' | 'coming-soon';

export interface FaqItem {
  q: string;
  a: string;
}

export interface AppInfo {
  /** 3桁の番号。URL (#/apps/001) と表示の「APP 001」に使う */
  id: string;
  name: string;
  category: string;
  /** 一覧カード用の短い紹介文 */
  description: string;
  /** 詳細ページ上部のキャッチコピー */
  tagline: string;
  /** 詳細ページの「アプリの概要」 */
  overview: string;
  /** 「このアプリでできること」 */
  capabilities: string[];
  /** 「主な機能」 */
  features: string[];
  /** 「基本的な使い方」(3〜5ステップ) */
  usageSteps: string[];
  /** 「利用時の注意事項」 */
  notes: string[];
  appUrl: string;
  /** 絵文字または1〜2文字。サムネイル画像を使う場合は thumbnail を指定 */
  icon: string;
  /** 任意: public/ 配下の画像パス (例: thumbs/001.png) */
  thumbnail?: string;
  status: AppStatus;
  /** YYYY-MM-DD */
  publishedAt: string;
  /** 任意: 詳しい説明書のURL */
  userGuideUrl?: string;
  /** 任意: よくある質問 */
  faq?: FaqItem[];
}

import { mergeApps, type DiscoveredData } from '../lib/registry';
import curatedJson from './curated-apps.json';
import discoveredJson from './discovered-apps.json';

/**
 * 一覧に表示するアプリ = 手動登録 + 自動登録 を合体したもの。
 *
 * - curated-apps.json  … app-info.json を持たない既存アプリ (APP 001〜006) の手動登録分。内容はここで固定。
 * - discovered-apps.json … GitHub Actions (scripts/sync-apps.mjs) が各アプリの app-info.json から
 *   ビルド時に作る自動登録分。リポジトリにはコミットせず、普段は空 ({"apps":[]})。
 *
 * 新しいアプリ (APP 007 以降) は、アプリ側リポジトリに app-info.json を置いて公開するだけで
 * 自動的にここへ追加されます。このファイルを編集する必要はありません。
 */
export const apps: AppInfo[] = mergeApps(curatedJson as AppInfo[], discoveredJson as DiscoveredData);
