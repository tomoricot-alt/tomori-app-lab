# 運用説明書

## 1. アプリを追加する

**APP 007以降は、何も編集する必要はありません。** アプリ側リポジトリに `app-info.json` を置いて公開すれば、一覧サイトへ自動登録されます（詳しくは [AUTOMATION.md](AUTOMATION.md)、雛形は [templates/](../templates/README.md)）。

APP 001〜006（`app-info.json` を持たない既存アプリ）の内容は `src/data/curated-apps.json` で管理します。項目の意味は `app-info.json` と同じで、加えて `status`（`published` / `beta` / `coming-soon`）と `publishedAt`（`YYYY-MM-DD`）があります。変更後は `npm test` と `npm run build` を実行し、ブランチ → Pull Request → 本人承認の流れで反映します。

`app-info.json` の項目: `id` / `name` / `category` / `description` / `tagline` / `overview` / `capabilities` / `features` / `usageSteps`（3〜5個） / `notes` / `appUrl` / `icon`（必須）、`userGuideUrl` / `faq`（任意）。公開日・公開状態は書かず、GitHubの公開履歴から自動判定されます。

## 2. 公開（GitHub Pages）

初回のみ、リポジトリの **Settings → Pages → Build and deployment → Source** を **GitHub Actions** にします。
以降は `main` へのマージ、1時間ごとの自動確認（変更があるときのみ）、手動実行のいずれかで `.github/workflows/deploy.yml` がビルド・公開します。
公開URL: `https://tomoricot-alt.github.io/tomori-app-lab/`

## 3. 注意

- URL は HashRouter（`#/apps/001`）なので、直接アクセス・再読み込み・共有が可能です。
- 説明文は、実際のアプリの操作と一致しているか、追加・変更時に必ず確認してください。
- データは各アプリが端末のブラウザ内に保存します。このサイト自体はデータを保存しません。
