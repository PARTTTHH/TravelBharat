import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { REGIONAL_STATES } from '../services/api';

// Regional Map Images from Destinations-Images
import NorthMap from '../Destinations-Images/North.jpg';
import NorthEastMap from '../Destinations-Images/North-East.jpg';
import EastMap from '../Destinations-Images/East.jpg';
import CentralMap from '../Destinations-Images/Central.jpg';
import WestMap from '../Destinations-Images/West.jpg';
import SouthMap from '../Destinations-Images/South.jpg';

const REGION_MAPS = {
  "North": NorthMap,
  "North East": NorthEastMap,
  "East": EastMap,
  "Central": CentralMap,
  "West": WestMap,
  "South": SouthMap
};

// Popular National Parks across India for the National Parks tab
const REGIONAL_NATIONAL_PARKS = {
  "North": [
    { name: "Jim Corbett National Park", state: "Uttarakhand" },
    { name: "Hemis National Park", state: "Ladakh" },
    { name: "Ranthambore National Park", state: "Rajasthan" },
    { name: "Great Himalayan National Park", state: "Himachal Pradesh" },
    { name: "Dudhwa National Park", state: "Uttar Pradesh" }
  ],
  "North East": [
    { name: "Kaziranga National Park", state: "Assam" },
    { name: "Manas National Park", state: "Assam" },
    { name: "Keibul Lamjao National Park", state: "Manipur" },
    { name: "Namdapha National Park", state: "Arunachal Pradesh" },
    { name: "Khangchendzonga National Park", state: "Sikkim" }
  ],
  "East": [
    { name: "Sundarbans National Park", state: "West Bengal" },
    { name: "Simlipal National Park", state: "Odisha" },
    { name: "Betla National Park", state: "Jharkhand" },
    { name: "Valmiki National Park", state: "Bihar" }
  ],
  "Central": [
    { name: "Kanha National Park", state: "Madhya Pradesh" },
    { name: "Bandhavgarh National Park", state: "Madhya Pradesh" },
    { name: "Pench National Park", state: "Madhya Pradesh" },
    { name: "Kanger Ghati National Park", state: "Chhattisgarh" }
  ],
  "West": [
    { name: "Gir National Park", state: "Gujarat" },
    { name: "Tadoba Andhari National Park", state: "Maharashtra" },
    { name: "Mollem National Park", state: "Goa" },
    { name: "Blackbuck National Park", state: "Gujarat" }
  ],
  "South": [
    { name: "Periyar National Park", state: "Kerala" },
    { name: "Bandipur National Park", state: "Karnataka" },
    { name: "Nagarhole National Park", state: "Karnataka" },
    { name: "Mudumalai National Park", state: "Tamil Nadu" },
    { name: "Silent Valley National Park", state: "Kerala" }
  ]
};

// Pure Cities grouped by respective regional map area for the Destinations tab
const REGIONAL_CITIES = {
  "North": [
    { name: "Agra", slug: "agra", state: "Uttar Pradesh" },
    { name: "Amritsar", slug: "amritsar", state: "Punjab" },
    { name: "Chandigarh", slug: "chandigarh", state: "Chandigarh" },
    { name: "Dharamshala", slug: "dharamshala", state: "Himachal Pradesh" },
    { name: "Haridwar", slug: "haridwar", state: "Uttarakhand" },
    { name: "Jaipur", slug: "jaipur", state: "Rajasthan" },
    { name: "Jaisalmer", slug: "jaisalmer", state: "Rajasthan" },
    { name: "Leh", slug: "leh", state: "Ladakh" },
    { name: "Lucknow", slug: "lucknow", state: "Uttar Pradesh" },
    { name: "Manali", slug: "manali", state: "Himachal Pradesh" },
    { name: "Nainital", slug: "nainital", state: "Uttarakhand" },
    { name: "New Delhi", slug: "new-delhi", state: "Delhi" },
    { name: "Rishikesh", slug: "rishikesh", state: "Uttarakhand" },
    { name: "Shimla", slug: "shimla", state: "Himachal Pradesh" },
    { name: "Srinagar", slug: "srinagar", state: "Jammu and Kashmir" },
    { name: "Udaipur", slug: "udaipur", state: "Rajasthan" },
    { name: "Varanasi", slug: "varanasi", state: "Uttar Pradesh" }
  ],
  "North East": [
    { name: "Agartala", slug: "agartala", state: "Tripura" },
    { name: "Aizawl", slug: "aizawl", state: "Mizoram" },
    { name: "Cherrapunji (Sohra)", slug: "cherrapunji-sohra", state: "Meghalaya" },
    { name: "Dimapur", slug: "dimapur", state: "Nagaland" },
    { name: "Gangtok", slug: "gangtok", state: "Sikkim" },
    { name: "Guwahati", slug: "guwahati", state: "Assam" },
    { name: "Imphal", slug: "imphal", state: "Manipur" },
    { name: "Itanagar", slug: "itanagar", state: "Arunachal Pradesh" },
    { name: "Kaziranga", slug: "kaziranga", state: "Assam" },
    { name: "Kohima", slug: "kohima", state: "Nagaland" },
    { name: "Majuli", slug: "majuli", state: "Assam" },
    { name: "Pelling", slug: "pelling", state: "Sikkim" },
    { name: "Shillong", slug: "shillong", state: "Meghalaya" },
    { name: "Tawang", slug: "tawang", state: "Arunachal Pradesh" },
    { name: "Ziro", slug: "ziro", state: "Arunachal Pradesh" }
  ],
  "East": [
    { name: "Bhubaneswar", slug: "bhubaneswar", state: "Odisha" },
    { name: "Bodh Gaya", slug: "bodh-gaya", state: "Bihar" },
    { name: "Darjeeling", slug: "darjeeling", state: "West Bengal" },
    { name: "Deoghar", slug: "deoghar", state: "Jharkhand" },
    { name: "Havelock Island", slug: "havelock-island-swaraj-dweep", state: "Andaman and Nicobar Islands" },
    { name: "Kolkata", slug: "kolkata", state: "West Bengal" },
    { name: "Konark", slug: "konark", state: "Odisha" },
    { name: "Patna", slug: "patna", state: "Bihar" },
    { name: "Port Blair", slug: "port-blair", state: "Andaman and Nicobar Islands" },
    { name: "Puri", slug: "puri", state: "Odisha" },
    { name: "Ranchi", slug: "ranchi", state: "Jharkhand" }
  ],
  "Central": [
    { name: "Bhopal", slug: "bhopal", state: "Madhya Pradesh" },
    { name: "Gwalior", slug: "gwalior", state: "Madhya Pradesh" },
    { name: "Jagdalpur", slug: "jagdalpur", state: "Chhattisgarh" },
    { name: "Khajuraho", slug: "khajuraho", state: "Madhya Pradesh" },
    { name: "Raipur", slug: "raipur", state: "Chhattisgarh" },
    { name: "Sirpur", slug: "sirpur", state: "Chhattisgarh" }
  ],
  "West": [
    { name: "Ahmedabad", slug: "ahmedabad", state: "Gujarat" },
    { name: "Candolim", slug: "candolim", state: "Goa" },
    { name: "Chhatrapati Sambhajinagar", slug: "chhatrapati-sambhajinagar", state: "Maharashtra" },
    { name: "Daman", slug: "daman", state: "Dadra and Nagar Haveli and Daman and Diu" },
    { name: "Diu", slug: "diu", state: "Dadra and Nagar Haveli and Daman and Diu" },
    { name: "Kevadia (Ektanagar)", slug: "kevadia-ektanagar", state: "Gujarat" },
    { name: "Mumbai", slug: "mumbai", state: "Maharashtra" },
    { name: "Panaji", slug: "panaji", state: "Goa" },
    { name: "Pune", slug: "pune", state: "Maharashtra" },
    { name: "Silvassa", slug: "silvassa", state: "Dadra and Nagar Haveli and Daman and Diu" },
    { name: "Somnath", slug: "somnath", state: "Gujarat" }
  ],
  "South": [
    { name: "Alappuzha (Alleppey)", slug: "alappuzha", state: "Kerala" },
    { name: "Auroville", slug: "auroville", state: "Puducherry" },
    { name: "Bengaluru", slug: "bengaluru", state: "Karnataka" },
    { name: "Chennai", slug: "chennai", state: "Tamil Nadu" },
    { name: "Hampi", slug: "hampi", state: "Karnataka" },
    { name: "Hyderabad", slug: "hyderabad", state: "Telangana" },
    { name: "Kochi", slug: "kochi", state: "Kerala" },
    { name: "Madurai", slug: "madurai", state: "Tamil Nadu" },
    { name: "Mahabalipuram", slug: "mahabalipuram", state: "Tamil Nadu" },
    { name: "Munnar", slug: "munnar", state: "Kerala" },
    { name: "Mysuru", slug: "mysuru", state: "Karnataka" },
    { name: "Puducherry", slug: "puducherry", state: "Puducherry" },
    { name: "Tirupati", slug: "tirupati", state: "Andhra Pradesh" },
    { name: "Vijayawada", slug: "vijayawada", state: "Andhra Pradesh" },
    { name: "Visakhapatnam", slug: "visakhapatnam", state: "Andhra Pradesh" },
    { name: "Warangal", slug: "warangal", state: "Telangana" }
  ]
};

const States = () => {
  const [activeTab, setActiveTab] = useState('states');

  return (
    <div className="w-full bg-white min-h-[calc(100vh-5rem)] font-sans pb-24">
      
      {/* Header Banner */}
      <section className="bg-black text-white py-12 sm:py-16 px-4 sm:px-8 lg:px-12 text-center border-b border-neutral-800">
        <div className="max-w-4xl mx-auto space-y-3">
          <p className="text-base sm:text-lg font-serif italic text-red-500 font-semibold tracking-wide">
            — Regional Directory —
          </p>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-white drop-shadow-md">
            DESTINATIONS DIRECTORY
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Explore 36 States & Union Territories, vibrant heritage cities, and protected wildlife reserves across every geographic region of India.
          </p>
        </div>
      </section>

      {/* Top Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-4">
        <div className="flex items-center justify-center gap-6 sm:gap-14 border-b border-slate-200 pb-4">
          <button
            onClick={() => setActiveTab('states')}
            className={`font-black text-lg sm:text-2xl lg:text-3xl tracking-tight transition-all relative pb-3 cursor-pointer ${
              activeTab === 'states'
                ? 'text-red-600 after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3.5px] after:bg-red-600'
                : 'text-slate-900 hover:text-red-600 font-extrabold'
            }`}
          >
            States and UTs
          </button>

          <button
            onClick={() => setActiveTab('destinations')}
            className={`font-black text-lg sm:text-2xl lg:text-3xl tracking-tight transition-all relative pb-3 cursor-pointer ${
              activeTab === 'destinations'
                ? 'text-red-600 after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3.5px] after:bg-red-600'
                : 'text-slate-900 hover:text-red-600 font-extrabold'
            }`}
          >
            Destinations (Cities)
          </button>

          <button
            onClick={() => setActiveTab('parks')}
            className={`font-black text-lg sm:text-2xl lg:text-3xl tracking-tight transition-all relative pb-3 cursor-pointer ${
              activeTab === 'parks'
                ? 'text-red-600 after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3.5px] after:bg-red-600'
                : 'text-slate-900 hover:text-red-600 font-extrabold'
            }`}
          >
            National Parks
          </button>
        </div>
      </div>

      {/* Main Content Area (Spacious & Clean Layout) */}
      <div className="max-w-[1650px] mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-10">
        
        {/* TAB 1: STATES AND UTS (Exact layout with clean borderless map images) */}
        {activeTab === 'states' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 sm:gap-10 lg:gap-12 items-start">
            {Object.entries(REGIONAL_STATES).map(([region, states]) => (
              <div key={region} className="flex flex-col space-y-4">
                
                {/* Regional India Map Image (Clean, No Border, Seamless) */}
                <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36 flex items-center justify-start">
                  <img
                    src={REGION_MAPS[region]}
                    alt={`${region} India Map`}
                    className="w-full h-full object-contain object-left mix-blend-multiply"
                  />
                </div>

                {/* Region Heading */}
                <h3 className="font-bold text-sky-600 text-base sm:text-lg lg:text-xl tracking-wide">
                  {region}
                </h3>

                {/* List of States & UTs (Clean Regular Weight & Comfortable Spacing) */}
                <ul className="space-y-2.5 text-sm sm:text-base lg:text-[16px] text-slate-700 font-normal w-full">
                  {states.map((st) => (
                    <li key={st.slug}>
                      <Link
                        to={`/states/${st.slug}`}
                        className="hover:text-red-600 transition-colors block leading-snug cursor-pointer"
                      >
                        {st.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: DESTINATIONS (Pure Cities per Region) */}
        {activeTab === 'destinations' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 sm:gap-10 lg:gap-12 items-start">
            {Object.entries(REGIONAL_CITIES).map(([region, citiesList]) => (
              <div key={region} className="flex flex-col space-y-4">
                <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36 flex items-center justify-start">
                  <img
                    src={REGION_MAPS[region]}
                    alt={`${region} India Map`}
                    className="w-full h-full object-contain object-left mix-blend-multiply"
                  />
                </div>

                <h3 className="font-bold text-sky-600 text-base sm:text-lg lg:text-xl tracking-wide">
                  {region}
                </h3>

                <ul className="space-y-2.5 text-sm sm:text-base lg:text-[16px] text-slate-700 font-normal w-full">
                  {citiesList.map((city) => (
                    <li key={city.slug}>
                      <Link
                        to={`/cities/${city.slug}`}
                        className="hover:text-red-600 transition-colors block leading-snug cursor-pointer"
                      >
                        {city.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: NATIONAL PARKS */}
        {activeTab === 'parks' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 sm:gap-10 lg:gap-12 items-start">
            {Object.entries(REGIONAL_NATIONAL_PARKS).map(([region, parks]) => (
              <div key={region} className="flex flex-col space-y-4">
                <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36 flex items-center justify-start">
                  <img
                    src={REGION_MAPS[region]}
                    alt={`${region} India Map`}
                    className="w-full h-full object-contain object-left mix-blend-multiply"
                  />
                </div>

                <h3 className="font-bold text-sky-600 text-base sm:text-lg lg:text-xl tracking-wide">
                  {region}
                </h3>

                <ul className="space-y-2.5 text-sm sm:text-base lg:text-[16px] text-slate-700 font-normal w-full">
                  {parks.map((park, idx) => (
                    <li key={idx}>
                      <Link
                        to={`/places?search=${encodeURIComponent(park.name)}`}
                        className="hover:text-red-600 transition-colors block leading-snug cursor-pointer"
                      >
                        {park.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};

export default States;
