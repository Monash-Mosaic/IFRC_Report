import { getTranslations } from 'next-intl/server';
import { getPathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import Image from 'next/image';
import { getBaseUrl } from '@/lib/base-url';
import { reportsByLocale } from '@/reports';
import { isLocaleReleased } from '@/reports/release';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({
    namespace: 'Acknowledgements',
    locale,
  });
  const title = t('meta.title');
  const description = t('meta.description');
  const canonical = getPathname({ locale, href: '/acknowledgement' });
  const languages = routing.locales
    .filter((loc) => isLocaleReleased(loc))
    .map((loc) => [loc, getPathname({ locale: loc, href: '/acknowledgement' })]);
  languages.push(['x-default', '/acknowledgement']);
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

export default async function AcknowledgementsPage({ params }) {
  const { locale } = await params;
  const t = await getTranslations({
    namespace: 'Acknowledgements',
    locale,
  });
  const contributorsByLabel =
    reportsByLocale[locale]?.acknowledgementContributors;
  if (!contributorsByLabel) {
    notFound();
  }
  const acknowledgementJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: t('meta.title'),
    description: t('meta.description'),
    inLanguage: locale,
    url: new URL(getPathname({ locale, href: '/acknowledgement' }), getBaseUrl()).toString(),
  };

  return (
    <div className="bg-white text-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(acknowledgementJsonLd) }}
      />
      {/* Page title */}
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-8">
        <h1 className="text-4xl md:text-6xl font-bold text-center">
          {t('pageTitle')}
        </h1>
      </section>

      {/* Main content */}
      <section className="max-w-6xl mx-auto px-4 pb-14">
        <div className="bg-gray-100 border border-gray-200 rounded-2xl shadow-sm p-6 md:p-10 space-y-8">

          {/* Intro */}
          <p className="text-sm md:text-base leading-relaxed whitespace-pre-line">
            {t.rich('intro', {
              bold: (chunk) => <strong>{chunk}</strong>
            })}
          </p>

          {/* Contributors */}
          <div className="space-y-6 py-4">
            {Object.keys(contributorsByLabel).map((label) => {
              const contributors = [...(contributorsByLabel[label] || [])].sort(
                (a, b) => a.order - b.order
              );
              if (!contributors.length) {
                return null;
              }
              return (
                <div key={label} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-5 gap-y-6">
                  {contributors.map((logo) => (
                    <div
                      key={`${label}-${logo.order}`}
                      className="bg-white rounded-lg flex justify-center w-full shadow-md p-3"
                    >
                      <Image
                        src={logo.src}
                        alt={logo.alt}
                        width={200}
                        height={80}
                        sizes="(min-width: 768px) 300px, 200px"
                        className="max-h-16 md:max-h-20 w-auto object-contain"
                      />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Translation acknowledgement */}
          <p className="text-sm md:text-base leading-relaxed whitespace-pre-line">
            {t('translation')}
          </p>

          {/* Credits */}
          <div className="space-y-1 text-sm md:text-base leading-snug">
            <p>{t('leadEditorLabel')} <strong>{t('leadEditor')}</strong></p>
            <p>{t('designerLabel')} <strong>{t('designer')}</strong></p>
            <p>{t('projectManagerLabel')} <strong>{t('projectManager')}</strong></p>
            <p>{t('copyeditorLabel')} <strong>{t('copyeditor')}</strong></p>
          </div>

          {/* Contributions */}
          <p className="text-sm md:text-base leading-relaxed whitespace-pre-line">
            {t('contributions')}
          </p>

          {/* Research acknowledgement */}
          <p className="text-sm md:text-base leading-relaxed whitespace-pre-line">
            {t.rich('research', {
              bold: (chunk) => <strong>{chunk}</strong>
            })}
          </p>

        </div>
      </section>
    </div>
  );
}
