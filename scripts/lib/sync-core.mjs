// GitHub の公開リポジトリから新しいアプリを見つけ、一覧サイト用のデータを作る中核ロジック。
// ・GitHub API / 公開サイトへの通常のHTTPアクセスだけを使います (生成AIは一切呼びません)
// ・fetch を引数で受け取るので、テストでは偽のGitHubを使って動作を検証できます
import { OWNER, REPO_NAME_PATTERN, parseAppInfo } from './app-info.mjs';

export const LIST_REPO = 'tomori-app-lab'; // 一覧サイト自身は対象外

/** 一時的な失敗 (通信エラー・5xx・API制限)。既存の掲載を残して次回再試行する */
class TransientError extends Error {}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** JST (日本時間) の YYYY-MM-DD にする */
export function toJstDate(iso) {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) throw new Error(`日付を読めません: ${iso}`);
  return new Date(t + 9 * 3600 * 1000).toISOString().slice(0, 10);
}

/**
 * @param {object} p
 * @param {typeof fetch} p.fetchImpl
 * @param {string} [p.owner]
 * @param {string} [p.token]  GITHUB_TOKEN (ログには出しません)
 * @param {Set<string>} p.curatedIds  一覧サイトに手動登録済みのid
 * @param {{apps: any[], verifiedDates: Record<string,string>} | null} p.prev  前回公開したデータ
 * @param {number} [p.retryWaitMs]
 */
export async function syncApps({ fetchImpl, owner = OWNER, token, curatedIds, prev, retryWaitMs = 1500 }) {
  const warnings = [];
  const notices = [];
  const held = []; // { repo, reason }
  const prevApps = new Map((prev?.apps ?? []).map((a) => [a.id, a]));
  const prevDates = prev?.verifiedDates ?? {};

  async function http(url, { api = false, accept } = {}) {
    const headers = { 'User-Agent': 'tomori-app-lab-sync' };
    if (api) {
      headers.Accept = 'application/vnd.github+json';
      headers['X-GitHub-Api-Version'] = '2022-11-28';
      if (token) headers.Authorization = `Bearer ${token}`;
    } else if (accept) headers.Accept = accept;
    let lastErr;
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) await sleep(retryWaitMs * attempt);
      try {
        const res = await fetchImpl(url, { headers, redirect: 'follow', signal: AbortSignal.timeout(20000) });
        const rateLimited = res.status === 429 || (res.status === 403 && res.headers.get('x-ratelimit-remaining') === '0');
        if (res.status >= 500 || rateLimited) {
          lastErr = new TransientError(rateLimited ? 'GitHub APIの利用制限に達しました' : `サーバーエラー (HTTP ${res.status}): ${url}`);
          continue;
        }
        return res;
      } catch (e) {
        lastErr = new TransientError(`通信に失敗しました: ${e.message}`);
      }
    }
    throw lastErr;
  }

  async function apiJson(path) {
    const res = await http(`https://api.github.com${path}`, { api: true });
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) throw new TransientError(`GitHub APIの権限が足りません (HTTP ${res.status}): ${path}`);
      const e = new Error(`HTTP ${res.status}: ${path}`);
      e.status = res.status;
      throw e;
    }
    return res.json();
  }

  // ---- 1. リポジトリ一覧 (失敗したら全体を中止して、既存のサイトを何も変えない) ----
  const repos = [];
  try {
    for (let page = 1; page <= 10; page++) {
      const batch = await apiJson(`/users/${owner}/repos?type=owner&per_page=100&page=${page}`);
      repos.push(...batch);
      if (batch.length < 100) break;
    }
  } catch (e) {
    return { aborted: true, reason: `リポジトリ一覧を取得できませんでした: ${e.message}`, apps: [], verifiedDates: {}, held, warnings, notices };
  }

  const candidates = [];
  for (const r of repos) {
    if (r.name === LIST_REPO || r.fork) continue;
    const m = REPO_NAME_PATTERN.exec(r.name);
    if (m) candidates.push({ repo: r.name, id: m[2], branch: r.default_branch || 'main' });
  }
  candidates.sort((a, b) => a.id.localeCompare(b.id) || a.repo.localeCompare(b.repo));

  // 同じ番号が複数のリポジトリにある場合は、どれが正しいか分からないので全部保留
  const byId = new Map();
  for (const c of candidates) byId.set(c.id, [...(byId.get(c.id) ?? []), c]);
  const dupIds = new Set([...byId].filter(([, v]) => v.length > 1).map(([k]) => k));
  for (const id of dupIds) {
    const names = byId.get(id).map((c) => c.repo).join(', ');
    warnings.push(`番号 ${id} が複数のリポジトリで重複しています (${names})。新規登録を保留しました`);
    for (const c of byId.get(id)) held.push({ repo: c.repo, reason: `番号 ${id} が重複しています` });
  }

  // ---- 2. GitHub Pages の初回公開成功日 (デプロイ履歴から) ----
  async function firstPagesSuccess(repo) {
    const all = [];
    for (let page = 1; page <= 5; page++) {
      const batch = await apiJson(`/repos/${owner}/${repo}/deployments?environment=github-pages&per_page=100&page=${page}`);
      all.push(...batch);
      if (batch.length < 100) break;
    }
    for (const d of all.reverse().slice(0, 20)) {
      const statuses = await apiJson(`/repos/${owner}/${repo}/deployments/${d.id}/statuses?per_page=30`);
      const ok = statuses.filter((s) => s.state === 'success').sort((a, b) => a.created_at.localeCompare(b.created_at))[0];
      if (ok) return toJstDate(ok.created_at);
    }
    return null;
  }

  // ---- 3. 公開URLに実際にアクセスできるか ----
  async function siteIsUp(url) {
    const res = await http(url, { accept: 'text/html' });
    if (!res.ok) return { up: false, why: `公開URLがHTTP ${res.status}を返しました` };
    const type = res.headers.get('content-type') ?? '';
    if (!type.includes('text/html')) return { up: false, why: `公開URLがHTMLを返していません (${type || '不明'})` };
    return { up: true };
  }

  const apps = [];
  const verifiedDates = {};

  for (const c of candidates) {
    if (dupIds.has(c.id)) continue;
    const old = prevApps.get(c.id);
    const keepOld = (why) => {
      if (old) {
        warnings.push(`APP ${c.id} (${c.repo}): ${why} → 前回掲載した内容を維持します`);
        apps.push(old);
      } else {
        held.push({ repo: c.repo, reason: why });
      }
    };
    try {
      if (curatedIds.has(c.id)) {
        // 手動登録済みのアプリ: 内容は変えない。公開日の確認と、公開URLの確認ログだけ行う
        if (prevDates[c.id]) {
          verifiedDates[c.id] = prevDates[c.id];
        } else {
          const date = await firstPagesSuccess(c.repo);
          if (date) verifiedDates[c.id] = date;
          else warnings.push(`APP ${c.id} (${c.repo}): GitHub Pagesの公開成功履歴が見つかりません (掲載は維持)`);
        }
        continue;
      }

      const url = `https://raw.githubusercontent.com/${owner}/${c.repo}/${encodeURIComponent(c.branch)}/app-info.json`;
      const infoRes = await http(url);
      if (infoRes.status === 404) {
        keepOld('app-info.json がありません');
        continue;
      }
      if (!infoRes.ok) throw new Error(`app-info.json の取得に失敗 (HTTP ${infoRes.status})`);
      const parsed = parseAppInfo(await infoRes.text(), { repo: c.repo, owner });
      if (!parsed.ok) {
        keepOld(`app-info.json に誤りがあります: ${parsed.errors.join(' / ')}`);
        continue;
      }

      const site = await siteIsUp(parsed.info.appUrl);
      if (!site.up) {
        keepOld(site.why);
        continue;
      }
      const publishedAt = old?.publishedAt ?? (await firstPagesSuccess(c.repo));
      if (!publishedAt) {
        keepOld('GitHub Pagesの公開成功履歴が見つかりません (CIが成功しただけでは公開済みにしません)');
        continue;
      }
      apps.push({ ...parsed.info, status: 'published', publishedAt });
      if (!old) notices.push(`新しいアプリを登録しました: APP ${c.id} ${parsed.info.name} (${c.repo})`);
    } catch (e) {
      if (e instanceof TransientError) keepOld(`一時的なエラー: ${e.message}`);
      else keepOld(`取得に失敗: ${e.message}`);
    }
  }

  // 一覧に出なくなったリポジトリ (削除・非公開化) は掲載から外す
  const seen = new Set(candidates.map((c) => c.id));
  for (const [id, a] of prevApps) {
    if (!seen.has(id) && !curatedIds.has(id)) notices.push(`APP ${id} ${a.name}: リポジトリが見つからないため掲載から外しました`);
  }

  apps.sort((a, b) => a.id.localeCompare(b.id));
  return { aborted: false, apps, verifiedDates, held, warnings, notices };
}

/** 内容が同じなら同じ値になる指紋 (前回公開分との比較に使う) */
export async function fingerprint(apps, verifiedDates) {
  const { createHash } = await import('node:crypto');
  const sortedDates = Object.fromEntries(Object.entries(verifiedDates).sort(([a], [b]) => a.localeCompare(b)));
  const body = JSON.stringify({ apps: [...apps].sort((a, b) => a.id.localeCompare(b.id)), verifiedDates: sortedDates });
  return createHash('sha256').update(body).digest('hex').slice(0, 16);
}
