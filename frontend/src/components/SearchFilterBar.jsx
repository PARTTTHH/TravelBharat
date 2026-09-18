import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';

const SearchFilterBar = ({
  searchQuery,
  setSearchQuery,
  selectedState,
  setSelectedState,
  selectedCategory,
  setSelectedCategory,
  states = [],
  categories = [],
  onReset
}) => {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-end">
        
        {/* Search Input */}
        <div className="lg:col-span-6 space-y-1.5">
          <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
            Search Destination
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by monument or city (e.g. Taj Mahal, Gateway of India, Jaipur)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 text-sm rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white text-slate-900 placeholder:text-slate-400 font-medium transition-all shadow-inner"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
          </div>
        </div>

        {/* State Dropdown Filter */}
        <div className="lg:col-span-4 space-y-1.5">
          <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
            Filter by State / UT
          </label>
          <div className="relative">
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-4 py-3.5 text-sm rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white text-slate-800 font-bold transition-all shadow-inner cursor-pointer"
            >
              <option value="">All States & Union Territories</option>
              {states.map((st) => (
                <option key={st.slug} value={st.slug}>
                  {st.name} {st.is_ut || st.is_union_territory ? '(UT)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reset Button */}
        <div className="lg:col-span-2">
          <button
            onClick={onReset}
            className="w-full py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider text-slate-700 hover:text-red-600 bg-slate-100 hover:bg-red-50 rounded-2xl border border-slate-200 hover:border-red-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <RotateCcw className="w-4 h-4 text-red-600" />
            <span>Reset Filters</span>
          </button>
        </div>

      </div>

      {/* Category Pills */}
      <div className="pt-4 border-t border-slate-100 flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5 shrink-0 pr-2">
          <Filter className="w-3.5 h-3.5 text-red-600" /> Themes:
        </span>
        
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-4 py-2 text-xs font-extrabold uppercase tracking-wider rounded-full transition-all shrink-0 cursor-pointer ${
            !selectedCategory 
              ? 'bg-red-600 text-white shadow-md scale-105' 
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          All
        </button>

        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => setSelectedCategory(cat.slug)}
            className={`px-4 py-2 text-xs font-extrabold uppercase tracking-wider rounded-full transition-all shrink-0 cursor-pointer ${
              selectedCategory === cat.slug
                ? 'bg-red-600 text-white shadow-md scale-105'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {cat.label || cat.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchFilterBar;
