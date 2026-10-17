import type { AppInfo } from '../data/apps';
import { isKidsApp, KIDS_BADGE_LABEL } from '../lib/kids';

/** 子ども向けアプリにだけ「🧒 子ども向け」を表示する。対象外なら何も表示しない */
export default function KidsBadge({ app }: { app: Pick<AppInfo, 'id'> }) {
  if (!isKidsApp(app)) return null;
  return <p className="kids-badge">{KIDS_BADGE_LABEL}</p>;
}
