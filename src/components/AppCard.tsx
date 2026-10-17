import { Link } from 'react-router-dom';
import type { AppInfo } from '../data/apps';
import { appLabel } from '../lib/apps';
import AppIcon from './AppIcon';
import KidsBadge from './KidsBadge';

export default function AppCard({ app }: { app: AppInfo }) {
  return (
    <article className="card">
      <div className="card-top">
        <AppIcon app={app} />
        <div className="card-heading">
          <p className="eyebrow">{appLabel(app)}</p>
          <h2 className="card-title">{app.name}</h2>
          <KidsBadge app={app} />
        </div>
      </div>
      <p className="chip">{app.category}</p>
      <p className="card-desc">{app.description}</p>
      <Link className="btn btn--outline" to={`/apps/${app.id}`}>
        詳細・使い方を見る <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}
