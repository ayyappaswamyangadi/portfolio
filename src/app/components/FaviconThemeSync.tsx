"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

/**
 * There is only one favicon file on disk (src/app/icon.svg — static navy
 * bg, used as the pre-JS/no-JS fallback; it matches the site's
 * defaultTheme="dark" and has no prefers-color-scheme swap of its own).
 * That file can't see which theme the user actually *selected* in-app
 * (next-themes' resolvedTheme, stored in localStorage) — a linked favicon
 * resource has no access to the parent document's DOM/class or storage.
 *
 * So instead of shipping a second static file and swapping <link href>
 * between two URLs, this redraws the one icon on a canvas whenever
 * resolvedTheme changes, using the same colors/geometry as icon.svg
 * (globals.css's page-background gradient + --btn-gradient ring), and
 * repoints the existing <link rel="icon"> at the resulting data URL.
 */

const SIZE = 128;

const THEME_COLORS = {
  dark: { bgTop: "#0F1B2E", bgBottom: "#060D18", ring1: "#EAA22F", ring2: "#FFD28A" },
  light: { bgTop: "#D8B6FF", bgBottom: "#F4F5F6", ring1: "#A86BEB", ring2: "#7800FF" },
} as const;

export function FaviconThemeSync() {
  const { resolvedTheme } = useTheme();
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new window.Image();
    img.src = "/assets/images/avatar-headshot-icon.jpg";
    imgRef.current = img;
  }, []);

  useEffect(() => {
    if (!resolvedTheme) return;
    const colors = resolvedTheme === "light" ? THEME_COLORS.light : THEME_COLORS.dark;

    const draw = () => {
      const canvas = document.createElement("canvas");
      canvas.width = SIZE;
      canvas.height = SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Rounded-square background — the page-background gradient for the
      // active theme (same stops as .dark body{} / body{} in globals.css).
      const bg = ctx.createLinearGradient(0, 0, 0, SIZE);
      bg.addColorStop(0, colors.bgTop);
      bg.addColorStop(1, colors.bgBottom);
      ctx.fillStyle = bg;
      ctx.beginPath();
      const radius = SIZE * 0.1875;
      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(0, 0, SIZE, SIZE, radius);
      } else {
        ctx.rect(0, 0, SIZE, SIZE);
      }
      ctx.fill();

      const cx = SIZE / 2;
      const cy = SIZE / 2;

      // Accent ring — the theme's --btn-gradient.
      const ring = ctx.createLinearGradient(0, 0, SIZE, SIZE);
      ring.addColorStop(0, colors.ring1);
      ring.addColorStop(1, colors.ring2);
      ctx.strokeStyle = ring;
      // 5.5% of canvas, not the original 2% — a stroke that thin anti-aliases
      // away to gray noise once this gets drawn at real favicon sizes (16-32px).
      ctx.lineWidth = SIZE * 0.0547;
      ctx.beginPath();
      ctx.arc(cx, cy, SIZE * 0.4375, 0, Math.PI * 2);
      ctx.stroke();

      // Profile photo, clipped to a circle.
      const photoR = SIZE * 0.4219;
      const img = imgRef.current;
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, photoR, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, cx - photoR, cy - photoR, photoR * 2, photoR * 2);
        ctx.restore();
      }

      const link = document.querySelector<HTMLLinkElement>(
        'link[rel="icon"][type="image/svg+xml"]',
      );
      if (link) {
        link.type = "image/png";
        link.href = canvas.toDataURL("image/png");
      }
    };

    const img = imgRef.current;
    if (img && img.complete) {
      draw();
    } else if (img) {
      img.onload = draw;
    }
  }, [resolvedTheme]);

  return null;
}
