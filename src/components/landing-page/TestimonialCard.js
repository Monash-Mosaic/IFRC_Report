"use client";

import { useState } from 'react';

export default function TestimonialCard({ quote, name, country, avatar }) {
  const [imageError, setImageError] = useState(false);
  
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow h-full border border-gray-200">
      {/* Quote */}
      <blockquote className="text-gray-800 leading-relaxed mb-6">"{quote}"</blockquote>

      {/* Author Info */}
      <div className="flex items-center space-x-3 mt-auto">
        {/* Avatar */}
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
          {!imageError && avatar ? (
            <img 
              src={avatar} 
              alt={`${name}'s avatar`} 
              className="w-full h-full rounded-full object-cover" 
              onError={handleImageError}
            />
          ) : (
            <span className="text-gray-700 text-sm font-medium">{initials}</span>
          )}
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