import { ArrowLeft } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { reportsByLocale } from '@/reports';
import { Link } from '@/i18n/navigation';
import SidebarPanel from '@/components/SidebarPanel';

export async function generateMetadata({ params }) {
  const { report, chapter, locale } = await params;
  const decodedReport = decodeURIComponent(report);
  const decodedChapter = decodeURIComponent(chapter);
  const { title, subtitle } =
    reportsByLocale[locale].reports[decodedReport].chapters[decodedChapter];
  return {
    title: title,
    description: subtitle,
  };
}

export async function generateStaticParams() {
  const params = [];
  for (const locale of Object.keys(reportsByLocale)) {
    const reports = reportsByLocale[locale].reports;
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
    !reportsByLocale[locale].reports[decodedReport].chapters[decodedChapter]
  ) {
    notFound();
  }
  setRequestLocale(locale);
  const { chapters, title: reportTile, media } = reportsByLocale[locale].reports[decodedReport];
  const {
    component: Chapter,
    title: chapterTitle,
    subtitle: chapterSubTitle,
  } = chapters[decodedChapter];

  // Extract media for the current chapter
  const chapterMedia = media?.[decodedChapter] || { audios: [], videos: [] };
  
  const t = await getTranslations('ReportChapterPage', locale);

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar Panel */}
      <SidebarPanel
        chapterTitle={chapterTitle}
        audios={chapterMedia.audios}
        videos={chapterMedia.videos}
      />
      
      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <Link className="flex items-center gap-2 text-black hover:text-gray-600 mb-8" href={`./`}>
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">{t('back')}</span>
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-black mb-6">{reportTile}</h1>
          </div>

          <div className="mb-8 text-black text-4xl font-extrabold">{chapterTitle}</div>

          <div className="mb-8 text-black text-3xl font-bold">{chapterSubTitle}</div>

          <div className="mb-12">
            <article className="grid grid-cols-1 gap-8 text-black leading-relaxed">
              <Chapter />
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}
