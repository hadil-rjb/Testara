"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";

export default function Footer() {
  const t = useTranslations("footer");

  const links = [
    { label: t("features"), href: "#features" },
    { label: t("solutions"), href: "#" },
    { label: t("docs"), href: "#" },
    { label: t("pricing"), href: "#pricing" },
    { label: t("about"), href: "#" },
  ];

  return (
    <footer className="border-t border-theme px-4 py-12 sm:px-6 lg:px-8 surface-primary">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-between gap-8 sm:flex-row">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg">
              <Image
                src="/logo.png"
                alt="Logo"
                width={30}
                height={30}
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold font-heading text-heading">
              Testara
            </span>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-body transition-colors hover:text-primary"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Divider + copyright */}
        <div className="mt-8 border-t border-theme pt-8 text-center">
          <p className="text-sm text-muted">
            &copy; {new Date().getFullYear()} Testara. Tous droits
            r&eacute;serv&eacute;s.
          </p>
        </div>
      </div>
    </footer>
  );
}
