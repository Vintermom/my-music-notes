import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Note, NoteColor, STYLE_CHAR_LIMIT_FREE } from "@/domain/types";
import { t, getCurrentLang } from "@/i18n";
import { createNote } from "@/storage/notesRepo";
import { useLyricsHistory } from "@/hooks/useLyricsHistory";
import { useStyleHistory } from "@/hooks/useStyleHistory";
import { toast } from "sonner";
import {
  ArrowLeft, Plus, ChevronDown, ChevronUp, Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TagsInput } from "@/components/TagsInput";
import { InsertSheet } from "@/components/InsertSheet";
import { StylePicker } from "@/components/StylePicker";

const colorClasses: Record<NoteColor, string> = {
  default: "note-bg-default", cream: "note-bg-cream", pink: "note-bg-pink",
  blue: "note-bg-blue", green: "note-bg-green", yellow: "note-bg-yellow",
  purple: "note-bg-purple", orange: "note-bg-orange",
};

// Demo content by language
function getDemoContent() {
  const lang = getCurrentLang();
  
  if (lang === "sv") {
    return {
      title: "Sommarbris",
      composer: "Demo Artist",
      lyrics: `[Intro]

[Vers 1]
Morgonljuset kommer genom mitt fönster
Mjukt och gyllene, varmt och långsamt
(Viskat) Som en hemlighet solen vill dela

[Refräng]
Sommarbris, ta mig bort
Till en plats där jag kan stanna
Där musiken aldrig tar slut
Och melodin transcenderar

[Vers 2]
Jag tar min gitarr och börjar spela
Ord och noter hittar sin väg
(Talat) Ibland skriver de bästa låtarna sig själva

[Brygga]
I tystnaden av detta rum
Melodier börjar blomma

[Outro]
(Nynnar) Mmm...`,
      style: "Akustisk, Drömmande, Folk Pop",
      tags: ["demo", "akustisk", "sommar"],
    };
  }
  
  if (lang === "th") {
    return {
      title: "สายลมฤดูร้อน",
      composer: "ศิลปินตัวอย่าง",
      lyrics: `[อินโทร]

[ท่อนที่ 1]
แสงยามเช้าส่องผ่านหน้าต่าง
อ่อนโยนและสีทอง อบอุ่นและช้า
(กระซิบ) เหมือนความลับที่ดวงอาทิตย์อยากแบ่งปัน

[คอรัส]
สายลมฤดูร้อน พาฉันไป
ไปยังที่ที่ฉันสามารถอยู่
ที่ซึ่งดนตรีไม่มีวันจบ
และทำนองก็ข้ามพ้น

[ท่อนที่ 2]
ฉันหยิบกีตาร์และเริ่มเล่น
คำและโน้ตหาทางของมัน
(พูด) บางครั้งเพลงที่ดีที่สุดก็เขียนตัวเอง

[บริดจ์]
ในความเงียบของห้องนี้
ท่วงทำนองเริ่มผลิบาน

[เอาท์โทร]
(ฮัมเพลง) อืม...`,
      style: "อะคูสติก, ฝันหวาน, โฟล์คป็อป",
      tags: ["ตัวอย่าง", "อะคูสติก", "ฤดูร้อน"],
    };
  }
  
  // Default: English
  return {
    title: "Summer Breeze",
    composer: "Demo Artist",
    lyrics: `[Intro]

[Verse 1]
The morning light comes through my window
Soft and golden, warm and slow
(Whispered) Like a secret the sun wants to share

[Chorus]
Summer breeze, take me away
To a place where I can stay
Where the music never ends
And the melody transcends

[Verse 2]
I pick up my guitar and start to play
Words and notes find their way
(Spoken) Sometimes the best songs write themselves

[Bridge]
In the quiet of this room
Melodies begin to bloom

[Outro]
(Humming) Mmm...`,
    style: "Acoustic, Dreamy, Folk Pop",
    tags: ["demo", "acoustic", "summer"],
  };
}

export default function DemoPage() {
  const navigate = useNavigate();
  const lyricsRef = useRef<HTMLTextAreaElement>(null);
  
  // Get initial demo content
  const demoContent = getDemoContent();
  
  const [note, setNote] = useState<Note>({
    id: "demo",
    title: demoContent.title,
    composer: demoContent.composer,
    lyrics: demoContent.lyrics,
    style: demoContent.style,
    extraInfo: "",
    tags: demoContent.tags,
    color: "orange",
    isPinned: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    timeline: [],
  });

  const [insertSheetOpen, setInsertSheetOpen] = useState(false);
  const [stylePickerOpen, setStylePickerOpen] = useState(false);
  const [lyricsExpanded, setLyricsExpanded] = useState(true);
  const [styleExpanded, setStyleExpanded] = useState(true);

  const { pushToHistory: pushLyricsHistory } = useLyricsHistory(note.lyrics);
  const { pushToHistory: pushStyleHistory } = useStyleHistory(note.style);

  const updateField = useCallback(
    <K extends keyof Note>(field: K, value: Note[K]) => {
      setNote((prev) => ({ ...prev, [field]: value }));
      if (field === "lyrics") pushLyricsHistory(value as string);
      if (field === "style") pushStyleHistory(value as string);
    },
    [pushLyricsHistory, pushStyleHistory]
  );

  const handleSave = () => {
    // Create a real copy of the demo note
    const newNote = createNote({
      title: note.title,
      composer: note.composer,
      lyrics: note.lyrics,
      style: note.style,
      extraInfo: note.extraInfo,
      tags: note.tags,
      color: note.color,
    });
    
    toast.success(t("toast.demoCopySaved"));
    
    // Navigate to the newly created note
    navigate(`/edit/${newNote.id}`);
  };

  const handleInsert = (text: string) => {
    if (!lyricsRef.current) return;
    const textarea = lyricsRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newLyrics = note.lyrics.slice(0, start) + text + note.lyrics.slice(end);
    updateField("lyrics", newLyrics);
    toast.success(t("toast.insertedAt"));
    setTimeout(() => { 
      textarea.focus(); 
      textarea.setSelectionRange(start + text.length, start + text.length); 
    }, 0);
  };

  const handleToggleStyleChip = (chipLabel: string) => {
    const chips = note.style.split(",").map((s) => s.trim()).filter(Boolean);
    const newChips = chips.includes(chipLabel) 
      ? chips.filter((c) => c !== chipLabel) 
      : [...chips, chipLabel];
    updateField("style", newChips.join(", "));
  };

  const getSelectedStyleChips = (): string[] => 
    note.style ? note.style.split(",").map((s) => s.trim()).filter(Boolean) : [];

  const styleCharCount = note.style.length;
  const styleCharLimit = STYLE_CHAR_LIMIT_FREE;

  return (
    <div className={`min-h-screen ${colorClasses[note.color]}`}>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-inherit border-b border-border/50">
        <div className="container max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            {/* Demo Badge */}
            <div className="flex flex-col">
              <span className="px-2 py-0.5 text-xs font-semibold bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-full">
                {t("demo.badge")}
              </span>
              <span className="text-[10px] text-muted-foreground mt-0.5">
                {t("demo.helper")}
              </span>
            </div>
          </div>
          <Button 
            onClick={handleSave} 
            size="sm"
            className="bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600"
          >
            <Save className="h-4 w-4 mr-1" />
            {t("editor.save")}
          </Button>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto px-4 py-4 space-y-3 pb-24">
        {/* Title */}
        <Input 
          placeholder={t("editor.title")} 
          value={note.title} 
          onChange={(e) => updateField("title", e.target.value)} 
          className="text-lg font-semibold h-9 px-2 input-desktop border-transparent bg-transparent"
        />
        {/* Composer */}
        <Input 
          placeholder={t("editor.composer")} 
          value={note.composer} 
          onChange={(e) => updateField("composer", e.target.value)} 
          className="text-sm h-8 px-2 text-muted-foreground input-desktop border-transparent bg-transparent"
        />

        {/* Lyrics Section */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-muted-foreground">{t("editor.lyrics")}</label>
              <Button variant="ghost" size="sm" onClick={() => setInsertSheetOpen(true)} className="h-6 px-1.5 text-xs">
                <Plus className="h-3 w-3 mr-0.5" />{t("editor.insertSheet")}
              </Button>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setLyricsExpanded(!lyricsExpanded)} 
              className="h-6 w-6"
            >
              {lyricsExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </Button>
          </div>
          <Textarea 
            ref={lyricsRef} 
            placeholder={t("editor.lyrics")} 
            value={note.lyrics} 
            onChange={(e) => updateField("lyrics", e.target.value)} 
            className={`resize-none transition-all text-sm ${lyricsExpanded ? "min-h-[180px]" : "min-h-[50px] max-h-[50px]"} textarea-desktop`} 
          />
        </div>

        {/* Style Section */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-muted-foreground">{t("editor.style")}</label>
              <Button variant="ghost" size="sm" onClick={() => setStylePickerOpen(true)} className="h-6 px-1.5 text-xs">
                <Plus className="h-3 w-3 mr-0.5" />{t("stylePicker.title")}
              </Button>
            </div>
            <div className="flex items-center gap-0.5">
              <span className="text-xs text-muted-foreground mr-1">{styleCharCount}/{styleCharLimit}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setStyleExpanded(!styleExpanded)} 
                className="h-6 w-6"
              >
                {styleExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>
          <Textarea 
            placeholder={t("editor.style")} 
            value={note.style} 
            onChange={(e) => {
              if (e.target.value.length <= styleCharLimit) {
                updateField("style", e.target.value);
              }
            }} 
            className={`resize-none transition-all text-sm ${styleExpanded ? "min-h-[70px]" : "min-h-[36px] max-h-[36px]"} textarea-desktop`} 
          />
        </div>

        {/* Extra Info */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground/70">{t("editor.extraInfo")}</label>
          <Textarea 
            placeholder={t("editor.extraInfo")} 
            value={note.extraInfo} 
            onChange={(e) => updateField("extraInfo", e.target.value)} 
            className="min-h-[40px] max-h-[40px] resize-none text-xs textarea-desktop" 
          />
        </div>

        <TagsInput value={note.tags} onChange={(tags) => updateField("tags", tags)} />
      </main>

      <InsertSheet open={insertSheetOpen} onOpenChange={setInsertSheetOpen} onInsert={handleInsert} />
      <StylePicker open={stylePickerOpen} onOpenChange={setStylePickerOpen} selectedChips={getSelectedStyleChips()} onToggleChip={handleToggleStyleChip} />
    </div>
  );
}
