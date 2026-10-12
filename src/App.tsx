import { useEffect } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import ListPage from './pages/ListPage';
import DetailPage from './pages/DetailPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  const { pathname } = useLocation();
  // ページ遷移時は先頭へ (戻る操作時もリスト先頭から始まるが、シンプルさを優先)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="shell">
      <header className="site-header">
        <Link to="/" className="brand" aria-label="TOMORI APP LAB トップへ">
          TOMORI <span>APP LAB</span>
        </Link>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<ListPage />} />
          <Route path="/apps/:id" element={<DetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <footer className="site-footer">© TOMORI APP LAB</footer>
    </div>
  );
}
