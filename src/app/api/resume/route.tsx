import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import {
  REVISE_START,
  formatDuration,
  getTotalExperienceLabel,
} from "@/lib/experience";
import { ResumeDocument } from "./ResumeDocument";

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
  const buffer = await renderToBuffer(
    <ResumeDocument
      totalExperienceLabel={getTotalExperienceLabel()}
      reviseDurationLabel={formatDuration(REVISE_START)}
    />,
  );

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
