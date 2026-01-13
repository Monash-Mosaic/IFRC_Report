'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Globe, ChevronDown } from 'lucide-react';

export default function LocaleSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations('LocaleSwitcher');

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'zh', name: '中文' },
    { code: 'ru', name: 'Русский' },
    { code: 'ar', name: 'العربية' },
    { code: 'es', name: 'Espanol' },
  ];

  /**
   * Switches the application's locale to the specified new locale.
   *
   * @param {string} newLocale - The locale to switch to.
   */
  const switchLocale = (newLocale) => {
    if (newLocale !== locale) {
      router.replace('/', { locale: newLocale });
      router.refresh();
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('ariaLabel')}
        title={t('title')}
        className="p-2 md:px-6 md:py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors inline-flex items-center gap-1 md:gap-2 whitespace-nowrap focus:outline-none w-10 h-10 md:w-auto md:h-auto justify-center md:justify-start"
      >
        <span className="hidden md:inline">{t('language')}</span>
        <Globe className="w-5 h-5 md:hidden text-white" />
        <ChevronDown className="w-2 h-2 md:w-3 md:h-3 text-white" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-full">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchLocale(lang.code)}
              disabled={locale === lang.code}
              className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg ${
                locale === lang.code
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
