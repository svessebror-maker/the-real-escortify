import { StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { APP_NAME, APP_TAGLINE } from "@shared/brand";

import { usePalette } from "@/theme";

export default function Home() {
  const palette = usePalette();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
      <Text accessibilityRole="header" style={[styles.title, { color: palette.foreground }]}>
        {APP_NAME}
      </Text>
      <Text style={[styles.tagline, { color: palette.muted }]}>{APP_TAGLINE}</Text>
      <Text style={[styles.status, { color: palette.muted }]}>Coming soon.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 24,
  },
  title: { fontSize: 36, fontWeight: "600", letterSpacing: -0.5 },
  tagline: { fontSize: 18, lineHeight: 28, textAlign: "center", maxWidth: 448 },
  status: { fontSize: 14 },
});
