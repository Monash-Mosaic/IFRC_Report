import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';

import {
  getVisibleReports,
  isLocaleReleased,
  isReportReleased,
  reportsByLocale,
  reportUriMap,
} from '@/reports';
import { getPathname, Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import TableOfContent from '@/components/TableOfContent';
import { getBaseUrl } from '@/lib/base-url';

import HighlightToolbar from '@/components/HighlightToolbar';

import ActiveHeadingTracker from '@/components/ActiveHeadingTracker';

export async function generateMetadata({ params }) {
  const { locale, report, chapter } = await params;
  const decodedReport = decodeURIComponent(report);
  const decodedChapter = decodeURIComponent(chapter);
  const reportData = reportsByLocale[locale]?.reports?.[decodedReport];
  const chapterData = reportData?.chapters?.[decodedChapter];
  const { title: reportTitle } = reportData;
  const {
    metadata: { chapterPrefix },
    title: chapterTitle,
  } = chapterData;
  const reportKey = reportUriMap.uri[locale][decodedReport];
  const chapterKey = reportUriMap[reportKey].chapters.uri[locale][decodedChapter];

  const buildHref = (chapterKey) => ({
    pathname: '/reports/[report]/[chapter]',
    params: { report: decodedReport, chapter: chapterKey },
  });
  const languages = Object.entries(reportUriMap[reportKey].chapters[chapterKey].languages)
    .filter(([loc]) => isLocaleReleased(loc))
    .map(([loc, uri]) => {
      const href = buildHref(uri);
      return [loc, getPathname({ locale: loc, href })];
    });
  languages.push([
    'x-default',
    languages
      .find(([loc, url]) => loc === routing.defaultLocale)[1]
      .replace(`/${routing.defaultLocale}/`, '/'),
  ]);
  const metaTitle = `${reportTitle} > ${chapterPrefix}`;
  const canonical = getPathname({ locale, href: buildHref(decodedChapter) });
  return {
    title: metaTitle,
    description: chapterTitle,
    alternates: {
      canonical,
      languages: Object.fromEntries(languages),
    },
    openGraph: {
      title: metaTitle,
      description: chapterTitle,
      type: 'article',
      locale,
      url: canonical,
      images: [
        {
          url: '/wdr25/ifrc_logo.jpg',
          width: 1200,
          height: 630,
          alt: metaTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: chapterTitle,
      images: ['/wdr25/ifrc_logo.jpg'],
    },
  };
}

export async function generateStaticParams() {
  const params = [];
  for (const locale of Object.keys(reportsByLocale)) {
    const reports = getVisibleReports(locale);
    for (const reportKey of Object.keys(reports)) {
      const report = reports[reportKey];
      for (const chapterKey of Object.keys(report.chapters)) {
        params.push({
          locale,
          report: reportKey,
          chapter: chapterKey,
        });
      }
    }
  }
  return params;
}

export default async function ReportChapterPage({ params }) {
  const { report, chapter, locale } = await params;
  const decodedReport = decodeURIComponent(report);
  const decodedChapter = decodeURIComponent(chapter);
  const baseUrl = getBaseUrl();
  const toAbsolute = (path) => (path.startsWith('http') ? path : `${baseUrl}${path}`);
  if (
    !reportsByLocale[locale] ||
    !reportsByLocale[locale].reports[decodedReport] ||
    !reportsByLocale[locale].reports[decodedReport].chapters[decodedChapter] ||
    !isReportReleased(locale, decodedReport)
  ) {
    notFound();
  }
  setRequestLocale(locale);
  const reportData = reportsByLocale[locale].reports[decodedReport];
  const { chapters, title: reportTile, description, author, releaseDate } = reportData;
  const {
    component: Chapter,
    title: chapterTitle,
    subtitle: chapterSubTitle,
    audios = [],
    videos = [],
    metadata: { chapterPrefix },
    tableOfContents: chapterTableOfContents,
    metadata: { chapterPrefix }
  } = chapters[decodedChapter];

  const chapterJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: chapterTitle,
    description: chapterSubTitle,
    inLanguage: locale,
    datePublished: releaseDate ? new Date(releaseDate).toISOString().split('T')[0] : undefined,
    author: author ? { '@type': 'Organization', name: author } : undefined,
    isPartOf: {
      '@type': 'Report',
      name: reportTile,
      description,
      url: toAbsolute(getPathname({ locale, href: `/reports/${decodedReport}` })),
    },
    url: toAbsolute(
      getPathname({
        locale,
        href: {
          pathname: '/reports/[report]/[chapter]',
          params: { report: decodedReport, chapter: decodedChapter },
        },
      })
    ),
  };

  const t = await getTranslations({
    namespace: 'ReportChapterPage',
    locale,
  });

  return (
    <div className="min-h-screen bg-white flex">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(chapterJsonLd) }}
      />
      {/* Sidebar Panel */}
      {/* <SidebarPanel chapterTitle={chapterTitle} audios={audios} videos={videos} /> */}

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto flex gap-6">
          <div className="flex-1 max-w-4xl mx-auto">
            <Breadcrumb
              locale={locale}
              items={[
                { 
                  label: reportTile,
                  href: {
                    pathname: '/reports/[report]',
                    params: {
                      report: decodedReport
                    }
                  }
                },
                { label: chapterPrefix }
              ]}
            />
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-black mb-6">{reportTile}</h1>
            </div>

            <div className="mb-8 text-black text-5xl font-extrabold text-right">{chapterTitle}</div>

            <div className="mb-8 text-black text-3xl font-bold">{chapterSubTitle}</div>

            <div className="xl:hidden mb-8">
              <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
                <TableOfContent
                  chapterTableOfContents={chapterTableOfContents}
                  title={t('tocTitle')}
                />
              </div>
            </div>

            <div className="mb-12">
              <div className="relative" id="highlight-layer-root">
                <ActiveHeadingTracker containerSelector="#highlight-layer-root" />

                <article className="grid grid-cols-1 gap-8 text-black leading-relaxed">
                  <Chapter />
                </article>

                <HighlightToolbar
                  hashtag="#IFRC"
                  whatsappSeparator="\n"
                  containerSelector="#highlight-layer-root"
                />
              </div>
            </div>
          </div>

          <div className="hidden xl:block w-80 flex-shrink-0">
            <div className="sticky right-4 top-8 p-6 mb-8 max-h-[80vh] overflow-y-auto">
              <TableOfContent
                chapterTableOfContents={chapterTableOfContents}
                title={t('tocTitle')}
              ></TableOfContent>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
