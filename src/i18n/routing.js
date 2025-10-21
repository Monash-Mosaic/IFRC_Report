import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'fr', 'zh', 'ar', 'ru'],
  defaultLocale: 'en',
  pathnames: {
    '/documents': {
      en: '/documents',
      fr: '/documents',
      zh: '/文件',
      ar: '/مستندات',
      ru: '/документы'
    },
  }
});