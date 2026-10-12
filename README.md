# TOMORI APP LAB

TOMORI APP LAB の公式アプリ一覧サイトです。一覧から各アプリの「詳細・使い方」ページ（`#/apps/001` など）へ移動できます。

- React + TypeScript + Vite / HashRouter（GitHub Pages の静的ホスティングでそのまま動作）
- サーバー・有料API・追加課金は不要

## 開発

```bash
npm install
npm run dev        # 開発サーバー
npm run typecheck  # 型チェック
npm test           # データ検証テスト
npm run build      # 型チェック + 本番ビルド (dist/)
```

## ページ構成

| URL | 内容 |
| --- | --- |
| `#/` | アプリ一覧 |
| `#/apps/<id>` | アプリ詳細・使い方（例: `#/apps/001`） |

詳細ページは全アプリ共通のテンプレート（`src/pages/DetailPage.tsx`）で、`src/data/apps.ts` のデータから自動生成されます。

## アプリの追加方法

`src/data/apps.ts` の `apps` 配列に1件追加するだけです。一覧カードと詳細ページが自動で作られます。詳しくは [docs/OPERATIONS.md](docs/OPERATIONS.md) を参照してください。
