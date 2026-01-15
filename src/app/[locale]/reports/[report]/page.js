import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';

import { reportsByLocale } from '@/reports';
import ReportDetailClient from '@/components/ReportDetailClient';

export async function generateMetadata({ params }) {
  const { locale, report } = await params;
  const decodedReport = decodeURIComponent(report);
  const { title, description } = reportsByLocale[locale].reports[decodedReport];
  return {
    title: title,
    description: description,
  };
}

export async function generateStaticParams() {
  return Object.keys(reportsByLocale).reduce((params, locale) => {
    const reports = reportsByLocale[locale].reports;
    Object.keys(reports).forEach((reportKey) => {
      params.push({ locale, report: reportKey });
    });
    return params;
  }, []);
}

export default async function ReportDetailPage({ params }) {
  const { locale, report } = await params;
  const decodedReport = decodeURIComponent(report);
  if (
    !hasLocale(Object.keys(reportsByLocale), locale) ||
    !reportsByLocale[locale].reports[decodedReport]
  ) {
    notFound();
  }
  setRequestLocale(locale);
  const { chapters, title: reportTitle } = reportsByLocale[locale].reports[decodedReport];
  const t = await getTranslations('ReportDetailPage', locale);

  const sections = Object.entries(chapters).map(([chapterKey, chapter]) => ({
    name: chapter.title,
    progress: 0,
    summary: [chapter.subtitle],
    slug: chapterKey,
  }));

  const translations = {
    backToDocuments: t('backToDocuments'),
    tableOfContent: t('tableOfContent'),
    bookmark: t('bookmark'),
    continue: t('sections.continue'),
    noBookmarks: 'No bookmarked sections yet.',
    noBookmarksHint: 'Click the bookmark icons to save sections for later.',
  };

  return (
    <ReportDetailClient
      sections={sections}
      reportTitle={reportTitle}
      decodedReport={decodedReport}
      translations={translations}
    />
  );
}
