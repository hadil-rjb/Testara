"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Sparkles, ChevronDown } from "lucide-react";
import { useTheme } from "@/components/providers";

export default function Hero() {
  const t = useTranslations("hero");
  const { theme } = useTheme();

  return (
    <section className="overflow-hidden px-4 pb-20 pt-26 sm:px-6 lg:px-8">
      {/* ─────── BACKGROUND ANIMATION ─────── */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Blob 1 */}
        <motion.div
          className="absolute -top-40 left-[-10%] h-[420px] w-[320px] rounded-full bg-primary/30 blur-[130px]"
          animate={{
            y: [0, 50, 0],
            x: [0, 20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Blob 2 */}
        <motion.div
          className="absolute top-60 right-[-10%] h-[380px] w-[180px] rounded-full bg-blue-400/20 blur-[130px]"
          animate={{
            y: [0, -40, 0],
            x: [0, -25, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] [background-size:40px_40px]" />
      </div>

      <motion.div
        className="absolute inset-0 -z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <img
          src={theme === "dark" ? "/hero-bg-dark.png" : "/hero-bg.png"}
          alt="background"
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* ─────── CONTENT ─────── */}
      <div className="mx-auto max-w-7xl text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center bg-gradient-to-br from-primary/5 via-white/10 to-primary/10 shadow-sm gap-2 rounded-full border border-theme px-4 py-2 text-sm font-medium text-body backdrop-blur-md"
        >
          <Sparkles className="h-4 w-4 text-primary" />
          {t("badge")}
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto max-w-4xl font-heading text-4xl font-extrabold leading-tight tracking-tight text-heading sm:text-5xl lg:text-6xl"
        >
          {t("titleLine1")}{" "}
          <span className="bg-gradient-to-tr from-[#0D58C6] via-primary to-[#8BB7F7] bg-clip-text text-transparent">
            {t("titleLine2")}
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-body sm:text-lg"
        >
          {t("description")}
        </motion.p>

        {/* Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mx-auto mt-14 max-w-6xl"
        >
          <div
            className="p-[10px] rounded-3xl"
            style={{
              background: `linear-gradient(to bottom, rgba(101,76,222,0.12), rgba(178,166,239,0.25), var(--hero-gradient-end))`,
            }}
          >
            <div className="overflow-hidden rounded-2xl surface-card backdrop-blur-xl">
              {/* Top bar */}
              <div
                className="flex items-center gap-3 border-b border-theme px-6 py-3"
              >
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-red-400" />
                  <span className="h-3 w-3 rounded-full bg-yellow-400" />
                  <span className="h-3 w-3 rounded-full bg-green-400" />
                </div>

                <div className="flex-1 text-start rounded-md surface-secondary px-3 py-1 text-xs text-muted">
                  app.testara.io/dashboard
                </div>
              </div>

              {/* Content */}
              <div className="flex">
                <img src="/Demo.png" alt="background" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Scroll */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-10 flex justify-center"
        >
          <a href="#features">
            <ChevronDown className="h-6 w-6 animate-bounce text-muted" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
