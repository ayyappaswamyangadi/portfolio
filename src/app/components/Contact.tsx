"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { motion, type Variants } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

// ─── Form schema ─────────────────────────────────────────────────────────────
const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email({ error: "Please enter a valid email" }),
  subject: z.string().min(4, "Subject must be at least 4 characters"),
  message: z.string().min(20, "Message must be at least 20 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

// ─── Contact info ─────────────────────────────────────────────────────────────
const contactInfo = [
  {
    icon: <Mail size={20} />,
    label: "Email me",
    value: "ayyappaswamy50@gmail.com",
    href: "mailto:ayyappaswamy50@gmail.com",
    desc: "I reply within 24 hours",
  },
  {
    icon: <Phone size={20} />,
    label: "Call me",
    value: "+91 87925 94229",
    href: "tel:+918792594229",
    desc: "Mon–Fri, 10am – 7pm IST",
  },
  {
    icon: <MapPin size={20} />,
    label: "Location",
    value: "Bengaluru, Karnataka, India",
    href: null,
    desc: "Open to remote opportunities",
  },
];

// ─── Quick social links ───────────────────────────────────────────────────────
// const quickSocials = [
//   {
//     icon: (
//       <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
//         <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
//       </svg>
//     ),
//     href: "https://github.com/ayyappaswamyangadi",
//     label: "GitHub",
//   },
//   {
//     icon: (
//       <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
//         <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
//       </svg>
//     ),
//     href: "https://linkedin.com/in/ayyappaswamyangadi",
//     label: "LinkedIn",
//   },
// ];

// ─── Motion variants ─────────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
};

// ─── Contact Section ──────────────────────────────────────────────────────────
export function Contact() {
  const [submitState, setSubmitState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setSubmitState("loading");
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key:
            process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? "YOUR_ACCESS_KEY_HERE",
          name: data.name,
          email: data.email,
          subject: data.subject,
          message: data.message,
          from_name: "Portfolio Contact Form",
        }),
      });
      const result = await response.json();
      if (result.success) {
        setSubmitState("success");
        reset();
        setTimeout(() => setSubmitState("idle"), 5000);
      } else {
        setSubmitState("error");
        setTimeout(() => setSubmitState("idle"), 4000);
      }
    } catch {
      setSubmitState("error");
      setTimeout(() => setSubmitState("idle"), 4000);
    }
  };

  return (
    <section id="contact" className="relative py-24 px-4 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 -left-20 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

      {/* Max-width constrained — no full-width stretch on large screens */}
      <div className="max-w-3xl mx-auto">
        {/* ── Header ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <p className="text-primary font-semibold text-sm tracking-widest uppercase mb-2">
            Get in touch
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold section-heading center mb-4">
            Let&apos;s Connect
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Have a project in mind, want to collaborate, or just say hello? My
            inbox is always open.
          </p>
        </motion.div>

        {/* ── Contact info row ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="grid sm:grid-cols-3 gap-4 mb-10"
        >
          {contactInfo.map((item) => (
            <div
              key={item.label}
              className="project-card p-5 flex flex-col items-center text-center gap-3 group hover:-translate-y-1 transition-transform duration-200"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:bg-primary/20 transition-colors">
                {item.icon}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">
                  {item.label}
                </p>
                {item.href ? (
                  <a
                    href={item.href}
                    className="text-sm font-semibold hover:text-primary transition-colors break-all"
                  >
                    {item.value}
                  </a>
                ) : (
                  <p className="text-sm font-semibold">{item.value}</p>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Message form card ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          viewport={{ once: true }}
        >
          <div className="project-card p-7 sm:p-9">
            {/* Form header */}
            <div className="flex items-center gap-3 mb-7">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-[#1a1000]"
                style={{
                  background:
                    "linear-gradient(180deg, #FFC25F 0%, #FF9E00 53.12%, #F99900 100%)",
                }}
              >
                <Send size={18} />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">
                  Send me a message
                </h3>
                <p className="text-xs text-muted-foreground">
                  I&apos;ll get back to you within 24 hours
                </p>
              </div>
            </div>

            {/* Success state */}
            {submitState === "success" && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 mb-6">
                <CheckCircle2 size={20} className="flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">
                    Message sent successfully!
                  </p>
                  <p className="text-xs opacity-80">
                    Thanks for reaching out. I&apos;ll reply soon.
                  </p>
                </div>
              </div>
            )}

            {/* Error state */}
            {submitState === "error" && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 mb-6">
                <AlertCircle size={20} className="flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Something went wrong</p>
                  <p className="text-xs opacity-80">
                    Please try again or email me directly.
                  </p>
                </div>
              </div>
            )}

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
              noValidate
            >
              {/* Name + Email row */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    htmlFor="name"
                  >
                    Your Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    className={`form-input ${errors.name ? "border-red-400 focus:border-red-400" : ""}`}
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    htmlFor="email"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    className={`form-input ${errors.email ? "border-red-400 focus:border-red-400" : ""}`}
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  htmlFor="subject"
                >
                  Subject
                </label>
                <input
                  id="subject"
                  type="text"
                  placeholder="Project enquiry / Collaboration / Just saying hi"
                  className={`form-input ${errors.subject ? "border-red-400 focus:border-red-400" : ""}`}
                  {...register("subject")}
                />
                {errors.subject && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.subject.message}
                  </p>
                )}
              </div>

              {/* Message */}
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  htmlFor="message"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  rows={5}
                  placeholder="Tell me about your project or what you have in mind..."
                  className={`form-input resize-none ${errors.message ? "border-red-400 focus:border-red-400" : ""}`}
                  {...register("message")}
                />
                {errors.message && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.message.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitState === "loading"}
                className="btn-orange btn-click w-full flex items-center justify-center gap-2 px-6 py-3.5 text-sm"
              >
                {submitState === "loading" ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Sending…
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Send Message
                  </>
                )}
              </button>

              <p className="text-xs text-center text-muted-foreground">
                Sent securely via{" "}
                <span className="text-primary font-medium">Web3Forms</span>. No
                spam, ever.
              </p>
            </form>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
}
