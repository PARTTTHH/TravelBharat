import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, ArrowRight, Heart, Share2, MapPin, 
  Plane, Train, ChevronLeft, ChevronRight, Clock, Banknote, Calendar, ExternalLink, Map 
} from 'lucide-react';
import { fetchPlaceBySlug, fetchPlaces } from '../services/api';
import { getCityData, MONTH_NAMES } from '../services/cityData';
import { getPlaceData } from '../services/placeData';
import { STATE_PRIMARY_IMAGES } from '../services/stateData';
import { useFavorites } from '../context/FavoritesContext';

const PlaceDetail = () => {
  const { slug } = useParams();
  const [place, setPlace] = useState(null);
  const [nearbyAttractions, setNearbyAttractions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Favorites Context
  const { toggleFavorite, isFavorite } = useFavorites();

  // Section 1: Hero Carousel & Thumbnail Strip state
  const [heroIndex, setHeroIndex] = useState(0);

  // Section 2: Read more expansion & Share toast
  const [isReadMoreOpen, setIsReadMoreOpen] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Weather widget state: 'today' | 'monthly'
  const [weatherTab, setWeatherTab] = useState('monthly');
  const currentMonthIdx = new Date().getMonth(); // 0 to 11
  const [selectedMonthIdx, setSelectedMonthIdx] = useState(currentMonthIdx);

  // Section 3: Nearby Attractions Carousel state (4 per page)
  const [nearbyPage, setNearbyPage] = useState(0);
  const nearbyPerPage = 4;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLoading(true);
    setHeroIndex(0);
    setNearbyPage(0);
    setIsReadMoreOpen(false);

    const loadPlaceExperience = async () => {
      try {
        const normSlug = (slug || '').toLowerCase().trim();

        // 1. Fetch place details & all places in parallel
        const [placeData, allPlaces] = await Promise.all([
          fetchPlaceBySlug(normSlug),
          fetchPlaces({ page_size: 500 })
        ]);

        if (!placeData) {
          setLoading(false);
          return;
        }

        setPlace(placeData);

        const cityName = placeData.city_name || placeData.city?.name || '';
        const citySlug = placeData.city?.slug || (cityName ? cityName.toLowerCase().replace(/\s+/g, '-') : '');
        const stateName = placeData.state_name || placeData.state?.name || '';
        const stateSlug = placeData.state_slug || placeData.state?.slug || '';

        // 2. Compute Nearby Attractions (same city places first, then same state places, then regional)
        const otherPlacesInSameCity = (allPlaces || []).filter(
          p => p.slug !== normSlug && (
            (p.city_name && p.city_name.toLowerCase() === cityName.toLowerCase()) ||
            (p.city?.slug && p.city?.slug === citySlug)
          )
        );

        const otherPlacesInSameState = (allPlaces || []).filter(
          p => p.slug !== normSlug && !otherPlacesInSameCity.some(cp => cp.id === p.id) && (
            (p.state_name && p.state_name.toLowerCase() === stateName.toLowerCase()) ||
            (p.state_slug && p.state_slug === stateSlug)
          )
        );

        const otherPlacesAcrossIndia = (allPlaces || []).filter(
          p => p.slug !== normSlug && 
               !otherPlacesInSameCity.some(cp => cp.id === p.id) && 
               !otherPlacesInSameState.some(sp => sp.id === p.id)
        );

        const combinedNearby = [
          ...otherPlacesInSameCity,
          ...otherPlacesInSameState,
          ...otherPlacesAcrossIndia
        ];

        setNearbyAttractions(combinedNearby);

      } catch (err) {
        console.error("Error loading place details:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPlaceExperience();
  }, [slug]);

  if (loading) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center bg-slate-900 text-white space-y-4">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-base font-bold text-slate-300 tracking-wider uppercase">Loading Destination Experience...</p>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center bg-slate-900 text-white space-y-4">
        <h2 className="text-3xl font-black text-white">Destination Not Found</h2>
        <Link to="/places" className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider px-8 py-3 rounded-full transition-all">
          ← Back to Destinations
        </Link>
      </div>
    );
  }

  // 1. DYNAMIC GALLERY IMAGES FOR THIS SPECIFIC PLACE
  const galleryImages = [];
  if (place.images && place.images.length > 0) {
    place.images.forEach((img) => {
      const imgUrl = img.image_url || img.image;
      if (imgUrl && !galleryImages.some(i => i.url === imgUrl)) {
        galleryImages.push({ url: imgUrl, title: img.caption || place.name });
      }
    });
  }
  const mainImg = place.primary_image?.image_url || place.primary_image?.image;
  if (mainImg && !galleryImages.some(i => i.url === mainImg)) {
    galleryImages.unshift({ url: mainImg, title: place.name });
  }
  if (galleryImages.length === 0) {
    galleryImages.push({
      url: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=2000&q=80',
      title: place.name
    });
  }

  // City & State Context
  const cityName = place.city_name || place.city?.name || '';
  const citySlug = place.city?.slug || (cityName ? cityName.toLowerCase().replace(/\s+/g, '-') : '');
  const stateName = place.state_name || place.state?.name || '';
  const stateSlug = place.state_slug || place.state?.slug || '';
  const locationSubtitle = cityName && stateName ? `${cityName}, ${stateName}` : (stateName || cityName || "India");

  // Place Story & Deep Info
  const storyData = getPlaceData(place.slug, place.name, cityName, stateName, place.description, place.historical_significance);
  const cityStaticDetails = getCityData(citySlug, cityName, stateName);

  // Weather calculations
  const selectedMonthName = MONTH_NAMES[selectedMonthIdx];
  const weatherForSelectedMonth = cityStaticDetails.monthly_weather?.[selectedMonthName] || { min: 23, max: 33.5, condition: "Pleasant" };

  // Nearby Attractions Pagination (4 per view)
  const totalNearbyPages = Math.ceil(nearbyAttractions.length / nearbyPerPage) || 1;
  const currentNearbyView = nearbyAttractions.slice(
    nearbyPage * nearbyPerPage,
    (nearbyPage + 1) * nearbyPerPage
  );

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  const nextMonth = () => {
    setSelectedMonthIdx((prev) => (prev + 1) % 12);
  };

  const prevMonth = () => {
    setSelectedMonthIdx((prev) => (prev - 1 + 12) % 12);
  };

  return (
    <div className="w-full bg-slate-50 text-slate-900 font-sans overflow-x-hidden">

      {/* ============================================================ */}
      {/* SECTION 1: HERO PLACE BANNER & GALLERY THUMBNAIL STRIP      */}
      {/* ============================================================ */}
      <section className="relative h-[85vh] sm:h-[90vh] min-h-[600px] w-full bg-black text-white overflow-hidden flex flex-col justify-between">
        
        {/* Active Hero Image Background with Smooth Crossfade */}
        {galleryImages.map((img, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === heroIndex ? 'opacity-100 z-0' : 'opacity-0 -z-10 pointer-events-none'
            }`}
          >
            <img
              src={img.url}
              alt={img.title || place.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-90 animate-kenburns"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/40" />
          </div>
        ))}

        {/* Top Space */}
        <div />

        {/* Location (Small) + Place Name (Large) at Lower-Left */}
        <div className="relative z-10 px-6 sm:px-12 lg:px-16 pb-6 select-none space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-xl sm:text-2xl md:text-3xl font-bold tracking-wider text-white/90 drop-shadow-md">
              {locationSubtitle}
            </span>
            {place.categories?.[0] && (
              <span className="bg-red-600 text-white text-[10px] sm:text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                {place.categories[0].label || place.categories[0].name}
              </span>
            )}
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.9)] font-sans">
            {place.name}
          </h1>
        </div>

        {/* Hero Bottom Bar with Arrows & Gallery Thumbnails */}
        <div className="relative z-20 bg-black/60 backdrop-blur-md border-t border-white/10 px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
          
          {/* Badge: "1 of N" */}
          <div className="bg-slate-900/90 text-white text-xs sm:text-sm font-bold px-3 py-1.5 rounded-md border border-white/20 shrink-0">
            {heroIndex + 1} of {galleryImages.length}
          </div>

          {/* Thumbnail Strip (Photos of this place) */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none max-w-4xl mx-auto">
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setHeroIndex(idx)}
                className={`w-14 h-10 sm:w-20 sm:h-12 rounded-md overflow-hidden shrink-0 transition-all border-2 cursor-pointer ${
                  idx === heroIndex
                    ? 'border-amber-400 scale-105 shadow-lg'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={img.url}
                  alt={`Thumb ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          {/* Prev / Next Arrows */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setHeroIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)}
              className="p-2 text-white/80 hover:text-white hover:scale-125 transition-all text-xl cursor-pointer"
              aria-label="Previous image"
            >
              ←
            </button>
            <button
              onClick={() => setHeroIndex((prev) => (prev + 1) % galleryImages.length)}
              className="p-2 text-white/80 hover:text-white hover:scale-125 transition-all text-xl cursor-pointer"
              aria-label="Next image"
            >
              →
            </button>
          </div>

        </div>
      </section>


      {/* ============================================================ */}
      {/* SECTION 2: DEEP PLACE INFO & WEATHER / TRANSIT CARD          */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 lg:px-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left Column: Deep Story, Architecture & Information */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
              {storyData.headline}
            </h2>

            {storyData.deep_info?.slice(0, 2).map((paragraph, idx) => (
              <p key={idx} className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
                {paragraph}
              </p>
            ))}

            {/* Expandable Extended Info Chunks */}
            {isReadMoreOpen && (
              <div className="space-y-6 pt-2 text-base sm:text-lg text-slate-700 leading-relaxed animate-in fade-in duration-300">
                {storyData.deep_info?.slice(2).map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}

                {/* Historical Significance Block */}
                {place.historical_significance && (
                  <div className="p-6 bg-slate-100 rounded-3xl border border-slate-200 space-y-2">
                    <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-wider">
                      Historical Significance
                    </h3>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {place.historical_significance}
                    </p>
                  </div>
                )}

                {/* Practical Traveler Information Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
                  {place.best_time_to_visit && (
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-1">
                      <div className="flex items-center gap-2 font-bold text-amber-900 uppercase">
                        <Calendar className="w-4 h-4 text-amber-700" />
                        <span>Best Time to Visit</span>
                      </div>
                      <p className="text-slate-800 font-semibold">{place.best_time_to_visit}</p>
                    </div>
                  )}

                  {place.timings && (
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
                      <div className="flex items-center gap-2 font-bold text-emerald-900 uppercase">
                        <Clock className="w-4 h-4 text-emerald-700" />
                        <span>Visiting Timings</span>
                      </div>
                      <p className="text-slate-800 font-semibold">{place.timings}</p>
                    </div>
                  )}

                  {place.entry_fee && (
                    <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 space-y-1 sm:col-span-2">
                      <div className="flex items-center gap-2 font-bold text-rose-900 uppercase">
                        <Banknote className="w-4 h-4 text-rose-700" />
                        <span>Entry Fee</span>
                      </div>
                      <p className="text-slate-800 font-semibold">{place.entry_fee}</p>
                    </div>
                  )}
                </div>

                {/* Google Maps Button */}
                {place.location_map_url && (
                  <div className="pt-2">
                    <a
                      href={place.location_map_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-full shadow-md transition-all hover:scale-105"
                    >
                      <Map className="w-4 h-4" />
                      <span>View on Google Maps</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            )}

            <div>
              <button
                onClick={() => setIsReadMoreOpen(!isReadMoreOpen)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm uppercase tracking-wider px-8 py-3.5 rounded-full shadow-md transition-all hover:scale-105 cursor-pointer"
              >
                {isReadMoreOpen ? "Read Less" : "Read more"}
              </button>
            </div>
          </div>

          {/* Right Column: Place Photo Preview & Weather / Transit Card */}
          <div className="lg:col-span-5 bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xl space-y-0">
            
            {/* Primary Place Preview / Map Pin Preview */}
            <div className="h-56 bg-slate-100 relative overflow-hidden border-b border-slate-200 flex items-center justify-center p-4">
              <img
                src={galleryImages[0].url}
                alt={`${place.name} Location`}
                className="w-full h-full object-cover rounded-xl shadow-inner brightness-95"
              />
              <div className="absolute inset-0 bg-slate-900/15" />
              <div className="absolute top-5 right-5 bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-slate-800 shadow-md border border-slate-200 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-red-600" />
                <span>{locationSubtitle}</span>
              </div>
            </div>

            {/* Weather Widget */}
            <div className="p-6 bg-slate-50 border-b border-slate-200 space-y-3">
              <div className="flex items-center justify-center gap-3 text-sm font-bold">
                <button
                  onClick={() => setWeatherTab('today')}
                  className={`pb-0.5 cursor-pointer ${
                    weatherTab === 'today'
                      ? 'text-slate-900 font-extrabold border-b-2 border-slate-900'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Today
                </button>
                <span className="text-slate-300">|</span>
                <button
                  onClick={() => setWeatherTab('monthly')}
                  className={`pb-0.5 cursor-pointer ${
                    weatherTab === 'monthly'
                      ? 'text-red-600 font-extrabold border-b-2 border-red-600'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Monthly
                </button>
              </div>

              {weatherTab === 'monthly' ? (
                <div className="text-center space-y-1">
                  <div className="flex items-center justify-center gap-3">
                    <button 
                      onClick={prevMonth}
                      className="p-1 hover:text-red-600 transition-colors cursor-pointer"
                      aria-label="Previous Month"
                    >
                      <ChevronLeft className="w-4 h-4 text-red-600" />
                    </button>
                    <span className="text-sm font-semibold text-slate-700 w-24">
                      {selectedMonthName}
                    </span>
                    <button 
                      onClick={nextMonth}
                      className="p-1 hover:text-red-600 transition-colors cursor-pointer"
                      aria-label="Next Month"
                    >
                      <ChevronRight className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight">
                    {weatherForSelectedMonth.min} - {weatherForSelectedMonth.max} °C
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {weatherForSelectedMonth.condition}
                  </p>
                </div>
              ) : (
                <div className="text-center space-y-1">
                  <div className="text-sm font-semibold text-slate-700">
                    Current Destination Temperature
                  </div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight">
                    {cityStaticDetails.today_temp?.min || 23} - {cityStaticDetails.today_temp?.max || 33.5} °C
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Live Forecast & Average Conditions
                  </p>
                </div>
              )}
            </div>

            {/* Nearest Airport & Railway Station */}
            <div className="p-6 sm:p-7 space-y-5 bg-white">
              
              {/* Airport */}
              <div className="space-y-1">
                <h3 className="text-xs sm:text-sm font-extrabold text-red-600 uppercase tracking-wider flex items-center gap-2">
                  <Plane className="w-4 h-4" />
                  <span>Nearest Airport :</span>
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug pl-6">
                  {cityStaticDetails.nearest_airport}
                </p>
              </div>

              {/* Railway Station */}
              <div className="space-y-1">
                <h3 className="text-xs sm:text-sm font-extrabold text-red-600 uppercase tracking-wider flex items-center gap-2">
                  <Train className="w-4 h-4" />
                  <span>Nearest Railway Station :</span>
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug pl-6">
                  {cityStaticDetails.nearest_railway}
                </p>
              </div>

            </div>

            {/* Red Action Footer Bar (Heart & Share) */}
            <div className="bg-red-600 text-white flex items-center divide-x divide-red-700">
              <button
                type="button"
                onClick={() => {
                  if (place) {
                    toggleFavorite({
                      id: place.id || place.slug,
                      title: place.name,
                      name: place.name,
                      slug: place.slug,
                      type: 'place',
                      link: `/places/${place.slug}`,
                      image: place.primary_image?.image_url || place.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80',
                      location: [place.city?.name, place.state?.name].filter(Boolean).join(', ')
                    });
                  }
                }}
                className="flex-1 py-4 flex items-center justify-center gap-2 hover:bg-red-700 transition-colors font-bold text-xs uppercase tracking-wider cursor-pointer select-none"
                title={place && (isFavorite(place.slug) || isFavorite(place.id) || isFavorite(place.name)) ? "Saved in Favorites" : "Save to Favorites"}
              >
                <Heart 
                  className={`w-5 h-5 transition-transform duration-200 ${
                    place && (isFavorite(place.slug) || isFavorite(place.id) || isFavorite(place.name))
                      ? 'fill-white text-white scale-110' 
                      : 'text-white'
                  }`} 
                />
                <span>
                  {place && (isFavorite(place.slug) || isFavorite(place.id) || isFavorite(place.name)) ? 'Saved' : 'Save'}
                </span>
              </button>

              <button
                onClick={handleShare}
                className="flex-1 py-4 flex items-center justify-center gap-2 hover:bg-red-700 transition-colors font-bold text-xs uppercase tracking-wider cursor-pointer"
                title="Share this Destination"
              >
                <Share2 className="w-5 h-5" />
                <span>{copiedShare ? 'Link Copied!' : 'Share'}</span>
              </button>
            </div>

          </div>

        </div>
      </section>


      {/* ============================================================ */}
      {/* SECTION 3: ATTRACTIONS NEARBY (SAME CITY & STATE PLACES)    */}
      {/* ============================================================ */}
      <section className="py-20 sm:py-24 px-4 sm:px-8 lg:px-16 bg-white border-b border-slate-200">
        <div className="max-w-[1650px] mx-auto space-y-12 text-center">
          
          {/* Header */}
          <div className="space-y-1">
            <p className="text-base sm:text-xl font-serif italic text-slate-500 font-medium">
              — More —
            </p>
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-slate-900 font-sans">
              ATTRACTIONS NEARBY
            </h2>
          </div>

          {/* 4-Card Nearby Attractions Row with Hover Animation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {currentNearbyView.map((item) => {
              const itemImg = item.primary_image?.image_url || item.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80';
              
              return (
                <Link
                  key={item.id || item.slug}
                  to={`/places/${item.slug}`}
                  className="group relative h-[56vh] min-h-[440px] rounded-3xl overflow-hidden shadow-xl bg-slate-900 flex flex-col justify-end p-6 text-white transition-all duration-500 hover:shadow-2xl hover:scale-105 cursor-pointer"
                >
                  {/* Attraction Background Image */}
                  <img
                    src={itemImg}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                  {/* Attraction Name at Bottom & Hover Discover More Button */}
                  <div className="relative z-10 space-y-3 text-center sm:text-left">
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white group-hover:text-amber-300 transition-colors drop-shadow-md leading-tight">
                      {item.name}
                    </h3>

                    {/* Button appears / slides up on hover */}
                    <div className="opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      <span className="inline-block bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider px-6 py-2.5 rounded-full shadow-lg">
                        Discover more →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Bottom Navigation Arrows & Discover More CTA */}
          <div className="space-y-6 pt-4">
            {totalNearbyPages > 1 && (
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setNearbyPage((prev) => (prev - 1 + totalNearbyPages) % totalNearbyPages)}
                  className="w-12 h-12 rounded-full bg-white border border-slate-300 text-slate-700 hover:bg-red-600 hover:text-white hover:border-red-600 flex items-center justify-center transition-all shadow-md cursor-pointer"
                  aria-label="Previous Attractions"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setNearbyPage((prev) => (prev + 1) % totalNearbyPages)}
                  className="w-12 h-12 rounded-full bg-white border border-slate-300 text-slate-700 hover:bg-red-600 hover:text-white hover:border-red-600 flex items-center justify-center transition-all shadow-md cursor-pointer"
                  aria-label="Next Attractions"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}

            <div>
              <Link
                to={stateSlug ? `/places?state=${stateSlug}` : "/places"}
                className="inline-block bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider px-10 py-3.5 rounded-full shadow-lg transition-all hover:scale-105"
              >
                Discover more
              </Link>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};

export default PlaceDetail;
