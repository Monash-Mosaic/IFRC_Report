import { Menu, Bookmark, ChevronDown, ArrowLeft } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { reportsByLocale } from '@/reports';
import LocaleSwitcher from '@/components/LocaleSwitcher';

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
  const { chapters, title: reportTile } = reportsByLocale[locale].reports[decodedReport];
  const expandedSections = new Set();
  const bookmarkedSections = new Set();
  const activeMenu = 'toc';
  const t = await getTranslations('ReportDetailPage', locale);

  const displayedSections = Object.entries(chapters).map(([chapterKey, chapter]) => ({
    name: chapter.title,
    progress: 0,
    summary: [chapter.subtitle],
    slug: chapterKey,
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link href={'./'} className="flex items-center gap-2 text-black hover:text-gray-600 mb-8">
          <ArrowLeft className="w-5 h-5" />
          <p className="font-semibold">{t('backToDocuments')}</p>
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-6">{reportTile}</h1>

          {/* Overall Progress Bar */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div className="bg-gray-800 h-2 rounded-full w-1/2"></div>
            </div>
            <span className="text-lg font-semibold">50%</span>
          </div>
        </div>

        {/* Navigation Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            className={`flex items-center gap-3 ${
              activeMenu === 'toc' ? 'text-black' : 'text-gray-500'
            }`}
          >
            <Menu className="w-5 h-5" />
            <span className="font-semibold text-lg">{t('tableOfContent')}</span>
          </button>
          <button
            className={`flex items-center gap-3 ${
              activeMenu === 'bookmark' ? 'text-black' : 'text-gray-500'
            }`}
          >
            <Bookmark className="w-5 h-5" />
            <span className="font-semibold text-lg">{t('bookmark')}</span>
          </button>
        </div>

        <div className="mb-8">
          <div
            className={`h-1 bg-red-500 mb-2 transition-all duration-300 ${
              activeMenu === 'toc' ? 'w-1/2' : 'w-1/2 ml-auto'
            }`}
          ></div>
          <div className="w-full h-px bg-gray-300"></div>
        </div>

        {/* Content Area */}
        <div className="p-6 bg-white rounded-lg shadow">
          {activeMenu === 'bookmark' && displayedSections.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">No bookmarked sections yet.</p>
              <p className="text-sm mt-2">Click the bookmark icons to save sections for later.</p>
            </div>
          )}

          {displayedSections.map((section, index) => (
            <div key={section.name} className="bg-gray-100 p-6 rounded-lg shadow mb-6">
              <div className="flex items-center justify-between py-6">
                <div className="flex items-center gap-3 flex-1">
                  <span className="font-semibold text-lg text-black">{section.name}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-600 cursor-pointer ${
                      expandedSections.has(section.name) ? 'rotate-180' : ''
                    }`}
                  />
                </div>
                <button
                  aria-label={t('bookmarkAria', {
                    section: section.name,
                    action: bookmarkedSections.has(section.name) ? 'remove' : 'add',
                  })}
                >
                  <Bookmark
                    className={`w-5 h-5 mr-4 transition-colors ${
                      bookmarkedSections.has(section.name)
                        ? 'text-blue-600'
                        : 'text-gray-600 hover:text-blue-400'
                    }`}
                    fill={bookmarkedSections.has(section.name) ? 'currentColor' : 'none'}
                  />
                </button>
              </div>

              {/* Progress Bar and Continue Button */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gray-800 h-2 rounded-full"
                    style={{ width: `${section.progress}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium mr-4">{section.progress}%</span>
                <Link
                  className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-2 rounded"
                  href={`./${decodedReport}/${section.slug}`}
                >
                  {t('sections.continue')}
                </Link>
              </div>

              {/* Summary List */}
              {expandedSections.has(section.name) && (
                <ul className="ml-8 mb-4 list-disc text-gray-700">
                  {section.summary.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
