import { useEffect } from 'react';
import { apps } from '../data/apps';
import AppCard from '../components/AppCard';

export default function ListPage() {
  useEffect(() => {
    document.title = 'TOMORI APP LAB';
  }, []);
  return (
    <div className="container">
      <section className="hero">
        <p className="eyebrow">OFFICIAL APP LIST</p>
        <h1>小さくて、使いやすい。<br />TOMORIのアプリたち。</h1>
        <p className="lead">気になるアプリを選ぶと、できることと使い方を確認できます。</p>
      </section>
      <section aria-label="アプリ一覧" className="grid">
        {apps.map((a) => (
          <AppCard key={a.id} app={a} />
        ))}
      </section>
    </div>
  );
}
