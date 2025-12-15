# Draw Application

AI駆動のワークフロー図エディタ - 直感的な操作と自然言語編集で、素早くプロフェッショナルなフローチャートを作成

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff)](https://vitejs.dev/)
[![Fabric.js](https://img.shields.io/badge/Fabric.js-6-orange)](http://fabricjs.com/)

## 概要

Draw Applicationは、会議中やブレインストーミング中に素早くワークフロー図を作成できる、AI搭載のビジュアルエディタです。Fabric.jsベースの強力なキャンバス機能と、Claude AIによる自然言語編集を組み合わせ、誰でも簡単にプロフェッショナルな図を作成できます。

### 主な特徴

- **直感的な操作**: ドラッグ&ドロップでノードを配置、接続
- **AI自然言語編集**: 「承認フローを追加して」のような日本語指示で編集
- **豊富なテンプレート**: 承認フロー、エラー処理など5種類のプリセット
- **柔軟なエクスポート**: JSON、PNG、SVG形式に対応
- **自動保存**: ローカルストレージで作業を自動保存
- **ズーム・パン**: 大規模な図も快適に編集

## デモ

![Demo](docs/demo.gif)

## 機能一覧

### ノード編集
- ✅ プロセス、判断、開始、終了の4種類のノード
- ✅ ドラッグ&ドロップで自由配置
- ✅ ノード間の接続線（コネクタ）
- ✅ ラベル編集
- ✅ 色とスタイルのカスタマイズ

### AI自然言語編集
- ✅ Claude 3.5 Sonnet統合
- ✅ 音声入力対応（Web Speech API）
- ✅ 日本語の自然な指示で編集
- ✅ リアルタイムプレビュー

### ビュー操作
- ✅ マウスホイールズーム（10%〜500%）
- ✅ パンツールでキャンバス移動
- ✅ キーボードショートカット
- ✅ 表示リセット機能

### エクスポート・インポート
- ✅ **JSON**: ワークフローの保存・読み込み
- ✅ **PNG**: 高品質画像出力
- ✅ **SVG**: ベクター画像出力
- ✅ **ドラッグ&ドロップ**: JSONファイルをドロップしてインポート

### テンプレート
- ✅ **承認フロー**: 申請 → 承認判断 → 承認/却下
- ✅ **エラー処理**: エラーハンドリングパターン
- ✅ **並列処理**: 複数処理の並行実行
- ✅ **ループ処理**: 反復処理フロー
- ✅ **条件分岐**: 複雑な条件ロジック
- ✅ **カスタム**: 現在のワークフローをテンプレート保存

### その他
- ✅ Undo/Redo（Ctrl+Z/Y）
- ✅ コピー&ペースト（Ctrl+C/V）
- ✅ 自動保存（5秒デバウンス + 1分間隔）
- ✅ ローカルストレージ永続化

## セットアップ

### 必要要件

- Node.js 18.0以上
- npm または yarn

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/jkyk72/draw-application.git
cd draw-application

# 依存関係をインストール
npm install

# 環境変数を設定
cp .env.example .env
# .envファイルを編集してAnthropic APIキーを設定
```

### 環境変数

`.env`ファイルに以下を設定：

```env
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

Anthropic APIキーは[こちら](https://console.anthropic.com/)から取得できます。

### 開発サーバー起動

```bash
npm run dev
```

ブラウザで http://localhost:5173 を開きます。

### プロダクションビルド

```bash
npm run build
```

ビルド結果は`dist/`ディレクトリに出力されます。

## 使い方

### 基本操作

1. **ノード追加**: 左サイドバーからノードタイプを選択してクリック
2. **ノード移動**: ノードをドラッグ&ドロップ
3. **接続作成**: 「→ コネクタ」ツールを選択 → 開始ノードクリック → 終了ノードクリック
4. **ノード削除**: ノードを選択してDeleteキー

### テンプレート使用

1. 左サイドバーの「📚 テンプレート」をクリック
2. 使いたいテンプレートを選択
3. 確認ダイアログで「OK」

### 自然言語編集

1. 右サイドバーのチャットパネルを開く
2. 「承認フローを追加して」のように日本語で指示
3. 🎤マイクアイコンで音声入力も可能

### エクスポート

1. 左サイドバーの「ファイル操作」セクション
2. 「💾 JSONエクスポート」「🖼️ PNGエクスポート」「🎨 SVGエクスポート」から選択

### インポート

1. 「📂 JSONインポート」ボタンをクリック、または
2. JSONファイルをキャンバスにドラッグ&ドロップ

## キーボードショートカット

| ショートカット | 機能 |
|--------------|------|
| `Delete` / `Backspace` | 選択ノードを削除 |
| `Ctrl+C` | コピー |
| `Ctrl+V` | ペースト |
| `Ctrl+Z` | 取り消し |
| `Ctrl+Y` | やり直し |
| `Ctrl++` | ズームイン |
| `Ctrl+-` | ズームアウト |
| `Ctrl+0` | 表示リセット |
| `マウスホイール` | ズーム |

## 技術スタック

### フロントエンド
- **React 18.3** - UIフレームワーク
- **TypeScript 5.6** - 型安全性
- **Vite 5.4** - 高速ビルドツール
- **Tailwind CSS 3.4** - ユーティリティファーストCSS

### キャンバス
- **Fabric.js 6.x** - HTML5 Canvas操作ライブラリ

### AI
- **Anthropic Claude 3.5 Sonnet** - 自然言語処理
- **Web Speech API** - 音声入力

### 状態管理
- **Zustand** - 軽量で柔軟な状態管理

### その他
- **Web Speech API** - 音声認識
- **Local Storage** - データ永続化

## プロジェクト構造

```
draw-application/
├── src/
│   ├── components/         # Reactコンポーネント
│   │   ├── Canvas/        # メインキャンバス
│   │   ├── Toolbar/       # 左サイドバー
│   │   ├── ChatPanel/     # AI チャットパネル
│   │   └── Header/        # ヘッダー
│   ├── store/             # Zustand ストア
│   │   ├── canvasStore.ts # キャンバス状態管理
│   │   └── toolStore.ts   # ツール選択状態
│   ├── types/             # TypeScript型定義
│   │   └── nodes.ts       # ノード・接続の型
│   ├── utils/             # ユーティリティ関数
│   │   ├── ai.ts          # Claude API統合
│   │   ├── exportImport.ts # エクスポート・インポート
│   │   └── templates.ts   # テンプレート定義
│   ├── App.tsx            # メインアプリケーション
│   └── main.tsx           # エントリーポイント
├── public/                # 静的ファイル
├── .env.example           # 環境変数テンプレート
├── package.json           # 依存関係
├── tsconfig.json          # TypeScript設定
├── vite.config.ts         # Vite設定
└── tailwind.config.js     # Tailwind CSS設定
```

## 開発

### コマンド

```bash
# 開発サーバー起動
npm run dev

# 型チェック
npm run type-check

# ビルド
npm run build

# プレビュー（ビルド後）
npm run preview
```

### コーディング規約

- TypeScriptの厳格モード使用
- ESLint + Prettierでコード品質を維持
- コンポーネントは関数コンポーネント + Hooks
- 状態管理はZustandで一元化

## デプロイ

### Firebase Hosting

```bash
# Firebaseツールインストール
npm install -g firebase-tools

# ログイン
firebase login

# 初期化
firebase init hosting

# デプロイ
npm run build
firebase deploy
```

### Vercel

```bash
# Vercel CLIインストール
npm install -g vercel

# デプロイ
vercel
```

## トラブルシューティング

### Claude APIエラー

**問題**: 「API key not found」エラー

**解決策**:
1. `.env`ファイルが存在するか確認
2. `VITE_ANTHROPIC_API_KEY`が正しく設定されているか確認
3. 開発サーバーを再起動

### キャンバスが表示されない

**問題**: 白い画面のまま

**解決策**:
1. ブラウザのコンソールでエラーを確認
2. `npm install`を再実行
3. ブラウザキャッシュをクリア

### 自動保存が動作しない

**問題**: リロード後にワークフローが復元されない

**解決策**:
1. ブラウザのLocal Storageが有効か確認
2. プライベートブラウジングモードを使用していないか確認

## ライセンス

MIT License

## コントリビューション

プルリクエストを歓迎します！

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## サポート

質問や問題がある場合は、[Issues](https://github.com/jkyk72/draw-application/issues)を作成してください。

## 作者

Created with Claude Code by Anthropic

## 謝辞

- [Fabric.js](http://fabricjs.com/) - Canvas操作ライブラリ
- [Anthropic Claude](https://www.anthropic.com/) - AI自然言語処理
- [React](https://reactjs.org/) - UIフレームワーク
- [Vite](https://vitejs.dev/) - ビルドツール
