import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FavoritesDrawer from './components/FavoritesDrawer';
import ScrollToTop from './components/ScrollToTop';
import { FavoritesProvider } from './context/FavoritesContext';

import Home from './pages/Home';
import States from './pages/States';
import StateDetail from './pages/StateDetail';
import CityDetail from './pages/CityDetail';
import Places from './pages/Places';
import PlaceDetail from './pages/PlaceDetail';
import Categories from './pages/Categories';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <ScrollToTop />
      {!isAdminRoute && <Navbar />}
      <FavoritesDrawer />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/states" element={<States />} />
          <Route path="/destinations" element={<States />} />
          <Route path="/states/:slug" element={<StateDetail />} />
          <Route path="/cities/:slug" element={<CityDetail />} />
          <Route path="/places" element={<Places />} />
          <Route path="/places/:slug" element={<PlaceDetail />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
};

function App() {
  return (
    <FavoritesProvider>
      <Router>
        <AppContent />
      </Router>
    </FavoritesProvider>
  );
}

export default App;


