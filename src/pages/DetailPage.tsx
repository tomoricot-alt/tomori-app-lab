import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { findApp, appLabel } from '../lib/apps';
import AppIcon from '../components/AppIcon';
import KidsBadge from '../components/KidsBadge';
import Steps from '../components/Steps';
import NotFoundPage from './NotFoundPage';

export default function DetailPage() {
  const { id } = useParams();
  const app = findApp(id);

  useEffect(() => {
    document.title = app ? `${app.name} | TOMORI APP LAB` : 'TOMORI APP LAB';
  }, [app]);

  if (!app) return <NotFoundPage />;

  const usable = app.status !== 'coming-soon';

  return (
    <div className="container container--narrow">
      <Link to="/" className="back">← アプリ一覧へ戻る</Link>

      <header className="detail-head">
        <AppIcon app={app} size="lg" />
        <p className="eyebrow">{appLabel(app)} ・ {app.category}</p>
        <h1>{app.name}</h1>
        <KidsBadge app={app} />
        <p className="tagline">{app.tagline}</p>
        {usable ? (
          <a className="btn btn--primary" href={app.appUrl} target="_blank" rel="noopener noreferrer">
            アプリを使う <span aria-hidden="true">↗</span>
            <span className="sr-only">（新しいタブで開きます）</span>
          </a>
        ) : (
          <p className="chip">公開準備中</p>
        )}
      </header>

      <section className="block">
        <h2>アプリの概要</h2>
        <p>{app.overview}</p>
      </section>

      <section className="block">
        <h2>このアプリでできること</h2>
        <ul className="check-list">
          {app.capabilities.map((c) => <li key={c}>{c}</li>)}
        </ul>
      </section>

      <section className="block">
        <h2>主な機能</h2>
        <ul className="tags">
          {app.features.map((f) => <li key={f}>{f}</li>)}
        </ul>
      </section>

      <section className="block">
        <h2>基本的な使い方</h2>
        <Steps steps={app.usageSteps} />
      </section>

      <section className="block block--note">
        <h2>利用時の注意事項</h2>
        <ul className="note-list">
          {app.notes.map((n) => <li key={n}>{n}</li>)}
        </ul>
      </section>

      {app.faq && app.faq.length > 0 && (
        <section className="block">
          <h2>よくある質問</h2>
          <dl className="faq">
            {app.faq.map((f) => (
              <div key={f.q}>
                <dt>Q. {f.q}</dt>
                <dd>A. {f.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {app.userGuideUrl && (
        <section className="block">
          <h2>詳しい説明書</h2>
          <a className="text-link" href={app.userGuideUrl} target="_blank" rel="noopener noreferrer">
            詳しい説明書を開く ↗
          </a>
        </section>
      )}

      <div className="detail-foot">
        {usable && (
          <a className="btn btn--primary" href={app.appUrl} target="_blank" rel="noopener noreferrer">
            アプリを使う <span aria-hidden="true">↗</span>
            <span className="sr-only">（新しいタブで開きます）</span>
          </a>
        )}
        <Link to="/" className="back">← アプリ一覧へ戻る</Link>
      </div>
    </div>
  );
}
