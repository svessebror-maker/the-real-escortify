import Image from "next/image";

import { APP_NAME, APP_TAGLINE } from "@shared/brand";

export default function Home() {
  // Set on servers that host a test build of the Android app (see deploy/README.md).
  const androidApk = process.env.NEXT_PUBLIC_ANDROID_APK_URL;

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      {/* Vector logo: sharp at any zoom or pixel density. */}
      <Image src="/brand/logo.svg" alt="" width={96} height={96} loading="eager" unoptimized className="mb-2" />
      <h1 className="text-4xl font-semibold tracking-tight">{APP_NAME}</h1>
      <p className="max-w-md text-lg text-foreground/70">{APP_TAGLINE}</p>
      <p className="text-sm text-foreground/70">Coming soon.</p>
      {androidApk ? (
        <a
          href={androidApk}
          download
          className="mt-4 inline-flex min-h-11 items-center rounded-full bg-foreground px-6 font-medium text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          Download the Android test app
        </a>
      ) : null}
    </main>
  );
}
