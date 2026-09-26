import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import type { Reaction } from "@shared/swipe";

import type { Palette } from "@/theme";

type Props = {
  disabled: boolean;
  canUndo: boolean;
  onReact: (reaction: Reaction) => void;
  onUndo: () => void;
  palette: Palette;
};

// Every swipe also works from a button: gestures are never the only way.
export function ActionBar({ disabled, canUndo, onReact, onUndo, palette }: Props) {
  return (
    <View style={styles.bar}>
      <RoundButton
        icon="arrow-undo"
        label="Undo"
        size={48}
        color={palette.muted}
        disabled={!canUndo}
        onPress={onUndo}
        palette={palette}
      />
      <RoundButton
        icon="close"
        label="Pass"
        size={64}
        color={palette.pass}
        disabled={disabled}
        onPress={() => onReact("pass")}
        palette={palette}
      />
      <RoundButton
        icon="bookmark"
        label="Save"
        size={52}
        color={palette.save}
        disabled={disabled}
        onPress={() => onReact("save")}
        palette={palette}
      />
      <RoundButton
        icon="heart"
        label="Interested"
        size={64}
        color={palette.interest}
        disabled={disabled}
        onPress={() => onReact("interest")}
        palette={palette}
      />
    </View>
  );
}

type RoundButtonProps = {
  icon: "arrow-undo" | "close" | "bookmark" | "heart";
  label: string;
  size: number;
  color: string;
  disabled: boolean;
  onPress: () => void;
  palette: Palette;
};

function RoundButton({ icon, label, size, color, disabled, onPress, palette }: RoundButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      hitSlop={8}
      style={({ pressed }) => [
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: palette.surface,
          borderColor: palette.border,
          shadowColor: palette.shadow,
          opacity: disabled ? 0.4 : 1,
          transform: [{ scale: pressed ? 0.92 : 1 }],
        },
      ]}
    >
      <Ionicons name={icon} size={size * 0.46} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 18, paddingBottom: 8 },
  button: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    elevation: 4,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
});
