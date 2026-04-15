'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Pencil } from 'lucide-react';
import Modal from './Modal';

interface RenameProjectModalProps {
  project: { _id: string; name: string } | null;
  onClose: () => void;
  onRename: (newName: string) => Promise<void> | void;
}

export default function RenameProjectModal({
  project,
  onClose,
  onRename,
}: RenameProjectModalProps) {
  const t = useTranslations('projects');
  const td = useTranslations('dashboard');

  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (project) setName(project.name);
  }, [project]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !project) return;
    setSubmitting(true);
    try {
      await onRename(name.trim());
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={!!project}
      onClose={onClose}
      title={t('rename')}
      subtitle={project?.name}
    >
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-theme surface-input">
          <Pencil size={16} className="text-muted flex-shrink-0" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={td('projectName')}
            required
            autoFocus
            className="flex-1 bg-transparent text-sm outline-none text-heading placeholder:text-[var(--text-tertiary)]"
          />
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
            disabled={submitting || !name.trim() || name.trim() === project?.name}
            className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold transition-colors hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? '...' : t('save')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
