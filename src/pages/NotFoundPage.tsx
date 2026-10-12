import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="container container--narrow">
      <section className="hero">
        <p className="eyebrow">NOT FOUND</p>
        <h1>ページが見つかりません</h1>
        <p className="lead">URLが間違っているか、アプリがまだ公開されていないようです。</p>
        <Link to="/" className="btn btn--primary">アプリ一覧へ戻る</Link>
      </section>
    </div>
  );
}
