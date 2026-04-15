'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/auth-store';
import { useTheme } from '@/components/providers';
import { useRouter, Link } from '@/i18n/routing';
import { Search, Bell, Sun, Moon, LogOut, Settings, UserCircle2 } from 'lucide-react';

export default function TopBar() {
  const tc = useTranslations('common');
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const initials = `${user?.firstName?.charAt(0) ?? ''}${user?.lastName?.charAt(0) ?? ''}`.toUpperCase();

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between gap-4 px-5 sm:px-6 h-16 border-b border-theme backdrop-blur"
      style={{ backgroundColor: 'color-mix(in srgb, var(--bg-primary) 92%, transparent)' }}
    >
      {/* Search */}
      <div className="flex-1 max-w-xl ml-10 lg:ml-0">
        <div className="group flex items-center gap-2.5 rounded-xl px-3.5 h-10 border border-theme surface-input transition-all duration-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
          <Search
            size={16}
            className="text-muted transition-colors group-focus-within:text-primary"
          />
          <input
            type="text"
            placeholder={tc('search')}
            className="flex-1 bg-transparent text-sm outline-none text-heading placeholder:text-muted"
          />
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 sm:gap-1.5" ref={menuRef}>
        {/* Theme */}
        <button
          onClick={toggleTheme}
          className="icon-btn"
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          title={theme === 'light' ? 'Dark mode' : 'Light mode'}
        >
          {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
        </button>

        {/* Notifications */}
        <button
          className="icon-btn relative"
          aria-label="Notifications"
        >
          <Bell size={17} />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full ring-2"
            style={{
              backgroundColor: 'var(--color-error)',
              // @ts-expect-error -- CSS var for ringColor
              '--tw-ring-color': 'var(--bg-primary)',
            }}
          />
        </button>

        {/* Avatar */}
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="ml-1 w-9 h-9 rounded-full overflow-hidden ring-2 ring-primary/20 transition-[transform,box-shadow] hover:ring-primary/40 active:scale-95"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-label="Account menu"
          >
            {user?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                <span className="text-white text-[13px] font-semibold">
                  {initials || <UserCircle2 size={18} />}
                </span>
              </div>
            )}
          </button>

          {/* Dropdown */}
          {open && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-56 rounded-xl border border-theme surface-card shadow-card-hover p-1.5 origin-top-right"
            >
              {/* Header */}
              <div className="px-3 py-2 border-b border-theme-light mb-1">
                <div className="text-sm font-semibold text-heading truncate">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-xs text-muted truncate">{user?.email}</div>
              </div>

              <Link
                href="/dashboard/settings"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-body hover:surface-tertiary hover:text-heading transition-colors"
              >
                <Settings size={15} className="text-muted" />
                Settings
              </Link>

              <button
                onClick={handleLogout}
                role="menuitem"
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-error hover:bg-[var(--alert-error-bg)] transition-colors"
              >
                <LogOut size={15} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
