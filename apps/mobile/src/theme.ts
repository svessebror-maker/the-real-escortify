import { useColorScheme } from "react-native";

// Mirrors the web app's color tokens in src/app/globals.css.
const palettes = {
  light: { background: "#ffffff", foreground: "#171717", muted: "rgba(23, 23, 23, 0.7)" },
  dark: { background: "#0a0a0a", foreground: "#ededed", muted: "rgba(237, 237, 237, 0.7)" },
} as const;

export type Palette = (typeof palettes)[keyof typeof palettes];

export function usePalette(): Palette {
  return useColorScheme() === "dark" ? palettes.dark : palettes.light;
}
