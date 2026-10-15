"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionValue, useSpring } from "framer-motion";

// Count-up animation for the stat tiles that never shows a wrong number to
// anyone who isn't watching it animate.
//
// The server HTML (and the first client render) carries the real `target`
// value. That matters because crawlers, link previews and AI page readers
// read the HTML without scrolling — the old version started at "0", so the
// live page literally said "0+ years experience" to all of them.
//
// The reset to 0 only happens once the tile is about to scroll into view
// (`prime`, 200px early so the swap is off-screen), and the count-up starts
// when it's actually half visible (`play`). Reduced-motion users just keep
// the final number.
export function useCountUp(target: number) {
  const ref = useRef<HTMLDivElement>(null);
  const count = useMotionValue(target);
  const spring = useSpring(count, { stiffness: 60, damping: 18 });
  const [value, setValue] = useState(String(target));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let primed = false;
    let played = false;

    // Both observers report on mount in no guaranteed order, so `play`
    // primes too rather than assuming `prime` already ran.
    const reset = () => {
      if (primed) return;
      primed = true;
      count.jump(0);
      spring.jump(0);
      setValue("0");
    };

    const prime = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        prime.disconnect();
        if (!played) reset();
      },
      { rootMargin: "0px 0px 200px 0px" },
    );

    const play = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || played) return;
        played = true;
        play.disconnect();
        reset();
        count.set(target);
      },
      { threshold: 0.5 },
    );

    prime.observe(el);
    play.observe(el);
    return () => {
      prime.disconnect();
      play.disconnect();
    };
  }, [count, spring, target]);

  useEffect(
    () => spring.on("change", (v) => setValue(Math.round(v).toString())),
    [spring],
  );

  return { ref, value };
}
