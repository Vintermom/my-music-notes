import type { TranslationKey } from "./en";

export const ko: Record<TranslationKey, string> = {
  // Settings Help
  "settings.help": "도움말",
  "settings.quickGuide": "빠른 안내",
  "settings.helpLocal": "노트는 이 기기에 로컬로 저장됩니다.",
  "settings.helpSection": "[Section Instrument]를 사용하여 가사를 구성하세요.",
  "settings.helpVocal": "(VocalEffect)를 사용하여 보컬 세부 사항을 설명하세요.",
  "settings.helpStyle": "스타일은 노래의 전체적인 사운드를 정의합니다.",
  "settings.helpExport": "JSON 파일을 사용하여 노트를 내보내거나 가져와서 기기 간에 데이터를 이동하세요.",
  "settings.helpBackup": "데이터 손실을 방지하려면 브라우저 데이터를 지우기 전에 노트를 정기적으로 내보내세요.",

  // App
  "app.name": "My Music Notes",

  // Home
  "home.pinnedNotes": "고정됨",
  "home.otherNotes": "노트",
  "home.noNotes": "아직 노트가 없습니다",
  "home.noNotesDesc": "+ 버튼을 탭하여 첫 번째 노래 노트를 만드세요",
  "home.noPinnedNotes": "고정된 노트 없음",
  "home.noSearchResults": "노트를 찾을 수 없음",
  "home.searchPlaceholder": "노트 검색...",

  // Sort options
  "sort.updatedDesc": "최근 업데이트순",
  "sort.createdDesc": "최근 생성순",
  "sort.titleAsc": "가나다순",

  // Note card
  "card.pin": "고정",
  "card.unpin": "고정 해제",
  "card.duplicate": "복제",
  "card.delete": "삭제",

  // Editor
  "editor.newNote": "새 노트",
  "editor.editNote": "노트 편집",
  "editor.title": "노래 제목",
  "editor.composer": "작곡가",
  "editor.lyrics": "가사",
  "editor.style": "스타일",
  "editor.extraInfo": "추가 정보",
  "editor.tags": "태그",
  "editor.tagsPlaceholder": "태그 추가...",
  "editor.save": "저장",
  "editor.saving": "저장 중...",
  "editor.saved": "저장됨",
  "editor.autoSaving": "저장 중…",
  "editor.autoSaved": "저장됨",
  "editor.undo": "실행 취소",
  "editor.copy": "복사",
  "editor.clear": "지우기",
  "editor.insertSheet": "삽입",
  "editor.backgroundColor": "배경색",
  "editor.expand": "확장",
  "editor.collapse": "축소",
  "editor.copyLyrics": "가사 복사",
  "editor.clearLyrics": "가사 지우기",
  "editor.copyStyle": "스타일 복사",
  "editor.clearStyle": "스타일 지우기",

  // More menu
  "menu.print": "인쇄",
  "menu.exportPdf": "PDF 내보내기",
  "menu.saveAsPdf": "PDF로 저장",
  "menu.exportJson": "JSON 내보내기",
  "menu.importJson": "JSON 가져오기",
  "menu.copyAll": "모두 복사",
  "menu.duplicate": "복제",
  "menu.delete": "삭제",

  // Insert sheet
  "insertSheet.title": "삽입",
  "insertSheet.sections": "섹션",
  "insertSheet.vocalEffects": "보컬 효과",
  "insertSheet.instruments": "악기",
  "insertSheet.insert": "삽입",

  // Style picker
  "stylePicker.title": "스타일",
  "stylePicker.voiceType": "보이스 타입",
  "stylePicker.vocalTechniques": "보컬 기법",
  "stylePicker.mood": "분위기",
  "stylePicker.instruments": "악기",
  "stylePicker.musicGenres": "음악 장르",

  // Settings
  "settings.title": "설정",
  "settings.theme": "테마",
  "settings.themeSystem": "시스템",
  "settings.themeA": "라이트 – 크림",
  "settings.themeC": "라이트 – 그린",
  "settings.themeD": "다크",
  "settings.about": "정보",
  "settings.version": "버전",
  "settings.privacyNote": "모든 노트는 기기에 로컬로 저장됩니다. 데이터가 업로드되지 않습니다.",

  // PDF export metadata
  "print.exportedFrom": "내보내기 출처",
  "print.appType": "웹앱",
  "print.version": "버전",
  "print.uiLanguage": "UI 언어",
  "print.exportedAt": "내보낸 날짜",
  "print.langEnglish": "영어",
  "print.langThai": "태국어",
  "print.langSwedish": "스웨덴어",

  // Timestamps
  "timestamp.lastEdited": "마지막 편집",
  "timestamp.created": "생성됨",

  // Dialogs
  "dialog.deleteTitle": "노트 삭제",
  "dialog.deleteMessage": "이 노트를 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.",
  "dialog.cancel": "취소",
  "dialog.confirm": "삭제",
  "dialog.clearTitle": "가사 지우기",
  "dialog.clearMessage": "모든 가사를 지우시겠습니까?",
  "dialog.clearConfirm": "지우기",
  "dialog.clearStyleTitle": "스타일 지우기",
  "dialog.clearStyleMessage": "모든 스타일 태그를 지우시겠습니까?",

  // Print dialog
  "print.title": "인쇄 옵션",
  "print.pdfTitle": "PDF 내보내기",
  "print.textOnly": "텍스트만",
  "print.appLayout": "앱 레이아웃",
  "print.printButton": "인쇄",
  "print.saveButton": "저장",
  "print.created": "생성됨",
  "print.updated": "마지막 업데이트",
  "print.printed": "인쇄됨",
  "print.saved": "저장됨",
  // Print labels (localized section headers)
  "print.labelTitle": "노래 제목",
  "print.labelComposer": "작곡가",
  "print.labelLyrics": "가사",
  "print.labelStyle": "스타일",
  "print.labelExtra": "추가 정보",
  "print.labelTags": "태그",

  // Import dialog
  "import.title": "노트 가져오기",
  "import.selectFile": "JSON 파일 선택",
  "import.importing": "가져오는 중...",
  "import.success": "노트를 성공적으로 가져왔습니다",
  "import.error": "노트 가져오기 실패",
  "import.invalidFormat": "JSON 파일만 허용됩니다",
  "import.fileTooLarge": "파일이 너무 큽니다 (최대 3MB)",
  "import.limitReached": "일일 가져오기 제한에 도달했습니다",
  "import.limitMessage": "무료 사용자는 하루에 최대 2개의 노트를 가져올 수 있습니다. 무제한 가져오기를 위해 Pro로 업그레이드하세요.",
  "import.remainingToday": "오늘 남은 가져오기",

  // Toast messages
  "toast.noteSaved": "노트 저장됨",
  "toast.noteDeleted": "노트 삭제됨",
  "toast.noteDuplicated": "노트 복제됨",
  "toast.notePinned": "노트 고정됨",
  "toast.noteUnpinned": "노트 고정 해제됨",
  "toast.pinLimit": "최대 6개의 노트만 고정할 수 있습니다",
  "toast.lyricsCopied": "가사 복사됨",
  "toast.styleCopied": "스타일 복사됨",
  "toast.allCopied": "모든 콘텐츠 복사됨",
  "toast.lyricsCleared": "가사 지워짐",
  "toast.styleCleared": "스타일 지워짐",
  "toast.undoApplied": "실행 취소됨",
  "toast.noUndoHistory": "취소할 항목 없음",
  "toast.jsonExported": "JSON 내보내기됨",
  "toast.jsonExportedFile": "내보내기됨: {filename}",
  "toast.pdfSaved": "PDF 저장됨: {filename}",
  "toast.exportFailed": "내보내기 실패",
  "toast.printNotAvailable": "모바일에서는 인쇄를 사용할 수 없습니다",
  "toast.insertedAt": "커서 위치에 삽입됨",
  "toast.demoCopySaved": "사본이 저장되었습니다!",

  // Colors
  "color.default": "기본값",
  "color.cream": "크림",
  "color.pink": "핑크",
  "color.blue": "파랑",
  "color.green": "녹색",
  "color.yellow": "노랑",
  "color.purple": "보라",
  "color.orange": "주황",

  // Landing page
  "landing.tagline": "노래를 쓰세요. 안전하게 보관하세요.",
  "landing.supporting": "당신만의 방식으로 노래를 쓸 수 있는 간단한 공간.",
  "landing.installApp": "앱 설치",
  "landing.openApp": "앱 열기",
  "landing.tryDemo": "데모 사용해보기",
  "landing.about": "정보",
  "landing.copyright": "© My Music Notes",

  // Demo mode
  "demo.badge": "데모",
  "demo.helper": "저장하면 사본이 생성됩니다",
  "demo.sampleTitle": "여름 바람",
  "demo.sampleComposer": "데모 아티스트",
  "demo.sampleLyrics": "[인트로]\n\n[1절]\n아침 햇살이 창문을 통해 들어와...",
  "demo.sampleStyle": "어쿠스틱, 몽환적, 포크 팝",
  "demo.sampleTags": "데모, 어쿠스틱, 여름",

  // Language settings
  "settings.language": "언어",
  "settings.languageAuto": "자동 (시스템)",
  "settings.langThai": "ไทย",
  "settings.langEnglish": "English",
  "settings.langSwedish": "Svenska",
  "settings.langKorean": "한국어",
  "settings.langJapanese": "日本語",
  "settings.langArabic": "العربية",

  // Update check
  "settings.updates": "업데이트",
  "settings.checkForUpdates": "업데이트 확인",
  "settings.upToDate": "최신 버전입니다!",
  "settings.upToDateMessage": "최신 버전을 사용 중입니다 ({version}).",
  "settings.updateAvailable": "업데이트 가능",
  "settings.updateAvailableMessage": "새 버전 ({version})을 사용할 수 있습니다. 페이지를 새로고침하거나 앱을 다시 설치하여 업데이트하세요.",
  "settings.checkingForUpdates": "업데이트 확인 중...",
  "toast.updateCheckFailed": "업데이트 확인 실패",
};
