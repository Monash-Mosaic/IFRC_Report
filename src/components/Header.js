'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import { Search, X, Mic } from 'lucide-react';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef(null);
  const t = useTranslations('Home');

  // CSS class constants for reusability
  const buttonClasses = 'p-2 text-red-700 hover:text-red-900 transition-colors';
  const iconClasses = 'w-5 h-5 text-red-600';
  const searchTransition = 'transition-all duration-300 ease-in-out';

  // Utility function for conditional classes
  const getSearchInputClasses = (isMobile, isSearchExpanded) => {
    const baseClasses =
      'border-2 border-red-600 text-red-600 rounded-lg font-medium focus:outline-none focus:ring-0 bg-white placeholder-red-400';

    const sizeClasses = isMobile
      ? isSearchExpanded
        ? 'w-full pl-12 pr-12 py-2 h-10'
        : 'w-10 h-10 p-0 pr-0'
      : isSearchExpanded
        ? 'w-full pl-12 pr-4 py-2'
        : 'w-auto px-4 py-2 pr-10';

    return `${sizeClasses} ${baseClasses} ${searchTransition}`;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSearchFocus = () => {
    setIsSearchExpanded(true);
    // Ensure focus remains on the input after expansion
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 0);
  };

  const handleCloseSearch = () => {
    setIsSearchExpanded(false);
  };

  const handleMicClick = (e) => {
    // No functionality yet - placeholder for future voice search
  };

  // Navigation links data to avoid duplication
  const navigationLinks = [
    { href: '/about', label: t('nav.about') },
    { href: '/contributors', label: t('nav.contributors') },
  ];

  // Search bar component with unified mobile/desktop logic
  const SearchInput = ({ isMobile = false }) => {
    const containerClasses = `flex items-center ${
      isMobile && isSearchExpanded ? 'flex-1' : !isMobile && isSearchExpanded ? 'w-full' : ''
    } ${isSearchExpanded ? 'gap-3' : ''}`;

    const searchIconClasses = `absolute ${
      isMobile ? 'right-3 w-4 h-4 pointer-events-none' : 'right-3 w-5 h-5'
    } top-1/2 transform -translate-y-1/2 text-red-600`;

    return (
      <div className={containerClasses}>
        <div
          className={`relative ${
            isMobile && isSearchExpanded ? 'flex-1' : !isMobile && isSearchExpanded ? 'flex-1' : ''
          }`}
        >
          <input
            ref={searchInputRef}
            type="text"
            placeholder={isSearchExpanded ? '' : isMobile ? '' : t('nav.search')}
            onFocus={handleSearchFocus}
            className={getSearchInputClasses(isMobile, isSearchExpanded)}
          />
          {isSearchExpanded ? (
            <>
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${iconClasses}`}
              />
              <Mic
                className={`mic-icon absolute right-3 top-1/2 transform -translate-y-1/2 ${iconClasses} cursor-pointer hover:text-red-700 transition-colors`}
                onClick={handleMicClick}
                onMouseDown={(e) => e.preventDefault()}
              />
            </>
          ) : (
            <Search className={searchIconClasses} />
          )}
        </div>
        {isSearchExpanded && (
          <X
            className={`${iconClasses} cursor-pointer hover:text-red-700 transition-colors flex-shrink-0`}
            onClick={handleCloseSearch}
          />
        )}
      </div>
    );
  };

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
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
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

          <SearchInput />
        </nav>

        {/* Mobile Locale Switcher and Search */}
        <div
          className={`md:hidden flex items-center ${searchTransition} ${
            isSearchExpanded ? 'flex-1 ml-3' : 'space-x-3'
          }`}
        >
          {!isSearchExpanded && <LocaleSwitcher />}
          <SearchInput isMobile />
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
