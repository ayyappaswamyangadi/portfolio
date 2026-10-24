import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_COOKIE,
  SESSION_MAX_AGE_S,
  checkPassword,
  claimTotpStep,
  createSessionToken,
  isAdminConfigured,
  isLockoutStoreConfigured,
  matchTotp,
  reserveAttempt,
  resetAttempts,
} from "@/lib/adminAuth";

// A plain form POST + 303 redirect (rather than a server action) so login is a
// full page navigation: the PWA's front-end-nav cache only hooks client-side
// router navigations, and the dashboard must never land in it.
function redirectTo(req: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, req.url), 303);
}

export async function POST(req: NextRequest) {
  if (!isAdminConfigured() || !isLockoutStoreConfigured()) {
    return redirectTo(req, "/admin/login?error=setup");
  }

  let allowed: boolean;
  try {
    allowed = await reserveAttempt();
  } catch {
    return redirectTo(req, "/admin/login?error=unavailable");
  }
  if (!allowed) return redirectTo(req, "/admin/login?error=locked");

  const form = await req.formData();
  const password = String(form.get("password") ?? "");
  const code = String(form.get("code") ?? "");

  const passwordOk = await checkPassword(password);
  const step = matchTotp(code);
  let ok = passwordOk && step !== null;
  if (ok) {
    try {
      ok = await claimTotpStep(step!);
    } catch {
      return redirectTo(req, "/admin/login?error=unavailable");
    }
  }

  if (!ok) {
    await new Promise((r) => setTimeout(r, 800));
    return redirectTo(req, "/admin/login?error=wrong");
  }

  await resetAttempts().catch(() => {});
  const res = redirectTo(req, "/admin");
  res.cookies.set(ADMIN_COOKIE, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_MAX_AGE_S,
  });
  return res;
}
