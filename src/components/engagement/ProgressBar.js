import { Heart } from 'lucide-react';
export default function ProgressBar({ selectedTag, handleSelectionTag }) {
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
  ];
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {progressData.map((item, index) => (
        <div
          key={item.id}
          className={`
              relative bg-white rounded-lg border-2 p-6
              transition-all duration-300 hover:shadow-lg
              ${
                selectedTag[item.id]
                  ? 'border-red-500 shadow-lg shadow-red-500/20 bg-red-50'
                  : 'border-stone-200 hover:border-red-300'
              }
            `}
          style={{
            animationDelay: `${index * 0.1}s`,
            animation: 'fade-in 0.5s ease-out forwards',
          }}
        >
          <div className="flex items-center gap-4">
            {/* Rank Number on the Left */}
            <div className="flex-shrink-0">
              <div
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold
                  ${
                    selectedTag[item.id]
                      ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white'
                      : 'bg-stone-100 text-stone-700'
                  }
                `}
              >
                #{item.rank}
              </div>
            </div>

            {/* Progress Bar Container */}
            <div className="flex-grow">
              {/* Text and Percentage on top */}
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-stone-700">{item.text}</span>
                <span className="text-sm font-bold text-stone-800 ml-4">{item.percentage}%</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-stone-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`
                      h-full rounded-full transition-all duration-1000 ease-out
                      ${
                        selectedTag[item.id]
                          ? 'bg-gradient-to-r from-red-600 to-orange-500'
                          : 'bg-gradient-to-r from-red-500 to-orange-400'
                      }
                    `}
                  style={{
                    width: `${item.percentage}%`,
                    animationDelay: `${index * 0.2}s`,
                  }}
                />
              </div>
            </div>

            {/* Heart Button on the Right */}
            <button
              onClick={() => handleSelectionTag(item.id)}
              className="flex-shrink-0 transition-all duration-200 hover:scale-110 ml-2"
              aria-label="Toggle filter"
            >
              <Heart
                size={28}
                className={`
                    ${
                      selectedTag[item.id]
                        ? 'fill-red-500 text-red-500'
                        : 'text-stone-400 hover:text-red-400'
                    }
                  `}
              />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
