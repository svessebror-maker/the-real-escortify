/// <reference types="expo/types" />
import type { ImageSourcePropType } from "react-native";

// Optional local photos from assets/placeholders (gitignored), keyed by sample
// profile id. require.context picks up whatever files exist, so the app still
// bundles when the folder only holds its README (fresh clones, CI).
const files = require.context("../../../assets/placeholders", false, /\.(jpe?g|png)$/);

const photos = new Map<string, ImageSourcePropType>(
  files.keys().map((key) => [key.replace(/^\.\//, "").replace(/\.\w+$/, ""), files(key) as ImageSourcePropType]),
);

export function placeholderPhoto(profileId: string): ImageSourcePropType | undefined {
  return photos.get(profileId);
}
