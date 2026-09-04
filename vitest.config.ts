import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    // Tests assert on classNames/DOM structure, not computed styles, so real
    // CSS processing isn't needed. Note: this alone does NOT avoid the
    // PostCSS failure below — Vite's `vite:css` plugin still validates
    // postcss.config.mjs on any `.css` import regardless of this flag. Any
    // test file whose component does `import "./globals.css"` directly
    // (e.g. global-error.tsx) must additionally `vi.mock("./globals.css",
    // () => ({}))` in that test file — see global-error.test.tsx.
    css: false,
    // Default 5s is too tight on this machine — first render in a file pays
    // a one-time cold-start cost compiling framer-motion/lucide-react/etc,
    // observed taking ~6s alone (later tests in the same file are much
    // faster once warm). Bumped globally rather than per-test.
    testTimeout: 15000,
    exclude: ["node_modules", ".next", "e2e", "**/*.spec.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/app/**/layout.tsx",
        "src/app/**/opengraph-image.tsx",
        "src/app/robots.ts",
        "src/app/sitemap.ts",
      ],
    },
  },
});
