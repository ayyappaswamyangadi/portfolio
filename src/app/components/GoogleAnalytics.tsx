import Script from "next/script";
import { GA_MEASUREMENT_ID } from "@/lib/gtag";

export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          // Set by the /admin dashboard so the owner's own visits aren't counted.
          try {
            if (localStorage.getItem('ga_optout') === '1') window['ga-disable-${GA_MEASUREMENT_ID}'] = true;
          } catch (e) {}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
          window.gtag = gtag;
        `}
      </Script>
    </>
  );
}
