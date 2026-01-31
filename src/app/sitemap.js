import { getPathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { reportsByLocale } from '@/reports';

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
      const reports = reportsByLocale[locale]?.reports || {};
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

  const homeLastModified = getLatestReleaseDate(locales);
  items.push({
    url: `${host}${getPathname({ locale: defaultLocale, href: '/' })}`,
    ...(homeLastModified ? { lastModified: homeLastModified } : {}),
    alternates: buildAlternates('/', undefined, locales),
  });

  const reportsLastModified = getLatestReleaseDate(locales);
  items.push({
    url: `${host}${getPathname({ locale: defaultLocale, href: '/reports' })}`,
    ...(reportsLastModified ? { lastModified: reportsLastModified } : {}),
    alternates: buildAlternates('/reports', undefined, locales),
  });

  const reportKeys = new Set();
  locales.forEach((locale) => {
    Object.keys(reportsByLocale[locale]?.reports || {}).forEach((key) => reportKeys.add(key));
  });

  reportKeys.forEach((reportKey) => {
    const localesWithReport = locales.filter(
      (locale) => reportsByLocale[locale]?.reports?.[reportKey]
    );
    if (!localesWithReport.length) {
      return;
    }
    const reportLastModified = getLatestReleaseDate(localesWithReport);
    items.push({
      url: `${host}${getPathname({
        locale: defaultLocale,
        href: buildHref('/reports/[report]', { report: reportKey }),
      })}`,
      ...(reportLastModified ? { lastModified: reportLastModified } : {}),
      alternates: buildAlternates('/reports/[report]', { report: reportKey }, localesWithReport),
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
      items.push({
        url: `${host}${getPathname({
          locale: defaultLocale,
          href: buildHref('/reports/[report]/[chapter]', {
            report: reportKey,
            chapter: chapterKey,
          }),
        })}`,
        ...(reportLastModified ? { lastModified: reportLastModified } : {}),
        alternates: buildAlternates(
          '/reports/[report]/[chapter]',
          { report: reportKey, chapter: chapterKey },
          localesWithChapter
        ),
      });
    });
  });

  return items;
}