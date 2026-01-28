import type { TranslationKey } from "./en";

export const ja: Record<TranslationKey, string> = {
  // Settings Help
  "settings.help": "ヘルプ",
  "settings.quickGuide": "クイックガイド",
  "settings.helpLocal": "ノートはこのデバイスにローカル保存されます。",
  "settings.helpSection": "[Section Instrument]を使用して歌詞を構成します。",
  "settings.helpVocal": "(VocalEffect)を使用してボーカルの詳細を説明します。",
  "settings.helpStyle": "スタイルは曲の全体的なサウンドを定義します。",
  "settings.helpExport": "JSONファイルを使用してノートをエクスポートまたはインポートし、デバイス間でデータを移動します。",
  "settings.helpBackup": "データ損失を防ぐため、ブラウザデータをクリアする前にノートを定期的にエクスポートしてください。",

  // App
  "app.name": "My Music Notes",

  // Home
  "home.pinnedNotes": "ピン留め",
  "home.otherNotes": "ノート",
  "home.noNotes": "まだノートがありません",
  "home.noNotesDesc": "+ ボタンをタップして最初の曲ノートを作成",
  "home.noPinnedNotes": "ピン留めされたノートなし",
  "home.noSearchResults": "ノートが見つかりません",
  "home.searchPlaceholder": "ノートを検索...",

  // Sort options
  "sort.updatedDesc": "更新日順",
  "sort.createdDesc": "作成日順",
  "sort.titleAsc": "あいうえお順",

  // Note card
  "card.pin": "ピン留め",
  "card.unpin": "ピン解除",
  "card.duplicate": "複製",
  "card.delete": "削除",

  // Editor
  "editor.newNote": "新しいノート",
  "editor.editNote": "ノートを編集",
  "editor.title": "曲名",
  "editor.composer": "作曲者",
  "editor.lyrics": "歌詞",
  "editor.style": "スタイル",
  "editor.extraInfo": "追加情報",
  "editor.tags": "タグ",
  "editor.tagsPlaceholder": "タグを追加...",
  "editor.save": "保存",
  "editor.saving": "保存中...",
  "editor.saved": "保存済み",
  "editor.autoSaving": "保存中…",
  "editor.autoSaved": "保存済み",
  "editor.undo": "元に戻す",
  "editor.copy": "コピー",
  "editor.clear": "クリア",
  "editor.insertSheet": "挿入",
  "editor.backgroundColor": "背景色",
  "editor.expand": "展開",
  "editor.collapse": "折りたたむ",
  "editor.copyLyrics": "歌詞をコピー",
  "editor.clearLyrics": "歌詞をクリア",
  "editor.copyStyle": "スタイルをコピー",
  "editor.clearStyle": "スタイルをクリア",

  // More menu
  "menu.print": "印刷",
  "menu.exportPdf": "PDFエクスポート",
  "menu.saveAsPdf": "PDFとして保存",
  "menu.exportJson": "JSONエクスポート",
  "menu.importJson": "JSONインポート",
  "menu.copyAll": "すべてコピー",
  "menu.duplicate": "複製",
  "menu.delete": "削除",

  // Insert sheet
  "insertSheet.title": "挿入",
  "insertSheet.sections": "セクション",
  "insertSheet.vocalEffects": "ボーカルエフェクト",
  "insertSheet.instruments": "楽器",
  "insertSheet.insert": "挿入",

  // Style picker
  "stylePicker.title": "スタイル",
  "stylePicker.voiceType": "ボイスタイプ",
  "stylePicker.vocalTechniques": "ボーカルテクニック",
  "stylePicker.mood": "ムード",
  "stylePicker.instruments": "楽器",
  "stylePicker.musicGenres": "音楽ジャンル",

  // Settings
  "settings.title": "設定",
  "settings.theme": "テーマ",
  "settings.themeSystem": "システム",
  "settings.themeA": "ライト – クリーム",
  "settings.themeC": "ライト – グリーン",
  "settings.themeD": "ダーク",
  "settings.about": "情報",
  "settings.version": "バージョン",
  "settings.privacyNote": "すべてのノートはデバイスにローカル保存されます。データはアップロードされません。",

  // PDF export metadata
  "print.exportedFrom": "エクスポート元",
  "print.appType": "ウェブアプリ",
  "print.version": "バージョン",
  "print.uiLanguage": "UI言語",
  "print.exportedAt": "エクスポート日時",
  "print.langEnglish": "英語",
  "print.langThai": "タイ語",
  "print.langSwedish": "スウェーデン語",

  // Timestamps
  "timestamp.lastEdited": "最終編集",
  "timestamp.created": "作成日",

  // Dialogs
  "dialog.deleteTitle": "ノートを削除",
  "dialog.deleteMessage": "このノートを削除してもよろしいですか？この操作は取り消せません。",
  "dialog.cancel": "キャンセル",
  "dialog.confirm": "削除",
  "dialog.clearTitle": "歌詞をクリア",
  "dialog.clearMessage": "すべての歌詞をクリアしてもよろしいですか？",
  "dialog.clearConfirm": "クリア",
  "dialog.clearStyleTitle": "スタイルをクリア",
  "dialog.clearStyleMessage": "すべてのスタイルタグをクリアしてもよろしいですか？",

  // Print dialog
  "print.title": "印刷オプション",
  "print.pdfTitle": "PDFエクスポート",
  "print.textOnly": "テキストのみ",
  "print.appLayout": "アプリレイアウト",
  "print.printButton": "印刷",
  "print.saveButton": "保存",
  "print.created": "作成日",
  "print.updated": "最終更新",
  "print.printed": "印刷日",
  "print.saved": "保存日",
  // Print labels (localized section headers)
  "print.labelTitle": "曲名",
  "print.labelComposer": "作曲者",
  "print.labelLyrics": "歌詞",
  "print.labelStyle": "スタイル",
  "print.labelExtra": "追加情報",
  "print.labelTags": "タグ",

  // Import dialog
  "import.title": "ノートをインポート",
  "import.selectFile": "JSONファイルを選択",
  "import.importing": "インポート中...",
  "import.success": "ノートを正常にインポートしました",
  "import.error": "ノートのインポートに失敗しました",
  "import.invalidFormat": "JSONファイルのみ許可されています",
  "import.fileTooLarge": "ファイルが大きすぎます（最大3MB）",
  "import.limitReached": "1日のインポート上限に達しました",
  "import.limitMessage": "無料ユーザーは1日最大2つのノートをインポートできます。無制限インポートにはProにアップグレードしてください。",
  "import.remainingToday": "本日の残りインポート回数",

  // Toast messages
  "toast.noteSaved": "ノートを保存しました",
  "toast.noteDeleted": "ノートを削除しました",
  "toast.noteDuplicated": "ノートを複製しました",
  "toast.notePinned": "ノートをピン留めしました",
  "toast.noteUnpinned": "ノートのピン留めを解除しました",
  "toast.pinLimit": "ピン留めできるノートは最大6つです",
  "toast.lyricsCopied": "歌詞をコピーしました",
  "toast.styleCopied": "スタイルをコピーしました",
  "toast.allCopied": "すべてのコンテンツをコピーしました",
  "toast.lyricsCleared": "歌詞をクリアしました",
  "toast.styleCleared": "スタイルをクリアしました",
  "toast.undoApplied": "元に戻しました",
  "toast.noUndoHistory": "元に戻す履歴がありません",
  "toast.jsonExported": "JSONをエクスポートしました",
  "toast.jsonExportedFile": "エクスポート完了: {filename}",
  "toast.pdfSaved": "PDF保存完了: {filename}",
  "toast.exportFailed": "エクスポートに失敗しました",
  "toast.printNotAvailable": "モバイルでは印刷できません",
  "toast.insertedAt": "カーソル位置に挿入しました",
  "toast.demoCopySaved": "コピーが保存されました！",

  // Colors
  "color.default": "デフォルト",
  "color.cream": "クリーム",
  "color.pink": "ピンク",
  "color.blue": "ブルー",
  "color.green": "グリーン",
  "color.yellow": "イエロー",
  "color.purple": "パープル",
  "color.orange": "オレンジ",

  // Landing page
  "landing.tagline": "曲を書こう。安全に保管しよう。",
  "landing.supporting": "あなたのやり方で曲を書くためのシンプルな場所。",
  "landing.installApp": "アプリをインストール",
  "landing.openApp": "アプリを開く",
  "landing.tryDemo": "デモを試す",
  "landing.about": "情報",
  "landing.copyright": "© My Music Notes",

  // Demo mode
  "demo.badge": "デモ",
  "demo.helper": "保存すると自分のコピーが作成されます",
  "demo.sampleTitle": "夏のそよ風",
  "demo.sampleComposer": "デモアーティスト",
  "demo.sampleLyrics": "[イントロ]\n\n[ヴァース1]\n朝の光が窓から差し込む...",
  "demo.sampleStyle": "アコースティック、ドリーミー、フォークポップ",
  "demo.sampleTags": "デモ、アコースティック、夏",

  // Language settings
  "settings.language": "言語",
  "settings.languageAuto": "自動（システム）",
  "settings.langThai": "ไทย",
  "settings.langEnglish": "English",
  "settings.langSwedish": "Svenska",
  "settings.langKorean": "한국어",
  "settings.langJapanese": "日本語",
  "settings.langArabic": "العربية",

  // Update check
  "settings.updates": "アップデート",
  "settings.checkForUpdates": "アップデートを確認",
  "settings.upToDate": "最新版です！",
  "settings.upToDateMessage": "最新バージョン（{version}）を使用しています。",
  "settings.updateAvailable": "アップデートあり",
  "settings.updateAvailableMessage": "新しいバージョン（{version}）が利用可能です。ページを更新するか、アプリを再インストールしてください。",
  "settings.checkingForUpdates": "アップデートを確認中...",
  "toast.updateCheckFailed": "アップデートの確認に失敗しました",
};
