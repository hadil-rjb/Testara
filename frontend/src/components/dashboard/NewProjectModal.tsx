'use client';

import { useState, FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { projectApi } from '@/lib/api';
import { Button, Alert } from '@/components/ui';
import { FolderOpen, Globe, ArrowRight } from 'lucide-react';
import { getApiError } from '@/lib/utils';
import Modal from './Modal';

interface NewProjectModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

const URL_RE = /^https?:\/\/.+/i;

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
  const [error, setError] = useState('');

  // inline field errors
  const [nameError, setNameError] = useState('');
  const [urlError, setUrlError] = useState('');
  const [nameTouched, setNameTouched] = useState(false);
  const [urlTouched, setUrlTouched] = useState(false);

  const validateName = (v: string) => (v.trim() ? '' : t('feedback.nameRequired'));
  const validateUrl = (v: string) => {
    if (!v.trim()) return t('feedback.urlRequired');
    if (!URL_RE.test(v.trim())) return t('feedback.urlInvalid');
    return '';
  };

  const reset = () => {
    setName(''); setUrl(''); setError('');
    setNameError(''); setUrlError('');
    setNameTouched(false); setUrlTouched(false);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const ne = validateName(name);
    const ue = validateUrl(url);
    setNameError(ne); setUrlError(ue);
    setNameTouched(true); setUrlTouched(true);
    if (ne || ue) return;

    setError('');
    setSubmitting(true);
    try {
      const { data } = await projectApi.create({ name: name.trim(), url: url.trim() });
      reset();
      onCreated?.();
      if (data?._id) router.push(`/workspace/${data._id}?new=1`);
    } catch (err) {
      setError(getApiError(err, t('feedback.createFailed')));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title={t('newProjectTitle')} subtitle={t('newProjectSubtitle')}>
      <form onSubmit={handleSubmit} noValidate className="p-5 space-y-4">
        {error && (
          <Alert variant="error" onDismiss={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Grouped input card */}
        <div className={`rounded-2xl border surface-input transition-colors ${
          (nameTouched && nameError) || (urlTouched && urlError)
            ? 'border-error'
            : 'border-theme'
        }`}>
          {/* Name row */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-theme">
            <FolderOpen size={17} className="text-muted flex-shrink-0" />
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameTouched) setNameError(validateName(e.target.value));
              }}
              onBlur={() => { setNameTouched(true); setNameError(validateName(name)); }}
              placeholder={td('projectName')}
              autoFocus
              className="flex-1 bg-transparent text-sm text-heading placeholder:text-muted focus:outline-none"
            />
          </div>
          {/* URL row */}
          <div className="flex items-center gap-3 px-4 py-3">
            <Globe size={17} className="text-muted flex-shrink-0" />
            <input
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (urlTouched) setUrlError(validateUrl(e.target.value));
              }}
              onBlur={() => { setUrlTouched(true); setUrlError(validateUrl(url)); }}
              placeholder={td('urlPlaceholder')}
              className="flex-1 bg-transparent text-sm outline-none text-heading placeholder:text-muted"
            />
          </div>
        </div>

        {/* Field-level errors */}
        {nameTouched && nameError && (
          <p className="text-xs text-error -mt-2">{nameError}</p>
        )}
        {!nameError && urlTouched && urlError && (
          <p className="text-xs text-error -mt-2">{urlError}</p>
        )}

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={handleClose}>
            {t('cancel')}
          </Button>
          <Button
            type="submit"
            loading={submitting}
            disabled={submitting}
            rightIcon={!submitting ? <ArrowRight size={15} /> : undefined}
          >
            {t('create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
