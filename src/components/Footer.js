'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Facebook, Linkedin, Instagram, Youtube } from 'lucide-react';

import { getVisibleReports, reportUriMap } from '@/reports';

export default function Footer({ locale }) {

  const t = await getTranslations({
     namespace: 'Footer',
     locale
  });
  const locale = useLocale();

  const iconClass =
    "p-1 text-gray-400 hover:text-gray-700 transition";

  /* ================= DYNAMIC REPORT LINKS ================= */

  const reportModule = getVisibleReports(locale)?.wdr25;

  const chapterSlug =
    reportUriMap['wdr25'].chapters['chapter-02'].languages[locale];

  const readReportLink = {
    pathname: '/reports/[report]',
    params: {
      report: reportUriMap['wdr25'].languages[locale],
    },
  };

  const downloadReportLink =
    reportModule?.chapters?.[chapterSlug]?.downloadLink ?? '#';

  /* ======================================================== */

  return (
    <footer className="w-full bg-[#f5f5f5] border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-12">

        <div className="flex flex-col lg:flex-row justify-between gap-12">

          {/* ================= LEFT ================= */}
          <div className="flex flex-col gap-8">

            {/* LOGOS */}
            <div className="flex flex-wrap items-center gap-x-8 gap-y-8">

              {/* IFRC */}
              <div className="flex flex-col items-center gap-3 w-[150px]">
                <a
                  href="https://www.ifrc.org"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    src="/wdr25/ifrc_logo.jpg"
                    alt="IFRC"
                    width={120}
                    height={40}
                    className="h-12 w-auto object-contain"
                  />
                </a>

                <div className="flex gap-3">
                  <a href="https://www.facebook.com/IFRC/" target="_blank"><Facebook size={18} className={iconClass}/></a>
                  <a href="https://www.youtube.com/user/ifrc" target="_blank"><Youtube size={18} className={iconClass}/></a>
                  <a href="https://www.linkedin.com/company/ifrc/" target="_blank"><Linkedin size={18} className={iconClass}/></a>
                  <a href="https://www.instagram.com/ifrc/" target="_blank"><Instagram size={18} className={iconClass}/></a>
                </div>
              </div>

              {/* Solferino */}
              <div className="flex flex-col items-center gap-3 w-[150px]">
                <a
                  href="https://solferinoacademy.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    src="/wdr25/solferino_logo.svg"
                    alt="Solferino Academy"
                    width={150}
                    height={40}
                    className="h-14 w-auto object-contain"
                  />
                </a>

                <div className="flex gap-3">
                  <a href="https://www.facebook.com/people/IFRC-Solferino-Academy/61572985566986/" target="_blank"><Facebook size={18} className={iconClass}/></a>
                  <a href="https://www.youtube.com/@SolferinoAcademy" target="_blank"><Youtube size={18} className={iconClass}/></a>
                  <a href="https://www.linkedin.com/company/ifrc-solferino-academy/" target="_blank"><Linkedin size={18} className={iconClass}/></a>
                  <a href="https://www.instagram.com/ifrcsolferinoacademy/" target="_blank"><Instagram size={18} className={iconClass}/></a>
                </div>
              </div>

              {/* Mosaic */}
              <div className="flex flex-col items-center gap-3 w-[150px]">
                <a
                  href="https://www.mosaic-monash.ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    src="/wdr25/mosaic_logo.svg"
                    alt="Monash Mosaic"
                    width={150}
                    height={50}
                    className="h-12 w-auto object-contain"
                  />
                </a>

                <div className="flex gap-3">
                  <a href="https://www.linkedin.com/company/mosaic-monash-student-team/" target="_blank"><Linkedin size={18} className={iconClass}/></a>
                  <a href="https://www.instagram.com/mosaic.monash/" target="_blank"><Instagram size={18} className={iconClass}/></a>
                </div>
              </div>

            </div>
          </div>

          {/* ================= CENTER ================= */}
          <div className="flex gap-10 text-sm text-gray-800">

            <div className="flex flex-col gap-2">
              <p className="font-semibold">{t('report')}</p>

              <Link href={readReportLink}>
                {t('readReport')}
              </Link>

              <Link href={downloadReportLink}>
                {t('downloadReport')}
              </Link>

              <Link href="/issue">
                {t('reportIssue')}
              </Link>
            </div>

            <div className="flex flex-col gap-2">
              <p className="font-semibold">{t('games')}</p>

              <Link href="/disinformer">Disinformer</Link>
              <Link href="/prebunk">Ctrl + Alt + Prebunk</Link>
            </div>

          </div>

          {/* ================= RIGHT ================= */}
          <div className="text-left lg:text-right">
            <p className="font-bold text-black text-xl leading-tight">
              {t('world')} <br />
              {t('disasters')} <br />
              {t('reportTitle')}
            </p>

            <p className="mt-3 font-bold text-black text-2xl">
              {t('year')}
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}