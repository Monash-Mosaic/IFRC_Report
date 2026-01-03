// components/landing-page/ExecutiveSummarySection.js
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import DownloadButton from './DownloadButton';
import { Eye } from 'lucide-react';

export default function ExecutiveSummarySection({ reportData, locale = 'en' }) {
  const executiveSummaryData = reportData.landingPage.executiveSummary;

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
      {/* Left Column - Text Content */}
      <div className="flex flex-col h-full">
        {/* Text Content at Top */}
        <div className="space-y-6 flex-1">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            {executiveSummaryData.title}
          </h2>
          
          <h3 className="text-xl md:text-2xl font-semibold text-gray-800">
            {executiveSummaryData.subtitle}
          </h3>
          
          <p className="text-gray-700 leading-relaxed">
            {executiveSummaryData.description}
          </p>
        </div>

        {/* Action Buttons at Bottom */}
        <div className="flex gap-4 mt-8">
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

      {/* Right Column - Image */}
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-200">
        <Image
          src="/wdr25/summary.png"
          alt="Executive Summary cover featuring a person in humanitarian context"
          fill
          className="object-cover"
        />
      </div>
    </section>
  );
}