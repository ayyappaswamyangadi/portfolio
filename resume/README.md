# Resume

There are now **two** resume artifacts — don't confuse them:

1. **`/api/resume` (canonical, live)** — the site's "Download CV" button
   (`src/app/components/DownloadCvButton.tsx`) hits this Next.js Route Handler
   (`src/app/api/resume/route.tsx`), which renders a fresh PDF **on every
   request** via `@react-pdf/renderer` (pure JS/pdfkit — no headless browser,
   so it runs fine as a normal Vercel serverless function... usually — see
   the fallback note below). The experience durations in the summary
   ("5 yrs 7 months...") are computed at request time from
   `src/lib/experience.ts` — the same functions the site's About section
   uses — so a recruiter downloading it in December sees a different,
   correct number than one downloading it in June. Shared text content
   (skills, bullets, projects, education/CGPA) lives in
   `src/lib/resumeContent.ts`. **Edit that file and `ResumeDocument.tsx`,
   not this folder, to change what recruiters actually download.**

   **Fallback:** `route.tsx`'s primary renderer has been observed to throw
   in Vercel's serverless runtime (yoga-layout's WASM layout engine — a
   `@react-pdf/renderer` dependency) even when an identical build runs fine
   locally via `next start`; see
   https://github.com/diegomura/react-pdf/issues/2589. If `renderToBuffer`
   throws, the route logs the error and falls back to
   `renderFallbackPdf.ts` — a second renderer built directly on plain
   `pdfkit` (no yoga-layout, no `@react-pdf/renderer`) that reads the same
   `resumeContent.ts` and the same live `totalExperienceLabel` /
   `reviseDurationLabel` the primary renderer was given. So even when the
   fallback fires, the download still reflects the current month, not a
   frozen snapshot — it's a different rendering engine, not stale content.
   Its layout is deliberately simpler than `ResumeDocument.tsx` (pdfkit lays
   text out as a linear cursor rather than flexbox), so if you change the
   visible resume content, update both `ResumeDocument.tsx` and
   `renderFallbackPdf.ts`. Check Vercel's function logs for `[/api/resume]`
   occasionally to see whether the fallback is firing and how often.

2. **`resume.html` / `public/resume/Ayyappa_Swamy_Angadi_Resume.pdf`
   (design reference / manual-export copy)** — a static snapshot, not
   linked from the live site and no longer used as `/api/resume`'s runtime
   fallback (see above — that fallback is dynamic too now). Keep it around
   for situations that need an actual uploaded file rather than a link
   (e.g. LinkedIn's "Featured" section, a job portal's "attach resume"
   field) — regenerate it occasionally so it doesn't drift too far from
   reality, but it will never auto-update the way `/api/resume` does.

## Regenerating the static PDF (`resume.html` → `public/resume/...pdf`)

Renders a real, text-selectable PDF (not a rasterized image) via headless Chrome, so it
stays parseable by ATS software.

```bash
# from the resume/ directory
python3 -m http.server 8934 &

# from anywhere (macOS path shown — swap for your Chrome binary on other platforms)
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="../public/resume/Ayyappa_Swamy_Angadi_Resume.pdf" \
  http://localhost:8934/resume.html

kill %1  # stop the http.server background job
```

Check the result fits on one page (`pdftotext`/opening the PDF, or the `Read` tool in
Claude Code) before committing — the CSS spacing is tuned to just barely fit everything
on a single A4 page, so a few extra words of content can push it to page 2.

## Design notes (apply to both artifacts)

- ATS-safe by construction: single column, plain semantic markup, no tables, no
  text-as-images. "Technical Skills" is one category per line (not a grid)
  specifically so text-extraction order can never interleave categories.
- One accent color (`#5b21b6`, violet) plus dark slate body text — keeps it readable if
  printed/scanned in grayscale.
- Keep content in sync with the portfolio site's About section (`src/app/components/About.tsx`)
  when any of the three changes — they should tell the same story about skills/experience.
- If page-fit breaks after an edit to `ResumeDocument.tsx`'s styles: react-pdf can push an
  entire `<View>` section to the next page rather than splitting it partway, so being "a
  little over budget" sometimes looks like a whole section vanishing to page 2, not a
  gentle overflow. Combine short trailing lines (e.g. CGPA onto the university line) before
  reaching for more aggressive font/spacing cuts.
