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
          <button className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors">
            {executiveSummaryData.buttonTexts.read}
          </button>
          <button className="px-6 py-3 bg-blue-900 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors">
            {executiveSummaryData.buttonTexts.download}
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