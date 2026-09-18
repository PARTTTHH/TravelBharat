import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, ArrowRight, Heart, Share2, MapPin, 
  Plane, Train, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { fetchPlaces, fetchStates, fetchCities } from '../services/api';
import { getCityData, MONTH_NAMES } from '../services/cityData';
import { STATE_PRIMARY_IMAGES } from '../services/stateData';
import { useFavorites } from '../context/FavoritesContext';

const CityDetail = () => {
  const { slug } = useParams();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [cityData, setCityData] = useState(null);
  const [cityPlaces, setCityPlaces] = useState([]);
  const [nearbyCities, setNearbyCities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Section 1: Hero Carousel & Thumbnail Strip state
  const [heroIndex, setHeroIndex] = useState(0);

  // Section 2: Read more expansion, Weather widget, & Favorites
  const [isReadMoreOpen, setIsReadMoreOpen] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  
  // Weather widget state: 'today' | 'monthly'
  const [weatherTab, setWeatherTab] = useState('monthly');
  const currentMonthIdx = new Date().getMonth(); // 0 to 11
  const [selectedMonthIdx, setSelectedMonthIdx] = useState(currentMonthIdx);

  // Section 3: Attractions Carousel state (4 per page)
  const [attractionPage, setAttractionPage] = useState(0);
  const attractionsPerPage = 4;

  // Section 4: Nearby Destinations Carousel state (4 per page)
  const [nearbyPage, setNearbyPage] = useState(0);
  const nearbyPerPage = 4;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLoading(true);
    setHeroIndex(0);
    setAttractionPage(0);
    setNearbyPage(0);
    setIsReadMoreOpen(false);

    const loadCityExperience = async () => {
      try {
        const normSlug = (slug || '').toLowerCase().trim();

        // 1. Fetch direct places for this city, all cities, and all places
        const [directCityPlaces, allPlaces, allStates, allCities] = await Promise.all([
          fetchPlaces({ city: normSlug, page_size: 100 }),
          fetchPlaces({ page_size: 500 }),
          fetchStates({ page_size: 500 }),
          fetchCities({ page_size: 500 })
        ]);

        // Find matched city object
        let matchedCity = (allCities || []).find(
          c => c.slug === normSlug || c.name.toLowerCase() === normSlug.replace(/-/g, ' ')
        );
        
        // Combine places: direct API results + filtered from all places
        const placesInCityMap = new Map();
        (directCityPlaces || []).forEach(p => placesInCityMap.set(p.id, p));

        (allPlaces || []).forEach(p => {
          const cSlug = p.city?.slug || (p.city_name ? p.city_name.toLowerCase().replace(/\s+/g, '-') : '');
          const cName = (p.city_name || p.city?.name || '').toLowerCase();
          const targetName = normSlug.replace(/-/g, ' ');
          if (cSlug === normSlug || cName === targetName || (matchedCity && cName === matchedCity.name.toLowerCase())) {
            placesInCityMap.set(p.id, p);
          }
        });

        const combinedPlaces = Array.from(placesInCityMap.values());

        const stateNameFromPlace = combinedPlaces[0]?.state_name || combinedPlaces[0]?.state?.name || matchedCity?.state_name || '';
        const stateSlugFromPlace = combinedPlaces[0]?.state_slug || combinedPlaces[0]?.state?.slug || matchedCity?.state_slug || '';

        const cityName = matchedCity?.name || (combinedPlaces[0]?.city_name || combinedPlaces[0]?.city?.name) || normSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        const stateName = stateNameFromPlace || "India";

        // Generate rich story, transit, and weather data
        const staticDetails = getCityData(normSlug, cityName, stateName);

        setCityData({
          name: cityName,
          slug: normSlug,
          stateName: stateName,
          stateSlug: stateSlugFromPlace,
          description: matchedCity?.description || staticDetails.paragraphs[0],
          tagline: staticDetails.tagline,
          paragraphs: staticDetails.paragraphs,
          nearestAirport: staticDetails.nearest_airport,
          nearestRailway: staticDetails.nearest_railway,
          todayTemp: staticDetails.today_temp,
          monthlyWeather: staticDetails.monthly_weather
        });

        setCityPlaces(combinedPlaces);

        // 2. Compute Nearby Destinations (cities from the same state or adjacent regions)
        let sameStateCities = [];
        if (stateSlugFromPlace) {
          sameStateCities = (allCities || []).filter(c => c.state_slug === stateSlugFromPlace && c.slug !== normSlug);
        }
        
        // If not enough cities in the same state, pull from all cities
        if (sameStateCities.length < 4) {
          const otherCities = (allCities || []).filter(c => c.slug !== normSlug && !sameStateCities.some(sc => sc.slug === c.slug));
          sameStateCities = [...sameStateCities, ...otherCities];
        }

        // Attach image for each nearby city from its places in database
        const nearbyWithImages = sameStateCities.map(c => {
          const placeForCity = (allPlaces || []).find(p => {
            const pCity = (p.city_name || p.city?.name || '').toLowerCase();
            return pCity === c.name.toLowerCase() || p.city?.slug === c.slug;
          });
          const imgUrl = placeForCity?.primary_image?.image_url || placeForCity?.images?.[0]?.image_url || STATE_PRIMARY_IMAGES[c.state_slug] || 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80';
          return {
            name: c.name,
            slug: c.slug,
            stateName: c.state_name || stateName,
            image: imgUrl
          };
        });

        setNearbyCities(nearbyWithImages);

      } catch (err) {
        console.error("Error loading city details:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCityExperience();
  }, [slug]);

  if (loading || !cityData) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center bg-slate-900 text-white space-y-4">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-base font-bold text-slate-300 tracking-wider uppercase">Loading City Experience...</p>
      </div>
    );
  }

  // 1. DYNAMIC GALLERY IMAGES (Picks all images from all places belonging to this city)
  const galleryImages = [];
  cityPlaces.forEach((p) => {
    if (p.images && p.images.length > 0) {
      p.images.forEach((img) => {
        const imgUrl = img.image_url || img.image;
        if (imgUrl && !galleryImages.some(i => i.url === imgUrl)) {
          galleryImages.push({ url: imgUrl, title: img.caption || p.name });
        }
      });
    }
    const mainImg = p.primary_image?.image_url || p.primary_image?.image;
    if (mainImg && !galleryImages.some(i => i.url === mainImg)) {
      galleryImages.push({ url: mainImg, title: p.name });
    }
  });

  // Fallback hero if places have no images yet
  if (galleryImages.length === 0) {
    galleryImages.push({
      url: STATE_PRIMARY_IMAGES[cityData.stateSlug] || 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=2000&q=80',
      title: cityData.name
    });
  }

  // Weather calculations
  const selectedMonthName = MONTH_NAMES[selectedMonthIdx];
  const weatherForSelectedMonth = cityData.monthlyWeather?.[selectedMonthName] || { min: 22, max: 33, condition: "Pleasant" };

  // 3. ATTRACTIONS PAGINATION (4 per view)
  const totalAttractionPages = Math.ceil(cityPlaces.length / attractionsPerPage) || 1;
  const currentAttractionsView = cityPlaces.slice(
    attractionPage * attractionsPerPage,
    (attractionPage + 1) * attractionsPerPage
  );

  // 4. NEARBY DESTINATIONS PAGINATION (4 per view)
  const totalNearbyPages = Math.ceil(nearbyCities.length / nearbyPerPage) || 1;
  const currentNearbyView = nearbyCities.slice(
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
      {/* SECTION 1: HERO CITY BANNER & GALLERY THUMBNAIL STRIP       */}
      {/* ============================================================ */}
      <section className="relative h-[85vh] sm:h-[90vh] min-h-[600px] w-full bg-black text-white overflow-hidden flex flex-col justify-between">
        
        {/* Active Hero Image Background with Smooth Fade */}
        {galleryImages.map((img, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === heroIndex ? 'opacity-100 z-0' : 'opacity-0 -z-10 pointer-events-none'
            }`}
          >
            <img
              src={img.url}
              alt={img.title || cityData.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-90 animate-kenburns"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40" />
          </div>
        ))}

        {/* Top Space */}
        <div />

        {/* State Name (Small) + City Name (Large) at Lower-Left Center */}
        <div className="relative z-10 px-6 sm:px-12 lg:px-16 pb-6 select-none space-y-1">
          {cityData.stateName && (
            <p className="text-xl sm:text-2xl md:text-3xl font-bold tracking-wider text-white/90 drop-shadow-md">
              {cityData.stateName}
            </p>
          )}
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.9)] font-sans">
            {cityData.name}
          </h1>
        </div>

        {/* Hero Bottom Bar with Arrows & Gallery Thumbnails */}
        <div className="relative z-20 bg-black/60 backdrop-blur-md border-t border-white/10 px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
          
          {/* Badge: "1 of 9" */}
          <div className="bg-slate-900/90 text-white text-xs sm:text-sm font-bold px-3 py-1.5 rounded-md border border-white/20 shrink-0">
            {heroIndex + 1} of {galleryImages.length}
          </div>

          {/* Thumbnail Strip (Places in this city) */}
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
      {/* SECTION 2: CITY HERITAGE STORY & WEATHER / TRANSIT CARD      */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 lg:px-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left Column: Story & Narrative */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
              {cityData.tagline}
            </h2>

            {cityData.paragraphs?.slice(0, 2).map((paragraph, idx) => (
              <p key={idx} className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
                {paragraph}
              </p>
            ))}

            {/* Expandable Extended Cultural Info */}
            {isReadMoreOpen && (
              <div className="space-y-4 pt-2 text-base sm:text-lg text-slate-700 leading-relaxed animate-in fade-in duration-300">
                {cityData.paragraphs?.slice(2).map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-sm text-amber-950 font-medium">
                  <strong>State:</strong> {cityData.stateName} | <strong>Verified Sights:</strong> {cityPlaces.length} Iconic Attractions
                </div>
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

          {/* Right Column: Interactive Map, Weather & Transit Card */}
          <div className="lg:col-span-5 bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xl space-y-0">
            
            {/* Map Snippet Preview with City Pin */}
            <div className="h-52 bg-slate-100 relative overflow-hidden border-b border-slate-200 flex items-center justify-center p-4">
              <img
                src={galleryImages[0].url}
                alt={`${cityData.name} Map Location`}
                className="w-full h-full object-cover rounded-xl shadow-inner brightness-90"
              />
              <div className="absolute inset-0 bg-slate-900/20" />
              <div className="absolute top-5 right-5 bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-slate-800 shadow-md border border-slate-200 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-red-600" />
                <span>{cityData.name}, {cityData.stateName}</span>
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
                    Current Temperature
                  </div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight">
                    {cityData.todayTemp?.min || 23} - {cityData.todayTemp?.max || 33} °C
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Live Forecast & Average Temperature
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
                  {cityData.nearestAirport}
                </p>
              </div>

              {/* Railway Station */}
              <div className="space-y-1">
                <h3 className="text-xs sm:text-sm font-extrabold text-red-600 uppercase tracking-wider flex items-center gap-2">
                  <Train className="w-4 h-4" />
                  <span>Nearest Railway Station :</span>
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug pl-6">
                  {cityData.nearestRailway}
                </p>
              </div>

            </div>

            {/* Red Action Footer Bar (Heart & Share) */}
            <div className="bg-red-600 text-white flex items-center divide-x divide-red-700">
              <button
                type="button"
                onClick={() => {
                  if (cityData) {
                    toggleFavorite({
                      id: `city-${cityData.slug || slug}`,
                      title: cityData.name,
                      name: cityData.name,
                      slug: cityData.slug || slug,
                      type: 'city',
                      link: `/cities/${cityData.slug || slug}`,
                      image: cityPlaces[0]?.primary_image?.image_url || cityPlaces[0]?.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80',
                      location: cityData.stateName || 'India'
                    });
                  }
                }}
                className="flex-1 py-4 flex items-center justify-center gap-2 hover:bg-red-700 transition-colors font-bold text-xs uppercase tracking-wider cursor-pointer select-none"
                title={(isFavorite(`city-${cityData?.slug || slug}`) || isFavorite(slug)) ? "Saved in Favorites" : "Save to Favorites"}
              >
                <Heart 
                  className={`w-5 h-5 transition-transform duration-200 ${
                    (isFavorite(`city-${cityData?.slug || slug}`) || isFavorite(slug) || isFavorite(cityData?.name))
                      ? 'fill-white text-white scale-110' 
                      : 'text-white'
                  }`} 
                />
                <span>
                  {(isFavorite(`city-${cityData?.slug || slug}`) || isFavorite(slug) || isFavorite(cityData?.name)) ? 'Saved' : 'Save'}
                </span>
              </button>

              <button
                onClick={handleShare}
                className="flex-1 py-4 flex items-center justify-center gap-2 hover:bg-red-700 transition-colors font-bold text-xs uppercase tracking-wider cursor-pointer"
                title="Share this City"
              >
                <Share2 className="w-5 h-5" />
                <span>{copiedShare ? 'Link Copied!' : 'Share'}</span>
              </button>
            </div>

          </div>

        </div>
      </section>


      {/* ============================================================ */}
      {/* SECTION 3: CITY ATTRACTIONS ("WORTH A THOUSAND STORIES")     */}
      {/* ============================================================ */}
      <section className="py-20 px-4 sm:px-8 lg:px-16 bg-slate-100 border-b border-slate-200">
        <div className="max-w-[1650px] mx-auto space-y-10 text-center">
          
          {/* Header */}
          <div className="space-y-1">
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-slate-900 font-sans">
              ATTRACTIONS
            </h2>
            <p className="text-base sm:text-xl font-serif italic text-red-600 font-medium">
              — worth a thousand stories —
            </p>
          </div>

          {/* 4-Card Attraction Row */}
          {cityPlaces.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
              {currentAttractionsView.map((item, idx) => {
                const imgUrl = item.primary_image?.image_url || item.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80';
                const categoryLabel = item.categories?.[0]?.label || item.categories?.[0]?.name || "Heritage";

                return (
                  <Link
                    key={idx}
                    to={`/places/${item.slug}`}
                    className="group relative h-[52vh] min-h-[400px] rounded-3xl overflow-hidden shadow-xl bg-slate-950 flex flex-col justify-between p-6 text-white hover:-translate-y-1.5 transition-all duration-300 cursor-pointer"
                  >
                    <img
                      src={imgUrl}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80';
                      }}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent" />

                    {/* Top Badge */}
                    <div className="relative z-10 flex justify-between items-center">
                      <span className="bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                        {categoryLabel}
                      </span>
                    </div>

                    {/* Bottom Text & Explore Button on Hover */}
                    <div className="relative z-10 space-y-3">
                      <h3 className="text-xl font-extrabold text-white group-hover:text-amber-300 transition-colors leading-snug">
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-normal">
                          {item.description}
                        </p>
                      )}

                      {/* Explore Button on Hover */}
                      <div className="opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pt-1">
                        <span className="inline-block bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider px-5 py-2 rounded-full shadow-md">
                          Explore →
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="py-12 bg-white rounded-3xl border border-slate-200 text-slate-600 text-center max-w-lg mx-auto">
              <p className="text-base font-semibold">Iconic sights for {cityData.name} are being added.</p>
            </div>
          )}

          {/* Navigation Controls (Clean arrows without page count) */}
          {totalAttractionPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                onClick={() => setAttractionPage((prev) => (prev - 1 + totalAttractionPages) % totalAttractionPages)}
                className="w-11 h-11 rounded-full bg-white border border-slate-300 text-slate-700 hover:bg-red-600 hover:text-white hover:border-red-600 flex items-center justify-center transition-all shadow-md cursor-pointer"
                aria-label="Previous Attractions"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setAttractionPage((prev) => (prev + 1) % totalAttractionPages)}
                className="w-11 h-11 rounded-full bg-white border border-slate-300 text-slate-700 hover:bg-red-600 hover:text-white hover:border-red-600 flex items-center justify-center transition-all shadow-md cursor-pointer"
                aria-label="Next Attractions"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

        </div>
      </section>


      {/* ============================================================ */}
      {/* SECTION 4: DESTINATIONS NEARBY (NEARBY CITIES IN REGION)     */}
      {/* ============================================================ */}
      <section className="py-20 sm:py-24 px-4 sm:px-8 lg:px-16 bg-white border-b border-slate-200">
        <div className="max-w-[1650px] mx-auto space-y-12 text-center">
          
          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-slate-900 font-sans">
              DESTINATIONS NEARBY
            </h2>
          </div>

          {/* 4-Card Nearby Cities Row with Hover Scale & Discover More */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {currentNearbyView.map((nearbyCity) => (
              <Link
                key={nearbyCity.slug}
                to={`/cities/${nearbyCity.slug}`}
                className="group relative h-[56vh] min-h-[440px] rounded-3xl overflow-hidden shadow-xl bg-slate-900 flex flex-col justify-end p-6 text-white transition-all duration-500 hover:shadow-2xl hover:scale-105 cursor-pointer"
              >
                {/* City Background Image */}
                <img
                  src={nearbyCity.image}
                  alt={nearbyCity.name}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                {/* City Name at Bottom & Hover Discover More Pill Button */}
                <div className="relative z-10 space-y-3 text-center sm:text-left">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white group-hover:text-amber-300 transition-colors drop-shadow-md">
                    {nearbyCity.name}
                  </h3>

                  {/* Button appears / slides up on hover */}
                  <div className="opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <span className="inline-block bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider px-6 py-2.5 rounded-full shadow-lg">
                      Discover more →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Bottom Navigation Arrows */}
          {totalNearbyPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                onClick={() => setNearbyPage((prev) => (prev - 1 + totalNearbyPages) % totalNearbyPages)}
                className="w-12 h-12 rounded-full bg-white border border-slate-300 text-slate-700 hover:bg-red-600 hover:text-white hover:border-red-600 flex items-center justify-center transition-all shadow-md cursor-pointer"
                aria-label="Previous Destinations"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setNearbyPage((prev) => (prev + 1) % totalNearbyPages)}
                className="w-12 h-12 rounded-full bg-white border border-slate-300 text-slate-700 hover:bg-red-600 hover:text-white hover:border-red-600 flex items-center justify-center transition-all shadow-md cursor-pointer"
                aria-label="Next Destinations"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

        </div>
      </section>

    </div>
  );
};

export default CityDetail;
