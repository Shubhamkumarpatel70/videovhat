import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const checkUserExists = async (emailToCheck) => {
    try {
      const resp = await fetch(`/api/users/check-exists?email=${encodeURIComponent(emailToCheck)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!resp.ok) return false;
      const data = await resp.json();
      // backend should return { exists: true/false }
      return Boolean(data.exists);
    } catch (err) {
      console.error('checkUserExists error', err);
      return false;
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter an email');
      return;
    }

    setLoading(true);
    try {
      const exists = await checkUserExists(email.trim());
      if (!exists) {
        toast('Redirecting to registration...', { icon: '➡️' });
        // pass email to register page for prefill
        navigate('/register', { state: { email: email.trim() } });
        return;
      }

      // ...existing login/join flow for registered users...
      // Example: call login endpoint, set auth, navigate to /waiting etc.
      // {existing code continues here}
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* ...existing markup... */}
      <form onSubmit={handleJoin}>
        {/* ...other fields... */}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Checking...' : 'Join VideoChat'}
        </button>
      </form>
      {/* ...existing markup... */}
    </div>
  );
};

export default Login;