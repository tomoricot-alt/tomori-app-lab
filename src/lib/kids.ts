import { KIDS_APP_IDS } from '../data/kids-apps';
import type { AppInfo } from '../data/apps';

export const KIDS_BADGE_LABEL = '🧒 子ども向け';

/** 子ども向けアプリか。一覧・詳細の両方でこの関数を使う */
export const isKidsApp = (app: Pick<AppInfo, 'id'>, ids: readonly string[] = KIDS_APP_IDS): boolean =>
  ids.includes(app.id);
