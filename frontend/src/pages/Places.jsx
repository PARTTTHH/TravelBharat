import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchFilterBar from '../components/SearchFilterBar';
import TouristCard from '../components/TouristCard';
import { fetchPlaces, fetchStates, fetchCategories } from '../services/api';

const Places = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedState, setSelectedState] = useState(searchParams.get('state') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  
  const [places, setPlaces] = useState([]);
  const [states, setStates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFilterData = async () => {
      const [stList, catList] = await Promise.all([
        fetchStates({ page_size: 500 }), 
        fetchCategories()
      ]);
      setStates(stList || []);
      setCategories(catList || []);
    };
    loadFilterData();
  }, []);

  useEffect(() => {
    const loadFilteredPlaces = async () => {
      setLoading(true);
      const params = { page_size: 500 };
      if (searchQuery) params.search = searchQuery;
      if (selectedState) params.state = selectedState;
      if (selectedCategory) params.category = selectedCategory;

      const data = await fetchPlaces(params);
      setPlaces(data || []);
      setLoading(false);
    };

    loadFilteredPlaces();
  }, [searchQuery, selectedState, selectedCategory]);

  const handleReset = () => {
    setSearchQuery('');
    setSelectedState('');
    setSelectedCategory('');
    setSearchParams({});
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">
      
      {/* Header Banner */}
      <section className="bg-black text-white py-14 sm:py-20 px-4 sm:px-8 lg:px-12 text-center border-b border-neutral-800">
        <div className="max-w-4xl mx-auto space-y-3">
          <p className="text-base sm:text-lg font-serif italic text-red-500 font-semibold tracking-wide">
            — Discover Bharat —
          </p>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-white drop-shadow-md">
            DESTINATIONS DIRECTORY
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Discover all 180+ verified heritage monuments, sacred temples, scenic natural wonders, and cultural landmarks across India.
          </p>
        </div>
      </section>

      {/* Main Content Area - Wide Container */}
      <main className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 -mt-8 space-y-10">
        
        {/* Search & Filter Bar */}
        <SearchFilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedState={selectedState}
          setSelectedState={setSelectedState}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          states={states}
          categories={categories}
          onReset={handleReset}
        />

        {/* Results Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm font-bold text-slate-600 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
            <span>
              Showing <strong className="text-slate-900 font-extrabold">{places.length}</strong> {places.length === 1 ? 'Destination' : 'Destinations'}
            </span>
          </div>

          {(searchQuery || selectedState || selectedCategory) && (
            <div className="flex items-center gap-2">
              <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-extrabold border border-red-200">
                Active Filters Applied
              </span>
              <button
                onClick={handleReset}
                className="text-xs font-bold text-slate-500 hover:text-red-600 underline cursor-pointer"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="py-24 text-center text-slate-400 space-y-4">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-bold uppercase tracking-wider text-slate-600">Searching Destinations...</p>
          </div>
        ) : places.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-lg space-y-5 max-w-lg mx-auto">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto text-2xl font-black">
              !
            </div>
            <h3 className="text-2xl font-black text-slate-900">No Destinations Found</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              We couldn't find any destination matching your criteria. Try adjusting your search query or clearing selected filters.
            </p>
            <button
              onClick={handleReset}
              className="px-8 py-3 rounded-full bg-red-600 text-white text-xs font-extrabold uppercase tracking-wider hover:bg-red-700 shadow-md transition-all cursor-pointer hover:scale-105"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {places.map((place) => (
              <TouristCard key={place.id || place.slug} place={place} />
            ))}
          </div>
        )}

      </main>

    </div>
  );
};

export default Places;
