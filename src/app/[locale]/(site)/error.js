"use client";

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function Error({
  error,
}) {
  const t = useTranslations('Error');
  const errorMessage = error?.message || '';

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-12 text-center bg-white">
      <div className="max-w-lg">
        <h1 className="mb-4 font-mono text-6xl font-bold text-[#E63946]">
          500
        </h1>

        <h2 className="mb-4 font-mono text-2xl font-semibold text-[#0D1B3E]">
          {t('title')}
        </h2>

        <p className="mb-8 text-gray-600">
          {t('description')}
        </p>

        {errorMessage && (
          <p className="mb-8 text-sm text-gray-500 break-words">
            {t('message', { message: errorMessage })}
          </p>
        )}

        <Link
          href="/"
          className="inline-flex items-center bg-red-700 hover:bg-red-800 text-white px-10 py-4 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 mx-auto"
        >
          {t('backHome')}
        </Link>
      </div>
    </div>
  );
}
