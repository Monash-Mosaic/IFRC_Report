import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function ComingSoonLayout({ children, params }) {
  const { locale } = await params;
  const t = await getTranslations({
    namespace: 'Home',
    locale,
  });
  return (
    <>
      <header className="w-full bg-white">
        <div className="max-w-9/10 md:max-w-8/10 mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href={'/'}>
              <Image src="/wdr25/ifrc_logo.jpg" alt="Logo" width={70} height={70} />
            </Link>
          </div>
          <p className="text-2xl font-bold uppercase tracking-wide text-gray-600 pe-4">
            {t('comingSoonLabel')}
          </p>
        </div>
      </header>
      <div className="min-h-screen bg-white">
        {children}
      </div>
    </>
  );
}
