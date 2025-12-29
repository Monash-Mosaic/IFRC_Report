'use client';

import { usePathname, useRouter } from '@/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';

export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('LocaleSwitcher');

  /**
   * Switches the application's locale to the specified new locale.
   *
   * @param {string} newLocale - The locale to switch to.
   */
  const switchLocale = (newLocale) => {
    if (newLocale !== locale) {
      router.replace(pathname, { locale: newLocale });
      router.refresh();
    }
  };
  return (
    <select
      id="locale-switcher"
      name="locale"
      value=""
      onChange={(e) => switchLocale(e.target.value)}
      aria-label={t('ariaLabel')}
      title={t('title')}
      className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors inline-flex items-center gap-2 whitespace-nowrap focus:outline-none"
    >
      <option value="" disabled hidden>
        {t('language')}
      </option>
      <option data-testid="locale-switcher-value-en" value="en" disabled={locale === 'en'}>
        English
      </option>
      <option data-testid="locale-switcher-value-fr" value="fr" disabled={locale === 'fr'}>
        Francais
      </option>
      <option data-testid="locale-switcher-value-zh" value="zh" disabled={locale === 'zh'}>
        Chinese
      </option>
      <option data-testid="locale-switcher-value-ru" value="ru" disabled={locale === 'ru'}>
        Russian
      </option>
      <option data-testid="locale-switcher-value-ar" value="ar" disabled={locale === 'ar'}>
        Arabic
      </option>
    </select>
  );
}
