import { useState, useEffect } from 'react';
import Home from "./components/Home"
import Dashboard from "./components/Dashboard"

function App() {
  // Initialize state from sessionStorage
  const getInitialState = () => {
    const adminSession = sessionStorage.getItem('adminLoggedIn');
    if (adminSession === 'true') {
      return { page: 'dashboard', adminLoggedIn: true };
    }
    return { page: 'home', adminLoggedIn: false };
  };

  const initialState = getInitialState();
  const [currentPage, setCurrentPage] = useState(initialState.page);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(initialState.adminLoggedIn);

  const navigateTo = (page) => {
    setCurrentPage(page);
  };

  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
    setCurrentPage('dashboard');
    sessionStorage.setItem('adminLoggedIn', 'true');
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    setCurrentPage('home');
    // Clear all session data
    sessionStorage.removeItem('adminLoggedIn');
    sessionStorage.removeItem('bookingData');
    sessionStorage.removeItem('userSearchData');
  };

  if (currentPage === 'dashboard' && isAdminLoggedIn) {
    return <Dashboard onLogout={handleLogout} />;
  }

  return <Home onAdminLogin={handleAdminLogin} />;
}

export default App;