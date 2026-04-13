"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/auth-store";
import { useTheme } from "@/components/providers";
import { useRouter } from "@/i18n/routing";
import { Search, Bell, Sun, Moon, LogOut } from "lucide-react";

export default function TopBar() {
  const tc = useTranslations("common");
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 border-b border-theme"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      {/* Search */}
      <div className="flex-1 max-w-lg ml-10 lg:ml-0">
        <div className="group flex items-center gap-2.5 rounded-xl px-4 py-2.5 border border-theme surface-input transition-all duration-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
          <Search
            size={18}
            className="text-muted transition-colors group-focus-within:text-primary"
          />
          <input
            type="text"
            placeholder={tc("search")}
            className="flex-1 bg-transparent text-sm outline-none text-heading"
          />
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 relative">
        
        {/* Theme */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl hover:bg-[var(--bg-tertiary)]"
        >
          {theme === "light" ? <Moon size={19} /> : <Sun size={19} />}
        </button>

        {/* Notifications */}
        <button className="relative p-2.5 rounded-xl hover:bg-[var(--bg-tertiary)]">
          <Bell size={19} />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-error" />
        </button>

        {/* Avatar */}
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="ml-1 w-10 h-10 rounded-full overflow-hidden ring-2 ring-primary/20"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {user?.firstName?.charAt(0)}
                  {user?.lastName?.charAt(0)}
                </span>
              </div>
            )}
          </button>

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-theme bg-[var(--bg-primary)] shadow-lg p-2">
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm hover:bg-[var(--bg-tertiary)] transition"
              >
                <LogOut size={16} />
                Logout
              </button>

            </div>
          )}
        </div>

      </div>
    </header>
  );
}