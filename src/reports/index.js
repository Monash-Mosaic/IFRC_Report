import * as arReports from './ar';
import * as enReports from './en';
import * as frReports from './fr';
import * as ruReports from './ru';
import * as zhReports from './zh';
import * as esReports from './es';
import { getEnvironment, isLocaleReleased, localeRelease } from './release';

// For simplicity, we will hardcode locale and report and chapter combinations.
export const reportsByLocale = {
  ar: arReports,
  en: enReports,
  fr: frReports,
  ru: ruReports,
  zh: zhReports,
  es: esReports,
};

const CANONICAL_LOCALE = 'en';
/**
 * Builds a mapping of report and chapter URIs across locales.
 * @example
 * 
 * 
 * @param {Object} reportsByLocaleMap - The reports by locale map.
 * @returns {Object} The report URI map.
 */
const buildReportUriMap = (reportsByLocaleMap) => {
// Example output structure:
// {
//   wdr25: { // canonical report key
//     chapters: {
//       'chapter-02': { // canonical chapter key
//         number: 2,
//         languages: { // locale to localized chapter slug
//           ar: 'الفصل-02',
//           en: 'chapter-02',
//           fr: 'chapitre-02',
//           ru: 'глава-02',
//           zh: '章节-02',
//           es: 'capitulo-02',
//         },
//       },
//       uri: { // localede to localized chapter slug to canonical chapter key
//         ar: {
//           'الفصل-02': 'chapter-02',
//         },
//         en: {
//           'chapter-02': 'chapter-02',
//         },
//         es: {
//           'capitulo-02': 'chapter-02',
//         },
//         ru: {
//           'глава-02': 'chapter-02',
//         },
//         fr: {
//           'chapitre-02': 'chapter-02',
//         },
//         zh: {
//           '章节-02': 'chapter-02',
//         },
//       }
//     },
//     languages: { // locale to localized report slug
//       ar: 'wdr25',
//       en: 'wdr25',
//       fr: 'wdr25',
//       ru: 'wdr25',
//       zh: 'wdr25',
//       es: 'wdr25',
//     },
//   },
//   uri: { // locale to localized report slug to canonical report key
//          // NOTE: this allow same localized slug to map to different canonical keys in different locales
//     en: {
//       wdr25: 'wdr25',
//     },
//     fr: {
//       wdr25: 'wdr25',
//     },
//     zh: {
//       wdr25: 'wdr25',
//     },
//     ar: {
//       wdr25: 'wdr25',
//     },
//     ru: {
//       wdr25: 'wdr25',
//     },
//     es: {
//       wdr25: 'wdr25',
//     },
//   },
// };
  const reportUriMap = {
    uri: {},
  };
  const canonicalReports = reportsByLocaleMap[CANONICAL_LOCALE]?.reports || {};
  const canonicalChapterMapByReport = Object.fromEntries(
    Object.entries(canonicalReports).map(([reportKey, report]) => {
      const chapters = report?.chapters || {};
      const chapterKeyMap = {};
      const chapterNumberMap = {};
      Object.entries(chapters).forEach(([canonicalSlug, chapter]) => {
        const chapterKey = chapter?.metadata?.chapterKey || canonicalSlug;
        const chapterNumber = chapter?.metadata?.chapterNumber;

        if (
          chapterKeyMap[chapterKey] &&
          chapterKeyMap[chapterKey] !== canonicalSlug
        ) {
          console.warn(
            `Duplicate canonical chapter key "${chapterKey}" in report "${reportKey}".`
          );
          return;
        }
        chapterKeyMap[chapterKey] = canonicalSlug;

        if (
          chapterNumber != null &&
          chapterNumberMap[chapterNumber] &&
          chapterNumberMap[chapterNumber] !== canonicalSlug
        ) {
          console.warn(
            `Duplicate canonical chapter number "${chapterNumber}" in report "${reportKey}".`
          );
          return;
        }
        if (chapterNumber != null) {
          chapterNumberMap[chapterNumber] = canonicalSlug;
        }
      });
      return [reportKey, { chapterKeyMap, chapterNumberMap }];
    })
  );

  Object.entries(reportsByLocaleMap).forEach(([locale, localeModule]) => {
    const localeReports = localeModule?.reports || {};
    reportUriMap.uri[locale] = {};

    Object.entries(localeReports).forEach(([reportKey, report]) => {
      const reportSlug = reportKey;
      if (reportUriMap.uri[locale][reportSlug]) {
        console.warn(
          `Duplicate report slug "${reportSlug}" for locale "${locale}".`
        );
        return;
      }
      reportUriMap.uri[locale][reportSlug] = reportKey;

      if (!reportUriMap[reportKey]) {
        reportUriMap[reportKey] = {
          chapters: {
            uri: {},
          },
          languages: {},
        };
      }
      reportUriMap[reportKey].languages[locale] = reportSlug;

      const chapters = report?.chapters || {};
      const canonicalChapterMaps =
        canonicalChapterMapByReport[reportKey] || {};
      const chapterKeyMap = canonicalChapterMaps.chapterKeyMap || {};
      const chapterNumberMap = canonicalChapterMaps.chapterNumberMap || {};
      const reportChapters = reportUriMap[reportKey].chapters;

      if (!reportChapters.uri[locale]) {
        reportChapters.uri[locale] = {};
      }

      Object.entries(chapters).forEach(([localizedSlug, chapter]) => {
        const chapterKey = chapter?.metadata?.chapterKey || localizedSlug;
        const chapterNumber = chapter?.metadata?.chapterNumber;
        const canonicalSlug =
          chapterKeyMap[chapterKey] ||
          (chapterNumber != null ? chapterNumberMap[chapterNumber] : null);

        if (!canonicalSlug || !localizedSlug) {
          return;
        }

        if (reportChapters.uri[locale][localizedSlug]) {
          console.warn(
            `Duplicate chapter slug "${localizedSlug}" for locale "${locale}" in report "${reportKey}".`
          );
          return;
        }
        reportChapters.uri[locale][localizedSlug] = canonicalSlug;

        if (!reportChapters[canonicalSlug]) {
          reportChapters[canonicalSlug] = {
            number: chapter?.metadata?.chapterNumber,
            languages: {},
          };
        } else if (
          reportChapters[canonicalSlug].number == null &&
          chapter?.metadata?.chapterNumber != null
        ) {
          reportChapters[canonicalSlug].number =
            chapter.metadata.chapterNumber;
        }

        if (!reportChapters[canonicalSlug].languages) {
          reportChapters[canonicalSlug].languages = {};
        }

        if (
          reportChapters[canonicalSlug].languages[locale] &&
          reportChapters[canonicalSlug].languages[locale] !== localizedSlug
        ) {
          console.warn(
            `Duplicate chapter slug mapping for locale "${locale}" in report "${reportKey}".`
          );
          return;
        }

        reportChapters[canonicalSlug].languages[locale] = localizedSlug;
      });
    });
  });

  return reportUriMap;
};

export const reportUriMap = buildReportUriMap(reportsByLocale);

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
