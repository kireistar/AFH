import React, { Suspense, lazy, useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import RegisterDeviceModal from './components/RegisterDeviceModal';

// Lazy-loaded pages
const Login = lazy(() => import('./pages/auth/Login'));
const UserDashboard = lazy(() => import('./pages/user/UserDashboard'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ManagerDashboard = lazy(() => import('./pages/manager/ManagerDashboard'));
const FinanceDashboard = lazy(() => import('./pages/finance/FinanceDashboard'));

/**
 * Universal Page Loading Spinner
 */
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
    <div className="w-8 h-8 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin"></div>
  </div>
);

/**
 * DeviceShieldGuard Component
 * Intercepts authenticated users across all roles (User, Admin, Manager, Finance)
 * if their Ed25519 public key is not registered in the database (Phase 2).
 */
function DeviceShieldGuard({ children }) {
  const auth = useAuth();
  const location = useLocation();

  // State lokal untuk memaksa modal tertutup seketika setelah registrasi sukses
  const [localDismiss, setLocalDismiss] = useState(false);
  const hasFetchedFreshProfile = useRef(false);

  const user = auth?.user;
  const loading = auth?.loading;
  const refreshUser = auth?.refreshUser;

  // Reset localDismiss jika user logout atau berganti session
  useEffect(() => {
    if (!user) {
      setLocalDismiss(false);
    }
  }, [user]);

  // Sync profile from backend once per session
  // Catches stale public_key after admin resets it from another session
  useEffect(() => {
    if (user && !hasFetchedFreshProfile.current && typeof refreshUser === 'function') {
      hasFetchedFreshProfile.current = true;
      refreshUser().catch(() => {});
    }
  }, [user, refreshUser]);

  // Check physical token existence in localStorage (mencakup 'accessToken' atau 'token')
  const hasToken = Boolean(localStorage.getItem('accessToken') || localStorage.getItem('token'));

  // Prevent shield modal rendering on authentication/public routes
  const isPublicRoute = location.pathname === '/login' || location.pathname === '/';

  // Render loader while auth context resolves
  if (loading) {
    return <PageLoader />;
  }

  // Trigger RegisterDeviceModal ONLY if:
  // 1. Tidak di-dismiss secara lokal pada sesi ini
  // 2. Valid access token exists
  // 3. User object is fully loaded with an ID
  // 4. User is not on a public route
  // 5. User's public_key is null or empty
  const shouldShowShield =
    !localDismiss &&
    hasToken &&
    user &&
    user.id &&
    !isPublicRoute &&
    (!user.public_key || user.public_key.trim() === '');

  // Wrapper untuk menangani penutupan instan + pembaruan data background
  const handleKeyRegistered = async () => {
    setLocalDismiss(true); // Tutup modal secara instan
    if (typeof refreshUser === 'function') {
      await refreshUser(); // Sinkronisasi data ke AuthContext di background
    }
  };

  return (
    <>
      {shouldShowShield && (
        <RegisterDeviceModal
          user={user}
          onKeyRegistered={handleKeyRegistered}
        />
      )}
      {children}
    </>
  );
}

/**
 * App Main Component
 */
function App() {
  return (
    <AuthProvider>
      <Router>
        <DeviceShieldGuard>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Default Redirect */}
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* Public Route */}
              <Route path="/login" element={<Login />} />

              {/* Protected Routes by Role */}
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

              {/* Fallback Catch-All Route */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
        </DeviceShieldGuard>
      </Router>
    </AuthProvider>
  );
}

export default App;
