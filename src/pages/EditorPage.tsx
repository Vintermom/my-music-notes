import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { AudioTake, Note, NoteColor, STYLE_CHAR_LIMIT_FREE } from "@/domain/types";
import { t, currentLang } from "@/i18n";
import { APP_VERSION } from "@/lib/appVersion";
import { usePageMeta } from "@/lib/usePageMeta";
import { escapeHtml } from "@/lib/escapeHtml";
import { getNoteById, updateNote, deleteNote, duplicateNote, downloadNoteJson } from "@/storage/notesRepo";
import { useLyricsHistory } from "@/hooks/useLyricsHistory";
import { useStyleHistory } from "@/hooks/useStyleHistory";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";
import {
  ArrowLeft, Pin, Palette, MoreVertical, Undo2, Plus, Printer, FileJson,
  ClipboardCopy, Copy, Trash2, ChevronDown, ChevronUp, FileDown, Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColorPicker } from "@/components/ColorPicker";
import { TagsInput } from "@/components/TagsInput";
import { InsertSheet } from "@/components/InsertSheet";
// MusicToolsSheet temporarily removed to restore note persistence behavior
import { StylePicker } from "@/components/StylePicker";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { PrintDialog } from "@/components/PrintDialog";
import { LyricsEditor } from "@/components/LyricsEditor";
import { LocalFirstNotice, markFirstSave, hasFirstSaveOccurred, shouldShowFirstSaveNotice } from "@/components/LocalFirstNotice";
import { AllPromptSheet } from "@/components/AllPromptSheet";

const colorClasses: Record<NoteColor, string> = {
  default: "note-bg-default", cream: "note-bg-cream", pink: "note-bg-pink",
  blue: "note-bg-blue", green: "note-bg-green", yellow: "note-bg-yellow",
  purple: "note-bg-purple", orange: "note-bg-orange",
};

export default function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  usePageMeta("Edit Song — My Music Notes");
  const lyricsRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingStartedAtRef = useRef<number>(0);
  const recordingTimerRef = useRef<number | null>(null);
  const recordingStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserFrameRef = useRef<number | null>(null);
  const discardRecordingRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [note, setNote] = useState<Note | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recorderOpen, setRecorderOpen] = useState(false);
  const [recorderState, setRecorderState] = useState<"ready" | "recording" | "finished">("ready");
  const [recordingPreviewBlob, setRecordingPreviewBlob] = useState<string>("");
  const [recordingPreviewDuration, setRecordingPreviewDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [deleteTakeId, setDeleteTakeId] = useState<string | null>(null);
  const [microphoneMessage, setMicrophoneMessage] = useState("");
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [insertSheetOpen, setInsertSheetOpen] = useState(false);
  // musicToolsOpen removed
  const [stylePickerOpen, setStylePickerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [discardRecorderDialogOpen, setDiscardRecorderDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [clearStyleDialogOpen, setClearStyleDialogOpen] = useState(false);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [printMode, setPrintMode] = useState<"print" | "pdf">("print");
  const [lyricsExpanded, setLyricsExpanded] = useState(true);
  const [styleExpanded, setStyleExpanded] = useState(true);
  const [showFirstSaveNotice, setShowFirstSaveNotice] = useState(false);
  const [allPromptOpen, setAllPromptOpen] = useState(false);

  const { pushToHistory: pushLyricsHistory, undo: undoLyrics, canUndo: canUndoLyrics, reset: resetLyricsHistory } = useLyricsHistory(note?.lyrics || "");
  const { pushToHistory: pushStyleHistory, undo: undoStyle, canUndo: canUndoStyle, reset: resetStyleHistory } = useStyleHistory(note?.style || "");

  useEffect(() => {
    if (id) {
      const loadedNote = getNoteById(id);
      if (loadedNote) {
        setNote(loadedNote);
        resetLyricsHistory(loadedNote.lyrics);
        resetStyleHistory(loadedNote.style);
      } else {
        navigate("/app");
      }
    }
  }, [id, navigate, resetLyricsHistory, resetStyleHistory]);

  // Auto-save status reset after 2 seconds
  useEffect(() => {
    if (autoSaveStatus === "saved") {
      const timer = setTimeout(() => setAutoSaveStatus("idle"), 2000);
      return () => clearTimeout(timer);
    }
  }, [autoSaveStatus]);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) window.clearInterval(recordingTimerRef.current);
      if (analyserFrameRef.current) window.cancelAnimationFrame(analyserFrameRef.current);
      audioContextRef.current?.close();
      recordingStreamRef.current?.getTracks().forEach((track) => track.stop());
      audioRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    if (searchParams.get("record") === "1" && note?.hasAudio === true) {
      setRecorderOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [note?.hasAudio, searchParams, setSearchParams]);

  const activeTake = note?.takes?.find((take) => take.id === note.activeTakeId) || note?.takes?.[0];

  const debouncedSave = useDebounce((noteToSave: Note) => {
    const wasFirstSave = !hasFirstSaveOccurred();
    setAutoSaveStatus("saving");
    updateNote(noteToSave.id, noteToSave);
    setAutoSaveStatus("saved");
    
    // Show notice only on first ever save
    if (wasFirstSave) {
      markFirstSave();
      if (shouldShowFirstSaveNotice()) {
        setShowFirstSaveNotice(true);
      }
    }
  }, 1000);

  const updateField = useCallback(
    <K extends keyof Note>(field: K, value: Note[K]) => {
      if (!note) return;
      const updated = { ...note, [field]: value };
      setNote(updated);
      debouncedSave(updated);
      if (field === "lyrics") pushLyricsHistory(value as string);
      if (field === "style") pushStyleHistory(value as string);
    },
    [note, debouncedSave, pushLyricsHistory, pushStyleHistory]
  );

  const handleSave = () => {
    if (!note) return;
    const wasFirstSave = !hasFirstSaveOccurred();
    setIsSaving(true);
    updateNote(note.id, note);
    setIsSaving(false);
    toast.success(t("toast.noteSaved"));
    
    // Show notice only on first ever save
    if (wasFirstSave) {
      markFirstSave();
      if (shouldShowFirstSaveNotice()) {
        setShowFirstSaveNotice(true);
      }
    }
  };

  const handleUndoLyrics = () => {
    const prev = undoLyrics();
    if (prev !== null) {
      setNote((n) => (n ? { ...n, lyrics: prev } : null));
      toast.success(t("toast.undoApplied"));
    } else {
      toast.info(t("toast.noUndoHistory"));
    }
  };

  const handleUndoStyle = () => {
    const prev = undoStyle();
    if (prev !== null) {
      setNote((n) => (n ? { ...n, style: prev } : null));
      toast.success(t("toast.undoApplied"));
    } else {
      toast.info(t("toast.noUndoHistory"));
    }
  };

  const handleCopyLyrics = () => { if (note?.lyrics) { navigator.clipboard.writeText(note.lyrics); toast.success(t("toast.lyricsCopied")); } };
  const handleCopyStyle = () => { if (note?.style) { navigator.clipboard.writeText(note.style); toast.success(t("toast.styleCopied")); } };
  const confirmClearLyrics = () => { updateField("lyrics", ""); toast.success(t("toast.lyricsCleared")); setClearDialogOpen(false); };
  const confirmClearStyle = () => { updateField("style", ""); toast.success(t("toast.styleCleared")); setClearStyleDialogOpen(false); };

  const handleInsert = (text: string) => {
    if (!lyricsRef.current || !note) return;
    const textarea = lyricsRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newLyrics = (note.lyrics || "").slice(0, start) + text + (note.lyrics || "").slice(end);
    updateField("lyrics", newLyrics);
    toast.success(t("toast.insertedAt"));
    setTimeout(() => { textarea.focus(); textarea.setSelectionRange(start + text.length, start + text.length); }, 0);
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const blobToDataUrl = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  const stopRecordingResources = () => {
    if (recordingTimerRef.current) window.clearInterval(recordingTimerRef.current);
    recordingTimerRef.current = null;
    if (analyserFrameRef.current) window.cancelAnimationFrame(analyserFrameRef.current);
    analyserFrameRef.current = null;
    audioContextRef.current?.close();
    audioContextRef.current = null;
    recordingStreamRef.current?.getTracks().forEach((track) => track.stop());
    recordingStreamRef.current = null;
    setAudioLevel(0);
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const handleStartRecording = async () => {
    if (!note || isRecording) return;
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setMicrophoneMessage(t("audio.notSupported"));
      return;
    }

    try {
      setMicrophoneMessage("");
      setRecordingPreviewBlob("");
      setRecordingPreviewDuration(0);
      discardRecordingRef.current = false;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordingStreamRef.current = stream;
      audioChunksRef.current = [];
      recordingStartedAtRef.current = Date.now();

      const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "";
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        const audioContext = new AudioContextClass();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        audioContextRef.current = audioContext;
        const data = new Uint8Array(analyser.frequencyBinCount);
        const updateLevel = () => {
          analyser.getByteFrequencyData(data);
          setAudioLevel(data.reduce((sum, value) => sum + value, 0) / data.length / 255);
          analyserFrameRef.current = window.requestAnimationFrame(updateLevel);
        };
        updateLevel();
      }

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        stopRecordingResources();
        setIsRecording(false);
        if (discardRecordingRef.current) return;

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType || "audio/webm" });
        const blob = await blobToDataUrl(audioBlob);
        const duration = Math.min(60, Math.max(1, Math.round((Date.now() - recordingStartedAtRef.current) / 1000)));
        setRecordingPreviewBlob(blob);
        setRecordingPreviewDuration(duration);
        setRecordingSeconds(duration);
        setRecorderState("finished");
      };

      recorder.start();
      setRecordingSeconds(0);
      setRecorderState("recording");
      setIsRecording(true);
      recordingTimerRef.current = window.setInterval(() => {
        const elapsed = Math.min(60, Math.floor((Date.now() - recordingStartedAtRef.current) / 1000));
        setRecordingSeconds(elapsed);
        if (elapsed >= 60) {
          setMicrophoneMessage(t("audio.maxDurationReached"));
          handleStopRecording();
        }
      }, 250);
    } catch {
      stopRecordingResources();
      setIsRecording(false);
      setMicrophoneMessage(t("audio.microphoneRequired"));
    }
  };

  const handleSelectTake = (takeId: string) => {
    if (!note) return;
    audioRef.current?.pause();
    setIsAudioPlaying(false);
    setAudioCurrentTime(0);
    updateField("activeTakeId", takeId);
  };

  const handleTogglePlayback = () => {
    if (!audioRef.current || !activeTake) return;
    if (isAudioPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const handleSkipAudio = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, Math.min(audioRef.current.duration || 0, audioRef.current.currentTime + seconds));
  };

  const confirmDeleteTake = () => {
    if (!note || !deleteTakeId) return;
    const updatedTakes = (note.takes || []).filter((take) => take.id !== deleteTakeId);
    const nextActiveTakeId = note.activeTakeId === deleteTakeId ? (updatedTakes[0]?.id || "") : (note.activeTakeId || "");
    audioRef.current?.pause();
    setIsAudioPlaying(false);
    setAudioCurrentTime(0);
    const updatedNote = { ...note, takes: updatedTakes, activeTakeId: nextActiveTakeId };
    setNote(updatedNote);
    debouncedSave(updatedNote);
    setDeleteTakeId(null);
  };

  const resetRecorder = () => {
    setRecorderState("ready");
    setRecordingSeconds(0);
    setRecordingPreviewBlob("");
    setRecordingPreviewDuration(0);
    setMicrophoneMessage("");
  };

  const handleSaveRecording = () => {
    if (!note || !recordingPreviewBlob) return;
    const takeId = `take_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const newTake: AudioTake = { id: takeId, createdAt: Date.now(), blob: recordingPreviewBlob, duration: recordingPreviewDuration };
    const updatedNote = { ...note, takes: [...(note.takes || []), newTake], activeTakeId: takeId };
    setNote(updatedNote);
    updateNote(updatedNote.id, updatedNote);
    setRecorderOpen(false);
    resetRecorder();
  };

  const handleRecordAgain = () => {
    resetRecorder();
  };

  const closeRecorderWithoutSaving = () => {
    if (isRecording) {
      discardRecordingRef.current = true;
      handleStopRecording();
    }
    setRecorderOpen(false);
    resetRecorder();
    setDiscardRecorderDialogOpen(false);
  };

  const handleRecorderClose = () => {
    if (isRecording || recordingPreviewBlob) {
      setDiscardRecorderDialogOpen(true);
      return;
    }
    closeRecorderWithoutSaving();
  };

  const handleToggleStyleChip = (chipLabel: string) => {
    if (!note) return;
    const chips = (note.style || "").split(",").map((s) => s.trim()).filter(Boolean);
    const newChips = chips.includes(chipLabel) ? chips.filter((c) => c !== chipLabel) : [...chips, chipLabel];
    updateField("style", newChips.join(", "));
  };

  const getSelectedStyleChips = (): string[] => note?.style ? note.style.split(",").map((s) => s.trim()).filter(Boolean) : [];

  // ISO 8601 format: YYYY-MM-DD HH:mm (UTC±X)
  const formatDateISO = (ts: number) => {
    const d = new Date(ts);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const mins = String(d.getMinutes()).padStart(2, "0");
    
    // Get timezone offset in hours
    const offsetMinutes = d.getTimezoneOffset();
    const offsetHours = Math.abs(Math.floor(offsetMinutes / 60));
    const offsetMins = Math.abs(offsetMinutes % 60);
    const sign = offsetMinutes <= 0 ? "+" : "-";
    const tzString = offsetMins > 0 
      ? `(UTC${sign}${offsetHours}:${String(offsetMins).padStart(2, "0")})`
      : `(UTC${sign}${offsetHours})`;
    
    return `${year}-${month}-${day} ${hours}:${mins} ${tzString}`;
  };

  // Handle Print action
  const handlePrintAction = () => {
    setPrintMode("print");
    setPrintDialogOpen(true);
  };

  // Handle PDF action
  const handlePdfAction = () => {
    if (!note) return;
    setPrintMode("pdf");
    setPrintDialogOpen(true);
  };

  const handlePrint = (textOnly: boolean) => {
    if (!note) return;
    const isPdf = printMode === "pdf";
    const timestampLabel = isPdf ? t("print.saved") : t("print.printed");
    
    // Common styles: All text BLACK, only labels BOLD
    const labelStyle = "font-size:0.75rem;font-weight:bold;color:#000;margin:0;";
    const valueStyle = "font-weight:normal;color:#000;";
    const footerLabelStyle = "font-weight:bold;color:#000;";
    const footerValueStyle = "font-weight:normal;color:#000;";
    
    // Helper function to print using hidden iframe (no about:blank tab)
    const printWithIframe = (htmlContent: string) => {
      // Remove any existing print iframe
      const existingIframe = document.getElementById("print-iframe");
      if (existingIframe) existingIframe.remove();
      
      // Create hidden iframe
      const iframe = document.createElement("iframe");
      iframe.id = "print-iframe";
      iframe.style.position = "absolute";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "none";
      iframe.style.left = "-9999px";
      document.body.appendChild(iframe);
      
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(htmlContent);
        iframeDoc.close();
        
        // Wait for content to render, then print
        iframe.onload = () => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        };
        
        // Trigger onload manually for browsers that don't fire it
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        }, 100);
      }
    };
    
    if (textOnly) {
      // Text-only mode with clear labeled sections and dividers
      const lines: string[] = [];
      
      if (note.title) {
        lines.push(`<p style="${labelStyle}">${t("print.labelTitle")}</p>`);
        lines.push(`<p style="font-size:1.125rem;${valueStyle}margin:0 0 0.5rem 0;">${escapeHtml(note.title)}</p>`);
      }
      if (note.composer) {
        lines.push(`<p style="${labelStyle}">${t("print.labelComposer")}</p>`);
        lines.push(`<p style="${valueStyle}margin:0 0 0.5rem 0;">${escapeHtml(note.composer)}</p>`);
      }
      
      if (note.title || note.composer) lines.push(`<hr style="border:none;border-top:1px solid #ccc;margin:1rem 0;" />`);
      
      if (note.lyrics) {
        lines.push(`<p style="${labelStyle}margin-bottom:0.25rem;">${t("print.labelLyrics")}</p>`);
        lines.push(`<pre style="font-family:monospace;white-space:pre-wrap;${valueStyle}margin:0 0 0.5rem 0;line-height:1.6;">${escapeHtml(note.lyrics)}</pre>`);
      }
      
      // Divider between Lyrics and Style/Extra/Tags
      if (note.lyrics && (note.style || note.extraInfo || note.tags.length > 0)) {
        lines.push(`<hr style="border:none;border-top:1px solid #ccc;margin:1rem 0;" />`);
      }
      
      if (note.style) {
        lines.push(`<p style="margin:0;"><span style="${labelStyle}">${t("print.labelStyle")}:</span> <span style="${valueStyle}">${escapeHtml(note.style)}</span></p>`);
      }
      
      if (note.extraInfo) {
        lines.push(`<p style="margin:0.5rem 0 0 0;"><span style="${labelStyle}">${t("print.labelExtra")}:</span> <span style="${valueStyle}">${escapeHtml(note.extraInfo)}</span></p>`);
      }
      
      if (note.tags.length > 0) {
        lines.push(`<p style="margin:0.5rem 0 0 0;"><span style="${labelStyle}">${t("print.labelTags")}:</span> <span style="${valueStyle}">${note.tags.map(tag => escapeHtml(tag)).join(", ")}</span></p>`);
      }
      
      lines.push(`<hr style="border:none;border-top:1px solid #ccc;margin:1.5rem 0 1rem 0;" />`);
      lines.push(`<div style="font-size:0.75rem;line-height:1.6;">`);
      lines.push(`<p style="margin:0;"><span style="${footerLabelStyle}">${t("print.created")}:</span> <span style="${footerValueStyle}">${formatDateISO(note.createdAt)}</span></p>`);
      lines.push(`<p style="margin:0;"><span style="${footerLabelStyle}">${t("print.updated")}:</span> <span style="${footerValueStyle}">${formatDateISO(note.updatedAt)}</span></p>`);
      lines.push(`<p style="margin:0;"><span style="${footerLabelStyle}">${timestampLabel}:</span> <span style="${footerValueStyle}">${formatDateISO(Date.now())}</span></p>`);
      lines.push(`</div>`);
      
      // Page footer metadata (appears on every page)
      const pageFooter = `${t("print.exportedFrom")}: ${t("app.name")} (${t("print.appType")}) · ${t("print.version")} ${APP_VERSION} · ${formatDateISO(Date.now())}`;
      
      const htmlContent = `<html><head><title>${escapeHtml(note.title || "Note")}</title><style>@media print { @page { margin-bottom: 2cm; } .page-footer { position: fixed; bottom: 0; left: 0; right: 0; text-align: center; font-size: 0.65rem; color: #000; padding: 0.5rem; background: #fff; } }</style></head><body style="font-family:system-ui;padding:2rem;padding-bottom:3rem;max-width:800px;margin:0 auto;color:#000;"><div class="page-footer">${pageFooter}</div>${lines.join("")}</body></html>`;
      printWithIframe(htmlContent);
    } else {
      // App layout mode - render read-only editor style
      const noteColorMap: Record<NoteColor, string> = {
        default: "#fafaf9", cream: "#fef9e7", pink: "#fdf2f4", blue: "#eff6ff",
        green: "#f0fdf4", yellow: "#fefce8", purple: "#faf5ff", orange: "#fff7ed",
      };
      
      const lines: string[] = [];
      lines.push(`<div style="background:${noteColorMap[note.color]};border-radius:1rem;padding:1.5rem;max-width:600px;margin:0 auto;color:#000;">`);
      
      if (note.title) {
        lines.push(`<p style="${labelStyle}">${t("print.labelTitle")}</p>`);
        lines.push(`<p style="font-size:1.125rem;${valueStyle}margin:0 0 0.5rem 0;">${escapeHtml(note.title)}</p>`);
      }
      if (note.composer) {
        lines.push(`<p style="${labelStyle}">${t("print.labelComposer")}</p>`);
        lines.push(`<p style="${valueStyle}margin:0 0 1rem 0;">${escapeHtml(note.composer)}</p>`);
      }
      
      if (note.lyrics) {
        lines.push(`<div style="background:rgba(255,255,255,0.5);border-radius:0.5rem;padding:0.75rem;margin-bottom:0.5rem;">`);
        lines.push(`<p style="${labelStyle}margin-bottom:0.25rem;">${t("print.labelLyrics")}</p>`);
        lines.push(`<pre style="font-family:inherit;white-space:pre-wrap;${valueStyle}margin:0;font-size:0.875rem;">${escapeHtml(note.lyrics)}</pre>`);
        lines.push(`</div>`);
      }
      
      // Divider between Lyrics and Style/Extra/Tags
      if (note.lyrics && (note.style || note.extraInfo || note.tags.length > 0)) {
        lines.push(`<hr style="border:none;border-top:1px solid #ccc;margin:1rem 0;" />`);
      }
      
      if (note.style) {
        lines.push(`<div style="background:rgba(255,255,255,0.5);border-radius:0.5rem;padding:0.75rem;margin-bottom:1rem;">`);
        lines.push(`<p style="${labelStyle}margin-bottom:0.25rem;">${t("print.labelStyle")}</p>`);
        lines.push(`<p style="${valueStyle}margin:0;font-size:0.875rem;">${escapeHtml(note.style)}</p>`);
        lines.push(`</div>`);
      }
      
      if (note.extraInfo) {
        lines.push(`<div style="background:rgba(255,255,255,0.3);border-radius:0.5rem;padding:0.5rem;margin-bottom:1rem;">`);
        lines.push(`<p style="${labelStyle}margin-bottom:0.25rem;">${t("print.labelExtra")}</p>`);
        lines.push(`<p style="${valueStyle}margin:0;font-size:0.75rem;">${escapeHtml(note.extraInfo)}</p>`);
        lines.push(`</div>`);
      }
      
      if (note.tags.length > 0) {
        lines.push(`<div style="margin-bottom:1rem;">`);
        lines.push(`<p style="${labelStyle}margin-bottom:0.25rem;">${t("print.labelTags")}</p>`);
        lines.push(`<div style="display:flex;flex-wrap:wrap;gap:0.25rem;">`);
        note.tags.forEach(tag => {
          lines.push(`<span style="background:#e0e0e0;padding:0.25rem 0.5rem;border-radius:9999px;font-size:0.75rem;${valueStyle}">${escapeHtml(tag)}</span>`);
        });
        lines.push(`</div></div>`);
      }
      
      lines.push(`<div style="border-top:1px solid #ccc;padding-top:0.75rem;font-size:0.75rem;line-height:1.6;">`);
      lines.push(`<p style="margin:0;"><span style="${footerLabelStyle}">${t("print.created")}:</span> <span style="${footerValueStyle}">${formatDateISO(note.createdAt)}</span></p>`);
      lines.push(`<p style="margin:0;"><span style="${footerLabelStyle}">${t("print.updated")}:</span> <span style="${footerValueStyle}">${formatDateISO(note.updatedAt)}</span></p>`);
      lines.push(`<p style="margin:0;"><span style="${footerLabelStyle}">${timestampLabel}:</span> <span style="${footerValueStyle}">${formatDateISO(Date.now())}</span></p>`);
      lines.push(`</div>`);
      lines.push(`</div>`);
      
      // Page footer metadata (appears on every page)
      const pageFooter = `${t("print.exportedFrom")}: ${t("app.name")} (${t("print.appType")}) · ${t("print.version")} ${APP_VERSION} · ${formatDateISO(Date.now())}`;
      
      const htmlContent = `<html><head><title>${escapeHtml(note.title || "Note")}</title><style>@media print { @page { margin-bottom: 2cm; } .page-footer { position: fixed; bottom: 0; left: 0; right: 0; text-align: center; font-size: 0.65rem; color: #000; padding: 0.5rem; background: #fff; } }</style></head><body style="font-family:system-ui;padding:2rem;padding-bottom:3rem;background:#f5f5f5;color:#000;"><div class="page-footer">${pageFooter}</div>${lines.join("")}</body></html>`;
      printWithIframe(htmlContent);
    }
  };

  // Handle JSON export
  const handleExportJson = () => {
    if (!note) return;
    downloadNoteJson(note);
    toast.success(t("toast.jsonExported"));
  };

  const handleDownloadAudio = () => {
    if (!note?.takes?.length) return;
    const take = note.takes.find((item) => item.id === note.activeTakeId) || note.takes[0];
    if (!take?.blob) {
      toast.error(t("toast.audioNotAvailable"));
      return;
    }

    try {
      const link = document.createElement("a");
      const title = note.title.trim().replace(/[\\/:*?"<>|]+/g, "").replace(/\s+/g, "-") || "audio-note";
      const takeIndex = Math.max(1, note.takes.findIndex((item) => item.id === take.id) + 1);
      link.href = take.blob;
      link.download = `${title}_take-${takeIndex}.webm`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      toast.error(t("toast.audioNotAvailable"));
    }
  };

  const handleCopyAll = () => {
    if (!note) return;
    const content = [note.title && `Title: ${note.title}`, note.composer && `Composer: ${note.composer}`, note.lyrics && `\nLyrics:\n${note.lyrics}`, note.style && `\nStyle: ${note.style}`, note.extraInfo && `\nExtra Info: ${note.extraInfo}`, note.tags.length > 0 && `\nTags: ${note.tags.join(", ")}`].filter(Boolean).join("\n");
    navigator.clipboard.writeText(content);
    toast.success(t("toast.allCopied"));
  };
  const handleDuplicate = () => { if (note) { const dup = duplicateNote(note.id); if (dup) { toast.success(t("toast.noteDuplicated")); navigate(`/edit/${dup.id}`); } } };
  const confirmDelete = () => { if (note) { deleteNote(note.id); toast.success(t("toast.noteDeleted")); navigate("/app"); } };
  const handleTogglePin = () => { if (!note) return; updateField("isPinned", !note.isPinned); toast.success(note.isPinned ? t("toast.noteUnpinned") : t("toast.notePinned")); };

  const styleCharCount = note?.style?.length || 0;
  const styleCharLimit = STYLE_CHAR_LIMIT_FREE;

  if (!note) return null;

  return (
    <div className={`min-h-screen ${colorClasses[note.color]}`}>
      {recorderOpen && (
        <div className="fixed inset-0 z-50 bg-background text-foreground no-print">
          <div className="min-h-screen px-4 py-4 flex flex-col">
            <header className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={handleRecorderClose} aria-label="Close recorder">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-base font-semibold">{t("audio.voiceNote")}</h2>
              <div className="h-10 w-10" />
            </header>

            <div className="flex-1 flex flex-col items-center justify-center gap-8 max-w-sm mx-auto w-full">
              <div className="text-center space-y-2">
                <p className="text-6xl font-semibold tabular-nums tracking-normal">{formatRecordingTime(recordingSeconds)}</p>
                <p className="text-sm text-muted-foreground">
                  {recorderState === "recording" ? t("audio.recordingActive") : recorderState === "finished" ? t("audio.recordingFinished") : t("audio.readyToRecord")}
                </p>
              </div>

              <div className="h-24 w-full flex items-center justify-center gap-1.5 rounded-md bg-muted/50 px-4">
                {Array.from({ length: 24 }).map((_, index) => {
                  const idle = 0.16 + ((index % 5) * 0.05);
                  const active = Math.min(1, idle + audioLevel * (0.55 + ((index % 4) * 0.12)));
                  const height = recorderState === "recording" ? active : idle;
                  return <span key={index} className="w-1.5 rounded-full bg-primary transition-all duration-100" style={{ height: `${Math.max(10, height * 88)}%` }} />;
                })}
              </div>

              {microphoneMessage && <p className="text-sm text-muted-foreground text-center">{microphoneMessage}</p>}

              {recorderState === "finished" && recordingPreviewBlob && (
                <audio controls src={recordingPreviewBlob} className="w-full" />
              )}

              {recorderState === "finished" ? (
                <div className="grid gap-3 w-full">
                  <Button onClick={handleSaveRecording} className="h-12">{t("audio.save")}</Button>
                  <Button onClick={handleRecordAgain} variant="outline" className="h-12">{t("audio.recordAgain")}</Button>
                  <Button onClick={handleRecorderClose} variant="ghost" className="h-12">{t("audio.discard")}</Button>
                </div>
              ) : (
                <Button onClick={recorderState === "recording" ? handleStopRecording : handleStartRecording} className="h-14 w-full max-w-xs">
                  {recorderState === "recording" ? t("audio.stop") : t("audio.startRecording")}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
      <header className="sticky top-0 z-10 bg-inherit border-b border-border/50 no-print">
        <div className="container max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="sr-only">Edit Song</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate("/app")} aria-label="Back to notes"><ArrowLeft className="h-5 w-5" /></Button>
            {/* Auto-save indicator */}
            {autoSaveStatus !== "idle" && (
              <span className="text-xs text-muted-foreground">
                {autoSaveStatus === "saving" ? t("editor.autoSaving") : t("editor.autoSaved")}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={handleTogglePin} aria-label={note.isPinned ? "Unpin note" : "Pin note"} className={note.isPinned ? "text-primary" : ""}>
              <Pin className={`h-5 w-5 ${note.isPinned ? "fill-current" : ""}`} />
            </Button>
            <ColorPicker value={note.color} onChange={(color) => updateField("color", color)}>
              <Button variant="ghost" size="icon" aria-label="Change note color"><Palette className="h-5 w-5" /></Button>
            </ColorPicker>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="More actions"><MoreVertical className="h-5 w-5" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handlePrintAction}>
                  <Printer className="h-4 w-4 mr-2" />{t("menu.print")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handlePdfAction}>
                  <FileDown className="h-4 w-4 mr-2" />{t("menu.exportPdf")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportJson}>
                  <FileJson className="h-4 w-4 mr-2" />{t("menu.exportJson")}
                </DropdownMenuItem>
                {!!note.takes?.length && (
                  <DropdownMenuItem onClick={handleDownloadAudio}>
                    <Download className="h-4 w-4 mr-2" />{t("menu.downloadAudio")}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleCopyAll}><ClipboardCopy className="h-4 w-4 mr-2" />{t("menu.copyAll")}</DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyLyrics}><Copy className="h-4 w-4 mr-2" />{t("editor.copyLyrics")}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setClearDialogOpen(true)}><Trash2 className="h-4 w-4 mr-2" />{t("editor.clearLyrics")}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDuplicate}><Copy className="h-4 w-4 mr-2" />{t("menu.duplicate")}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)} className="text-destructive focus:text-destructive"><Trash2 className="h-4 w-4 mr-2" />{t("menu.delete")}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto px-4 py-4 space-y-3 pb-24">
        {/* Title - compact, notebook style */}
        <Input 
          placeholder={t("editor.title")} 
          value={note.title} 
          onChange={(e) => updateField("title", e.target.value)} 
          className="text-lg font-semibold h-9 px-2 input-desktop border-transparent bg-transparent"
        />
        {/* Composer - compact */}
        <Input 
          placeholder={t("editor.composer")} 
          value={note.composer} 
          onChange={(e) => updateField("composer", e.target.value)} 
          className="text-sm h-8 px-2 text-muted-foreground input-desktop border-transparent bg-transparent"
        />

        {note.hasAudio === true && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-destructive" aria-hidden="true" />
                {t("audio.voiceNote")}
              </label>
            </div>
            <div className="space-y-2">
              {activeTake && (
                <div className="space-y-2 bg-inherit py-2">
                  <audio
                    ref={audioRef}
                    src={activeTake.blob}
                    onTimeUpdate={(e) => setAudioCurrentTime(e.currentTarget.currentTime)}
                    onLoadedMetadata={(e) => setAudioDuration(e.currentTarget.duration || activeTake.duration)}
                    onPlay={() => setIsAudioPlaying(true)}
                    onPause={() => setIsAudioPlaying(false)}
                    onEnded={() => setIsAudioPlaying(false)}
                  />
                  <div className="flex items-center gap-2 no-print">
                    <Button variant="outline" size="sm" onClick={handleTogglePlayback} className="h-8 px-2 text-xs">{isAudioPlaying ? t("audio.pause") : t("audio.play")}</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleSkipAudio(-10)} className="h-8 px-2 text-xs">-10s</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleSkipAudio(10)} className="h-8 px-2 text-xs">+10s</Button>
                    <span className="text-xs text-muted-foreground">{formatRecordingTime(Math.floor(audioCurrentTime))} / {formatRecordingTime(Math.floor(audioDuration || activeTake.duration))}</span>
                  </div>
                  <input type="range" min="0" max={audioDuration || activeTake.duration || 0} value={audioCurrentTime} onChange={(e) => { if (audioRef.current) audioRef.current.currentTime = Number(e.target.value); }} className="w-full no-print" />
                </div>
              )}
              <Button variant="outline" size="sm" onClick={() => { resetRecorder(); setRecorderOpen(true); }} className="h-8 text-xs no-print">
                {t("audio.startRecording")}
              </Button>
              <p className="text-xs text-muted-foreground">{note.takes?.length ? `${note.takes.length} ${note.takes.length === 1 ? t("audio.recordingCount") : t("audio.recordingCountPlural")}${activeTake ? ` • ${formatRecordingTime(Math.floor(activeTake.duration))}` : ""}` : t("audio.noRecordingsYet")}</p>
              {microphoneMessage && <p className="text-xs text-muted-foreground">{microphoneMessage}</p>}
              {!!note.takes?.length && (
                <div className="space-y-1">
                  {note.takes.map((take, index) => (
                    <div key={take.id} className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                      <button type="button" onClick={() => handleSelectTake(take.id)} className="flex-1 text-left hover:text-foreground">
                        {t("audio.take")} {index + 1} {take.id === activeTake?.id ? "▶️" : ""}
                      </button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteTakeId(take.id)} className="h-7 px-2 text-xs no-print">{t("audio.deleteRecording")}</Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Lyrics Section */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-muted-foreground">{t("editor.lyrics")}</label>
              <Button variant="ghost" size="sm" onClick={() => setInsertSheetOpen(true)} className="h-6 px-1.5 text-xs no-print"><Plus className="h-3 w-3 mr-0.5" />{t("editor.insertSheet")}</Button>
              </div>
            </div>
            <div className="flex items-center gap-0.5 no-print">
              <Button variant="ghost" size="sm" onClick={handleUndoLyrics} disabled={!canUndoLyrics} className="h-6 px-1.5 text-xs" title={t("editor.undo")}><Undo2 className="h-3 w-3" /></Button>
              <Button variant="ghost" size="sm" onClick={handleCopyLyrics} className="h-6 px-1.5 text-xs" title={t("editor.copy")}><Copy className="h-3 w-3" /></Button>
              <Button variant="ghost" size="icon" onClick={() => setLyricsExpanded(!lyricsExpanded)} aria-label={lyricsExpanded ? "Collapse lyrics" : "Expand lyrics"} className="h-6 w-6">{lyricsExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}</Button>
            </div>
          </div>
          <LyricsEditor 
            textareaRef={lyricsRef}
            placeholder={t("editor.lyrics")} 
            value={note.lyrics} 
            onChange={(value) => updateField("lyrics", value)} 
            expanded={lyricsExpanded}
            className="textarea-desktop"
          />
        </div>

        {/* Style Section */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-muted-foreground">{t("editor.style")}</label>
              <Button variant="ghost" size="sm" onClick={() => setStylePickerOpen(true)} className="h-6 px-1.5 text-xs no-print"><Plus className="h-3 w-3 mr-0.5" />{t("stylePicker.title")}</Button>
              <Button variant="ghost" size="sm" onClick={() => setAllPromptOpen(true)} className="h-6 px-1.5 text-xs no-print"><Plus className="h-3 w-3 mr-0.5" />Presets</Button>
            </div>
            <div className="flex items-center gap-0.5 no-print">
              <span className="text-xs text-muted-foreground mr-1">{styleCharCount}/{styleCharLimit}</span>
              <Button variant="ghost" size="sm" onClick={handleUndoStyle} disabled={!canUndoStyle} className="h-6 px-1.5 text-xs" title={t("editor.undo")}><Undo2 className="h-3 w-3" /></Button>
              <Button variant="ghost" size="sm" onClick={handleCopyStyle} className="h-6 px-1.5 text-xs" title={t("editor.copy")}><Copy className="h-3 w-3" /></Button>
              <Button variant="ghost" size="icon" onClick={() => setStyleExpanded(!styleExpanded)} aria-label={styleExpanded ? "Collapse style" : "Expand style"} className="h-6 w-6">{styleExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}</Button>
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

        {/* Extra Info - compact */}
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

        {/* Timestamp Display */}
        <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t border-border/50">
          <p>{t("timestamp.lastEdited")}: {formatDateISO(note.updatedAt)}</p>
          <p>{t("timestamp.created")}: {formatDateISO(note.createdAt)}</p>
        </div>
      </main>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 no-print">
        <Button onClick={handleSave} disabled={isSaving} className="px-8">{isSaving ? t("editor.saving") : t("editor.save")}</Button>
      </div>

      <InsertSheet open={insertSheetOpen} onOpenChange={setInsertSheetOpen} onInsert={handleInsert} />
      <MusicToolsSheet open={musicToolsOpen} onOpenChange={setMusicToolsOpen} takes={note?.takes ?? []} onInsert={handleInsert} />
      <StylePicker open={stylePickerOpen} onOpenChange={setStylePickerOpen} selectedChips={getSelectedStyleChips()} onToggleChip={handleToggleStyleChip} />
      <PrintDialog open={printDialogOpen} onOpenChange={setPrintDialogOpen} note={note} onPrint={handlePrint} mode={printMode} />
      <ConfirmDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} title={t("dialog.deleteTitle")} description={t("dialog.deleteMessage")} confirmLabel={t("dialog.confirm")} onConfirm={confirmDelete} variant="destructive" />
      <ConfirmDialog open={!!deleteTakeId} onOpenChange={(open) => !open && setDeleteTakeId(null)} title={t("audio.deleteRecording")} description={t("audio.confirmDelete")} confirmLabel={t("dialog.confirm")} onConfirm={confirmDeleteTake} variant="destructive" />
      <ConfirmDialog open={discardRecorderDialogOpen} onOpenChange={setDiscardRecorderDialogOpen} title={t("audio.discard")} description={t("audio.confirmDiscard")} confirmLabel={t("dialog.confirm")} onConfirm={closeRecorderWithoutSaving} variant="destructive" />
      <ConfirmDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen} title={t("dialog.clearTitle")} description={t("dialog.clearMessage")} confirmLabel={t("dialog.clearConfirm")} onConfirm={confirmClearLyrics} variant="destructive" />
      <ConfirmDialog open={clearStyleDialogOpen} onOpenChange={setClearStyleDialogOpen} title={t("dialog.clearStyleTitle")} description={t("dialog.clearStyleMessage")} confirmLabel={t("dialog.clearConfirm")} onConfirm={confirmClearStyle} variant="destructive" />
      <AllPromptSheet open={allPromptOpen} onClose={() => setAllPromptOpen(false)} onInsert={(p) => updateField("style", p)} />
      <LocalFirstNotice open={showFirstSaveNotice} onOpenChange={setShowFirstSaveNotice} />
    </div>
  );
}
