import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AdminRegister({ onRegister }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const sendOtp = async () => {
    if (!email) {
      toast.error('Please enter email first');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || 'Failed to send OTP');
      }
      setOtpSent(true);
      toast.success('OTP sent to your email');
    } catch (err) {
      console.error('OTP send error', err);
      toast.error(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otpSent) {
      toast.error('Please send OTP first');
      return;
    }
    if (!otp) {
      toast.error('Please enter OTP');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || 'Registration failed');
      }
      const { adminUser, token } = data;
      // persist and notify parent
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify(adminUser));
      if (typeof onRegister === 'function') onRegister(adminUser, token);
      toast.success('Admin registered successfully. Please wait for approval.');
      navigate('/admin/waiting-approval');
    } catch (err) {
      console.error('Admin registration error', err);
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white/5 rounded-lg backdrop-blur-sm">
      <h2 className="text-xl font-semibold text-white mb-4">Admin Register</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full p-3 rounded bg-white/5 text-white"
          placeholder="Name"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <input
          className="w-full p-3 rounded bg-white/5 text-white"
          placeholder="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full p-3 rounded bg-white/5 text-white"
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button
          type="button"
          onClick={sendOtp}
          disabled={loading || otpSent}
          className="w-full p-3 rounded bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white"
        >
          {otpSent ? 'OTP Sent' : 'Send OTP'}
        </button>
        {otpSent && (
          <input
            className="w-full p-3 rounded bg-white/5 text-white"
            placeholder="Enter OTP"
            type="text"
            value={otp}
            onChange={e => setOtp(e.target.value)}
            required
          />
        )}
        <button
          type="submit"
          disabled={loading || !otpSent}
          className="w-full p-3 rounded bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? 'Registering…' : 'Register as Admin'}
        </button>
      </form>
    </div>
  );
}
