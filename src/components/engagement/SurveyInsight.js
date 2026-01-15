import { Heart, AlertTriangle, Shield, User } from 'lucide-react';
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
  ];

  const getIcon = (id) => {
    switch (id) {
      case 'affected':
        return <AlertTriangle size={48} className="text-red-600" />;
      case 'reject':
        return <User size={48} className="text-red-600" />;
      case 'combat':
        return <Shield size={48} className="text-red-600" />;
      default:
        return <Shield size={48} className="text-red-600" />;
    }
  };
  return (
    <>
      {/* Stats Section */}
      <div className="w-full my-12  px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {statsData.map((item, index) => (
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
                <div className="text-2xl font-bold text-stone-800">{item.stat}</div>
                <p className="text-base text-stone-600 leading-relaxed">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
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
    </>
  );
}
