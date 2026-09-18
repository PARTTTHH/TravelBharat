import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, CheckCircle2 } from 'lucide-react';

const TouristCard = ({ place }) => {
  const primaryImage = 
    place?.primary_image?.image_url || 
    place?.images?.[0]?.image_url || 
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80';
  
  const categoryLabel = 
    place?.categories?.[0]?.label || 
    place?.categories?.[0]?.name || 
    'Heritage';

  const stateName = place?.state_name || place?.state?.name || 'India';
  const cityName = place?.city_name || place?.city?.name || '';
  const locationText = cityName ? `${cityName}, ${stateName}` : stateName;

  return (
    <Link
      to={`/places/${place.slug}`}
      className="group relative h-[56vh] min-h-[440px] rounded-3xl overflow-hidden shadow-xl bg-slate-950 flex flex-col justify-between p-6 text-white hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl cursor-pointer"
    >
      {/* Background Image with Ken-Burns Hover Effect */}
      <img
        src={primaryImage}
        alt={place.name}
        referrerPolicy="no-referrer"
        onError={(e) => {
          e.target.src = 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80';
        }}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
      
      {/* Top Badges */}
      <div className="relative z-10 flex items-center justify-between">
        <span className="bg-red-600 text-white text-[10px] sm:text-xs font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
          {categoryLabel}
        </span>
        {place.is_verified && (
          <span className="bg-emerald-600/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 backdrop-blur-md shadow-md">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verified</span>
          </span>
        )}
      </div>

      {/* Bottom Content Area */}
      <div className="relative z-10 space-y-3">
        
        {/* Location Pin */}
        <p className="text-xs text-amber-300 flex items-center gap-1.5 font-bold drop-shadow-sm">
          <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
          <span className="truncate">{locationText}</span>
        </p>

        {/* Place Title */}
        <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-amber-300 transition-colors leading-tight drop-shadow-md">
          {place.name}
        </h3>

        {/* Place Description preview */}
        {place.description && (
          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-normal">
            {place.description}
          </p>
        )}

        {/* Footer Meta & Explore Button */}
        <div className="pt-2 border-t border-white/15 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>{place.best_time_to_visit || "Year-round"}</span>
          </div>

          <span className="inline-block bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider px-5 py-2 rounded-full shadow-md group-hover:scale-105 transition-all">
            Explore →
          </span>
        </div>

      </div>
    </Link>
  );
};

export default TouristCard;
