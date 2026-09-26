import { useColorScheme } from "react-native";

// Mirrors the web app's color tokens in src/app/globals.css, plus the brand
// accent from brand/artwork.mjs and one color per swipe reaction.
const shared = {
  accent: "#4F46E5",
  pass: "#EF4444",
  interest: "#10B981",
  save: "#3B82F6",
} as const;

const palettes = {
  light: {
    ...shared,
    background: "#ffffff",
    foreground: "#171717",
    muted: "rgba(23, 23, 23, 0.7)",
    surface: "#ffffff",
    surfaceRaised: "#f5f5f7",
    border: "rgba(23, 23, 23, 0.08)",
    chip: "#EEF2FF",
    chipText: "#3730A3",
    shadow: "#1E1B4B",
  },
  dark: {
    ...shared,
    background: "#0a0a0a",
    foreground: "#ededed",
    muted: "rgba(237, 237, 237, 0.7)",
    surface: "#18181b",
    surfaceRaised: "#232326",
    border: "rgba(237, 237, 237, 0.1)",
    chip: "rgba(129, 140, 248, 0.16)",
    chipText: "#C7D2FE",
    shadow: "#000000",
  },
};

export type Palette = (typeof palettes)["light"];

export function usePalette(): Palette {
  return useColorScheme() === "dark" ? palettes.dark : palettes.light;
}
