'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { MessageCircle, X } from 'lucide-react';
import { reportIncident } from '@/app/actions/report-incident';

const initialState = { success: false, error: null };

export default function ReportIncidentWidget() {
  const t = useTranslations('ReportIncident');
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [dismissedSuccess, setDismissedSuccess] = useState(false);

  const [state, formAction, pending] = useActionState(reportIncident, initialState);

  const handleOpen = () => {
    const willOpen = !open;
    setOpen((prev) => !prev);
    if (willOpen) {
      setDismissedSuccess(false);
      if (typeof window !== 'undefined') setFormLocation(window.location.href);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setDismissedSuccess(true);
    setDescription('');
  };

  const showSuccess = state?.success && !dismissedSuccess;

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
              onClick={handleClose}
              className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              aria-label={t('close')}
            >
              <X size={20} />
            </button>
          </div>

          {showSuccess ? (
            <p className="text-sm text-green-700">{t('success')}</p>
          ) : (
            <form action={formAction} className="space-y-3" data-testid="report-incident-form">
              <input type="hidden" name="location" value={formLocation} />
              <label htmlFor="report-description" className="block text-sm font-medium text-gray-700">
                {t('descriptionLabel')}
              </label>
              <textarea
                id="report-description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('descriptionPlaceholder')}
                rows={4}
                required
                disabled={pending}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 disabled:bg-gray-100"
              />
              {state?.error && (
                <p className="text-sm text-red-600">{state.error}</p>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded bg-[#ee2333] px-3 py-2 text-sm font-medium text-white hover:bg-[#d61f2e] disabled:opacity-60"
                >
                  {pending ? t('submitting') : t('submit')}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={handleOpen}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ee2333] text-white shadow-md hover:bg-[#d61f2e] focus:outline-none focus:ring-2 focus:ring-[#ee2333] focus:ring-offset-2"
        aria-label={open ? t('close') : t('trigger')}
        title={t('triggerTooltip')}
      >
        <MessageCircle size={24} />
      </button>
    </div>
  );
}
