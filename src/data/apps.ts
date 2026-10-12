export type AppStatus = 'published' | 'beta' | 'coming-soon';

export interface FaqItem {
  q: string;
  a: string;
}

export interface AppInfo {
  /** 3桁の番号。URL (#/apps/001) と表示の「APP 001」に使う */
  id: string;
  name: string;
  category: string;
  /** 一覧カード用の短い紹介文 */
  description: string;
  /** 詳細ページ上部のキャッチコピー */
  tagline: string;
  /** 詳細ページの「アプリの概要」 */
  overview: string;
  /** 「このアプリでできること」 */
  capabilities: string[];
  /** 「主な機能」 */
  features: string[];
  /** 「基本的な使い方」(3〜5ステップ) */
  usageSteps: string[];
  /** 「利用時の注意事項」 */
  notes: string[];
  appUrl: string;
  /** 絵文字または1〜2文字。サムネイル画像を使う場合は thumbnail を指定 */
  icon: string;
  /** 任意: public/ 配下の画像パス (例: thumbs/001.png) */
  thumbnail?: string;
  status: AppStatus;
  /** YYYY-MM-DD */
  publishedAt: string;
  /** 任意: 詳しい説明書のURL */
  userGuideUrl?: string;
  /** 任意: よくある質問 */
  faq?: FaqItem[];
}

/**
 * ★ 新しいアプリはこの配列に1件追加するだけで、
 *   一覧カードと詳細ページ (#/apps/<id>) が自動で作られます。
 */
export const apps: AppInfo[] = [
  {
    id: '001',
    name: 'TOMORI FOCUS',
    category: '集中・時間管理',
    description: '25分の集中と5分の休憩を管理する、シンプルな集中タイマー。',
    tagline: '25分、集中。5分、休憩。リズムをつくるタイマー。',
    overview:
      'TOMORI FOCUSは、25分の「集中」と5分の「休憩」を交互にくり返すための集中タイマーです。画面に残り時間が大きく表示されるので、いま何をすればよいか迷いません。集中した時間は記録され、過去7日間の履歴で自分のペースをふり返れます。',
    capabilities: [
      '25分間、ひとつの作業に集中する',
      '5分間の休憩を、きちんと取る',
      '今日までの集中時間をふり返る',
    ],
    features: [
      '集中タイマー',
      '休憩タイマー',
      '一時停止・再開・リセット',
      '集中時間の記録',
      '過去7日間の履歴',
    ],
    usageSteps: [
      '集中モードを選ぶ',
      '「開始」を押す',
      '25分間集中する',
      '終了後に休憩タイマーを開始する',
      '集中記録を確認する',
    ],
    notes: [
      '25分を完了した集中時間だけが記録されます。途中でリセットした時間は記録されません。',
      '記録は、いま使っている端末・ブラウザの中に保存されます。別の端末には自動で同期されません。',
    ],
    appUrl: 'https://tomoricot-alt.github.io/tomori-focus-001/',
    icon: '⏱',
    status: 'published',
    publishedAt: '2026-01-01',
    faq: [
      {
        q: '途中で止めた時間も記録されますか？',
        a: '25分を最後まで完了した集中時間だけが記録されます。',
      },
      {
        q: 'スマホとパソコンで記録を共有できますか？',
        a: '記録は端末・ブラウザごとに保存されるため、自動では共有されません。',
      },
    ],
  },
  {
    id: '002',
    name: 'TOMORI IDEA',
    category: '記録・整理',
    description: '思いついたアイデアを、すぐ記録して整理できるメモアプリ。',
    tagline: 'ひらめきを、逃さない。あとで見つけやすい。',
    overview:
      'TOMORI IDEAは、日常生活や仕事中に思いついたアイデアを記録し、整理するためのアプリです。タイトルと内容を入力して保存するだけ。カテゴリやステータスで分けておけば、あとからキーワード検索ですぐに見つけられます。',
    capabilities: [
      '思いついたアイデアをすぐ残す',
      'カテゴリとステータスで整理する',
      'キーワードで過去のアイデアを探す',
    ],
    features: [
      'アイデア登録',
      '編集・削除',
      'カテゴリ分類',
      'ステータス管理',
      'キーワード検索',
    ],
    usageSteps: [
      '新規登録画面を開く',
      'アイデアのタイトルと内容を入力',
      'カテゴリを選択',
      '保存する',
      '一覧から検索・編集する',
    ],
    notes: [
      'アイデアは、いま使っている端末・ブラウザの中に保存されます。',
      'ブラウザのデータを削除すると、記録が失われる可能性があります。大切な内容は別にメモしておくと安心です。',
    ],
    appUrl: 'https://tomoricot-alt.github.io/tomori-idea-002/',
    icon: '💡',
    status: 'published',
    publishedAt: '2026-01-01',
    faq: [
      {
        q: 'ブラウザの履歴を消すとどうなりますか？',
        a: 'ブラウザデータの削除により、保存したアイデアが消える可能性があります。',
      },
    ],
  },
  {
    id: '003',
    name: 'TOMORI PICK',
    category: '決める・遊ぶ',
    description: '選択肢からルーレットで、ランダムに1つ選ぶアプリ。',
    tagline: '迷ったら、回して決めよう。',
    overview:
      'TOMORI PICKは、複数の選択肢の中からルーレットでランダムに1つを選ぶアプリです。ランチ、順番、ちょっとした決めごとに。回転アニメーションで結果が出るまでのワクワクも楽しめ、過去の抽選結果も見返せます。',
    capabilities: [
      '迷いごとを、公平に決める',
      '選択肢を自由に増やしたり変えたりする',
      '過去の抽選結果をふり返る',
    ],
    features: [
      '選択肢の登録・編集・削除',
      'ルーレット抽選',
      '回転アニメーション',
      '抽選結果表示',
      '抽選履歴',
    ],
    usageSteps: [
      '選択肢を2〜12個登録する',
      'ルーレットを確認する',
      '「回す」を押す',
      'ルーレットが停止するまで待つ',
      '選ばれた結果を確認する',
    ],
    notes: [
      '選択肢は2〜12個の範囲で登録できます。',
      'ルーレットが止まるまで、少し待ってから結果を確認してください。',
    ],
    appUrl: 'https://tomoricot-alt.github.io/tomori-pick-003/',
    icon: '🎯',
    status: 'published',
    publishedAt: '2026-01-01',
  },
];
