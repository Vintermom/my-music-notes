import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePageMeta } from "@/lib/usePageMeta";
import { scoreT } from "../i18n";
import { useScoreNote } from "../hooks/useScoreNote";
import { ScoreToolbar } from "./ScoreToolbar";
import { ScoreStaffPlaceholder } from "./ScoreStaffPlaceholder";

export default function ScorePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { note, setTitle, setScore, flush } = useScoreNote(id);
  usePageMeta(`${note?.title || scoreT("score.untitled")} — MyMuNotes`, scoreT("score.workspaceEmpty"));

  const goBack = () => { flush(); navigate("/app"); };

  if (note === undefined) return null;
  if (note === null || !note.score) {
    return (
      <div className="min-h-screen bg-background p-6 text-center">
        <p className="text-muted-foreground mb-4">{scoreT("score.notFound")}</p>
        <Button variant="outline" onClick={() => navigate("/app")}>{scoreT("score.back")}</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="container max-w-4xl mx-auto px-4 py-3 flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goBack} aria-label={scoreT("score.back")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Input
            value={note.title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={scoreT("score.titlePlaceholder")}
            aria-label={scoreT("score.titlePlaceholder")}
            className="text-lg font-semibold border-none bg-transparent shadow-none focus-visible:ring-0 px-1"
          />
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-4 pb-24 space-y-4">
        <ScoreToolbar score={note.score} onChange={setScore} />
        <ScoreStaffPlaceholder clef={note.score.clef} timeSignature={note.score.timeSignature} />
        <section className="rounded-lg border border-dashed border-border p-4">
          <h2 className="text-sm font-medium text-foreground mb-1">{scoreT("score.lyrics")}</h2>
          <p className="text-sm text-muted-foreground">{scoreT("score.lyricsSoon")}</p>
        </section>
      </main>
    </div>
  );
}
