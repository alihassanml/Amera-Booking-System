import { useState, useEffect } from 'react';
import Home from "./components/Home"
import Dashboard from "./components/Dashboard"
import Employ from './components/Employ';
import Record from './components/Record';

function App() {
  // Initialize state from sessionStorage
  const getInitialState = () => {
    const adminSession = sessionStorage.getItem('adminLoggedIn');
    const employeeSession = sessionStorage.getItem('employeeLoggedIn');
    const currentView = sessionStorage.getItem('currentView') || 'dashboard';
    
    if (adminSession === 'true') {
      return { page: currentView, adminLoggedIn: true, employeeLoggedIn: false };
    } else if (employeeSession === 'true') {
      return { page: currentView === 'records' ? 'records' : 'employee', adminLoggedIn: false, employeeLoggedIn: true };
    }
    return { page: 'home', adminLoggedIn: false, employeeLoggedIn: false };
  };

  const initialState = getInitialState();
  const [currentPage, setCurrentPage] = useState(initialState.page);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(initialState.adminLoggedIn);
  const [isEmployeeLoggedIn, setIsEmployeeLoggedIn] = useState(initialState.employeeLoggedIn);

  const navigateTo = (page) => {
    setCurrentPage(page);
    sessionStorage.setItem('currentView', page);
  };

  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
    setIsEmployeeLoggedIn(false);
    setCurrentPage('dashboard');
    sessionStorage.setItem('adminLoggedIn', 'true');
    sessionStorage.setItem('currentView', 'dashboard');
    sessionStorage.removeItem('employeeLoggedIn');
  };

  const handleEmployeeLogin = () => {
    setIsEmployeeLoggedIn(true);
    setIsAdminLoggedIn(false);
    setCurrentPage('employee');
    sessionStorage.setItem('employeeLoggedIn', 'true');
    sessionStorage.setItem('currentView', 'employee');
    sessionStorage.removeItem('adminLoggedIn');
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    setIsEmployeeLoggedIn(false);
    setCurrentPage('home');
    // Clear all session data
    sessionStorage.removeItem('adminLoggedIn');
    sessionStorage.removeItem('employeeLoggedIn');
    sessionStorage.removeItem('currentView');
    sessionStorage.removeItem('bookingData');
    sessionStorage.removeItem('userSearchData');
  };

  if (currentPage === 'dashboard' && isAdminLoggedIn) {
    return <Dashboard onLogout={handleLogout} navigateTo={navigateTo} />;
  }

  if (currentPage === 'records' && isAdminLoggedIn) {
    return <Record onLogout={handleLogout} navigateTo={navigateTo} previousPage="dashboard" />;
  }

  if (currentPage === 'records' && isEmployeeLoggedIn) {
    return <Record onLogout={handleLogout} navigateTo={navigateTo} previousPage="employee" />;
  }

  if (currentPage === 'employee' && isEmployeeLoggedIn) {
    return <Employ onLogout={handleLogout} navigateTo={navigateTo} />;
  }

  return <Home onAdminLogin={handleAdminLogin} onEmployeeLogin={handleEmployeeLogin} />;
}

export default App;