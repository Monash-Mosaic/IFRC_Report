// components/landing-page/ExecutiveSummarySection.js
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { Download } from 'lucide-react';
import { Eye } from 'lucide-react';

export default function ExecutiveSummarySection({ messages }) {
  {
    /* Placehodler */
  }
  const reportDownloadLink = `https://www.heritage.vic.gov.au/__data/assets/pdf_file/0022/512275/Victorias-framework-of-historical-themes-Heritage-Council-of-Victoria,-Victorian-Aboriginal-Heritage-Council-2009.pdf`;

  return (
    <section>
      {/* Mobile: Vertical Stack | Desktop: Two-column Grid */}
      <div className="flex flex-col space-y-8 lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center lg:space-y-0">
        {/* Content Column - Desktop: Left | Mobile: Flows naturally */}
        <div className="flex flex-col space-y-6 lg:space-y-0 lg:h-full">
          {/* Top Content Group - Desktop: At top | Mobile: Natural flow */}
          <div className="lg:flex-1 lg:space-y-6 space-y-6">
            {/* Title */}
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">{messages.title}</h2>

            {/* Image - Mobile: After title | Desktop: Hidden (appears in right column) */}
            <div className="lg:hidden relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-200">
              <Image
                src="/wdr25/summary.png"
                alt={messages.summaryAlt}
                fill
                className="object-cover"
              />
            </div>

            {/* Subtitle */}
            <h3 className="text-xl md:text-3xl md:max-w-90 font-semibold md:font-normal text-gray-800">
              {messages.subtitle}
            </h3>

            {/* Description */}
            <p className="text-xl text-gray-500 leading-relaxed">{messages.description}</p>
          </div>

          {/* Action Buttons - Desktop: At bottom | Mobile: After content */}
          <div className="flex gap-4 lg:mt-8">
            <Link
              href="/reports/wdr25/chapter-02"
              className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors inline-flex items-center gap-2 whitespace-nowrap"
            >
              {messages.buttonTexts.read}
              <Eye className="w-5 h-5 flex-shrink-0" />
            </Link>
            <a
              href={reportDownloadLink}
              alt="alt text"
              target="_blank"
              className="px-6 py-3 border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2 whitespace-nowrap"
              rel="noopener noreferrer"
            >
              {messages.buttonTexts.download}
              <Download className="w-5 h-5 flex-shrink-0" />
            </a>
          </div>
        </div>

        {/* Image Column - Desktop: Right | Mobile: Hidden (appears inline above) */}
        <div className="hidden lg:block relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-200">
          <Image src="/wdr25/summary.png" alt={messages.summaryAlt} fill className="object-cover" />
        </div>
      </div>
    </section>
  );
}
