import { useState, useEffect } from 'react';

function Home({ onAdminLogin, onEmployeeLogin }) {
  // Initialize state from React state (not using browser storage per guidelines)
  const getInitialBookings = () => {
    return [];
  };

  const getInitialSearchData = () => {
    return null;
  };

  const initialSearchData = getInitialSearchData();
  const initialBookings = getInitialBookings();

  const [showModal, setShowModal] = useState(initialBookings.length === 0);
  const [userType, setUserType] = useState('user');
  const [searchType, setSearchType] = useState(initialSearchData?.searchType || 'phone');
  const [phoneNumber, setPhoneNumber] = useState(initialSearchData?.phoneNumber || '');
  const [bookingId, setBookingId] = useState(initialSearchData?.bookingId || '');
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState(initialBookings);
  const [error, setError] = useState('');
  const [editingBooking, setEditingBooking] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [adminCredentials, setAdminCredentials] = useState({
    email: '',
    password: ''
  });
  const [employeeCredentials, setEmployeeCredentials] = useState({
    email: '',
    password: ''
  });
  const [adminLoading, setAdminLoading] = useState(false);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [adminType, setAdminType] = useState('admin');
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);

  // Phone number formatting function
  const formatPhoneNumber = (value) => {
    const phoneNumber = value.replace(/\D/g, '');

    if (phoneNumber.length <= 3) {
      return phoneNumber;
    } else if (phoneNumber.length <= 6) {
      return `${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3)}`;
    } else if (phoneNumber.length <= 9) {
      return `${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3, 6)} ${phoneNumber.slice(6)}`;
    } else {
      return `${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3, 6)} ${phoneNumber.slice(6, 9)} ${phoneNumber.slice(9, 12)}`;
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    const formatted = formatPhoneNumber(value);
    setPhoneNumber(formatted);
  };

  const handleSearchTypeChange = (type) => {
    setSearchType(type);
    setPhoneNumber('');
    setBookingId('');
    setError('');
  };

  const sortBookingsByDate = (bookings) => {
    return [...bookings].sort((a, b) => {
      // Try to get the most relevant date from each booking
      const getBookingDate = (booking) => {
        // Priority order: Appointment Date, then any other date field available
        const dateFields = [
          booking['Appointment Date'],
          booking['Online Payment Date'],
          booking['Date of Birth'],
          booking['Booking Date'], // if this field exists
          booking['Created Date']   // if this field exists
        ];

        // Find the first valid date
        for (const dateField of dateFields) {
          if (dateField && dateField !== 'N/A' && dateField.trim() !== '') {
            return new Date(dateField);
          }
        }

        // If no valid date found, return a very old date to put it at the end
        return new Date('1900-01-01');
      };

      const dateA = getBookingDate(a);
      const dateB = getBookingDate(b);

      // Sort in descending order (latest first)
      return dateB - dateA;
    });
  };

  const handleUserTypeChange = (type) => {
    setUserType(type);
    setPhoneNumber('');
    setBookingId('');
    setAdminCredentials({ email: '', password: '' });
    setEmployeeCredentials({ email: '', password: '' });
    setError('');

    // Reset adminType when switching to customer
    if (type === 'user') {
      setAdminType('admin');
      setShowAdminDropdown(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAdminLoading(true);
    setError('');

    if (!adminCredentials.email || !adminCredentials.password) {
      setError('Please enter both email and password');
      setAdminLoading(false);
      return;
    }

    try {
      const response = await fetch('https://ai.senselensstudio.ae/webhook/password-validation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminCredentials)
      });

      const data = await response.json();

      if (data.status === "200") {
        onAdminLogin();
      } else {
        setError('Please enter correct information');
      }
    } catch (err) {
      setError('Please enter correct information');
    } finally {
      setAdminLoading(false);
    }
  };

  const handleEmployeeLogin = async (e) => {
    e.preventDefault();
    setEmployeeLoading(true);
    setError('');

    if (!employeeCredentials.email || !employeeCredentials.password) {
      setError('Please enter both email and password');
      setEmployeeLoading(false);
      return;
    }

    try {
      const response = await fetch('https://ai.senselensstudio.ae/webhook/password-validation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeCredentials)
      });

      const data = await response.json();

      if (data.status === "200") {
        onEmployeeLogin();
      } else {
        setError('Please enter correct information');
      }
    } catch (err) {
      setError('Please enter correct information');
    } finally {
      setAdminLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let requestBody = {};
    let isValid = false;

    if (searchType === 'phone') {
      const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');

      if (!cleanPhoneNumber || cleanPhoneNumber.length < 12) {
        setError('Please enter a valid 12-digit phone number');
        setLoading(false);
        return;
      }

      requestBody = {
        phone: cleanPhoneNumber,
        phoneNumber: cleanPhoneNumber
      };
      isValid = true;
    } else if (searchType === 'id') {
      if (!bookingId || bookingId.trim().length === 0) {
        setError('Please enter a valid booking ID');
        setLoading(false);
        return;
      }

      requestBody = {
        bookingId: bookingId.trim(),
        id: bookingId.trim()
      };
      isValid = true;
    }

    if (!isValid) {
      setError('Please provide valid search criteria');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('https://ai.senselensstudio.ae/webhook/website-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) throw new Error('Failed to fetch bookings');

      const data = await response.json();

      let bookingRecords = [];
      if (Array.isArray(data) && data.length > 0 && data[0].allRecords) {
        bookingRecords = data[0].allRecords;
      } else if (data.allRecords) {
        bookingRecords = data.allRecords;
      } else if (Array.isArray(data)) {
        bookingRecords = data;
      }

      const sortedBookings = sortBookingsByDate(bookingRecords);
      setBookings(sortedBookings);
      setShowModal(false);

    } catch (err) {
      setError('Failed to fetch bookings. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return amount ? `AED ${parseFloat(amount).toFixed(2)}` : 'N/A';
  };

  const resetSearch = () => {
    setShowModal(true);
    setBookings([]);
    setPhoneNumber('');
    setBookingId('');
    setSearchType('phone');
    setUserType('user');
    setAdminType('admin');
    setShowAdminDropdown(false);
    setAdminCredentials({ email: '', password: '' });
    setEmployeeCredentials({ email: '', password: '' });
    setError('');
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: `linear-gradient(135deg, 
          oklch(50% 0.085 224.283) 0%, 
          #959ea3 50%, 
          oklch(40% 0.095 234.283) 100%)`
      }}
    >
      {/* Search Modal - Made Responsive */}
      {showModal && (
        <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="w-full max-w-5xl bg-white rounded-2xl lg:rounded-3xl flex flex-col lg:flex-row overflow-hidden shadow-2xl max-h-[95vh] lg:h-[70vh] lg:min-h-[600px]">
            {/* Left Side - Form */}
            <div className="flex-1 p-4 sm:p-6 lg:p-12 flex flex-col justify-center bg-white overflow-y-auto">
              <div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6">
                  <button
                    type="button"
                    onClick={() => handleUserTypeChange('user')}
                    className={`flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl font-medium transition-all duration-300 text-sm sm:text-base relative overflow-hidden ${userType === 'user'
                      ? 'text-white shadow-lg transform scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    style={userType === 'user' ? { backgroundColor: '#959ea3' } : {}}
                  >
                    👤 Customer
                  </button>
                  <div className="relative flex-1">
                    <button
                      type="button"
                      onClick={() => setShowAdminDropdown(!showAdminDropdown)}
                      className={`w-full py-2 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl font-medium transition-all duration-300 text-sm sm:text-base relative overflow-hidden flex items-center justify-between ${(userType === 'admin' || userType === 'employee')
                        ? 'text-white shadow-lg transform scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      style={(userType === 'admin' || userType === 'employee') ? { backgroundColor: '#959ea3' } : {}}
                    >
                      <span>🔐 {userType === 'admin' ? 'Admin' : userType === 'employee' ? 'Employee' : 'Staff'}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {showAdminDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg sm:rounded-xl shadow-lg z-10">
                        <button
                          type="button"
                          onClick={() => {
                            setUserType('admin');
                            setShowAdminDropdown(false);
                          }}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 text-left hover:bg-gray-50 first:rounded-t-lg sm:first:rounded-t-xl transition-colors duration-200 text-sm sm:text-base"
                        >
                          🔐 Admin
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setUserType('employee');
                            setShowAdminDropdown(false);
                          }}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 text-left hover:bg-gray-50 last:rounded-b-lg sm:last:rounded-b-xl transition-colors duration-200 text-sm sm:text-base"
                        >
                          👤 Employee
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 sm:mb-3 leading-tight">
                  Welcome Back!
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-4 sm:mb-6 lg:mb-8">
                  {userType === 'admin'
                    ? 'Admin login to access dashboard'
                    : userType === 'employee'
                      ? 'Employee login to access employee portal'
                      : 'Search for your bookings using phone number or booking ID'}
                </p>

                {error && (
                  <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-300 text-red-800 px-3 sm:px-5 py-3 sm:py-4 rounded-lg sm:rounded-xl mb-4 sm:mb-6 text-xs sm:text-sm font-medium">
                    {error}
                  </div>
                )}

                {/* User Type Selector */}
                <div className="mb-4 sm:mb-6">
                  {userType === 'user' && (
                    <>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                        Search By
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                        <button
                          type="button"
                          onClick={() => handleSearchTypeChange('phone')}
                          className={`flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl font-medium transition-all duration-300 text-sm sm:text-base relative overflow-hidden ${searchType === 'phone'
                            ? 'text-white shadow-lg transform scale-105'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          style={searchType === 'phone' ? { backgroundColor: '#959ea3' } : {}}
                        >
                          📱 Phone Number
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSearchTypeChange('id')}
                          className={`flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl font-medium transition-all duration-300 text-sm sm:text-base relative overflow-hidden ${searchType === 'id'
                            ? 'text-white shadow-lg transform scale-105'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          style={searchType === 'id' ? { backgroundColor: '#959ea3' } : {}}
                        >
                          🎫 Booking ID
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Input Field */}
                <div className="mb-4 sm:mb-6 lg:mb-8">
                  {userType === 'admin' ? (
                    <>
                      <div className="mb-3 sm:mb-4">
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                          Admin Email
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            placeholder="Enter admin email"
                            value={adminCredentials.email}
                            onChange={(e) => setAdminCredentials({ ...adminCredentials, email: e.target.value })}
                            className="w-full pl-4 sm:pl-6 pr-12 sm:pr-16 py-3 sm:py-4 text-sm sm:text-base lg:text-lg border-2 border-gray-200 rounded-lg sm:rounded-2xl outline-none transition-all duration-300 bg-gray-50 focus:border-blue-400 focus:shadow-xl focus:bg-white focus:scale-[1.02]"
                          />
                          <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                          Admin Password
                        </label>
                        <div className="relative">
                          <input
                            type="password"
                            placeholder="Enter admin password"
                            value={adminCredentials.password}
                            onChange={(e) => setAdminCredentials({ ...adminCredentials, password: e.target.value })}
                            className="w-full pl-4 sm:pl-6 pr-12 sm:pr-16 py-3 sm:py-4 text-sm sm:text-base lg:text-lg border-2 border-gray-200 rounded-lg sm:rounded-2xl outline-none transition-all duration-300 bg-gray-50 focus:border-blue-400 focus:shadow-xl focus:bg-white focus:scale-[1.02]"
                          />
                          <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : userType === 'employee' ? (
                    <>
                      <div className="mb-3 sm:mb-4">
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                          Employee Email
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            placeholder="Enter employee email"
                            value={employeeCredentials.email}
                            onChange={(e) => setEmployeeCredentials({ ...employeeCredentials, email: e.target.value })}
                            className="w-full pl-4 sm:pl-6 pr-12 sm:pr-16 py-3 sm:py-4 text-sm sm:text-base lg:text-lg border-2 border-gray-200 rounded-lg sm:rounded-2xl outline-none transition-all duration-300 bg-gray-50 focus:border-blue-400 focus:shadow-xl focus:bg-white focus:scale-[1.02]"
                          />
                          <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                          Employee Password
                        </label>
                        <div className="relative">
                          <input
                            type="password"
                            placeholder="Enter employee password"
                            value={employeeCredentials.password}
                            onChange={(e) => setEmployeeCredentials({ ...employeeCredentials, password: e.target.value })}
                            className="w-full pl-4 sm:pl-6 pr-12 sm:pr-16 py-3 sm:py-4 text-sm sm:text-base lg:text-lg border-2 border-gray-200 rounded-lg sm:rounded-2xl outline-none transition-all duration-300 bg-gray-50 focus:border-blue-400 focus:shadow-xl focus:bg-white focus:scale-[1.02]"
                          />
                          <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : searchType === 'phone' ? (
                    <>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                        Phone Number
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          placeholder="971 XXX XXX XXX"
                          value={phoneNumber}
                          onChange={handlePhoneChange}
                          maxLength={15}
                          className="w-full pl-4 sm:pl-6 pr-12 sm:pr-16 py-3 sm:py-4 text-sm sm:text-base lg:text-lg border-2 border-gray-200 rounded-lg sm:rounded-2xl outline-none transition-all duration-300 bg-gray-50 focus:border-blue-400 focus:shadow-xl focus:bg-white focus:scale-[1.02]"
                        />
                        <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                        Booking ID
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Enter your booking ID"
                          value={bookingId}
                          onChange={(e) => setBookingId(e.target.value)}
                          className="w-full pl-4 sm:pl-6 pr-12 sm:pr-16 py-3 sm:py-4 text-sm sm:text-base lg:text-lg border-2 border-gray-200 rounded-lg sm:rounded-2xl outline-none transition-all duration-300 bg-gray-50 focus:border-blue-400 focus:shadow-xl focus:bg-white focus:scale-[1.02]"
                        />
                        <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={userType === 'admin' ? handleAdminLogin : userType === 'employee' ? handleEmployeeLogin : handleSubmit}
                  disabled={userType === 'admin' ? adminLoading : userType === 'employee' ? employeeLoading : loading}
                  className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-2xl text-white font-semibold text-sm sm:text-base lg:text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${(userType === 'admin' ? adminLoading : userType === 'employee' ? employeeLoading : loading)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'shadow-lg hover:-translate-y-1'
                    }`}
                  style={(userType === 'admin' ? adminLoading : userType === 'employee' ? employeeLoading : loading) ? {} : { backgroundColor: '#959ea3' }}
                >
                  {userType === 'admin' ? (
                    adminLoading ? (
                      <span className="flex items-center justify-center gap-2 sm:gap-3">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Logging in...
                      </span>
                    ) : 'Admin Login'
                  ) : userType === 'employee' ? (
                    employeeLoading ? (
                      <span className="flex items-center justify-center gap-2 sm:gap-3">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Logging in...
                      </span>
                    ) : 'Employee Login'
                  ) : (
                    loading ? (
                      <span className="flex items-center justify-center gap-2 sm:gap-3">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Finding Bookings...
                      </span>
                    ) : 'Find My Bookings'
                  )}
                </button>
              </div>
            </div>

            {/* Right Side - Visual (Hidden on mobile, visible on large screens) */}
            <div
              className="hidden lg:flex w-80 xl:w-96 items-center justify-center relative overflow-hidden"
              style={{ backgroundColor: '#959ea3' }}
            >
              <div className="text-center text-white p-6 xl:p-10 z-10">
                <div className="mb-6 xl:mb-8">
                  {userType === 'admin' ? (
                    <div className="relative">
                      <div className="w-40 h-20 xl:w-50 xl:h-25 mx-auto rounded-xl xl:rounded-2xl items-center justify-center mb-4 transform hover:scale-110 transition-all duration-300">
                        <img src="./logo.png" alt="" className="w-full h-full object-contain" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-4 h-4 xl:w-6 xl:h-6 bg-red-400 rounded-full animate-pulse"></div>
                      <div className="absolute -bottom-2 -left-2 w-3 h-3 xl:w-4 xl:h-4 bg-orange-300 rounded-full animate-bounce"></div>
                    </div>
                  ) : userType === 'employee' ? (
                    <div className="relative">
                      <div className="w-40 h-20 xl:w-50 xl:h-25 mx-auto rounded-xl xl:rounded-2xl items-center justify-center mb-4 transform hover:scale-110 transition-all duration-300">
                        <img src="./logo.png" alt="" className="w-full h-full object-contain" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-4 h-4 xl:w-6 xl:h-6 bg-blue-400 rounded-full animate-pulse"></div>
                      <div className="absolute -bottom-2 -left-2 w-3 h-3 xl:w-4 xl:h-4 bg-green-300 rounded-full animate-bounce"></div>
                    </div>
                  ) : searchType === 'phone' ? (
                    <div className="relative">
                      <div className="w-40 h-20 xl:w-50 xl:h-25 mx-auto rounded-xl xl:rounded-2xl items-center justify-center mb-4 transform hover:scale-110 transition-all duration-300">
                        <img src="./logo.png" alt="" className="w-full h-full object-contain" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-4 h-4 xl:w-6 xl:h-6 bg-green-400 rounded-full animate-pulse"></div>
                      <div className="absolute -bottom-2 -left-2 w-3 h-3 xl:w-4 xl:h-4 bg-blue-300 rounded-full animate-bounce"></div>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="w-40 h-20 xl:w-50 xl:h-25 mx-auto rounded-xl xl:rounded-2xl items-center justify-center mb-4 transform hover:scale-110 transition-all duration-300">
                        <img src="./logo.png" alt="" className="w-full h-full object-contain" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-4 h-4 xl:w-6 xl:h-6 bg-yellow-400 rounded-full animate-pulse"></div>
                      <div className="absolute -bottom-2 -left-2 w-3 h-3 xl:w-4 xl:h-4 bg-pink-300 rounded-full animate-bounce"></div>
                    </div>
                  )}
                </div>
                <h3 className="text-xl xl:text-2xl font-semibold mb-3 xl:mb-4">
                  {userType === 'admin'
                    ? 'Admin Access'
                    : userType === 'employee'
                      ? 'Employee Access'
                      : 'Your Bookings Await'}
                </h3>
                <p className="text-sm xl:text-base opacity-90 leading-relaxed">
                  {userType === 'admin'
                    ? 'Full admin portal access with edit permissions'
                    : userType === 'employee'
                      ? 'Employee access with view-only permissions'
                      : searchType === 'phone'
                        ? 'Quick and secure access with your phone number'
                        : 'Direct access with your booking ID'
                  }
                </p>
              </div>

              {/* Floating Elements */}
              <div className="absolute top-10 left-10 w-2 h-2 xl:w-3 xl:h-3 bg-white/30 rounded-full animate-ping"></div>
              <div className="absolute bottom-20 right-16 w-1.5 h-1.5 xl:w-2 xl:h-2 bg-white/40 rounded-full animate-pulse"></div>
              <div className="absolute top-32 right-8 w-3 h-3 xl:w-4 xl:h-4 bg-white/20 rounded-full animate-bounce"></div>
            </div>
          </div>
        </div>
      )}

      {/* Bookings Display - Made Responsive */}
      {bookings.length > 0 && !showModal && (
        <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-10 px-2 sm:px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 lg:mb-10 gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Your Bookings</h2>
                <p className="text-sm sm:text-base text-gray-600">Found {bookings.length} booking{bookings.length !== 1 ? 's' : ''}</p>
              </div>
              <button
                onClick={resetSearch}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-white rounded-lg sm:rounded-2xl font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-1 transform hover:scale-105 text-sm sm:text-base"
                style={{ backgroundColor: '#959ea3' }}
              >
                New Search
              </button>
            </div>

            {/* Bookings Grid */}
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              {bookings.map((booking, index) => (
                <div key={index} className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden shadow-lg border border-gray-200 hover:shadow-xl hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300">
                  {/* Card Header */}
                  <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0" style={{ backgroundColor: '#959ea3' }}>
                    <div>
                      <h4 className="text-white text-lg sm:text-xl font-semibold">
                        Booking #{booking['Booking ID']}
                      </h4>
                      <p className="text-white/80 text-xs sm:text-sm mt-1">
                        {booking['Service Name']}
                      </p>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 sm:p-6 lg:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-4 sm:mb-6">
                      <div>
                        <h6 className="text-gray-700 text-xs sm:text-sm font-semibold uppercase tracking-wide mb-3 sm:mb-4">
                          Customer Details
                        </h6>
                        <div className="space-y-1.5 sm:space-y-2">
                          <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                            <span className="text-gray-600 text-xs sm:text-sm font-medium sm:font-normal">Name:</span>
                            <span className="text-gray-900 text-xs sm:text-sm font-medium break-words">{booking['Customer Full Name'] || 'N/A'}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                            <span className="text-gray-600 text-xs sm:text-sm font-medium sm:font-normal">Email:</span>
                            <span className="text-gray-900 text-xs sm:text-sm font-medium break-all">{booking['Customer Email'] || 'N/A'}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                            <span className="text-gray-600 text-xs sm:text-sm font-medium sm:font-normal">Phone:</span>
                            <span className="text-gray-900 text-xs sm:text-sm font-medium">{booking['Customer Phone'] || 'N/A'}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                            <span className="text-gray-600 text-xs sm:text-sm font-medium sm:font-normal">Baby Name:</span>
                            <span className="text-gray-900 text-xs sm:text-sm font-medium">{booking['Baby Name'] || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h6 className="text-gray-700 text-xs sm:text-sm font-semibold uppercase tracking-wide mb-3 sm:mb-4">
                          Appointment Details
                        </h6>
                        <div className="space-y-1.5 sm:space-y-2">
                          <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                            <span className="text-gray-600 text-xs sm:text-sm font-medium sm:font-normal">Date:</span>
                            <span className="text-gray-900 text-xs sm:text-sm font-medium">{booking['Appointment Date'] || 'N/A'}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                            <span className="text-gray-600 text-xs sm:text-sm font-medium sm:font-normal">Time:</span>
                            <span className="text-gray-900 text-xs sm:text-sm font-medium">{booking['Appointment Time'] || 'N/A'}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                            <span className="text-gray-600 text-xs sm:text-sm font-medium sm:font-normal">Duration:</span>
                            <span className="text-gray-900 text-xs sm:text-sm font-medium">{booking['Appointment Duration'] || 'N/A'}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                            <span className="text-gray-600 text-xs sm:text-sm font-medium sm:font-normal">Stage:</span>
                            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold w-fit ${booking['Status'] === 'Booked'
                              ? 'bg-green-100 text-green-800'
                              : booking['Status'] === 'Pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : booking['Status'] === 'In Progress'
                                  ? 'bg-blue-100 text-blue-800'
                                  : booking['Status'] === 'Completed'
                                    ? 'bg-purple-100 text-purple-800'
                                    : booking['Status'] === 'Cancelled'
                                      ? 'bg-red-100 text-red-800'
                                      : booking['Status'] === 'Rescheduled'
                                        ? 'bg-orange-100 text-orange-800'
                                        : 'bg-green-100 text-green-800'
                              }`}>
                              {booking['Status'] || 'Pending'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 sm:p-6 rounded-lg sm:rounded-xl mt-4 sm:mt-6">
                      <h6 className="text-gray-700 text-xs sm:text-sm font-semibold uppercase tracking-wide mb-3 sm:mb-4">
                        Payment Summary
                      </h6>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <div className="text-center">
                          <div className="text-gray-600 text-xs mb-1">Total</div>
                          <div className="text-gray-900 text-sm sm:text-lg font-semibold">{formatCurrency(booking['Appointment Amount'])}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-600 text-xs mb-1">Deposit</div>
                          <div className="text-green-600 text-sm sm:text-lg font-semibold">{formatCurrency(booking['Deposit Amount'])}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-600 text-xs mb-1">Due</div>
                          <div className="text-red-600 text-sm sm:text-lg font-semibold">{formatCurrency(booking['Appointment Due Amount'])}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-600 text-xs mb-1">Discount</div>
                          <div className="text-purple-600 text-sm sm:text-lg font-semibold">{formatCurrency(booking['Discount Amount'])}</div>
                        </div>
                      </div>
                    </div>

                    {/* Customer Note */}
                    {booking['Customer Note'] && (
                      <div className="mt-4 sm:mt-6">
                        <h6 className="text-gray-700 text-xs sm:text-sm font-semibold mb-2 sm:mb-3">Customer Note</h6>
                        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200 text-xs sm:text-sm text-gray-700 leading-relaxed">
                          {booking['Customer Note']}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;