import type { ScoreEvent } from "../types/score.types";
import type { ScoreData } from "../types/score.types";
import { eventUnits, measureCapacity, midiFor, midiToFreq } from "../utils/notation";

// MIDI-style piano synthesized with the Web Audio API (no samples, no third-party audio).
// One shared instance guarantees only a single playback runs at a time.

interface Handlers {
  onPosition: (eventId: string | null) => void;
  onEnd: () => void;
}

type AudioCtor = typeof AudioContext;

class ScorePlayer {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private sources: OscillatorNode[] = [];
  private timeline: { id: string; start: number; end: number }[] = [];
  private startAt = 0;
  private endAt = 0;
  private raf = 0;
  private handlers: Handlers | null = null;

  /** Returns false when there is nothing to play or audio is unavailable. */
  play(score: ScoreData, handlers: Handlers): boolean {
    this.stop();
    const Ctx: AudioCtor | undefined =
      window.AudioContext || (window as unknown as { webkitAudioContext?: AudioCtor }).webkitAudioContext;
    if (!Ctx) return false;
    if (!this.ctx) this.ctx = new Ctx();
    void this.ctx.resume();
    const ctx = this.ctx;

    const secPerUnit = 60 / score.tempo / 4; // quarter note = one BPM beat
    const cap = measureCapacity(score.timeSignature);
    const startAt = ctx.currentTime + 0.08;
    const master = ctx.createGain();
    master.gain.value = score.volume;
    master.connect(ctx.destination);
    this.master = master;

    const timeline: { id: string; start: number; end: number }[] = [];
    const items: { ev: ScoreEvent; start: number; d: number }[] = [];
    let t = 0;
    score.measures.forEach((m, mi) => {
      const measureStart = t;
      m.events.forEach((ev) => {
        const d = eventUnits(ev) * secPerUnit;
        items.push({ ev, start: t, d });
        timeline.push({ id: ev.id, start: t, end: t + d });
        t += d;
      });
      if (mi < score.measures.length - 1) t = Math.max(t, measureStart + cap * secPerUnit);
    });
    // Tied notes sound once for their combined length (no retrigger).
    const tiedInto = (a: ScoreEvent, b?: ScoreEvent) => !!b && a.kind === "note" && !!a.tie && b.kind === "note"
      && midiFor(a, score.keySignature) === midiFor(b, score.keySignature);
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (it.ev.kind !== "note" || (i > 0 && tiedInto(items[i - 1].ev, it.ev))) continue;
      let end = it.start + it.d;
      for (let j = i; j + 1 < items.length && tiedInto(items[j].ev, items[j + 1].ev); j++) end = items[j + 1].start + items[j + 1].d;
      this.voice(midiToFreq(midiFor(it.ev, score.keySignature)), startAt + it.start, end - it.start);
    }
    if (!timeline.length) { this.stop(); return false; }

    this.timeline = timeline;
    this.startAt = startAt;
    this.endAt = t;
    this.handlers = handlers;
    this.raf = requestAnimationFrame(this.tick);
    return true;
  }

  private tick = () => {
    if (!this.ctx || !this.handlers) return;
    const now = this.ctx.currentTime - this.startAt;
    if (now >= this.endAt + 0.1) {
      const h = this.handlers;
      this.stop();
      h.onPosition(null);
      h.onEnd();
      return;
    }
    const cur = this.timeline.find((e) => now >= e.start && now < e.end);
    this.handlers.onPosition(cur ? cur.id : null);
    this.raf = requestAnimationFrame(this.tick);
  };

  private voice(freq: number, when: number, dur: number) {
    const ctx = this.ctx!;
    const out = ctx.createGain();
    out.connect(this.master!);
    const peak = 0.28;
    const release = when + Math.max(dur, 0.05);
    out.gain.setValueAtTime(0.0001, when);
    out.gain.exponentialRampToValueAtTime(peak, when + 0.008);
    out.gain.setTargetAtTime(peak * 0.35, when + 0.008, 0.25);
    out.gain.setTargetAtTime(0.0001, release, 0.08);
    const partials: [number, OscillatorType, number][] = [
      [1, "triangle", 1], [2, "sine", 0.35], [3, "sine", 0.12], [4, "sine", 0.05],
    ];
    for (const [mul, type, amp] of partials) {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = freq * mul;
      const g = ctx.createGain();
      g.gain.value = amp;
      o.connect(g);
      g.connect(out);
      o.start(when);
      o.stop(release + 0.5);
      this.sources.push(o);
    }
  }

  setVolume(volume: number) {
    if (this.master) this.master.gain.value = Math.min(1, Math.max(0, volume));
  }

  /** Short isolated preview for the currently selected note. */
  previewNote(score: ScoreData, eventId: string): boolean {
    const event = score.measures.flatMap((measure) => measure.events).find((item) => item.id === eventId && item.kind === "note");
    if (!event) return false;
    this.stop();
    const Ctx: AudioCtor | undefined = window.AudioContext || (window as unknown as { webkitAudioContext?: AudioCtor }).webkitAudioContext;
    if (!Ctx) return false;
    if (!this.ctx) this.ctx = new Ctx();
    void this.ctx.resume();
    const ctx = this.ctx;
    const master = ctx.createGain();
    master.gain.value = score.volume;
    master.connect(ctx.destination);
    this.master = master;
    const start = ctx.currentTime + 0.02;
    this.voice(midiToFreq(midiFor(event, score.keySignature)), start, 0.45);
    window.setTimeout(() => this.stop(), 900);
    return true;
  }

  stop() {
    cancelAnimationFrame(this.raf);
    this.sources.forEach((s) => {
      try { s.stop(); } catch { /* already stopped */ }
      s.disconnect();
    });
    this.sources = [];
    this.master?.disconnect();
    this.master = null;
    this.handlers = null;
    this.timeline = [];
  }
}

export const scorePlayer = new ScorePlayer();
