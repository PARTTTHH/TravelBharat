import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, Globe, Heart, Menu, X, ChevronDown, 
  Sparkles, ArrowRight, MapPin, Compass, Layers, 
  ChevronRight, Bookmark
} from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLangMsg, setShowLangMsg] = useState(false);
  const searchRef = useRef(null);
  const langRef = useRef(null);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { favorites, setIsDrawerOpen } = useFavorites();

  const handleSectionClick = (sectionId) => {
    setIsMobileMenuOpen(false);
    if (location.pathname === '/') {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      navigate(`/#${sectionId}`);
    }
  };

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileMenuOpen]);

  // Close search and lang popovers on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
      if (langRef.current && !langRef.current.contains(event.target)) {
        setShowLangMsg(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
        setShowLangMsg(false);
        setIsMobileMenuOpen(false);
      }
    };

    if (isSearchOpen || showLangMsg || isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    if (isSearchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSearchOpen, showLangMsg, isMobileMenuOpen]);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/places?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
    }
  };

  const handleQuickTagClick = (tag) => {
    navigate(`/places?search=${encodeURIComponent(tag)}`);
    setIsSearchOpen(false);
  };

  const popularSearches = ["Taj Mahal", "Jaipur", "Mumbai", "Goa", "Varanasi", "Kerala", "Ladakh"];

  return (
    <header className="sticky top-0 z-[100] bg-black/95 backdrop-blur-md text-white border-b border-neutral-800 font-sans shadow-lg">
      <div className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo - TravelBharat Typography */}
          <Link to="/" className="flex items-center gap-1 group shrink-0">
            <span className="text-2xl sm:text-3xl font-serif tracking-tight font-extrabold text-white">
              Travel-<span className="italic font-normal text-white">Bharat</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-600 ml-0.5 mb-3"></span>
            </span>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 xl:gap-10 text-base xl:text-lg font-medium text-neutral-200">
            
            <Link to="/destinations" className="hover:text-red-500 transition-colors">
              Destinations
            </Link>

            <Link to="/categories" className="hover:text-red-500 transition-colors">
              Experiences
            </Link>

            <Link to="/places" className="hover:text-red-500 transition-colors">
              Plan your trip
            </Link>

            <Link to="/places?featured=true" className="hover:text-red-500 transition-colors">
              Festivals & Events
            </Link>
          </nav>

          {/* Right Header Controls */}
          <div className="flex items-center gap-4 sm:gap-6 text-xs font-semibold text-neutral-200 shrink-0">
            
            {/* Search Floating Popover Container */}
            <div className="relative" ref={searchRef}>
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`p-2 rounded-full transition-all cursor-pointer ${
                  isSearchOpen ? 'bg-red-600 text-white shadow-lg scale-105' : 'hover:text-red-500 hover:bg-neutral-900'
                }`}
                title="Search Destinations"
                aria-label="Search Destinations"
              >
                {isSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
              </button>

              {/* Floating Dropdown Search Window (Zero Layout Shift) */}
              {isSearchOpen && (
                <div className="absolute right-0 top-12 sm:top-14 w-80 sm:w-96 bg-neutral-950/95 backdrop-blur-2xl border border-neutral-700/80 rounded-3xl p-5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 space-y-4">
                  <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search monument, city, state..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 bg-neutral-900 text-white text-xs sm:text-sm rounded-2xl border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 placeholder:text-neutral-500 transition-all font-medium"
                    />
                    <Search className="w-4 h-4 text-neutral-400 absolute left-3.5" />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 text-neutral-400 hover:text-white cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </form>

                  {/* Quick Trending Searches */}
                  <div className="space-y-2 pt-1 border-t border-neutral-800/80">
                    <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-neutral-400">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Trending Destinations:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {popularSearches.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleQuickTagClick(tag)}
                          className="px-2.5 py-1 text-xs font-semibold bg-neutral-900 hover:bg-red-600 text-neutral-300 hover:text-white rounded-lg border border-neutral-800 hover:border-red-600 transition-all cursor-pointer"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Direct Submit Action */}
                  <button
                    type="button"
                    onClick={handleSearchSubmit}
                    className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <span>Search Everywhere</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Language Selector with Interactive Tooltip */}
            <div className="relative" ref={langRef}>
              <button
                type="button"
                onClick={() => setShowLangMsg(prev => !prev)}
                onMouseEnter={() => setShowLangMsg(true)}
                onMouseLeave={() => setShowLangMsg(false)}
                className="hidden sm:flex items-center gap-1 cursor-pointer hover:text-red-500 transition-colors p-1.5 rounded-lg text-xs font-semibold"
                title="Select Language"
                aria-label="Select Language"
              >
                <Globe className="w-4 h-4" />
                <span>EN</span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>

              {/* Language Notice Tooltip */}
              {showLangMsg && (
                <div className="absolute right-0 top-10 w-64 bg-neutral-950 border border-neutral-700/90 text-neutral-200 text-xs p-3.5 rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95 pointer-events-none space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <Globe className="w-3.5 h-3.5 text-red-500" />
                    <span>Language Support</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Currently only <strong className="text-white">English (EN)</strong> is supported. Multilingual translation is coming soon.
                  </p>
                </div>
              )}
            </div>

            {/* Live Favorites Button & Drawer Trigger */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center gap-1.5 p-1.5 rounded-full hover:bg-neutral-900 hover:text-red-500 transition-all cursor-pointer group"
              title="Saved Wishlist"
              aria-label="Saved Wishlist"
            >
              <Heart className={`w-4 h-4 ${favorites.length > 0 ? 'fill-red-500 text-red-500' : 'text-neutral-300 group-hover:text-red-500'}`} />
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                favorites.length > 0 ? 'bg-red-600 text-white shadow-sm' : 'bg-neutral-800 text-neutral-400'
              }`}>
                {favorites.length}
              </span>
            </button>

            {/* Menu Icon Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-9 h-9 flex items-center justify-center border border-neutral-700 rounded-md hover:bg-neutral-900 transition-colors cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
            </button>

          </div>

        </div>
      </div>

      {/* Full Navigation / Sitemap Slide-over Drawer (Desktop & Mobile) via Portal */}
      {typeof document !== 'undefined' && isMobileMenuOpen && createPortal(
        <div className="fixed inset-0 z-[99999] overflow-hidden font-sans">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300 animate-fade-in z-[99999]"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Slide-over Panel */}
          <div className="fixed inset-y-0 right-0 max-w-md w-full h-full bg-neutral-950 border-l border-neutral-800 shadow-2xl p-6 sm:p-8 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300 z-[100000]">
            
            <div className="space-y-6">
              
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-serif font-extrabold text-white">
                    Travel-<span className="italic font-normal">Bharat</span>
                  </span>
                  <span className="bg-red-600/20 border border-red-500/30 text-red-400 text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md">
                    Menu
                  </span>
                </div>

                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-900 transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Search Input inside Drawer */}
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Quick search places, states..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-neutral-700/80 rounded-2xl text-xs sm:text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-red-600 transition-colors"
                />
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </form>

              {/* SECTION A: MAIN DIRECTORY PAGES */}
              <div className="space-y-2">
                <p className="text-[11px] font-black uppercase tracking-wider text-neutral-400">
                  Explore Directories
                </p>
                <div className="grid grid-cols-1 gap-1">
                  <Link
                    to="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 rounded-2xl text-sm font-bold text-neutral-200 hover:text-white hover:bg-neutral-900 transition-colors group"
                  >
                    <span className="flex items-center gap-3">
                      <Compass className="w-4 h-4 text-red-500" />
                      <span>Home</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-neutral-300 group-hover:translate-x-1 transition-all" />
                  </Link>

                  <Link
                    to="/destinations"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 rounded-2xl text-sm font-bold text-neutral-200 hover:text-white hover:bg-neutral-900 transition-colors group"
                  >
                    <span className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-amber-400" />
                      <span>Destinations (36 States & UTs)</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-neutral-300 group-hover:translate-x-1 transition-all" />
                  </Link>

                  <Link
                    to="/places"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 rounded-2xl text-sm font-bold text-neutral-200 hover:text-white hover:bg-neutral-900 transition-colors group"
                  >
                    <span className="flex items-center gap-3">
                      <Layers className="w-4 h-4 text-red-500" />
                      <span>All 180+ Tourist Places</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-neutral-300 group-hover:translate-x-1 transition-all" />
                  </Link>

                  <Link
                    to="/categories"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 rounded-2xl text-sm font-bold text-neutral-200 hover:text-white hover:bg-neutral-900 transition-colors group"
                  >
                    <span className="flex items-center gap-3">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Experiences & Themes</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-neutral-300 group-hover:translate-x-1 transition-all" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsDrawerOpen(true);
                    }}
                    className="flex items-center justify-between p-3 rounded-2xl text-sm font-bold text-amber-300 hover:bg-neutral-900 transition-colors group cursor-pointer text-left w-full"
                  >
                    <span className="flex items-center gap-3">
                      <Heart className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>Saved Wishlist ({favorites.length})</span>
                    </span>
                    <span className="bg-amber-400/20 text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                      View Drawer
                    </span>
                  </button>
                </div>
              </div>

              {/* SECTION B: HOMEPAGE QUICK SECTION SCROLL */}
              <div className="space-y-2 pt-2 border-t border-neutral-800/80">
                <p className="text-[11px] font-black uppercase tracking-wider text-neutral-400 flex items-center justify-between">
                  <span>Homepage Quick Navigation</span>
                  <span className="text-[9px] text-red-400 font-mono">Auto-Scroll</span>
                </p>

                <div className="grid grid-cols-1 gap-1">
                  <button
                    type="button"
                    onClick={() => handleSectionClick('hero')}
                    className="flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer text-left group w-full"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      <span>Top Hero Highlights</span>
                    </span>
                    <span className="text-[10px] text-neutral-500 group-hover:text-neutral-300 font-mono">#hero</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSectionClick('popular-attractions')}
                    className="flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer text-left group w-full"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>Popular Attractions</span>
                    </span>
                    <span className="text-[10px] text-neutral-500 group-hover:text-neutral-300 font-mono">#attractions</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSectionClick('travel-diaries')}
                    className="flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer text-left group w-full"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span>Travel Diaries & Categories</span>
                    </span>
                    <span className="text-[10px] text-neutral-500 group-hover:text-neutral-300 font-mono">#diaries</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSectionClick('lesser-wonders')}
                    className="flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer text-left group w-full"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>Lesser Known Wonders</span>
                    </span>
                    <span className="text-[10px] text-neutral-500 group-hover:text-neutral-300 font-mono">#wonders</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSectionClick('trip-planner')}
                    className="flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer text-left group w-full"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      <span>Get Started & Plan Your Trip</span>
                    </span>
                    <span className="text-[10px] text-neutral-500 group-hover:text-neutral-300 font-mono">#planner</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Bottom Tagline */}
            <div className="pt-6 border-t border-neutral-800 text-center space-y-1">
              <p className="text-xs font-serif italic text-neutral-400">
                Atithi Devo Bhava
              </p>
              <p className="text-[10px] text-neutral-600">
                TravelBharat Tourist Discovery Portal
              </p>
            </div>

          </div>
        </div>,
        document.body
      )}
    </header>
  );
};

export default Navbar;
