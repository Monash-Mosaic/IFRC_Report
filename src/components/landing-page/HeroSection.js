// components/landing-page/HeroSection.js
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import DownloadButton from './DownloadButton';
import { Share } from 'lucide-react';
import { Eye } from 'lucide-react';

export default function HeroSection({ reportData, locale = 'en' }) {
  const heroSectionData = reportData.landingPage.heroSection;

  return (
    <section className="space-y-8">
      {/* Text Content */}
      <div className="text-left space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight text-right md:text-left">
          {heroSectionData.title}
        </h1>
        
        <p className="text-lg md:text-xl text-gray-700 max-w-4xl leading-relaxed font-bold">
          {heroSectionData.description}
        </p>
      </div>

      {/* Responsive Layout Container */}
      <div className="flex flex-col gap-8">
        {/* Action Buttons - will reorder based on screen size */}
        <div className="order-2 md:order-1 flex flex-row gap-2 md:gap-4">
          <Link 
            href="/reports/wdr25" 
            className="flex-1 md:flex-none px-3 md:px-6 py-2 md:py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors inline-flex items-center justify-center gap-1 md:gap-2 whitespace-nowrap"
          >
            <span className="text-xs md:text-base">{heroSectionData.buttonTexts.read}</span>
            <Eye className="w-3 h-3 md:w-5 md:h-5 flex-shrink-0" />
          </Link>
          
          <div className="flex-1 md:flex-none">
            <DownloadButton 
              filePath={`pdfs/wdr25/WDR25-${locale.toUpperCase()}.pdf`}
              fileName={`WDR25-${locale.toUpperCase()}.pdf`}
              variant="outline"
              size="md"
              className="w-full h-full px-3 md:px-6 py-2 md:py-3 text-xs md:text-base"
            >
              <span className="hidden sm:inline">{heroSectionData.buttonTexts.download}</span>
              <span className="sm:hidden">{heroSectionData.buttonTexts.download}</span>
            </DownloadButton>
          </div>
          
          <button className="w-12 md:w-auto px-2 md:px-6 py-2 md:py-3 text-red-600 font-medium transition-colors cursor-pointer inline-flex items-center justify-center gap-1 md:gap-2 whitespace-nowrap border-2 border-red-600 rounded-lg md:border-none md:underline">
            <span className="hidden md:inline text-xs md:text-base">{heroSectionData.buttonTexts.share}</span>
            <Share className="w-4 h-4 md:w-4 md:h-4" />
          </button>
        </div>

        {/* Hero Image */}
        <div className="order-1 md:order-2 relative w-full aspect-video rounded-2xl overflow-hidden bg-gray-200">
          <Image
            src="/wdr25/hero.jpg"
            alt="World Disasters Report hero image showing humanitarian workers in action"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
}