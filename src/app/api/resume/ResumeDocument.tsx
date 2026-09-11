import {
  Document,
  Page,
  View,
  Text,
  Link,
  StyleSheet,
} from "@react-pdf/renderer";
import type { ReactNode } from "react";
import {
  RESUME_CONTACT,
  RESUME_SKILLS,
  RESUME_EXPERIENCE,
  RESUME_PROJECTS,
  RESUME_EDUCATION,
} from "@/lib/resumeContent";

// Standard PDF base-14 fonts (Helvetica family) — always available without
// Font.register, and reliably parsed by ATS software since there's no
// embedded/custom font to fail to extract.
const ACCENT = "#5b21b6";

const styles = StyleSheet.create({
  page: {
    paddingTop: 15,
    paddingBottom: 15,
    paddingHorizontal: 42,
    fontFamily: "Helvetica",
    fontSize: 10.2,
    color: "#1f2937",
    lineHeight: 1.3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 2.5,
    borderBottomColor: ACCENT,
    paddingBottom: 7,
    marginBottom: 9,
  },
  name: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
    color: "#1f2937",
    marginBottom: 14,
  },
  title: {
    fontSize: 11.5,
    fontFamily: "Helvetica-Bold",
    color: ACCENT,
  },
  contact: {
    textAlign: "right",
    fontSize: 9,
    color: "#4b5563",
    lineHeight: 1.35,
  },
  // Explicit per-line gap on top of contact's own lineHeight — asked for
  // separately from the general body-spacing pass below.
  contactLine: { marginBottom: 3 },
  link: { color: ACCENT, fontFamily: "Helvetica-Bold", textDecoration: "none" },
  section: { marginBottom: 7 },
  h2: {
    fontSize: 10.2,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: ACCENT,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd6fe",
    paddingBottom: 3,
    marginBottom: 5,
  },
  bold: { fontFamily: "Helvetica-Bold", color: "#1f2937" },
  skillLine: { marginBottom: 3 },
  entry: { marginBottom: 6 },
  entryHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  role: { fontFamily: "Helvetica-Bold", fontSize: 10.4 },
  dates: { fontSize: 9, fontFamily: "Helvetica-Bold", color: ACCENT },
  org: {
    fontFamily: "Helvetica-Oblique",
    color: "#4b5563",
    fontSize: 9.4,
    marginBottom: 3,
  },
  bulletRow: { flexDirection: "row", marginBottom: 2 },
  bulletDot: { width: 10, color: ACCENT },
  bulletText: { flex: 1 },
  projLine: { marginBottom: 4 },
  projHead: { fontFamily: "Helvetica-Bold" },
  projTech: {
    fontFamily: "Helvetica-Oblique",
    color: "#6b7280",
    fontSize: 9.1,
  },
  eduDegree: { fontFamily: "Helvetica-Bold" },
  eduSchool: { color: "#4b5563", fontSize: 9.5 },
});

function Bullet({ children }: { children: ReactNode }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bulletDot}>•</Text>
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );
}

export function ResumeDocument({
  totalExperienceLabel,
  reviseDurationLabel,
}: {
  totalExperienceLabel: string;
  reviseDurationLabel: string;
}) {
  return (
    <Document title="Ayyappa — Resume" author={RESUME_CONTACT.name}>
      <Page size="A4" style={styles.page}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.name}>{RESUME_CONTACT.name}</Text>
            <Text style={styles.title}>{RESUME_CONTACT.title}</Text>
          </View>
          <View style={styles.contact}>
            <Text style={styles.contactLine}>{RESUME_CONTACT.location}</Text>
            <Text style={styles.contactLine}>
              {RESUME_CONTACT.phone} · {RESUME_CONTACT.email}
            </Text>
            <Text style={styles.contactLine}>
              <Link src={RESUME_CONTACT.portfolio} style={styles.link}>
                Portfolio
              </Link>
              {"  |  "}
              <Link src={RESUME_CONTACT.linkedin} style={styles.link}>
                LinkedIn
              </Link>
              {"  |  "}
              <Link src={RESUME_CONTACT.github} style={styles.link}>
                GitHub
              </Link>
            </Text>
          </View>
        </View>

        {/* ── Professional Summary ── */}
        <View style={styles.section}>
          <Text style={styles.h2}>Professional Summary</Text>
          <Text>
            Frontend Engineer with{" "}
            <Text style={styles.bold}>
              {totalExperienceLabel} of web development experience
            </Text>
            , including{" "}
            <Text style={styles.bold}>
              {reviseDurationLabel} building production React.js and Next.js
              applications
            </Text>{" "}
            — from real-time trading platforms and enterprise dashboards to
            AI-driven tools. Since <Text style={styles.bold}>April 2026</Text>,
            integrates <Text style={styles.bold}>Claude Code</Text> into a daily
            AI-augmented development workflow, directing agentic
            pair-programming for scaffolding, refactors, and tests while owning
            every architecture and code-quality decision. Delivers
            production-grade features within fully remote, cross-functional
            Agile teams.
          </Text>
        </View>

        {/* ── Technical Skills (one category per line — ATS-safe reading order) ── */}
        <View style={styles.section}>
          <Text style={styles.h2}>Technical Skills</Text>
          {RESUME_SKILLS.map((s) => (
            <Text key={s.label} style={styles.skillLine}>
              <Text style={styles.bold}>{s.label}:</Text> {s.items}
            </Text>
          ))}
        </View>

        {/* ── Professional Experience ── */}
        <View style={styles.section}>
          <Text style={styles.h2}>Professional Experience</Text>
          {RESUME_EXPERIENCE.map((job) => (
            <View key={job.org} style={styles.entry}>
              <View style={styles.entryHead}>
                <Text style={styles.role}>{job.role}</Text>
                <Text style={styles.dates}>{job.dateLabel}</Text>
              </View>
              <Text style={styles.org}>{job.org}</Text>
              {job.bullets.map((b) => (
                <Bullet key={b}>{b}</Bullet>
              ))}
            </View>
          ))}
        </View>

        {/* ── Projects ── */}
        <View style={styles.section}>
          <Text style={styles.h2}>Projects</Text>
          {RESUME_PROJECTS.map((p) => (
            <Text key={p.name} style={styles.projLine}>
              <Text style={styles.projHead}>{p.name}</Text> —{" "}
              <Text style={styles.projTech}>{p.tech}</Text> {p.desc}
            </Text>
          ))}
        </View>

        {/* ── Education ── */}
        <View style={styles.section}>
          <Text style={styles.h2}>Education</Text>
          <Text style={styles.eduDegree}>{RESUME_EDUCATION.degree}</Text>
          <Text style={styles.eduSchool}>
            {RESUME_EDUCATION.school} · {RESUME_EDUCATION.cgpa}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
