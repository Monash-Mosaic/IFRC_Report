import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import LocaleSwitcher from '@/components/LocaleSwitcher';
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
      <header className="w-full">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Image src="/wdr25/ifrc_logo.png" alt="Logo" width={128} height={128}/>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#games" className="text-gray-700 hover:text-gray-900 text-sm font-medium">
              {t('nav.games')}
            </Link>
            
            {/* Buttons */}
            <LocaleSwitcher />
            <div className="relative">
              <input 
                type="text" 
                placeholder={t('nav.search')}
                className="w-auto px-4 py-2 border-2 border-red-600 text-red-600 rounded-lg font-medium focus:outline-none focus:ring-0 bg-white placeholder-red-400"
              />
              <svg 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </nav>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

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
