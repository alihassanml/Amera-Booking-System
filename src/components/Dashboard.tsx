import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

function Dashboard({ onLogout }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [recordsData, setRecordsData] = useState({
    today: [],
    slaAlerts: [],
    upcoming: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentView, setCurrentView] = useState(() => {
  return localStorage.getItem("currentView") || "dashboard";
});
 // 'dashboard' or 'records'

  const changeView = (view) => {
  setCurrentView(view);
  localStorage.setItem("currentView", view);
};



  useEffect(() => {
    // Clear any existing user session data when admin dashboard loads
    // sessionStorage.removeItem('bookingData');
    // sessionStorage.removeItem('userSearchData');
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://ai.senselensstudio.ae/webhook/dashboard');

      if (!response.ok) throw new Error('Failed to fetch dashboard data');

      const data = await response.json();
      console.log('Raw Dashboard data:', data);

      if (data.allRecords?.length > 0) {
        setDashboardData(data.allRecords[0]);
      } else {
        setDashboardData(null);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecordsData = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://ai.senselensstudio.ae/webhook/c7d49769-4557-45be-8121-9c5d7ee52888');

      if (!response.ok) throw new Error('Failed to fetch records data');

      const data = await response.json();
      console.log('Raw Records data:', data);

      let records = { today: [], slaAlerts: [], upcoming: [] };

      // ✅ Case: API returns object with allRecords as array
      if (data.allRecords && Array.isArray(data.allRecords) && data.allRecords.length > 0) {
        records = data.allRecords[0];
      }

      console.log("Parsed records:", records);
      setRecordsData(records);
      setCurrentView('records');
    } catch (err) {
      setError('Failed to load records data');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };



  const formatCurrency = (amount) => {
    return `AED ${amount?.toLocaleString() || 0}`;
  };

  const formatPercentage = (value) => {
    return `${value}%`;
  };

  // Prepare data for charts
  const getLocationData = () => {
    if (!dashboardData?.bookingsPerLocation) return [];
    return Object.entries(dashboardData.bookingsPerLocation)
      .filter(([key]) => key !== '%location_name%')
      .map(([location, count]) => ({
        location: location.length > 20 ? location.substring(0, 20) + '...' : location,
        bookings: count
      }));
  };

  const getWorkflowData = () => {
    if (!dashboardData?.workflowStatusCount) return [];
    return Object.entries(dashboardData.workflowStatusCount).map(([status, count]) => ({
      status,
      count
    }));
  };

  const getBookingStatusData = () => {
    if (!dashboardData) return [];
    return [
      { name: 'In Progress', value: dashboardData.inProgress, color: '#3B82F6' },
      { name: 'Completed', value: dashboardData.completed, color: '#10B981' },
      { name: 'On Hold/Cancelled', value: dashboardData.onHoldCancelled, color: '#EF4444' },
      { name: 'Upcoming', value: dashboardData.upcomingBookings, color: '#F59E0B' }
    ].filter(item => item.value > 0);
  };

  const COLORS = ['#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899'];

  // Render Records Card
  const renderRecordCard = (record, index) => (
    <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-lg font-semibold text-gray-900">{record.name}</h4>
          <p className="text-blue-600 text-sm font-medium">ID: {record.bookingId}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">{record.appointmentDate}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm">Email:</span>
          <span className="text-gray-900 text-sm font-medium">{record.email}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm">Service:</span>
          <span className="text-gray-900 text-sm font-medium text-right">{record.serviceName}</span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <button
            onClick={currentView === 'dashboard' ? fetchDashboardData : fetchRecordsData}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Records View
  if (currentView === 'records' && recordsData) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Booking Records</h1>
                <p className="text-gray-600 mt-1">All booking records and details</p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="px-6 py-3 text-white rounded-lg font-medium transition-all duration-300 hover:shadow-lg transform hover:scale-105"
                  style={{ backgroundColor: 'oklch(45% 0.085 224.283)' }}
                >
                  Dashboard
                </button>
                <button
                  onClick={onLogout}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Three Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 ">

            {/* Today's Records Column */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Today's Bookings</h2>
                <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {recordsData?.today?.length || 0}
                </span>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {recordsData?.today && recordsData.today.length > 0 ? (
                  recordsData.today.map((record, index) => (
                    <div key={`today-${index}`} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-semibold text-gray-900">{record.name}</h4>
                        <span className="text-xs text-blue-600 font-medium">#{record.bookingId}</span>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{record.email}</p>
                      <p className="text-xs text-gray-800 font-medium mb-2">{record.serviceName}</p>
                      <p className="text-xs text-blue-700">{record.appointmentDate}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">No bookings for today</p>
                  </div>
                )}
              </div>
            </div>

            {/* SLA Alerts Column */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">SLA Alerts</h2>
                <span className="ml-auto bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {recordsData?.slaAlerts?.length || 0}
                </span>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {recordsData?.slaAlerts && recordsData.slaAlerts.length > 0 ? (
                  recordsData.slaAlerts.map((alert, index) => (
                    <div key={`alert-${index}`} className="bg-red-50 rounded-lg p-4 border border-red-200">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-semibold text-gray-900">{alert.name}</h4>
                        <span className="text-xs text-red-600 font-medium">#{alert.bookingId}</span>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{alert.email}</p>
                      <p className="text-xs text-gray-800 font-medium mb-2">{alert.serviceName}</p>
                      <p className="text-xs text-red-700">{alert.appointmentDate}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">No SLA alerts</p>
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Records Column */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Upcoming Bookings</h2>
                <span className="ml-auto bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {recordsData?.upcoming?.length || 0}
                </span>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {recordsData?.upcoming && recordsData.upcoming.length > 0 ? (
                  recordsData.upcoming.map((record, index) => (
                    <div key={`upcoming-${index}`} className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-semibold text-gray-900">{record.name}</h4>
                        <span className="text-xs text-green-600 font-medium">#{record.bookingId}</span>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{record.email}</p>
                      <p className="text-xs text-gray-800 font-medium mb-2">{record.serviceName}</p>
                      <p className="text-xs text-green-700">{record.appointmentDate}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">No upcoming bookings</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard View (Default)
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Business analytics and insights</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={fetchRecordsData}
                className="px-6 py-3 text-white rounded-lg font-medium transition-all duration-300 hover:shadow-lg transform hover:scale-105"
                style={{ backgroundColor: 'oklch(45% 0.085 224.283)' }}
              >
                Records
              </button>
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardData?.totalBookings || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Income</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{formatCurrency(dashboardData?.totalIncome)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Avg Booking Value</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{formatCurrency(dashboardData?.avgBookingValue)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Today's Bookings</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{dashboardData?.todayBookings || 0}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Bookings</h3>
            <div className="text-4xl font-bold text-blue-600">{dashboardData?.upcomingBookings || 0}</div>
            <p className="text-gray-500 text-sm mt-2">Scheduled appointments</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Bookings with Extras</h3>
            <div className="text-4xl font-bold text-indigo-600">{dashboardData?.bookingsWithExtras || 0}</div>
            <p className="text-gray-500 text-sm mt-2">Additional services</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">SLA Alerts</h3>
            <div className="text-4xl font-bold text-red-600">{dashboardData?.slaAlerts?.length || 0}</div>
            <p className="text-gray-500 text-sm mt-2">Active alerts</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Bookings by Location */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Bookings by Location</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getLocationData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="location" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bookings" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Booking Status Distribution */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Booking Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getBookingStatusData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getBookingStatusData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Workflow Status Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Workflow Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getWorkflowData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Payment Methods</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Cash Income</span>
                <span className="text-lg font-semibold text-green-600">{formatCurrency(dashboardData?.cashIncome)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">POS Income</span>
                <span className="text-lg font-semibold text-blue-600">{formatCurrency(dashboardData?.posIncome)}</span>
              </div>
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-800 font-semibold">Total Income</span>
                  <span className="text-xl font-bold text-gray-900">{formatCurrency(dashboardData?.totalIncome)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Business Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Discount</span>
                <span className="text-lg font-semibold text-purple-600">{formatPercentage(dashboardData?.avgDiscountPercentage)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Conversion Rate</span>
                <span className="text-lg font-semibold text-indigo-600">
                  {dashboardData ? Math.round((dashboardData.completed / dashboardData.totalBookings) * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Bookings with Extras</span>
                <span className="text-lg font-semibold text-orange-600">
                  {dashboardData ? Math.round((dashboardData.bookingsWithExtras / dashboardData.totalBookings) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;