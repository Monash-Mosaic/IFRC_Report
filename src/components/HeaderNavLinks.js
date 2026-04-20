'use client';

import { Link, usePathname } from '@/i18n/navigation';

function isActivePath(pathname, href) {
  if (href === '/') {
    return pathname === '/';
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function HeaderNavLinks({ links, mobile = false }) {
  const pathname = usePathname();
  const baseClasses = mobile
    ? 'block text-sm font-medium py-2 border-b border-gray-100 transition-colors'
    : 'text-sm font-medium text-nowrap transition-colors';

  return links.map((link) => {
    const isActive = isActivePath(pathname, link.href);
    const colorClasses = isActive
      ? 'text-red-700 hover:text-red-900'
      : 'text-gray-700 hover:text-gray-900';

    return (
      <Link
        key={link.href}
        href={link.href}
        className={`${baseClasses} ${colorClasses}`}
        aria-current={isActive ? 'page' : undefined}
        prefetch={false}
      >
        {link.label}
      </Link>
    );
  });
}
