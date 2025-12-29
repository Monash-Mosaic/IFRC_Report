// components/landing-page/ExecutiveSummarySection.js
import Image from 'next/image';

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
          <button className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors inline-flex items-center gap-2 whitespace-nowrap">
            {executiveSummaryData.buttonTexts.read}
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
          </button>
          <button className="px-6 py-3 border-2 border-red-600 text-red-600 rounded-lg font-medium hover:bg-red-600 hover:text-white transition-colors inline-flex items-center gap-2 whitespace-nowrap">
            {executiveSummaryData.buttonTexts.download}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              fill="currentColor" 
              className="bi bi-download w-5 h-5 flex-shrink-0" 
              viewBox="0 0 16 16"
            >
              <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"/>
              <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z"/>
            </svg>
          </button>
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