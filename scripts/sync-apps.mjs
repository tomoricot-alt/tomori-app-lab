// 1時間ごとの自動確認で実行するスクリプト。生成AIは使わず、GitHub APIと通常のHTTPアクセスだけで動きます。
//   node scripts/sync-apps.mjs
// 出力: src/data/discovered-apps.json (ビルドに取り込まれる)
//       public/apps-manifest.json    (公開サイトに置かれ、次回の「変更あり?」比較に使う)
//       $GITHUB_OUTPUT の changed=true/false, $GITHUB_STEP_SUMMARY の実行結果
import { appendFileSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fingerprint, syncApps } from './lib/sync-core.mjs';

const SITE_URL = (process.env.SITE_URL || 'https://tomoricot-alt.github.io/tomori-app-lab/').replace(/\/?$/, '/');
const FORCE = process.env.FORCE_DEPLOY === 'true'; // push / 手動実行のときは変更がなくても公開する
const root = new URL('../', import.meta.url);
const out = (name, value) => process.env.GITHUB_OUTPUT && appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);
const summary = (text) => process.env.GITHUB_STEP_SUMMARY && appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${text}\n`);

async function loadPrevManifest() {
  try {
    const res = await fetch(`${SITE_URL}apps-manifest.json?t=${Date.now()}`, { signal: AbortSignal.timeout(20000), headers: { 'Cache-Control': 'no-cache' } });
    if (res.status === 404) return { prev: null, note: '公開済みのデータがまだありません (初回)' };
    if (!res.ok) return { prev: null, failed: `HTTP ${res.status}` };
    const data = await res.json();
    if (data?.schema !== 1 || !Array.isArray(data.apps)) return { prev: null, failed: '前回データの形式が想定外です' };
    return { prev: data };
  } catch (e) {
    return { prev: null, failed: e.message };
  }
}

const curated = JSON.parse(readFileSync(new URL('src/data/curated-apps.json', root), 'utf8'));
const curatedIds = new Set(curated.map((a) => a.id));

const { prev, note, failed } = await loadPrevManifest();
if (note) console.log(note);

let result;
if (failed && !FORCE) {
  console.log(`::warning::前回公開したデータを確認できなかったため、今回は何も変更しません (${failed})`);
  out('changed', 'false');
  summary(`### ⚠️ 今回は変更しませんでした\n前回公開したデータを確認できませんでした (${failed})。既存のサイトはそのまま残ります。次回の実行で再試行します。`);
  process.exit(0);
}

result = await syncApps({
  fetchImpl: fetch,
  token: process.env.GITHUB_TOKEN,
  curatedIds,
  prev,
});

let apps = result.apps;
let verifiedDates = result.verifiedDates;
if (result.aborted) {
  console.log(`::warning::${result.reason}。既存のサイトを維持します`);
  apps = prev?.apps ?? [];
  verifiedDates = prev?.verifiedDates ?? {};
}

for (const w of result.warnings) console.log(`::warning::${w}`);
for (const n of result.notices) console.log(`::notice::${n}`);
for (const h of result.held) console.log(`::notice::保留: ${h.repo} … ${h.reason}`);

const hash = await fingerprint(apps, verifiedDates);
const changed = !result.aborted && (!prev || prev.hash !== hash);

writeFileSync(new URL('src/data/discovered-apps.json', root), JSON.stringify({ apps, verifiedDates }, null, 2) + '\n');
mkdirSync(new URL('public/', root), { recursive: true });
writeFileSync(new URL('public/apps-manifest.json', root), JSON.stringify({ schema: 1, hash, generatedAt: new Date().toISOString(), apps, verifiedDates }) + '\n');

out('changed', String(changed));
console.log(`自動登録アプリ ${apps.length} 件 / 保留 ${result.held.length} 件 / 変更あり: ${changed}`);

const lines = ['### TOMORI APP LAB 自動確認の結果', '', `- 変更あり: **${changed ? 'はい (サイトを更新します)' : 'いいえ (公開はスキップします)'}**`, `- 自動登録されているアプリ: ${apps.length} 件`];
if (result.aborted) lines.push(`- ⚠️ ${result.reason} (既存のサイトを維持)`);
for (const n of result.notices) lines.push(`- ✅ ${n}`);
for (const w of result.warnings) lines.push(`- ⚠️ ${w}`);
if (result.held.length) {
  lines.push('', '#### 保留中のアプリ (一覧にはまだ載せていません)');
  for (const h of result.held) lines.push(`- \`${h.repo}\`: ${h.reason}`);
}
summary(lines.join('\n'));
