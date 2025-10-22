
/**
 * Determines if the given locale is a right-to-left (RTL) language.
 *
 * @param {string} locale - The locale code to check (e.g., 'en', 'ar').
 * @returns {boolean} Returns true if the locale is RTL, otherwise false.
 */
export function isRtlLocale(locale) {
  const rtlLocales = ['ar'];
  return rtlLocales.includes(locale);
}

/**
 * Returns the text direction ('rtl' or 'ltr') based on the provided locale.
 *
 * @param {string} locale - The locale identifier (e.g., 'en', 'ar', 'he').
 * @returns {'rtl' | 'ltr'} The text direction for the given locale.
 */
export function getDirection(locale) {
  return isRtlLocale(locale) ? 'rtl' : 'ltr';
}