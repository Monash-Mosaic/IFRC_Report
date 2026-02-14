import { getTranslations } from 'next-intl/server';
import { getPathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { getBaseUrl } from '@/lib/base-url';
import { isLocaleReleased } from '@/reports/release';
import Breadcrumb from '@/components/Breadcrumb';

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({
    namespace: 'About',
    locale,
  });
  const title = t('pageTitle');
  const description = t('topicHeading');
  const canonical = getPathname({ locale, href: '/about' });
  const languages = routing.locales
    .filter((loc) => isLocaleReleased(loc))
    .map((loc) => [loc, getPathname({ locale: loc, href: '/about' })]);
  languages.push(['x-default', '/about']);
  const image = new URL('/wdr25/ifrc_logo.jpg', getBaseUrl()).toString();

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: Object.fromEntries(languages),
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale,
      url: canonical,
      images: [
        {
          url: image,
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
      images: [image],
    },
  };
}

export default async function AboutPage({ params }) {
  const { locale } = await params;
  const t = await getTranslations({
    namespace: 'About',
    locale,
  });
  const aboutJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: t('pageTitle'),
    description: t('topicHeading'),
    inLanguage: locale,
    url: new URL(getPathname({ locale, href: '/about' }), getBaseUrl()).toString(),
  };

  return (
    <div className="bg-white text-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />

      <section className="max-w-6xl mx-auto px-4">
        <Breadcrumb
          locale={locale}
          items={[
            { label: t('breadcrumbCurrent') }
          ]}
        />
      </section>

      {/* Page title */}
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-8">
        <h1 className="text-4xl md:text-6xl font-bold text-center">
          {t('pageTitle')}
        </h1>
      </section>

      {/* Main content block */}
      <section className="max-w-6xl mx-auto px-4 pb-14">
        <div className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm p-6 md:p-10">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">
            {t('topicHeading')}
          </h2>

          <p className="leading-relaxed text-sm md:text-base whitespace-pre-line">
            {t('body')}
          </p>
        </div>
      </section>

      {/* Mini notes */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 gap-10 text-sm">
          {/* Left column */}
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-1">{t('coverPhotoTitle')}</h3>
              <p className="whitespace-pre-line">{t('coverPhotoText')}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-1">{t('insidePhotosTitle')}</h3>
              <p className="whitespace-pre-line">{t('insidePhotosText')}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-1">{t('contactUsTitle')}</h3>
              <p className="whitespace-pre-line">{t('contactUsText')}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-1">{t('addressTitle')}</h3>
              <p className="whitespace-pre-line">{t('addressText')}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-1">{t('postalAddressTitle')}</h3>
              <p className="whitespace-pre-line">{t('postalAddressText')}</p>
            </div>

            <div className="whitespace-pre-line">
              {t('contactLine')}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <div>
              <p className="font-semibold whitespace-pre-line">
                {t('copyrightTitle')}
              </p>
              <p className="whitespace-pre-line">
                {t('copyrightText')}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-1">{t('isbnTitle')}</h3>
              <p className="whitespace-pre-line">{t('isbnText')}</p>
            </div>

            {/* PDF URL */}
            <div>
              <h3 className="font-semibold mb-1">{t('pdfUrlTitle')}</h3>
              <a
                href={t('pdfUrlText')}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-red-600 transition-colors break-words font-semibold"
              >
                {t('pdfUrlText')}
              </a>
            </div>

            {/* Web URL */}
            <div>
              <h3 className="font-semibold mb-1">{t('webUrlTitle')}</h3>
              <a
                href={t('webUrlText')}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-red-600 transition-colors break-words font-semibold"
              >
                {t('webUrlText')}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
