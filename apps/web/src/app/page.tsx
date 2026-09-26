import Image from "next/image";

import { APP_NAME, APP_TAGLINE } from "@shared/brand";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      {/* Vector logo: sharp at any zoom or pixel density. */}
      <Image src="/brand/logo.svg" alt="" width={96} height={96} priority unoptimized className="mb-2" />
      <h1 className="text-4xl font-semibold tracking-tight">{APP_NAME}</h1>
      <p className="max-w-md text-lg text-foreground/70">{APP_TAGLINE}</p>
      <p className="text-sm text-foreground/70">Coming soon.</p>
    </main>
  );
}
