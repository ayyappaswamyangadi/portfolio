"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";

const ThemeToggleButton = () => {
  const { theme, setTheme } = useTheme();
  const [mount, setMount] = useState(false);

  useEffect(() => {
    setMount(true);
  }, []);

  if (!mount) return null;

  return (
    <button
      className="p-1 rounded-lg border border-border hover:bg-accent transition cursor-pointer"
      aria-label="Toggle theme"
      onClick={() => (theme === "light" ? setTheme("dark") : setTheme("light"))}
    >
      {theme === "dark" ? <Sun /> : <Moon />}
    </button>
  );
};

export default ThemeToggleButton;
