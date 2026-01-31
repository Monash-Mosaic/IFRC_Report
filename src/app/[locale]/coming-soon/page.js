import { getTranslations } from 'next-intl/server';
import HeroMediaBlock from '@/components/landing-page/HeroMediaBlock';

export const metadata = {
  title: 'Coming soon',
  description: 'The IFRC World Disasters Report experience is launching soon.',
  robots: {
    index: false,
    follow: false,
  },
};

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
