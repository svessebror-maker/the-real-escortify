import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { usePalette } from "@/theme";

export default function RootLayout() {
  const palette = usePalette();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: palette.background },
        }}
      />
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}
