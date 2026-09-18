import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fallback Data for States categorized by Region
export const REGIONAL_STATES = {
  "North": [
    { name: "Chandigarh", slug: "chandigarh", is_ut: true, capital: "Chandigarh" },
    { name: "Delhi", slug: "delhi", is_ut: true, capital: "New Delhi" },
    { name: "Haryana", slug: "haryana", is_ut: false, capital: "Chandigarh" },
    { name: "Himachal Pradesh", slug: "himachal-pradesh", is_ut: false, capital: "Shimla" },
    { name: "Jammu and Kashmir", slug: "jammu-and-kashmir", is_ut: true, capital: "Srinagar / Jammu" },
    { name: "Ladakh", slug: "ladakh", is_ut: true, capital: "Leh" },
    { name: "Punjab", slug: "punjab", is_ut: false, capital: "Chandigarh" },
    { name: "Rajasthan", slug: "rajasthan", is_ut: false, capital: "Jaipur" },
    { name: "Uttar Pradesh", slug: "uttar-pradesh", is_ut: false, capital: "Lucknow" },
    { name: "Uttarakhand", slug: "uttarakhand", is_ut: false, capital: "Dehradun" }
  ],
  "North East": [
    { name: "Arunachal Pradesh", slug: "arunachal-pradesh", is_ut: false, capital: "Itanagar" },
    { name: "Assam", slug: "assam", is_ut: false, capital: "Dispur" },
    { name: "Manipur", slug: "manipur", is_ut: false, capital: "Imphal" },
    { name: "Meghalaya", slug: "meghalaya", is_ut: false, capital: "Shillong" },
    { name: "Mizoram", slug: "mizoram", is_ut: false, capital: "Aizawl" },
    { name: "Nagaland", slug: "nagaland", is_ut: false, capital: "Kohima" },
    { name: "Sikkim", slug: "sikkim", is_ut: false, capital: "Gangtok" },
    { name: "Tripura", slug: "tripura", is_ut: false, capital: "Agartala" }
  ],
  "East": [
    { name: "Andaman and Nicobar Islands", slug: "andaman-and-nicobar-islands", is_ut: true, capital: "Port Blair" },
    { name: "Bihar", slug: "bihar", is_ut: false, capital: "Patna" },
    { name: "Jharkhand", slug: "jharkhand", is_ut: false, capital: "Ranchi" },
    { name: "Odisha", slug: "odisha", is_ut: false, capital: "Bhubaneswar" },
    { name: "West Bengal", slug: "west-bengal", is_ut: false, capital: "Kolkata" }
  ],
  "Central": [
    { name: "Chhattisgarh", slug: "chhattisgarh", is_ut: false, capital: "Raipur" },
    { name: "Madhya Pradesh", slug: "madhya-pradesh", is_ut: false, capital: "Bhopal" }
  ],
  "West": [
    { name: "Dadra and Nagar Haveli and Daman and Diu", slug: "dadra-and-nagar-haveli-and-daman-and-diu", is_ut: true, capital: "Daman" },
    { name: "Goa", slug: "goa", is_ut: false, capital: "Panaji" },
    { name: "Gujarat", slug: "gujarat", is_ut: false, capital: "Gandhinagar" },
    { name: "Maharashtra", slug: "maharashtra", is_ut: false, capital: "Mumbai" }
  ],
  "South": [
    { name: "Andhra Pradesh", slug: "andhra-pradesh", is_ut: false, capital: "Amaravati" },
    { name: "Karnataka", slug: "karnataka", is_ut: false, capital: "Bengaluru" },
    { name: "Kerala", slug: "kerala", is_ut: false, capital: "Thiruvananthapuram" },
    { name: "Lakshadweep", slug: "lakshadweep", is_ut: true, capital: "Kavaratti" },
    { name: "Puducherry", slug: "puducherry", is_ut: true, capital: "Puducherry" },
    { name: "Tamil Nadu", slug: "tamil-nadu", is_ut: false, capital: "Chennai" },
    { name: "Telangana", slug: "telangana", is_ut: false, capital: "Hyderabad" }
  ]
};

// Fallback Places Data with rich destination metadata & Unsplash imagery
export const FALLBACK_PLACES = [
  {
    id: 1,
    name: "Taj Mahal",
    slug: "taj-mahal",
    state: { name: "Uttar Pradesh", slug: "uttar-pradesh" },
    city: { name: "Agra", slug: "agra" },
    categories: [{ name: "heritage", label: "Heritage", slug: "heritage" }],
    description: "An immense mausoleum of white marble, built in Agra between 1631 and 1648 by order of the Mughal emperor Shah Jahan in memory of his favourite wife. The Taj Mahal is the jewel of Muslim art in India and one of the universally admired masterpieces of the world's heritage.",
    historical_significance: "Commissioned in 1631 by Mughal Emperor Shah Jahan to house the tomb of his favorite wife, Mumtaz Mahal. It represents the pinnacle of Mughal architecture combining Indian, Persian, and Islamic artistic elements.",
    best_time_to_visit: "October to March",
    entry_fee: "₹50 (Indian Nationals), ₹1,100 (Foreign Tourists)",
    timings: "6:00 AM to 6:30 PM (Closed on Fridays)",
    location_map_url: "https://maps.google.com/?q=Taj+Mahal+Agra",
    is_featured: true,
    is_verified: true,
    images: [
      { id: 101, image_url: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80", caption: "Sunrise over Taj Mahal", is_primary: true }
    ],
    nearby_attractions: "Agra Fort\nMehtab Bagh\nItimad-ud-Daulah (Baby Taj)\nFatehpur Sikri"
  },
  {
    id: 2,
    name: "Hawa Mahal",
    slug: "hawa-mahal",
    state: { name: "Rajasthan", slug: "rajasthan" },
    city: { name: "Jaipur", slug: "jaipur" },
    categories: [{ name: "heritage", label: "Heritage", slug: "heritage" }],
    description: "Built from red and pink sandstone, the Hawa Mahal or 'Palace of Breeze' features 953 small windows called Jharokhas decorated with intricate latticework.",
    historical_significance: "Constructed in 1799 by Maharaja Sawai Pratap Singh, designed by Lal Chand Ustad in the form of the crown of Lord Krishna.",
    best_time_to_visit: "September to March",
    entry_fee: "₹50 (Indian Nationals), ₹200 (Foreign Tourists)",
    timings: "9:00 AM to 4:30 PM (Daily)",
    location_map_url: "https://maps.google.com/?q=Hawa+Mahal+Jaipur",
    is_featured: true,
    is_verified: true,
    images: [
      { id: 102, image_url: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80", caption: "Front View of Hawa Mahal", is_primary: true }
    ],
    nearby_attractions: "City Palace Jaipur\nJantar Mantar\nAmber Fort\nNahargarh Fort"
  },
  {
    id: 3,
    name: "Varanasi Ghats & Kashi Vishwanath",
    slug: "varanasi-ghats",
    state: { name: "Uttar Pradesh", slug: "uttar-pradesh" },
    city: { name: "Varanasi", slug: "varanasi" },
    categories: [{ name: "religious", label: "Religious", slug: "religious" }],
    description: "Varanasi is one of the world's oldest continually inhabited cities. The riverfront Ghats along the Ganges river offer mesmerizing evening Ganga Aarti rituals.",
    historical_significance: "Spiritual capital of India for millennia, intimately associated with Lord Shiva and sacred Vedic traditions.",
    best_time_to_visit: "November to February",
    entry_fee: "Free access to Ghats",
    timings: "Open 24 Hours (Ganga Aarti at 6:45 PM)",
    location_map_url: "https://maps.google.com/?q=Dashashwamedh+Ghat+Varanasi",
    is_featured: true,
    is_verified: true,
    images: [
      { id: 103, image_url: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80", caption: "Ganga Aarti at Varanasi", is_primary: true }
    ],
    nearby_attractions: "Sarnath\nManikarnika Ghat\nBanaras Hindu University\nRamnagar Fort"
  },
  {
    id: 4,
    name: "Munnar Tea Gardens",
    slug: "munnar-tea-gardens",
    state: { name: "Kerala", slug: "kerala" },
    city: { name: "Munnar", slug: "munnar" },
    categories: [{ name: "nature", label: "Nature", slug: "nature" }],
    description: "Nestled in the Western Ghats mountain range of Kerala, Munnar is famous for its sprawling tea plantations, mist-draped hills, waterfalls, and rare flora.",
    historical_significance: "Developed as a summer resort by the British Raj in South India, now the heart of South India's tea trade.",
    best_time_to_visit: "September to May",
    entry_fee: "Free to explore hill vistas",
    timings: "9:00 AM to 5:00 PM for Tea Estates",
    location_map_url: "https://maps.google.com/?q=Munnar+Tea+Gardens+Kerala",
    is_featured: true,
    is_verified: true,
    images: [
      { id: 104, image_url: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80", caption: "Lush Tea Hills of Munnar", is_primary: true }
    ],
    nearby_attractions: "Eravikulam National Park\nMattupetty Dam\nAnamudi Peak\nTea Museum"
  },
  {
    id: 5,
    name: "Pangong Tso Lake",
    slug: "pangong-tso-lake",
    state: { name: "Ladakh", slug: "ladakh" },
    city: { name: "Leh", slug: "leh" },
    categories: [{ name: "adventure", label: "Adventure", slug: "adventure" }],
    description: "An endorheic lake located at an altitude of 4,225 meters, famous for its ever-changing hues ranging from azure blue to deep green.",
    historical_significance: "Located along the ancient Silk Route corridor connecting Trans-Himalayan trade lines.",
    best_time_to_visit: "May to September",
    entry_fee: "Inner Line Permit required (~₹400)",
    timings: "Daylight Hours",
    location_map_url: "https://maps.google.com/?q=Pangong+Lake+Ladakh",
    is_featured: true,
    is_verified: true,
    images: [
      { id: 105, image_url: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80", caption: "Pangong Tso Lake Azure Waters", is_primary: true }
    ],
    nearby_attractions: "Nubra Valley\nKhardung La Pass\nDiskit Monastery\nThiksey Monastery"
  },
  {
    id: 6,
    name: "Golden Temple (Sri Harmandir Sahib)",
    slug: "golden-temple",
    state: { name: "Punjab", slug: "punjab" },
    city: { name: "Amritsar", slug: "amritsar" },
    categories: [{ name: "religious", label: "Religious", slug: "religious" }],
    description: "The holiest Gurdwara of Sikhism, surrounded by a sacred pool (Amrit Sarovar), renowned for its gold-plated architecture and 24/7 free community kitchen (Langar).",
    historical_significance: "Founded in 1577 by Guru Ram Das Ji. The gold foil cladding was added by Maharaja Ranjit Singh in 1830.",
    best_time_to_visit: "October to March",
    entry_fee: "Free Entry for Everyone",
    timings: "Open 24 Hours",
    location_map_url: "https://maps.google.com/?q=Golden+Temple+Amritsar",
    is_featured: true,
    is_verified: true,
    images: [
      { id: 106, image_url: "https://images.unsplash.com/photo-1514222709107-a180c68d72b4?auto=format&fit=crop&w=1200&q=80", caption: "Golden Temple reflected in sacred pool", is_primary: true }
    ],
    nearby_attractions: "Jallianwala Bagh\nWagah Border\nPartition Museum\nGobindgarh Fort"
  }
];

export const fetchStates = async (params = {}) => {
  try {
    const res = await api.get('/states/', { params: { page_size: 500, ...params } });
    return res.data.results || res.data;
  } catch (error) {
    console.warn("API offline, utilizing fallback states data:", error);
    const statesList = [];
    Object.entries(REGIONAL_STATES).forEach(([region, states]) => {
      states.forEach(st => {
        statesList.push({
          ...st,
          is_union_territory: st.is_ut,
          region,
          place_count: FALLBACK_PLACES.filter(p => p.state?.slug === st.slug).length
        });
      });
    });
    return statesList;
  }
};

export const fetchCategories = async () => {
  try {
    const res = await api.get('/categories/', { params: { page_size: 100 } });
    return res.data.results || res.data;
  } catch (error) {
    return [
      { id: 1, name: "heritage", label: "Heritage", slug: "heritage", description: "Forts, Palaces, and Historic Monuments" },
      { id: 2, name: "nature", label: "Nature", slug: "nature", description: "Hills, Wildlife, Lakes, and Backwaters" },
      { id: 3, name: "spiritual", label: "Spiritual", slug: "spiritual", description: "Sacred Shrines, Temples, and Ghats" },
      { id: 4, name: "adventure", label: "Adventure", slug: "adventure", description: "High Altitude Passes, Trekking, and Watersports" },
      { id: 5, name: "beach", label: "Beach", slug: "beach", description: "Coastal shores and serene coastlines" },
      { id: 6, name: "culture", label: "Culture", slug: "culture", description: "Art, architecture, and festivals" },
      { id: 7, name: "wildlife", label: "Wildlife", slug: "wildlife", description: "National parks and wildlife sanctuaries" }
    ];
  }
};

export const fetchPlaces = async (params = {}) => {
  try {
    const res = await api.get('/places/', { params: { page_size: 500, ...params } });
    return res.data.results || res.data;
  } catch (error) {
    let filtered = [...FALLBACK_PLACES];
    if (params.state) {
      filtered = filtered.filter(p => (p.state_slug || p.state?.slug) === params.state);
    }
    if (params.category) {
      filtered = filtered.filter(p => (p.categories || []).some(c => (c.slug || c.name) === params.category));
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(p => 
        (p.name && p.name.toLowerCase().includes(q)) || 
        ((p.state_name || p.state?.name || '').toLowerCase().includes(q)) ||
        ((p.city_name || p.city?.name || '').toLowerCase().includes(q))
      );
    }
    if (params.featured) {
      filtered = filtered.filter(p => p.is_featured);
    }
    return filtered;
  }
};

export const fetchFeaturedPlaces = async () => {
  try {
    const res = await api.get('/places/featured/', { params: { limit: 20 } });
    const data = res.data.results || res.data;
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
    return await fetchPlaces({ featured: true });
  } catch (error) {
    return FALLBACK_PLACES.filter(p => p.is_featured);
  }
};

export const fetchCities = async (params = {}) => {
  try {
    const res = await api.get('/cities/', { params: { page_size: 500, ...params } });
    return res.data.results || res.data;
  } catch (error) {
    console.warn("API cities endpoint offline, fallback:", error);
    return [];
  }
};

export const fetchCityBySlug = async (slug) => {
  try {
    const res = await api.get(`/cities/${slug}/`);
    return res.data;
  } catch (error) {
    console.warn(`API city ${slug} offline:`, error);
    return null;
  }
};

export const fetchPlaceBySlug = async (slug) => {
  try {
    const res = await api.get(`/places/${slug}/`);
    return res.data;
  } catch (error) {
    const place = FALLBACK_PLACES.find(p => p.slug === slug);
    return place || FALLBACK_PLACES[0];
  }
};

// ==========================================
// ADMIN PORTAL API SERVICES
// ==========================================

export const adminLogin = async ({ username, password }) => {
  try {
    const res = await api.post('/auth/login/', { username, password });
    return res.data;
  } catch (error) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error('Login failed. Please check credentials.');
  }
};

export const fetchAdminStats = async () => {
  try {
    const res = await api.get('/places/stats/');
    return res.data;
  } catch (error) {
    console.warn("API stats endpoint offline, calculating local stats:", error);
    return {
      total_places: FALLBACK_PLACES.length,
      verified_places: FALLBACK_PLACES.filter(p => p.is_verified).length,
      unverified_places: FALLBACK_PLACES.filter(p => !p.is_verified).length,
      featured_places: FALLBACK_PLACES.filter(p => p.is_featured).length,
      total_states: 36,
      total_cities: 40,
      total_categories: 7
    };
  }
};

export const fetchAdminPlaces = async (params = {}) => {
  try {
    const res = await api.get('/places/', { params: { all: 'true', page_size: 1000, ...params } });
    return res.data.results || res.data;
  } catch (error) {
    console.warn("API admin places offline:", error);
    return FALLBACK_PLACES;
  }
};

export const togglePlaceVerify = async (slug) => {
  try {
    const res = await api.post(`/places/${slug}/toggle_verify/`);
    return res.data;
  } catch (error) {
    console.error("Failed to toggle verify:", error);
    throw error;
  }
};

export const createAdminPlace = async (data) => {
  try {
    const res = await api.post('/places/', data);
    return res.data;
  } catch (error) {
    console.error("Failed to create place:", error);
    throw error;
  }
};

export const deleteAdminPlace = async (slug) => {
  try {
    await api.delete(`/places/${slug}/`);
    return true;
  } catch (error) {
    console.error("Failed to delete place:", error);
    throw error;
  }
};

export default api;

