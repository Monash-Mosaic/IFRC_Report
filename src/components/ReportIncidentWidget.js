'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { MessageCircle, X } from 'lucide-react';

export default function ReportIncidentWidget() {
  const t = useTranslations('ReportIncident');
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(null); // 'sending' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = description.trim();
    if (!trimmed) return;

    setStatus('sending');
    setErrorMessage('');

    const location =
      typeof window !== 'undefined' ? window.location.href : '';

    try {
      const res = await fetch('/api/report-incident', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: trimmed, location }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus('error');
        setErrorMessage(data.error || t('error'));
        return;
      }

      setStatus('success');
      setDescription('');
    } catch {
      setStatus('error');
      setErrorMessage(t('error'));
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {open && (
        <div
          className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-4 shadow-lg"
          role="dialog"
          aria-labelledby="report-incident-title"
          aria-modal="true"
        >
          <div className="flex items-center justify-between mb-3">
            <h2
              id="report-incident-title"
              className="text-lg font-semibold text-gray-900"
            >
              {t('title')}
            </h2>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setStatus(null);
                setErrorMessage('');
              }}
              className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              aria-label={t('close')}
            >
              <X size={20} />
            </button>
          </div>

          {status === 'success' ? (
            <p className="text-sm text-green-700">{t('success')}</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <label htmlFor="report-description" className="block text-sm font-medium text-gray-700">
                {t('descriptionLabel')}
              </label>
              <textarea
                id="report-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('descriptionPlaceholder')}
                rows={4}
                required
                disabled={status === 'sending'}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 disabled:bg-gray-100"
              />
              {errorMessage && (
                <p className="text-sm text-red-600">{errorMessage}</p>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="rounded bg-[#ee2333] px-3 py-2 text-sm font-medium text-white hover:bg-[#d61f2e] disabled:opacity-60"
                >
                  {status === 'sending' ? t('submitting') : t('submit')}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ee2333] text-white shadow-md hover:bg-[#d61f2e] focus:outline-none focus:ring-2 focus:ring-[#ee2333] focus:ring-offset-2"
        aria-label={open ? t('close') : t('trigger')}
        title={t('triggerTooltip')}
      >
        <MessageCircle size={24} />
      </button>
    </div>
  );
}
