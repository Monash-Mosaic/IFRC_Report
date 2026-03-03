import Image from 'next/image';

export default function DiscoverHero({ imageSrc = '/engagement/discover-banner.png', imageAlt = 'Discover the Interactive Playbook' }) {
  return (
    <section className="w-full max-w-[100vw] overflow-x-hidden pt-6 pb-6 md:pt-8 md:pb-8">
      {/* Full-width block: aspect ratio for consistent sizing; min-height for small viewports */}
      <div className="relative w-full min-w-0 overflow-hidden bg-slate-100 aspect-[21/9] min-h-[200px] sm:min-h-[260px] md:min-h-[320px] lg:min-h-[380px]">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover object-[34%_50%]"
          priority
          sizes="100vw"
        />
      </div>
    </section>
  );
}
