import { getPathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import {
  getVisibleReports,
  isLocaleReleased,
  isReportReleased,
  reportsByLocale,
  reportUriMap,
} from '@/reports';

/**
 * 
 * @returns {Promise<import('next').MetadataRoute.Sitemap>}
 */
export default async function sitemap() {
  const host = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(
    /\/+$/,
    ''
  );

  const buildHref = (href, params) => (params ? { pathname: href, params } : href);

  const buildAlternates = (href, params, locales) => ({
    languages: Object.fromEntries(
      locales.map((locale) => [
        locale,
        `${host}${getPathname({ locale, href: buildHref(href, params) })}`,
      ])
    ),
  });

  const getLatestReleaseDate = (locales) => {
    const dates = [];
    locales.forEach((locale) => {
      const reports = getVisibleReports(locale);
      Object.values(reports).forEach((report) => {
        if (report?.releaseDate) {
          dates.push(new Date(report.releaseDate).getTime());
        }
      });
    });
    if (!dates.length) {
      return undefined;
    }
    return new Date(Math.max(...dates));
  };

  const items = [];
  const locales = routing.locales;
  const defaultLocale = routing.defaultLocale;
  const releasedLocales = locales.filter((locale) => isLocaleReleased(locale));
  const effectiveLocales = releasedLocales.length ? releasedLocales : [defaultLocale];
  const defaultReleasedLocale = effectiveLocales.includes(defaultLocale)
    ? defaultLocale
    : effectiveLocales[0];

  const homeLastModified = getLatestReleaseDate(effectiveLocales);
  items.push({
    url: `${host}${getPathname({ locale: defaultReleasedLocale, href: '/' })}`,
    ...(homeLastModified ? { lastModified: homeLastModified } : {}),
    alternates: buildAlternates('/', undefined, effectiveLocales),
  });

  const reportsLastModified = getLatestReleaseDate(effectiveLocales);
  items.push({
    url: `${host}${getPathname({ locale: defaultReleasedLocale, href: '/reports' })}`,
    ...(reportsLastModified ? { lastModified: reportsLastModified } : {}),
    alternates: buildAlternates('/reports', undefined, effectiveLocales),
  });

  const reportKeys = new Set();
  effectiveLocales.forEach((locale) => {
    Object.keys(getVisibleReports(locale)).forEach((key) => reportKeys.add(key));
  });

  reportKeys.forEach((reportKey) => {
    const localesWithReport = effectiveLocales.filter(
      (locale) => isReportReleased(locale, reportKey)
    );
    if (!localesWithReport.length) {
      return;
    }
    const reportLastModified = getLatestReleaseDate(localesWithReport);
    const reportLanguages = reportUriMap[reportKey]?.languages || {};
    const reportSlugForLocale = (locale) => reportLanguages[locale] || reportKey;
    const reportAlternates = {
      languages: Object.fromEntries(
        localesWithReport.map((locale) => [
          locale,
          `${host}${getPathname({
            locale,
            href: buildHref('/reports/[report]', {
              report: reportSlugForLocale(locale),
            }),
          })}`,
        ])
      ),
    };
    items.push({
      url: `${host}${getPathname({
        locale: defaultReleasedLocale,
        href: buildHref('/reports/[report]', {
          report: reportSlugForLocale(defaultReleasedLocale),
        }),
      })}`,
      ...(reportLastModified ? { lastModified: reportLastModified } : {}),
      alternates: reportAlternates,
    });

    const chapterKeys = new Set();
    localesWithReport.forEach((locale) => {
      const chapters = reportsByLocale[locale]?.reports?.[reportKey]?.chapters || {};
      Object.keys(chapters).forEach((chapterKey) => chapterKeys.add(chapterKey));
    });

    chapterKeys.forEach((chapterKey) => {
      const localesWithChapter = localesWithReport.filter(
        (locale) => reportsByLocale[locale]?.reports?.[reportKey]?.chapters?.[chapterKey]
      );
      if (!localesWithChapter.length) {
        return;
      }
      const chapterLanguages =
        reportUriMap[reportKey]?.chapters?.[chapterKey]?.languages || {};
      const chapterSlugForLocale = (locale) => chapterLanguages[locale] || chapterKey;
      const chapterAlternates = {
        languages: Object.fromEntries(
          localesWithChapter.map((locale) => [
            locale,
            `${host}${getPathname({
              locale,
              href: buildHref('/reports/[report]/[chapter]', {
                report: reportSlugForLocale(locale),
                chapter: chapterSlugForLocale(locale),
              }),
            })}`,
          ])
        ),
      };
      items.push({
        url: `${host}${getPathname({
          locale: defaultReleasedLocale,
          href: buildHref('/reports/[report]/[chapter]', {
            report: reportSlugForLocale(defaultReleasedLocale),
            chapter: chapterSlugForLocale(defaultReleasedLocale),
          }),
        })}`,
        ...(reportLastModified ? { lastModified: reportLastModified } : {}),
        alternates: chapterAlternates,
      });
    });
  });

  return items;
}