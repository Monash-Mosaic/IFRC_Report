export const localeRelease = {
  en: { production: false, preview: true },
  fr: { production: false, preview: true },
  zh: { production: false, preview: true },
  ar: { production: false, preview: true },
  ru: { production: false, preview: true },
  es: { production: false, preview: false },
};

export const getEnvironment = () =>
  process.env.ENVIRONMENT || process.env.NEXT_PUBLIC_ENVIRONMENT || 'development';

export const isLocaleReleased = (locale, environment = getEnvironment()) => {
  const release = localeRelease[locale];
  if (!release) {
    return false;
  }
  if (environment === 'production') {
    return release.production !== false;
  }
  return release.preview !== false;
};
