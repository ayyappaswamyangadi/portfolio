import type { AnalyticsEvent } from "@/lib/gtag";

// Plain-English names for every event the site sends (src/lib/gtag.ts).
// Typed as a full Record so adding an event there without a label here is a
// compile error.
export const EVENT_LABELS: Record<AnalyticsEvent, { label: string; hint: string }> = {
  lets_connect_click: { label: "Let's Connect", hint: "Button in the hero and the footer" },
  hire_me_click: { label: "Hire me", hint: "Button in the top navigation bar" },
  download_cv: { label: "Download CV", hint: "Button in the hero and the footer" },
  contact_email_click: { label: "Email me box", hint: "Contact section card" },
  contact_call_click: { label: "Call me box", hint: "Contact section card" },
  contact_location_click: { label: "Location box", hint: "Contact section card — opens maps" },
  message_sent: { label: "Message sent", hint: "Contact form delivered successfully" },
  message_failed: { label: "Message failed to send", hint: "Should stay at 0 — if not, the form is broken" },
  github_click: { label: "GitHub icon", hint: "Footer and the side rail on wide screens" },
  linkedin_click: { label: "LinkedIn icon", hint: "Footer and the side rail on wide screens" },
  email_icon_click: { label: "Mail icon", hint: "Footer and the side rail on wide screens" },
  project_link_click: { label: "Project links opened", hint: "Live site, App Store, Product Hunt or GitHub on a project card" },
  app_installed: { label: "Installed as an app", hint: "Added the site to their home screen" },
};

export const EVENT_GROUPS: { title: string; events: AnalyticsEvent[] }[] = [
  { title: "Interest in hiring you", events: ["lets_connect_click", "hire_me_click", "download_cv"] },
  {
    title: "Contact section",
    events: ["contact_email_click", "contact_call_click", "contact_location_click", "message_sent", "message_failed"],
  },
  { title: "Social icons", events: ["github_click", "linkedin_click", "email_icon_click"] },
  { title: "Projects & app", events: ["project_link_click", "app_installed"] },
];

export const TRACKED_EVENTS = Object.keys(EVENT_LABELS) as AnalyticsEvent[];

// The day these event names started being sent; before it, button counts are 0.
export const TRACKING_SINCE = "16 Oct 2026";

const CHANNELS: Record<string, string> = {
  Direct: "Direct — typed the link, a bookmark, or a chat app",
  "Organic Search": "Google or another search engine",
  "Organic Social": "Social media",
  Referral: "A link on another website",
  Email: "Email",
  "Paid Search": "Search ads",
  "Paid Social": "Social ads",
  Unassigned: "Unknown",
};

export function describeSource(source: string, channel: string) {
  const name =
    source === "(direct)"
      ? "Direct visit"
      : source === "(not set)"
        ? "Unknown"
        : source.replace(/^(www\.|l\.|lm\.|m\.)/, "");
  return { name, how: CHANNELS[channel] ?? channel };
}

export function describeDevice(device: string) {
  return { mobile: "Phone", desktop: "Computer", tablet: "Tablet" }[device] ?? device;
}

export function countryFlag(code: string) {
  if (!/^[A-Z]{2}$/.test(code)) return "🌐";
  return String.fromCodePoint(...[...code].map((c) => 0x1f1a5 + c.charCodeAt(0)));
}

export function formatDuration(totalSec: number) {
  const s = Math.round(totalSec);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}
