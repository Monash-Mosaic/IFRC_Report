// components/landing-page/HeroSection.js
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import DownloadButton from './DownloadButton';

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
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              fill="currentColor" 
              className="bi bi-eye w-5 h-5 flex-shrink-0" 
              viewBox="0 0 16 16"
            >
              <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>
              <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
            </svg>
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
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              fill="currentColor" 
              className="bi bi-box-arrow-up w-5 h-5 flex-shrink-0" 
              viewBox="0 0 16 16"
            >
              <path fillRule="evenodd" d="M3.5 6a.5.5 0 0 0-.5.5v8a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5v-8a.5.5 0 0 0-.5-.5h-2a.5.5 0 0 1 0-1h2A1.5 1.5 0 0 1 14 6.5v8a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 14.5v-8A1.5 1.5 0 0 1 3.5 5h2a.5.5 0 0 1 0 1z"/>
              <path fillRule="evenodd" d="M7.646.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 1.707V10.5a.5.5 0 0 1-1 0V1.707L5.354 3.854a.5.5 0 1 1-.708-.708z"/>
            </svg>
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