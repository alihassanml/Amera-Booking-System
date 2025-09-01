import { useState, useEffect } from 'react';

function Record({ onLogout, navigateTo, previousPage }) {
  const [recordsData, setRecordsData] = useState({
    today: [],
    slaAlerts: [],
    upcoming: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecordsData();
  }, []);

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
    } catch (err) {
      setError('Failed to load records data');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

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
            onClick={fetchRecordsData}
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
              <h1 className="text-3xl font-bold text-gray-900">Booking Records</h1>
              <p className="text-gray-600 mt-1">All booking records and details</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => navigateTo(previousPage)}
                className="px-6 py-3 text-white rounded-lg font-medium transition-all duration-300 hover:shadow-lg transform hover:scale-105"
                style={{ backgroundColor: 'oklch(45% 0.085 224.283)' }}
              >
                {previousPage === 'employee' ? 'Employee' : 'Dashboard'}
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

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

export default Record;