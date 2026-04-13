"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { Menu, X, Sun, Moon, ChevronDown } from "lucide-react";
import { useTheme } from "@/components/providers";
import Image from "next/image";

export default function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close language dropdown on outside click
  useEffect(() => {
    if (!langOpen) return;
    const close = () => setLangOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [langOpen]);

  /**
   * Language switcher — uses router.replace with the locale option
   * from next-intl/navigation. pathname from usePathname() is already
   * locale-stripped, so this correctly swaps /fr/... ↔ /en/...
   */
  const switchLocale = (newLocale: "fr" | "en") => {
    router.replace(pathname, { locale: newLocale });
    setLangOpen(false);
    setMobileOpen(false);
  };

  const navLinks = [
    { label: t("features"), href: "#features" },
    { label: t("howItWorks"), href: "#process" },
    { label: t("testimonials"), href: "#testimonials" },
    { label: t("faq"), href: "#faq" },
  ];

  const logoIcon = (
    <div className="flex h-8 w-8 items-center justify-center rounded-lg">
      <Image
        src="/Logo.png"
        alt="Logo"
        width={30}
        height={30}
        className="object-contain"
      />
    </div>
  );

  /* ─── Shared right-side controls ─── */
  const rightControls = (
    <div className="flex items-center gap-2">
      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white transition-transform hover:scale-105"
        aria-label="Toggle theme"
      >
        {theme === "light" ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </button>

      {/* Language switch */}
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setLangOpen(!langOpen);
          }}
          className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-heading transition-colors hover:opacity-80"
        >
          {locale.toUpperCase()}
          <ChevronDown
            className={`h-3.5 w-3.5 text-muted transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`}
          />
        </button>
        {langOpen && (
          <div
            className="absolute right-0 top-full mt-1 w-28 overflow-hidden rounded-xl border border-theme surface-card py-1 shadow-lg z-50"
          >
            <button
              onClick={() => switchLocale("fr")}
              className={`flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors hover:surface-tertiary ${
                locale === "fr" ? "font-semibold text-primary" : "text-heading"
              }`}
            >
              Fran&ccedil;ais
            </button>
            <button
              onClick={() => switchLocale("en")}
              className={`flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors hover:surface-tertiary ${
                locale === "en" ? "font-semibold text-primary" : "text-heading"
              }`}
            >
              English
            </button>
          </div>
        )}
      </div>

      {/* Sign Up link */}
      <Link
        href="/auth/register"
        className="hidden text-sm font-medium text-heading transition-colors hover:text-primary lg:block"
      >
        {t("signUp")}
      </Link>

      {/* Login button */}
      <Link
        href="/auth/login"
        className="hidden items-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-dark hover:shadow-md lg:inline-flex"
      >
        {t("login")}
      </Link>
    </div>
  );

  /* ─── Desktop nav links with dividers ─── */
  const desktopLinks = (
    <div className="hidden items-center lg:flex">
      {navLinks.map((link, i) => (
        <div key={link.href} className="flex items-center">
          {i > 0 && (
            <div className="mx-1 h-4 w-px border-theme" style={{ backgroundColor: "var(--border-color)" }} />
          )}
          <a
            href={link.href}
            className="px-3 py-1.5 text-sm font-medium text-body transition-colors hover:text-primary"
          >
            {link.label}
          </a>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50">
        {/* ─────── FLOATING PILL NAVBAR (visible when NOT scrolled) ─────── */}
        <div
          className={`transition-all duration-500 ease-in-out ${
            scrolled
              ? "pointer-events-none -translate-y-2 opacity-0"
              : "pointer-events-auto translate-y-0 opacity-100"
          }`}
        >
          <div className="mx-auto max-w-5xl px-4 pt-8">
            <div
              className="flex items-center justify-between rounded-full border border-theme px-4 py-3 shadow-sm backdrop-blur-md"
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--bg-primary) 30%, transparent)",
              }}
            >
              {/* Logo */}
              <Link href="/" className="flex items-center gap-1">
                {logoIcon}
                <span className="text-xl font-light font-heading text-heading">
                  Testara
                </span>
              </Link>

              {/* Center links */}
              {desktopLinks}

              {/* Right controls */}
              <div className="hidden lg:flex">{rightControls}</div>

              {/* Mobile hamburger */}
              <button
                className="text-heading lg:hidden"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ─────── FULL-WIDTH NAVBAR (visible when scrolled) ─────── */}
        <div
          className={`absolute inset-x-0 top-0 transition-all duration-500 ease-in-out ${
            scrolled
              ? "pointer-events-auto translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-3 opacity-0"
          }`}
        >
          <div
            className="border-b border-theme backdrop-blur-md"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--bg-primary) 90%, transparent)",
            }}
          >
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 lg:px-8">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2.5">
                {logoIcon}
                <span className="text-xl font-bold font-heading text-heading">
                  Testara
                </span>
              </Link>

              {/* Center links */}
              {desktopLinks}

              {/* Right controls */}
              <div className="hidden lg:flex">{rightControls}</div>

              {/* Mobile hamburger */}
              <button
                className="text-heading lg:hidden"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ─────── MOBILE SLIDE-DOWN MENU ─────── */}
      <div
        className={`fixed inset-x-0 z-40 transition-all duration-300 ease-in-out lg:hidden ${
          mobileOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-4 opacity-0"
        }`}
        style={{ top: scrolled ? "60px" : "72px" }}
      >
        <div
          className="mx-4 rounded-2xl border border-theme p-5 shadow-xl backdrop-blur-md"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--card-bg) 95%, transparent)",
          }}
        >
          {/* NAV LINKS */}
          <div className="space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-xl px-4 py-3 text-sm font-medium text-body transition-colors hover:surface-tertiary"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* DIVIDER */}
          <div className="my-4 h-px" style={{ backgroundColor: "var(--border-color)" }} />

          {/* ─────── MOBILE CONTROLS ─────── */}
          <div className="flex flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between">
            {/* LEFT SIDE */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Theme */}
              <button
                onClick={toggleTheme}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white"
                aria-label="Toggle theme"
              >
                {theme === "light" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>

              {/* Lang switch */}
              <div className="flex items-center gap-1 rounded-lg border border-theme px-3 py-1.5">
                <button
                  onClick={() => switchLocale("fr")}
                  className={`text-sm font-medium ${
                    locale === "fr" ? "text-primary" : "text-muted"
                  }`}
                >
                  FR
                </button>
                <span className="text-xs text-muted">/</span>
                <button
                  onClick={() => switchLocale("en")}
                  className={`text-sm font-medium ${
                    locale === "en" ? "text-primary" : "text-muted"
                  }`}
                >
                  EN
                </button>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Link
                href="/auth/register"
                className="text-sm font-medium text-heading whitespace-nowrap"
                onClick={() => setMobileOpen(false)}
              >
                {t("signUp")}
              </Link>

              <Link
                href="/auth/login"
                className="rounded-full bg-primary px-4 sm:px-5 py-2 text-sm font-semibold text-white whitespace-nowrap"
                onClick={() => setMobileOpen(false)}
              >
                {t("login")}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer so hero content doesn't go behind the navbar */}
      <div className="h-[72px]" />
    </>
  );
}
