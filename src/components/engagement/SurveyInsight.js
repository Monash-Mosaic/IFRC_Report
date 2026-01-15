import { Heart, AlertTriangle, Shield, User } from 'lucide-react';

function ProgressRow({ id, rank, label, value, selectedTag, handleSelectionTag }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-red-500 text-white text-xs font-semibold">
        #{rank}
      </div>

      <div className="flex-1">
        <div className="text-sm text-slate-900">{label}</div>
        <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-2 rounded-full bg-red-500"
            style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
          />
        </div>
      </div>

      <div className="w-14 text-right text-xs text-slate-500">{value.toFixed(1)}%</div>

      <button
        type="button"
        onClick={() => handleSelectionTag(id)}
        className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50"
        aria-label="Save insight"
      >
        <Heart
          className={`
                    ${
                      selectedTag[id]
                        ? 'fill-red-500 text-red-500'
                        : 'text-stone-400 hover:text-red-400'
                    }
                  `}
        />
      </button>
    </div>
  );
}

function SurveyCard({ item, index, selectedTag, handleSelectionTag }) {
  const getIcon = (id) => {
    switch (id) {
      case 'affected':
        return <AlertTriangle size={20} className="text-red-600" />;
      case 'reject':
        return <User size={20} className="text-red-600" />;
      case 'combat':
        return <Shield size={20} className="text-red-600" />;
      default:
        return <Shield size={20} className="text-red-600" />;
    }
  };
  return (
    <div
      key={item.id}
      className={`
                relative bg-white rounded-lg p-6
                transition-all duration-300 hover:shadow-lg
                ${selectedTag[item.id] ? 'bg-red-50' : 'hover:border-red-300'}
              `}
      style={{
        animationDelay: `${index * 0.1}s`,
        animation: 'fade-in 0.5s ease-out forwards',
      }}
    >
      {/* Heart Button */}
      <button
        onClick={() => handleSelectionTag(item.id)}
        className="absolute top-4 right-4 transition-all duration-200 hover:scale-110"
        aria-label="Toggle filter"
      >
        <Heart
          size={24}
          className={`
              ${
                selectedTag[item.id]
                  ? 'fill-red-500 text-red-500'
                  : 'text-stone-400 hover:text-red-400'
              }
            `}
        />
      </button>

      {/* Content Container */}
      <div className="flex flex-col items-center text-center space-y-4 mt-2">
        <div className="p-3 bg-red-50 rounded-full">{getIcon(item.id)}</div>
        <div className="text-lg font-bold text-stone-800">{item.stat}</div>
        <p className="text-base text-stone-600 leading-relaxed">{item.text}</p>
      </div>
    </div>
  );
}

export default function SurveyInsight({ selectedTag, handleSelectionTag }) {
  const statsData = [
    {
      id: 'affected',
      stat: '73.3%',
      text: 'have been personally affected by harmful information',
    },
    {
      id: 'reject',
      stat: '55.0%',
      text: 'have seen people rejecting aid due to false or misleading info',
    },
    {
      id: 'combat',
      stat: '63.5%',
      text: 'have seen groups organize to combat false and misleading info, online or offline',
    },
  ];

  const progressData = [
    {
      id: 'dialogue',
      rank: 1,
      text: 'Dialogue and community participation',
      percentage: 64.2,
    },
    {
      id: 'leadership',
      rank: 2,
      text: 'Strong local leadership',
      percentage: 61.0,
    },
    {
      id: 'clear',
      rank: 3,
      text: 'Clear, coherent and transparent communications',
      percentage: 57.9,
    },
    {
      id: 'trusted',
      rank: 4,
      text: 'Trusted messengers from within the community',
      percentage: 55.5,
    },
    {
      id: 'proximity',
      rank: 5,
      text: 'Proximity and presence of aid providersp',
      percentage: 42.1,
    },
  ];

  return (
    <div className="mt-10 bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="px-6 py-4 border-b border-slate-100">
        <div className="text-sm font-semibold text-slate-900">Survey Insights</div>
      </div>
      <div className="w-full border-b border-slate-100 ">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {statsData.map((item, index) => (
            <SurveyCard
              key={index}
              index={index}
              item={item}
              selectedTag={selectedTag}
              handleSelectionTag={handleSelectionTag}
            ></SurveyCard>
          ))}
        </div>
      </div>
      <div className="px-6">
        {progressData.map((row) => (
          <ProgressRow
            key={row.rank}
            id={row.id}
            rank={row.rank}
            label={row.text}
            value={row.percentage}
            selectedTag={selectedTag}
            handleSelectionTag={handleSelectionTag}
          />
        ))}
      </div>
    </div>
  );
}
