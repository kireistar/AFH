import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { loginUser } from '../../services/authService';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Call backend API untuk login
      const { accessToken, user } = await loginUser(email, password);

      // Update auth context dengan token + user dari backend
      login(accessToken, user);

      // Navigate sesuai role
      navigate(`/${user.role}`);
    } catch (err) {
      // Show error message dari backend atau generic error
      setError(err.message || 'Login gagal. Coba lagi.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-slate-100 to-blue-50 p-6 relative overflow-hidden">
      
      {/* Decorative Glowing Radial Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8 space-y-8 relative z-10">
        
        {/* Header Section */}
        <div className="text-center">
          <div className="w-14 h-14 bg-linear-to-tr from-blue-600 to-indigo-600 rounded-xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4">
            <span className="text-white font-extrabold text-2xl tracking-wider">AFH</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Login ke Sistem</h2>
          <p className="mt-2 text-sm text-slate-500">
            Masukkan email dan password untuk akses
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Form Section */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Alamat Email</label>
              <input
                type="email"
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="nama@afh.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Kata Sandi</label>
              <input
                type="password"
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 text-white font-semibold bg-linear-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-500/30 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none cursor-pointer"
          >
            {loading ? 'Loading...' : 'Masuk ke Dashboard'}
          </button>
        </form>

        {/* Demo Credentials Info */}
        <div className="pt-4 border-t border-slate-100">
          <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-100/30 text-center">
            <p className="text-xs text-slate-500 font-medium">
              Demo: <span className="font-semibold text-blue-700">admin@afh.com</span> / <span className="font-semibold text-blue-700">password123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;