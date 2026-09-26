import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { type ReactNode, useCallback, useState } from "react";
import { AccessibilityInfo, type LayoutChangeEvent, Pressable, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  type SharedValue,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN, scheduleOnUI } from "react-native-worklets";

import type { DiscoveryProfile } from "@shared/discovery";
import { decideSwipe, type Reaction, SWIPE, swipeProgress, swipeRotation } from "@shared/swipe";

import { usePalette } from "@/theme";

import { ActionBar } from "./ActionBar";
import { DiscoveryCard } from "./DiscoveryCard";
import { placeholderPhoto } from "./placeholderPhotos";

// Resting place of the top card and the two buffered cards behind it.
const STACK = [
  { y: 0, scale: 1 },
  { y: 16, scale: 0.95 },
  { y: 32, scale: 0.9 },
] as const;
const COMMIT_MS = 230; // Step 13: committed cards animate in 180-260 ms.
const SPRING = { damping: 18, stiffness: 180, mass: 0.9 };

const VERB: Record<Reaction, string> = { pass: "Passed", interest: "Interested in", save: "Saved" };

type Deck = {
  activeIndex: SharedValue<number>;
  tx: SharedValue<number>;
  ty: SharedValue<number>;
  width: SharedValue<number>;
  height: SharedValue<number>;
  reduceMotion: boolean;
};

export function CardDeck({ profiles }: { profiles: DiscoveryProfile[] }) {
  const palette = usePalette();
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [last, setLast] = useState<{ index: number; reaction: Reaction } | null>(null);

  // Card positions live on the UI thread so every frame of a drag, fly-out
  // and stack shift runs without waiting for React.
  const activeIndex = useSharedValue(0);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const width = useSharedValue(0);
  const height = useSharedValue(0);
  const busy = useSharedValue(false);
  const deck: Deck = { activeIndex, tx, ty, width, height, reduceMotion };

  const onCommitted = useCallback(
    (reaction: Reaction, committed: number) => {
      setIndex(committed + 1);
      setLast({ index: committed, reaction });
      const profile = profiles[committed];
      if (profile) AccessibilityInfo.announceForAccessibility(`${VERB[reaction]} ${profile.name}'s profile`);
      const style = reaction === "interest" ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light;
      Haptics.impactAsync(style).catch(() => undefined);
    },
    [profiles],
  );

  const exitPoint = (reaction: Reaction) => {
    "worklet";
    if (reaction === "save") return { x: 0, y: -height.value * 1.4 };
    return { x: (reaction === "interest" ? 1 : -1) * width.value * 1.6, y: ty.value };
  };

  // Flies the top card out, then promotes the next card in the same UI frame.
  const commit = (reaction: Reaction) => {
    "worklet";
    busy.value = true;
    const committed = activeIndex.value;
    const target = exitPoint(reaction);
    const timing = { duration: reduceMotion ? 0 : COMMIT_MS };
    ty.value = withTiming(target.y, timing);
    tx.value = withTiming(target.x, timing, () => {
      activeIndex.value = committed + 1;
      tx.value = 0;
      ty.value = 0;
      busy.value = false;
      scheduleOnRN(onCommitted, reaction, committed);
    });
  };

  const springHome = () => {
    "worklet";
    tx.value = reduceMotion ? 0 : withSpring(0, SPRING);
    ty.value = reduceMotion ? 0 : withSpring(0, SPRING);
  };

  const pan = Gesture.Pan()
    .enabled(index < profiles.length)
    .onUpdate((event) => {
      if (busy.value) return;
      tx.value = event.translationX;
      ty.value = event.translationY;
    })
    .onEnd((event) => {
      if (busy.value) return;
      const reaction = decideSwipe({
        dx: event.translationX,
        dy: event.translationY,
        vx: event.velocityX,
        vy: event.velocityY,
        width: width.value,
        height: height.value,
      });
      if (reaction) commit(reaction);
      else springHome();
    });

  const reactTo = (reaction: Reaction) => {
    if (index >= profiles.length) return;
    scheduleOnUI((r: Reaction) => {
      "worklet";
      if (!busy.value) commit(r);
    }, reaction);
  };

  // One-level undo: the card returns from where it left and becomes the top card again.
  const undo = () => {
    if (!last) return;
    const { index: restored, reaction } = last;
    setLast(null);
    setIndex(restored);
    scheduleOnUI(
      (r: Reaction, i: number) => {
        "worklet";
        if (busy.value) return;
        const from = exitPoint(r);
        tx.value = from.x;
        ty.value = from.y;
        activeIndex.value = i;
        springHome();
      },
      reaction,
      restored,
    );
    const profile = profiles[restored];
    if (profile) AccessibilityInfo.announceForAccessibility(`Brought back ${profile.name}'s profile`);
  };

  const startOver = () => {
    setIndex(0);
    setLast(null);
    scheduleOnUI(() => {
      "worklet";
      activeIndex.value = 0;
      tx.value = 0;
      ty.value = 0;
    });
  };

  const onLayout = (event: LayoutChangeEvent) => {
    width.value = event.nativeEvent.layout.width;
    height.value = event.nativeEvent.layout.height;
  };

  // Mount only the previous card (for undo), the active card and two behind it.
  const mounted = profiles
    .map((profile, i) => ({ profile, i }))
    .filter(({ i }) => i >= index - 1 && i <= index + 2)
    .reverse();
  const done = index >= profiles.length;

  return (
    <View style={styles.container}>
      <GestureDetector gesture={pan}>
        <View style={styles.deck} onLayout={onLayout}>
          {done ? (
            <View style={styles.empty}>
              <Ionicons name="checkmark-done-circle-outline" size={56} color={palette.accent} />
              <Text style={[styles.emptyTitle, { color: palette.foreground }]}>You&apos;re all caught up</Text>
              <Text style={[styles.emptyText, { color: palette.muted }]}>
                New recommendations appear as people join.
              </Text>
              <Pressable
                onPress={startOver}
                accessibilityRole="button"
                style={({ pressed }) => [styles.startOver, { backgroundColor: palette.accent, opacity: pressed ? 0.85 : 1 }]}
              >
                <Text style={styles.startOverText}>Start over</Text>
              </Pressable>
            </View>
          ) : null}
          {mounted.map(({ profile, i }) => (
            <SwipeCard key={profile.id} cardIndex={i} deck={deck}>
              <DiscoveryCard profile={profile} palette={palette} photo={placeholderPhoto(profile.id)} />
            </SwipeCard>
          ))}
        </View>
      </GestureDetector>
      <ActionBar disabled={done} canUndo={last !== null} onReact={reactTo} onUndo={undo} palette={palette} />
    </View>
  );
}

function SwipeCard({ cardIndex, deck, children }: { cardIndex: number; deck: Deck; children: ReactNode }) {
  const { activeIndex, tx, ty, width, height, reduceMotion } = deck;

  const cardStyle = useAnimatedStyle(() => {
    const rel = cardIndex - activeIndex.value;
    if (rel < 0 || rel >= STACK.length) return { opacity: 0, zIndex: 0, transform: [{ scale: 0.9 }] };
    if (rel === 0) {
      const rotate = reduceMotion ? 0 : swipeRotation(tx.value, width.value);
      return {
        opacity: 1,
        zIndex: STACK.length,
        transform: [{ translateX: tx.value }, { translateY: ty.value }, { rotate: `${rotate}deg` }],
      };
    }
    // Cards behind move up and grow as the top card is dragged away.
    const p = swipeProgress(tx.value, ty.value, width.value, height.value);
    const from = STACK[rel]!;
    const to = STACK[rel - 1]!;
    return {
      opacity: 1,
      zIndex: STACK.length - rel,
      transform: [{ translateY: from.y + (to.y - from.y) * p }, { scale: from.scale + (to.scale - from.scale) * p }],
    };
  });

  return (
    <Animated.View style={[StyleSheet.absoluteFill, cardStyle]} pointerEvents="none">
      {children}
      <Stamp reaction="interest" cardIndex={cardIndex} deck={deck} />
      <Stamp reaction="pass" cardIndex={cardIndex} deck={deck} />
      <Stamp reaction="save" cardIndex={cardIndex} deck={deck} />
    </Animated.View>
  );
}

const STAMP = {
  interest: { label: "INTERESTED", color: "#10B981", position: { top: 28, left: 22, transform: [{ rotate: "-14deg" }] } },
  pass: { label: "PASS", color: "#EF4444", position: { top: 28, right: 22, transform: [{ rotate: "14deg" }] } },
  save: { label: "SAVE", color: "#3B82F6", position: { bottom: 40, alignSelf: "center" } },
} as const;

// PASS, INTERESTED or SAVE fades in as the drag nears that reaction's threshold.
function Stamp({ reaction, cardIndex, deck }: { reaction: Reaction; cardIndex: number; deck: Deck }) {
  const { activeIndex, tx, ty, width, height } = deck;
  const { label, color, position } = STAMP[reaction];

  const style = useAnimatedStyle(() => {
    if (cardIndex !== activeIndex.value) return { opacity: 0 };
    const x = width.value * SWIPE.horizontalCommit;
    const y = height.value * SWIPE.verticalCommit;
    const amount = reaction === "interest" ? tx.value / x : reaction === "pass" ? -tx.value / x : -ty.value / y;
    return { opacity: Math.max(0, Math.min(1, amount * 1.4 - 0.25)) };
  });

  return (
    <Animated.View style={[styles.stamp, position, { borderColor: color }, style]}>
      <Text style={[styles.stampText, { color }]}>{label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 20 },
  deck: { flex: 1, marginBottom: STACK[STACK.length - 1]!.y },
  empty: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center", gap: 10, padding: 24 },
  emptyTitle: { fontSize: 22, fontWeight: "700" },
  emptyText: { fontSize: 15, textAlign: "center" },
  startOver: { marginTop: 8, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 999, minHeight: 44 },
  startOverText: { color: "#ffffff", fontSize: 16, fontWeight: "600" },
  stamp: {
    position: "absolute",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 4,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
  },
  stampText: { fontSize: 26, fontWeight: "900", letterSpacing: 1.5 },
});
