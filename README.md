# Cross Talk 参加フォーム

各地域で開催するCross Talkのイベント作成、参加受付、申込者管理を行うNext.jsアプリです。

## 主な機能

- 地域・会場・キーカラーの管理
- 会場ごとの開催回数の自動入力
- イベントごとの公開URL発行
- 参加申込フォーム
- 申込者一覧、受付終了、フォーム削除

## 技術構成

- Next.js App Router
- React
- Drizzle ORM
- Neon Postgres
- Vercel

## 環境変数

```text
DATABASE_URL=
DATABASE_URL_UNPOOLED=
ADMIN_PASSWORD=
```

`DATABASE_URL` はアプリ実行用のプール接続、`DATABASE_URL_UNPOOLED` はスキーマ変更・データ移行用の直接接続です。

## 開発

```bash
npm install
npm run dev
```

## データベース

```bash
npm run db:push
```

## 本番ビルド

```bash
npm run build
```
