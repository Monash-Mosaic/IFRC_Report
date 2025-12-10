// components/landing-page/HeroSection.js
import Image from 'next/image';
import { Link } from '@/i18n/navigation';

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
            className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors inline-block text-center"
          >
            {heroSectionData.buttonTexts.read}
          </Link>
          <button className="px-6 py-3 bg-blue-950 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors">
            {heroSectionData.buttonTexts.download}
          </button>
          <button className="px-6 py-3 bg-cyan-200 text-blue-950 rounded-lg font-medium hover:bg-cyan-50 transition-colors">
            {heroSectionData.buttonTexts.share}
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