import { useState } from 'react';

function Employ({ onLogout, navigateTo }) {
  const [searchType, setSearchType] = useState('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [editingBooking, setEditingBooking] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showRecords, setShowRecords] = useState(false);

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

      setBookings(bookingRecords);

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
      'Customer Full Name': booking['Customer Full Name'] || booking['Customer First Name'] || '',
      'Customer Email': booking['Customer Email'],
      'Customer Phone': booking['Customer Phone'],
      'Service Name': booking['Service Name'],
      'Appointment Date': booking['Appointment Date'],
      'Appointment Time': booking['Appointment Time'],
      'Customer Note': booking['Customer Note'] || '',
      'Status': booking['Status'] || 'Booked',
      'Baby Name': booking['Baby Name'] || '',
      'Date of Birth': booking['Date of Birth'] || '',
      'Project Stage': booking['Project Stage'] || '',
      'Photographer': booking['Photographer'] || '',
      'Editor': booking['Editor'] || '',
      // New fields
      'Album': booking['Album'] || '',
      'Video': booking['Video'] || '',
      'RAW Photos to be sent': booking['RAW Photos to be sent'] || '',
      'Number of Photos': booking['Number of Photos'] || '',
      'Theme number': booking['Theme number'] || '',
      'Cake': booking['Cake'] || '',
      'Cake details': booking['Cake details'] || '',
      'Pixieset File Name': booking['Pixieset File Name'] || '',
      'Pixieset Password': booking['Pixieset Password'] || '',
      'Delivery Location': booking['Delivery Location'] || '',
      'Delivery method': booking['Delivery method'] || ''
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

  const clearSearch = () => {
    setBookings([]);
    setPhoneNumber('');
    setBookingId('');
    setSearchType('phone');
    setError('');
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: `linear-gradient(135deg, 
          `
      }}
    >
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Employee Dashboard</h1>
              <p className="text-gray-600 mt-1">Search and manage booking records</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => navigateTo('records')}
                className="px-6 py-3 text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg transform hover:scale-105"
                style={{ backgroundColor: 'oklch(45% 0.085 224.283)' }}
              >
                Records
              </button>
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-8 py-6  text-white  border-b border-gray-100" style={{ backgroundColor: 'oklch(45% 0.085 224.283)' }}>
            <h2 className="text-2xl font-bold  mb-2">Search Bookings</h2>
            <p className="">Find customer bookings by phone number or booking ID</p>
          </div>

          <div className="p-8">
            {error && (
              <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-300 text-red-800 px-5 py-4 rounded-xl mb-6 text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Search Type Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Search By</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => handleSearchTypeChange('phone')}
                    className={`flex-1 py-4 px-6 rounded-2xl font-medium transition-all duration-300 relative overflow-hidden ${searchType === 'phone'
                      ? 'text-white shadow-lg transform scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    style={searchType === 'phone' ? { backgroundColor: 'oklch(45% 0.085 224.283)' } : {}}
                  >
                    Phone Number
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSearchTypeChange('id')}
                    className={`flex-1 py-4 px-6 rounded-2xl font-medium transition-all duration-300 relative overflow-hidden ${searchType === 'id'
                      ? 'text-white shadow-lg transform scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    style={searchType === 'id' ? { backgroundColor: 'oklch(45% 0.085 224.283)' } : {}}
                  >
                    Booking ID
                  </button>
                </div>
              </div>

              {/* Search Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  {searchType === 'phone' ? 'Phone Number' : 'Booking ID'}
                </label>
                <div className="flex space-x-4">
                  <div className="flex-1 relative">
                    {searchType === 'phone' ? (
                      <input
                        type="tel"
                        placeholder="971 XXX XXX XXX"
                        value={phoneNumber}
                        onChange={handlePhoneChange}
                        maxLength={15}
                        className="w-full pl-6 pr-6 py-4 text-lg border-2 border-gray-200 rounded-2xl outline-none transition-all duration-300 bg-gray-50 focus:border-blue-400 focus:shadow-xl focus:bg-white focus:scale-[1.02]"
                      />
                    ) : (
                      <input
                        type="text"
                        placeholder="Enter booking ID"
                        value={bookingId}
                        onChange={(e) => setBookingId(e.target.value)}
                        className="w-full pl-6 pr-6 py-4 text-lg border-2 border-gray-200 rounded-2xl outline-none transition-all duration-300 bg-gray-50 focus:border-blue-400 focus:shadow-xl focus:bg-white focus:scale-[1.02]"
                      />
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-8 py-4 rounded-2xl text-white font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${loading ? 'bg-gray-400 cursor-not-allowed' : 'shadow-lg hover:-translate-y-1'
                      }`}
                    style={loading ? {} : { backgroundColor: 'oklch(45% 0.085 224.283)' }}
                  >
                    {loading ? (
                      <span className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Searching...
                      </span>
                    ) : (
                      'Search'
                    )}
                  </button>

                  {bookings.length > 0 && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="px-6 py-4 bg-gray-500 text-white font-medium rounded-2xl hover:bg-gray-600 transition-all duration-300 hover:shadow-lg transform hover:scale-105"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Results */}
      {/* Results Section - Replace your existing results section with this */}
      {bookings.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 pb-8">
          <div className="space-y-8">
            {bookings.map((booking, index) => (
              <div key={index} className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                {/* Card Header */}
                <div
                  className="px-8 py-6 flex justify-between items-center"
                  style={{ backgroundColor: 'oklch(45% 0.085 224.283)' }}
                >
                  <div>
                    <h4 className="text-white text-xl font-bold">
                      Booking #{booking['Booking ID'] || 'N/A'}
                    </h4>
                    <p className="text-white/80 text-sm mt-1">
                      {booking['Service Name'] || 'N/A'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleEdit(booking)}
                    className="bg-white px-6 py-3 rounded-2xl text-sm font-semibold hover:bg-gray-50 hover:scale-105 transition-all duration-300 shadow-lg"
                    style={{ color: 'oklch(45% 0.085 224.283)' }}
                  >
                    Edit Booking
                  </button>
                </div>

                {/* Card Content */}
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                    {/* Customer Information */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                      <h5 className="font-bold text-gray-900 mb-4 text-lg">Customer Information</h5>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">Full Name:</span>
                          <span className="font-semibold text-gray-900">{booking['Customer Full Name'] || booking['Customer First Name'] || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">Email:</span>
                          <span className="font-semibold text-gray-900 text-xs">{booking['Customer Email'] || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">Phone:</span>
                          <span className="font-semibold text-gray-900">{booking['Customer Phone'] || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">Baby Name:</span>
                          <span className="font-semibold text-gray-900">{booking['Baby Name'] || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">Baby's Age:</span>
                          <span className="font-semibold text-gray-900">{booking["Baby's Age"] || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">Date of Birth:</span>
                          <span className="font-semibold text-gray-900">{booking['Date of Birth'] || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">Social Media Consent:</span>
                          <span className="font-semibold text-gray-900 text-xs">{booking['Consent for Social Media'] || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Service Information */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
                      <h5 className="font-bold text-gray-900 mb-4 text-lg">Service Details</h5>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">Service Name:</span>
                          <span className="font-semibold text-gray-900 text-xs">{booking['Service Name'] || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">Category:</span>
                          <span className="font-semibold text-gray-900">{booking['Category Name'] || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">Service Amount:</span>
                          <span className="font-bold text-gray-900">{formatCurrency(booking['Service Amount'])}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">Duration:</span>
                          <span className="font-semibold text-gray-900">{booking['Service Duration'] || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">Extras:</span>
                          <span className="font-semibold text-gray-900 text-xs">{booking['Service Extras'] || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Appointment Details */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
                      <h5 className="font-bold text-gray-900 mb-4 text-lg">Appointment Details</h5>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">Date:</span>
                          <span className="font-semibold text-gray-900">{booking['Appointment Date'] || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">Time:</span>
                          <span className="font-semibold text-gray-900 text-xs">{booking['Appointment Time'] || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">Duration:</span>
                          <span className="font-semibold text-gray-900">{booking['Appointment Duration'] || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">Status:</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${booking['Appointment Status'] === 'Approved' ? 'bg-green-100 text-green-800' :
                            booking['Appointment Status'] === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                            {booking['Appointment Status'] || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">Location:</span>
                          <span className="font-semibold text-gray-900 text-xs">{booking['Location Name'] || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">Photoshoot Location:</span>
                          <span className="font-semibold text-gray-900">{booking['Photoshoot Location'] || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Information */}
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-2xl border border-orange-100">
                      <h5 className="font-bold text-gray-900 mb-4 text-lg">Payment Details</h5>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">Total Amount:</span>
                          <span className="font-bold text-gray-900">{formatCurrency(booking['Appointment Amount'])}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">Deposit:</span>
                          <span className="font-bold text-green-600">{formatCurrency(booking['Deposit Amount'])}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">Due Amount:</span>
                          <span className="font-bold text-red-600">{formatCurrency(booking['Appointment Due Amount'])}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">Tax Amount:</span>
                          <span className="font-bold text-gray-900">{formatCurrency(booking['Tax Amount'])}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">Discount:</span>
                          <span className="font-bold text-purple-600">{formatCurrency(booking['Discount Amount'])}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">Coupon:</span>
                          <span className="font-semibold text-gray-900">{booking['Coupon Code'] || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">Total with Tax:</span>
                          <span className="font-bold text-gray-900">{formatCurrency(booking['Total with tax'])}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">Price after Discount:</span>
                          <span className="font-bold text-gray-900">{formatCurrency(booking['Price after discount'])}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">Discount %:</span>
                          <span className="font-semibold text-gray-900">{booking['Discount Percentage'] || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {/* E-commerce & Payment Tracking */}
                    <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-6 rounded-2xl border border-teal-100">
                      <h5 className="font-bold text-gray-900 mb-4 text-lg">E-commerce & Payments</h5>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">WooCommerce Order:</span>
                          <span className="font-semibold text-gray-900 text-xs">{booking['WooCommerce Order No.'] || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">WooCommerce Payment:</span>
                          <span className="font-bold text-green-600">{formatCurrency(booking['WooCommerce Payment'])}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">Online Payment Date:</span>
                          <span className="font-semibold text-gray-900">{booking['Online Payment Date'] || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">Invoice (Zoho):</span>
                          <span className="font-semibold text-gray-900">{booking['Invoice (Zoho ID)'] || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">Paid in Cash:</span>
                          <span className="font-semibold text-gray-900">{booking['Paid in cash'] || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">Paid by POS:</span>
                          <span className="font-semibold text-gray-900">{booking['Paid by POS'] || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">POS Reference:</span>
                          <span className="font-semibold text-gray-900 text-xs">{booking['POS reference / receipt #'] || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Production Team & Content */}
                    <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-6 rounded-2xl border border-rose-100">
                      <h5 className="font-bold text-gray-900 mb-4 text-lg">Production Team</h5>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">Photographer:</span>
                          <span className="font-semibold text-gray-900">{booking['Photographer'] || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">Editor:</span>
                          <span className="font-semibold text-gray-900">{booking['Editor'] || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">Video:</span>
                          <span className="font-semibold text-gray-900">{booking['Video'] || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">RAW Photos:</span>
                          <span className="font-semibold text-gray-900">{booking['RAW Photos to be sent'] || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">Number of Photos:</span>
                          <span className="font-semibold text-gray-900">{booking['Number of Photos'] || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">Theme:</span>
                          <span className="font-semibold text-gray-900">{booking['Theme number'] || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">Cake:</span>
                          <span className="font-semibold text-gray-900">{booking['Cake'] || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">Cake Details:</span>
                          <span className="font-semibold text-gray-900">{booking['Cake details'] || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Second Row - Project Status & Delivery */}
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Project Status & Stage */}
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-2xl border border-indigo-100">
                      <h5 className="font-bold text-gray-900 mb-4 text-lg">Project Status</h5>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">Status:</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${booking['Status'] === 'Booked' ? 'bg-green-100 text-green-800' :
                            booking['Status'] === 'Photos sent for selection' ? 'bg-blue-100 text-blue-800' :
                              booking['Status'] === 'Photos selected' ? 'bg-purple-100 text-purple-800' :
                                booking['Status'] === 'Editing' ? 'bg-yellow-100 text-yellow-800' :
                                  booking['Status'] === 'Delivered' ? 'bg-green-100 text-green-800' :
                                    'bg-gray-100 text-gray-800'
                            }`}>
                            {booking['Status'] || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">Project Stage:</span>
                          <span className="font-semibold text-gray-900">{booking['Project Stage'] || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">Row Number:</span>
                          <span className="font-semibold text-gray-900">{booking['row_number'] || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Delivery & File Management */}
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-100">
                      <h5 className="font-bold text-gray-900 mb-4 text-lg">Delivery & Files</h5>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">Delivery Method:</span>
                          <span className="font-semibold text-gray-900">{booking['Delivery method'] || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">Delivery Location:</span>
                          <span className="font-semibold text-gray-900 text-xs">{booking['Delivery Location'] || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">Pixieset File:</span>
                          <span className="font-semibold text-gray-900">{booking['Pixieset File Name'] || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">Pixieset Password:</span>
                          <span className="font-semibold text-gray-900">{booking['Pixieset Password'] || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes Section */}
                  {(booking['Customer Note'] || booking['Additional studio notes']) && (
                    <div className="mt-8 bg-gradient-to-br from-gray-50 to-slate-50 p-6 rounded-2xl border border-gray-200">
                      <h5 className="font-bold text-gray-900 mb-4 text-lg">Notes & Comments</h5>
                      <div className="space-y-4">
                        {booking['Customer Note'] && (
                          <div>
                            <span className="text-sm font-bold text-gray-700 block mb-2">Customer Note:</span>
                            <div className="bg-white p-4 rounded-xl border border-gray-200 text-sm text-gray-800 leading-relaxed shadow-sm">
                              {booking['Customer Note']}
                            </div>
                          </div>
                        )}
                        {booking['Additional studio notes'] && (
                          <div>
                            <span className="text-sm font-bold text-gray-700 block mb-2">Studio Notes:</span>
                            <div className="bg-white p-4 rounded-xl border border-gray-200 text-sm text-gray-800 leading-relaxed shadow-sm">
                              {booking['Additional studio notes']}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl bg-white rounded-3xl max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div
              className="px-8 py-6 flex justify-between items-center"
              style={{ backgroundColor: 'oklch(45% 0.085 224.283)' }}
            >
              <div>
                <h4 className="text-white text-xl font-bold">
                  Edit Booking #{editForm['Booking ID']}
                </h4>
                <p className="text-white/80 text-sm mt-1">Update booking information</p>
              </div>
              <button
                onClick={() => { setEditingBooking(null); setEditForm({}); }}
                className="text-white hover:bg-white/20 rounded-xl p-3 transition-colors duration-200 text-lg font-bold"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto max-h-[calc(90vh-140px)]">
              <form onSubmit={handleEditSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Existing Fields */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Customer Full Name</label>
                    <input
                      type="text"
                      value={editForm['Customer Full Name'] || ''}
                      onChange={(e) => setEditForm({ ...editForm, 'Customer Full Name': e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Baby Name</label>
                    <input
                      type="text"
                      value={editForm['Baby Name'] || ''}
                      onChange={(e) => setEditForm({ ...editForm, 'Baby Name': e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Email</label>
                    <input
                      type="email"
                      value={editForm['Customer Email'] || ''}
                      onChange={(e) => setEditForm({ ...editForm, 'Customer Email': e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Phone</label>
                    <input
                      type="tel"
                      value={editForm['Customer Phone'] || ''}
                      onChange={(e) => setEditForm({ ...editForm, 'Customer Phone': e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Appointment Date</label>
                    <input
                      type="text"
                      value={editForm['Appointment Date'] || ''}
                      onChange={(e) => setEditForm({ ...editForm, 'Appointment Date': e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Appointment Time</label>
                    <input
                      type="text"
                      value={editForm['Appointment Time'] || ''}
                      onChange={(e) => setEditForm({ ...editForm, 'Appointment Time': e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Date of Birth</label>
                    <input
                      type="text"
                      value={editForm['Date of Birth'] || ''}
                      onChange={(e) => setEditForm({ ...editForm, 'Date of Birth': e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Status</label>
                    <select
                      value={editForm['Status'] || 'Booked'}
                      onChange={(e) => setEditForm({ ...editForm, 'Status': e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="Booked">Booked</option>
                      <option value="Photos sent for selection">Photos sent for selection</option>
                      <option value="Photos selected">Photos selected</option>
                      <option value="Editing">Editing</option>
                      <option value="Edited photos sent">Edited photos sent</option>
                      <option value="Album layout sent">Album layout sent</option>
                      <option value="Pending customer confirmation">Pending customer confirmation</option>
                      <option value="Sent for printing">Sent for printing</option>
                      <option value="Ready for delivery">Ready for delivery</option>
                      <option value="Out for delivery">Out for delivery</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Project Stage</label>
                    <select
                      value={editForm['Project Stage'] || ''}
                      onChange={(e) => setEditForm({ ...editForm, 'Project Stage': e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select project stage...</option>
                      <option value="Open">Open</option>
                      <option value="Close">Close</option>
                      <option value="In progress">In progress</option>
                      <option value="On hold">On hold</option>
                      <option value="Cancel">Cancel</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Photographer</label>
                    <select
                      value={editForm['Photographer'] || ''}
                      onChange={(e) => setEditForm({ ...editForm, 'Photographer': e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select photographer...</option>
                      <option value="Thezza">Thezza</option>
                      <option value="Jovie">Jovie</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Editor</label>
                    <select
                      value={editForm['Editor'] || ''}
                      onChange={(e) => setEditForm({ ...editForm, 'Editor': e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select editor...</option>
                      <option value="Thezza">Thezza</option>
                      <option value="Jovie">Jovie</option>
                    </select>
                  </div>

                  {/* NEW FIELDS START HERE */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Album</label>
                    <select
                      value={editForm['Album'] || ''}
                      onChange={(e) => setEditForm({ ...editForm, 'Album': e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select album...</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Video</label>
                    <select
                      value={editForm['Video'] || ''}
                      onChange={(e) => setEditForm({ ...editForm, 'Video': e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select video...</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">RAW Photos to be sent</label>
                    <select
                      value={editForm['RAW Photos to be sent'] || ''}
                      onChange={(e) => setEditForm({ ...editForm, 'RAW Photos to be sent': e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select Photo Sent...</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Number of Photos</label>
                    <input
                      type="text"
                      value={editForm['Number of Photos'] || ''}
                      onChange={(e) => setEditForm({ ...editForm, 'Number of Photos': e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Theme</label>
                    <input
                      type="text"
                      value={editForm['Theme number'] || ''}
                      onChange={(e) => setEditForm({ ...editForm, 'Theme number': e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Cake</label>
                    <select
                      value={editForm['Cake'] || ''}
                      onChange={(e) => setEditForm({ ...editForm, 'Cake': e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select cake...</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Cake Details</label>
                    <input
                      type="text"
                      value={editForm['Cake details'] || ''}
                      onChange={(e) => setEditForm({ ...editForm, 'Cake details': e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Pixieset File Name</label>
                    <input
                      type="text"
                      value={editForm['Pixieset File Name'] || ''}
                      onChange={(e) => setEditForm({ ...editForm, 'Pixieset File Name': e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Pixieset Password</label>
                    <input
                      type="text"
                      value={editForm['Pixieset Password'] || ''}
                      onChange={(e) => setEditForm({ ...editForm, 'Pixieset Password': e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                    <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Delivery Method</label>
                    <select
                      value={editForm['Delivery method'] || ''}
                      onChange={(e) => setEditForm({ ...editForm, 'Delivery method': e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select Delivery Method ...</option>
                      <option value="Pickup">Pickup</option>
                      <option value="Delivery">Delivery</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Delivery Location</label>
                    <input
                      type="text"
                      value={editForm['Delivery Location'] || ''}
                      onChange={(e) => setEditForm({ ...editForm, 'Delivery Location': e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-3">Customer Note</label>
                    <textarea
                      rows={4}
                      value={editForm['Customer Note'] || ''}
                      onChange={(e) => setEditForm({ ...editForm, 'Customer Note': e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-vertical"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 mt-8">
                  <button
                    type="button"
                    onClick={() => { setEditingBooking(null); setEditForm({}); }}
                    className="px-6 py-3 bg-gray-500 text-white font-medium rounded-2xl hover:bg-gray-600 transition-colors duration-200 transform hover:scale-105"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 transform hover:scale-105 ${loading ? 'bg-gray-400 text-white cursor-not-allowed' : 'text-white hover:shadow-lg'
                      }`}
                    style={loading ? {} : { backgroundColor: 'oklch(45% 0.085 224.283)' }}
                  >
                    {loading ? 'Updating...' : 'Update Booking'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Employ;