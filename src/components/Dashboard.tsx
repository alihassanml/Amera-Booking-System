function Dashboard({ onLogout }) {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h2>
            <p className="text-gray-600">Welcome to the admin panel</p>
          </div>
          <button
            onClick={onLogout}
            className="px-6 py-3 text-white rounded-2xl font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-1 transform hover:scale-105"
            style={{backgroundColor: 'oklch(45% 0.085 224.283)'}}
          >
            Logout
          </button>
        </div>
        
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Admin Features</h3>
          <p className="text-gray-600">You have successfully logged in as an admin. Add your admin-specific features here.</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;