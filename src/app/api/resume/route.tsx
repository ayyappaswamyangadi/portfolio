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
// It does need help shipping pdfkit's font files to Vercel's Lambda,
// though — see the `outputFileTracingIncludes` entry in next.config.ts.
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
    // @react-pdf/renderer (and ResumeDocument, which imports it) is
    // imported *inside* this try, not at module top-level, as defense in
    // depth: a throw during that module's own evaluation — as opposed to a
    // throw from calling renderToBuffer() below — would otherwise happen
    // before this function, or its try/catch, ever runs.
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
    // Fall back to a plain-pdfkit renderer built from the same
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
      return NextResponse.json(
        {
          error:
            "Resume generation is temporarily unavailable. Please try again shortly.",
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
