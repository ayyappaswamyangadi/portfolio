import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  compiler: {
    styledComponents: true,
  },
  // pdfkit (used directly by /api/resume's fallback renderer, and
  // internally by @react-pdf/renderer) resolves its base-14 font files
  // through package.json "imports" subpath aliases (`#standard-fonts/*` ->
  // `./js/standard-fonts/*.cjs`), which Vercel's build-time file tracer
  // doesn't follow — it can't statically know which "*" values get
  // requested at runtime. Left alone, that means those files silently
  // don't ship with the deployed function, and pdfkit throws "Cannot find
  // module '.../standard-fonts/Helvetica.cjs'" the first time it actually
  // needs one — a failure invisible locally, since `next start`/dev run
  // against the full node_modules on disk rather than a traced subset.
  outputFileTracingIncludes: {
    "/api/resume": ["./node_modules/pdfkit/js/standard-fonts/**"],
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
  disable: process.env.NODE_ENV === "development",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
  },
})(nextConfig);
