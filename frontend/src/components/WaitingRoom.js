import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Globe, Clock, Video, Wifi, WifiOff, User, MapPin, Sparkles, Zap, Search, RotateCcw, Crown, Target, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import ReactCountryFlag from 'react-country-flag';
import Header from './Header';

// Utility function to mask names
const maskName = (name) => {
  if (!name || name.length <= 2) return name;
  return name.substring(0, 2) + 'X'.repeat(name.length - 2);
};

// Country name to ISO code mapping (trimmed/cleaned to avoid syntax issues)
const countryCodeMap = {
  'United States': 'US',
  'USA': 'US',
  'United Kingdom': 'GB',
  'UK': 'GB',
  'India': 'IN',
  'Canada': 'CA',
  'Australia': 'AU',
  'Germany': 'DE',
  'France': 'FR',
  'Japan': 'JP',
  'China': 'CN',
  'Brazil': 'BR',
  'Mexico': 'MX',
  'Russia': 'RU',
  'South Korea': 'KR',
  'Korea, South': 'KR',
  'Italy': 'IT',
  'Spain': 'ES',
  'Netherlands': 'NL',
  'Sweden': 'SE',
  'Norway': 'NO',
  'Denmark': 'DK',
  'Finland': 'FI',
  'Poland': 'PL',
  'Turkey': 'TR',
  'South Africa': 'ZA',
  'Argentina': 'AR',
  'Chile': 'CL',
  'Colombia': 'CO',
  'Peru': 'PE',
  'Venezuela': 'VE',
  'Egypt': 'EG',
  'Nigeria': 'NG',
  'Kenya': 'KE',
  'Ghana': 'GH',
  'Morocco': 'MA',
  'Saudi Arabia': 'SA',
  'UAE': 'AE',
  'United Arab Emirates': 'AE',
  'Israel': 'IL',
  'Thailand': 'TH',
  'Vietnam': 'VN',
  'Philippines': 'PH',
  'Indonesia': 'ID',
  'Malaysia': 'MY',
  'Singapore': 'SG',
  'New Zealand': 'NZ',
  'Ireland': 'IE',
  'Portugal': 'PT',
  'Belgium': 'BE',
  'Switzerland': 'CH',
  'Austria': 'AT',
  'Czech Republic': 'CZ',
  // add more entries as needed
};

// helper to get a 2-letter country code
const getCountryCode = (country) => {
  if (!country) return '';
  // if already an ISO code like 'US' or 'GB'
  if (/^[A-Za-z]{2}$/.test(country)) return country.toUpperCase();
  return countryCodeMap[country] || '';
};

// Add same helpers at top of WaitingRoom.js
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
  const rawName = obj.name || obj.displayName || obj.display_name || obj.username || obj.fullName || obj.full_name || '';
  const name = titleCase(rawName);
  const email = obj.email || obj.user_email || obj.mail || '';
  const gender = obj.gender || obj.sex || '';
  const country = obj.country || obj.location || obj.countryName || '';
  const isAnonymous = obj.isAnonymous ?? obj.anonymous ?? obj.is_anonymous ?? false;
  return { id, name, email, gender, country, isAnonymous, raw: obj };
};

const WaitingRoom = ({ socket, user }) => {
  console.log('User prop in WaitingRoom:', user);
  const navigate = useNavigate();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchCountdown, setSearchCountdown] = useState(10);
  const [stats, setStats] = useState({
    totalUsers: 1250,
    onlineNow: 0,
    countries: 0
  });

  // Add state for real-time stats near top of component
  const [onlineCount, setOnlineCount] = React.useState(0);
  const [onlineUsersList, setOnlineUsersList] = React.useState([]);
  const [countriesCount, setCountriesCount] = React.useState(0);

  // normalize current user early so we can ensure lists include self
  const normalizedUser = React.useMemo(() => normalizeUser(user || {}), [user]);

  // helper to normalize/dedupe incoming lists and always include self (socket.id fallback)
  const ensureSelfInList = (incoming) => {
    const arr = Array.isArray(incoming) ? incoming.map(normalizeUser).filter(Boolean) : [];
    const seen = new Map();
    const out = [];
    arr.forEach(u => {
      const key = u.id ? `id:${u.id}` : `name:${u.name || ''}`;
      if (!seen.has(key)) { seen.set(key, true); out.push(u); }
    });
    // prefer normalizedUser if it has a name or id
    if (normalizedUser && (normalizedUser.id || normalizedUser.name)) {
      const selfKey = normalizedUser.id ? `id:${normalizedUser.id}` : `name:${normalizedUser.name}`;
      if (!seen.has(selfKey)) out.unshift(normalizedUser);
    } else if (socket && socket.id) {
      const socketKey = `id:${socket.id}`;
      if (!seen.has(socketKey)) out.unshift({ id: socket.id, name: 'You', isAnonymous: true, raw: {} });
    }
    return out;
  };

  // Search countdown effect
  useEffect(() => {
    let interval;
    if (isSearching && searchCountdown > 0) {
      interval = setInterval(() => {
        setSearchCountdown(prev => {
          if (prev <= 1) {
            // Countdown reached 0, restart search if no match found
            handleFindMatch();
            return 10;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSearching, searchCountdown]);

  useEffect(() => {
    if (!socket) return;

    // Helper to send register/connect payload to server (use socket.id as fallback id)
    const sendConnected = () => {
      const payload = {
        id: normalizedUser?.id || socket.id,
        name: normalizedUser?.name || 'Guest',
        country: normalizedUser?.country || '',
        gender: normalizedUser?.gender || '',
        isAnonymous: normalizedUser?.isAnonymous || false,
        socketId: socket.id
      };
      try {
        socket.emit('user-join', payload);
        console.debug('Emitted user-join', payload);
      } catch (e) {
        console.warn('Failed to emit user-join', e);
      }
    };

    // When socket connects (or immediately if already connected) tell server who we are
    socket.on('connect', sendConnected);
    if (socket.connected) sendConnected();

    // Inform server on disconnect (server can map by socketId or id)
    const handleDisconnect = (reason) => {
      try {
        socket.emit('user-disconnected', { id: normalizedUser?.id || socket.id, socketId: socket.id, reason });
        console.debug('Emitted user-disconnected', socket.id, reason);
      } catch (e) {
        console.warn('Failed to emit user-disconnected', e);
      }
    };
    socket.on('disconnect', handleDisconnect);

    socket.on('user-list-updated', (users) => {
      // normalize incoming list, dedupe, and ensure current user is present
      const list = ensureSelfInList(users);
      setOnlineUsers(list);
      setOnlineUsersList(list);
      setOnlineCount(list.length);
      setStats(prev => ({ ...prev, onlineNow: list.length, countries: new Set(list.map(u => u.country)).size }));
      setCountriesCount(new Set(list.map(u => u.country)).size);
    });

    socket.on('match-found', (data) => {
      setIsSearching(false);
      toast.dismiss('searching');
      toast.success('Match found! Connecting...');
      navigate('/chat', { state: { roomId: data.roomId, matchedUser: data.matchedUser } });
    });

    socket.on('no-match-found', () => {
      setIsSearching(false);
      toast.dismiss('searching');
      toast.error('No available users found. Please try again.');
    });

    socket.on('online-stats', (data) => {
      // expected data shape (from server): { count: number, users: [...], countries: {...} }
      const list = ensureSelfInList(data.users || []);
      const count = Array.isArray(list) ? list.length : (typeof data.count === 'number' ? data.count : 0);
      setOnlineCount(count);
      setOnlineUsersList(list);
      setOnlineUsers(list);
      setStats(prev => ({ ...prev, onlineNow: count }));
      if (data.countries && typeof data.countries === 'object') {
        setCountriesCount(Object.keys(data.countries).length);
      } else {
        const uniq = new Set(list.map(u => (u && u.country) ? u.country.toString().trim() : '').filter(Boolean));
        setCountriesCount(uniq.size);
      }
    });

    // When a user joins the conversation (specific event) — show 1 active user in the conversation
    socket.on('user-joined-conversation', (payload) => {
      const incoming = normalizeUser(payload?.user || payload);
      if (!incoming) return;
      setOnlineUsers(prev => {
        const exists = prev.some(u => (u.id && incoming.id) ? u.id === incoming.id : u.name === incoming.name);
        return exists ? prev : [incoming, ...prev];
      });
      // show the conversation as having 1 active user (joined)
      const list = ensureSelfInList([incoming]);
      setStats(prev => ({ ...prev, onlineNow: list.length || 1 }));
      setOnlineCount(list.length || 1);
      setOnlineUsersList(list);
      toast.success(`${incoming.name || 'A user'} joined the conversation`);
    });

    // Generic user joined event — increment counters and add to lists if not present
    socket.on('user-joined', (userObj) => {
      const incoming = normalizeUser(userObj);
      if (!incoming) return;
      setOnlineUsers(prev => {
        const exists = prev.some(u => (u.id && incoming.id) ? u.id === incoming.id : u.name === incoming.name);
        if (exists) return prev;
        const next = [incoming, ...prev];
        setOnlineUsersList(next);
        // recompute authoritative count from list
        setOnlineCount(next.length);
        setStats(prev => ({ ...prev, onlineNow: next.length }));
        return next;
      });
    });

    // request immediate stats snapshot from server (server should reply with 'online-stats')
    try {
      socket.emit('request-online-stats');
    } catch (e) {
      console.warn('Failed to emit request-online-stats', e);
    }

    return () => {
      socket.off('connect', sendConnected);
      socket.off('disconnect', handleDisconnect);
      socket.off('user-list-updated');
      socket.off('match-found');
      socket.off('no-match-found');
      socket.off('online-stats');
      socket.off('user-joined-conversation');
      socket.off('user-joined');
    };
  }, [socket, navigate, normalizedUser]);

  const handleFindMatch = () => {
    if (isSearching) return;

    setIsSearching(true);
    socket.emit('find-match', {
      gender: user?.gender,
      country: user?.country
    });

    toast.loading('Searching for your perfect match...', { 
      id: 'searching',
      duration: Infinity 
    });
  };

  const handleCancelSearch = () => {
    setIsSearching(false);
    socket.emit('cancel-search');
    toast.dismiss('searching');
    toast('Search cancelled', { icon: '⏹️' });
  };

  const handleBack = () => {
    navigate(-1);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Floating animation variants
  const floatingAnimation = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const pulseAnimation = {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-8 relative overflow-hidden bg-gray-100">
  <div className="max-w-6xl w-full mx-auto mt-6 relative z-10 flex flex-col gap-8">

        {/* Header */}
        <motion.div
          className="text-center space-y-6"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
        >
          <motion.div
            className="flex justify-center items-center gap-3"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            <div className="p-4 bg-blue-600 rounded-2xl shadow-lg">
              <Crown size={32} className="text-white" />
            </div>
          </motion.div>

          <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight">
            <span className="text-blue-600">
              Welcome to
            </span>
            <br />
            <span className="text-blue-800">
              VideoChat!
            </span>
          </h1>

          <motion.p
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            You're now in the waiting room. Find someone amazing to chat with from around the world!
          </motion.p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - User Info */}
          <motion.div
            className="lg:col-span-1 space-y-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* User Profile Card */}
            <motion.div
              className="bg-white rounded-2xl p-6 relative overflow-hidden shadow-lg border border-gray-200"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative space-y-4 text-center">
                <motion.div
                  className="w-24 h-24 mx-auto bg-blue-600 rounded-full flex items-center justify-center relative"
                  {...floatingAnimation}
                >
                  <User size={40} className="text-white" />
                </motion.div>

                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {normalizedUser?.isAnonymous ? 'Anonymous User' : normalizedUser?.name}
                  </h3>

                  <div className="flex flex-col gap-2 items-center">
                    {normalizedUser?.gender && (
                      <motion.div
                        className="flex items-center gap-2 text-gray-700 bg-gray-100 px-3 py-1 rounded-full"
                        whileHover={{ scale: 1.05 }}
                      >
                        <Users size={14} />
                        <span className="capitalize text-sm">{normalizedUser.gender}</span>
                      </motion.div>
                    )}
                    {normalizedUser?.country && (
                      <motion.div
                        className="flex items-center gap-2 text-gray-700 bg-gray-100 px-3 py-1 rounded-full"
                        whileHover={{ scale: 1.05 }}
                      >
                        <ReactCountryFlag
                          countryCode={getCountryCode(normalizedUser.country)}
                          svg
                          style={{
                            width: '16px',
                            height: '12px',
                          }}
                        />
                        <span className="text-sm">{normalizedUser.country}</span>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles size={18} className="text-blue-600" />
                Quick Stats
              </h4>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-gray-700">
                  <span>Your Status</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-600 text-sm">Online</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-gray-700">
                  <span>Search Time</span>
                  <span className="text-blue-600 font-mono">{isSearching ? `${searchCountdown}s` : '0:00'}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Main Content */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {/* Stats Grid */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {[
                {
                  icon: Users,
                  value: onlineCount,
                  label: 'Online Now',
                  color: 'bg-blue-600',
                  description: 'Active users'
                },
                {
                  icon: Globe,
                  value: countriesCount,
                  label: 'Countries',
                  color: 'bg-green-600',
                  description: 'Global reach'
                }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="bg-white rounded-2xl p-6 text-center relative overflow-hidden shadow-lg border border-gray-200 group"
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className={`w-16 h-16 mx-auto ${stat.color} rounded-2xl flex items-center justify-center mb-4 relative`}
                    {...floatingAnimation}
                  >
                    <stat.icon size={28} className="text-white" />
                  </motion.div>

                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-900 font-semibold mb-1">{stat.label}</div>
                  <div className="text-gray-600 text-sm">{stat.description}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* Online Users */}
            {onlineUsers.length > 0 && (
              <motion.div
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Users size={20} className="text-blue-600" />
                    Online Users
                  </h3>
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>{onlineCount} active</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 justify-center">
                  {onlineUsers.slice(0, 5).map((user, index) => (
                    <motion.div
                      key={index}
                      className="bg-gray-100 px-4 py-2 rounded-full text-gray-700 text-sm flex items-center gap-2 border border-gray-200 hover:border-blue-300 transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        className="w-2 h-2 bg-green-500 rounded-full"
                        {...pulseAnimation}
                      />
                      {user.isAnonymous || !user.name ? (
                        <span className="text-gray-600">Anonymous</span>
                      ) : (
                        // show masked name to avoid revealing full identity
                        <span>{maskName(user.name)}</span>
                      )}
                    </motion.div>
                  ))}
                  {onlineUsers.length > 5 && (
                    <div className="bg-gray-100 px-4 py-2 rounded-full text-gray-600 text-sm border border-gray-200">
                      +{onlineUsers.length - 5} more
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Search Section */}
            <motion.div
              className="bg-white rounded-2xl p-8 text-center shadow-lg border border-gray-200"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <AnimatePresence mode="wait">
                {!isSearching ? (
                  <motion.div
                    key="ready"
                    className="space-y-6"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <motion.div
                      className="w-20 h-20 mx-auto bg-green-600 rounded-2xl flex items-center justify-center"
                      {...floatingAnimation}
                    >
                      <Target size={32} className="text-white" />
                    </motion.div>

                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Ready to Connect?
                      </h3>
                      <p className="text-gray-600">
                        Find someone amazing to chat with from around the world
                      </p>
                    </div>

                    <motion.button
                      onClick={handleFindMatch}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold flex items-center justify-center gap-3 mx-auto transition-colors duration-200"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={onlineCount < 2}
                    >
                      <Search size={20} />
                      <span>{onlineCount < 2 ? 'Waiting for more users...' : 'Find a Match'}</span>
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="searching"
                    className="space-y-6"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <motion.div
                      className="w-20 h-20 mx-auto border-4 border-blue-600 border-t-transparent rounded-full flex items-center justify-center"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Zap size={32} className="text-blue-600" />
                    </motion.div>

                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Finding Your Match...
                      </h3>
                      <p className="text-gray-600 mb-2">
                        Searching through {onlineCount} online users
                      </p>
                      <div className="text-blue-600 font-mono text-lg">
                        {searchCountdown}s remaining
                      </div>
                    </div>

                    <div className="flex gap-3 justify-center">
                      <motion.button
                        onClick={handleCancelSearch}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-xl font-semibold flex items-center gap-2 transition-colors duration-200"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <RotateCcw size={16} />
                        Cancel
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Back Button */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <motion.button
                onClick={handleBack}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-xl font-semibold flex items-center gap-2 mx-auto transition-colors duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowLeft size={18} />
                Go Back
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default WaitingRoom;