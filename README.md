# Python 3 エンジニア認定試験 対策ノート

**基礎試験とデータ分析試験の教材と模擬試験**

Python 3 エンジニア認定基礎試験と、Python 3 エンジニア認定データ分析試験の学習サイトです。
個人が作成した非公式の教材で、試験の実施団体や出版社とは関係ありません。

| ページ | アドレス |
|---|---|
| トップ | https://shoushinei.github.io/Python3/ |
| 基礎試験の教材 | https://shoushinei.github.io/Python3/basic/note/ |
| 基礎試験の模試 | https://shoushinei.github.io/Python3/basic/exam/ |
| データ分析試験の教材 | https://shoushinei.github.io/Python3/data-analysis/note/ |
| このサイトについて（注意事項） | https://shoushinei.github.io/Python3/about/ |

## 中身

| 試験 | 教材 | 模試 |
|---|---|---|
| 基礎試験 | チュートリアル総点検（はじめに・13章・暗記シート・用語チェック） | 本番形式模試（40問・60分） |
| データ分析試験 | Pythonデータ分析 入門（はじめに・4章・暗記シート・用語チェック） | なし。トップから外部の模擬試験を案内 |

- **トップ** ── サイトの説明、試験ごとの入口と出題の多い範囲、使い方、参考サイト、よくある質問。記録があれば「前回の続き」も出す。
- **教材** ── 章タブ・目次・読了の記録・確認問題・暗記シート・用語チェック。コードは「▶ 実行」でその場で動かせる。
- **模試** ── 時間制限つきで受験し、採点・章ごとの正解率・解説を確認する。解説から教材の該当する節へ移動できる。

## 構成

```
├─ build.mjs                  src/ を docs/ に組み立てる
├─ tools/                     ビルドの中身（教材・模試・サイト）
├─ docs/                      公開するページ（生成物。直接編集しない）
└─ src/
   ├─ site/                   トップ（index.html）とこのサイトについて（about.html）
   ├─ shared/tokens.css       全ページ共通の色とフォント
   ├─ note/                   教材の共通部分
   │  ├─ template.html        画面の骨組み
   │  ├─ styles/              見た目（番号順につなぐ）
   │  ├─ scripts/             動き（番号順につなぐ）
   │  └─ runner.py            ブラウザの中でコードを実行する処理
   ├─ exam/                   模試の共通部分（template.html, styles/, scripts/）
   └─ courses/                試験ごとの中身
      ├─ basic/
      │  ├─ course.json       名前・章の一覧・合格点など
      │  ├─ note/             教材の本文
      │  │  ├─ ch03/          章ごとのフォルダ
      │  │  │  ├─ _chapter.html  章の冒頭
      │  │  │  ├─ 01-s3-1.html   節（番号順につなぐ）
      │  │  │  └─ 03-quiz.html   確認問題
      │  │  └─ glossary.json  マウスを乗せると出る用語の説明
      │  └─ exam/
      │     ├─ intro.html     模試の説明文
      │     └─ questions.json 問題と解説
      └─ data-analysis/
         ├─ course.json
         └─ note/             教材の本文（images/ に図）
```

## 直すときの場所

| 直したいもの | 場所 |
|---|---|
| 教材の文章・コード | `src/courses/<試験>/note/<章>/` の該当する節 |
| 教材の図 | `src/courses/data-analysis/note/images/`。本文からは `src="images/fig-01.webp"` のように指す |
| 用語の説明 | `src/courses/<試験>/note/glossary.json` |
| 模試の問題・解説 | `src/courses/basic/exam/questions.json` |
| 章の名前・合格点・制限時間 | `src/courses/<試験>/course.json` |
| トップの文章・外部リンク | `src/site/index.html` |
| 教材や模試の動き・見た目 | `src/note/` または `src/exam/` |

節を増やすときは、章のフォルダに番号付きのファイルを足します。ファイル名の順につながります。

`questions.json` の 1 問の形は次のとおりです。`opts` の 2 番目の値は、選択肢をコードの書体で出すときに 1 にします。

```json
{
  "ch": 1,
  "sec": "s1-1",
  "secLabel": "1.1",
  "q": "問題文",
  "code": "",
  "opts": [["選択肢A", 0], ["選択肢B", 0]],
  "ans": 0,
  "exp": "解説"
}
```

`ans` は `opts` の何番目が正解か（0 から数える）、`sec` は復習先にする教材の節の `id` です。

## ビルド

Node.js 18 以上だけで動きます。入れるパッケージはありません。

```bash
node build.mjs           # src/ から docs/ を作る
node build.mjs --check   # docs/ が src/ と一致するか確かめる（書き込みなし）
npm run serve            # ビルドして http://localhost:8080/ で開く
```

`src/` を直したら `node build.mjs` を実行し、`docs/` も一緒にコミットします。
ビルドし忘れて push すると、GitHub Actions の `--check` が失敗して気づけます。

ビルドでは次の誤りも止めます。

- 教材の中に、行き先のないページ内リンクがある
- 模試の問題が、教材にない節や `course.json` にない章を指している
- 模試の正解の番号が、選択肢の範囲を超えている

## 公開

GitHub Pages で公開しています。Settings → Pages の設定は次のとおりです。

| 項目 | 値 |
|---|---|
| Source | Deploy from a branch |
| Branch | `main` |
| Folder | `/docs` |

## 記録の保存先

学習の記録はブラウザの localStorage にだけ保存します。サーバーには送りません。

| 保存キーの先頭 | 内容 |
|---|---|
| `ptut-` | 基礎試験の教材（今の章・読了した章・覚えた用語） |
| `pda2-` | データ分析試験の教材（同上） |
| `pmock-` | 基礎試験の模試（途中の試験・受験記録） |

`course.json` の `storagePrefix` を変えると、それまでの記録を読めなくなります。

## 外部のサービス

- 教材のコード実行は [Pyodide](https://pyodide.org/) を jsDelivr から読み込むため、インターネット接続が必要です。
- 文字は Google Fonts を使っています。
