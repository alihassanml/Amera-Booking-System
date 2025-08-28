import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

function Dashboard({ onLogout }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Clear any existing user session data when admin dashboard loads
    sessionStorage.removeItem('bookingData');
    sessionStorage.removeItem('userSearchData');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
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
            onClick={fetchDashboardData}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
                onClick={fetchDashboardData}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Refresh
              </button>
              <button
                onClick={onLogout}
                className="px-6 py-3 text-white rounded-lg font-medium transition-all duration-300 hover:shadow-lg transform hover:scale-105"
                style={{ backgroundColor: 'oklch(45% 0.085 224.283)' }}
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
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={getWorkflowData()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="status" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>


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