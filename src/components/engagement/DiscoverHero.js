import Image from 'next/image';

export default function DiscoverHero({ imageSrc = '/engagement/discover-banner.png', imageAlt = 'Discover the Interactive Playbook' }) {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 pt-6 pb-6 md:pt-8 md:pb-8">
      <div className="relative w-full overflow-hidden rounded-lg bg-slate-100 min-h-[180px] sm:min-h-[220px] md:min-h-[280px] lg:min-h-[320px]">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-contain object-center"
          priority
          sizes="(max-width: 1280px) 100vw, 1280px"
        />
      </div>
    </section>
  );
}
