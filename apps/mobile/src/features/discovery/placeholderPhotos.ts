/// <reference types="expo/types" />
import type { ImageSourcePropType } from "react-native";

// Optional local photos from assets/placeholders (gitignored), keyed by sample
// profile id. require.context picks up whatever files exist, so the app still
// bundles when the folder only holds its README (fresh clones, CI).
//
// Development only: these are photos of real people, so release builds must
// never contain them. Metro folds `__DEV__` to false in production bundles and
// drops this branch before collecting assets.
const photos = new Map<string, ImageSourcePropType>();
if (__DEV__) {
  const files = require.context("../../../assets/placeholders", false, /\.(jpe?g|png)$/);
  for (const key of files.keys()) {
    photos.set(key.replace(/^\.\//, "").replace(/\.\w+$/, ""), files(key) as ImageSourcePropType);
  }
}

export function placeholderPhoto(profileId: string): ImageSourcePropType | undefined {
  return photos.get(profileId);
}
