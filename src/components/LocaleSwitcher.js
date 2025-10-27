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
      value={locale}
      onChange={(e) => switchLocale(e.target.value)}
      aria-label={t('ariaLabel')}
      title={t('title')}
    >
      <option data-testid="locale-switcher-value-en" value="en">
        🇬🇧 English
      </option>
      <option data-testid="locale-switcher-value-fr" value="fr">
        🇫🇷 Français
      </option>
      <option data-testid="locale-switcher-value-zh" value="zh">
        🇨🇳 中文
      </option>
      <option data-testid="locale-switcher-value-ru" value="ru">
        🇷🇺 Русский
      </option>
      <option data-testid="locale-switcher-value-ar" value="ar">
        🇸🇦 العربية
      </option>
    </select>
  );
}
