'use client';

import { useState } from 'react';
import SettingsShell, { SettingsTab } from '@/components/settings/SettingsShell';
import ProfileTab from '@/components/settings/ProfileTab';
import SecurityTab from '@/components/settings/SecurityTab';
import PreferencesTab from '@/components/settings/PreferencesTab';

export default function SettingsPage() {
  const [active, setActive] = useState<SettingsTab>('profile');

  return (
    <SettingsShell active={active} onChange={setActive}>
      {active === 'profile' && <ProfileTab />}
      {active === 'security' && <SecurityTab />}
      {active === 'preferences' && <PreferencesTab />}
    </SettingsShell>
  );
}
