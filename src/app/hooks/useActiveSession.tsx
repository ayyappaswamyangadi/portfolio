import { useEffect, useRef, useState } from "react";

export function useActiveSession(sections: string[]) {
  const [activeScreen, setActiveScreen] = useState<string>(
    sections[0] ?? "home",
  );
  const visibleRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const pick = () => {
      if (visibleRef.current.size === 0) return;
      // Walk in document order; the last visible section wins
      // (i.e. the furthest-down section whose top has entered the viewport)
      let found = sections[0];
      for (const id of sections) {
        if (visibleRef.current.has(id)) found = id;
      }
      setActiveScreen(found);
    };

    // A section is "active" once its top edge has crossed into the upper 45 %
    // of the viewport. rootMargin shrinks the observation zone from the bottom
    // so only the top 45 % counts. threshold: 0 means "any pixel visible".
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleRef.current.add(entry.target.id);
          } else {
            visibleRef.current.delete(entry.target.id);
          }
        });
        pick();
      },
      { rootMargin: "0px 0px -55% 0px", threshold: 0 },
    );

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  return activeScreen;
}
