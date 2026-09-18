import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Landmark, Flame, Trees, Compass, 
  Waves, Mountain, Palette, ArrowRight 
} from 'lucide-react';

const Categories = () => {
  const categoriesList = [
    {
      title: "Heritage & Forts",
      slug: "heritage",
      icon: Landmark,
      image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80",
      description: "Explore India's majestic royal palaces, formidable hill fortresses, ancient stepwells, and UNESCO World Heritage marvels.",
      highlights: ["Taj Mahal, Agra", "Amber Fort, Jaipur", "Hampi Ruins, Karnataka", "Ajanta & Ellora Caves"]
    },
    {
      title: "Spiritual & Sacred",
      slug: "spiritual",
      icon: Flame,
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOtvkVq-ccdrvJqXUCDVluKpqwOyCwK2tpKfBE6jX_a7kil55zzSy8sS_k&s=10",
      description: "Immerse in holy riverbanks, twilight Ganga Aarti ceremonies, ancient jyotirlingas, and peaceful sacred shrines.",
      highlights: ["Varanasi Ghats, UP", "Golden Temple, Amritsar", "Kashi Vishwanath", "Rishikesh Yoga Ashrams"]
    },
    {
      title: "Nature & Mist Hills",
      slug: "nature",
      icon: Trees,
      image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80",
      description: "Discover emerald tea plantations, serene backwaters, mist-draped hill stations, and crystal turquoise glacial lakes.",
      highlights: ["Munnar Tea Gardens", "Alleppey Backwaters", "Valley of Flowers", "Ziro Pine Valley"]
    },
    {
      title: "Wildlife & Safaris",
      slug: "wildlife",
      icon: Compass,
      image: "https://images.unsplash.com/photo-1588714477688-cf28a50e94f7?auto=format&fit=crop&w=1200&q=80",
      description: "Encounter the majestic Royal Bengal Tiger, Great One-Horned Rhinoceros, Asiatic Lions, and rare bird species.",
      highlights: ["Kaziranga National Park", "Jim Corbett Reserve", "Gir Lion Sanctuary", "Ranthambore Tiger Safari"]
    },
    {
      title: "Beaches & Coastlines",
      slug: "beach",
      icon: Waves,
      image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
      description: "Unwind on golden palm-fringed shores, pristine coral lagoons, historic lighthouses, and Arabian Sea promenades.",
      highlights: ["Palolem Beach, Goa", "Agatti Lagoon, Lakshadweep", "Radhanagar Beach, Havelock", "Marina Beach, Chennai"]
    },
    {
      title: "Thrill & Adventure",
      slug: "adventure",
      icon: Mountain,
      image: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80",
      description: "Challenge high altitude Himalayan passes, white water river rapids, desert camel treks, and mountain trails.",
      highlights: ["Pangong Tso, Ladakh", "Rishikesh White Water Rafting", "Rohtang Pass", "Spiti Trans-Himalayan Valley"]
    },
    {
      title: "Culture & Living Traditions",
      slug: "culture",
      icon: Palette,
      image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=1200&q=80",
      description: "Celebrate four centuries of royal Nizami architecture, classical arts, colorful folk festivals, and artisan handicraft bazaars.",
      highlights: ["Charminar, Hyderabad", "Mysore Royal Palace", "Shillong Music & Living Roots", "Fort Kochi Latin Quarters"]
    }
  ];

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">
      
      {/* Header Banner */}
      <section className="bg-black text-white py-14 sm:py-20 px-4 sm:px-8 lg:px-12 text-center border-b border-neutral-800">
        <div className="max-w-4xl mx-auto space-y-3">
          <p className="text-base sm:text-lg font-serif italic text-red-500 font-semibold tracking-wide">
            — Handcrafted Travel Themes —
          </p>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-white drop-shadow-md">
            EXPERIENCES & THEMES
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Discover destinations across India tailored for every passion, whether you seek royal architecture, sacred spirituality, misty mountains, or thrilling wilderness.
          </p>
        </div>
      </section>

      {/* Main Grid Container - Widescreen */}
      <main className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 sm:gap-8">
          {categoriesList.map((cat) => {
            const IconComponent = cat.icon;

            return (
              <Link
                key={cat.slug}
                to={`/places?category=${cat.slug}`}
                className="group relative h-[520px] sm:h-[540px] rounded-3xl overflow-hidden shadow-xl bg-slate-950 flex flex-col justify-between p-7 text-white transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 cursor-pointer border border-slate-200/20"
              >
                {/* Background Image with Ken-Burns Hover Zoom */}
                <img
                  src={cat.image}
                  alt={cat.title}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/30" />

                {/* Top Badge with Icon */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-red-600/95 backdrop-blur-md flex items-center justify-center text-white shadow-lg border border-red-400/30">
                    <IconComponent className="w-6 h-6" />
                  </div>

                  <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-widest px-3.5 py-1 rounded-full border border-white/20 shadow-sm">
                    Experience Theme
                  </span>
                </div>

                {/* Bottom Content Info */}
                <div className="relative z-10 space-y-4">
                  <div className="space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-black text-white group-hover:text-amber-300 transition-colors leading-tight drop-shadow-md">
                      {cat.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed font-normal">
                      {cat.description}
                    </p>
                  </div>

                  {/* Highlights Pill Badges */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider block">
                      Iconic Destinations:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.highlights.map((item, idx) => (
                        <span 
                          key={idx} 
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-white/15 backdrop-blur-md font-semibold text-white border border-white/10"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="pt-3 border-t border-white/15 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">
                      View Collection
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-red-600 group-hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider px-5 py-2 rounded-full shadow-lg group-hover:scale-105 transition-all">
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>

                </div>
              </Link>
            );
          })}
        </div>
      </main>

    </div>
  );
};

export default Categories;
