import HeroVideo from './HeroVideo';
import HeroTitle from './HeroTitle';

export default function HeroMediaBlock({ title, description, heroAlt }) {
  return (
    <div className="relative p-[36px] overflow-hidden rounded-lg min-h-[500px] md:min-h-[600px] ">
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <HeroVideo alt={heroAlt} />
        <div className="absolute inset-0 bg-black/20 z-20" />
      </div>
      <div className="relative z-10 space-y-8">
        <HeroTitle title={title} description={description} />
      </div>
    </div>
  );
}
