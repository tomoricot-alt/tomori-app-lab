# APP 007 以降の共通テンプレート

`app-template/` は、新しいアプリのリポジトリにコピーして使う雛形です。

| ファイル | 役割 |
| --- | --- |
| `app-info.json` | **一覧サイトに自動登録される情報** (紹介文・機能・使い方など)。書き換えて使う |
| `README.md` / `docs/USER_GUIDE.md` / `docs/DEV_REPORT.md` | 説明書・使い方・開発レポートの雛形 |
| `CLAUDE.md` | Claude Code が自動で読む共通ルール (毎回の長い指示が不要になる) |
| `.github/workflows/deploy.yml` | 検証 → ビルド → GitHub Pages 公開 |
| `scripts/validate-app-info.mjs` | `app-info.json` が一覧サイトに登録できる形式か確認する (依存なし) |
| `package.scripts.md` | `package.json` に足す1行の説明 |

使い方は [docs/AUTOMATION.md](../docs/AUTOMATION.md) の「新しいアプリを追加する流れ」を参照してください。
`scripts/` 内の2ファイルは一覧サイト側と同一内容に保たれています (テストで確認)。
