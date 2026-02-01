import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import HeroSection from '@/components/landing-page/HeroSection';
import ExecutiveSummarySection from '@/components/landing-page/ExecutiveSummarySection';
import { getVisibleReports, isLocaleReleased } from '@/reports';
import EmblaCarousel from '@/components/EmblaCarousel';
import VideoCard from '@/components/landing-page/VideoCard';
import TestimonialCard from '@/components/landing-page/TestimonialCard';
import { getPathname } from '@/i18n/navigation';
import { getBaseUrl } from '@/lib/base-url';

/** @return {import('next').Metadata} */
export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations('Home', locale);
  const title = t('meta.title');
  const description = t('meta.description');
  const canonical = getPathname({ locale, href: '/' });
  const languages = routing.locales
    .filter((loc) => isLocaleReleased(loc))
    .map((loc) => [loc, getPathname({ locale: loc, href: '/' })]);
  languages.push(['x-default', '/']);

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
          url: '/wdr25/ifrc_logo.jpg',
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
      images: ['/wdr25/ifrc_logo.jpg'],
    },
  };
}

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function Home({ params }) {
  const { locale } = await params;
  const t = await getTranslations('Home', locale);
  const baseUrl = getBaseUrl();

  // Get the report data for the current locale
  const reportModule = getVisibleReports(locale)?.wdr25;
  const testimonialsList = reportModule?.testimonialsList || [];
  const featuredVideos = reportModule?.featuredVideos || [];

  // Executive Summary translations
  const executiveSummary = {
    title: t('landingPage.executiveSummary.title'),
    summaryAlt: t('landingPage.executiveSummary.summaryAlt'),
    subtitle: t('landingPage.executiveSummary.subtitle'),
    description: t('landingPage.executiveSummary.description'),
    buttonTexts: {
      read: t('landingPage.executiveSummary.buttonTexts.read'),
      download: t('landingPage.executiveSummary.buttonTexts.download'),
    },
  };

  // Hero Section translations
  const heroMessage = {
    title: t('landingPage.heroSection.title'),
    description: t('landingPage.heroSection.description'),
    heroAlt: t('landingPage.heroSection.heroAlt'),
    buttonTexts: {
      read: t('landingPage.heroSection.buttonTexts.read'),
      download: t('landingPage.heroSection.buttonTexts.download'),
      share: t('landingPage.heroSection.buttonTexts.share'),
    },
  };

  const homeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: t('meta.title'),
    description: t('meta.description'),
    url: new URL(getPathname({ locale, href: '/' }), baseUrl).toString(),
    inLanguage: locale,
  };

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      <main className="max-w-full md:max-w-8/10 py-4 mx-auto px-4 space-y-16">
        <HeroSection locale={locale} messages={heroMessage} />
        <ExecutiveSummarySection locale={locale} messages={executiveSummary} />

        {/* Featured Videos Section */}
        <div>
          <h2 className="text-4xl md:text-5xl font-bold mb-8 text-gray-900">
            {t('landingPage.featuredVideos.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredVideos.map((video, index) => (
              <VideoCard
                key={index}
                title={video.title}
                description={video.description}
                url={video.url}
              />
            ))}
          </div>
        </div>

        {/* Citations Section */}
        <div>
          <h2 className="text-4xl md:text-5xl font-bold mb-8 text-gray-900">
            {t('landingPage.testimonials.title')}
          </h2>
          <EmblaCarousel slideWidth={284} loop={false}>
            {testimonialsList.map((testimonial, index) => (
              <TestimonialCard
                key={index}
                quote={testimonial.quote}
                name={testimonial.name}
                country={testimonial.country}
                avatar={testimonial.avatar}
              />
            ))}
          </EmblaCarousel>
        </div>
      </main>
    </div>
  );
}
