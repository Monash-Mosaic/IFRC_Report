import { useTranslations } from 'next-intl';
import Image from 'next/image';

// Enable static generation
export const dynamic = 'force-static';

const CONTRIBUTORS = [
  { src: '/contributors/wdr26-logotypes-06.svg', alt: 'Australian Red Cross' },
  { src: '/contributors/wdr26-logotypes-02.svg', alt: 'Spanish Red Cross' },
  { src: '/contributors/wdr26-logotypes-09.svg', alt: 'Swedish Red Cross' },
  { src: '/contributors/wdr26-logotypes-05.svg', alt: 'Global Disaster Preparedness Center' },
  { src: '/contributors/wdr26-logotypes-04.svg', alt: 'American Red Cross' },
  { src: '/contributors/wdr26-logotypes-15.svg', alt: 'Chinese Red Cross' },
  { src: '/contributors/wdr26-logotypes-08.svg', alt: 'Canadian Red Cross' },
  { src: '/contributors/wdr26-logotypes-03.svg', alt: 'Italian Red Cross' },
  { src: '/contributors/wdr26-logotypes-07.svg', alt: 'Austrian Red Cross' },
  { src: '/contributors/wdr26-logotypes-10.svg', alt: 'German Red Cross' },
  { src: '/contributors/wdr26-logotypes-11.svg', alt: 'Japanese Red Cross Society' },
  { src: '/contributors/wdr26-logotypes-12.svg', alt: 'Danish Red Cross' },
  { src: '/contributors/wdr26-logotypes-13.svg', alt: 'Swiss Red Cross' },
  { src: '/contributors/wdr26-logotypes-14.svg', alt: 'Australian Government – DFAT' }
];

export default function AcknowledgementsPage() {
  const t = useTranslations('Acknowledgements');

  return (
    <div className="bg-white text-black">
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
            {t('intro')}
          </p>

          {/* Contributors */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-5 gap-y-6 py-4">
            {CONTRIBUTORS.map((logo, index) => (
              <div
                key={index}
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

          {/* Translation acknowledgement */}
          <p className="text-sm md:text-base leading-relaxed whitespace-pre-line">
            {t('translation')}
          </p>

          {/* Credits */}
          <div className="space-y-1 text-sm md:text-base leading-snug">
            <p><strong>{t('leadEditorLabel')}</strong> {t('leadEditor')}</p>
            <p><strong>{t('designerLabel')}</strong> {t('designer')}</p>
            <p><strong>{t('projectManagerLabel')}</strong> {t('projectManager')}</p>
            <p><strong>{t('copyeditorLabel')}</strong> {t('copyeditor')}</p>
          </div>

          {/* Contributions */}
          <p className="text-sm md:text-base leading-relaxed whitespace-pre-line">
            {t('contributions')}
          </p>

          {/* Research acknowledgement */}
          <p className="text-sm md:text-base leading-relaxed whitespace-pre-line">
            {t('research')}
          </p>

        </div>
      </section>
    </div>
  );
}
