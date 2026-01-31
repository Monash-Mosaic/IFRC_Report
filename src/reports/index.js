import * as arReports from './ar';
import * as enReports from './en';
import * as frReports from './fr';
import * as ruReports from './ru';
import * as zhReports from './zh';
import * as esReports from './es';
import { getEnvironment, isLocaleReleased, localeRelease } from './release';

export const reportUriMap = {
  wdr25: {
    chapters: {
      'chapter-02': {
        number: 2,
        languages: {
          ar: 'الفصل-02',
          en: 'chapter-02',
          fr: 'chapitre-02',
          ru: 'глава-02',
          zh: '章节-02',
          es: 'capitulo-02',
        },
      },
      uri: {
        ar: {
          'الفصل-02': 'chapter-02',
        },
        en: {
          'chapter-02': 'chapter-02',
        },
        es: {
          'capitulo-02': 'chapter-02',
        },
        ru: {
          'глава-02': 'chapter-02',
        },
        fr: {
          'chapitre-02': 'chapter-02',
        },
        zh: {
          '章节-02': 'chapter-02',
        },
      }
    },
    languages: {
      ar: 'wdr25',
      en: 'wdr25',
      fr: 'wdr25',
      ru: 'wdr25',
      zh: 'wdr25',
      es: 'wdr25',
    },
  },
  uri: {
    en: {
      wdr25: 'wdr25',
    },
    fr: {
      wdr25: 'wdr25',
    },
    zh: {
      wdr25: 'wdr25',
    },
    ar: {
      wdr25: 'wdr25',
    },
    ru: {
      wdr25: 'wdr25',
    },
    es: {
      wdr25: 'wdr25',
    },
  },
};

// For simplicity, we will hardcode locale and report and chapter combinations.
export const reportsByLocale = {
  ar: arReports,
  en: enReports,
  fr: frReports,
  ru: ruReports,
  zh: zhReports,
  es: esReports,
};

export { getEnvironment, isLocaleReleased, localeRelease };

export const isReportReleased = (
  locale,
  reportKey,
  environment = getEnvironment()
) => {
  if (!isLocaleReleased(locale, environment)) {
    return false;
  }
  const report = reportsByLocale[locale]?.reports?.[reportKey];
  if (!report) {
    return false;
  }
  const visibility = report.visibility || {};
  if (environment === 'production') {
    return visibility.production !== false;
  }
  return visibility.preview !== false;
};

export const getVisibleReports = (locale, environment = getEnvironment()) => {
  const reports = reportsByLocale[locale]?.reports || {};
  return Object.fromEntries(
    Object.entries(reports).filter(([reportKey]) =>
      isReportReleased(locale, reportKey, environment)
    )
  );
};
