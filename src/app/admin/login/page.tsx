import { redirect } from "next/navigation";
import { Lock } from "lucide-react";
import { isAdmin, isAdminConfigured } from "@/lib/adminAuth";

const ERRORS: Record<string, string> = {
  wrong: "Wrong password.",
  locked: "Too many wrong attempts. Try again in 15 minutes.",
  setup: "Admin login isn't set up on this deployment yet.",
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await isAdmin()) redirect("/admin");
  const { error } = await searchParams;
  const message = (error && ERRORS[error]) || (!isAdminConfigured() ? ERRORS.setup : undefined);

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
        {message && (
          <p role="alert" className="text-sm text-red-500">
            {message}
          </p>
        )}
        <button type="submit" className="btn-primary btn-click w-full px-4 py-2 text-sm">
          Log in
        </button>
      </form>
    </div>
  );
}
