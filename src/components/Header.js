'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import SearchInput from './SearchInput';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const t = useTranslations('Home');

  // CSS class constants for reusability
  const buttonClasses = 'p-2 text-red-700 hover:text-red-900 transition-colors';
  const searchTransition = 'transition-all duration-300 ease-in-out';

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Navigation links data to avoid duplication
  const navigationLinks = [
    { href: '/about', label: t('nav.about') },
    { href: '/contributors', label: t('nav.contributors') },
  ];

  // Navigation links component to avoid duplication
  const NavLinks = ({ isMobile = false }) => (
    <>
      {navigationLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={
            isMobile
              ? 'block text-gray-700 hover:text-gray-900 text-sm font-medium py-2 border-b border-gray-100'
              : 'text-gray-700 hover:text-gray-900 text-sm font-medium'
          }
          onClick={isMobile ? () => setIsMobileMenuOpen(false) : undefined}
        >
          {link.label}
        </Link>
      ))}
    </>
  );

  return (
    <header className="w-full bg-white">
      <div className="max-w-9/10 md:max-w-8/10 mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Link href={'/'}>
            <Image src="/wdr25/ifrc_logo.png" alt="Logo" width={128} height={128} />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav
          className={`hidden md:flex items-center ${searchTransition} ${
            isSearchExpanded ? 'flex-1 ml-8' : 'space-x-8'
          }`}
        >
          {!isSearchExpanded && (
            <>
              <NavLinks />
              <LocaleSwitcher />
            </>
          )}

          <SearchInput
            isSearchExpanded={isSearchExpanded}
            setIsSearchExpanded={setIsSearchExpanded}
          />
        </nav>

        {/* Mobile Locale Switcher and Search */}
        <div
          className={`md:hidden flex items-center ${searchTransition} ${
            isSearchExpanded ? 'flex-1 ml-3' : 'space-x-3'
          }`}
        >
          {!isSearchExpanded && <LocaleSwitcher />}
          <SearchInput
            isMobile
            isSearchExpanded={isSearchExpanded}
            setIsSearchExpanded={setIsSearchExpanded}
          />
          {!isSearchExpanded && (
            <button
              onClick={toggleMobileMenu}
              className={buttonClasses}
              aria-label="Toggle mobile menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isMobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <nav className="max-w-6xl mx-auto px-4 py-4 space-y-4">
            <NavLinks isMobile />
          </nav>
        </div>
      )}
    </header>
  );
}
