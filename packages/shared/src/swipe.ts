// Swipe rules for the discovery deck (docs/build-plan.md, Step 13), shared by
// the web and mobile apps. The "worklet" directives let React Native Reanimated
// run these on the UI thread; elsewhere they are ordinary functions.

export type Reaction = "pass" | "interest" | "save";

export const SWIPE = {
  /** Horizontal drag, as a share of card width, that commits pass or interest. */
  horizontalCommit: 0.28,
  /** Upward drag, as a share of card height, that commits save. */
  verticalCommit: 0.22,
  /** Maximum card rotation while dragging, in degrees. */
  maxRotationDeg: 8,
  /** Release velocity is projected this far ahead, so a quick flick commits like a longer drag. */
  flickSeconds: 0.12,
} as const;

export type SwipeRelease = {
  dx: number;
  dy: number;
  vx?: number;
  vy?: number;
  width: number;
  height: number;
};

/** The reaction a released drag commits, or null to spring the card back. */
export function decideSwipe({ dx, dy, vx = 0, vy = 0, width, height }: SwipeRelease): Reaction | null {
  "worklet";
  if (width <= 0 || height <= 0) return null;
  const x = dx + vx * SWIPE.flickSeconds;
  const y = dy + vy * SWIPE.flickSeconds;
  const horizontalScore = Math.abs(x) / width / SWIPE.horizontalCommit;
  const upwardScore = -y / height / SWIPE.verticalCommit;
  if (Math.max(horizontalScore, upwardScore) < 1) return null;
  if (upwardScore > horizontalScore) return "save";
  return x > 0 ? "interest" : "pass";
}

/** How far a drag is toward committing, from 0 to 1. Drives the cards behind. */
export function swipeProgress(dx: number, dy: number, width: number, height: number): number {
  "worklet";
  if (width <= 0 || height <= 0) return 0;
  const horizontal = Math.abs(dx) / (width * SWIPE.horizontalCommit);
  const upward = -dy / (height * SWIPE.verticalCommit);
  return Math.min(1, Math.max(0, horizontal, upward));
}

/** Card rotation in degrees for a horizontal drag, capped at SWIPE.maxRotationDeg. */
export function swipeRotation(dx: number, width: number): number {
  "worklet";
  if (width <= 0) return 0;
  const rotation = (dx / (width / 2)) * SWIPE.maxRotationDeg;
  return Math.max(-SWIPE.maxRotationDeg, Math.min(SWIPE.maxRotationDeg, rotation));
}
