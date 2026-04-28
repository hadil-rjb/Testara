'use client';

import { useState, FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { User as UserIcon, Building2, Check, Save, Info, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui';
import Modal from '@/components/dashboard/Modal';
import { getApiError } from '@/lib/utils';
import type { AccountType } from '@/types';

export default function AccountTab() {
  const t = useTranslations('settings.account');
  const { user, switchAccountType } = useAuthStore();
  const toast = useToast();

  const currentType = (user?.accountType as AccountType) ?? 'individual';

  // Pre-select the user's current account type so the state is obvious on open
  const [selected, setSelected] = useState<AccountType>(currentType);
  const [companyName, setCompanyName] = useState(user?.companyName ?? '');
  const [saving, setSaving] = useState(false);

  // Confirmation modal shown only when downgrading Enterprise → Individual
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isDirty =
    selected !== currentType ||
    (selected === 'enterprise' &&
      companyName.trim() !== (user?.companyName ?? ''));

  const canSave =
    isDirty &&
    !saving &&
    (selected === 'individual' || companyName.trim().length > 0);

  const performSwitch = async () => {
    setSaving(true);
    try {
      await switchAccountType({
        accountType: selected,
        companyName:
          selected === 'enterprise' ? companyName.trim() : undefined,
      });
      toast.success(
        selected === 'enterprise'
          ? t('switchedToEnterprise')
          : t('switchedToIndividual'),
      );
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSave) return;

    // Downgrading from Enterprise → Individual deletes all teams: require confirmation
    if (currentType === 'enterprise' && selected === 'individual') {
      setConfirmOpen(true);
      return;
    }

    await performSwitch();
  };

  const handleConfirmDowngrade = async () => {
    setConfirmOpen(false);
    await performSwitch();
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-2xl border border-theme surface-card p-6">
          <h2 className="text-base font-semibold font-heading text-heading mb-1">
            {t('title')}
          </h2>
          <p className="text-sm text-body mb-6">{t('subtitle')}</p>

          {/* Type picker */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TypeCard
              isCurrent={currentType === 'individual'}
              isPending={selected === 'individual' && currentType !== 'individual'}
              onClick={() => setSelected('individual')}
              icon={UserIcon}
              title={t('individual')}
              desc={t('individualDesc')}
              activeLabel={t('active')}
            />
            <TypeCard
              isCurrent={currentType === 'enterprise'}
              isPending={selected === 'enterprise' && currentType !== 'enterprise'}
              onClick={() => setSelected('enterprise')}
              icon={Building2}
              title={t('enterprise')}
              desc={t('enterpriseDesc')}
              activeLabel={t('active')}
            />
          </div>

          {/* Company name — only when Enterprise is selected */}
          {selected === 'enterprise' && (
            <div className="mt-5">
              <label className="block text-xs font-semibold text-heading mb-1.5">
                {t('companyName')}
              </label>
              <div className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 border border-theme surface-input transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                <Building2 size={16} className="text-muted flex-shrink-0" />
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder={t('companyNamePlaceholder')}
                  className="flex-1 bg-transparent text-sm outline-none text-heading"
                />
              </div>
            </div>
          )}

          {/* Contextual info note when a different type is chosen */}
          {selected !== currentType && (
            <div className="mt-5 flex items-start gap-3 rounded-xl p-4 border border-theme surface-tertiary">
              <Info size={16} className="text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-body">
                {selected === 'enterprise'
                  ? t('upgradeNote')
                  : t('downgradeNote')}
              </p>
            </div>
          )}
        </section>

        <div className="flex justify-end">
          <Button
            type="submit"
            loading={saving}
            disabled={!canSave}
            leftIcon={!saving ? <Save size={15} /> : undefined}
          >
            {t('save')}
          </Button>
        </div>
      </form>

      {/* Downgrade confirmation modal */}
      <Modal
        open={confirmOpen}
        onClose={() => !saving && setConfirmOpen(false)}
        maxWidth="max-w-lg"
      >
        <div className="p-6">
          <div className="flex gap-4">
            <div className="w-11 h-11 rounded-full bg-error/10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={20} className="text-error" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold font-heading text-heading">
                {t('downgradeConfirmTitle')}
              </h3>
              <p className="text-sm text-body mt-1.5">
                {t('downgradeConfirmDesc')}
              </p>

              {/* Bullet list of consequences */}
              <ul className="mt-3 space-y-1.5 text-sm text-body">
                {(t.raw('downgradeConsequences') as string[]).map(
                  (item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-error flex-shrink-0" />
                      {item}
                    </li>
                  ),
                )}
              </ul>

              <p className="mt-4 text-sm font-semibold text-heading">
                {t('downgradeConfirmQuestion')}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 mt-6">
            <Button
              variant="ghost"
              onClick={() => setConfirmOpen(false)}
              disabled={saving}
            >
              {t('cancel')}
            </Button>
            <Button
              variant="danger"
              loading={saving}
              disabled={saving}
              onClick={handleConfirmDowngrade}
            >
              {t('downgradeConfirmAction')}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

/* ─── Type picker card ────────────────────────────────────────────── */

interface TypeCardProps {
  /** True when this card matches what's saved on the server. Always shown as "Active". */
  isCurrent: boolean;
  /** True when the user has clicked this card and intends to switch to it. */
  isPending: boolean;
  onClick: () => void;
  icon: typeof UserIcon;
  title: string;
  desc: string;
  activeLabel: string;
}

function TypeCard({
  isCurrent,
  isPending,
  onClick,
  icon: Icon,
  title,
  desc,
  activeLabel,
}: TypeCardProps) {
  /**
   * Visual states (mutually exclusive priority):
   *  1. isCurrent  → solid primary border + filled icon tile + "Active" badge + checkmark
   *  2. isPending  → dashed primary border + light primary tint  (user wants to switch here)
   *  3. default    → neutral border + hover
   */
  const borderClass = isCurrent
    ? 'border-primary bg-primary/5'
    : isPending
    ? 'border-primary border-dashed bg-primary/[0.03]'
    : 'border-theme hover:border-primary/40';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isCurrent}
      className={`relative flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all ${borderClass}`}
    >
      {/* Icon tile — filled only for the current (active) type */}
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
          isCurrent ? 'bg-primary' : 'bg-primary/10'
        }`}
      >
        <Icon size={20} className={isCurrent ? 'text-white' : 'text-primary'} />
      </div>

      {/* Text + "Active" badge */}
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold font-heading text-sm text-heading">
            {title}
          </span>
        </div>
        <p className="text-xs mt-1 text-body leading-relaxed">{desc}</p>
      </div>

      {/* Checkmark badge — anchored to isCurrent, not to the click selection */}
      {isCurrent && (
        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-sm">
          <Check size={12} className="text-white" strokeWidth={3} />
        </div>
      )}
    </button>
  );
}
