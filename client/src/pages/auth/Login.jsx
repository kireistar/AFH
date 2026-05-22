import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleMockLogin = (e) => {
    e.preventDefault();
    
    let assignedRole = 'user';
    if (email.includes('admin')) assignedRole = 'admin';
    else if (email.includes('manager')) assignedRole = 'manager';
    else if (email.includes('finance')) assignedRole = 'finance';

    login(assignedRole);
    navigate(`/${assignedRole}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-200 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8 space-y-8">
        
        {/* Header Section */}
        <div className="text-center">
          <div className="w-14 h-14 bg-linear-to-tr from-blue-700 to-blue-500 rounded-xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
            <span className="text-white font-extrabold text-2xl tracking-wider">AFH</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Login ke Sistem</h2>
          <p className="mt-2 text-sm text-slate-500">
            Ketik <strong>admin</strong>, <strong>manager</strong>, atau <strong>finance</strong> pada email untuk uji coba role.
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleMockLogin} className="space-y-6">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Alamat Email</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
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
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 text-white font-semibold bg-linear-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-500/30 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Masuk ke Dashboard
          </button>
        </form>

      </div>
    </div>
  );
}

export default Login;