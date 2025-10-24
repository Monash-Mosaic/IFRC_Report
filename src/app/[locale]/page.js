import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import LocaleSwitcher from '@/components/LocaleSwitcher';

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
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Image
                src="/globe.svg"
                alt={t('nav.logoAlt')}
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <span className="text-xl font-bold text-gray-900">{t('nav.brand')}</span>
            </div>
            <div className="flex items-center gap-4">
              <LocaleSwitcher />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-8">
            <Image
              src="/globe.svg"
              alt={t('hero.globeAlt')}
              width={120}
              height={120}
              className="mx-auto mb-6 opacity-80"
            />
            <h1 className="text-5xl font-bold text-gray-900 mb-6">{t('hero.title')}</h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">{t('hero.description')}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/reports"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl"
            >
              <Image src="/file.svg" alt={t('cta.documentsIconAlt')} width={24} height={24} />
              {t('cta.browseDocuments')}
            </Link>
          </div>

          {/* Features */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Image
                  src="/file.svg"
                  alt={t('features.document.iconAlt')}
                  width={24}
                  height={24}
                  className="text-blue-600"
                />
              </div>
              <div className="text-lg font-semibold text-gray-900 mb-2">
                {t('features.document.title')}
              </div>
              <p className="text-gray-600">{t('features.document.description')}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Image
                  src="/globe.svg"
                  alt={t('features.global.iconAlt')}
                  width={24}
                  height={24}
                  className="text-green-600"
                />
              </div>
              <div className="text-lg font-semibold text-gray-900 mb-2">
                {t('features.global.title')}
              </div>
              <p className="text-gray-600">{t('features.global.description')}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Image
                  src="/window.svg"
                  alt={t('features.analytics.iconAlt')}
                  width={24}
                  height={24}
                  className="text-purple-600"
                />
              </div>
              <div className="text-lg font-semibold text-gray-900 mb-2">
                {t('features.analytics.title')}
              </div>
              <p className="text-gray-600">{t('features.analytics.description')}</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>{t('footer.copyright', { year })}</p>
            <p className="mt-2 text-sm">{t('footer.orgFull')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
