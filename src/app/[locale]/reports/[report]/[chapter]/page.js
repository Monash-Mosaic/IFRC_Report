import { ArrowLeft } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { getVisibleReports, isReportReleased, reportsByLocale, reportUriMap } from '@/reports';
import { getPathname, Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import SidebarPanel from '@/components/SidebarPanel';
import TableOfContent from '@/components/TableOfContent';


export async function generateMetadata({ params }) {
  const { locale, report, chapter } = await params;
  const decodedReport = decodeURIComponent(report);
  const decodedChapter = decodeURIComponent(chapter);
  const reportData = reportsByLocale[locale]?.reports?.[decodedReport];
  const chapterData = reportData?.chapters?.[decodedChapter];
  if (!reportData || !chapterData || !isReportReleased(locale, decodedReport)) {
    return {
      title: 'Chapter unavailable',
    };
  }
  const { title, subtitle } = chapterData;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
  const reportKey = reportUriMap.uri[locale][decodedReport];
  const chapterKey = reportUriMap[reportKey].chapters.uri[locale][decodedChapter];

  const buildHref = (chapterKey) => ({
    pathname: '/reports/[report]/[chapter]',
    params: { report: decodedReport, chapter: chapterKey },
  });
  const languages = Object.entries(reportUriMap[reportKey].chapters[chapterKey].languages)
          .map(([loc, uri]) => {
            const href = buildHref(uri);
            return [
              loc,
              new URL(getPathname({ locale: loc, href }), siteUrl).toString(),
            ];
          });
  languages.push([
    'x-default',
    languages.find(([loc, url]) => loc === routing.defaultLocale)[1].replace(`/${routing.defaultLocale}/`, '/'),
  ]);
  return {
    title: title,
    description: subtitle,
    alternates: {
      canonical: new URL(getPathname({ locale, href: buildHref(decodedChapter) }), siteUrl).toString(),
      languages: Object.fromEntries(languages),
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
  if (
    !reportsByLocale[locale] ||
    !reportsByLocale[locale].reports[decodedReport] ||
    !reportsByLocale[locale].reports[decodedReport].chapters[decodedChapter] ||
    !isReportReleased(locale, decodedReport)
  ) {
    notFound();
  }
  setRequestLocale(locale);
  const { chapters, title: reportTile } = reportsByLocale[locale].reports[decodedReport];
  const {
    component: Chapter,
    title: chapterTitle,
    subtitle: chapterSubTitle,
    audios = [],
    videos = [],
    tableOfContents: chapterTableOfContents,
  } = chapters[decodedChapter];

  const t = await getTranslations('ReportChapterPage', locale);

  return (
    <div className="min-h-screen bg-white flex  pl-8 pr-0 py-8">
      {/* Sidebar Panel */}
      <SidebarPanel chapterTitle={chapterTitle} audios={audios} videos={videos} />

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto flex gap-6">
          <div className="flex-1 max-w-4xl mx-auto">
            <Link
              className="flex items-center gap-2 text-black hover:text-gray-600 mb-8"
              href={`./`}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">{t('back')}</span>
            </Link>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-black mb-6">{reportTile}</h1>
            </div>

            <div className="mb-8 text-black text-4xl font-extrabold">{chapterTitle}</div>

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
              <article className="grid grid-cols-1 gap-8 text-black leading-relaxed">
                <Chapter />
              </article>
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
