import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Menu, X } from 'lucide-react';
import { Suspense } from 'react';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import SearchInput from './SearchInput';
import SearchInputFallback from './SearchInputFallback';

export default async function Header({ locale }) {
  const t = await getTranslations({
    namespace: 'Home',
    locale
  });

  // CSS class constants for reusability
  const buttonClasses = 'p-2 text-red-700 hover:text-red-900 transition-colors cursor-pointer';

  // Navigation links data to avoid duplication
  const navigationLinks = [
    { href: '/about', label: t('nav.about') },
    { href: '/acknowledgement', label: t('nav.acknowledgement') },
  ];
  const searchLabel = t('nav.search');
  const searchPlaceholder = t('nav.searchPlaceholder');

  return (
    <header className="w-full bg-white mb-4">
      <input id="mobile-menu-toggle" type="checkbox" className="peer sr-only" />

      <div className="max-w-9/10 lg:max-w-8/10 mx-auto px-4 py-4 flex items-center justify-between [&_.menu-close-icon]:hidden peer-checked:[&_.menu-open-icon]:hidden peer-checked:[&_.menu-close-icon]:block">
        {/* Logo */}
        <Link href={'/'}>
          <Image
            src="/wdr25/ifrc_logo.jpg"
            alt="Logo"
            width={70}
            height={70}
            className="min-w-[70px] h-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center flex-1 justify-end ms-8">
          <div className="flex items-center space-x-8 me-8">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-gray-900 text-sm font-medium text-nowrap"
                prefetch={false}
              >
                {link.label}
              </Link>
            ))}
            <LocaleSwitcher />
          </div>
          <Suspense
            fallback={<SearchInputFallback label={searchLabel} placeholder={searchPlaceholder} />}
          >
            <SearchInput />
          </Suspense>
        </nav>

        {/* Mobile Locale Switcher and Search */}
        <div className="lg:hidden flex items-center space-x-3">
          <LocaleSwitcher />
          <Suspense
            fallback={<SearchInputFallback label={searchLabel} placeholder={searchPlaceholder} />}
          >
            <SearchInput />
          </Suspense>
          <label
            htmlFor="mobile-menu-toggle"
            className={`${buttonClasses} inline-flex items-center justify-center`}
            aria-label="Toggle mobile menu"
          >
            <Menu className="menu-open-icon" />
            <X className="menu-close-icon" />
          </label>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className="hidden peer-checked:block lg:hidden bg-white border-t border-gray-200 shadow-lg">
        <nav className="max-w-6xl mx-auto px-4 py-4 space-y-4">
          {navigationLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-gray-700 hover:text-gray-900 text-sm font-medium py-2 border-b border-gray-100"
              prefetch={false}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
