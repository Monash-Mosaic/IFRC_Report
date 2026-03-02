'use client';

import { useState, useEffect, useRef } from 'react';
import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { subscribeReport } from '@/app/actions/subscribe-report';

const initialState = { success: false, error: null };

/**
 * Reusable email subscribe box. Sends current page URL (location) and locale to the server
 * so Brevo stores which page and language the user subscribed from.
 * Only render when showSubscribe is true (e.g. when report has fewer than 9 chapters).
 */
export default function SubscribeBox({
  locale = '',
  headline,
  placeholder,
  submitLabel,
  successTitle,
  successMessage,
  className = '',
  compact = false,
  showSubscribe = true,
}) {
  const t = useTranslations('ReportSubscribe');
  const locationInputRef = useRef(/** @type {HTMLInputElement | null} */ (null));
  const [dismissedSuccess, setDismissedSuccess] = useState(false);

  const [state, formAction, pending] = useActionState(subscribeReport, initialState);

  useEffect(() => {
    if (typeof window !== 'undefined' && locationInputRef.current) {
      locationInputRef.current.value = window.location.href;
    }
  }, []);

  const showSuccess = Boolean(state?.success && !dismissedSuccess);

  const handleCloseSuccess = () => {
    setDismissedSuccess(true);
  };

  const displayHeadline = headline ?? t('headline');
  const displayPlaceholder = placeholder ?? t('placeholder');
  const displaySubmit = submitLabel ?? t('submit');
  const displaySuccessTitle = successTitle ?? t('successTitle');
  const displaySuccessMessage = successMessage ?? t('successMessage');

  if (!showSubscribe) return null;

  return (
    <div className={`rounded-lg border-2 border-gray-200 bg-[#EEEEEE] p-6 shadow-sm ${className}`}>
      <h3 className="mb-4 text-center text-xl font-bold text-[#ED1B2E]">
        {displayHeadline}
      </h3>

      {showSuccess ? (
        <div
          className="relative rounded-lg border border-[#ED1B2E]/30 bg-white p-4 pr-10 text-center"
          role="alert"
        >
          <button
            type="button"
            onClick={handleCloseSuccess}
            className="absolute right-2 top-2 rounded p-1 text-[#ED1B2E] hover:bg-[#E5E5E5]"
            aria-label={t('close')}
          >
            <X size={18} />
          </button>
          <p className="font-semibold text-[#ED1B2E]">{displaySuccessTitle}</p>
          <p className="mt-1 text-sm text-[#ED1B2E]/90">{displaySuccessMessage}</p>
        </div>
      ) : (
        <form action={formAction} className={compact ? 'space-y-3' : 'space-y-4'}>
          <input ref={locationInputRef} type="hidden" name="location" />
          <input type="hidden" name="locale" value={locale} />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
            <input
              type="email"
              name="email"
              placeholder={displayPlaceholder}
              required
              disabled={pending}
              autoComplete="email"
              className="min-w-0 flex-1 rounded-md border border-gray-200 bg-white px-3 py-2.5 text-black placeholder:text-[#ED1B2E]/60 focus:border-[#ED1B2E] focus:outline-none focus:ring-1 focus:ring-[#ED1B2E] disabled:bg-gray-100"
              aria-label={displayPlaceholder}
            />
            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-[#ED1B2E] px-4 py-2.5 font-medium text-white hover:bg-[#c91828] disabled:opacity-60"
            >
              {pending ? t('submitting') : displaySubmit}
            </button>
          </div>
          {state?.error && (
            <p className="text-sm text-[#ED1B2E]" role="alert">
              {state.error}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
