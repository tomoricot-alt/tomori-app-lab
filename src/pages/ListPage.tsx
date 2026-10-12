import { useEffect } from 'react';
import { apps } from '../data/apps';
import AppCard from '../components/AppCard';
import { GOAL_COUNT, progressPercent, publishedCount } from '../lib/registry';

export default function ListPage() {
  const count = publishedCount(apps);
  const percent = progressPercent(count);
  useEffect(() => {
    document.title = 'TOMORI APP LAB';
  }, []);
  return (
    <div className="container">
      <section className="hero">
        <p className="eyebrow">OFFICIAL APP LIST</p>
        <h1>小さくて、使いやすい。<br />TOMORIのアプリたち。</h1>
        <p className="lead">気になるアプリを選ぶと、できることと使い方を確認できます。</p>
        <div className="progress" role="group" aria-label="公開アプリ数">
          <p className="progress-text">
            公開中 <strong>{count}</strong> / {GOAL_COUNT} アプリ <span>（{percent}%）</span>
          </p>
          <div
            className="progress-bar"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={GOAL_COUNT}
            aria-valuenow={count}
            aria-label={`${GOAL_COUNT}アプリのうち${count}アプリを公開中`}
          >
            <div className="progress-fill" style={{ width: `${percent}%` }} />
          </div>
        </div>
      </section>
      <section aria-label="アプリ一覧" className="grid">
        {apps.map((a) => (
          <AppCard key={a.id} app={a} />
        ))}
      </section>
    </div>
  );
}
