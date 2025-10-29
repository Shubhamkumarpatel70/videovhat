import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const Register = () => {
  const location = useLocation();
  const prefillEmail = location?.state?.email || '';
  const [email, setEmail] = useState(prefillEmail);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (prefillEmail) {
      setEmail(prefillEmail);
    }
  }, [prefillEmail]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // ...existing registration API call...
      // Example:
      // await fetch('/api/auth/register', { method:'POST', body: JSON.stringify({ email, name }) })
      toast.success('Registration successful');
      // ...existing post-registration flow (navigate to login or auto-login)...
    } catch (err) {
      console.error(err);
      toast.error('Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* ...existing markup... */}
      <form onSubmit={handleRegister}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
        />
        <button type="submit" disabled={submitting}>
          {submitting ? 'Registering...' : 'Register'}
        </button>
      </form>
      {/* ...existing markup... */}
    </div>
  );
};

export default Register;