'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { X, Linkedin, Youtube, Instagram, Facebook, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function Footer() {
  const [openSection, setOpenSection] = useState(null);
  const t = useTranslations('Home');
  const tAbout = useTranslations('About');

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <footer className="w-full bg-white border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Main Footer Layout */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start space-y-12 lg:space-y-0">

          {/* Logos and Social Media - Shows second on mobile, first on desktop */}
          <div className="lg:w-1/3 space-y-4 lg:space-y-8 order-2 lg:order-1 text-center lg:text-left">
            {/* Logo Section */}
            <div className="space-y-6">
              {/* IFRC Section */}
              <div className="flex flex-col items-center lg:items-start">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t('footer.worldDisastersReport')}
                </h3>
                <div className="flex items-center space-x-3 mb-4">
                  <Link
                    href="https://www.ifrc.org"
                    className="block"
                    aria-label={`IFRC - ${tAbout('topicHeading')}`}
                  >
                  <Image
                    src="/wdr25/ifrc_logo.jpg"
                    alt="IFRC"
                    width={120}
                    height={40}
                    className="h-10 w-auto"
                  />
                  </Link>
                </div>
                <div className="flex items-center space-x-3">
                  <Link
                    href="https://www.mosaic-monash.ai/"
                    className="block"
                    aria-label="Monash Mosaic"
                  >
                  <Image
                    src="/wdr25/mosaic_logo.png"
                    alt="Monash Mosaic"
                    width={120}
                    height={40}
                    className="h-10 w-auto -ml-4"
                  />
                  </Link>
                </div>
              </div>
            </div>

            {/* Social Media Icons */}
            <div className="border-gray-200 pt-3 lg:pt-6">
              <div className="flex space-x-3 justify-center lg:justify-start">
                <Link
                  href="https://www.facebook.com/p/IFRC-Solferino-Academy-61572985566986/"
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
                  aria-label={t('footer.social.facebook')}
                >
                  <Facebook size={20} />
                </Link>
                <Link
                  href="https://www.linkedin.com/company/ifrc-solferino-academy"
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
                  aria-label={t('footer.social.linkedin')}
                >
                  <Linkedin size={20} />
                </Link>
                <Link
                  href="https://www.instagram.com/ifrcsolferinoacademy/"
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
                  aria-label={t('footer.social.instagram')}
                >
                  <Instagram size={20} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
