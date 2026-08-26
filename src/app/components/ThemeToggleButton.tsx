"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";
import { gaEvent } from "@/lib/gtag";

const ThemeToggleButton = () => {
  const { theme, setTheme } = useTheme();
  const [mount, setMount] = useState(false);

  useEffect(() => {
    setMount(true);
  }, []);

  if (!mount) return null;

  const handleToggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    gaEvent({ action: "toggle_theme", category: "engagement", label: next });
  };

  return (
    <button
      className="p-1 rounded-lg border border-border hover:bg-accent transition cursor-pointer"
      aria-label="Toggle theme"
      onClick={handleToggle}
    >
      {theme === "dark" ? <Sun /> : <Moon />}
    </button>
  );
};

export default ThemeToggleButton;
