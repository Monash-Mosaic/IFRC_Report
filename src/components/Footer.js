'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Facebook, Linkedin, Instagram, Youtube } from 'lucide-react';

import { getVisibleReports, reportUriMap } from '@/reports';

export default function Footer() {

  const t = useTranslations('Footer');
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

        <div className="flex flex-col lg:flex-row justify-between items-start gap-12">

          {/* ================= LEFT SECTION ================= */}
          <div className="flex flex-col gap-6">

            <div className="flex items-start gap-12 flex-wrap">

              {/* IFRC */}
              <div className="flex flex-col items-center gap-3 w-[160px] mt-3">
                <Link href="https://www.ifrc.org">

                  <Image
                    src="/wdr25/ifrc_logo.jpg"
                    alt="IFRC"
                    width={120}
                    height={40}
                    className="h-12 w-auto object-contain"
                  />
                </Link>

                <div className="flex gap-3">
                  <Link href="https://www.facebook.com/IFRC/"><Facebook size={18} className={iconClass}/></Link>
                  <Link href="https://www.youtube.com/user/ifrc"><Youtube size={18} className={iconClass}/></Link>
                  <Link href="https://www.linkedin.com/company/ifrc/"><Linkedin size={18} className={iconClass}/></Link>
                  <Link href="https://www.instagram.com/ifrc/"><Instagram size={18} className={iconClass}/></Link>
                </div>
              </div>

              {/* Solferino Academy */}
              <div className="flex flex-col items-center gap-0 w-[160px]">
                <Link href="https://solferinoacademy.com">
                  <Image
                    src="/wdr25/solferino_logo.svg"
                    alt="Solferino Academy"
                    width={150}
                    height={40}
                    className="h-18 w-auto object-contain"
                  />
                </Link>

                <div className="flex gap-3">
                  <Link href="https://www.facebook.com/people/IFRC-Solferino-Academy/61572985566986/"><Facebook size={18} className={iconClass}/></Link>
                  <Link href="https://www.youtube.com/@SolferinoAcademy"><Youtube size={18} className={iconClass}/></Link>
                  <Link href="https://www.linkedin.com/company/ifrc-solferino-academy/"><Linkedin size={18} className={iconClass}/></Link>
                  <Link href="https://www.instagram.com/ifrcsolferinoacademy/"><Instagram size={18} className={iconClass}/></Link>
                </div>
              </div>

              {/* Mosaic */}
              <div className="flex flex-col items-center gap-1 w-[260px] mt-3">
                <Link href="https://www.mosaic-monash.ai/">
                  <Image
                    src="/wdr25/mosaic_logo.svg"
                    alt="Monash Mosaic"
                    width={260}
                    height={50}
                    className="h-14 w-auto object-contain"
                  />
                </Link>

                <div className="flex gap-3">
                  <Link href="https://www.linkedin.com/company/mosaic-monash-student-team/"><Linkedin size={18} className={iconClass}/></Link>
                  <Link href="https://www.instagram.com/mosaic.monash/"><Instagram size={18} className={iconClass}/></Link>
                </div>
              </div>

            </div>
          </div>

          {/* ================= CENTER LINKS ================= */}
          <div className="flex gap-12 text-sm text-gray-800">

            {/* Report */}
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

            {/* Games */}
            <div className="flex flex-col gap-2">
              <p className="font-semibold">{t('games')}</p>

              <Link href="/disinformer">Disinformer</Link>
              <Link href="/prebunk">Ctrl + Alt + Prebunk</Link>
            </div>

          </div>

          {/* ================= RIGHT TITLE ================= */}
          <div className="text-right">
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