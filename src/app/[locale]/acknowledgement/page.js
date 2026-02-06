import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';

export default function AcknowledgementsPage() {
    const t = useTranslations('Acknowledgements');

    return (
        <div className="bg-white text-black">
        {/* Breadcrumb */}
        <section className="max-w-6xl mx-auto px-4 pt-6">
            <nav className="text-sm text-gray-600 flex items-center gap-2">
            <Link href="/" className="hover:text-red-600 transition-colors">
                {t('breadcrumbHome')}
            </Link>
            <span className="text-gray-400">{'>'}</span>
            <span className="text-red-600 font-medium">
                {t('breadcrumbCurrent')}
            </span>
            </nav>
        </section>

        {/* Page title */}
        <section className="max-w-6xl mx-auto px-4 pt-12 pb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-center text-black">
            {t('pageTitle')}
            </h1>
        </section>

        {/* Main content card */}
        <section className="max-w-6xl mx-auto px-4 pb-14">
            <div className="bg-gray-100 border border-gray-200 rounded-2xl shadow-sm p-6 md:p-10 space-y-8">

            {/* Intro paragraph */}
            <p className="text-sm md:text-base leading-relaxed whitespace-pre-line">
                {t('intro')}
            </p>

            {/* Logos */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-5 gap-y-6 py-4">
            {[
                { src: '/contributors/aus-rc.svg', alt: 'Australian Red Cross' },
                { src: '/contributors/cruz-roja.svg', alt: 'Spanish Red Cross' },
                { src: '/contributors/swedish-rc.svg', alt: 'Swedish Red Cross' },
                { src: '/contributors/gdpc.svg', alt: 'Global Disaster Preparedness Center' },
                { src: '/contributors/American_Red_Cross_logo.svg', alt: 'American Red Cross' },
                { src: '/contributors/chinese-rc.svg', alt: 'Chinese Red Cross' },
                { src: '/contributors/canadian-rc.svg', alt: 'Canadian Red Cross' },
                { src: '/contributors/italian-rc.svg', alt: 'Italian Red Cross' },
                { src: '/contributors/austria-rc.svg', alt: 'Austrian Red Cross' },

                { src: '/contributors/german-rc.svg', alt: 'German Red Cross' },
                { src: '/contributors/japanese-rc.svg', alt: 'Japanese Red Cross Society' },
                { src: '/contributors/danish-rc.svg', alt: 'Danish Red Cross' },
                { src: '/contributors/swiss-rc.svg', alt: 'Swiss Red Cross' },

                { src: '/contributors/aus-dfat.svg', alt: 'Australian Government – DFAT' }
            ].map((logo, index) => (
                <div
                key={index}
                className="bg-white rounded-lg flex justify-center w-full shadow-md"
                >
                <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={0}
                    height={0}
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

            {/* Credits block */}
            <div className="space-y-1 text-sm md:text-base leading-snug">
            <p><strong>{t('leadEditorLabel')}</strong> {t('leadEditor')}</p>
            <p><strong>{t('designerLabel')}</strong> {t('designer')}</p>
            <p><strong>{t('projectManagerLabel')}</strong> {t('projectManager')}</p>
            <p><strong>{t('copyeditorLabel')}</strong> {t('copyeditor')}</p>
            </div>

            {/* Contributions section */}
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
