import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import Home from "./page";

describe("Home", () => {
  it("shows the product name as the page heading", () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Letsseeeify" }),
    ).toBeInTheDocument();
  });

  it("hides the Android download without a configured build", () => {
    vi.stubEnv("NEXT_PUBLIC_ANDROID_APK_URL", "");
    render(<Home />);
    expect(screen.queryByRole("link", { name: /android/i })).not.toBeInTheDocument();
  });

  it("links to the configured Android build", () => {
    vi.stubEnv("NEXT_PUBLIC_ANDROID_APK_URL", "/downloads/letsseeeify.apk");
    render(<Home />);
    expect(screen.getByRole("link", { name: "Download the Android test app" })).toHaveAttribute(
      "href",
      "/downloads/letsseeeify.apk",
    );
  });
});
