import { useTranslations } from 'next-intl';

// Enable static generation
export const dynamic = 'force-static';

export default function AboutPage() {
  const t = useTranslations('About');

  return (
    <div className="bg-white text-black">
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
