# TOMORI APP LAB

TOMORI APP LAB の公式アプリ一覧サイトです。一覧から各アプリの「詳細・使い方」ページ（`#/apps/001` など）へ移動できます。

- React + TypeScript + Vite / HashRouter（GitHub Pages の静的ホスティングでそのまま動作）
- サーバー・有料API・追加課金は不要

## 開発

```bash
npm install
npm run dev        # 開発サーバー
npm run typecheck  # 型チェック
npm test           # データ検証・自動登録ロジックのテスト
npm run sync       # 新アプリの検出を手元で実行 (GitHub APIに接続)
npm run build      # 型チェック + 本番ビルド (dist/)
```

## ページ構成

| URL | 内容 |
| --- | --- |
| `#/` | アプリ一覧 |
| `#/apps/<id>` | アプリ詳細・使い方（例: `#/apps/001`） |

詳細ページは全アプリ共通のテンプレート（`src/pages/DetailPage.tsx`）で、`src/data/apps.ts` が返すデータから自動生成されます。

## アプリの追加方法

APP 007以降は、アプリ側リポジトリに `app-info.json` を置いて公開するだけで、GitHub Actions（1時間ごと・生成AI不使用・無料）が自動で一覧に追加します。仕組みと操作は [docs/AUTOMATION.md](docs/AUTOMATION.md)、新アプリの雛形は [templates/](templates/README.md) を参照してください。その他の運用は [docs/OPERATIONS.md](docs/OPERATIONS.md) にあります。
