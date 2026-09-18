import React, { createContext, useContext, useState, useEffect } from 'react';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('travel_bharat_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error reading favorites from localStorage:', e);
      return [];
    }
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('travel_bharat_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.error('Error saving favorites to localStorage:', e);
    }
  }, [favorites]);

  const isFavorite = (identifier) => {
    if (!identifier) return false;
    const strId = String(identifier).toLowerCase().trim();
    return favorites.some(item => 
      (item.slug && item.slug.toLowerCase() === strId) || 
      (item.id && String(item.id).toLowerCase() === strId) ||
      (item.name && item.name.toLowerCase() === strId)
    );
  };

  const toggleFavorite = (item) => {
    if (!item) return;
    const itemSlug = (item.slug || item.id || '').toLowerCase().trim();
    const itemId = item.id || item.slug;

    setFavorites((prev) => {
      const exists = prev.some(f => 
        (f.slug && f.slug.toLowerCase() === itemSlug) || 
        (f.id && String(f.id) === String(itemId))
      );
      if (exists) {
        return prev.filter(f => 
          !(f.slug && f.slug.toLowerCase() === itemSlug) && 
          !(f.id && String(f.id) === String(itemId))
        );
      } else {
        const newFav = {
          id: itemId,
          name: item.name || item.title,
          slug: item.slug || itemSlug,
          type: item.type || 'place', // 'place' | 'city' | 'state'
          image: item.image || item.primary_image?.image_url || item.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80',
          location: item.location || (item.city_name ? `${item.city_name}, ${item.state_name || ''}` : (item.state_name || item.name)),
          category: item.category || item.categories?.[0]?.label || item.categories?.[0]?.name || 'Destination'
        };
        return [newFav, ...prev];
      }
    });
  };

  const removeFavorite = (identifier) => {
    if (!identifier) return;
    const strId = String(identifier).toLowerCase().trim();
    setFavorites(prev => prev.filter(item => 
      !(item.slug && item.slug.toLowerCase() === strId) && 
      !(item.id && String(item.id).toLowerCase() === strId)
    ));
  };

  const clearFavorites = () => {
    setFavorites([]);
  };

  return (
    <FavoritesContext.Provider value={{
      favorites,
      isFavorite,
      toggleFavorite,
      removeFavorite,
      clearFavorites,
      isDrawerOpen,
      setIsDrawerOpen
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export default FavoritesContext;
