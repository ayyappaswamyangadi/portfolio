import PDFDocument from "pdfkit";
import {
  RESUME_CONTACT,
  RESUME_SKILLS,
  RESUME_EXPERIENCE,
  RESUME_PROJECTS,
  RESUME_EDUCATION,
} from "@/lib/resumeContent";

// Plain-pdfkit fallback for /api/resume's GET handler, used if the primary
// @react-pdf/renderer path throws for any reason. It still depends on the
// same underlying "pdfkit" package (see the `outputFileTracingIncludes`
// entry in next.config.ts that both renderers need to run at all on
// Vercel — pdfkit resolves its base-14 font files through a package.json
// subpath-imports alias that Vercel's build-time file tracer doesn't
// follow), so it isn't a hedge against that specific class of failure —
// it's just a much smaller, simpler code path than @react-pdf/renderer's
// full React-reconciler-plus-flexbox-layout engine, so there's less
// surface area for something else to go wrong on. Content is pulled from
// the same resumeContent.ts as the primary renderer, and the experience
// labels are passed in computed fresh per request, so even a recruiter who
// hits this fallback path still gets accurate current-month numbers rather
// than a frozen static file.
//
// Layout is intentionally simpler than ResumeDocument.tsx (single-column
// header instead of a two-column name/contact split, plain sequential text
// instead of flexbox rows) — pdfkit lays text out as a linear cursor, and
// replicating flexbox-style two-column rows by hand is exactly the kind of
// fragile positioning code this fallback is trying to avoid depending on.

const ACCENT = "#5b21b6";
const INK = "#1f2937";
const MUTED = "#4b5563";
const RULE = "#ddd6fe";

const MARGIN = 42;
const PAGE_WIDTH = 595.28; // A4, points
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

type Segment = { text: string; bold?: boolean };

function paragraph(doc: PDFKit.PDFDocument, segments: Segment[]) {
  doc.fontSize(10.2).fillColor(INK);
  segments.forEach((seg, i) => {
    doc.font(seg.bold ? "Helvetica-Bold" : "Helvetica");
    doc.text(seg.text, { continued: i < segments.length - 1 });
  });
}

function heading(doc: PDFKit.PDFDocument, label: string) {
  doc.moveDown(0.6);
  doc.fontSize(10.2).font("Helvetica-Bold").fillColor(ACCENT);
  doc.text(label.toUpperCase(), { characterSpacing: 1.2 });
  const y = doc.y + 2;
  doc
    .moveTo(MARGIN, y)
    .lineTo(MARGIN + CONTENT_WIDTH, y)
    .strokeColor(RULE)
    .lineWidth(1)
    .stroke();
  doc.moveDown(0.5);
  doc.fillColor(INK);
}

function bullet(doc: PDFKit.PDFDocument, text: string) {
  const x = MARGIN + 10;
  const width = CONTENT_WIDTH - 10;
  // Bullet glyph is part of the same text() call as the body so wrapped
  // lines share its x/width — that's what keeps them hanging-indented
  // under the first line instead of back at the page margin.
  doc.fontSize(10.2).font("Helvetica").fillColor(INK);
  doc.text(`•  ${text}`, x, doc.y, { width });
  doc.moveDown(0.15);
}

export function renderFallbackPdf({
  totalExperienceLabel,
  reviseDurationLabel,
}: {
  totalExperienceLabel: string;
  reviseDurationLabel: string;
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 34, bottom: 34, left: MARGIN, right: MARGIN },
      info: {
        Title: "Ayyappa Swamy Angadi — Resume",
        Author: RESUME_CONTACT.name,
      },
      bufferPages: true,
      // This path only runs when the primary renderer already failed
      // unexpectedly (see route.tsx's catch block) — leaving content
      // streams uncompressed keeps the output byte-grep-able for whoever's
      // debugging the fallback later, at the cost of a few extra KB on a
      // single-page PDF.
      compress: false,
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // ── Header ──
    doc.fontSize(20).font("Helvetica-Bold").fillColor(INK);
    doc.text(RESUME_CONTACT.name);
    doc.fontSize(11.5).font("Helvetica-Bold").fillColor(ACCENT);
    doc.text(RESUME_CONTACT.title);

    doc.moveDown(0.4);
    doc.fontSize(9).font("Helvetica").fillColor(MUTED);
    doc.text(
      `${RESUME_CONTACT.location}  ·  ${RESUME_CONTACT.phone}  ·  ${RESUME_CONTACT.email}`,
    );

    doc.fontSize(9).font("Helvetica-Bold").fillColor(ACCENT);
    doc.text("Portfolio", { continued: true, link: RESUME_CONTACT.portfolio });
    doc.fillColor(MUTED).font("Helvetica").text("  |  ", { continued: true });
    doc
      .fillColor(ACCENT)
      .font("Helvetica-Bold")
      .text("LinkedIn", { continued: true, link: RESUME_CONTACT.linkedin });
    doc.fillColor(MUTED).font("Helvetica").text("  |  ", { continued: true });
    doc
      .fillColor(ACCENT)
      .font("Helvetica-Bold")
      .text("GitHub", { link: RESUME_CONTACT.github });

    doc.moveDown(0.3);
    const ruleY = doc.y;
    doc
      .moveTo(MARGIN, ruleY)
      .lineTo(MARGIN + CONTENT_WIDTH, ruleY)
      .strokeColor(ACCENT)
      .lineWidth(2)
      .stroke();
    doc.moveDown(0.6);
    doc.fillColor(INK);

    // ── Professional Summary ──
    heading(doc, "Professional Summary");
    paragraph(doc, [
      { text: "Frontend Engineer with " },
      { text: `${totalExperienceLabel} of web development experience`, bold: true },
      { text: ", including " },
      {
        text: `${reviseDurationLabel} building production React.js and Next.js applications`,
        bold: true,
      },
      {
        text: " — from real-time trading platforms and enterprise dashboards to AI-driven tools. Since ",
      },
      { text: "April 2026", bold: true },
      { text: ", integrates " },
      { text: "Claude Code", bold: true },
      {
        text: " into a daily AI-augmented development workflow, directing agentic pair-programming for scaffolding, refactors, and tests while owning every architecture and code-quality decision. Delivers production-grade features within fully remote, cross-functional Agile teams.",
      },
    ]);

    // ── Technical Skills ──
    heading(doc, "Technical Skills");
    RESUME_SKILLS.forEach((s) => {
      doc.fontSize(10.2).font("Helvetica-Bold").fillColor(INK);
      doc.text(`${s.label}: `, { continued: true });
      doc.font("Helvetica").text(s.items);
      doc.moveDown(0.15);
    });

    // ── Professional Experience ──
    heading(doc, "Professional Experience");
    RESUME_EXPERIENCE.forEach((job, i) => {
      if (i > 0) doc.moveDown(0.3);
      doc.fontSize(10.4).font("Helvetica-Bold").fillColor(INK);
      doc.text(`${job.role}   `, { continued: true });
      doc.fontSize(9).font("Helvetica-Bold").fillColor(ACCENT);
      doc.text(job.dateLabel);
      doc.fontSize(9.4).font("Helvetica-Oblique").fillColor(MUTED);
      doc.text(job.org);
      doc.moveDown(0.15);
      job.bullets.forEach((b) => bullet(doc, b));
    });

    // ── Projects ──
    heading(doc, "Projects");
    RESUME_PROJECTS.forEach((p) => {
      doc.fontSize(10.2).font("Helvetica-Bold").fillColor(INK);
      doc.text(`${p.name} — `, { continued: true });
      doc.font("Helvetica-Oblique").fillColor("#6b7280").fontSize(9.1);
      doc.text(`${p.tech} `, { continued: true });
      doc.font("Helvetica").fillColor(INK).fontSize(10.2);
      doc.text(p.desc);
      doc.moveDown(0.2);
    });

    // ── Education ──
    heading(doc, "Education");
    doc.fontSize(10.2).font("Helvetica-Bold").fillColor(INK);
    doc.text(RESUME_EDUCATION.degree);
    doc.fontSize(9.5).font("Helvetica").fillColor(MUTED);
    doc.text(`${RESUME_EDUCATION.school} · ${RESUME_EDUCATION.cgpa}`);

    doc.end();
  });
}
