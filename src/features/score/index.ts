export { default as ScorePage } from "./components/ScorePage";
export { scoreT } from "./i18n";
export { newScoreNoteData, isScoreNote, scoreRoute } from "./services/scoreNotes";
export { sanitizeScoreData, createDefaultScoreData } from "./utils/scoreData";
export type { ScoreData } from "./types/score.types";
