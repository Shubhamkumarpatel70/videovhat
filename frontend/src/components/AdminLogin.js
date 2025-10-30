import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AdminLogin({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please provide email and password');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Login failed');
      const { adminUser, token } = data;
      if (!adminUser || !token) throw new Error('Invalid server response');

      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify(adminUser));

      if (typeof onLogin === 'function') onLogin(adminUser);
      toast.success('Logged in');
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Admin login error', err);
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl border border-gray-200 p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full p-3 rounded bg-gray-100 text-gray-900 placeholder:text-gray-400 border border-gray-300 focus:ring-2 focus:ring-blue-500"
              placeholder="admin@example.com"
              required
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full p-3 rounded bg-gray-100 text-gray-900 placeholder:text-gray-400 border border-gray-300 focus:ring-2 focus:ring-blue-500"
              placeholder="Password"
              required
              autoComplete="current-password"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </div>
        </form>
        <p className="mt-4 text-xs text-gray-500">
          By signing in you agree to the platform policies. Contact support if you need help.
        </p>
      </div>
    </div>
  );
}
