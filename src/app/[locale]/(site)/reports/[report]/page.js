import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';

import Breadcrumb from '@/components/Breadcrumb';
import ChapterCard from '@/components/ChapterCard';
import { getPathname } from '@/i18n/navigation';
import {
  getVisibleReports,
  isLocaleReleased,
  isReportReleased,
  reportsByLocale,
  reportUriMap,
} from '@/reports';
import { routing } from '@/i18n/routing';
import { getBaseUrl } from '@/lib/base-url';

/**
 *
 * @param {PageProps<'/[locale]/reports/[report]'>} param0
 * @returns {Promise<import('next').Metadata>}
 */
export async function generateMetadata({ params }) {
  const { locale, report } = await params;
  const decodedReport = decodeURIComponent(report);
  const reportData = reportsByLocale[locale]?.reports?.[decodedReport];
  const { title, description } = reportData;
  const canonical = getPathname({ locale, href: `/reports/${decodedReport}` });
  const reportKey = reportUriMap.uri[locale][decodedReport];
  const reportUrls = reportUriMap[reportKey];
  const languages = Object.entries(reportUrls.languages)
    .filter(([loc]) => isLocaleReleased(loc))
    .map(([loc, uri]) => [
      loc,
      getPathname({
        locale: loc,
        href: {
          pathname: '/reports/[report]',
          params: { report: uri },
        },
      }),
    ]);
  languages.push([
    'x-default',
    languages
      .find(([loc, url]) => loc === routing.defaultLocale)[1]
      .replace(`/${routing.defaultLocale}/`, '/'),
  ]);
  return {
    title: title,
    description: description,
    alternates: {
      canonical,
      languages: Object.fromEntries(languages),
    },
    openGraph: {
      title,
      description,
      type: 'article',
      locale,
      url: canonical,
      images: [
        {
          url: '/wdr25/ifrc_logo.jpg',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/wdr25/ifrc_logo.jpg'],
    },
  };
}

export async function generateStaticParams() {
  return Object.keys(reportsByLocale).reduce((params, locale) => {
    const reports = getVisibleReports(locale);
    Object.keys(reports).forEach((reportKey) => {
      params.push({ locale, report: reportKey });
    });
    return params;
  }, []);
}

/**
 *
 * @param {PageProps<'/[locale]/reports/[report]'>} param0
 * @returns {Promise<import('react').ReactElement>}
 */
export default async function ReportDetailPage({ params }) {
  const { locale, report } = await params;
  const decodedReport = decodeURIComponent(report);
  const baseUrl = getBaseUrl();
  const toAbsolute = (path) => (path.startsWith('http') ? path : `${baseUrl}${path}`);
  if (
    !hasLocale(Object.keys(reportsByLocale), locale) ||
    !reportsByLocale[locale].reports[decodedReport] ||
    !isReportReleased(locale, decodedReport)
  ) {
    notFound();
  }
  setRequestLocale(locale);
  const reportData = reportsByLocale[locale].reports[decodedReport];
  const { chapters, title: reportTile, description, author, releaseDate, reportFile } = reportData;
  const reportJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Report',
    name: reportTile,
    description,
    inLanguage: locale,
    datePublished: releaseDate ? new Date(releaseDate).toISOString().split('T')[0] : undefined,
    author: author ? { '@type': 'Organization', name: author } : undefined,
    url: toAbsolute(getPathname({ locale, href: `/reports/${decodedReport}` })),
    fileFormat: reportFile?.url ? 'application/pdf' : undefined,
    contentUrl: reportFile?.url ? toAbsolute(reportFile.url) : undefined,
  };
  const t = await getTranslations({
    namespace: 'ReportDetailPage',
    locale,
  });

  const chapterEntries = Object.entries(chapters)
    .map(([chapterKey, chapter]) => {
      const chapterNumber = chapter.metadata?.chapterNumber;
      const chapterPrefix = chapter.metadata?.chapterPrefix || '';
      const chapterLabel = chapterNumber
        ? `Chapter ${chapterNumber}`
        : chapterPrefix || 'Synthesis';

      return {
        key: chapterKey,
        label: chapterLabel,
        title: chapter.title,
        subtitle: chapter.subtitle,
        tableOfContents: chapter.tableOfContents || [],
        continueHref: {
          pathname: '/reports/[report]/[chapter]',
          params: { report: decodedReport, chapter: chapterKey },
        },
        thumbnail: chapter.thumbnail || null,
        thumbnailOverlay: chapter.thumbnailOverlay || 'red',
        released: chapter.released !== false,
        sortOrder: chapter.metadata.chapterNumber,
      };
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reportJsonLd) }}
      />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Breadcrumb
          locale={locale}
          items={[
            {
              label: t('breadcrumb.home'),
              href: '/',
            },
            { label: t('breadcrumb.chapters') },
          ]}
        />

        {/* Main Title */}
        <h1 className="text-4xl font-bold text-black mb-4 text-center">{t('pageTitle')}</h1>
        <hr className="border-gray-300 mb-10" />

        {/* Chapter Cards Grid */}
        <div className="grid gap-8 grid-cols-1">
          {chapterEntries.map((chapter) => (
            <ChapterCard
              key={chapter.key}
              chapterKey={chapter.key}
              chapterLabel={chapter.label}
              title={chapter.title}
              subtitle={chapter.subtitle}
              thumbnail={chapter.thumbnail}
              thumbnailOverlay={chapter.thumbnailOverlay}
              tableOfContents={chapter.tableOfContents}
              continueHref={chapter.continueHref}
              report={decodedReport}
              released={chapter.released}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
