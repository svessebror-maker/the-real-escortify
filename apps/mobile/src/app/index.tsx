import { Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { APP_NAME } from "@shared/brand";
import { SAMPLE_PROFILES } from "@shared/discovery";

import { CardDeck } from "@/features/discovery/CardDeck";
import { usePalette } from "@/theme";

// Discovery with sample profiles until the discovery API (build plan Step 12) exists.
export default function Discover() {
  const palette = usePalette();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: palette.background }]}>
      <View style={styles.header}>
        {/* logo.png ships @2x/@3x variants, so it stays sharp on every screen density. */}
        <Image source={require("../../assets/logo.png")} style={styles.logo} accessible={false} />
        <Text accessibilityRole="header" style={[styles.title, { color: palette.foreground }]}>
          {APP_NAME}
        </Text>
      </View>
      <CardDeck profiles={SAMPLE_PROFILES} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 16 },
  header: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12 },
  logo: { width: 32, height: 32 },
  title: { fontSize: 22, fontWeight: "700", letterSpacing: -0.3 },
});
