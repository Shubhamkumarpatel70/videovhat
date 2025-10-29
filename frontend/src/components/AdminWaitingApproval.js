import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function AdminWaitingApproval() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-yellow-500 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Waiting for Approval</h2>
          <p className="text-gray-600">
            Your admin registration has been submitted successfully. Please wait for an existing admin to approve your account.
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-500 text-center">
            You will receive access once your account is approved. This process may take some time.
          </p>

          <button
            onClick={handleLogout}
            className="w-full p-3 rounded bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="register-link">
          <p>Need to register again? <Link to="/admin/register">Register here</Link></p>
        </div>
        <div className="user-login-link">
          <p>Looking for user login? <Link to="/login">Go to User Login</Link></p>
        </div>
      </div>
    </div>
  );
}
