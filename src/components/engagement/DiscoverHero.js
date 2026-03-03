import Image from 'next/image';

export default function DiscoverHero({ imageSrc = '/engagement/discover-banner.png', imageAlt = 'Discover the Interactive Playbook' }) {
  return (
    <section className="w-full pt-6 pb-6 md:pt-8 md:pb-8">
      <div className="relative w-full overflow-hidden bg-slate-100 min-h-[200px] sm:min-h-[260px] md:min-h-[320px] lg:min-h-[380px]">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
      </div>
    </section>
  );
}
