import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  compiler: {
    styledComponents: true,
  },
  // Baseline security headers. Deliberately not shipping a CSP here — this
  // page loads Google Analytics' inline script + remote JS, Google Fonts,
  // and a WebGL scene, and a strict policy tuned blind (no way to test it
  // live in this environment) risks silently breaking one of those rather
  // than actually protecting anything. These four are standard, essentially
  // never break a site, and cover the common baseline (MIME sniffing,
  // referrer leakage, clickjacking, unwanted device access).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default withPWA({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
  },
})(nextConfig);
