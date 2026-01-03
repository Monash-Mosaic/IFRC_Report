'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import LocaleSwitcher from '@/components/LocaleSwitcher';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = useTranslations('Home');

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="w-full">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Image src="/wdr25/ifrc_logo.png" alt="Logo" width={128} height={128}/>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="#games" className="text-gray-700 hover:text-gray-900 text-sm font-medium">
            {t('nav.games')}
          </Link>
          
          {/* Buttons */}
          <LocaleSwitcher />
          <div className="relative">
            <input 
              type="text" 
              placeholder={t('nav.search')}
              className="w-auto px-4 py-2 border-2 border-red-600 text-red-600 rounded-lg font-medium focus:outline-none focus:ring-0 bg-white placeholder-red-400"
            />
            <svg 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </nav>

        {/* Mobile menu button */}
        <button 
          onClick={toggleMobileMenu}
          className="md:hidden p-2 text-gray-700 hover:text-gray-900 transition-colors"
          aria-label="Toggle mobile menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
            />
          </svg>
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <nav className="max-w-6xl mx-auto px-4 py-4 space-y-4">
            <Link 
              href="#games" 
              className="block text-gray-700 hover:text-gray-900 text-sm font-medium py-2 border-b border-gray-100"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('nav.games')}
            </Link>
            
            <div className="py-2">
              <LocaleSwitcher />
            </div>
            
            <div className="relative">
              <input 
                type="text" 
                placeholder={t('nav.search')}
                className="w-full px-4 py-3 border-2 border-red-600 text-red-600 rounded-lg font-medium focus:outline-none focus:ring-0 bg-white placeholder-red-400"
              />
              <svg 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}