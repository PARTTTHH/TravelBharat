import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, LogOut, Plus, Search, Filter, CheckCircle2, 
  XCircle, ExternalLink, Trash2, Check, RefreshCw, MapPin, 
  Sparkles, Layers, Building2, Globe2, Eye, AlertTriangle, X
} from 'lucide-react';
import { 
  fetchAdminStats, fetchAdminPlaces, togglePlaceVerify, 
  createAdminPlace, deleteAdminPlace, fetchStates, fetchCities, fetchCategories 
} from '../../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Authentication & User state
  const [currentUser, setCurrentUser] = useState(null);

  // Core Data
  const [stats, setStats] = useState({
    total_places: 0,
    verified_places: 0,
    unverified_places: 0,
    featured_places: 0,
    total_states: 36,
    total_cities: 40,
    total_categories: 7
  });
  const [places, setPlaces] = useState([]);
  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  // Filter & Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'verified' | 'unverified' | 'featured'
  const [stateFilter, setStateFilter] = useState('all');

  // Add Place Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    state_id: '',
    city_id: '',
    category_ids: [],
    description: '',
    historical_significance: '',
    best_time_to_visit: '',
    entry_fee: '',
    timings: '',
    location_map_url: '',
    image_url: '',
    is_featured: false,
    is_verified: true,
  });

  // Success Notification Toast
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    // Auth Check
    const token = localStorage.getItem('tb_admin_token');
    const userStr = localStorage.getItem('tb_admin_user');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {}
    }

    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, placesData, statesData, citiesData, categoriesData] = await Promise.all([
        fetchAdminStats(),
        fetchAdminPlaces(),
        fetchStates(),
        fetchCities(),
        fetchCategories()
      ]);

      if (statsData) setStats(statsData);
      if (Array.isArray(placesData)) setPlaces(placesData);
      if (Array.isArray(statesData)) setStatesList(statesData);
      if (Array.isArray(citiesData)) setCitiesList(citiesData);
      if (Array.isArray(categoriesData)) setCategoriesList(categoriesData);
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('tb_admin_token');
    localStorage.removeItem('tb_admin_user');
    navigate('/admin/login');
  };

  // Toggle Verification Action
  const handleToggleVerify = async (place) => {
    const slug = place.slug;
    setActionLoading(prev => ({ ...prev, [slug]: true }));

    try {
      const res = await togglePlaceVerify(slug);
      const newStatus = res.is_verified;

      // Update place in local state
      setPlaces(prev => prev.map(p => {
        if (p.slug === slug || p.id === place.id) {
          return { ...p, is_verified: newStatus };
        }
        return p;
      }));

      // Update stats counters
      setStats(prev => ({
        ...prev,
        verified_places: newStatus ? prev.verified_places + 1 : prev.verified_places - 1,
        unverified_places: newStatus ? prev.unverified_places - 1 : prev.unverified_places + 1
      }));

      showToast(`"${place.name}" is now ${newStatus ? 'Verified (Visible Live)' : 'Unverified (Hidden)'}`);
    } catch (err) {
      alert(`Could not toggle verification: ${err.message || 'Server error'}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [slug]: false }));
    }
  };

  // Delete Place Action
  const handleDeletePlace = async (place) => {
    if (!window.confirm(`Are you sure you want to delete "${place.name}"? This action cannot be undone.`)) {
      return;
    }

    const slug = place.slug;
    setActionLoading(prev => ({ ...prev, [slug]: true }));

    try {
      await deleteAdminPlace(slug);
      setPlaces(prev => prev.filter(p => p.slug !== slug && p.id !== place.id));
      setStats(prev => ({
        ...prev,
        total_places: prev.total_places - 1,
        verified_places: place.is_verified ? prev.verified_places - 1 : prev.verified_places,
        unverified_places: !place.is_verified ? prev.unverified_places - 1 : prev.unverified_places
      }));
      showToast(`Deleted destination "${place.name}".`);
    } catch (err) {
      alert(`Delete failed: ${err.message || 'Server error'}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [slug]: false }));
    }
  };

  // Add Place Form Submit
  const handleCreatePlaceSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.state_id) {
      setModalError("Place Name and State are required fields.");
      return;
    }

    setIsSubmitting(true);
    setModalError(null);

    try {
      const payload = {
        ...formData,
        state_id: parseInt(formData.state_id),
        city_id: formData.city_id ? parseInt(formData.city_id) : null,
      };

      const newPlace = await createAdminPlace(payload);
      
      // Prepend newly created place
      setPlaces(prev => [newPlace, ...prev]);
      setStats(prev => ({
        ...prev,
        total_places: prev.total_places + 1,
        verified_places: newPlace.is_verified ? prev.verified_places + 1 : prev.verified_places,
        unverified_places: !newPlace.is_verified ? prev.unverified_places + 1 : prev.unverified_places,
        featured_places: newPlace.is_featured ? prev.featured_places + 1 : prev.featured_places
      }));

      setIsAddModalOpen(false);
      showToast(`Successfully added destination "${newPlace.name}"!`);
      // Reset form
      setFormData({
        name: '',
        state_id: '',
        city_id: '',
        category_ids: [],
        description: '',
        historical_significance: '',
        best_time_to_visit: '',
        entry_fee: '',
        timings: '',
        location_map_url: '',
        image_url: '',
        is_featured: false,
        is_verified: true,
      });
    } catch (err) {
      setModalError(err.response?.data ? JSON.stringify(err.response.data) : err.message || "Failed to create destination.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter places
  const filteredPlaces = places.filter(p => {
    // Search query filter
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const matchName = (p.name || '').toLowerCase().includes(q);
      const matchState = (p.state_name || p.state?.name || '').toLowerCase().includes(q);
      const matchCity = (p.city_name || p.city?.name || '').toLowerCase().includes(q);
      if (!matchName && !matchState && !matchCity) return false;
    }

    // Status filter
    if (statusFilter === 'verified' && !p.is_verified) return false;
    if (statusFilter === 'unverified' && p.is_verified) return false;
    if (statusFilter === 'featured' && !p.is_featured) return false;

    // State filter
    if (stateFilter !== 'all') {
      const placeState = (p.state_slug || p.state?.slug || '').toLowerCase();
      if (placeState !== stateFilter.toLowerCase()) return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-red-500/50 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo & Portal Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight text-white uppercase">
                  TravelBharat
                </span>
                <span className="bg-red-600/20 text-red-400 border border-red-500/30 text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md">
                  Admin Panel
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Destination Management & Moderation
              </p>
            </div>
          </div>

          {/* User Controls */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-xs sm:text-sm font-bold text-slate-300 hover:text-white px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 transition-colors flex items-center gap-2"
            >
              <Eye className="w-4 h-4 text-red-500" />
              <span>Live Site</span>
            </Link>

            <button
              onClick={handleLogout}
              className="text-xs sm:text-sm font-bold text-red-400 hover:text-red-300 px-3.5 py-2 rounded-xl bg-red-950/40 border border-red-900/50 hover:bg-red-900/40 transition-colors flex items-center gap-2 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        
        {/* ============================================================ */}
        {/* STATS OVERVIEW CARDS                                         */}
        {/* ============================================================ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Card 1: Total Places */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-2 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Total Places</span>
              <Layers className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-white">
              {stats.total_places || places.length}
            </div>
            <p className="text-[11px] text-slate-400">
              Across India's states & UTs
            </p>
          </div>

          {/* Card 2: Verified Live Destinations */}
          <div className="bg-slate-900/90 border border-emerald-900/40 rounded-3xl p-5 sm:p-6 space-y-2 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <span>Verified (Live)</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-emerald-400">
              {stats.verified_places ?? places.filter(p => p.is_verified).length}
            </div>
            <p className="text-[11px] text-slate-400">
              Active & browsable by visitors
            </p>
          </div>

          {/* Card 3: Pending / Unverified */}
          <div className="bg-slate-900/90 border border-amber-900/40 rounded-3xl p-5 sm:p-6 space-y-2 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between text-amber-400 text-xs font-bold uppercase tracking-wider">
              <span>Moderation Queue</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-amber-400">
              {stats.unverified_places ?? places.filter(p => !p.is_verified).length}
            </div>
            <p className="text-[11px] text-slate-400">
              Draft or pending review
            </p>
          </div>

          {/* Card 4: States & Cities */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-2 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Coverage</span>
              <Globe2 className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-white">
              {stats.total_states || 36} <span className="text-lg font-normal text-slate-400">States</span>
            </div>
            <p className="text-[11px] text-slate-400">
              {stats.total_cities || 40} tourist cities indexed
            </p>
          </div>

        </div>

        {/* ============================================================ */}
        {/* CONTROLS BAR: SEARCH, FILTERS, ADD DESTINATION               */}
        {/* ============================================================ */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 space-y-4 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by destination name, state, city..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-750 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns & Add Button */}
            <div className="flex flex-wrap items-center gap-3">
              
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-750 text-xs sm:text-sm font-semibold text-slate-200 rounded-2xl px-3.5 py-2.5 focus:outline-none focus:border-red-500 cursor-pointer"
              >
                <option value="all">All Status ({places.length})</option>
                <option value="verified">Verified Only</option>
                <option value="unverified">Moderation Queue</option>
                <option value="featured">Featured Only</option>
              </select>

              {/* State Filter */}
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="bg-slate-950 border border-slate-750 text-xs sm:text-sm font-semibold text-slate-200 rounded-2xl px-3.5 py-2.5 focus:outline-none focus:border-red-500 cursor-pointer max-w-[170px]"
              >
                <option value="all">All States</option>
                {statesList.map(s => (
                  <option key={s.slug || s.name} value={s.slug || s.name}>
                    {s.name}
                  </option>
                ))}
              </select>

              {/* Refresh Button */}
              <button
                onClick={loadDashboardData}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl transition-colors cursor-pointer"
                title="Refresh Table"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              {/* Primary Add Destination Button */}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider px-5 py-2.5 rounded-2xl shadow-lg shadow-red-600/30 flex items-center gap-2 transition-all hover:scale-105 cursor-pointer ml-auto md:ml-0"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add Destination</span>
              </button>

            </div>

          </div>
        </div>

        {/* ============================================================ */}
        {/* DESTINATIONS MODERATION DATA TABLE                           */}
        {/* ============================================================ */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          
          <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight text-white">
                Destinations Directory
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Showing {filteredPlaces.length} destinations
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Destination</th>
                  <th className="py-4 px-6">Location</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-500">
                      <div className="inline-block w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mb-3" />
                      <p className="text-xs font-semibold uppercase tracking-wider">Loading Destinations...</p>
                    </td>
                  </tr>
                ) : filteredPlaces.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-500 space-y-2">
                      <p className="text-base font-bold text-slate-400">No destinations found.</p>
                      <p className="text-xs">Try adjusting your search query or filters.</p>
                    </td>
                  </tr>
                ) : (
                  filteredPlaces.map((p) => {
                    const imgUrl = p.primary_image?.image_url || p.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=400&q=80';
                    const stateName = p.state_name || p.state?.name || 'India';
                    const cityName = p.city_name || p.city?.name || '';
                    const categoryName = p.categories?.[0]?.label || p.categories?.[0]?.name || 'Heritage';
                    const isBusy = actionLoading[p.slug];

                    return (
                      <tr key={p.id || p.slug} className="hover:bg-slate-850/50 transition-colors group">
                        
                        {/* Destination Thumbnail & Name */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3.5">
                            <img
                              src={imgUrl}
                              alt={p.name}
                              referrerPolicy="no-referrer"
                              className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0 shadow-sm"
                            />
                            <div>
                              <div className="font-extrabold text-white group-hover:text-amber-300 transition-colors">
                                {p.name}
                              </div>
                              <div className="text-xs text-slate-400 font-mono">
                                /{p.slug}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Location */}
                        <td className="py-4 px-6 text-xs text-slate-300 font-medium">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                            <span>{[cityName, stateName].filter(Boolean).join(', ')}</span>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-4 px-6">
                          <span className="inline-block bg-slate-800 text-slate-200 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border border-slate-700">
                            {categoryName}
                          </span>
                        </td>

                        {/* Status (1-Click Toggle Badge) */}
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => handleToggleVerify(p)}
                            disabled={isBusy}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer border ${
                              p.is_verified
                                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800 hover:bg-emerald-900/80 shadow-sm'
                                : 'bg-amber-950/60 text-amber-300 border-amber-800 hover:bg-amber-900/80 shadow-sm'
                            } ${isBusy ? 'opacity-50 pointer-events-none' : ''}`}
                            title="Click to toggle Verified / Unverified"
                          >
                            {p.is_verified ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                                <span>Verified</span>
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 stroke-[2.5]" />
                                <span>Pending</span>
                              </>
                            )}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            
                            {/* View Place Link */}
                            <Link
                              to={`/places/${p.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                              title="View destination page"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>

                            {/* Delete Place */}
                            <button
                              onClick={() => handleDeletePlace(p)}
                              disabled={isBusy}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-950/60 rounded-xl transition-colors cursor-pointer"
                              title="Delete Destination"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>

      </main>

      {/* ============================================================ */}
      {/* "ADD NEW DESTINATION" MODAL                                  */}
      {/* ============================================================ */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                  Add New Destination
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Create and publish a new tourist spot to TravelBharat
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Error */}
            {modalError && (
              <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs">
                {modalError}
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleCreatePlaceSubmit} className="space-y-4 text-sm">
              
              {/* Destination Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Destination Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Qutub Minar"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              {/* State & City selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    State / UT *
                  </label>
                  <select
                    required
                    value={formData.state_id}
                    onChange={(e) => setFormData({ ...formData, state_id: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="">Select State</option>
                    {statesList.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    City (Optional)
                  </label>
                  <select
                    value={formData.city_id}
                    onChange={(e) => setFormData({ ...formData, city_id: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="">Select City (Optional)</option>
                    {citiesList.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Primary Image URL */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Primary Image URL
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Overview Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Overview Description *
                </label>
                <textarea
                  required
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter a compelling overview of this destination..."
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Best time & Timings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Best Time to Visit
                  </label>
                  <input
                    type="text"
                    value={formData.best_time_to_visit}
                    onChange={(e) => setFormData({ ...formData, best_time_to_visit: e.target.value })}
                    placeholder="e.g. October to March"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Entry Fee
                  </label>
                  <input
                    type="text"
                    value={formData.entry_fee}
                    onChange={(e) => setFormData({ ...formData, entry_fee: e.target.value })}
                    placeholder="e.g. ₹50 (Indian), ₹500 (Foreign)"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Toggles: Verified & Featured */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.is_verified}
                    onChange={(e) => setFormData({ ...formData, is_verified: e.target.checked })}
                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                  />
                  <span className="text-xs font-bold uppercase text-slate-300">Mark Verified (Live)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                  />
                  <span className="text-xs font-bold uppercase text-slate-300">Feature on Homepage</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-red-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Publish Destination'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
