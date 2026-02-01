import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { getPathname } from '@/i18n/navigation';
import HeroMediaBlock from '@/components/landing-page/HeroMediaBlock';

/** @return {import('next').Metadata} */
export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations('ComingSoon', locale);
  const title = t('meta.title');
  const description = t('meta.description');
  const canonical = getPathname({ locale, href: '/coming-soon' });
  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale,
      url: canonical,
      images: [
        {
          url: '/opengraph-image',
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
      images: ['/twitter-image'],
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function ComingSoonPage({ params }) {
  const { locale } = await params;
  const t = await getTranslations('Home', locale);
  const message = {
    title: t('landingPage.heroSection.title'),
    description: t('landingPage.heroSection.description'),
    heroAlt: t('landingPage.heroSection.heroAlt'),
  }
  return (
    <main className="max-w-full md:max-w-8/10 py-4 mx-auto px-4 space-y-16">
      <HeroMediaBlock
        title={message.title}
        description={message.description}
        heroAlt={message.heroAlt}
      />
    </main>
  );
}
