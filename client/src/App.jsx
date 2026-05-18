import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Lazy loading components for faster initial page load (Code Splitting)
const Login = lazy(() => import('./pages/auth/Login'));
const UserDashboard = lazy(() => import('./pages/user/UserDashboard'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ManagerDashboard = lazy(() => import('./pages/manager/ManagerDashboard'));
const FinanceDashboard = lazy(() => import('./pages/finance/FinanceDashboard'));

// Loading Fallback Component (Prevents blank screen during lazy loading)
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
    <div className="w-8 h-8 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function App() {
  // Mock variables kept from original
  const isAuth = false;
  const userRole = 'user';

  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Default route - redirect to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Login Page */}
          <Route path="/login" element={<Login />} />

          {/* User Dashboard */}
          <Route 
            path="/user/*" 
            element={<UserDashboard />} 
          />

          {/* Admin Dashboard */}
          <Route
            path="/admin/*"
            element={<AdminDashboard />}
          />

          {/* Manager Dashboard */}
          <Route
            path="/manager/*"
            element={<ManagerDashboard />}
          />

          {/* Finance Dashboard */}
          <Route
            path="/finance/*"
            element={<FinanceDashboard />}
          />

          {/* Catch-all for undefined URLs */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;