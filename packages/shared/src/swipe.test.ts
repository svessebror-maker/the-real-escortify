import { describe, expect, it } from "vitest";

import { initials, SAMPLE_PROFILES } from "./discovery";
import { decideSwipe, SWIPE, swipeProgress, swipeRotation } from "./swipe";

const card = { width: 400, height: 600 };

describe("decideSwipe", () => {
  it("springs back below every threshold", () => {
    expect(decideSwipe({ ...card, dx: 100, dy: -120 })).toBeNull();
    expect(decideSwipe({ ...card, dx: -111, dy: 0 })).toBeNull();
  });

  it("commits pass or interest beyond 28% of the card width", () => {
    expect(decideSwipe({ ...card, dx: 113, dy: 0 })).toBe("interest");
    expect(decideSwipe({ ...card, dx: -113, dy: 0 })).toBe("pass");
  });

  it("commits save beyond 22% of the card height upward, never downward", () => {
    expect(decideSwipe({ ...card, dx: 0, dy: -133 })).toBe("save");
    expect(decideSwipe({ ...card, dx: 0, dy: 400 })).toBeNull();
  });

  it("picks the direction that is further past its threshold", () => {
    expect(decideSwipe({ ...card, dx: 200, dy: -140 })).toBe("interest");
    expect(decideSwipe({ ...card, dx: 115, dy: -300 })).toBe("save");
  });

  it("lets a quick flick commit a short drag", () => {
    expect(decideSwipe({ ...card, dx: 30, dy: 0 })).toBeNull();
    expect(decideSwipe({ ...card, dx: 30, dy: 0, vx: 1200 })).toBe("interest");
    expect(decideSwipe({ ...card, dx: -10, dy: 0, vx: -1200 })).toBe("pass");
  });

  it("never commits on an unmeasured card", () => {
    expect(decideSwipe({ dx: 500, dy: 0, width: 0, height: 0 })).toBeNull();
  });
});

describe("swipeProgress and swipeRotation", () => {
  it("runs from 0 at rest to 1 at the commit threshold", () => {
    expect(swipeProgress(0, 0, card.width, card.height)).toBe(0);
    expect(swipeProgress(56, 0, card.width, card.height)).toBeCloseTo(0.5);
    expect(swipeProgress(-400, 0, card.width, card.height)).toBe(1);
    expect(swipeProgress(0, 300, card.width, card.height)).toBe(0);
  });

  it("caps rotation at the plan's maximum", () => {
    expect(swipeRotation(0, card.width)).toBe(0);
    expect(swipeRotation(100, card.width)).toBe(4);
    expect(swipeRotation(5000, card.width)).toBe(SWIPE.maxRotationDeg);
    expect(swipeRotation(-5000, card.width)).toBe(-SWIPE.maxRotationDeg);
  });
});

describe("sample profiles", () => {
  it("have unique ids and two matching reasons each", () => {
    const ids = SAMPLE_PROFILES.map((profile) => profile.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const profile of SAMPLE_PROFILES) expect(profile.reasons).toHaveLength(2);
  });

  it("derive avatar initials from the first two names", () => {
    expect(initials("Amira Haddad")).toBe("AH");
    expect(initials("  Lea  ")).toBe("L");
  });
});
