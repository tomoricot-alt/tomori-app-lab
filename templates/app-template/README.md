# TOMORI ＜NAME＞（APP ＜NNN＞）

TOMORI APP LAB 第＜N＞号。＜どんな人が何のために使うアプリか、1〜2文＞

- 公開URL: https://tomoricot-alt.github.io/＜リポジトリ名＞/
- 技術: React Native / Expo / TypeScript / React Native Web
- サーバー・ログイン・有料API・外部AI APIは使いません。データは端末のブラウザ内（localStorage）だけに保存し、外部へ送信しません。
- ⚠️ ブラウザのサイトデータを削除すると、記録が消える可能性があります。

## 機能

＜機能の一覧。app-info.json の features と一致させる＞

## 開発

```bash
npm ci
npm run web                # 開発サーバー
npm run typecheck          # 型チェック
npm test                   # テスト
npm run build:web          # 公開用ビルド (dist/)
npm run validate:app-info  # 一覧サイトに登録できる形式か確認
```

## 公開（GitHub Pages）

1. 初回のみ: Settings → Pages → Build and deployment → Source を **GitHub Actions** にする。
2. Pull Request を確認・承認して `main` にマージする。
3. `.github/workflows/deploy.yml` が検証・ビルド・公開を自動で行う。
4. 公開後、TOMORI APP LAB の一覧サイトに**自動で**追加される（最大1時間程度）。

## ドキュメント

- [使い方](docs/USER_GUIDE.md)
- [開発レポート](docs/DEV_REPORT.md)
- 一覧サイト用の情報: [app-info.json](app-info.json)
