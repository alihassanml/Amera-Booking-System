import  { useState } from 'react';

function Home() {
  const [showModal, setShowModal] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [editingBooking, setEditingBooking] = useState(null);
  const [editForm, setEditForm] = useState({});

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
    
    if (!cleanPhoneNumber || cleanPhoneNumber.length < 12) {
      setError('Please enter a valid 12-digit phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://ai.senselensstudio.ae/webhook/website-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhoneNumber,
          phoneNumber: cleanPhoneNumber
        })
      });

      if (!response.ok) throw new Error('Failed to fetch bookings');

      const data = await response.json();
      
      sessionStorage.setItem('userPhone', cleanPhoneNumber);
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
      sessionStorage.setItem('bookingData', JSON.stringify(updatedBookings));
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      {/* Phone Number Input Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl h-[70vh] min-h-[500px] bg-white rounded-3xl flex overflow-hidden shadow-2xl">
            {/* Left Side - Form */}
            <div className="flex-1 p-12 flex flex-col justify-center bg-white">
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-3 leading-tight">
                  Welcome Back!
                </h1>
                <p className="text-lg text-gray-600 mb-10">
                  Enter your phone number to access your bookings
                </p>
                
                {error && (
                  <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-300 text-red-800 px-5 py-4 rounded-xl mb-6 text-sm font-medium">
                    {error}
                  </div>
                )}

                <div className="mb-8">
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
                      className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-full outline-none transition-all duration-300 bg-gray-50 focus:border-indigo-500 focus:shadow-lg focus:bg-white"
                    />
                    <div className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
                      📱
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`w-full py-4 px-6 rounded-full text-white font-semibold text-lg transition-all duration-300 ${
                    loading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 hover:shadow-xl hover:-translate-y-1'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Finding Bookings...
                    </span>
                  ) : 'Find My Bookings'}
                </button>
              </div>
            </div>

            {/* Right Side - Visual */}
            <div className="w-96 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center relative overflow-hidden">
              <div className="text-center text-white p-10 z-10">
                <div className="text-6xl mb-5 drop-shadow-lg">📅</div>
                <h3 className="text-2xl font-semibold mb-4">Your Bookings Await</h3>
                <p className="text-base opacity-90 leading-relaxed">
                  Quick and secure access to all your appointment details
                </p>
              </div>
              
              {/* Background Pattern */}
              <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-white/10 to-transparent rounded-full"></div>
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
                onClick={() => {
                  setShowModal(true);
                  setBookings([]);
                  setPhoneNumber('');
                }}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full font-medium transition-all duration-300 hover:from-indigo-600 hover:to-purple-700 hover:shadow-lg hover:-translate-y-1"
              >
                New Search
              </button>
            </div>

            {/* Bookings Grid */}
            <div className="space-y-8">
              {bookings.map((booking, index) => (
                <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-5 flex justify-between items-center">
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
                      className="bg-white text-indigo-600 px-5 py-2 rounded-full text-sm font-semibold hover:bg-gray-50 hover:scale-105 transition-all duration-300"
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
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              booking['Appointment Status'] === 'Approved' 
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
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-6 flex justify-between items-center">
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
                    onChange={(e) => setEditForm({...editForm, 'Customer Full Name': e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Baby Name</label>
                  <input
                    type="text"
                    value={editForm['Baby Name'] || ''}
                    onChange={(e) => setEditForm({...editForm, 'Baby Name': e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={editForm['Customer Email'] || ''}
                    onChange={(e) => setEditForm({...editForm, 'Customer Email': e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={editForm['Customer Phone'] || ''}
                    onChange={(e) => setEditForm({...editForm, 'Customer Phone': e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Appointment Date</label>
                  <input
                    type="text"
                    value={editForm['Appointment Date'] || ''}
                    onChange={(e) => setEditForm({...editForm, 'Appointment Date': e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Appointment Time</label>
                  <input
                    type="text"
                    value={editForm['Appointment Time'] || ''}
                    onChange={(e) => setEditForm({...editForm, 'Appointment Time': e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors duration-200"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
                  <input
                    type="text"
                    value={editForm['Date of Birth'] || ''}
                    onChange={(e) => setEditForm({...editForm, 'Date of Birth': e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors duration-200"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Customer Note</label>
                  <textarea
                    rows={4}
                    value={editForm['Customer Note'] || ''}
                    onChange={(e) => setEditForm({...editForm, 'Customer Note': e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors duration-200 resize-vertical"
                  />
                </div>
              </div>

              <div className="flex gap-4 justify-end mt-8">
                <button
                  onClick={() => { setEditingBooking(null); setEditForm({}); }}
                  className="px-6 py-3 bg-gray-500 text-white rounded-full font-medium hover:bg-gray-600 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSubmit}
                  disabled={loading}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                    loading 
                      ? 'bg-gray-400 text-white cursor-not-allowed' 
                      : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700'
                  }`}
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