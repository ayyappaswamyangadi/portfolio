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
  // Deliberately no apex -> www redirect: the app is installed from both
  // ayyappa.dev and www.ayyappa.dev, and each install's service worker lives
  // on its own origin. Browsers refuse a redirected worker script, so a
  // redirect freezes apex installs on whatever build they last cached. Both
  // hosts serve the full site; the canonical tag (layout.tsx) and sitemap
  // point at www, so search engines still index one copy.
  //
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
      {
        source: "/admin/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
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
  // Off: it hard-reloads the page on every `online` event, which on a phone
  // waking up (network flapping off/on) threw the reader back to the top
  // mid-read. NetworkStatus already announces reconnection.
  reloadOnOnline: false,
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
      // The private /admin dashboard (and its login/logout endpoints) always
      // goes to the network and is never written to any cache. Registered
      // first, so it wins over the page/RSC/api caches below.
      {
        urlPattern: ({ url: { pathname }, sameOrigin }) =>
          sameOrigin && (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")),
        handler: "NetworkOnly",
      },
      // Replaces next-pwa's default "pages" entry (by cacheName) with a
      // network timeout, so any page other than the precached "/" falls back
      // to its cached copy quickly instead of hanging on a stalled network.
      // Limited to page navigations: custom entries are registered *ahead*
      // of the defaults, so the default's broad "any same-origin URL" match
      // here would swallow every image/font/script request too, making each
      // one wait up to the timeout on a bad connection instead of being
      // served straight from its stale-while-revalidate/cache-first cache.
      {
        urlPattern: ({ request, url: { pathname }, sameOrigin }) =>
          request.mode === "navigate" &&
          sameOrigin &&
          !pathname.startsWith("/api/"),
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
