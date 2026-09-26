import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image, type ImageSourcePropType, StyleSheet, Text, View } from "react-native";

import { type DiscoveryProfile, initials } from "@shared/discovery";

import type { Palette } from "@/theme";

type Props = { profile: DiscoveryProfile; palette: Palette; photo?: ImageSourcePropType };

// Content order follows docs/build-plan.md Step 13: image, name and role,
// institution and location, goal badge, topics, skills, reasons, availability.
export function DiscoveryCard({ profile, palette, photo }: Props) {
  const { hue } = profile;

  return (
    <View
      style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border, shadowColor: palette.shadow }]}
      accessible
      accessibilityLabel={`${profile.name}, ${profile.role}, ${profile.institution}. ${profile.goal}. ${profile.reasons.join(". ")}.`}
    >
      <LinearGradient
        colors={[`hsl(${hue}, 78%, 62%)`, `hsl(${(hue + 40) % 360}, 72%, 48%)`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cover}
      >
        {photo ? (
          <>
            <Image source={photo} style={styles.photo} resizeMode="cover" accessible={false} />
            {/* Soft shade keeps the goal badge readable on any photo. */}
            <LinearGradient colors={["rgba(0,0,0,0.35)", "rgba(0,0,0,0)"]} style={styles.photoShade} />
          </>
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(profile.name)}</Text>
          </View>
        )}
        <View style={styles.goal}>
          <Ionicons name="sparkles" size={13} color="#ffffff" />
          <Text style={styles.goalText}>{profile.goal}</Text>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: palette.foreground }]} numberOfLines={1}>
            {profile.name}
          </Text>
          {profile.verified ? (
            <Ionicons name="checkmark-circle" size={20} color={palette.save} accessibilityLabel="Verified" />
          ) : null}
        </View>
        <Text style={[styles.role, { color: palette.muted }]} numberOfLines={1}>
          {profile.role}
        </Text>
        <Text style={[styles.meta, { color: palette.muted }]} numberOfLines={1}>
          {profile.institution} · {profile.location}
        </Text>

        <View style={styles.chips}>
          {profile.topics.map((topic) => (
            <Text key={topic} style={[styles.chip, { backgroundColor: palette.chip, color: palette.chipText }]}>
              {topic}
            </Text>
          ))}
        </View>

        <Text style={[styles.skills, { color: palette.foreground }]} numberOfLines={1}>
          <Text style={{ color: palette.muted }}>Offers </Text>
          {profile.offers.join(", ")}
          <Text style={{ color: palette.muted }}>  ·  Needs </Text>
          {profile.needs.join(", ")}
        </Text>

        <View style={[styles.reasons, { backgroundColor: palette.surfaceRaised }]}>
          {profile.reasons.map((reason) => (
            <View key={reason} style={styles.reason}>
              <Ionicons name="git-merge-outline" size={15} color={palette.accent} />
              <Text style={[styles.reasonText, { color: palette.foreground }]} numberOfLines={2}>
                {reason}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.availability}>
          <Ionicons name="time-outline" size={15} color={palette.muted} />
          <Text style={[styles.meta, { color: palette.muted }]}>{profile.availability}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    elevation: 6,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
  },
  cover: { flex: 1, minHeight: 150, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  // Explicit size: an image's intrinsic dimensions must never grow the cover.
  photo: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%" },
  photoShade: { position: "absolute", top: 0, left: 0, right: 0, height: 96 },
  goal: {
    position: "absolute",
    top: 16,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(0, 0, 0, 0.22)",
  },
  goalText: { color: "#ffffff", fontSize: 13, fontWeight: "600" },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.55)",
  },
  avatarText: { color: "#ffffff", fontSize: 38, fontWeight: "700", letterSpacing: 1 },
  body: { padding: 20, gap: 6 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: { fontSize: 24, fontWeight: "700", letterSpacing: -0.3, flexShrink: 1 },
  role: { fontSize: 15, fontWeight: "500" },
  meta: { fontSize: 14 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
  chip: { fontSize: 13, fontWeight: "600", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, overflow: "hidden" },
  skills: { fontSize: 14, marginTop: 4 },
  reasons: { borderRadius: 16, padding: 12, gap: 8, marginTop: 6 },
  reason: { flexDirection: "row", alignItems: "center", gap: 8 },
  reasonText: { fontSize: 14, flexShrink: 1 },
  availability: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
});
