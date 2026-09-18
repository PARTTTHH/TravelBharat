import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { X, Heart, Trash2, MapPin, ExternalLink, ArrowRight } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';

const FavoritesDrawer = () => {
  const { favorites, isDrawerOpen, setIsDrawerOpen, removeFavorite, clearFavorites } = useFavorites();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsDrawerOpen(false);
      }
    };
    if (isDrawerOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isDrawerOpen, setIsDrawerOpen]);

  if (!isDrawerOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex justify-end font-sans">
      
      {/* Backdrop */}
      <div 
        onClick={() => setIsDrawerOpen(false)}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-300 z-[99999]"
      />

      {/* Slide-over Panel */}
      <div className="relative w-full max-w-md bg-neutral-950 text-white h-full shadow-2xl z-[100000] flex flex-col border-l border-neutral-800 animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-600/20 text-red-500 flex items-center justify-center border border-red-500/30">
              <Heart className="w-5 h-5 fill-red-500 text-red-500" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>Wishlist & Saved</span>
                <span className="bg-red-600 text-white text-xs font-black px-2 py-0.5 rounded-full">
                  {favorites.length}
                </span>
              </h2>
              <p className="text-xs text-neutral-400 font-medium">Your personalized bucket list</p>
            </div>
          </div>

          <button
            onClick={() => setIsDrawerOpen(false)}
            className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-900 transition-colors cursor-pointer"
            aria-label="Close Wishlist"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
          {favorites.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12 text-neutral-400">
              <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-600">
                <Heart className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-xs">
                <h3 className="text-base font-bold text-white">No Saved Destinations Yet</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Click the heart icon on any monument, state, or city to save it to your bucket list.
                </p>
              </div>
              <Link
                to="/places"
                onClick={() => setIsDrawerOpen(false)}
                className="mt-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider px-6 py-3 rounded-full shadow-lg transition-transform hover:scale-105 inline-flex items-center gap-2"
              >
                <span>Explore Destinations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            favorites.map((item) => {
              const targetRoute = item.type === 'city' 
                ? `/cities/${item.slug}` 
                : item.type === 'state' 
                  ? `/states/${item.slug}` 
                  : `/places/${item.slug}`;

              return (
                <div
                  key={item.slug}
                  className="group bg-neutral-900/90 rounded-2xl p-3 border border-neutral-800 hover:border-neutral-700 transition-all flex items-center gap-4 shadow-md"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-neutral-800 relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="bg-red-600/30 text-red-400 text-[10px] font-black uppercase px-2 py-0.5 rounded-md border border-red-500/30">
                        {item.category || item.type || 'Destination'}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                      {item.name}
                    </h4>

                    {item.location && (
                      <p className="text-xs text-neutral-400 flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                        <span className="truncate">{item.location}</span>
                      </p>
                    )}

                    <div className="pt-1 flex items-center gap-3">
                      <Link
                        to={targetRoute}
                        onClick={() => setIsDrawerOpen(false)}
                        className="text-xs font-bold text-amber-400 hover:text-white transition-colors flex items-center gap-1"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFavorite(item.slug)}
                    className="p-2 text-neutral-500 hover:text-red-500 transition-colors shrink-0 rounded-lg hover:bg-neutral-800/80 cursor-pointer"
                    title="Remove from Wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {favorites.length > 0 && (
          <div className="p-6 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between gap-4">
            <button
              onClick={clearFavorites}
              className="text-xs font-bold text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
            >
              Clear Wishlist
            </button>

            <Link
              to="/places"
              onClick={() => setIsDrawerOpen(false)}
              className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider px-6 py-2.5 rounded-full shadow-lg transition-transform hover:scale-105"
            >
              Explore More
            </Link>
          </div>
        )}

      </div>
    </div>,
    document.body
  );
};

export default FavoritesDrawer;
