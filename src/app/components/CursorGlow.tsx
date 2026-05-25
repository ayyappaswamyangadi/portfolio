"use client";

import { useEffect, useRef } from "react";

/**
 * A large radial gradient disc that follows the mouse cursor,
 * creating a subtle spotlight / depth effect on the page.
 * Invisible on touch devices.
 */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      el.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      el.style.opacity = "1";
    };
    const onLeave = () => { el.style.opacity = "0"; };
    const onEnter = () => { el.style.opacity = "1"; };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeEventListener("mouseenter", onEnter);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none hidden md:block"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 0,
        width: 700,
        height: 700,
        borderRadius: "50%",
        opacity: 0,
        background:
          "radial-gradient(circle, var(--spotlight-color) 0%, transparent 68%)",
        transition: "opacity 0.4s ease",
        willChange: "transform",
      }}
    />
  );
}
