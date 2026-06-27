# 空飛ぶ円盤辞典 - UFO Encyclopedia Project

UFO・UAPに関する用語、人物、事件、資料を整理する辞典アプリ

## Purpose

saucerpedia は、UFO / UAP に関心を持ち始めた一般ユーザーが、基本語、重要人物、代表事件、資料・機関、誤認例、フェイク確認、体験モチーフをカード形式で横断できる入口です。

UFO Lab Tokyo 内では専門プロダクトへ進む前の索引として機能します。深い調査や全文検索ではなく、まず意味と関係性を短時間でつかめることを優先します。

## Audience

- UFO / UAP を調べ始めた一般ユーザー
- 用語や事件名の意味を短時間で知りたい人
- 古典UFO文化と現代UAPの違いをざっくり把握したい人
- 目撃写真・動画を見る前に、誤認やフェイク確認の基本観点を知りたい人
- Kinichi、Kean、Clark、Ruppelt、Yusuke など UFO Lab Tokyo 内の専門アプリへ入る前の案内を必要とする人

## MVP Scope

現在のMVPは `/saucerpedia` の導線中心トップページと、カテゴリ別カード辞典ページです。

- ヒーローと全カテゴリナビゲーション
- UFO Lab Tokyo 内の関連プロダクト導線
- `/saucerpedia/terms`: 用語辞典
- `/saucerpedia/people`: 人物辞典
- `/saucerpedia/events`: 事件辞典
- `/saucerpedia/history`: UFOの歴史カード
- `/saucerpedia/misidentifications`: UFOと誤認
- `/saucerpedia/fakes`: UFOとフェイク
- `/saucerpedia/resources`: UFO資料・機関辞典
- `/saucerpedia/motifs`: UFO体験モチーフ辞典
- 各カテゴリ辞典の検索、カテゴリまたは種別フィルター
- 一覧カード、カード内の詳細導線、選択中の詳細カード
- IDベースの関連リンクと `?item=` によるカテゴリページ内選択・詳細表示
- 少数ではなく初期確認に十分なローカルTypeScriptデータ

## Out Of Scope

- 大規模DB化
- 外部API連携
- 投稿型コミュニティ
- 真偽を断定する鑑定サービス
- 政府文書や資料本文の全文検索
- 個別事件の長大な調査レポート
- 個別カード詳細ページ群
- 重い3D/WebGL演出
- 関連項目グラフ、地図、年表などの高度ビュー
