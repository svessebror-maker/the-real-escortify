# Letsseeeify mobile (iOS and Android)

Expo (React Native) app built with Expo Router. Screens live in `src/app/`. The app shares code with the web app through `@shared/*` (see [packages/shared](../../packages/shared/README.md)).

Run every command in this folder:

```bash
cd apps/mobile
npm install
```

## Preview on your phone (no build needed)

1. Install **Expo Go** from the App Store or Google Play.
2. Run `npx expo start` and scan the QR code: on iPhone with the Camera app, on Android from Expo Go. The phone must be on the same Wi-Fi network; if it isn't, use `npx expo start --tunnel`.

Expo Go only includes Expo's built-in native modules. Once the app adds another native library, use a development build instead.

## Android on this computer

This needs Android Studio, which provides the Android SDK and emulators, and **JDK 17 or 21**. Java 24 and later fail the native build with "A restricted method in java.lang.System has been called", and recent Android Studio releases bundle Java 25. Install Temurin 17 if you don't have it (`winget install EclipseAdoptium.Temurin.17.JDK`), then point the build at it:

```powershell
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17<version>-hotspot"  # your JDK 17 folder
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
```

- **Run on an emulator or a USB-connected phone:** `npm run android`
- **Build an installable release APK:**

  ```powershell
  npx expo prebuild --platform android
  cd android
  .\gradlew.bat assembleRelease
  ```

  The APK is at `android/app/build/outputs/apk/release/app-release.apk`. It is signed with the debug key, so use it only for testing, never for Google Play.

- **Windows only: "manifest 'build.ninja' still dirty after 100 tries".** The default CMake 3.22.1 bundles Ninja 1.10, which cannot handle this project's long native build paths. Install CMake 4.x from Android Studio (SDK Manager → SDK Tools → CMake) and point the build at it in `android/local.properties`. `prebuild --clean` deletes this file, so add the line again afterwards:

  ```properties
  cmake.dir=C\:\\Users\\<you>\\AppData\\Local\\Android\\Sdk\\cmake\\4.1.2
  ```

  Windows long paths must also be enabled; this machine has them on. See Reanimated's [Windows build guide](https://docs.swmansion.com/react-native-reanimated/docs/guides/building-on-windows/).

`android/` and `ios/` are generated from `app.json` (Continuous Native Generation) and are gitignored. Change native settings in `app.json` or config plugins, never in those folders.

## iOS and store builds (EAS, in the cloud)

iOS apps can only be built on macOS, so iOS builds run on Expo Application Services (EAS). EAS can build Android too.

1. Create a free Expo account, then run `npx eas-cli@latest login` and `npx eas-cli@latest init`. `init` adds the project ID to `app.json`.
2. **Test builds** (the `preview` profile):
   - Android: `npx eas-cli@latest build --platform android --profile preview` produces an installable APK.
   - iOS: requires the Apple Developer Program ($99/year). Register test devices with `npx eas-cli@latest device:create`, then run `npx eas-cli@latest build --platform ios --profile preview`.
3. **Store builds:** `npx eas-cli@latest build --profile production`, then `npx eas-cli@latest submit`. This requires Apple Developer and Google Play Console accounts.

The bundle identifier and Android package are both `com.svesse.letsseeeify`. They cannot change after the first store upload, so confirm them before then.

## Checks

```bash
npm run typecheck
npm run lint
npx expo-doctor
```

CI runs these on every pull request and also bundles the JavaScript for both platforms.

## Upgrading Expo

Upgrade the whole SDK at once with `npx expo install expo@latest --fix`. Install new packages with `npx expo install <package>`, never plain `npm install`, so versions stay compatible with the SDK. Dependabot does not manage this folder for the same reason.

`npm audit` reports moderate advisories in `uuid` (build tooling only) and `decode-uri-component` (bundled via Expo Router). npm's only suggested fix downgrades Expo by several major versions. Take the fixes when Expo ships them in an SDK update.
