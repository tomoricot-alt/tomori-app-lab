# 運用説明書

## 1. アプリを追加する（50個まで同じ手順）

`src/data/apps.ts` の `apps` 配列の末尾に1件追加します。

| 項目 | 必須 | 説明 |
| --- | --- | --- |
| `id` | ◯ | 3桁の番号（例 `"004"`）。重複不可。URL は `#/apps/004` になる |
| `name` | ◯ | アプリ名 |
| `category` | ◯ | カテゴリ（一覧カードに表示） |
| `description` | ◯ | 一覧用の短い紹介文（1〜2文） |
| `tagline` | ◯ | 詳細ページのキャッチコピー |
| `overview` | ◯ | アプリの概要 |
| `capabilities` | ◯ | 「このアプリでできること」 |
| `features` | ◯ | 「主な機能」 |
| `usageSteps` | ◯ | 使い方。**3〜5ステップ** |
| `notes` | ◯ | 利用時の注意事項 |
| `appUrl` | ◯ | アプリ本体の URL（`https://` 始まり） |
| `icon` | ◯ | 絵文字など（画像は `thumbnail` に `public/` 内のパスを指定） |
| `status` | ◯ | `published` / `beta` / `coming-soon`（`coming-soon` は「アプリを使う」が非表示） |
| `publishedAt` | ◯ | 公開日 `YYYY-MM-DD` |
| `userGuideUrl` | 任意 | 詳しい説明書の URL |
| `faq` | 任意 | よくある質問 `{ q, a }` の配列 |

追加後は `npm test`（id重複・手順数などを検証）と `npm run build` を実行し、ブランチで作業して Pull Request を作成、本人が確認してからマージします。

## 2. 公開（GitHub Pages）

初回のみ、リポジトリの **Settings → Pages → Build and deployment → Source** を **GitHub Actions** にします。
以降は `main` にマージされると `.github/workflows/deploy.yml` が自動でビルド・公開します。
公開URL: `https://tomoricot-alt.github.io/tomori-app-lab/`

## 3. 注意

- URL は HashRouter（`#/apps/001`）なので、直接アクセス・再読み込み・共有が可能です。
- 説明文は、実際のアプリの操作と一致しているか、追加・変更時に必ず確認してください。
- データは各アプリが端末のブラウザ内に保存します。このサイト自体はデータを保存しません。
