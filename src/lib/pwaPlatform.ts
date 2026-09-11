export type PwaPlatform = "ios" | "ipados" | "android" | "windows" | "macos" | "linux" | "other";

// iPadOS 13+ reports its UA as a Mac, so it's checked ahead of the plain
// macOS UA match — see the same touch-points trick in useIOSInstall.ts.
export function detectPwaPlatform(): PwaPlatform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  const isIPadOS = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;

  if (/iPad/.test(ua) || isIPadOS) return "ipados";
  if (/iPhone|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  if (/Windows/.test(ua)) return "windows";
  if (/Macintosh|Mac OS X/.test(ua)) return "macos";
  if (/Linux/.test(ua)) return "linux";
  return "other";
}

export const PWA_PLATFORM_LABELS: Record<PwaPlatform, string> = {
  ios: "iOS",
  ipados: "iPadOS",
  android: "Android",
  windows: "Windows",
  macos: "macOS",
  linux: "Linux",
  other: "this device",
};
