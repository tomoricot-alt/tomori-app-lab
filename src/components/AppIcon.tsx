import type { AppInfo } from '../data/apps';

export default function AppIcon({ app, size = 'md' }: { app: AppInfo; size?: 'md' | 'lg' }) {
  return (
    <div className={`app-icon app-icon--${size}`} aria-hidden="true">
      {app.thumbnail ? <img src={`./${app.thumbnail}`} alt="" /> : <span>{app.icon}</span>}
    </div>
  );
}
