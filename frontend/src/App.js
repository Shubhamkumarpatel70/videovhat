import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import io from 'socket.io-client';
import toast from 'react-hot-toast';


// Components
import LandingPage from './components/LandingPage';
import ChatRoom from './components/ChatRoom';
import WaitingRoom from './components/WaitingRoom';
import ConnectionStatus from './components/ConnectionStatus';
import Header from './components/Header';
import About from './components/About';
import AdminLogin from './components/AdminLogin';
import AdminRegister from './components/AdminRegister';
import AdminDashboard from './components/AdminDashboard';
import AdminWaitingApproval from './components/AdminWaitingApproval';
import HelpSupport from './components/HelpSupport';
import Support from './pages/Support';
import NoInternet from './components/NoInternet';
import NotFound from './components/NotFound';


// Hooks

function App() {
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    const storedAdminUser = localStorage.getItem('adminUser');
    if (storedAdminUser) {
      setAdminUser(JSON.parse(storedAdminUser));
    }
  }, []);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize socket connection with better error handling
  useEffect(() => {
    const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
    const currentToken = localStorage.getItem('token');

    console.log('🔌 Connecting to socket server:', SOCKET_URL);

    const newSocket = io(SOCKET_URL, {
      auth: { token: currentToken },
      transports: ['websocket', 'polling'],
      upgrade: true,
      forceNew: true,
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    setSocket(newSocket);

    // Connection events
    newSocket.on('connect', () => {
      console.log('✅ Socket connected successfully');
      setIsConnected(true);
      setConnectionStatus('connected');
      setReconnectAttempts(0);
      
      // Re-join rooms if user was previously connected
      if (user) {
        newSocket.emit('user-rejoin', user);
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setIsConnected(false);
      setConnectionStatus('disconnected');
    });

    newSocket.on('connect_error', (error) => {
      console.error('🚨 Socket connection error:', error);
      setConnectionStatus('error');
      setIsConnected(false);
    });

    newSocket.on('reconnect_attempt', (attempt) => {
      console.log(`🔄 Reconnection attempt ${attempt}`);
      setReconnectAttempts(attempt);
      setConnectionStatus('reconnecting');
    });

    newSocket.on('reconnect_failed', () => {
      console.error('💥 Reconnection failed');
      setConnectionStatus('failed');
      setIsConnected(false);
    });

    newSocket.on('reconnect', (attempt) => {
      console.log(`✅ Reconnected after ${attempt} attempts`);
      setConnectionStatus('connected');
      setIsConnected(true);
      setReconnectAttempts(0);
    });

    // Global error handler
    newSocket.on('error', (error) => {
      console.error('🚨 Socket error:', error);
    });

    return () => {
      console.log('🧹 Cleaning up socket connection');
      newSocket.removeAllListeners();
      newSocket.disconnect();
    };
  }, [token]);

  // Handle user join with validation
  const handleUserJoin = useCallback((userData) => {
    console.log('User data received in App.js:', userData);
    if (!userData) {
      console.error('❌ No user data provided');
      return;
    }

    // Validate user data
    if (!userData.isAnonymous && (!userData.name || !userData.email)) {
      console.error('❌ Invalid user data:', userData);
      return;
    }

    console.log('👤 User joining:', {
      name: userData.isAnonymous ? 'Anonymous' : userData.name,
      gender: userData.gender,
      country: userData.country
    });

    setUser(userData);
    
    if (socket && isConnected) {
      socket.emit('user-join', {
        ...userData,
        id: socket.id,
        timestamp: new Date().toISOString()
      });
    } else {
      console.warn('⚠️ Socket not connected, user data saved locally');
    }
  }, [socket, isConnected]);

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
  };

  const handleAdminRegister = (adminUser, token) => {
    setAdminUser(adminUser);
    localStorage.setItem('adminUser', JSON.stringify(adminUser));
    localStorage.setItem('adminToken', token);
  };

  const handleAdminLogout = () => {
    setAdminUser(null);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    toast.success('Admin logged out successfully');
  };

  // Handle socket reconnection when user exists
  useEffect(() => {
    if (socket && isConnected && user) {
      socket.emit('user-rejoin', user);
    }
  }, [socket, isConnected, user]);

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (!user) {
      console.warn('🚫 Unauthorized access to protected route');
      return <Navigate to="/" replace />;
    }
    
    if (!isConnected) {
      console.warn('🌐 No connection, redirecting to landing');
      return <Navigate to="/" replace />;
    }
    
    return children;
  };

  // Admin route component
  const AdminRoute = ({ children }) => {
    if (!adminUser) {
      console.warn('🚫 Unauthorized access to admin route');
      return <Navigate to="/admin/login" replace />;
    }
    
    return children;
  };

  // Handle application errors
  useEffect(() => {
    const handleUnhandledRejection = (event) => {
      console.error('🚨 Unhandled promise rejection:', event.reason);
      event.preventDefault();
    };

    const handleGlobalError = (message, source, lineno, colno, error) => {
      console.error('🚨 Global error:', { message, source, lineno, colno, error });
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleGlobalError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleGlobalError);
    };
  }, []);

  // --- add helpers near top of file (once) ---
  const titleCase = (str) => {
    if (!str || typeof str !== 'string') return str || '';
    return str
      .toLowerCase()
      .split(' ')
      .filter(Boolean)
      .map(s => s[0].toUpperCase() + s.slice(1))
      .join(' ');
  };

  const normalizeUser = (u) => {
    if (!u) return null;
    const obj = typeof u === 'string' ? { name: u } : { ...u };
    const id = obj.id || obj._id || obj.userId || obj.uid || null;
    const rawName = obj.name || obj.displayName || obj.username || obj.fullName || obj.full_name || '';
    const name = titleCase(rawName);
    const email = obj.email || obj.user_email || '';
    const gender = obj.gender || obj.sex || '';
    const country = obj.country || obj.location || obj.countryName || '';
    const isAnonymous = obj.isAnonymous ?? obj.anonymous ?? obj.is_anonymous ?? false;
    return { id, name, email, gender, country, isAnonymous, raw: obj };
  };
  // --- end helpers ---

  // Insert this effect where App has access to `socket` and `user` state.
  // It will emit user-joined, re-emit on socket reconnect, request stats, and emit user-left on unload.
  useEffect(() => {
    if (!socket) return;

    let mounted = true;
    const emitJoin = (u) => {
      if (!socket || !u) return;
      try {
        const normalized = normalizeUser(u);
        socket.emit('user-joined', {
          id: normalized.id,
          name: normalized.name,
          email: normalized.email,
          gender: normalized.gender,
          country: normalized.country,
          isAnonymous: normalized.isAnonymous
        });
        // request snapshot so WaitingRoom receives initial stats
        socket.emit('request-online-stats');
      } catch (e) {
        console.warn('Failed to emit user-joined', e);
      }
    };

    // If user already set, announce immediately
    if (user) {
      emitJoin(user);
    }

    // Re-announce on socket reconnect so server can recalc consistent counts
    const onConnect = () => {
      if (user) emitJoin(user);
    };
    socket.on('connect', onConnect);

    // Ensure server knows when this client intentionally leaves (refresh/close)
    const handleBeforeUnload = () => {
      try {
        const normalized = normalizeUser(user);
        if (socket && normalized) {
          socket.emit('user-left', { id: normalized.id });
        }
      } catch (e) { /* ignore */ }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Also listen for manual logout or user state becoming null in your app:
    // if your app calls setUser(null), you should emit 'user-left' at that point as well.

    return () => {
      mounted = false;
      socket.off('connect', onConnect);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // best-effort notify server when this component unmounts
      try {
        const normalized = normalizeUser(user);
        if (socket && normalized) socket.emit('user-left', { id: normalized.id });
      } catch (e) { /* ignore */ }
    };
  }, [socket, user]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col relative overflow-hidden">
      {/* Global Connection Status */}
      <ConnectionStatus 
        status={connectionStatus}
        reconnectAttempts={reconnectAttempts}
        isConnected={isConnected}
      />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 left-1/2 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl animate-float-fast"></div>
      </div>

      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Header user={user} onLogout={handleLogout} />
        {!isOnline ? (
          <NoInternet />
        ) : (
          <Routes>
            <Route
              path="/"
              element={
                <LandingPage
                  onUserJoin={handleUserJoin}
                  isConnected={isConnected}
                  connectionStatus={connectionStatus}
                  user={user}
                />
              }
            />

            <Route
              path="/waiting"
              element={
                <ProtectedRoute>
                  <WaitingRoom
                    socket={socket}
                    user={user}
                    isConnected={isConnected}
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <ChatRoom
                    socket={socket}
                    user={user}
                    isConnected={isConnected}
                  />
                </ProtectedRoute>
              }
            />
            <Route path="/about" element={<About />} />
            <Route path="/support" element={<HelpSupport />} />
            <Route path="/admin/support" element={<AdminRoute><Support /></AdminRoute>} />
            <Route path="/admin/login" element={<AdminLogin onLogin={setAdminUser} />} />
            <Route path="/admin/register" element={<AdminRegister onRegister={handleAdminRegister} />} />
            <Route path="/admin/waiting-approval" element={<AdminWaitingApproval />} />
            <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard adminUser={adminUser} onLogout={handleAdminLogout} /></AdminRoute>} />

            {/* 404 Not Found route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        )}
      </Router>

      {/* Enhanced Toaster with custom styles */}
      <Toaster 
        position="top-right"
        gutter={8}
        containerClassName="!z-50"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(15, 23, 42, 0.95)',
            color: '#fff',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
            style: {
              border: '1px solid rgba(16, 185, 129, 0.3)',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
            style: {
              border: '1px solid rgba(239, 68, 68, 0.3)',
            },
          },
          loading: {
            iconTheme: {
              primary: '#8b5cf6',
              secondary: '#fff',
            },
            style: {
              border: '1px solid rgba(139, 92, 246, 0.3)',
            },
          },
        }}
      />

      {/* Global App Version */}
      <div className="absolute bottom-4 right-4 text-white/30 text-xs font-mono z-10">
        v{process.env.REACT_APP_VERSION || '1.0.0'}
      </div>
    </div>
  );
}

export default App;