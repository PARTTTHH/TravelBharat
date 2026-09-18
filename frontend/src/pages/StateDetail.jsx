import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, ArrowRight, Heart, Share2, MapPin, 
  Plane, ChevronRight, CheckCircle2 
} from 'lucide-react';
import { getAirportsForState, STATE_PRIMARY_IMAGES } from '../services/stateData';
import { fetchPlaces, fetchStates, REGIONAL_STATES } from '../services/api';
import { useFavorites } from '../context/FavoritesContext';

const StateDetail = () => {
  const { slug } = useParams();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [stateData, setStateData] = useState(null);
  const [places, setPlaces] = useState([]);
  const [allStates, setAllStates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Section 1: Hero Carousel & Thumbnail Strip state
  const [heroIndex, setHeroIndex] = useState(0);

  // Section 2: Read more expansion state & Favorites
  const [isReadMoreOpen, setIsReadMoreOpen] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Section 3: State Destinations (Top Cities) Carousel state
  const [cityIndex, setCityIndex] = useState(0);

  // Section 4: Attractions Carousel state
  const [attractionPage, setAttractionPage] = useState(0);
  const attractionsPerPage = 4;

  // Section 5: Explore Other States Carousel state
  const [otherStatesPage, setOtherStatesPage] = useState(0);
  const otherStatesPerPage = 4;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLoading(true);
    setHeroIndex(0);
    setCityIndex(0);
    setAttractionPage(0);
    setIsReadMoreOpen(false);

    const loadData = async () => {
      try {
        const [statesList, statePlaces] = await Promise.all([
          fetchStates({ page_size: 500 }),
          fetchPlaces({ state: slug, page_size: 500 })
        ]);

        setAllStates(statesList || []);
        setPlaces(statePlaces || []);

        const foundState = (statesList || []).find(s => s.slug === slug) || {
          name: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          slug: slug,
          capital: 'Capital',
          description: `Discover handpicked tourist destinations, historical landmarks, and rich living culture across ${slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}.`
        };

        setStateData(foundState);
      } catch (err) {
        console.error("Error loading state details:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [slug]);

  if (loading || !stateData) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center bg-slate-900 text-white space-y-4">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-base font-bold text-slate-300 tracking-wider uppercase">Loading State Experience...</p>
      </div>
    );
  }

  // 1. DYNAMIC GALLERY IMAGES (Picks all images from all places in this state)
  const galleryImages = [];
  places.forEach((p) => {
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
      url: STATE_PRIMARY_IMAGES[slug] || 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=2000&q=80',
      title: stateData.name
    });
  }

  // 2. DYNAMIC TOP CITIES (Uses the most popular place image for each city)
  const cityMap = {};
  places.forEach((p) => {
    const cityName = p.city_name || p.city?.name;
    const citySlug = p.city?.slug || (cityName ? cityName.toLowerCase().replace(/\s+/g, '-') : '');
    if (cityName && !cityMap[cityName]) {
      const cityImg = p.primary_image?.image_url || p.images?.[0]?.image_url;
      cityMap[cityName] = {
        name: cityName,
        slug: citySlug,
        subtitle: `Explore ${p.name} & Iconic Sights`,
        image: cityImg || galleryImages[0].url
      };
    }
  });
  const stateCities = Object.values(cityMap);

  // Fallback city if none listed
  if (stateCities.length === 0) {
    stateCities.push({
      name: stateData.capital || stateData.name,
      slug: (stateData.capital || stateData.name).toLowerCase().replace(/\s+/g, '-'),
      subtitle: `Capital & Cultural Heritage Hub of ${stateData.name}`,
      image: galleryImages[0].url
    });
  }

  // 3. NEAREST AIRPORTS
  const airports = getAirportsForState(slug);

  // 4. ATTRACTIONS PAGINATION (4 per view)
  const totalAttractionPages = Math.ceil(places.length / attractionsPerPage) || 1;
  const currentAttractionsView = places.slice(
    attractionPage * attractionsPerPage,
    (attractionPage + 1) * attractionsPerPage
  );

  // 5. EXPLORE OTHER STATES (Uses each state's primary image)
  const allStatesFlattened = [];
  Object.values(REGIONAL_STATES).forEach(stateArr => {
    stateArr.forEach(st => {
      if (st.slug !== slug && !allStatesFlattened.some(s => s.slug === st.slug)) {
        allStatesFlattened.push({
          name: st.name,
          slug: st.slug,
          image: STATE_PRIMARY_IMAGES[st.slug] || 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80'
        });
      }
    });
  });
  const totalOtherStatesPages = Math.ceil(allStatesFlattened.length / otherStatesPerPage) || 1;
  const currentOtherStates = allStatesFlattened.slice(
    otherStatesPage * otherStatesPerPage,
    (otherStatesPage + 1) * otherStatesPerPage
  );

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  return (
    <div className="w-full bg-slate-50 text-slate-900 font-sans overflow-x-hidden">

      {/* ============================================================ */}
      {/* SECTION 1: HERO STATE IMAGE & BOTTOM GALLERY THUMBNAIL STRIP */}
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
              alt={img.title || stateData.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-85 animate-kenburns"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40" />
          </div>
        ))}

        {/* Top Space */}
        <div />

        {/* State Name Large Typography in Lower-Left Center */}
        <div className="relative z-10 px-6 sm:px-12 lg:px-16 pb-6 select-none">
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.9)] font-sans">
            {stateData.name}
          </h1>
        </div>

        {/* Hero Bottom Bar with Arrows & Gallery Thumbnails */}
        <div className="relative z-20 bg-black/60 backdrop-blur-md border-t border-white/10 px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
          
          {/* Badge: "1 of 10" */}
          <div className="bg-slate-900/90 text-white text-xs sm:text-sm font-bold px-3 py-1.5 rounded-md border border-white/20 shrink-0">
            {heroIndex + 1} of {galleryImages.length}
          </div>

          {/* Thumbnail Strip (Picks directly from places in this state) */}
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
      {/* SECTION 2: "A FUSION OF HERITAGE AND CULTURE" + AIRPORTS CARD */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 lg:px-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left Column: Story & Culture */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
              A fusion of heritage and culture
            </h2>

            <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
              {stateData.description || `${stateData.name}, a state steeped in compelling narratives, stands as a testament to the richness of India's varied heritage and the grandeur of its landscapes.`}
            </p>

            {/* Expandable Extended Cultural Info */}
            {isReadMoreOpen && (
              <div className="space-y-4 pt-2 text-base sm:text-lg text-slate-700 leading-relaxed animate-in fade-in duration-300">
                <p>
                  From ancient rock-cut architectural wonders and historic royal monuments to lively local festivals, music, dance, and authentic cuisine, {stateData.name} offers a captivating journey through time.
                </p>
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-sm text-amber-950 font-medium">
                  <strong>Capital City:</strong> {stateData.capital || stateData.name} | <strong>Total Verified Places:</strong> {places.length}
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

          {/* Right Column: Interactive Map & Nearest Airports Card */}
          <div className="lg:col-span-5 bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xl space-y-0">
            
            {/* Map Snippet Preview */}
            <div className="h-56 bg-slate-100 relative overflow-hidden border-b border-slate-200 flex items-center justify-center p-4">
              <img
                src={STATE_PRIMARY_IMAGES[slug] || galleryImages[0].url}
                alt={`${stateData.name} Map Location`}
                className="w-full h-full object-cover rounded-xl shadow-inner"
              />
              <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-800 shadow-md border border-slate-200 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-red-600" />
                <span>{stateData.name}</span>
              </div>
            </div>

            {/* Airports Listing */}
            <div className="p-6 sm:p-8 space-y-4 bg-white">
              <h3 className="text-base font-extrabold text-red-600 uppercase tracking-wider flex items-center gap-2">
                <Plane className="w-4 h-4" />
                <span>Nearest Airports :</span>
              </h3>

              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-800">
                {airports.map((airport, idx) => (
                  <li key={idx} className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                    <span className="font-semibold text-slate-800 leading-snug">
                      {airport.name}
                    </span>
                    <span className="bg-slate-100 text-red-600 px-2.5 py-0.5 rounded-md font-black text-xs shrink-0 border border-slate-200">
                      {airport.code}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Red Action Footer Bar (Heart & Share) */}
            <div className="bg-red-600 text-white flex items-center divide-x divide-red-700">
              <button
                type="button"
                onClick={() => {
                  if (stateData) {
                    toggleFavorite({
                      id: `state-${stateData.slug || slug}`,
                      title: stateData.name,
                      name: stateData.name,
                      slug: stateData.slug || slug,
                      type: 'state',
                      link: `/states/${stateData.slug || slug}`,
                      image: STATE_PRIMARY_IMAGES[stateData.slug || slug] || places[0]?.primary_image?.image_url || 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80',
                      location: 'India'
                    });
                  }
                }}
                className="flex-1 py-4 flex items-center justify-center gap-2 hover:bg-red-700 transition-colors font-bold text-xs uppercase tracking-wider cursor-pointer select-none"
                title={(isFavorite(`state-${stateData?.slug || slug}`) || isFavorite(slug)) ? "Saved in Favorites" : "Save to Favorites"}
              >
                <Heart 
                  className={`w-5 h-5 transition-transform duration-200 ${
                    (isFavorite(`state-${stateData?.slug || slug}`) || isFavorite(slug) || isFavorite(stateData?.name))
                      ? 'fill-white text-white scale-110' 
                      : 'text-white'
                  }`} 
                />
                <span>
                  {(isFavorite(`state-${stateData?.slug || slug}`) || isFavorite(slug) || isFavorite(stateData?.name)) ? 'Saved' : 'Save'}
                </span>
              </button>

              <button
                onClick={handleShare}
                className="flex-1 py-4 flex items-center justify-center gap-2 hover:bg-red-700 transition-colors font-bold text-xs uppercase tracking-wider cursor-pointer"
                title="Share this State"
              >
                <Share2 className="w-5 h-5" />
                <span>{copiedShare ? 'Link Copied!' : 'Share'}</span>
              </button>
            </div>

          </div>

        </div>
      </section>


      {/* ============================================================ */}
      {/* SECTION 3: STATE DESTINATIONS CAROUSEL (TOP CITIES)          */}
      {/* ============================================================ */}
      {stateCities.length > 0 && (
        <section className="relative h-[80vh] sm:h-[85vh] min-h-[560px] w-full bg-black text-white overflow-hidden flex flex-col justify-between">
          
          {/* Background Image of the selected city (Picks popular place image) */}
          {stateCities.map((city, idx) => (
            <div
              key={city.name}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                idx === cityIndex ? 'opacity-100 z-0' : 'opacity-0 -z-10 pointer-events-none'
              }`}
            >
              <img
                src={city.image}
                alt={city.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-80 animate-kenburns"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/50" />
            </div>
          ))}

          {/* Heading at Top */}
          <div className="relative z-10 pt-10 sm:pt-14 text-center space-y-1 px-4 select-none">
            <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight text-white drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)]">
              DESTINATIONS
            </h2>
            <p className="text-base sm:text-xl md:text-2xl font-serif italic text-white/90 drop-shadow-md">
              for every bucket list
            </p>
          </div>

          {/* Center City Controls (← City Name → with Red Button) */}
          <div className="relative z-10 text-center space-y-4 pb-10 sm:pb-14 px-4 mt-auto">
            <div className="flex items-center justify-center gap-6 sm:gap-12">
              <button
                onClick={() => setCityIndex((prev) => (prev - 1 + stateCities.length) % stateCities.length)}
                className="p-2 text-white/80 hover:text-white hover:scale-125 transition-all text-3xl sm:text-4xl font-light cursor-pointer select-none"
                aria-label="Previous City"
              >
                ←
              </button>

              <div className="space-y-1 min-w-[240px] sm:min-w-[320px]">
                <h3 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-lg">
                  {stateCities[cityIndex]?.name}
                </h3>
                <p className="text-xs sm:text-sm md:text-base font-medium text-white/90 drop-shadow-md">
                  {stateCities[cityIndex]?.subtitle}
                </p>
              </div>

              <button
                onClick={() => setCityIndex((prev) => (prev + 1) % stateCities.length)}
                className="p-2 text-white/80 hover:text-white hover:scale-125 transition-all text-3xl sm:text-4xl font-light cursor-pointer select-none"
                aria-label="Next City"
              >
                →
              </button>
            </div>

            <div className="pt-2">
              <Link
                to={`/cities/${stateCities[cityIndex]?.slug || ''}`}
                className="inline-block bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm tracking-widest uppercase px-8 sm:px-10 py-3.5 rounded-full shadow-2xl transition-all duration-300 hover:scale-105"
              >
                Discover more
              </Link>
            </div>
          </div>

        </section>
      )}


      {/* ============================================================ */}
      {/* SECTION 4: STATE ATTRACTIONS ("WORTH A THOUSAND STORIES")    */}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {currentAttractionsView.map((item, idx) => {
              const imgUrl = item.primary_image?.image_url || item.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80';
              const locationLabel = item.city_name || item.city?.name || stateData.name;

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
                      {locationLabel}
                    </span>
                  </div>

                  {/* Bottom Text */}
                  <div className="relative z-10 space-y-2">
                    <h3 className="text-xl font-extrabold text-white group-hover:text-amber-300 transition-colors leading-snug">
                      {item.name}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-normal">
                        {item.description}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Navigation Controls & Discover More (Clean arrows without page count) */}
          <div className="space-y-4 pt-2">
            {totalAttractionPages > 1 && (
              <div className="flex items-center justify-center gap-4">
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

            <div className="pt-2">
              <Link
                to={`/places?state=${slug}`}
                className="inline-block bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider px-10 py-3.5 rounded-full shadow-lg transition-all hover:scale-105"
              >
                Discover more
              </Link>
            </div>
          </div>

        </div>
      </section>


      {/* ============================================================ */}
      {/* SECTION 5: "EXPLORE OTHER STATES" (HOVER SCALE + DISCOVER)   */}
      {/* ============================================================ */}
      <section className="py-20 sm:py-24 px-4 sm:px-8 lg:px-16 bg-white border-b border-slate-200">
        <div className="max-w-[1650px] mx-auto space-y-12 text-center">
          
          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-slate-900 font-sans">
              EXPLORE OTHER STATES
            </h2>
          </div>

          {/* 4 State Cards Grid with Hover Animation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {currentOtherStates.map((st) => (
              <Link
                key={st.slug}
                to={`/states/${st.slug}`}
                className="group relative h-[56vh] min-h-[440px] rounded-3xl overflow-hidden shadow-xl bg-slate-900 flex flex-col justify-end p-6 text-white transition-all duration-500 hover:shadow-2xl hover:scale-105 cursor-pointer"
              >
                {/* State Background Image */}
                <img
                  src={st.image}
                  alt={st.name}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                {/* State Name at Bottom & Hover Discover More Pill Button */}
                <div className="relative z-10 space-y-3 text-center sm:text-left">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white group-hover:text-amber-300 transition-colors drop-shadow-md">
                    {st.name}
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
          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setOtherStatesPage((prev) => (prev - 1 + totalOtherStatesPages) % totalOtherStatesPages)}
              className="w-12 h-12 rounded-full bg-white border border-slate-300 text-slate-700 hover:bg-red-600 hover:text-white hover:border-red-600 flex items-center justify-center transition-all shadow-md cursor-pointer"
              aria-label="Previous States"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setOtherStatesPage((prev) => (prev + 1) % totalOtherStatesPages)}
              className="w-12 h-12 rounded-full bg-white border border-slate-300 text-slate-700 hover:bg-red-600 hover:text-white hover:border-red-600 flex items-center justify-center transition-all shadow-md cursor-pointer"
              aria-label="Next States"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

        </div>
      </section>

    </div>
  );
};

export default StateDetail;
