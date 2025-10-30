import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = ({ adminUser, onLogout }) => {
  const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const [activeTab, setActiveTab] = useState('home');
  const [users, setUsers] = useState([]);
  const [restrictedWords, setRestrictedWords] = useState([]);
  const [activeChats, setActiveChats] = useState([]);
  const [chatLogs, setChatLogs] = useState([]);
  const [adminLogs, setAdminLogs] = useState([]);
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [supportRequests, setSupportRequests] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [maintenance, setMaintenance] = useState({ isActive: false, message: '', scheduledFrom: '', scheduledTo: '' });
  const [loading, setLoading] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [wordSeverity, setWordSeverity] = useState('medium');
  const [newTestimonial, setNewTestimonial] = useState({ text: '', author: '', location: '' });
  const [editingTestimonial, setEditingTestimonial] = useState(null);

  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    if (activeTab === 'home') {
      loadUsers();
      loadActiveChats();
      loadChatLogs();
      loadSupportRequests();
    } else if (activeTab === 'users') loadUsers();
    else if (activeTab === 'words') loadRestrictedWords();
    else if (activeTab === 'chats') loadActiveChats();
    else if (activeTab === 'logs') loadChatLogs();
    else if (activeTab === 'admin-logs') loadAdminLogs();
    else if (activeTab === 'admin-approval') loadPendingAdmins();
    else if (activeTab === 'support') loadSupportRequests();
    else if (activeTab === 'testimonials') loadTestimonials();
    else if (activeTab === 'maintenance') loadMaintenance();
  }, [activeTab]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
    setLoading(false);
  };

  const loadRestrictedWords = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/api/admin/restricted-words`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRestrictedWords(response.data);
    } catch (error) {
      console.error('Error loading restricted words:', error);
    }
    setLoading(false);
  };

  const loadActiveChats = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/api/admin/active-chats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActiveChats(response.data);
    } catch (error) {
      console.error('Error loading active chats:', error);
    }
    setLoading(false);
  };

  const loadChatLogs = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/api/admin/chat-logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChatLogs(response.data);
    } catch (error) {
      console.error('Error loading chat logs:', error);
    }
    setLoading(false);
  };

  const loadAdminLogs = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/api/admin/logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdminLogs(response.data);
    } catch (error) {
      console.error('Error loading admin logs:', error);
    }
    setLoading(false);
  };

  const loadPendingAdmins = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/api/admin/pending-admins`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingAdmins(response.data);
    } catch (error) {
      console.error('Error loading pending admins:', error);
    }
    setLoading(false);
  };

  const loadSupportRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/api/admin/support-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSupportRequests(response.data);
    } catch (error) {
      console.error('Error loading support requests:', error);
    }
    setLoading(false);
  };

  const loadTestimonials = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/api/admin/testimonials`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTestimonials(response.data);
    } catch (error) {
      console.error('Error loading testimonials:', error);
    }
    setLoading(false);
  };

  const loadMaintenance = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/api/admin/maintenance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMaintenance(response.data);
    } catch (error) {
      console.error('Error loading maintenance:', error);
    }
    setLoading(false);
  };

  const handleUserBan = async (userId, isBanned) => {
    try {
      const banExpires = isBanned ? new Date(Date.now() + 15 * 60 * 1000) : null; // 15 minutes ban
      await axios.put(`${API}/api/admin/users/${userId}`, {
        isBanned,
        banExpires
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleAddWord = async (e) => {
    e.preventDefault();
    if (!newWord.trim()) return;

    try {
      await axios.post(`${API}/api/admin/restricted-words`, {
        word: newWord.trim(),
        severity: wordSeverity
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewWord('');
      loadRestrictedWords();
    } catch (error) {
      console.error('Error adding word:', error);
    }
  };

  const handleDeleteWord = async (wordId) => {
    try {
      await axios.delete(`${API}/api/admin/restricted-words/${wordId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadRestrictedWords();
    } catch (error) {
      console.error('Error deleting word:', error);
    }
  };

  const handleAdminApproval = async (adminId, approved) => {
    try {
      await axios.put(`${API}/api/admin/approve-admin/${adminId}`, {
        approved
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadPendingAdmins();
    } catch (error) {
      console.error('Error updating admin approval:', error);
    }
  };

  const handleSupportStatusUpdate = async (requestId, status, adminNotes) => {
    try {
      await axios.put(`${API}/api/admin/support-requests/${requestId}`, {
        status,
        adminNotes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadSupportRequests();
    } catch (error) {
      console.error('Error updating support request:', error);
    }
  };

  const handleAddTestimonial = async (e) => {
    e.preventDefault();
    if (!newTestimonial.text.trim() || !newTestimonial.author.trim()) return;

    try {
      await axios.post(`${API}/api/admin/testimonials`, newTestimonial, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewTestimonial({ text: '', author: '', location: '' });
      loadTestimonials();
    } catch (error) {
      console.error('Error adding testimonial:', error);
    }
  };

  const handleEditTestimonial = async (testimonialId, updatedTestimonial) => {
    try {
      await axios.put(`${API}/api/admin/testimonials/${testimonialId}`, updatedTestimonial, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingTestimonial(null);
      loadTestimonials();
    } catch (error) {
      console.error('Error updating testimonial:', error);
    }
  };

  const handleDeleteTestimonial = async (testimonialId) => {
    try {
      await axios.delete(`${API}/api/admin/testimonials/${testimonialId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadTestimonials();
    } catch (error) {
      console.error('Error deleting testimonial:', error);
    }
  };

  const handleMaintenanceUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/api/admin/maintenance`, maintenance, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadMaintenance();
    } catch (error) {
      console.error('Error updating maintenance:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    onLogout();
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-info">
          <span>Welcome, {adminUser.name}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <nav className="admin-nav">
        <button
          className={activeTab === 'home' ? 'active' : ''}
          onClick={() => setActiveTab('home')}
        >
          Home
        </button>
        <button
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          User Management
        </button>
        <button
          className={activeTab === 'words' ? 'active' : ''}
          onClick={() => setActiveTab('words')}
        >
          Restricted Words
        </button>
        <button
          className={activeTab === 'chats' ? 'active' : ''}
          onClick={() => setActiveTab('chats')}
        >
          Active Chats
        </button>
        <button
          className={activeTab === 'logs' ? 'active' : ''}
          onClick={() => setActiveTab('logs')}
        >
          Chat Logs
        </button>
        <button
          className={activeTab === 'admin-logs' ? 'active' : ''}
          onClick={() => setActiveTab('admin-logs')}
        >
          Admin Logs
        </button>
        <button
          className={activeTab === 'admin-approval' ? 'active' : ''}
          onClick={() => setActiveTab('admin-approval')}
        >
          Admin Approval
        </button>
        <button
          className={activeTab === 'support' ? 'active' : ''}
          onClick={() => setActiveTab('support')}
        >
          Support
        </button>
        <button
          className={activeTab === 'testimonials' ? 'active' : ''}
          onClick={() => setActiveTab('testimonials')}
        >
          Testimonials
        </button>
        <button
          className={activeTab === 'maintenance' ? 'active' : ''}
          onClick={() => setActiveTab('maintenance')}
        >
          Maintenance
        </button>
      </nav>

      <main className="admin-content">
        {activeTab === 'home' && (
          <div className="home-section">
            <h2>Dashboard Overview</h2>
            <div className="stats-cards">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <h3>Total Users</h3>
                  <p className="stat-number">{users.length}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🟢</div>
                <div className="stat-info">
                  <h3>Active Users</h3>
                  <p className="stat-number blink-animation">{users.filter(user => !user.isBanned).length}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💬</div>
                <div className="stat-info">
                  <h3>Active Chats</h3>
                  <p className="stat-number">{activeChats.length}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🚫</div>
                <div className="stat-info">
                  <h3>Violations Today</h3>
                  <p className="stat-number">{chatLogs.filter(log => log.isViolation && new Date(log.timestamp).toDateString() === new Date().toDateString()).length}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">❓</div>
                <div className="stat-info">
                  <h3>Total Active Queries</h3>
                  <p className="stat-number">{supportRequests.filter(request => request.status === 'pending' || request.status === 'in-progress').length}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <h3>Total Solved Queries</h3>
                  <p className="stat-number">{supportRequests.filter(request => request.status === 'resolved' || request.status === 'closed').length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-section">
            <h2>User Management</h2>
            {loading ? (
              <div className="loading">Loading...</div>
            ) : (
              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Country</th>
                      <th>Gender</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user._id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.country || 'N/A'}</td>
                        <td>{user.gender || 'N/A'}</td>
                        <td>
                          <span className={`status ${user.isBanned ? 'banned' : 'active'}`}>
                            {user.isBanned ? 'Banned' : 'Active'}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleUserBan(user._id, !user.isBanned)}
                            className={user.isBanned ? 'unban-btn' : 'ban-btn'}
                          >
                            {user.isBanned ? 'Unban' : 'Ban'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'words' && (
          <div className="words-section">
            <h2>Restricted Words Management</h2>
            <form onSubmit={handleAddWord} className="add-word-form">
              <input
                type="text"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                placeholder="Enter word to restrict"
                required
              />
              <select value={wordSeverity} onChange={(e) => setWordSeverity(e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <button type="submit">Add Word</button>
            </form>

            {loading ? (
              <div className="loading">Loading...</div>
            ) : (
              <div className="words-list">
                {restrictedWords.map(word => (
                  <div key={word._id} className="word-item">
                    <span className="word-text">{word.word}</span>
                    <span className={`severity ${word.severity}`}>{word.severity}</span>
                    <button onClick={() => handleDeleteWord(word._id)} className="delete-btn">
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'chats' && (
          <div className="chats-section">
            <h2>Active Chats</h2>
            {loading ? (
              <div className="loading">Loading...</div>
            ) : (
              <div className="chats-list">
                {activeChats.map(chat => (
                  <div key={chat.socketId} className="chat-item">
                    <div className="chat-info">
                      <strong>{chat.name}</strong>
                      <span>{chat.country || 'Unknown'} • {chat.gender || 'Unknown'}</span>
                      <span className="connection-time">Connected for {Math.floor(chat.connectionDuration / 60)}m {chat.connectionDuration % 60}s</span>
                    </div>
                    <span className="online-status">Online</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="logs-section">
            <h2>Chat Logs</h2>
            {loading ? (
              <div className="loading">Loading...</div>
            ) : (
              <div className="logs-list">
                {chatLogs.map(log => (
                  <div key={log._id} className={`log-item ${log.isViolation ? 'violation' : ''}`}>
                    <div className="log-header">
                      <strong>{log.senderName}</strong>
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <p>{log.message}</p>
                    {log.isViolation && (
                      <div className="violation-info">
                        <span>Flagged words: {log.flaggedWords.join(', ')}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'admin-logs' && (
          <div className="admin-logs-section">
            <h2>Admin Activity Logs</h2>
            {loading ? (
              <div className="loading">Loading...</div>
            ) : (
              <div className="logs-list">
                {adminLogs.map(log => (
                  <div key={log._id} className="log-item">
                    <div className="log-header">
                      <strong>{log.adminId?.name || 'Unknown Admin'}</strong>
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <p><strong>Action:</strong> {log.action}</p>
                    <p><strong>Details:</strong> {log.details}</p>
                    {log.targetUserId && (
                      <p><strong>Target User:</strong> {log.targetUserId.name} ({log.targetUserId.email})</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'admin-approval' && (
          <div className="admin-approval-section">
            <h2>Pending Admin Approvals</h2>
            {loading ? (
              <div className="loading">Loading...</div>
            ) : (
              <div className="pending-admins-list">
                {pendingAdmins.length === 0 ? (
                  <p>No pending admin approvals.</p>
                ) : (
                  pendingAdmins.map(admin => (
                    <div key={admin._id} className="pending-admin-item">
                      <div className="admin-info">
                        <strong>{admin.name}</strong>
                        <span>{admin.email}</span>
                        <span>Applied on: {new Date(admin.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="admin-actions">
                        <button
                          onClick={() => handleAdminApproval(admin._id, true)}
                          className="approve-btn"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAdminApproval(admin._id, false)}
                          className="reject-btn"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'support' && (
          <div className="support-section">
            <h2>Support Requests Management</h2>
            {loading ? (
              <div className="loading">Loading...</div>
            ) : (
              <div className="support-requests-list">
                {supportRequests.length === 0 ? (
                  <p>No support requests found.</p>
                ) : (
                  supportRequests.map(request => (
                    <div key={request._id} className="support-request-item">
                      <div className="request-header">
                        <strong>{request.subject}</strong>
                        <span className={`status ${request.status}`}>{request.status}</span>
                      </div>
                      <div className="request-info">
                        <p><strong>From:</strong> {request.userId?.name || 'Anonymous'} ({request.userId?.email || 'N/A'})</p>
                        <p><strong>Submitted:</strong> {new Date(request.createdAt).toLocaleString()}</p>
                        <p><strong>Category:</strong> {request.category}</p>
                      </div>
                      <div className="request-message">
                        <p><strong>Message:</strong> {request.message}</p>
                      </div>
                      {request.adminNotes && (
                        <div className="admin-notes">
                          <p><strong>Admin Notes:</strong> {request.adminNotes}</p>
                        </div>
                      )}
                      <div className="request-actions">
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleSupportStatusUpdate(request._id, 'in-progress', '')}
                              className="start-btn"
                            >
                              Start Working
                            </button>
                            <button
                              onClick={() => handleSupportStatusUpdate(request._id, 'resolved', 'Resolved without action')}
                              className="resolve-btn"
                            >
                              Mark Resolved
                            </button>
                          </>
                        )}
                        {request.status === 'in-progress' && (
                          <button
                            onClick={() => handleSupportStatusUpdate(request._id, 'resolved', 'Issue resolved')}
                            className="resolve-btn"
                          >
                            Mark Resolved
                          </button>
                        )}
                        {request.status === 'resolved' && (
                          <span className="resolved-text">Resolved</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'testimonials' && (
          <div className="testimonials-section">
            <h2>Testimonials Management</h2>
            <form onSubmit={handleAddTestimonial} className="add-testimonial-form">
              <textarea
                value={newTestimonial.text}
                onChange={(e) => setNewTestimonial({ ...newTestimonial, text: e.target.value })}
                placeholder="Enter testimonial text"
                required
              />
              <input
                type="text"
                value={newTestimonial.author}
                onChange={(e) => setNewTestimonial({ ...newTestimonial, author: e.target.value })}
                placeholder="Author name"
                required
              />
              <input
                type="text"
                value={newTestimonial.location}
                onChange={(e) => setNewTestimonial({ ...newTestimonial, location: e.target.value })}
                placeholder="Location (optional)"
              />
              <button type="submit">Add Testimonial</button>
            </form>

            {loading ? (
              <div className="loading">Loading...</div>
            ) : (
              <div className="testimonials-list">
                {testimonials.length === 0 ? (
                  <p>No testimonials found.</p>
                ) : (
                  testimonials.map(testimonial => (
                    <div key={testimonial._id} className="testimonial-item">
                      {editingTestimonial === testimonial._id ? (
                        <div className="edit-testimonial">
                          <textarea
                            value={editingTestimonial.text}
                            onChange={(e) => setEditingTestimonial({ ...editingTestimonial, text: e.target.value })}
                          />
                          <input
                            type="text"
                            value={editingTestimonial.author}
                            onChange={(e) => setEditingTestimonial({ ...editingTestimonial, author: e.target.value })}
                          />
                          <input
                            type="text"
                            value={editingTestimonial.location}
                            onChange={(e) => setEditingTestimonial({ ...editingTestimonial, location: e.target.value })}
                          />
                          <button onClick={() => handleEditTestimonial(testimonial._id, editingTestimonial)}>Save</button>
                          <button onClick={() => setEditingTestimonial(null)}>Cancel</button>
                        </div>
                      ) : (
                        <>
                          <div className="testimonial-content">
                            <p>"{testimonial.text}"</p>
                            <p><strong>- {testimonial.author}</strong></p>
                            {testimonial.location && <p><em>{testimonial.location}</em></p>}
                          </div>
                          <div className="testimonial-actions">
                            <button onClick={() => setEditingTestimonial({ ...testimonial })}>Edit</button>
                            <button onClick={() => handleDeleteTestimonial(testimonial._id)} className="delete-btn">Delete</button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="maintenance-section">
            <h2>Maintenance Mode Management</h2>
            <form onSubmit={handleMaintenanceUpdate} className="maintenance-form">
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={maintenance.isActive}
                    onChange={(e) => setMaintenance({ ...maintenance, isActive: e.target.checked })}
                  />
                  Enable Maintenance Mode
                </label>
              </div>
              <div className="form-group">
                <label htmlFor="maintenance-message">Maintenance Message</label>
                <textarea
                  id="maintenance-message"
                  value={maintenance.message}
                  onChange={(e) => setMaintenance({ ...maintenance, message: e.target.value })}
                  placeholder="Enter maintenance message"
                  rows="4"
                />
              </div>
              <div className="form-group">
                <label htmlFor="scheduled-from">Scheduled From (optional)</label>
                <input
                  type="datetime-local"
                  id="scheduled-from"
                  value={maintenance.scheduledFrom}
                  onChange={(e) => setMaintenance({ ...maintenance, scheduledFrom: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="scheduled-to">Scheduled To (optional)</label>
                <input
                  type="datetime-local"
                  id="scheduled-to"
                  value={maintenance.scheduledTo}
                  onChange={(e) => setMaintenance({ ...maintenance, scheduledTo: e.target.value })}
                />
              </div>
              <button type="submit">Update Maintenance Settings</button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
