import { useState, useEffect } from 'react';

function Record({ onLogout, navigateTo, previousPage }) {
  const [recordsData, setRecordsData] = useState({
    today: [],
    slaAlerts: [],
    upcoming: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStage, setSelectedStage] = useState('Booked');
  const [filteredStageData, setFilteredStageData] = useState([]);

  const stages = [
    'Booked',
    'Photos sent for selection',
    'Photos selected',
    'Editing',
    'Edited photos sent',
    'Album layout sent',
    'Pending customer confirmation',
    'Sent for printing',
    'Ready for delivery',
    'Out for delivery',
    'Delivered'
  ];

  const slaRules = {
    'Photos sent for selection': { days: 1, description: 'Photos to be sent after photoshoot' },
    'Editing': { days: 14, description: 'Editing (after photos selection)' },
    'Album layout sent': { days: 2, description: 'Album layout creation' },
    'Sent for printing': { days: 8, description: 'Album printing' },
    'Pending customer confirmation': { days: null, description: 'Customer confirmation required' }
  };

  useEffect(() => {
    fetchRecordsData();
  }, []);

  useEffect(() => {
    if (selectedStage && recordsData) {
      // Filter all records by selected stage
      const allRecords = [
        ...(recordsData.today || []),
        ...(recordsData.slaAlerts || []),
        ...(recordsData.upcoming || [])
      ];
      const filtered = allRecords.filter(record => record.stage === selectedStage);
      setFilteredStageData(filtered);
    } else {
      setFilteredStageData([]);
    }
  }, [selectedStage, recordsData]);

  const fetchRecordsData = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://ai.senselensstudio.ae/webhook/c7d49769-4557-45be-8121-9c5d7ee52888');

      if (!response.ok) throw new Error('Failed to fetch records data');

      const data = await response.json();
      console.log('Raw Records data:', data);

      let records = { today: [], slaAlerts: [], upcoming: [] };

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

  const calculateDaysRemaining = (appointmentDate) => {
    if (!appointmentDate) return null;
    
    const today = new Date();
    const appointment = new Date(appointmentDate);
    const diffTime = appointment - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const calculateSLAStatus = (record) => {
    const stage = record.stage;
    const slaRule = slaRules[stage];
    
    if (!slaRule || !slaRule.days) {
      return {
        status: 'No SLA',
        message: slaRule?.description || 'No specific timeline',
        overdue: false
      };
    }

    // For demonstration, assuming we have a stage change date
    // In real implementation, you'd have actual dates for when stages changed
    const stageChangeDate = new Date(record.appointmentDate || record.stageChangeDate);
    const today = new Date();
    const daysPassed = Math.floor((today - stageChangeDate) / (1000 * 60 * 60 * 24));
    const daysRemaining = slaRule.days - daysPassed;

    return {
      status: daysRemaining > 0 ? 'On Track' : 'Overdue',
      daysPassed,
      daysRemaining: Math.abs(daysRemaining),
      message: slaRule.description,
      overdue: daysRemaining <= 0
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Function to get sorted upcoming bookings by days remaining
  const getSortedUpcomingBookings = () => {
    if (!recordsData?.upcoming || recordsData.upcoming.length === 0) {
      return [];
    }

    return recordsData.upcoming
      .map(record => ({
        ...record,
        daysRemaining: calculateDaysRemaining(record.appointmentDate)
      }))
      .sort((a, b) => {
        // Handle null values - put them at the end
        if (a.daysRemaining === null && b.daysRemaining === null) return 0;
        if (a.daysRemaining === null) return 1;
        if (b.daysRemaining === null) return -1;
        
        // Sort by days remaining (ascending - soonest first)
        return a.daysRemaining - b.daysRemaining;
      });
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

  const sortedUpcomingBookings = getSortedUpcomingBookings();

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
                style={{ backgroundColor: '#959ea3' }}
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

      <div className="max-w-7xl mx-auto px-3 py-6">
        {/* First Row: Three Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">

          {/* Today's Records Column */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-900">Today's Bookings</h2>
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
                    <p className="text-xs text-gray-800 font-medium mb-2">{record.stage}</p>
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
              <h2 className="text-lg font-bold text-gray-900">SLA Alerts</h2>
              <span className="ml-auto bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {recordsData?.slaAlerts?.length || 0}
              </span>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {recordsData?.slaAlerts && recordsData.slaAlerts.length > 0 ? (
                recordsData.slaAlerts.map((alert, index) => {
                  const slaStatus = calculateSLAStatus(alert);
                  return (
                    <div key={`alert-${index}`} className="bg-red-50 rounded-lg p-4 border border-red-200">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-semibold text-gray-900">{alert.name}</h4>
                        <span className="text-xs text-red-600 font-medium">#{alert.bookingId}</span>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{alert.email}</p>
                      <p className="text-xs text-gray-800 font-medium mb-2">{alert.serviceName}</p>
                      <p className="text-xs text-gray-800 font-medium mb-2">{alert.stage}</p>
                      
                      {/* SLA Status */}
                      <div className="bg-white rounded p-2 mb-2">
                        <p className="text-xs text-gray-700 font-medium">{slaStatus.message}</p>
                        {slaStatus.daysPassed !== undefined && (
                          <div className="flex justify-between text-xs mt-1">
                            <span className="text-gray-600">Days passed: {slaStatus.daysPassed}</span>
                            <span className={slaStatus.overdue ? 'text-red-600 font-medium' : 'text-green-600'}>
                              {slaStatus.overdue ? `Overdue by ${slaStatus.daysRemaining} days` : `${slaStatus.daysRemaining} days left`}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-xs text-red-700">{formatDate(alert.appointmentDate)}</p>
                    </div>
                  );
                })
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

          {/* Upcoming Records Column - Now Sorted by Days Remaining */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-900">Upcoming Bookings</h2>
              <span className="ml-auto bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {recordsData?.upcoming?.length || 0}
              </span>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {sortedUpcomingBookings.length > 0 ? (
                sortedUpcomingBookings.map((record, index) => (
                  <div key={`upcoming-${index}`} className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-sm font-semibold text-gray-900">{record.name}</h4>
                      <span className="text-xs text-green-600 font-medium">#{record.bookingId}</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{record.email}</p>
                    <p className="text-xs text-gray-800 font-medium mb-2">{record.serviceName}</p>
                    <p className="text-xs text-gray-800 font-medium mb-2">{record.stage}</p>
                    
                    {/* Days Remaining */}
                    {record.daysRemaining !== null && (
                      <div className="bg-white rounded p-2 mb-2">
                        <p className={`text-xs font-medium ${record.daysRemaining > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {record.daysRemaining > 0 ? `${record.daysRemaining} days remaining` : `${Math.abs(record.daysRemaining)} days overdue`}
                        </p>
                      </div>
                    )}
                    
                    <p className="text-xs text-green-700">{formatDate(record.appointmentDate)}</p>
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

        {/* Second Row: Full Width Filter Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Filter Records by Stage</h2>
            <span className="ml-auto bg-purple-100 text-purple-800 text-sm font-semibold px-3 py-1 rounded-full">
              {filteredStageData.length} Records
            </span>
          </div>
          
          {/* Dropdown */}
          <div className="mb-6">
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full max-w-md p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            >
              <option value="">Select a stage to filter...</option>
              {stages.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </div>

          {/* Filtered Results in Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredStageData.length > 0 ? (
              filteredStageData.map((record, index) => {
                const daysRemaining = calculateDaysRemaining(record.appointmentDate);
                const slaStatus = calculateSLAStatus(record);
                
                return (
                  <div key={`filtered-${index}`} className="bg-purple-50 rounded-lg p-4 border border-purple-200 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">{record.name}</h4>
                      <span className="text-xs text-purple-600 font-medium">#{record.bookingId}</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1 truncate">{record.email}</p>
                    <p className="text-xs text-gray-800 font-medium mb-2 truncate">{record.serviceName}</p>
                    
                    {/* Stage Badge */}
                    <div className="bg-purple-100 rounded px-2 py-1 mb-3">
                      <p className="text-xs text-purple-800 font-medium">{record.stage}</p>
                    </div>

                    {/* SLA & Days Info */}
                    <div className="bg-white rounded p-2 mb-2 space-y-1">
                      {slaStatus.daysPassed !== undefined && (
                        <div className="text-xs">
                          <span className="text-gray-600">SLA: </span>
                          <span className={slaStatus.overdue ? 'text-red-600 font-medium' : 'text-green-600'}>
                            {slaStatus.overdue ? `Overdue by ${slaStatus.daysRemaining}d` : `${slaStatus.daysRemaining}d left`}
                          </span>
                        </div>
                      )}
                      {daysRemaining !== null && (
                        <div className="text-xs">
                          <span className="text-gray-600">Appointment: </span>
                          <span className={daysRemaining > 0 ? 'text-green-600' : 'text-red-600'}>
                            {daysRemaining > 0 ? `${daysRemaining}d remaining` : `${Math.abs(daysRemaining)}d overdue`}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-xs text-purple-700">{formatDate(record.appointmentDate)}</p>
                  </div>
                );
              })
            ) : selectedStage ? (
              <div className="col-span-full text-center py-12">
                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-4 text-lg text-gray-500">No records found for "{selectedStage}"</p>
                <p className="text-sm text-gray-400">Try selecting a different stage</p>
              </div>
            ) : (
              <div className="col-span-full text-center py-12">
                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <p className="mt-4 text-lg text-gray-500">Select a stage to filter records</p>
                <p className="text-sm text-gray-400">Choose from the dropdown above to view records by stage</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Record;