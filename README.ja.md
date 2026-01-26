# Skill Manager

[English](README.md)

![Skill Manager ダッシュボード](public/screenshot.png)

## 概要
Skill Manager は Claude Code と Codex のスキルをローカルで管理するための Web UI です。ローカルのスキルディレクトリを走査し、検索・絞り込み・詳細確認・共有（シンボリックリンク）・ZIP でのエクスポートを行えます。

## 特長
- Claude/Codex/共有スキルの一覧表示
- 検索・フィルタ・メタデータ確認
- エージェント間のスキル共有（symlink）
- スキルを ZIP でバックアップ

## セットアップ

### 必要環境
- Node.js 18+（20+ 推奨）

### インストール
```bash
npm install
```

### 開発
```bash
npm run dev
```

### 本番
```bash
npm run build
npm run start
```

## スキル配置場所
- Claude Code: `~/.claude/skills`
- Codex: `~/.codex/skills`
- 共有: `~/.agents/skills`（シンボリックリンク）

## 補足
- 共有はシンボリックリンクのため、片方の削除が元ファイル削除になるとは限りません。
- ローカルのスキルを読むため、スキルがある同じマシンで起動してください。
