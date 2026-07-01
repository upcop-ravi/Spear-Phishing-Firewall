import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import SecureQRVerification from './pages/SecureQRVerification';
import Login from './pages/Login';
import Register from './pages/Register';
import { initVisitorSession } from './utils/visitorLogger';

// Load i18n configuration
import './i18n/config';

function App() {
  // Authentication check for dashboard routing (in production, integrate Supabase session)
  const isAuthenticated = true; // Set to true to allow dashboard viewing

  useEffect(() => {
    initVisitorSession();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <Routes>
          {/* Public Portal Landing */}
          <Route path="/" element={<Home />} />
          
          {/* Secure QR Verification */}
          <Route path="/verify/:hotel_id" element={<SecureQRVerification />} />
          
          {/* Login Gate */}
          <Route path="/login" element={<Login />} />
          
          {/* Property Registration */}
          <Route path="/register" element={<Register />} />
          
          {/* Protected Analytics & Management Dashboard */}
          <Route 
            path="/dashboard" 
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
          />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
