import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';


export default function AboutPage() {
  const t = useTranslations('About');

  return (
    <div className="bg-white text-black">
        <section className="max-w-6xl mx-auto px-4 pt-6">
        <nav className="text-sm text-gray-600 flex items-center gap-2">
            <Link href="/" className="hover:text-red-600 transition-colors">
            {t('breadcrumbHome')}
            </Link>
            <span className="text-gray-400">{'>'}</span>
            <span className="text-red-600 font-medium">{t('breadcrumbCurrent')}</span>
        </nav>
        </section>
      {/* Page title */}
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-8">
        <h1 className="text-4xl md:text-6xl font-bold text-center text-black">
          {t('pageTitle')}
        </h1>
      </section>

      {/* Main content block */}
      <section className="max-w-6xl mx-auto px-4 pb-14">
        <div className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm p-6 md:p-10">
          <h2 className="text-xl md:text-2xl font-semibold text-black mb-4">
            {t('topicHeading')}
          </h2>

          <p className="text-black leading-relaxed text-sm md:text-base whitespace-pre-line">
            {t('body')}
          </p>
        </div>
      </section>

      {/* Mini notes */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 gap-10 text-sm text-black">
          {/* Left column */}
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-black mb-1">{t('coverPhotoTitle')}</h3>
              <p className="whitespace-pre-line text-black">{t('coverPhotoText')}</p>
            </div>

            <div>
              <h3 className="font-semibold text-black mb-1">{t('insidePhotosTitle')}</h3>
              <p className="whitespace-pre-line text-black">{t('insidePhotosText')}</p>
            </div>

            <div>
              <h3 className="font-semibold text-black mb-1">{t('contactUsTitle')}</h3>
              <p className="whitespace-pre-line text-black">{t('contactUsText')}</p>
            </div>

            <div>
              <h3 className="font-semibold text-black mb-1">{t('addressTitle')}</h3>
              <p className="whitespace-pre-line text-black">{t('addressText')}</p>
            </div>

            <div>
              <h3 className="font-semibold text-black mb-1">{t('postalAddressTitle')}</h3>
              <p className="whitespace-pre-line text-black">{t('postalAddressText')}</p>
            </div>

            <div className="whitespace-pre-line text-black">
              {t('contactLine')}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <div>
              <p className="font-semibold text-black whitespace-pre-line">
                {t('copyrightTitle')}
              </p>
              <p className="whitespace-pre-line text-black">
                {t('copyrightText')}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-black mb-1">{t('isbnTitle')}</h3>
              <p className="whitespace-pre-line text-black">{t('isbnText')}</p>
            </div>

            {/* PDF URL as hyperlink */}
            <div>
              <h3 className="font-semibold text-black mb-1">{t('pdfUrlTitle')}</h3>
              <a
                href={`https://${t('pdfUrlText')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-black hover:text-red-600 hover:underline hover:no-underline transition-colors duration-200 break-words font-semibold"
                >
                {t('pdfUrlText')}
              </a>

            </div>

            {/* Web URL as hyperlink */}
            <div>
              <h3 className="font-semibold text-black mb-1">{t('webUrlTitle')}</h3>
              <a
                href={`https://${t('webUrlText')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-black hover:text-red-600 hover:underline hover:no-underline transition-colors duration-200 break-words font-semibold"
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
