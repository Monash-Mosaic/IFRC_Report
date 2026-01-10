import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import HeroSection from '@/components/landing-page/HeroSection';
import ExecutiveSummarySection from '@/components/landing-page/ExecutiveSummarySection';
import { reportsByLocale } from '@/reports';
import Carousel from '@/components/Carousel';
import VideoCard from '@/components/landing-page/VideoCard';
import TestimonialCard from '@/components/landing-page/TestimonialCard';

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

  // Get the report data for the current locale
  const reportModule = reportsByLocale[locale]?.reports?.wdr25;
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

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-full md:max-w-8/10 py-4 mx-auto px-4 space-y-16">
        <HeroSection locale={locale} messages={heroMessage} />
        <ExecutiveSummarySection locale={locale} messages={executiveSummary} />

        {/* Featured Videos Section */}
        <Carousel
          title={t('landingPage.featuredVideos.title')}
          items={featuredVideos}
          cardComponent={VideoCard}
          cardType="video"
          cardWidth={524}
          gap={24}
          showDots={true}
          showArrows={true}
        />

        {/* Citations Section */}
        <Carousel
          title={t('landingPage.testimonials.title')}
          items={testimonialsList}
          cardComponent={TestimonialCard}
          cardType="testimonial"
          cardWidth={288}
          gap={24}
          showDots={true}
          showArrows={true}
        />
      </main>
    </div>
  );
}
