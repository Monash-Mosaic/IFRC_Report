// components/landing-page/ExecutiveSummarySection.js
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import DownloadButton from './DownloadButton';
import { Eye } from 'lucide-react';

export default function ExecutiveSummarySection({ reportData, locale = 'en' }) {
  const executiveSummaryData = reportData.landingPage.executiveSummary;

  return (
    <section>
      {/* Mobile: Vertical Stack | Desktop: Two-column Grid */}
      <div className="flex flex-col space-y-8 lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center lg:space-y-0">
        
        {/* Content Column - Desktop: Left | Mobile: Flows naturally */}
        <div className="flex flex-col space-y-6 lg:space-y-0 lg:h-full">
          
          {/* Top Content Group - Desktop: At top | Mobile: Natural flow */}
          <div className="lg:flex-1 lg:space-y-6 space-y-6">
            {/* Title */}
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              {executiveSummaryData.title}
            </h2>
            
            {/* Image - Mobile: After title | Desktop: Hidden (appears in right column) */}
            <div className="lg:hidden relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-200">
              <Image
                src="/wdr25/summary.png"
                alt="Executive Summary cover featuring a person in humanitarian context"
                fill
                className="object-cover"
              />
            </div>
            
            {/* Subtitle */}
            <h3 className="text-xl md:text-2xl font-semibold md:font-normal text-gray-800">
              {executiveSummaryData.subtitle}
            </h3>
            
            {/* Description */}
            <p className="text-gray-500 leading-relaxed">
              {executiveSummaryData.description}
            </p>
          </div>

          {/* Action Buttons - Desktop: At bottom | Mobile: After content */}
          <div className="flex gap-4 lg:mt-8">
            <Link 
              href="/reports/wdr25/chapter-02" 
              className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors inline-flex items-center gap-2 whitespace-nowrap"
            >
              {executiveSummaryData.buttonTexts.read}
              <Eye className="w-5 h-5 flex-shrink-0" />
            </Link>
            <DownloadButton 
              filePath={`pdfs/wdr25/WDR25-ExecutiveSummary-${locale.toUpperCase()}.pdf`}
              fileName={`WDR25-ExecutiveSummary-${locale.toUpperCase()}.pdf`}
              variant="outline"
              size="md"
            >
              {executiveSummaryData.buttonTexts.download}
            </DownloadButton>
          </div>
        </div>

        {/* Image Column - Desktop: Right | Mobile: Hidden (appears inline above) */}
        <div className="hidden lg:block relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-200">
          <Image
            src="/wdr25/summary.png"
            alt="Executive Summary cover featuring a person in humanitarian context"
            fill
            className="object-cover"
          />
        </div>
        
      </div>
    </section>
  );
}