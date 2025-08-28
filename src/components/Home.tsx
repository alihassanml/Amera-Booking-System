import { useState, useEffect } from 'react';

function Home({ onAdminLogin }) {
  // Initialize state from sessionStorage
  const getInitialBookings = () => {
    try {
      const savedBookings = sessionStorage.getItem('bookingData');
      if (savedBookings) {
        const data = JSON.parse(savedBookings);
        let bookingRecords = [];
        if (Array.isArray(data) && data.length > 0 && data[0].allRecords) {
          bookingRecords = data[0].allRecords;
        } else if (data.allRecords) {
          bookingRecords = data.allRecords;
        } else if (Array.isArray(data)) {
          bookingRecords = data;
        }
        return bookingRecords;
      }
    } catch (error) {
      console.error('Error parsing saved bookings:', error);
    }
    return [];
  };

  const getInitialSearchData = () => {
    try {
      const savedSearchData = sessionStorage.getItem('userSearchData');
      if (savedSearchData) {
        return JSON.parse(savedSearchData);
      }
    } catch (error) {
      console.error('Error parsing saved search data:', error);
    }
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
  const [adminLoading, setAdminLoading] = useState(false);



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

  const handleUserTypeChange = (type) => {
    setUserType(type);
    setPhoneNumber('');
    setBookingId('');
    setAdminCredentials({ email: '', password: '' });
    setError('');
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
        // Admin login successful - navigate to dashboard
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

      // Save search criteria and booking data to sessionStorage
      const searchData = {
        searchType,
        phoneNumber,
        bookingId
      };
      sessionStorage.setItem('userSearchData', JSON.stringify(searchData));
      sessionStorage.setItem('bookingData', JSON.stringify(data));

      let bookingRecords = [];
      if (Array.isArray(data) && data.length > 0 && data[0].allRecords) {
        bookingRecords = data[0].allRecords;
      } else if (data.allRecords) {
        bookingRecords = data.allRecords;
      } else if (Array.isArray(data)) {
        bookingRecords = data;
      }

      setBookings(bookingRecords);
      setShowModal(false);

    } catch (err) {
      setError('Failed to fetch bookings. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (booking) => {
    setEditingBooking(booking);
    setEditForm({
      'Booking ID': booking['Booking ID'],
      'Customer Full Name': booking['Customer Full Name'],
      'Customer Email': booking['Customer Email'],
      'Customer Phone': booking['Customer Phone'],
      'Service Name': booking['Service Name'],
      'Appointment Date': booking['Appointment Date'],
      'Appointment Time': booking['Appointment Time'],
      'Customer Note': booking['Customer Note'] || '',
      'Baby Name': booking['Baby Name'] || '',
      'Date of Birth': booking['Date of Birth'] || '',
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://ai.senselensstudio.ae/webhook/edit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: editForm['Booking ID'],
          ...editForm
        })
      });

      if (!response.ok) throw new Error('Failed to update booking');

      const updatedBookings = bookings.map(booking => {
        if (booking['Booking ID'] === editForm['Booking ID']) {
          return { ...booking, ...editForm };
        }
        return booking;
      });

      setBookings(updatedBookings);
      // Update sessionStorage with new booking data
      // Get the original data structure and update it
      const currentData = JSON.parse(sessionStorage.getItem('bookingData') || '{}');
      let updatedData;

      if (Array.isArray(currentData) && currentData.length > 0 && currentData[0].allRecords) {
        updatedData = [{ ...currentData[0], allRecords: updatedBookings }];
      } else if (currentData.allRecords) {
        updatedData = { ...currentData, allRecords: updatedBookings };
      } else {
        updatedData = [{ allRecords: updatedBookings }];
      }

      sessionStorage.setItem('bookingData', JSON.stringify(updatedData));
      setEditingBooking(null);
      setEditForm({});
      setError('');

    } catch (err) {
      setError('Failed to update booking. Please try again.');
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
    setAdminCredentials({ email: '', password: '' });
    setError('');

    // Clear user session data (but keep admin session if logged in)
    sessionStorage.removeItem('bookingData');
    sessionStorage.removeItem('userSearchData');
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: `linear-gradient(135deg, 
          oklch(50% 0.085 224.283) 0%, 
          oklch(45% 0.085 224.283) 50%, 
          oklch(40% 0.095 234.283) 100%)`
      }}
    >
      {/* Search Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl h-[70vh] min-h-[600px] bg-white rounded-3xl flex overflow-hidden shadow-2xl">
            {/* Left Side - Form */}
            <div className="flex-1 p-12 flex flex-col justify-center bg-white">
              <div>
                <div className="flex gap-4 mb-6">
                  <button
                    type="button"
                    onClick={() => handleUserTypeChange('user')}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 relative overflow-hidden ${userType === 'user'
                      ? 'text-white shadow-lg transform scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    style={userType === 'user' ? { backgroundColor: 'oklch(45% 0.085 224.283)' } : {}}
                  >
                    👤 User
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUserTypeChange('admin')}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 relative overflow-hidden ${userType === 'admin'
                      ? 'text-white shadow-lg transform scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    style={userType === 'admin' ? { backgroundColor: 'oklch(45% 0.085 224.283)' } : {}}
                  >
                    🔐 Admin
                  </button>
                </div>
                <h1 className="text-4xl font-bold text-gray-800 mb-3 leading-tight">
                  Welcome Back!
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  {userType === 'admin' ? 'Admin login to access dashboard' : 'Search for your bookings using phone number or booking ID'}
                </p>

                {error && (
                  <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-300 text-red-800 px-5 py-4 rounded-xl mb-6 text-sm font-medium">
                    {error}
                  </div>
                )}

                {/* User Type Selector */}
                <div className="mb-6">


                  {userType === 'user' && (
                    <>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Search By
                      </label>
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => handleSearchTypeChange('phone')}
                          className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 relative overflow-hidden ${searchType === 'phone'
                            ? 'text-white shadow-lg transform scale-105'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          style={searchType === 'phone' ? { backgroundColor: 'oklch(45% 0.085 224.283)' } : {}}
                        >
                          📱 Phone Number
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSearchTypeChange('id')}
                          className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 relative overflow-hidden ${searchType === 'id'
                            ? 'text-white shadow-lg transform scale-105'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          style={searchType === 'id' ? { backgroundColor: 'oklch(45% 0.085 224.283)' } : {}}
                        >
                          🎫 Booking ID
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Input Field */}
                <div className="mb-8">
                  {userType === 'admin' ? (
                    <>
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Admin Email
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            placeholder="Enter admin email"
                            value={adminCredentials.email}
                            onChange={(e) => setAdminCredentials({ ...adminCredentials, email: e.target.value })}
                            className="w-full pl-6 pr-16 py-4 text-lg border-2 border-gray-200 rounded-2xl outline-none transition-all duration-300 bg-gray-50 focus:border-blue-400 focus:shadow-xl focus:bg-white focus:scale-[1.02]"
                          />
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Admin Password
                        </label>
                        <div className="relative">
                          <input
                            type="password"
                            placeholder="Enter admin password"
                            value={adminCredentials.password}
                            onChange={(e) => setAdminCredentials({ ...adminCredentials, password: e.target.value })}
                            className="w-full pl-6 pr-16 py-4 text-lg border-2 border-gray-200 rounded-2xl outline-none transition-all duration-300 bg-gray-50 focus:border-blue-400 focus:shadow-xl focus:bg-white focus:scale-[1.02]"
                          />
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : searchType === 'phone' ? (
                    <>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Phone Number
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          placeholder="971 XXX XXX XXX"
                          value={phoneNumber}
                          onChange={handlePhoneChange}
                          maxLength={15}
                          className="w-full pl-6 pr-16 py-4 text-lg border-2 border-gray-200 rounded-2xl outline-none transition-all duration-300 bg-gray-50 focus:border-blue-400 focus:shadow-xl focus:bg-white focus:scale-[1.02]"
                        />
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Booking ID
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Enter your booking ID"
                          value={bookingId}
                          onChange={(e) => setBookingId(e.target.value)}
                          className="w-full pl-6 pr-16 py-4 text-lg border-2 border-gray-200 rounded-2xl outline-none transition-all duration-300 bg-gray-50 focus:border-blue-400 focus:shadow-xl focus:bg-white focus:scale-[1.02]"
                        />
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={userType === 'admin' ? handleAdminLogin : handleSubmit}
                  disabled={userType === 'admin' ? adminLoading : loading}
                  className={`w-full py-4 px-6 rounded-2xl text-white font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${(userType === 'admin' ? adminLoading : loading)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'shadow-lg hover:-translate-y-1'
                    }`}
                  style={(userType === 'admin' ? adminLoading : loading) ? {} : { backgroundColor: 'oklch(45% 0.085 224.283)' }}
                >
                  {userType === 'admin' ? (
                    adminLoading ? (
                      <span className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Logging in...
                      </span>
                    ) : 'Admin Login'
                  ) : (
                    loading ? (
                      <span className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Finding Bookings...
                      </span>
                    ) : 'Find My Bookings'
                  )}
                </button>
              </div>
            </div>

            {/* Right Side - Visual */}
            <div
              className="w-96 flex items-center justify-center relative overflow-hidden"
              style={{ backgroundColor: 'oklch(45% 0.085 224.283)' }}
            >
              <div className="text-center text-white p-10 z-10">
                <div className="mb-8">
                  {userType === 'admin' ? (
                    <div className="relative">
                      <div className="w-24 h-24 mx-auto rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 transform hover:scale-110 transition-all duration-300">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-400 rounded-full animate-pulse"></div>
                      <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-orange-300 rounded-full animate-bounce"></div>
                    </div>
                  ) : searchType === 'phone' ? (
                    <div className="relative">
                      <div className="w-24 h-24 mx-auto rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 transform hover:scale-110 transition-all duration-300">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full animate-pulse"></div>
                      <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-300 rounded-full animate-bounce"></div>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="w-24 h-24 mx-auto rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 transform hover:scale-110 transition-all duration-300">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-pulse"></div>
                      <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-pink-300 rounded-full animate-bounce"></div>
                    </div>
                  )}
                </div>
                <h3 className="text-2xl font-semibold mb-4">
                  {userType === 'admin' ? 'Admin Access' : 'Your Bookings Await'}
                </h3>
                <p className="text-base opacity-90 leading-relaxed">
                  {userType === 'admin'
                    ? 'Secure admin portal access'
                    : searchType === 'phone'
                      ? 'Quick and secure access with your phone number'
                      : 'Direct access with your booking ID'
                  }
                </p>
              </div>

              {/* Floating Elements */}
              <div className="absolute top-10 left-10 w-3 h-3 bg-white/30 rounded-full animate-ping"></div>
              <div className="absolute bottom-20 right-16 w-2 h-2 bg-white/40 rounded-full animate-pulse"></div>
              <div className="absolute top-32 right-8 w-4 h-4 bg-white/20 rounded-full animate-bounce"></div>
            </div>
          </div>
        </div>
      )}

      {/* Bookings Display */}
      {bookings.length > 0 && !showModal && (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Bookings</h2>
                <p className="text-gray-600">Found {bookings.length} booking{bookings.length !== 1 ? 's' : ''}</p>
              </div>
              <button
                onClick={resetSearch}
                className="px-6 py-3 text-white rounded-2xl font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-1 transform hover:scale-105"
                style={{ backgroundColor: 'oklch(45% 0.085 224.283)' }}
              >
                New Search
              </button>
            </div>

            {/* Bookings Grid */}
            <div className="space-y-8">
              {bookings.map((booking, index) => (
                <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                  {/* Card Header */}
                  <div className="px-8 py-5 flex justify-between items-center" style={{ backgroundColor: 'oklch(45% 0.085 224.283)' }}>
                    <div>
                      <h4 className="text-white text-xl font-semibold">
                        Booking #{booking['Booking ID']}
                      </h4>
                      <p className="text-white/80 text-sm mt-1">
                        {booking['Service Name']}
                      </p>
                    </div>
                    <button
                      onClick={() => handleEdit(booking)}
                      className="bg-white px-5 py-2 rounded-2xl text-sm font-semibold hover:bg-gray-50 hover:scale-105 transition-all duration-300"
                      style={{ color: 'oklch(45% 0.085 224.283)' }}
                    >
                      Edit
                    </button>
                  </div>

                  {/* Card Content */}
                  <div className="p-8">
                    <div className="grid md:grid-cols-2 gap-8 mb-6">
                      <div>
                        <h6 className="text-gray-700 text-sm font-semibold uppercase tracking-wide mb-4">
                          Customer Details
                        </h6>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600 text-sm">Name:</span>
                            <span className="text-gray-900 text-sm font-medium">{booking['Customer Full Name'] || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 text-sm">Email:</span>
                            <span className="text-gray-900 text-sm font-medium">{booking['Customer Email'] || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 text-sm">Phone:</span>
                            <span className="text-gray-900 text-sm font-medium">{booking['Customer Phone'] || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 text-sm">Baby Name:</span>
                            <span className="text-gray-900 text-sm font-medium">{booking['Baby Name'] || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h6 className="text-gray-700 text-sm font-semibold uppercase tracking-wide mb-4">
                          Appointment Details
                        </h6>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600 text-sm">Date:</span>
                            <span className="text-gray-900 text-sm font-medium">{booking['Appointment Date'] || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 text-sm">Time:</span>
                            <span className="text-gray-900 text-sm font-medium">{booking['Appointment Time'] || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 text-sm">Duration:</span>
                            <span className="text-gray-900 text-sm font-medium">{booking['Appointment Duration'] || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 text-sm">Status:</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${booking['Appointment Status'] === 'Approved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                              }`}>
                              {booking['Appointment Status'] || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl mt-6">
                      <h6 className="text-gray-700 text-sm font-semibold uppercase tracking-wide mb-4">
                        Payment Summary
                      </h6>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-gray-600 text-xs mb-1">Total</div>
                          <div className="text-gray-900 text-lg font-semibold">{formatCurrency(booking['Appointment Amount'])}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-600 text-xs mb-1">Deposit</div>
                          <div className="text-green-600 text-lg font-semibold">{formatCurrency(booking['Deposit Amount'])}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-600 text-xs mb-1">Due</div>
                          <div className="text-red-600 text-lg font-semibold">{formatCurrency(booking['Appointment Due Amount'])}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-600 text-xs mb-1">Discount</div>
                          <div className="text-purple-600 text-lg font-semibold">{formatCurrency(booking['Discount Amount'])}</div>
                        </div>
                      </div>
                    </div>

                    {/* Customer Note */}
                    {booking['Customer Note'] && (
                      <div className="mt-6">
                        <h6 className="text-gray-700 text-sm font-semibold mb-3">Customer Note</h6>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-700 leading-relaxed">
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

      {/* Edit Modal */}
      {editingBooking && (
        <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl bg-white rounded-2xl max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="px-8 py-6 flex justify-between items-center" style={{ backgroundColor: 'oklch(45% 0.085 224.283)' }}>
              <h4 className="text-white text-xl font-semibold">
                Edit Booking #{editForm['Booking ID']}
              </h4>
              <button
                onClick={() => { setEditingBooking(null); setEditForm({}); }}
                className="bg-white/20 hover:bg-white/30 text-white rounded-full w-9 h-9 flex items-center justify-center text-lg transition-colors duration-200"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto max-h-[calc(90vh-88px)]">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 text-sm">
                  {error}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Customer Full Name</label>
                  <input
                    type="text"
                    value={editForm['Customer Full Name'] || ''}
                    onChange={(e) => setEditForm({ ...editForm, 'Customer Full Name': e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Baby Name</label>
                  <input
                    type="text"
                    value={editForm['Baby Name'] || ''}
                    onChange={(e) => setEditForm({ ...editForm, 'Baby Name': e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={editForm['Customer Email'] || ''}
                    onChange={(e) => setEditForm({ ...editForm, 'Customer Email': e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={editForm['Customer Phone'] || ''}
                    onChange={(e) => setEditForm({ ...editForm, 'Customer Phone': e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Appointment Date</label>
                  <input
                    type="text"
                    value={editForm['Appointment Date'] || ''}
                    onChange={(e) => setEditForm({ ...editForm, 'Appointment Date': e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Appointment Time</label>
                  <input
                    type="text"
                    value={editForm['Appointment Time'] || ''}
                    onChange={(e) => setEditForm({ ...editForm, 'Appointment Time': e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors duration-200"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
                  <input
                    type="text"
                    value={editForm['Date of Birth'] || ''}
                    onChange={(e) => setEditForm({ ...editForm, 'Date of Birth': e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors duration-200"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Customer Note</label>
                  <textarea
                    rows={4}
                    value={editForm['Customer Note'] || ''}
                    onChange={(e) => setEditForm({ ...editForm, 'Customer Note': e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors duration-200 resize-vertical"
                  />
                </div>
              </div>

              <div className="flex gap-4 justify-end mt-8">
                <button
                  onClick={() => { setEditingBooking(null); setEditForm({}); }}
                  className="px-6 py-3 bg-gray-500 text-white rounded-2xl font-medium hover:bg-gray-600 transition-colors duration-200 transform hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSubmit}
                  disabled={loading}
                  className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 transform hover:scale-105 ${loading
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'text-white hover:shadow-lg'
                    }`}
                  style={loading ? {} : { backgroundColor: 'oklch(45% 0.085 224.283)' }}
                >
                  {loading ? 'Updating...' : 'Update Booking'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;