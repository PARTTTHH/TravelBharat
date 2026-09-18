import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ArrowRight, MapPin, CheckCircle2, 
  Plane, Train, Bus, Car, Hotel, Package, 
  Compass, ShieldCheck, Play, Pause, ChevronRight,
  AlertTriangle, AlertCircle, Sparkles
} from 'lucide-react';
import { fetchFeaturedPlaces, fetchCategories } from '../services/api';

const Home = () => {
  const navigate = useNavigate();

  // 1. HERO CAROUSEL STATE & CONTROLS
  const heroSlides = [
    {
      name: "Jaipur",
      subtitle: "Royal Hill Forts & The Pink City Heritage",
      image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=2000&q=80",
      link: "/cities/jaipur"
    },
    {
      name: "Varanasi",
      subtitle: "Sacred Ghats, Twilight Aarti & Eternal Spirituality",
      image: "https://images.unsplash.com/photo-1699630923504-9a24dbaab37c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      link: "/cities/varanasi"
    },
    {
      name: "Kerala",
      subtitle: "Tranquil Backwaters, Coconut Groves & Lush Tea Hills",
      image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=2000&q=80",
      link: "/states/kerala"
    },
    {
      name: "Ladakh",
      subtitle: "High Altitude Passes, Monasteries & Azure Lakes",
      image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8d/Road_Padum_Zanskar_Range_Jun24_A7CR_00818.jpg/3840px-Road_Padum_Zanskar_Range_Jun24_A7CR_00818.jpg",
      link: "/states/ladakh"
    },
    {
      name: "Mumbai",
      subtitle: "The Gateway of India, Coastal Promenades & Dreams",
      image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=2000&q=80",
      link: "/cities/mumbai"
    },
    {
      name: "Hampi",
      subtitle: "UNESCO Monolithic Ruins of the Vijayanagara Empire",
      image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/dd/Wide_angle_of_Galigopuram_of_Virupaksha_Temple%2C_Hampi_%2804%29_%28cropped%29.jpg/1920px-Wide_angle_of_Galigopuram_of_Virupaksha_Temple%2C_Hampi_%2804%29_%28cropped%29.jpg",
      link: "/states/karnataka"
    },
    {
      name: "Agra",
      subtitle: "The Eternal Taj Mahal & Monumental Mughal Architecture",
      image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/1920px-Taj_Mahal_%28Edited%29.jpeg",
      link: "/cities/agra"
    },
    {
      name: "Sikkim",
      subtitle: "Sacred Glacial Lakes & Mt. Kanchenjunga Vistas",
      image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5f/Gurudongmar_Lake_Sikkim%2C_India_%28edit%29.jpg/1920px-Gurudongmar_Lake_Sikkim%2C_India_%28edit%29.jpg",
      link: "/states/sikkim"
    },
    {
      name: "Goa",
      subtitle: "Golden Palm Coastlines, Sunsets & Portuguese Quarters",
      image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fc/BeachFun.jpg/1920px-BeachFun.jpg",
      link: "/states/goa"
    },
    {
      name: "Amritsar",
      subtitle: "The Resplendent Golden Temple & Sacred Serenity",
      image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/94/The_Golden_Temple_of_Amrithsar_7.jpg/1920px-The_Golden_Temple_of_Amrithsar_7.jpg",
      link: "/cities/amritsar"
    }
  ];

  const [heroIndex, setHeroIndex] = useState(0);
  const [isHeroPlaying, setIsHeroPlaying] = useState(true);

  useEffect(() => {
    if (!isHeroPlaying) return;
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isHeroPlaying, heroSlides.length]);

  const prevHero = () => {
    setHeroIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const nextHero = () => {
    setHeroIndex((prev) => (prev + 1) % heroSlides.length);
  };

  // 2. LIVE FEATURED ATTRACTIONS
  const [featuredPlaces, setFeaturedPlaces] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [attractionPage, setAttractionPage] = useState(0);
  const itemsPerPage = 4;

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        setLoadingFeatured(true);
        const data = await fetchFeaturedPlaces();
        setFeaturedPlaces(data || []);
      } catch (err) {
        console.error("Failed to load featured places:", err);
      } finally {
        setLoadingFeatured(false);
      }
    };
    loadFeatured();
  }, []);

  const top10Attractions = (featuredPlaces || []).slice(0, 10);
  const totalAttractionPages = Math.ceil(top10Attractions.length / itemsPerPage) || 1;

  const prevAttractionSlide = () => {
    setAttractionPage((prev) => (prev - 1 + totalAttractionPages) % totalAttractionPages);
  };

  const nextAttractionSlide = () => {
    setAttractionPage((prev) => (prev + 1) % totalAttractionPages);
  };

  const currentAttractions = top10Attractions.slice(
    attractionPage * itemsPerPage,
    (attractionPage + 1) * itemsPerPage
  );

  // 3. TRAVEL DIARIES & CATEGORIES THEMES
  const [selectedCategory, setSelectedCategory] = useState("all");

  const travelDiaries = [
    {
      state: "Rajasthan",
      category: "heritage",
      categoryLabel: "Heritage",
      headline: "7 Grand Jaipur Hill Forts & Sunset Palaces",
      description: "Experience the monumental ramparts of Amber and Jaigarh bathed in golden hour glow.",
      image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80",
      link: "/states/rajasthan"
    },
    {
      state: "Sikkim",
      category: "nature",
      categoryLabel: "Nature",
      headline: "Postcards from Sikkim: High Alpine Lakes & Sacred Peaks",
      description: "Discover crystal turquoise glacial waters at Gurudongmar and Tsomgo.",
      image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
      link: "/states/sikkim"
    },
    {
      state: "Tamil Nadu",
      category: "spiritual",
      categoryLabel: "Spiritual",
      headline: "Dravidian Architectural Marvels of Madurai & Shore Temple",
      description: "Soaring gopurams and millennia-old rock-cut sculptures overlooking the Bay of Bengal.",
      image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
      link: "/states/tamil-nadu"
    },
    {
      state: "Telangana",
      category: "culture",
      categoryLabel: "Culture",
      headline: "Historic Charminar, Nizam Pearls & Iconic Heritage Walks",
      description: "Explore four centuries of Indo-Islamic architecture, museums, and royal delicacies.",
      image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80",
      link: "/states/telangana"
    },
    {
      state: "Goa",
      category: "beach",
      categoryLabel: "Beach",
      headline: "Golden Sands, Portuguese Quarters & Coastal Sunsets",
      description: "From historic Latin quarter churches in Panaji to secluded palm-fringed shores.",
      image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
      link: "/states/goa"
    },
    {
      state: "Assam",
      category: "wildlife",
      categoryLabel: "Wildlife",
      headline: "Kaziranga Wilderness: Home to the Great One-Horned Rhino",
      description: "Expansive Brahmaputra wetlands, elephant safaris, and pristine biodiversity.",
      image: "https://images.unsplash.com/photo-1588714477688-cf28a50e94f7?auto=format&fit=crop&w=800&q=80",
      link: "/states/assam"
    }
  ];

  const filteredDiaries = selectedCategory === "all" 
    ? travelDiaries 
    : travelDiaries.filter(d => d.category === selectedCategory);

  // 4. LESSER KNOWN WONDERS
  const lesserWonders = [
    {
      name: "Gandikota Gorge",
      tagline: "The Grand Canyon of India carved by the Pennar River",
      state: "Andhra Pradesh",
      image: "https://upload.wikimedia.org/wikipedia/commons/a/a7/Indian_Grand_Canyon_Sudhakar_Bichali.jpg",
      link: "/places/gandikota-gorge"
    },
    {
      name: "Mawlynnong & Root Bridges",
      tagline: "Asia's cleanest eco-village & living biological root bridges",
      state: "Meghalaya",
      image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/51/Living_root_bridges%2C_Nongriat_village%2C_Meghalaya2.jpg/1920px-Living_root_bridges%2C_Nongriat_village%2C_Meghalaya2.jpg",
      link: "/states/meghalaya"
    },
    {
      name: "Ziro Valley",
      tagline: "Lush pine hills, rice terraces & ancient Apatani tribal heritage",
      state: "Arunachal Pradesh",
      image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1e/A_cross_section_of_luch_green_valley_of_Ziro.jpg/1920px-A_cross_section_of_luch_green_valley_of_Ziro.jpg",
      link: "/places/ziro-valley"
    },
    {
      name: "Dholavira Harappan Citadel",
      tagline: "UNESCO Harappan port civilization in the Great Rann of Kutch",
      state: "Gujarat",
      image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/89/DHOLAVIRA_SITE_%2824%29.jpg/1920px-DHOLAVIRA_SITE_%2824%29.jpg",
      link: "/states/gujarat"
    },
    {
      name: "Panchachuli Peaks (Sarmoli)",
      tagline: "Snow-crowned Himalayan skyline & pioneering mountain homestays",
      state: "Uttarakhand",
      image: "https://upload.wikimedia.org/wikipedia/commons/3/3c/Panchchuli_mountain_%2800307%29.JPG",
      link: "/states/uttarakhand"
    },
    {
      name: "Majuli River Island",
      tagline: "World's largest inhabited freshwater island on the Brahmaputra",
      state: "Assam",
      image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cb/Doriya_River_of_Majuli.jpg/1920px-Doriya_River_of_Majuli.jpg",
      link: "/places/majuli-river-island"
    },
    {
      name: "Loktak Floating Phumdis",
      tagline: "World's only floating circular biomass islands & Keibul Lamjao Park",
      state: "Manipur",
      image: "https://upload.wikimedia.org/wikipedia/commons/e/e9/The_Loktak_Lake.jpg",
      link: "/places/loktak-lake-keibul-lamjao-national-park"
    },
    {
      name: "Lonar Crater Lake",
      tagline: "50,000-year-old hyper-velocity meteorite impact geo-heritage site",
      state: "Maharashtra",
      image: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Lonar_Sarovar_lake_Maharastra.jpg",
      link: "/states/maharashtra"
    },
    {
      name: "Unakoti Rock Sculptures",
      tagline: "Ancient Shaivite monumental rock-cut reliefs deep in the forest",
      state: "Tripura",
      image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f0/Unakoti_3.jpg/1920px-Unakoti_3.jpg",
      link: "/places/unakoti-rock-carvings"
    },
    {
      name: "Dhanushkodi Ghost Town",
      tagline: "The mythical edge of India where the Bay of Bengal meets the Indian Ocean",
      state: "Tamil Nadu",
      image: "https://upload.wikimedia.org/wikipedia/commons/f/ff/Final_Dhanush_002.jpg",
      link: "/states/tamil-nadu"
    }
  ];

  const [wonderIndex, setWonderIndex] = useState(0);
  const [isWonderHovered, setIsWonderHovered] = useState(false);

  useEffect(() => {
    if (isWonderHovered) return;
    const timer = setInterval(() => {
      setWonderIndex((prev) => (prev + 1) % lesserWonders.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isWonderHovered, lesserWonders.length]);

  const prevWonder = () => {
    setWonderIndex((prev) => (prev - 1 + lesserWonders.length) % lesserWonders.length);
  };

  const nextWonder = () => {
    setWonderIndex((prev) => (prev + 1) % lesserWonders.length);
  };

  // 5. TRIP PLANNER & TRANSIT WIDGET
  const [activeTab, setActiveTab] = useState("Flights");
  const [tripType, setTripType] = useState("One Way");
  const [fromCity, setFromCity] = useState("New Delhi (DEL)");
  const [toCity, setToCity] = useState("Jaipur (JAI)");
  const [departDate, setDepartDate] = useState("2026-09-15");
  const [travelers, setTravelers] = useState("1 Traveler, Economy");
  const [fareType, setFareType] = useState("Regular");

  const serviceTabs = [
    { name: "Flights", icon: Plane },
    { name: "Trains", icon: Train },
    { name: "Buses", icon: Bus },
    { name: "Cabs", icon: Car },
    { name: "Accommodations", icon: Hotel },
    { name: "Tour Packages", icon: Package }
  ];

  const handlePlanSearch = (e) => {
    e.preventDefault();
    const destinationQuery = toCity.replace(/\(.*\)/, '').trim();
    navigate(`/places?search=${encodeURIComponent(destinationQuery)}`);
  };

  useEffect(() => {
    if (window.location.hash) {
      const el = document.querySelector(window.location.hash);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    }
  }, []);

  return (
    <div className="w-full bg-slate-50 text-slate-900 overflow-x-hidden font-sans">
      
      {/* SECTION 1: HERO DESTINATIONS CAROUSEL */}
      <section id="hero" className="relative h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] min-h-[580px] w-full bg-black text-white overflow-hidden flex flex-col justify-between">
        
        {/* Background Ken-Burns Carousel with Fade Transition */}
        {heroSlides.map((slide, idx) => (
          <div
            key={slide.name}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === heroIndex ? 'opacity-100 z-0' : 'opacity-0 -z-10 pointer-events-none'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.name}
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover opacity-80 ${
                idx === heroIndex ? 'animate-kenburns' : ''
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/50" />
          </div>
        ))}

        {/* Top Title - Refined Elegant Size */}
        <div className="relative z-10 pt-8 sm:pt-12 text-center space-y-1.5 px-4 select-none">
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight sm:tracking-normal font-sans uppercase drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)] text-white leading-tight">
            DESTINATIONS
          </h1>
          <p className="text-base sm:text-xl md:text-2xl font-serif italic text-white/90 drop-shadow-md">
            for every bucket list
          </p>
        </div>

        {/* Center / Lower Carousel Control (City Name with Arrows & Red Button) */}
        <div className="relative z-10 text-center space-y-4 sm:space-y-6 pb-6 sm:pb-8 px-4 mt-auto">
          <div className="flex items-center justify-center gap-4 sm:gap-12">
            <button
              onClick={prevHero}
              className="p-2 sm:p-3 text-white/80 hover:text-white hover:scale-125 transition-all text-2xl sm:text-4xl font-light cursor-pointer select-none"
              aria-label="Previous Destination"
            >
              ←
            </button>

            <div className="space-y-1 min-w-[240px] sm:min-w-[320px]">
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-[0_8px_20px_rgba(0,0,0,0.9)] animate-in fade-in duration-300">
                {heroSlides[heroIndex].name}
              </h2>
              <p className="text-xs sm:text-sm md:text-base font-medium text-white/90 drop-shadow-md">
                {heroSlides[heroIndex].subtitle}
              </p>
            </div>

            <button
              onClick={nextHero}
              className="relative z-20 p-2 sm:p-3 text-white/80 hover:text-white hover:scale-125 transition-all text-2xl sm:text-4xl font-light cursor-pointer select-none"
              aria-label="Next Destination"
            >
              →
            </button>
          </div>

          {/* Red Pill Discover More Button */}
          <div className="pt-1 relative z-20">
            <Link
              to={heroSlides[heroIndex].link}
              className="relative z-20 inline-block bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm tracking-widest uppercase px-8 sm:px-10 py-3 sm:py-3.5 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer pointer-events-auto"
            >
              Discover more
            </Link>
          </div>
        </div>

        {/* Bottom Slide Indicators & Pause Toggle */}
        <div className="relative z-20 pb-4 sm:pb-6 flex items-center justify-center gap-3">
          <button
            onClick={() => setIsHeroPlaying(!isHeroPlaying)}
            className="p-1 rounded-full bg-white/15 hover:bg-white/30 text-white/80 hover:text-white transition-colors cursor-pointer relative z-20"
            title={isHeroPlaying ? "Pause slideshow" : "Play slideshow"}
          >
            {isHeroPlaying ? <Pause className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
          </button>

          <div className="flex justify-center gap-2 relative z-20">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setHeroIndex(idx)}
                className={`h-1.5 sm:h-2 rounded-full transition-all cursor-pointer relative z-20 ${
                  idx === heroIndex ? 'w-8 sm:w-10 bg-red-600 shadow-md' : 'w-2 sm:w-2.5 bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

      </section>


      {/* SECTION 2: LIVE FEATURED ATTRACTIONS  */}
      <section id="popular-attractions" className="min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)] py-10 sm:py-14 px-4 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden border-b border-slate-200 flex flex-col justify-center">
        <div className="max-w-screen-2xl mx-auto w-full space-y-6 sm:space-y-8">
          
          {/* Section Header with Controls */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 text-center md:text-left">
            <div className="space-y-1">
              <h2 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 uppercase font-sans">
                ATTRACTIONS
              </h2>
              <p className="text-sm sm:text-base font-serif italic text-red-600">
                — worth a thousand stories & lifetime memories —
              </p>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-center md:justify-end gap-3">
              <button 
                onClick={prevAttractionSlide}
                className="w-11 h-11 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-red-600 hover:text-white hover:border-red-600 flex items-center justify-center transition-all shadow-sm cursor-pointer"
                aria-label="Previous Attractions"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-bold text-slate-500 px-2">
                {attractionPage + 1} / {totalAttractionPages || 1}
              </span>
              <button 
                onClick={nextAttractionSlide}
                className="w-11 h-11 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-red-600 hover:text-white hover:border-red-600 flex items-center justify-center transition-all shadow-sm cursor-pointer"
                aria-label="Next Attractions"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Dynamic Attractions Grid / Skeletons — 5 big cards per slide */}
          {loadingFeatured ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-[60vh] min-h-[420px] rounded-2xl shimmer-loading border border-slate-200" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
              {currentAttractions.map((place) => {
                const imgUrl = 
                  place?.primary_image?.image_url || 
                  place?.images?.[0]?.image_url || 
                  'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80';
                
                const catLabel = place?.categories?.[0]?.label || place?.categories?.[0]?.name || 'Destination';
                const stateName = place?.state_name || place?.state?.name || 'India';
                const cityName = place?.city_name || place?.city?.name || '';
                const locationLabel = cityName ? `${cityName}, ${stateName}` : stateName;

                return (
                  <Link
                    key={place.id || place.slug}
                    to={`/places/${place.slug}`}
                    className="group relative h-[60vh] min-h-[420px] rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between p-5 sm:p-6 text-white bg-slate-900 cursor-pointer"
                  >
                    <img
                      src={imgUrl}
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
                      <span className="bg-white/90 backdrop-blur-md text-slate-900 text-[11px] font-extrabold uppercase px-3 py-1 rounded-full shadow-sm">
                        {catLabel}
                      </span>
                      {place.is_verified && (
                        <span className="bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-sm">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Verified</span>
                        </span>
                      )}
                    </div>

                    {/* Bottom Metadata & Link */}
                    <div className="relative z-10 space-y-2">
                      <p className="text-xs text-amber-300 flex items-center gap-1 font-semibold drop-shadow-sm">
                        <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span className="truncate">{locationLabel}</span>
                      </p>

                      <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                        {place.name}
                      </h3>

                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed hidden sm:block">
                        {place.description}
                      </p>

                      <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">
                          {place.best_time_to_visit || "Year-round"}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-400 group-hover:text-white transition-colors">
                          <span>Explore</span>
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Bottom Explore Button */}
          <div className="text-center pt-2 relative z-20">
            <Link
              to="/places"
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm tracking-wider uppercase px-10 py-4 rounded-full shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer relative z-20"
            >
              Discover All 180+ Places →
            </Link>
          </div>

        </div>
      </section>


      {/* SECTION 3: TRAVEL DIARIES & THEMATIC EXPERIENCES */}
      <section id="travel-diaries" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#DFAB3D] text-white relative border-b border-amber-600">
        <div className="max-w-7xl mx-auto space-y-12 text-center relative z-20">
          
          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight uppercase font-sans text-white drop-shadow-md">
              TRAVEL DIARIES
            </h2>
            <p className="text-base sm:text-lg font-serif italic text-slate-900/90 font-medium">
              — handcrafted journeys for every passion & curiosity —
            </p>
          </div>

          {/* Interactive Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto relative z-20">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer relative z-20 ${
                selectedCategory === "all"
                  ? 'bg-slate-950 text-amber-400 shadow-lg scale-105'
                  : 'bg-white/20 text-slate-950 hover:bg-white/40'
              }`}
            >
              All Themes
            </button>
            {["heritage", "spiritual", "nature", "adventure", "beach", "wildlife", "culture"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold capitalize transition-all cursor-pointer relative z-20 ${
                  selectedCategory === cat
                    ? 'bg-slate-950 text-amber-400 shadow-lg scale-105'
                    : 'bg-white/20 text-slate-950 hover:bg-white/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Stories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left relative z-20">
            {filteredDiaries.map((diary, idx) => (
              <Link
                key={idx}
                to={diary.link}
                className="bg-slate-950 rounded-2xl overflow-hidden shadow-xl border border-black/30 flex flex-col justify-between group hover:-translate-y-1.5 transition-all duration-300 relative z-20 cursor-pointer"
              >
                <div className="h-52 overflow-hidden relative">
                  <img
                    src={diary.image}
                    alt={diary.headline}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                    {diary.categoryLabel}
                  </div>
                </div>

                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      {diary.state}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white leading-snug group-hover:text-amber-300 transition-colors">
                      {diary.headline}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {diary.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-red-500 group-hover:text-amber-400 transition-colors">
                    <span>Read Exploration Guide</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="pt-4 relative z-20">
            <Link
              to="/categories"
              className="inline-block bg-slate-950 hover:bg-black text-amber-400 font-extrabold text-xs tracking-wider uppercase px-8 py-3.5 rounded-full shadow-lg transition-all duration-300 hover:scale-105 border border-amber-400/30 cursor-pointer relative z-20"
            >
              Explore All 7 Experience Categories →
            </Link>
          </div>

        </div>
      </section>

      {/* SECTION 4: UNCOVER INDIA'S LESSER KNOWN WONDERS */}
      <section id="lesser-wonders" className="min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)] py-10 sm:py-14 px-2 sm:px-4 lg:px-8 bg-slate-100 relative overflow-hidden border-b border-slate-200 flex flex-col justify-center">
        <div className="max-w-[1700px] mx-auto w-full space-y-6 sm:space-y-10 text-center">
          
          {/* Header */}
          <div className="space-y-2">
            <p className="text-base sm:text-xl font-serif italic text-slate-500">
              — Off-The-Beaten-Path Treasures —
            </p>
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 uppercase font-sans">
              LESSER KNOWN WONDERS
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto font-medium">
              Step away from the mainstream and discover India's hidden valleys, living root bridges, and secret canyons.
            </p>
          </div>

          {/* 3D Spotlight Card Carousel (Ultra-Wide, Seamless Smooth Transitions, Crisp Rounded Corners & Shadows) */}
          <div 
            className="relative w-full max-w-[1600px] mx-auto h-[480px] sm:h-[540px] lg:h-[600px] xl:h-[640px] flex items-center justify-center select-none overflow-visible py-4"
            onMouseEnter={() => setIsWonderHovered(true)}
            onMouseLeave={() => setIsWonderHovered(false)}
          >
            {lesserWonders.map((item, idx) => {
              const N = lesserWonders.length;
              let diff = (idx - wonderIndex + N) % N;
              if (diff > N / 2) {
                diff -= N;
              }

              const isCenter = diff === 0;
              const isPrev = diff === -1;
              const isNext = diff === 1;

              // Helper for continuous translation & smooth exit/entry
              let transformStyle = {};
              if (isCenter) {
                transformStyle = {
                  transform: 'translate(-50%, -50%) scale(1)',
                  opacity: 1,
                  zIndex: 30,
                  pointerEvents: 'auto',
                };
              } else if (isPrev) {
                transformStyle = {
                  transform: 'translate(calc(-50% - clamp(230px, 30vw, 440px)), -50%) scale(0.88)',
                  opacity: 0.75,
                  zIndex: 10,
                  pointerEvents: 'auto',
                  filter: 'brightness(0.9)',
                };
              } else if (isNext) {
                transformStyle = {
                  transform: 'translate(calc(-50% + clamp(230px, 30vw, 440px)), -50%) scale(0.88)',
                  opacity: 0.75,
                  zIndex: 10,
                  pointerEvents: 'auto',
                  filter: 'brightness(0.9)',
                };
              } else if (diff < 0) {
                transformStyle = {
                  transform: 'translate(calc(-50% - clamp(480px, 60vw, 880px)), -50%) scale(0.75)',
                  opacity: 0,
                  zIndex: 0,
                  pointerEvents: 'none',
                  filter: 'brightness(0.5)',
                };
              } else {
                transformStyle = {
                  transform: 'translate(calc(-50% + clamp(480px, 60vw, 880px)), -50%) scale(0.75)',
                  opacity: 0,
                  zIndex: 0,
                  pointerEvents: 'none',
                  filter: 'brightness(0.5)',
                };
              }

              return (
                <div
                  key={item.name}
                  onClick={() => {
                    if (isPrev) prevWonder();
                    if (isNext) nextWonder();
                  }}
                  style={transformStyle}
                  className={`absolute top-1/2 left-1/2 transition-all duration-700 ease-out rounded-3xl overflow-hidden shadow-2xl cursor-pointer w-[90%] sm:w-[75%] lg:w-[62%] xl:w-[56%] max-w-4xl h-[430px] sm:h-[490px] lg:h-[550px] xl:h-[580px] ${
                    isCenter
                      ? 'ring-4 ring-amber-400/90 shadow-[0_20px_50px_rgba(0,0,0,0.35)]'
                      : 'hover:opacity-95'
                  }`}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80';
                    }}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent" />

                  {/* Card Content - Center Card (Full Details & Button) */}
                  {isCenter && (
                    <div className="absolute bottom-6 sm:bottom-8 left-6 sm:left-8 right-6 sm:right-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 text-white">
                      <div className="space-y-2 text-left max-w-xl">
                        <div className="flex items-center gap-2">
                          <span className="bg-red-600 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm">
                            {item.state}
                          </span>
                        </div>
                        <h3 className="font-black text-amber-400 drop-shadow-md text-2xl sm:text-4xl lg:text-5xl leading-tight">
                          {item.name}
                        </h3>
                        <p className="text-xs sm:text-sm lg:text-base text-slate-100 font-medium line-clamp-2 drop-shadow-sm">
                          {item.tagline}
                        </p>
                      </div>

                      <Link
                        to={item.link}
                        onClick={(e) => e.stopPropagation()}
                        className="relative z-30 bg-white hover:bg-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-full shadow-lg transition-all hover:scale-105 shrink-0 cursor-pointer pointer-events-auto"
                      >
                        Explore Wonder →
                      </Link>
                    </div>
                  )}

                  {/* Card Content - Left Side Card (Visible Outer Left Area) */}
                  {isPrev && (
                    <div className="absolute bottom-6 sm:bottom-8 left-6 sm:left-8 text-left max-w-[180px] sm:max-w-[240px] space-y-1.5 pointer-events-none">
                      <span className="bg-black/60 backdrop-blur-md text-white/90 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/20 inline-block">
                        {item.state}
                      </span>
                      <h4 className="font-extrabold text-amber-300 text-base sm:text-xl drop-shadow-md line-clamp-2 leading-tight">
                        {item.name}
                      </h4>
                    </div>
                  )}

                  {/* Card Content - Right Side Card (Visible Outer Right Area) */}
                  {isNext && (
                    <div className="absolute bottom-6 sm:bottom-8 right-6 sm:right-8 text-right max-w-[180px] sm:max-w-[240px] space-y-1.5 pointer-events-none ml-auto">
                      <span className="bg-black/60 backdrop-blur-md text-white/90 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/20 inline-block">
                        {item.state}
                      </span>
                      <h4 className="font-extrabold text-amber-300 text-base sm:text-xl drop-shadow-md line-clamp-2 leading-tight">
                        {item.name}
                      </h4>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="relative z-40 flex items-center justify-center gap-6 text-slate-700 pt-2 pointer-events-auto">
            <button 
              onClick={prevWonder} 
              className="w-12 h-12 rounded-full bg-white border border-slate-300 text-slate-700 hover:bg-red-600 hover:text-white hover:border-red-600 flex items-center justify-center transition-all shadow-md cursor-pointer relative z-50"
              aria-label="Previous Wonder"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <button 
              onClick={nextWonder} 
              className="w-12 h-12 rounded-full bg-white border border-slate-300 text-slate-700 hover:bg-red-600 hover:text-white hover:border-red-600 flex items-center justify-center transition-all shadow-md cursor-pointer relative z-50"
              aria-label="Next Wonder"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

        </div>
      </section>


      {/* SECTION 5: INSPIRED? GET STARTED (TRIP PLANNER WIDGET)       */}
      <section id="trip-planner" className="min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)] py-12 sm:py-16 px-4 sm:px-8 lg:px-12 bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white relative overflow-hidden flex flex-col justify-center border-b border-slate-900">
        
        {/* Subtle Background Glow Elements */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none z-0" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none z-0" />

        <div className="max-w-[1550px] mx-auto w-full space-y-8 sm:space-y-10 text-center relative z-20">
          
          {/* Header */}
          <div className="space-y-2 select-none">
            <p className="text-xl sm:text-2xl font-serif italic text-amber-400 font-medium drop-shadow-md">
              — Ready to Embark? —
            </p>
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-white drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)] font-sans">
              GET STARTED & PLAN YOUR TRIP
            </h2>
            <p className="text-sm sm:text-lg text-slate-300 max-w-3xl mx-auto font-medium leading-relaxed">
              Find transit connections, discover regional heritage routes, and map your dream itinerary across Bharat.
            </p>
          </div>

          {/* Service Tabs */}
          <div className="relative z-20 flex flex-wrap items-center justify-center gap-2.5 max-w-4xl mx-auto">
            {serviceTabs.map((tab) => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.name;
              return (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold tracking-wider uppercase transition-all flex items-center gap-2 border cursor-pointer relative z-20 ${
                    isActive
                      ? 'bg-red-600 border-red-500 text-white shadow-xl shadow-red-600/30 scale-105'
                      : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>

          {/* Search Form Widget */}
          <form 
            onSubmit={handlePlanSearch}
            className="relative z-20 bg-slate-900/95 backdrop-blur-xl p-6 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl max-w-5xl mx-auto space-y-6 text-left"
          >
            {/* Trip Type Selector */}
            <div className="flex items-center gap-8 text-xs sm:text-sm font-bold text-slate-300">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="radio"
                  name="tripType"
                  checked={tripType === "One Way"}
                  onChange={() => setTripType("One Way")}
                  className="accent-red-600 cursor-pointer w-4 h-4"
                />
                <span className={tripType === "One Way" ? "text-amber-400 font-extrabold" : ""}>One Way Journey</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="radio"
                  name="tripType"
                  checked={tripType === "Round Trip"}
                  onChange={() => setTripType("Round Trip")}
                  className="accent-red-600 cursor-pointer w-4 h-4"
                />
                <span className={tripType === "Round Trip" ? "text-amber-400 font-extrabold" : ""}>Round Trip Itinerary</span>
              </label>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-3.5 text-slate-900 shadow-inner">
                <span className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">From</span>
                <input 
                  type="text" 
                  value={fromCity} 
                  onChange={(e) => setFromCity(e.target.value)}
                  placeholder="Departure city"
                  className="w-full text-sm font-bold bg-transparent outline-none text-slate-900 placeholder:text-slate-400" 
                />
              </div>

              <div className="bg-white rounded-2xl p-3.5 text-slate-900 shadow-inner">
                <span className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">To (Destination)</span>
                <input 
                  type="text" 
                  value={toCity} 
                  onChange={(e) => setToCity(e.target.value)}
                  placeholder="Destination place"
                  className="w-full text-sm font-bold bg-transparent outline-none text-slate-900 placeholder:text-slate-400" 
                />
              </div>

              <div className="bg-white rounded-2xl p-3.5 text-slate-900 shadow-inner">
                <span className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Depart Date</span>
                <input 
                  type="date" 
                  value={departDate} 
                  onChange={(e) => setDepartDate(e.target.value)}
                  className="w-full text-sm font-bold bg-transparent outline-none text-slate-900 cursor-pointer" 
                />
              </div>

              <div className="bg-white rounded-2xl p-3.5 text-slate-900 shadow-inner">
                <span className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Travelers & Class</span>
                <select 
                  value={travelers}
                  onChange={(e) => setTravelers(e.target.value)}
                  className="w-full text-sm font-bold bg-transparent outline-none text-slate-900 cursor-pointer"
                >
                  <option>1 Traveler, Economy</option>
                  <option>2 Travelers, Economy</option>
                  <option>Family (3-4), Standard</option>
                  <option>Premium / Luxury</option>
                </select>
              </div>
            </div>

            {/* Fare Selection & CTA */}
            <div className="pt-4 border-t border-slate-800 flex flex-col lg:flex-row items-center justify-between text-xs sm:text-sm text-slate-300 gap-4">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Fare Category:</span>
                {["Regular", "Armed Forces", "Student", "Senior Citizen"].map((fare) => (
                  <label key={fare} className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input 
                      type="radio" 
                      name="fareType" 
                      checked={fareType === fare}
                      onChange={() => setFareType(fare)}
                      className="accent-red-600 cursor-pointer" 
                    />
                    <span className={fareType === fare ? "text-amber-400 font-bold" : ""}>{fare}</span>
                  </label>
                ))}
              </div>

              <button
                type="submit"
                className="relative z-30 w-full lg:w-auto px-10 py-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-xl shadow-red-600/30 transition-all hover:scale-105 cursor-pointer pointer-events-auto"
              >
                Search Destinations →
              </button>
            </div>

          </form>

          {/* Prominent Red/Orange Disclaimer Notice */}
          <div className="relative z-20 max-w-4xl mx-auto bg-gradient-to-r from-red-950/80 via-orange-950/70 to-amber-950/80 border border-red-500/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl text-left backdrop-blur-md">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 text-amber-400 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-amber-400" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-300">
                  Notice: Trip Planning & Live Booking Feature Under Development
                </h4>
                <p className="text-xs text-orange-200/90 font-medium leading-relaxed">
                  Live transit ticket booking and real-time flight / train reservations are currently not available at this moment. You can browse and plan across all verified tourist destinations in India.
                </p>
              </div>
            </div>
            <Link
              to="/places"
              className="relative z-30 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shrink-0 transition-all hover:scale-105 cursor-pointer pointer-events-auto"
            >
              Browse Places
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 pt-2">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Destination Details</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Official Timings & Entry Fees</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>36 Indian States & UTs Covered</span>
            </span>
          </div>

        </div>
      </section>

    </div>
  );
};

export default Home;
