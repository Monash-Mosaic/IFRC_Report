import Image from 'next/image';

export default function DiscoverHero({ title, subtitle, imageSrc = '/engagement/discover-banner.jpg', imageAlt }) {
  return (
    <section className="relative w-full min-h-[320px] md:min-h-[400px] overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={imageSrc}
          alt={imageAlt ?? ''}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-16 md:py-24 flex flex-col justify-center min-h-[320px] md:min-h-[400px]">
        <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight max-w-2xl">
          {title}
        </h1>
        <p className="text-lg md:text-xl text-white/95 mt-4 max-w-2xl">
          {subtitle}
        </p>
      </div>
    </section>
  );
}
