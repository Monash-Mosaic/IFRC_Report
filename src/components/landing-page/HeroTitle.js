export default function HeroTitle({ title, description }) {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl md:text-7xl/18 font-bold text-white leading-tight text-end">
        <span className="whitespace-pre-line">{title}</span>
        <div className="mt-8">2026</div>
      </h1>
      <div className="text-4xl md:text-5xl text-white leading-tight font-bold">
        <span className="whitespace-pre-line">{description}</span>
      </div>
    </div>
  );
}
