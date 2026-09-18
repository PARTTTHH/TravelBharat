import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Compass, Heart, ShieldCheck, MapPin, Sparkles, 
  Layers, ArrowRight, CheckCircle2, Send, Bookmark,
  Globe, Trees, Mountain, Landmark, Sun, Camera
} from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';

const Footer = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { favorites, setIsDrawerOpen } = useFavorites();
  const navigate = useNavigate();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-neutral-950 text-neutral-300 pt-16 sm:pt-20 pb-10 border-t border-neutral-800 font-sans relative overflow-hidden">
      
      {/* Background Ambience Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 relative z-10 space-y-12 sm:space-y-16">
        
        {/* Top Section: Brand Statement & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-neutral-800/80 items-center">
          
          {/* Brand Intro */}
          <div className="lg:col-span-6 space-y-4">
            <Link to="/" className="flex items-center gap-1 group shrink-0 inline-block">
              <span className="text-3xl sm:text-4xl font-serif tracking-tight font-extrabold text-white">
                Travel-<span className="italic font-normal text-white">Bharat</span>
                <span className="inline-block w-2 h-2 rounded-full bg-red-600 ml-0.5 mb-3.5"></span>
              </span>
            </Link>

            <p className="text-sm sm:text-base text-neutral-400 leading-relaxed max-w-xl font-medium">
              A comprehensive digital travel encyclopedia of India. Discover state-wise monuments, sacred temples, pristine nature trails, and authentic cultural journeys across Bharat.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-full shadow-sm">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>36 States & UTs Covered</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-red-400 font-bold bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-full shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-red-500" />
                <span>180+ Verified Places</span>
              </div>
            </div>
          </div>

          {/* Newsletter Box */}
          <div className="lg:col-span-6 bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-xl space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Stay Inspired</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Receive Curated Destination Spotlights
              </h3>
              <p className="text-xs text-neutral-400 font-medium">
                Get monthly travel stories, seasonal highlights, and cultural heritage guides directly in your inbox.
              </p>
            </div>

            {subscribed ? (
              <div className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold px-4 py-3 rounded-2xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Thank you for subscribing! Your journey across Bharat begins now.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address..."
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 px-4 py-3 bg-neutral-950 border border-neutral-700/80 rounded-2xl text-xs sm:text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-red-600 transition-colors font-medium"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-red-600/30 transition-all hover:scale-105 shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Subscribe</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Middle Navigation Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-10 pb-12 border-b border-neutral-800/80">
          
          {/* Col 1: Explore Directory */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 border-l-2 border-red-600 pl-2.5">
              <span>Directory</span>
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-medium">
              <li>
                <Link to="/" className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-red-500" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link to="/destinations" className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>Destinations</span>
                </Link>
              </li>
              <li>
                <Link to="/places" className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-red-500" />
                  <span>Tourist Places</span>
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Experiences & Themes</span>
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(true)}
                  className="text-neutral-400 hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  <span>Saved Wishlist ({favorites.length})</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 2: Categories */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 border-l-2 border-amber-500 pl-2.5">
              <span>Experiences</span>
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-medium">
              <li>
                <Link to="/places?category=heritage" className="text-neutral-400 hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-amber-500" />
                  <span>Heritage & Forts</span>
                </Link>
              </li>
              <li>
                <Link to="/places?category=religious" className="text-neutral-400 hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Spiritual & Ghats</span>
                </Link>
              </li>
              <li>
                <Link to="/places?category=nature" className="text-neutral-400 hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <Trees className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Nature & Valleys</span>
                </Link>
              </li>
              <li>
                <Link to="/places?category=adventure" className="text-neutral-400 hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <Mountain className="w-3.5 h-3.5 text-sky-400" />
                  <span>Hill & Adventure</span>
                </Link>
              </li>
              <li>
                <Link to="/places?category=beach" className="text-neutral-400 hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-300" />
                  <span>Beaches & Coasts</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Popular Regions */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 border-l-2 border-red-500 pl-2.5">
              <span>Top States</span>
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-medium">
              <li>
                <Link to="/states/rajasthan" className="text-neutral-400 hover:text-red-400 transition-colors">
                  Rajasthan (Jaipur, Udaipur)
                </Link>
              </li>
              <li>
                <Link to="/states/uttar-pradesh" className="text-neutral-400 hover:text-red-400 transition-colors">
                  Uttar Pradesh (Varanasi, Agra)
                </Link>
              </li>
              <li>
                <Link to="/states/kerala" className="text-neutral-400 hover:text-red-400 transition-colors">
                  Kerala (Munnar, Alleppey)
                </Link>
              </li>
              <li>
                <Link to="/states/ladakh" className="text-neutral-400 hover:text-red-400 transition-colors">
                  Ladakh (Leh, Pangong)
                </Link>
              </li>
              <li>
                <Link to="/states/madhya-pradesh" className="text-neutral-400 hover:text-red-400 transition-colors">
                  Madhya Pradesh (Khajuraho)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Himalayan & Coastal */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 border-l-2 border-emerald-500 pl-2.5">
              <span>Scenic Trails</span>
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-medium">
              <li>
                <Link to="/states/himachal-pradesh" className="text-neutral-400 hover:text-emerald-400 transition-colors">
                  Himachal Pradesh (Manali, Shimla)
                </Link>
              </li>
              <li>
                <Link to="/states/goa" className="text-neutral-400 hover:text-emerald-400 transition-colors">
                  Goa (Panaji, Coastal Forts)
                </Link>
              </li>
              <li>
                <Link to="/states/tamil-nadu" className="text-neutral-400 hover:text-emerald-400 transition-colors">
                  Tamil Nadu (Madurai, Ooty)
                </Link>
              </li>
              <li>
                <Link to="/states/uttarakhand" className="text-neutral-400 hover:text-emerald-400 transition-colors">
                  Uttarakhand (Rishikesh, Nainital)
                </Link>
              </li>
              <li>
                <Link to="/states/maharashtra" className="text-neutral-400 hover:text-emerald-400 transition-colors">
                  Maharashtra (Mumbai, Ajanta)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Travel Guidelines */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 space-y-4">
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 border-l-2 border-amber-400 pl-2.5">
              <span>Travel Tips</span>
            </h4>
            <div className="bg-neutral-900 border border-neutral-800/80 rounded-2xl p-4 space-y-2 text-xs text-neutral-400">
              <p className="font-semibold text-white">Verified Timings & Entry</p>
              <p className="leading-relaxed">
                Check official monument timings and ticket guidelines on each destination detail page before planning your visit.
              </p>
              <Link 
                to="/places" 
                className="inline-flex items-center gap-1 text-red-500 font-bold hover:text-amber-400 transition-colors pt-1"
              >
                <span>Browse Directory</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Tagline */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 font-medium">
          
          <p>© {new Date().getFullYear()} TravelBharat. All rights reserved.</p>

          <div className="text-xs font-serif italic text-neutral-400 flex items-center gap-2">
            <span>Atithi Devo Bhava</span>
            <span className="w-1 h-1 rounded-full bg-neutral-700 inline-block" />
            <span>Discover Bharat</span>
          </div>

          <div className="flex items-center gap-1.5 text-neutral-400">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>for travelers across India - By Parth Pungaonkar</span>
          </div>

        </div>

      </div>
    </footer>
  );
};

export default Footer;
