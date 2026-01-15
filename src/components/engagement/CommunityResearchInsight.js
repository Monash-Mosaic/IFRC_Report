import { QuoteIcon } from 'lucide-react';
export default function CommunityResearchInsight() {
  return (
    <div className="p-5 mt-8 bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-2 text-slate-700">
        <span className="text-red-500">
          <QuoteIcon className="h-5 w-5" />
        </span>
        <span className="text-sm font-semibold">Community Researchers insights</span>
      </div>
      <div className="mt-10 text-sm text-slate-700 italic leading-relaxed text-center">
        "Misinformation often results into mistrust between the community and others especially
        those who support them, once trust is broken between community and others, communities have
        ways of verifying information through influential people within the community. To build
        trust, it is important to engage influential people within the communities such as local
        leaders, clan leaders, elders who people within the community listen to and trust. Embracing
        community feedback and acting upon it is key, especially negative feedback that shows
        community dissatisfaction and mistrust, which should be taken into consideration.\"
      </div>
    </div>
  );
}
