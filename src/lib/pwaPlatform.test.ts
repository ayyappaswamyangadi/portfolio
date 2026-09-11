import { afterEach, describe, expect, it } from "vitest";
import { detectPwaPlatform } from "./pwaPlatform";

function setUserAgent(ua: string) {
  Object.defineProperty(window.navigator, "userAgent", {
    value: ua,
    configurable: true,
  });
}

function setPlatform(platform: string) {
  Object.defineProperty(window.navigator, "platform", {
    value: platform,
    configurable: true,
  });
}

function setMaxTouchPoints(points: number) {
  Object.defineProperty(window.navigator, "maxTouchPoints", {
    value: points,
    configurable: true,
  });
}

describe("detectPwaPlatform", () => {
  afterEach(() => {
    setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15");
    setPlatform("MacIntel");
    setMaxTouchPoints(0);
  });

  it("detects iPhone", () => {
    setUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15");
    expect(detectPwaPlatform()).toBe("ios");
  });

  it("detects iPad via UA", () => {
    setUserAgent("Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15");
    expect(detectPwaPlatform()).toBe("ipados");
  });

  it("detects iPadOS 13+ reporting as Mac UA with multi-touch", () => {
    setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15");
    setPlatform("MacIntel");
    setMaxTouchPoints(5);
    expect(detectPwaPlatform()).toBe("ipados");
  });

  it("detects a real Mac (no touch points)", () => {
    setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15");
    setPlatform("MacIntel");
    setMaxTouchPoints(0);
    expect(detectPwaPlatform()).toBe("macos");
  });

  it("detects Android", () => {
    setUserAgent("Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36");
    expect(detectPwaPlatform()).toBe("android");
  });

  it("detects Windows", () => {
    setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
    setPlatform("Win32");
    expect(detectPwaPlatform()).toBe("windows");
  });

  it("detects Linux desktop", () => {
    setUserAgent("Mozilla/5.0 (X11; Linux x86_64)");
    setPlatform("Linux x86_64");
    expect(detectPwaPlatform()).toBe("linux");
  });
});
