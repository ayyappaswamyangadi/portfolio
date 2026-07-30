export default function Loading() {
  return (
    <div className="page-state" role="status" aria-live="polite">
      <div className="page-state-spinner animate-spin" />
      <p className="text-sm text-muted-foreground">Loading…</p>
    </div>
  );
}
