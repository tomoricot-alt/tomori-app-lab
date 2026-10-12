# package.json に追加するスクリプト

アプリの `package.json` の `scripts` に次の1行を追加してください (Expo/React Native Web の標準構成が前提です)。

```json
"validate:app-info": "node scripts/validate-app-info.mjs app-info.json tomori-＜アプリ名＞-＜番号＞"
```

`typecheck` / `test` / `build:web` は既存アプリ (例: tomori-pocket-006) と同じ名前にしてください。
