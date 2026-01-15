import { Link } from '@/i18n/navigation';
import { Share } from 'lucide-react';
import { Eye } from 'lucide-react';
import { Download } from 'lucide-react';
import HeroVideo from './HeroVideo';

export default function HeroSection({ messages }) {
  const reportDownloadLink = `https://www.dfat.gov.au/sites/default/files/vic-cef.pdf`;

  return (
    <section className=" space-y-8">
      <div className="relative pt-8 pb-8 px-4 md:px-20 overflow-hidden rounded-lg min-h-[500px] md:min-h-[600px] ">
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <HeroVideo alt={messages.heroAlt} />
          <div className="absolute inset-0 bg-black/20 z-20" />
        </div>
        <div className="relative z-10 space-y-8">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-7xl/18  font-bold text-white leading-tight text-end">
              <span className="whitespace-pre-line">{messages.title}</span>
              <div className="mt-8">2026</div>
            </h1>
            <div className="text-4xl md:text-5xl text-white leading-tight font-bold">
              <span className="whitespace-pre-line">{messages.description}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Responsive Layout Container */}
      <div className="flex flex-col gap-8">
        {/* Action Buttons - will reorder based on screen size */}
        <div className="order-2 md:order-1 flex flex-row gap-2 md:gap-4">
          <Link
            href="/reports/wdr25"
            className="flex-1 md:flex-none px-3 md:px-6 py-2 md:py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors inline-flex items-center justify-center gap-1 md:gap-2 whitespace-nowrap"
          >
            <span className="text-xs font-bold md:text-base">{messages.buttonTexts.read}</span>
            <Eye className="w-3 h-3 font-bold md:w-5 md:h-5 flex-shrink-0" />
          </Link>

          <div className="flex-1 md:flex-none">
            <a
              href={reportDownloadLink}
              alt="alt text"
              target="_blank"
              className="w-full h-full px-3 md:px-6 py-2 md:py-3 border-2 border-red-600 text-red-600 bg-[] hover:bg-red-600 hover:text-white rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-1 md:gap-2 whitespace-nowrap focus:outline-none"
              rel="noopener noreferrer"
            >
              <span className="text-xs font-bold md:text-base">
                {messages.buttonTexts.download}
              </span>
              <Download className="w-3 h-3 font-bold md:w-5 md:h-5 flex-shrink-0" />
            </a>
          </div>

          <button className="w-12 md:w-auto px-2 md:px-6 py-2 md:py-3 text-red-600 font-medium transition-colors cursor-pointer inline-flex items-center justify-center gap-1 md:gap-2 whitespace-nowrap border-2 border-red-600 rounded-lg md:border-none md:underline">
            <span className="hidden md:inline text-xs md:text-base">
              {messages.buttonTexts.share}
            </span>
            <Share className="w-4 h-4 md:w-4 md:h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
