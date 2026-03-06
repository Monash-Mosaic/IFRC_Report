import Image from 'next/image';

// Intrinsic dimensions (21:9) – browser scales via w-full h-auto
const BANNER_WIDTH = 2100;
const BANNER_HEIGHT = 900;

export default function DiscoverHero({ imageSrc = '/engagement/discover-banner.webp', imageAlt = 'Discover the Interactive Playbook' }) {
  return (
    <section className="w-full max-w-[100vw] overflow-x-hidden pt-6 pb-6 md:pt-8 md:pb-8">
      <div className="w-full min-w-0 overflow-hidden bg-slate-100">
        <Image
          src={imageSrc}
          alt={imageAlt}
          width={BANNER_WIDTH}
          height={BANNER_HEIGHT}
          className="w-full h-auto block"
          priority
          sizes="100vw"
        />
      </div>
    </section>
  );
}
