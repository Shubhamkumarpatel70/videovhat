import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function HelpSupport() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const API = process.env.REACT_APP_API_URL || 'http://localhost:10000';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/api/support`, formData);
      if (response.status === 200) {
        toast.success('Your message has been sent successfully!');
        setFormData({ name: '', email: '', message: '' });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl border border-gray-200 p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Help & Support</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 w-full p-3 rounded bg-gray-100 text-gray-900 placeholder:text-gray-400 border border-gray-300 focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your name"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full p-3 rounded bg-gray-100 text-gray-900 placeholder:text-gray-400 border border-gray-300 focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700">Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="5"
              className="mt-1 w-full p-3 rounded bg-gray-100 text-gray-900 placeholder:text-gray-400 border border-gray-300 focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Describe your issue or question"
              required
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium"
            >
              {loading ? 'Sending…' : 'Send Message'}
            </button>
          </div>
        </form>
        <p className="mt-4 text-xs text-gray-500">
          By submitting this form you agree to the platform policies. Contact support if you need help.
        </p>
      </div>
    </div>
  );
}
