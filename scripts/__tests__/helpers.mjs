// テスト用の「偽のGitHub」。本物のネットワークには一切アクセスしない
export const goodInfo = (id, repo, extra = {}) => ({
  id,
  name: `TOMORI TEST ${id}`,
  category: 'テスト',
  description: 'テスト用アプリです。',
  tagline: 'テスト用のキャッチコピー',
  overview: 'テスト用の概要です。',
  capabilities: ['できること1'],
  features: ['機能1'],
  usageSteps: ['手順1', '手順2', '手順3'],
  notes: ['注意1'],
  appUrl: `https://tomoricot-alt.github.io/${repo}/`,
  icon: '🧪',
  ...extra,
});

const res = (status, body, headers = {}) =>
  new Response(typeof body === 'string' ? body : JSON.stringify(body), {
    status,
    headers: { 'content-type': typeof body === 'string' ? 'text/html' : 'application/json', ...headers },
  });

/**
 * @param {{ repos: string[], infos?: Record<string, any>, deploys?: Record<string, string|null>, sites?: Record<string, number|'error'>, apiDown?: boolean, failInfo?: string[] }} w
 */
export function fakeGitHub(w) {
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(String(url));
    const u = new URL(url);
    if (u.hostname === 'api.github.com') {
      if (w.apiDown) throw new Error('network down');
      if (u.pathname === '/users/tomoricot-alt/repos') {
        return res(200, w.repos.map((name) => ({ name, fork: false, default_branch: 'main' })));
      }
      let m = u.pathname.match(/^\/repos\/tomoricot-alt\/([^/]+)\/deployments$/);
      if (m) return res(200, w.deploys?.[m[1]] ? [{ id: 1 }] : []);
      m = u.pathname.match(/^\/repos\/tomoricot-alt\/([^/]+)\/deployments\/1\/statuses$/);
      if (m) return res(200, [{ state: 'success', created_at: w.deploys[m[1]] }]);
    }
    if (u.hostname === 'raw.githubusercontent.com') {
      const repo = u.pathname.split('/')[2];
      if (w.failInfo?.includes(repo)) return res(503, 'unavailable');
      const info = w.infos?.[repo];
      if (info === undefined) return res(404, 'Not Found');
      return res(200, typeof info === 'string' ? JSON.stringify(info) && info : JSON.stringify(info));
    }
    if (u.hostname === 'tomoricot-alt.github.io') {
      const repo = u.pathname.split('/')[1];
      const s = w.sites?.[repo] ?? 200;
      if (s === 'error') throw new Error('connect failed');
      return res(s, '<html></html>');
    }
    return res(404, 'unexpected ' + url);
  };
  return { fetchImpl, calls };
}
