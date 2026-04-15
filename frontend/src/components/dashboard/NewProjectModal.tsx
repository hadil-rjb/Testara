'use client';

import { useState, FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { projectApi } from '@/lib/api';
import { FolderOpen, Globe, ArrowUp } from 'lucide-react';
import Modal from './Modal';

interface NewProjectModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export default function NewProjectModal({
  open,
  onClose,
  onCreated,
}: NewProjectModalProps) {
  const t = useTranslations('projects');
  const td = useTranslations('dashboard');
  const router = useRouter();

  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await projectApi.create({ name, url });
      setName('');
      setUrl('');
      onCreated?.();
      if (data?._id) router.push(`/workspace/${data._id}?new=1`);
    } catch {
      /* error suppressed for now */
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('newProjectTitle')}
      subtitle={t('newProjectSubtitle')}
    >
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div className="rounded-2xl border border-theme surface-input">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-theme">
            <FolderOpen size={17} className="text-muted flex-shrink-0" />
<input
  type="text"
  value={name}
  onChange={(e) => setName(e.target.value)}
  placeholder={td('projectName')}
  required
  autoFocus
  className="flex-1 bg-transparent text-sm text-heading placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-0"
/>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <Globe size={17} className="text-muted flex-shrink-0" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={td('urlPlaceholder')}
              required
              className="flex-1 bg-transparent text-sm outline-none text-heading placeholder:text-[var(--text-tertiary)]"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-body transition-colors hover:surface-tertiary"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            disabled={submitting || !name.trim() || !url.trim()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold transition-colors hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ArrowUp size={15} />
            )}
            {t('create')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
