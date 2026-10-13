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
  // The apex domain currently serves the same page as www with a 200, i.e.
  // two indexable copies of one site. The canonical tag already points at
  // www, but a 308 consolidates ranking signals for real. The Search Console
  // verification file is excluded so the redirect can't break an existing
  // apex-domain property's ownership check.
  async redirects() {
    return [
      {
        source: "/:path((?!google1a73ae2602885b7d\\.html$).*)",
        has: [{ type: "host", value: "ayyappa.dev" }],
        destination: "https://www.ayyappa.dev/:path",
        permanent: true,
      },
    ];
  },
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
  // "/" is a fully static page, so precache it instead of the default
  // "dynamic start URL" route. That default serves the launch page
  // NetworkFirst with no timeout — on iOS, opening the installed app after a
  // long gap on a slow/half-dead connection left a blank white screen for
  // minutes while the service worker waited on the network. Precached, the
  // app shell opens instantly from the SW (and always matches the JS chunks
  // precached in the same build); a new deploy is picked up in the
  // background and shown on the next launch.
  dynamicStartUrl: false,
  extendDefaultRuntimeCaching: true,
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      // Same match as next-pwa's default "pages" entry (which this replaces
      // by cacheName), plus a network timeout so any other page falls back
      // to its cached copy quickly instead of hanging on a stalled network.
      {
        urlPattern: ({ url: { pathname }, sameOrigin }) =>
          sameOrigin && !pathname.startsWith("/api/"),
        handler: "NetworkFirst",
        options: {
          cacheName: "pages",
          networkTimeoutSeconds: 3,
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 7 * 24 * 60 * 60,
          },
        },
      },
    ],
  },
})(nextConfig);
