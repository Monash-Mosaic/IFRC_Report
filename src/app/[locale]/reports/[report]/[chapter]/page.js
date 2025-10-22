import 'server-only'

import { ArrowLeft, Copy, Share2 } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { notFound } from 'next/navigation'

import { reportsByLocale } from "@/reports"

export async function generateMetadata(
  { params }
) {
  const { report, chapter, locale } = await params
  const decodedReport = decodeURIComponent(report);
  const decodedChapter = decodeURIComponent(chapter);
  const { title, subtitle } = reportsByLocale[locale][decodedReport].chapters[decodedChapter];
  return {
    title: title,
    description: subtitle,
  }
}

export async function generateStaticParams() {
  const params = [];
  for (const locale of Object.keys(reportsByLocale)) {
    const reports = reportsByLocale[locale];
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
  if (!reportsByLocale[locale] || !reportsByLocale[locale][decodedReport] || !reportsByLocale[locale][decodedReport].chapters[decodedChapter]) {
    notFound()
  }
  const { chapters, title: reportTile } = reportsByLocale[locale][decodedReport];
  const { component: Chapter, title: chapterTitle, subtitle: chapterSubTitle } = chapters[decodedChapter];
  const t = await getTranslations('ReportChapterPage', locale);

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <button
          // onClick={() => router.push("/interactive")}
          className="flex items-center gap-2 text-black hover:text-gray-600 mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold">{t('back')}</span>
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-6">{reportTile}</h1>
        </div>

        <div className="mb-8">
          {(
            <>
              <span className="text-black font-medium">{chapterTitle}</span>
              <span className="text-black mx-2">&gt;</span>
              <span className="text-black font-medium">{chapterSubTitle}</span>
            </>
          )}
        </div>

        <div className="mb-12">
          <article
            className="grid grid-cols-1 gap-8 text-black leading-relaxed"
            // onMouseUp={handleTextSelection}
          >
              <Chapter /> 
          </article>
        </div>

      </div>
    </div>
  )
}