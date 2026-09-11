import { NextResponse } from "next/server";
import {
  REVISE_START,
  formatDuration,
  getTotalExperienceLabel,
} from "@/lib/experience";
import { renderFallbackPdf } from "./renderFallbackPdf";

// @react-pdf/renderer uses pdfkit under the hood — pure Node.js, no headless
// browser — so this runs fine as a normal serverless function (unlike a
// Puppeteer/Chromium approach, which needs a special buildpack on Vercel).
export const runtime = "nodejs";
// Force this to run fresh on every request rather than being statically
// optimized/cached at build time — the whole point is that the experience
// duration in the PDF reflects the current month, not whenever this route
// was last built or first hit.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const totalExperienceLabel = getTotalExperienceLabel();
  const reviseDurationLabel = formatDuration(REVISE_START);

  let buffer: Buffer;
  try {
    // @react-pdf/renderer (and ResumeDocument, which imports it) must be
    // imported *inside* this try, not at module top-level. yoga-layout — a
    // @react-pdf/renderer dependency — runs a top-level `await loadYoga()`
    // that instantiates a WASM module as soon as the module is evaluated,
    // and that instantiation has been observed to throw in Vercel's
    // serverless runtime (see https://github.com/diegomura/react-pdf/issues/2589)
    // even though an identical build works fine locally under `next start`.
    // A static top-level import means that throw happens while Next.js is
    // loading the route module itself — before this function, or its
    // try/catch, ever runs — which crashes the whole invocation with an
    // empty response and no way to catch it. A dynamic import here defers
    // that module evaluation (and any throw it causes) until it's actually
    // inside this try block.
    const [{ renderToBuffer }, { ResumeDocument }] = await Promise.all([
      import("@react-pdf/renderer"),
      import("./ResumeDocument"),
    ]);
    buffer = await renderToBuffer(
      <ResumeDocument
        totalExperienceLabel={totalExperienceLabel}
        reviseDurationLabel={reviseDurationLabel}
      />,
    );
  } catch (primaryError) {
    // Fall back to a plain-pdfkit renderer that never imports
    // @react-pdf/renderer/yoga-layout at all, built from the same
    // live-computed labels, so the download still reflects the current
    // month instead of a frozen snapshot.
    console.error(
      "[/api/resume] @react-pdf/renderer failed, using plain-pdfkit fallback:",
      primaryError,
    );
    try {
      buffer = await renderFallbackPdf({ totalExperienceLabel, reviseDurationLabel });
    } catch (fallbackError) {
      // Both renderers failed. A client that just fired-and-forgot a
      // `<a download>` click would have no way to tell this apart from a
      // real PDF and would save it as one — the exact 0-byte-file-Safari-
      // can't-open failure mode this whole route has been fighting. Return
      // a real error response instead; DownloadCvButton.tsx checks
      // response.ok before ever writing a file to disk.
      console.error(
        "[/api/resume] plain-pdfkit fallback also failed:",
        fallbackError,
      );
      // TEMPORARY diagnostic: surface both real error messages in the
      // response body itself. Vercel's dashboard function logs aren't
      // reachable from here, and blindly guessing at fixes without seeing
      // the actual crash has already cost multiple failed production
      // deploys. Remove this once the real cause is identified and fixed.
      return NextResponse.json(
        {
          error:
            "Resume generation is temporarily unavailable. Please try again shortly.",
          debug: {
            primary:
              primaryError instanceof Error
                ? { message: primaryError.message, stack: primaryError.stack }
                : String(primaryError),
            fallback:
              fallbackError instanceof Error
                ? { message: fallbackError.message, stack: fallbackError.stack }
                : String(fallbackError),
          },
        },
        { status: 500 },
      );
    }
  }

  // Buffer's TS type isn't structurally assignable to BodyInit in every
  // toolchain's DOM lib version — a plain Uint8Array always is.
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition":
        'attachment; filename="Ayyappa_Swamy_Angadi_Resume.pdf"',
      "Cache-Control": "no-store",
    },
  });
}
