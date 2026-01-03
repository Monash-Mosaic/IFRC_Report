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
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
          {heroSectionData.title}
        </h1>
        
        <p className="text-lg md:text-xl text-gray-700 max-w-4xl leading-relaxed">
          {heroSectionData.description}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <Link 
            href="/reports/wdr25" 
            className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors inline-flex items-center gap-2 whitespace-nowrap"
          >
            {heroSectionData.buttonTexts.read}
            <Eye className="w-5 h-5 flex-shrink-0" />
          </Link>
          <DownloadButton 
            filePath={`pdfs/wdr25/WDR25-${locale.toUpperCase()}.pdf`}
            fileName={`WDR25-${locale.toUpperCase()}.pdf`}
            variant="outline"
            size="md"
          >
            {heroSectionData.buttonTexts.download}
          </DownloadButton>
          <button className="px-6 py-3 text-red-600 font-medium transition-colors underline cursor-pointer inline-flex items-center gap-2 whitespace-nowrap">
            {heroSectionData.buttonTexts.share}
            <Share className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gray-200">
        <Image
          src="/wdr25/hero.jpg"
          alt="World Disasters Report hero image showing humanitarian workers in action"
          fill
          className="object-cover"
          priority
        />
      </div>
    </section>
  );
}