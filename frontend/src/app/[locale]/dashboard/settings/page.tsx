'use client';

import { useState } from 'react';
import SettingsShell, { SettingsTab } from '@/components/settings/SettingsShell';
import ProfileTab from '@/components/settings/ProfileTab';
import SecurityTab from '@/components/settings/SecurityTab';
import PreferencesTab from '@/components/settings/PreferencesTab';
import Toast, { ToastKind } from '@/components/settings/Toast';

interface ToastState {
  kind: ToastKind;
  message: string;
}

export default function SettingsPage() {
  const [active, setActive] = useState<SettingsTab>('profile');
  const [toast, setToast] = useState<ToastState | null>(null);

  const handleToast = (kind: ToastKind, message: string) => {
    setToast({ kind, message });
  };

  return (
    <>
      <SettingsShell active={active} onChange={setActive}>
        {active === 'profile' && <ProfileTab onToast={handleToast} />}
        {active === 'security' && <SecurityTab onToast={handleToast} />}
        {active === 'preferences' && <PreferencesTab onToast={handleToast} />}
      </SettingsShell>

      {toast && (
        <Toast
          kind={toast.kind}
          message={toast.message}
          onDismiss={() => setToast(null)}
        />
      )}
    </>
  );
}
