import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import Header from '@/components/Header';
import HeroSection from '@/components/landing-page/HeroSection';
import ExecutiveSummarySection from '@/components/landing-page/ExecutiveSummarySection';
import FeaturedVideosSection from '@/components/landing-page/FeaturedVideosSection';
import CitationsSection from '@/components/landing-page/CitationsSection';
import { reportsByLocale } from '@/reports';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations('Home', locale);
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function Home({ params }) {
  const { locale } = await params;
  const t = await getTranslations('Home', locale);
  const year = new Date().getFullYear();
  
  // Get the report data for the current locale and serialize it
  const reportModule = reportsByLocale[locale]?.reports?.wdr25;
  const reportData = reportModule ? JSON.parse(JSON.stringify(reportModule)) : null;
  
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header />

      <main className="max-w-6xl mx-auto px-4 space-y-16 py-8">
        <HeroSection reportData={reportData} locale={locale} />
        <ExecutiveSummarySection reportData={reportData} locale={locale} />
        <FeaturedVideosSection reportData={reportData} locale={locale} />
        <CitationsSection reportData={reportData} />
      </main>

      {/* Footer */}
      <footer className="w-full">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">
              {t('footer.copyright', { year })}
            </p>
            <div className="flex justify-center space-x-6">
              <Link href="#privacy" className="hover:text-gray-900">{t('footer.privacyPolicy')}</Link>
              <Link href="#terms" className="hover:text-gray-900">{t('footer.termsOfService')}</Link>
              <Link href="#contact" className="hover:text-gray-900">{t('footer.contact')}</Link>
            </div>
            <p className="mt-2 text-sm">{t('footer.orgFull')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
