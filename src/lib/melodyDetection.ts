// Lightweight local melody detection using Web Audio API + autocorrelation.
// No AI, no network, no large dependencies.

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export interface MelodyResult {
  notes: string[]; // e.g. ["C4","D4","E4"]
  key: string | null; // e.g. "C major" or null when unknown
}

function freqToMidi(freq: number): number {
  return 69 + 12 * Math.log2(freq / 440);
}

function midiToNoteName(midi: number): string {
  const rounded = Math.round(midi);
  const name = NOTE_NAMES[((rounded % 12) + 12) % 12];
  const octave = Math.floor(rounded / 12) - 1;
  return `${name}${octave}`;
}

// Autocorrelation pitch detection on a single window.
// Returns frequency in Hz, or -1 if no clear pitch.
function autoCorrelate(buf: Float32Array, sampleRate: number): number {
  const SIZE = buf.length;
  let rms = 0;
  for (let i = 0; i < SIZE; i++) rms += buf[i] * buf[i];
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return -1; // too quiet

  // Trim silence on both ends
  let r1 = 0;
  let r2 = SIZE - 1;
  const threshold = 0.2;
  for (let i = 0; i < SIZE / 2; i++) {
    if (Math.abs(buf[i]) < threshold) {
      r1 = i;
      break;
    }
  }
  for (let i = 1; i < SIZE / 2; i++) {
    if (Math.abs(buf[SIZE - i]) < threshold) {
      r2 = SIZE - i;
      break;
    }
  }
  const trimmed = buf.subarray(r1, r2);
  const N = trimmed.length;
  if (N < 64) return -1;

  const c = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    let sum = 0;
    for (let j = 0; j < N - i; j++) sum += trimmed[j] * trimmed[j + i];
    c[i] = sum;
  }

  // Find first dip after which we look for a peak
  let d = 0;
  while (d < N - 1 && c[d] > c[d + 1]) d++;
  let maxVal = -1;
  let maxPos = -1;
  for (let i = d; i < N; i++) {
    if (c[i] > maxVal) {
      maxVal = c[i];
      maxPos = i;
    }
  }
  if (maxPos <= 0) return -1;

  let T0 = maxPos;
  // Parabolic interpolation for better accuracy
  const x1 = c[T0 - 1] || 0;
  const x2 = c[T0];
  const x3 = c[T0 + 1] || 0;
  const a = (x1 + x3 - 2 * x2) / 2;
  const b = (x3 - x1) / 2;
  if (a !== 0) T0 = T0 - b / (2 * a);

  const freq = sampleRate / T0;
  if (freq < 60 || freq > 1200) return -1; // human voice / typical melody range
  return freq;
}

// Decode a data URL or object URL into an AudioBuffer.
export async function decodeAudio(src: string): Promise<AudioBuffer> {
  const res = await fetch(src);
  const arr = await res.arrayBuffer();
  const Ctx: typeof AudioContext =
    (window.AudioContext as typeof AudioContext) ||
    ((window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
  const ctx = new Ctx();
  try {
    return await ctx.decodeAudioData(arr.slice(0));
  } finally {
    // Close to free up resources (best-effort)
    try {
      await ctx.close();
    } catch {
      /* ignore */
    }
  }
}

// Krumhansl-Schmuckler-style key profile (simplified).
const MAJOR_PROFILE = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const MINOR_PROFILE = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

function estimateKey(midiNotes: number[]): string | null {
  if (midiNotes.length < 4) return null;
  const histogram = new Array(12).fill(0);
  for (const m of midiNotes) histogram[((m % 12) + 12) % 12]++;
  let bestKey = "";
  let bestScore = -Infinity;
  for (let i = 0; i < 12; i++) {
    let majorScore = 0;
    let minorScore = 0;
    for (let j = 0; j < 12; j++) {
      majorScore += histogram[(i + j) % 12] * MAJOR_PROFILE[j];
      minorScore += histogram[(i + j) % 12] * MINOR_PROFILE[j];
    }
    if (majorScore > bestScore) {
      bestScore = majorScore;
      bestKey = `${NOTE_NAMES[i]} major`;
    }
    if (minorScore > bestScore) {
      bestScore = minorScore;
      bestKey = `${NOTE_NAMES[i]} minor`;
    }
  }
  // Confidence check: must beat a baseline
  const total = histogram.reduce((a, b) => a + b, 0);
  if (total === 0 || bestScore / total < 3) return null;
  return bestKey;
}

export async function detectMelody(src: string): Promise<MelodyResult> {
  const buffer = await decodeAudio(src);
  const data = buffer.getChannelData(0);
  const sr = buffer.sampleRate;

  // Window: ~46 ms, hop: ~23 ms
  const windowSize = Math.min(2048, Math.floor(sr * 0.046));
  const hop = Math.floor(windowSize / 2);

  const midiSeq: number[] = [];
  const window = new Float32Array(windowSize);

  for (let pos = 0; pos + windowSize < data.length; pos += hop) {
    window.set(data.subarray(pos, pos + windowSize));
    const freq = autoCorrelate(window, sr);
    if (freq > 0) {
      midiSeq.push(Math.round(freqToMidi(freq)));
    } else {
      midiSeq.push(-1); // silence/unclear
    }
  }

  // Median smoothing (window of 5) to remove single-frame jitter
  const smoothed: number[] = [];
  const k = 2;
  for (let i = 0; i < midiSeq.length; i++) {
    const slice = midiSeq.slice(Math.max(0, i - k), Math.min(midiSeq.length, i + k + 1)).filter((v) => v > 0);
    if (slice.length === 0) {
      smoothed.push(-1);
      continue;
    }
    slice.sort((a, b) => a - b);
    smoothed.push(slice[Math.floor(slice.length / 2)]);
  }

  // Require a note to be stable for at least N consecutive frames before counting
  const MIN_STABLE_FRAMES = 4; // ~92 ms
  const stableNotes: number[] = [];
  let i = 0;
  while (i < smoothed.length) {
    const v = smoothed[i];
    if (v <= 0) {
      i++;
      continue;
    }
    let j = i;
    while (j < smoothed.length && Math.abs(smoothed[j] - v) <= 1) j++;
    if (j - i >= MIN_STABLE_FRAMES) {
      stableNotes.push(v);
    }
    i = j;
  }

  // Compress consecutive duplicates
  const compressed: number[] = [];
  for (const n of stableNotes) {
    if (compressed.length === 0 || compressed[compressed.length - 1] !== n) {
      compressed.push(n);
    }
  }

  // Limit length for readability
  const MAX_NOTES = 32;
  const finalMidi = compressed.slice(0, MAX_NOTES);

  const notes = finalMidi.map(midiToNoteName);
  const key = estimateKey(compressed);

  return { notes, key };
}
