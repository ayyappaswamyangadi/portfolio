"use client";

import { useEffect, useState } from "react";

export const PWA_PROMPT_DISMISS_KEY = "pwa-install-dismissed-at";
export const PWA_PROMPT_DISMISSED_EVENT = "pwa-prompt-dismissed";

// The navbar's persistent Install button stays hidden until the user has
// seen — and dismissed or declined — the auto-shown install banner at least
// once; surfacing a second install affordance before the banner has run its
// course would just read as redundant/pushy. `localStorage` is
// the source of truth across reloads, but a `storage` event only fires in
// *other* tabs, not this one, so a same-tab custom event is what lets an
// already-mounted button react the instant the banner is dismissed.
export function usePwaPromptDismissed() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(PWA_PROMPT_DISMISS_KEY)) setDismissed(true);
    const handler = () => setDismissed(true);
    window.addEventListener(PWA_PROMPT_DISMISSED_EVENT, handler);
    return () => window.removeEventListener(PWA_PROMPT_DISMISSED_EVENT, handler);
  }, []);

  return dismissed;
}
