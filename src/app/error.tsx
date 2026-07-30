"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";

export default function Error({
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
    <div className="page-state">
      <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
        <AlertTriangle size={26} />
      </div>
      <h1 className="text-xl font-bold">Something went wrong</h1>
      <p className="text-sm text-muted-foreground max-w-sm">
        This section hit an unexpected error — it might be a slow or dropped
        connection. You can try again, or refresh the page.
      </p>
      <button
        onClick={reset}
        className="btn-orange btn-click mt-2 inline-flex items-center gap-2 px-5 py-2.5 text-sm"
      >
        <RotateCw size={15} />
        Try again
      </button>
    </div>
  );
}
