// components/world-disasters/CitationsSection.js
function TestimonialCard({ quote, name, country }) {
  // Generate a color based on the name for consistent avatar colors
  const getAvatarColor = (name) => {
    const colors = [
      'bg-red-500',
      'bg-blue-500', 
      'bg-green-500',
      'bg-purple-500',
      'bg-yellow-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-gray-500'
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  const avatarColor = getAvatarColor(name);
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Quote */}
      <blockquote className="text-gray-800 leading-relaxed mb-6">
        "{quote}"
      </blockquote>
      
      {/* Author Info */}
      <div className="flex items-center space-x-3">
        {/* Avatar */}
        <div className={`w-10 h-10 ${avatarColor} rounded-full flex items-center justify-center flex-shrink-0`}>
          <span className="text-white text-sm font-medium">{initials}</span>
        </div>
        
        {/* Name and Country */}
        <div>
          <div className="font-medium text-gray-900 text-sm">{name}</div>
          <div className="text-gray-600 text-sm">{country}</div>
        </div>
      </div>
    </div>
  );
}

export default function CitationsSection({ reportData }) {
  const { title, testimonialsList } = reportData.landingPage.testimonials;

  return (
    <section className="space-y-8">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
        {title}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonialsList.map((testimonial) => (
          <TestimonialCard
            key={testimonial.id}
            quote={testimonial.quote}
            name={testimonial.name}
            country={testimonial.country}
          />
        ))}
      </div>
    </section>
  );
}