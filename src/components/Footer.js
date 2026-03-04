import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { getTranslations, getLocale } from 'next-intl/server';
import { Facebook, Linkedin, Instagram, Youtube } from 'lucide-react';

import { getVisibleReports, reportUriMap } from '@/reports';

export default async function Footer() {

  const t = await getTranslations('Footer');
  const locale = await getLocale();

  const iconClass =
    "p-1 text-gray-400 hover:text-gray-700 transition";

  /* ================= DYNAMIC REPORT LINKS ================= */

  const reportModule = getVisibleReports(locale)?.wdr26;

  const chapterSlug =
    reportUriMap['wdr26'].chapters['chapter-02'].languages[locale];

  const readReportLink = {
    pathname: '/reports/[report]',
    params: {
      report: reportUriMap['wdr26'].languages[locale],
    },
  };

  const downloadReportLink =
    reportModule?.chapters?.[chapterSlug]?.downloadLink ?? '#';

  /* ======================================================== */

  return (
    <footer className="w-full bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-12">

        <div className="flex flex-col xl:flex-row justify-between items-center xl:items-start gap-12">

          {/* ================= LEFT SECTION ================= */}
          <div className="flex flex-col gap-6 shrink-0">

            <div className="flex flex-col items-center gap-8 xl:flex-row xl:items-start xl:flex-nowrap">

              {/* IFRC */}
              <div className="flex flex-col items-center gap-3 w-[160px] mt-3">
                <Link href="https://www.ifrc.org">
                  <Image
                    src="/wdr26/ifrc_logo.jpg"
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
                    src="/wdr26/solferino_logo.svg"
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
                    src="/wdr26/mosaic_logo.svg"
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
          <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:gap-12 text-sm text-gray-800">

            {/* Report */}
            <div className="flex flex-col items-center gap-2 text-center lg:items-start lg:text-left">
              <p className="font-semibold">{t('report')}</p>

              <Link href={readReportLink}>
                {t('readReport')}
              </Link>

              {/* Native <a> tag per PR review — external download link */}
              <a href={downloadReportLink}>
                {t('downloadReport')}
              </a>

              <Link href="/issue">
                {t('reportIssue')}
              </Link>
            </div>

            {/* Games */}
            <div className="flex flex-col items-center gap-2 text-center lg:items-start lg:text-left">
              <p className="font-semibold">{t('games')}</p>

              <Link href="/disinformer">Disinformer</Link>
              <Link href="/prebunk">Ctrl + Alt + Prebunk</Link>
            </div>

          </div>

          {/* ================= RIGHT TITLE ================= */}
          <div className="text-center xl:text-right">
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