import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import Footer from '@/components/Footer';
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}

      <main className="max-w-6xl mx-auto px-4 space-y-16 py-8">
        <HeroSection locale={locale} />
        <ExecutiveSummarySection locale={locale} />

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

      {/* Footer */}
      <Footer />
    </div>
  );
}
