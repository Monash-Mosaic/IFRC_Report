'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { X, Linkedin, Youtube, Instagram, Facebook, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function Footer() {
  const [openSection, setOpenSection] = useState(null);
  const t = useTranslations('Home');

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <footer className="w-full bg-white border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Main Footer Layout */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start space-y-12 lg:space-y-0">
          {/* Content Sections - Shows first on mobile, second on desktop */}
          <div className="lg:w-2/3 lg:pl-12 order-1 lg:order-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-12">
              {/* Report Chapters */}
              <div>
                {/* Mobile Dropdown Header */}
                <button
                  onClick={() => toggleSection('chapters')}
                  className="md:hidden w-full flex justify-between items-center py-4 border-b border-gray-200 text-left"
                  aria-expanded={openSection === 'chapters'}
                >
                  <h4 className="text-lg font-semibold text-gray-900">
                    {t('footer.chapters.title')}
                  </h4>
                  <ChevronDown
                    size={20}
                    className={`text-gray-900 transform transition-transform ${openSection === 'chapters' ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Desktop Header */}
                <h4 className="hidden md:block text-lg font-semibold text-gray-900 mb-6">
                  {t('footer.chapters.title')}
                </h4>

                {/* Content */}
                <ul
                  className={`space-y-4 md:block ${openSection === 'chapters' ? 'block mt-4' : 'hidden'}`}
                >
                  <li>
                    <Link
                      href="#chapter1"
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {t('footer.chapters.chapter1')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#chapter2"
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {t('footer.chapters.chapter2')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#chapter3"
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {t('footer.chapters.chapter3')}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Disinformation Games */}
              <div>
                {/* Mobile Dropdown Header */}
                <button
                  onClick={() => toggleSection('games')}
                  className="md:hidden w-full flex justify-between items-center py-4 border-b border-gray-200 text-left"
                  aria-expanded={openSection === 'games'}
                >
                  <h4 className="text-lg font-semibold text-gray-900">{t('footer.games.title')}</h4>
                  <ChevronDown
                    size={20}
                    className={`text-gray-900 transform transition-transform ${openSection === 'games' ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Desktop Header */}
                <h4 className="hidden md:block text-lg font-semibold text-gray-900 mb-6">
                  {t('footer.games.title')}
                </h4>

                {/* Content */}
                <ul
                  className={`space-y-4 md:block ${openSection === 'games' ? 'block mt-4' : 'hidden'}`}
                >
                  <li>
                    <Link
                      href="#disinformer"
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {t('footer.games.disinformer')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#ctrl-alt-prebunk"
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {t('footer.games.ctrlAltPrebunk')}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

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
                  <Image
                    src="/wdr25/ifrc_logo.png"
                    alt="IFRC"
                    width={120}
                    height={40}
                    className="h-10 w-auto"
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <Image
                    src="/wdr25/mosaic_logo.png"
                    alt="Mosaic"
                    width={120}
                    height={40}
                    className="h-10 w-auto -ml-4"
                  />
                </div>
              </div>
            </div>

            {/* Social Media Icons */}
            <div className="border-gray-200 pt-3 lg:pt-6">
              <div className="flex space-x-3 justify-center lg:justify-start">
                <Link
                  href="#facebook"
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
                  aria-label={t('footer.social.facebook')}
                >
                  <Facebook size={20} />
                </Link>
                <Link
                  href="#linkedin"
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
                  aria-label={t('footer.social.linkedin')}
                >
                  <Linkedin size={20} />
                </Link>
                <Link
                  href="#youtube"
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
                  aria-label={t('footer.social.youtube')}
                >
                  <Youtube size={20} />
                </Link>
                <Link
                  href="#instagram"
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
