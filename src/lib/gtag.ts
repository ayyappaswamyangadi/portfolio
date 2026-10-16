declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID;

// The only custom events the site sends. Each one is its own event name so it
// shows up as a plainly-named row with a count in GA → Reports → Engagement →
// Events — no custom dimensions needed to tell "Let's Connect" from "GitHub".
// Page views, visitors and countries are collected by GA automatically.
export type AnalyticsEvent =
  | "lets_connect_click" // "Let's Connect" button (hero / footer)
  | "hire_me_click" // "Hire me" button in the navbar
  | "download_cv" // "Download CV" button (hero / footer)
  | "contact_email_click" // "Email me" box in Contact
  | "contact_call_click" // "Call me" box in Contact
  | "contact_location_click" // "Location" box in Contact
  | "message_sent" // contact form sent successfully
  | "message_failed" // contact form send failed
  | "github_click" // GitHub icon (footer / side rail)
  | "linkedin_click" // LinkedIn icon (footer / side rail)
  | "email_icon_click" // mail icon (footer / side rail)
  | "project_link_click" // a project's live / store / repo link
  | "app_installed"; // visitor installed the site as an app

// `placement` says where on the page it was clicked (hero, footer, rail…);
// `project` names the project for project_link_click.
export type AnalyticsParams = { placement?: string; project?: string; link?: string };

export function gaEvent(name: AnalyticsEvent, params?: AnalyticsParams) {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== "function") return;
  window.gtag("event", name, params ?? {});
}
