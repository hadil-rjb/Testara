'use client';

import { ReactNode } from 'react';
import { ThemeProvider, useTheme } from './ThemeProvider';
import { AuthHydrator } from './AuthHydrator';
import { Toaster } from '@/components/ui/Toaster';

/**
 * Root client providers composed once in `app/[locale]/layout.tsx`.
 * Keep the list shallow — every additional layer runs on every render.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthHydrator>{children}</AuthHydrator>
      <Toaster />
    </ThemeProvider>
  );
}

// Re-exports so callers can keep `import { useTheme } from '@/components/providers'`.
export { ThemeProvider, useTheme };
