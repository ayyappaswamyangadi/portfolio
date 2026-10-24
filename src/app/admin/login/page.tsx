import { redirect } from "next/navigation";
import { Lock } from "lucide-react";
import { MAX_ATTEMPTS, failedAttempts, isAdmin, isAdminConfigured, isLockoutStoreConfigured } from "@/lib/adminAuth";

const LOCKED =
  "Login is locked after too many wrong attempts. The site owner has to set a new admin password to unlock it.";

const ERRORS: Record<string, string> = {
  wrong: "Wrong password or code.",
  locked: LOCKED,
  setup: "Admin login isn't set up on this deployment yet.",
  unavailable: "Login is temporarily unavailable. Try again shortly.",
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await isAdmin()) redirect("/admin");
  const { error } = await searchParams;
  const configured = isAdminConfigured() && isLockoutStoreConfigured();
  const used = configured ? await failedAttempts().catch(() => 0) : 0;
  const locked = used >= MAX_ATTEMPTS;
  const left = MAX_ATTEMPTS - used;

  let message = (error && ERRORS[error]) || (!configured ? ERRORS.setup : undefined);
  if (locked) message = LOCKED;
  else if (error === "wrong") message = `Wrong password or code. ${left} attempt${left === 1 ? "" : "s"} left before login locks.`;

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <form action="/api/admin/login" method="post" className="glass-card w-full max-w-sm space-y-4 rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Lock size={18} aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Admin</h1>
            <p className="text-xs text-muted-foreground">Site analytics dashboard</p>
          </div>
        </div>
        {!locked && (
          <label className="block text-sm font-medium">
            Password
            <input
              type="password"
              name="password"
              required
              autoFocus
              autoComplete="current-password"
              className="mt-1 w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-base outline-none focus:border-primary"
            />
          </label>
        )}
        {!locked && (
          <label className="block text-sm font-medium">
            Authenticator code
            <input
              type="text"
              name="code"
              required
              inputMode="numeric"
              pattern="[0-9 ]{6,7}"
              maxLength={7}
              autoComplete="one-time-code"
              placeholder="6-digit code from your app"
              className="mt-1 w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-base tracking-widest outline-none focus:border-primary"
            />
          </label>
        )}
        {message && (
          <p role="alert" className="text-sm text-red-500">
            {message}
          </p>
        )}
        {!locked && (
          <button type="submit" className="btn-primary btn-click w-full px-4 py-2 text-sm">
            Log in
          </button>
        )}
      </form>
    </div>
  );
}
