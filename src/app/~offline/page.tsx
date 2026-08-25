"use client";

import { WifiOff, RotateCw, Home as HomeIcon } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function OfflinePage() {
  const [retrying, setRetrying] = useState(false);

  const handleRetry = () => {
    setRetrying(true);
    window.location.href = "/";
  };

  return (
    <section className="min-h-[70vh] flex items-center justify-center px-6 py-24">
      <div className="glass-card rounded-2xl px-8 py-12 max-w-md w-full text-center">
        <div
          className="mx-auto mb-6 w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: "var(--btn-gradient)" }}
        >
          <WifiOff size={28} className="text-white" />
        </div>

        <h1 className="text-2xl font-bold mb-3 text-foreground">
          You&apos;re offline
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          This page hasn&apos;t been saved for offline viewing yet. Reconnect
          and try again — pages you&apos;ve already visited will keep working
          without a connection.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="btn-primary btn-click inline-flex items-center justify-center gap-2 px-6 py-3 text-sm"
          >
            <RotateCw size={15} className={retrying ? "animate-spin" : ""} />
            {retrying ? "Retrying…" : "Try again"}
          </button>
          <Link
            href="/"
            className="btn-click inline-flex items-center justify-center gap-2 px-6 py-3 text-sm rounded-md border border-border bg-card/70 hover:border-primary/40 hover:bg-accent/60 transition-colors text-foreground font-semibold"
          >
            <HomeIcon size={15} />
            Go home
          </Link>
        </div>
      </div>
    </section>
  );
}
