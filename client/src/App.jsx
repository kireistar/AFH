import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';

const Login = lazy(() => import('./pages/auth/Login'));
const UserDashboard = lazy(() => import('./pages/user/UserDashboard'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ManagerDashboard = lazy(() => import('./pages/manager/ManagerDashboard'));
const FinanceDashboard = lazy(() => import('./pages/finance/FinanceDashboard'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
    <div className="w-8 h-8 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute allowedRoles={['user', 'admin', 'manager', 'finance']} />}>
              <Route path="/user/*" element={<UserDashboard />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin/*" element={<AdminDashboard />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['manager']} />}>
              <Route path="/manager/*" element={<ManagerDashboard />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['finance']} />}>
              <Route path="/finance/*" element={<FinanceDashboard />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;