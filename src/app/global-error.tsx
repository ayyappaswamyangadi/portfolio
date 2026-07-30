"use client";

import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="page-state" style={{ minHeight: "100vh" }}>
          <h1 className="text-xl font-bold">Application error</h1>
          <p className="text-sm text-muted-foreground max-w-sm">
            Something broke at the top level. Please refresh, or try again.
          </p>
          <button
            onClick={reset}
            className="btn-orange btn-click mt-2 inline-flex items-center gap-2 px-5 py-2.5 text-sm"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
