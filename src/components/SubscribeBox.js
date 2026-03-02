'use client';

import { useState, useEffect } from 'react';
import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import Modal from 'react-modal';
import { X } from 'lucide-react';
import { subscribeReport } from '@/app/actions/subscribe-report';

const initialState = { success: false, error: null };

/**
 * Email subscribe box for report TOC page. Form stays inline; success and error
 * are shown in a react-modal popup only. Parent controls visibility via
 * {showSubscribe && <SubscribeBox />}.
 */
export default function SubscribeBox({ locale, className = '' }) {
  const t = useTranslations({
    namespace: 'ReportSubscribe',
    locale,
  });
  const [state, formAction, pending] = useActionState(subscribeReport, initialState);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [resultType, setResultType] = useState(/** @type {'success' | 'error' | null} */ (null));

  useEffect(() => {
    if (!state?.success && !state?.error) return;
    const nextType = state?.success ? 'success' : 'error';
    const timer = setTimeout(() => {
      setResultType(nextType);
      setResultModalOpen(true);
    }, 0);
    return () => clearTimeout(timer);
  }, [state?.success, state?.error]);

  const closeResultModal = () => {
    setResultModalOpen(false);
    setResultType(null);
  };

  return (
    <>
      <div className={`rounded-lg border-2 border-gray-200 bg-[#EEEEEE] p-6 shadow-sm ${className}`}>
        <h3 className="mb-4 text-center text-xl font-bold text-[#ED1B2E]">
          {t('headline')}
        </h3>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="locale" value={locale} />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
            <input
              type="email"
              name="email"
              placeholder={t('placeholder')}
              required
              disabled={pending}
              autoComplete="email"
              className="min-w-0 flex-1 rounded-md border border-gray-200 bg-white px-3 py-2.5 text-black placeholder:text-[#ED1B2E]/60 focus:border-[#ED1B2E] focus:outline-none focus:ring-1 focus:ring-[#ED1B2E] disabled:bg-gray-100"
              aria-label={t('placeholder')}
            />
            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-[#ED1B2E] px-4 py-2.5 font-medium text-white hover:bg-[#c91828] disabled:opacity-60"
            >
              {pending ? t('submitting') : t('submit')}
            </button>
          </div>
        </form>
      </div>

      <Modal
        isOpen={resultModalOpen}
        onRequestClose={closeResultModal}
        contentLabel={resultType === 'success' ? t('successTitle') : t('close')}
        className="relative mx-auto mt-[10vh] max-w-md rounded-lg border-2 border-gray-200 bg-[#EEEEEE] p-6 shadow-lg outline-none"
        overlayClassName="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4"
        appElement={typeof document !== 'undefined' ? document.body : undefined}
      >
        {resultType === 'success' && (
          <div className="text-center" role="alert">
            <button
              type="button"
              onClick={closeResultModal}
              className="absolute right-3 top-3 rounded p-1 text-[#ED1B2E] hover:bg-[#E5E5E5]"
              aria-label={t('close')}
            >
              <X size={20} />
            </button>
            <p className="font-semibold text-[#ED1B2E] pr-8">{t('successTitle')}</p>
            <p className="mt-1 text-sm text-[#ED1B2E]/90">{t('successMessage')}</p>
          </div>
        )}
        {resultType === 'error' && state?.error && (
          <div className="text-center">
            <button
              type="button"
              onClick={closeResultModal}
              className="absolute right-3 top-3 rounded p-1 text-[#ED1B2E] hover:bg-[#E5E5E5]"
              aria-label={t('close')}
            >
              <X size={20} />
            </button>
            <p className="text-[#ED1B2E] pr-8" role="alert">
              {state.error}
            </p>
          </div>
        )}
      </Modal>
    </>
  );
}
