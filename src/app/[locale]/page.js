import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import Header from '@/components/Header';
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
  const year = new Date().getFullYear();
  
  // Get the report data for the current locale and serialize it
  const reportModule = reportsByLocale[locale]?.reports?.wdr25;
  const reportData = reportModule ? JSON.parse(JSON.stringify(reportModule)) : null;
  const { title, testimonialsList } = reportData.landingPage.testimonials;
  const featuredVideosData = reportData.landingPage.featuredVideos;
  
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header />

      <main className="max-w-6xl mx-auto px-4 space-y-16 py-8">
        <HeroSection reportData={reportData} locale={locale} />
        <ExecutiveSummarySection reportData={reportData} locale={locale} />

        {/* Featured Videos Section */}
        <Carousel
          title={featuredVideosData.title}
          items={featuredVideosData.videos}
          cardComponent={VideoCard}
          cardType="video"
          cardWidth={524}
          gap={24}
          showDots={true}
          showArrows={true}
        />

        {/* Citations Section */}
        <Carousel
          title={title}
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
