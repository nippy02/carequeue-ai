import React, { useState } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import PatientForm from './components/PatientForm';
import QueueDashboard from './components/QueueDashboard';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import AnalyticsDashboard from './components/AnalyticsDashboard';

function App() {
  const [isAdmin, setIsAdmin] = useState(() => {
    return sessionStorage.getItem('carequeue_admin') === 'true';
  });

  const handleLogin = () => setIsAdmin(true);
  const handleLogout = () => {
    sessionStorage.removeItem('carequeue_admin');
    setIsAdmin(false);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="flex items-center space-x-2 text-xl font-bold text-blue-600 hover:text-blue-700">
                <span className="text-2xl">🏥</span>
                <span>CareQueue AI</span>
              </Link>
              <nav className="flex items-center space-x-4">
                <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Register
                </Link>
                <Link to="/queue" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Queue
                </Link>
                <Link to="/analytics" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Analytics
                </Link>
                {isAdmin ? (
                  <>
                    <Link to="/admin" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                      Admin
                    </Link>
                    <button 
                      onClick={handleLogout} 
                      className="text-red-600 hover:text-red-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link to="/admin" className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                    Staff Login
                  </Link>
                )}
              </nav>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<PatientForm />} />
            <Route path="/queue" element={<QueueDashboard />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="/admin" element={
              isAdmin ? (
                <AdminPanel onLogout={handleLogout} />
              ) : (
                <AdminLogin onLogin={handleLogin} />
              )
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <p className="text-center text-sm text-gray-600">
              CareQueue AI &copy; {new Date().getFullYear()} — Smart Clinic Triage & Queue Management
            </p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
