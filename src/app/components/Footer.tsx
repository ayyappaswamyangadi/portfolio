"use client";

import { motion } from "framer-motion";

const socials = [
  {
    label: "GitHub",
    href: "https://github.com/ayyappaswamyangadi",
    cls: "icon-github",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/ayyappaswamyangadi",
    cls: "icon-linkedin",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },

  {
    label: "Email",
    href: "mailto:ayyappaswamy50@gmail.com",
    cls: "icon-mail",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
  },
];

export function Footer() {
  return (
    <footer className="relative border-t border-white/30 dark:border-white/10 bg-white/50 dark:bg-[#151E2B]/60 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true, margin: "-40px" }}
        className="max-w-5xl mx-auto px-5 py-6"
      >
        {/* ── Single main row: Logo | Socials (flex) | CTA ── */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-0">
          {/* Logo + name */}
          <div className="flex items-center gap-2 mr-auto">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center gap-px select-none">
              <span className="text-white/60 font-mono font-bold text-[6px] leading-none">
                &lt;
              </span>
              <span className="text-white font-bold text-[13px] leading-none tracking-tight">
                A
              </span>
              <span className="text-white/60 font-mono font-bold text-[6px] leading-none">
                /&gt;
              </span>
            </div>
            <span className="font-bold text-sm">Ayyappa</span>
          </div>

          {/* Social icons — horizontal flex */}
          <div className="flex items-center gap-2 mx-4">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target={s.href.startsWith("http") ? "_blank" : undefined}
                rel={
                  s.href.startsWith("http") ? "noopener noreferrer" : undefined
                }
                aria-label={s.label}
                title={s.label}
                className={`btn-click ${s.cls} w-8 h-8 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-accent transition-all duration-200`}
              >
                {s.icon}
              </a>
            ))}
          </div>

          {/* CTA */}
          <a
            href="#contact"
            className="btn-orange btn-click inline-flex items-center gap-1.5 text-sm px-4 py-2"
          >
            Let&apos;s Connect
          </a>
        </div>

        {/* ── Bottom bar ── */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-1 pt-4 mt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Ayyappa. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with <span className="text-primary font-medium">Next.js</span>{" "}
            & <span className="text-primary font-medium">Tailwind CSS</span>
          </p>
        </div>
      </motion.div>
    </footer>
  );
}
