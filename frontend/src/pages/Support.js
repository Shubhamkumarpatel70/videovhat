import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function Support() {
  const [supportRequests, setSupportRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const API = process.env.REACT_APP_API_URL || 'http://localhost:10000';

  useEffect(() => {
    fetchSupportRequests();
  }, []);

  const fetchSupportRequests = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API}/api/admin/support-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch support requests');
      const data = await res.json();
      setSupportRequests(data);
    } catch (err) {
      console.error('Fetch support requests error', err);
      toast.error('Failed to load support requests');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status, adminNotes) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API}/api/admin/support-requests/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, adminNotes }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      toast.success('Status updated successfully');
      fetchSupportRequests(); // Refresh list
    } catch (err) {
      console.error('Update status error', err);
      toast.error('Failed to update status');
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 mt-8 bg-white/5 rounded-lg backdrop-blur-sm">
      <h1 className="text-2xl font-semibold text-white mb-6">Support Requests Management</h1>
      {supportRequests.length === 0 ? (
        <p className="text-gray-300">No support requests found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {supportRequests.map((request) => (
            <div key={request._id} className="bg-white/10 rounded-lg p-4 hover:bg-white/15 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-white font-medium">{request.name || 'Anonymous'}</h3>
                <select
                  value={request.status}
                  onChange={(e) => updateStatus(request._id, e.target.value, request.adminNotes)}
                  className="bg-gray-700 text-white px-2 py-1 rounded text-xs"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-gray-300"><strong>Email:</strong> {request.email}</p>
                <p className="text-gray-400"><strong>Date:</strong> {new Date(request.createdAt).toLocaleString()}</p>
                <p className="text-gray-200"><strong>Message:</strong> {request.message}</p>
                <div>
                  <label className="text-white font-medium block mb-1">Admin Notes:</label>
                  <textarea
                    value={request.adminNotes || ''}
                    onChange={(e) => {
                      const updatedRequests = supportRequests.map(req =>
                        req._id === request._id ? { ...req, adminNotes: e.target.value } : req
                      );
                      setSupportRequests(updatedRequests);
                    }}
                    onBlur={() => updateStatus(request._id, request.status, request.adminNotes)}
                    className="w-full p-2 rounded bg-gray-700 text-white text-xs resize-none"
                    rows={2}
                    placeholder="Add notes..."
                  />
                </div>
              </div>
              <div className="mt-3">
                <button
                  onClick={() => updateStatus(request._id, request.status, request.adminNotes)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
                >
                  Update
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
