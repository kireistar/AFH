import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import UserDashboard from './pages/user/UserDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
// import AdminDashboard from './pages/admin/AdminDashboard'; // Uncomment nanti

function App() {
  const isAuth = false;
  const userRole = 'user';

  return (
    <Router>
      <Routes>
        {/* Default route - redirect ke login */}
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
        {/* Catch-all untuk URL yang tidak ada */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;