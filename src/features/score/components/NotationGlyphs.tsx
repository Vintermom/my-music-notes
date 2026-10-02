import type { ScoreDuration } from "../types/score.types";

// Shared SVG shapes (line spacing = 10 units). Used by the staff and toolbar buttons.

export function NoteShape({ x, y, duration, stemUp }: { x: number; y: number; duration: ScoreDuration; stemUp: boolean }) {
  if (duration === "w") {
    return <ellipse cx={x} cy={y} rx={7} ry={4.6} fill="none" stroke="currentColor" strokeWidth={2} />;
  }
  const filled = duration !== "h";
  const sx = stemUp ? x + 5.4 : x - 5.4;
  const tip = stemUp ? y - 32 : y + 32;
  const flags = duration === "e" ? 1 : duration === "s" ? 2 : 0;
  return (
    <g>
      <ellipse
        cx={x} cy={y} rx={6} ry={4.3}
        transform={`rotate(-20 ${x} ${y})`}
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor" strokeWidth={filled ? 0 : 1.8}
      />
      <line x1={sx} y1={y} x2={sx} y2={tip} stroke="currentColor" strokeWidth={1.4} />
      {Array.from({ length: flags }).map((_, k) => {
        const fy = stemUp ? tip + k * 7 : tip - k * 7;
        const d = stemUp ? `M ${sx} ${fy} c 1 6 9 8 6 16` : `M ${sx} ${fy} c 1 -6 9 -8 6 -16`;
        return <path key={k} d={d} fill="none" stroke="currentColor" strokeWidth={1.8} />;
      })}
    </g>
  );
}

/** `top` is the y of the top staff line. */
export function RestShape({ x, top, duration }: { x: number; top: number; duration: ScoreDuration }) {
  switch (duration) {
    case "w":
      return <rect x={x - 6} y={top + 10} width={12} height={5} fill="currentColor" />;
    case "h":
      return <rect x={x - 6} y={top + 15} width={12} height={5} fill="currentColor" />;
    case "q":
      return (
        <path
          d={`M ${x - 2} ${top + 6} l 5 7 l -5 6 l 5 7 c -5 -2 -7 2 -3 6`}
          fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinejoin="round"
        />
      );
    case "e":
      return (
        <g>
          <circle cx={x - 3} cy={top + 17} r={2.6} fill="currentColor" />
          <path d={`M ${x - 3} ${top + 19} q 4 1 7 -4 L ${x - 1} ${top + 33}`} fill="none" stroke="currentColor" strokeWidth={1.6} />
        </g>
      );
    default:
      return (
        <g>
          <circle cx={x - 3} cy={top + 17} r={2.6} fill="currentColor" />
          <circle cx={x - 5} cy={top + 25} r={2.6} fill="currentColor" />
          <path d={`M ${x - 3} ${top + 19} q 4 1 7 -4 L ${x - 3} ${top + 41} M ${x - 5} ${top + 27} q 4 1 6.5 -4`} fill="none" stroke="currentColor" strokeWidth={1.6} />
        </g>
      );
  }
}

export function DurationIcon({ duration, rest }: { duration: ScoreDuration; rest: boolean }) {
  return (
    <svg viewBox="0 -2 24 46" className="h-7 w-5" aria-hidden="true">
      {rest ? <RestShape x={12} top={0} duration={duration} /> : <NoteShape x={9} y={34} duration={duration} stemUp />}
    </svg>
  );
}

export const ACCIDENTAL_GLYPH = { natural: "♮", sharp: "♯", flat: "♭" } as const;
