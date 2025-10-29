import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Globe, Clock, Video, Wifi, WifiOff, User, MapPin, Sparkles, Zap, Search, RotateCcw, Crown, Target, ArrowLeft, Send } from 'lucide-react';
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
  // capture socket id if server includes it on user objects
  const socketId = obj.socketId || obj.socket_id || obj.socket || obj.socketid || null;
  const rawName = obj.name || obj.displayName || obj.display_name || obj.username || obj.fullName || obj.full_name || '';
  const name = titleCase(rawName);
  const email = obj.email || obj.user_email || obj.mail || '';
  const gender = obj.gender || obj.sex || '';
  const country = obj.country || obj.location || obj.countryName || '';
  const isAnonymous = obj.isAnonymous ?? obj.anonymous ?? obj.is_anonymous ?? false;
  return { id, socketId, name, email, gender, country, isAnonymous, raw: obj };
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

  // Video & chat state
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const [previewActive, setPreviewActive] = useState(false);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');

  // WebRTC state
  const peerConnections = useRef({}); // keyed by remote socketId
  const [inCallWith, setInCallWith] = useState(null); // remote socketId
  const [muted, setMuted] = useState(false);

  // Basic STUN servers (add TURN for production)
  const rtcConfig = React.useMemo(() => ({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }), []);

  // attach local tracks to a peer connection
  const setLocalTracksToPC = (pc) => {
    if (!pc || !localStream) return;
    try {
      // Remove existing senders for idempotency (optional)
      const existingSenders = pc.getSenders ? pc.getSenders() : [];
      localStream.getTracks().forEach(track => {
        const has = existingSenders.some(s => s.track && s.track.kind === track.kind);
        if (!has) pc.addTrack(track, localStream);
      });
    } catch (e) {
      console.warn('Failed to set local tracks to PC', e);
    }
  };

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

    // WebRTC signaling handlers
    const onOffer = async ({ from, sdp, type }) => {
      // 'from' is caller socket id
      if (!from) return;
      await startPreview();
      const pc = getOrCreatePC(from);
      try {
        await pc.setRemoteDescription({ type: type || 'offer', sdp });
        setLocalTracksToPC(pc);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('webrtc-answer', { to: from, sdp: answer.sdp, type: answer.type });
        setInCallWith(from);
      } catch (e) {
        console.error('Error handling offer', e);
      }
    };

    const onAnswer = async ({ from, sdp, type }) => {
      if (!from) return;
      const entry = peerConnections.current[from];
      if (!entry) return;
      try {
        await entry.pc.setRemoteDescription({ type: type || 'answer', sdp });
      } catch (e) {
        console.error('Error applying answer', e);
      }
    };

    const onIce = async ({ from, candidate }) => {
      if (!from || !candidate) return;
      const entry = peerConnections.current[from];
      if (!entry) return;
      try {
        await entry.pc.addIceCandidate(candidate);
      } catch (e) {
        console.warn('Failed to add ICE candidate', e);
      }
    };

    const onHangup = ({ from }) => {
      if (!from) return;
      hangupCall(from);
    };

    socket.on('webrtc-offer', onOffer);
    socket.on('webrtc-answer', onAnswer);
    socket.on('webrtc-ice-candidate', onIce);
    socket.on('call-hangup', onHangup);

    // chat handlers: receive history and new messages
    const onHistory = (history) => {
      const arr = Array.isArray(history) ? history.map(h => ({ ...h })) : [];
      setMessages(arr);
    };
    const onMessage = (msg) => {
      if (!msg) return;
      setMessages(prev => [...prev, msg]);
    };
    socket.on('message-history', onHistory);
    socket.on('chat-message', onMessage);

    // request message history for waiting room (server should implement)
    try { socket.emit('request-message-history'); } catch (e) {}

    // automatic local preview start so users can see themselves (optional)
    // do not force if user already has given permission; start preview quietly
    // note: mobile browsers may block autoplay; user may need to tap to enable
    startPreview().catch(()=>{});

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
        socket.emit('user-connected', payload);
        console.debug('Emitted user-connected', payload);
      } catch (e) {
        console.warn('Failed to emit user-connected', e);
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
      // cleanup chat handlers + stops
      socket.off('message-history', onHistory);
      socket.off('chat-message', onMessage);
      socket.off('webrtc-offer', onOffer);
      socket.off('webrtc-answer', onAnswer);
      socket.off('webrtc-ice-candidate', onIce);
      socket.off('call-hangup', onHangup);
      stopPreview();
      // Close and cleanup any remaining peer connections
      try {
        Object.keys(peerConnections.current || {}).forEach(k => {
          const e = peerConnections.current[k];
          try { e.pc && e.pc.close(); } catch (err) {}
          try { e.remoteStream && e.remoteStream.getTracks().forEach(t => t.stop()); } catch(err){}
          delete peerConnections.current[k];
        });
      } catch (err) { console.warn('Error cleaning peerConnections', err); }
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

  // start local preview (safe: only request when user allows)
  const startPreview = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(s);
      if (localVideoRef.current) localVideoRef.current.srcObject = s;
      setPreviewActive(true);
    } catch (err) {
      console.warn('getUserMedia failed', err);
      toast.error('Unable to access camera/microphone');
    }
  };

  const stopPreview = () => {
    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
      setLocalStream(null);
      if (localVideoRef.current) localVideoRef.current.srcObject = null;
    }
    setPreviewActive(false);
  };

  // create or get existing PeerConnection for a remote
  const getOrCreatePC = (remoteSocketId) => {
    if (!remoteSocketId) return null;
    if (peerConnections.current[remoteSocketId]) return peerConnections.current[remoteSocketId].pc;
    const pc = new RTCPeerConnection(rtcConfig);
    const remoteStream = new MediaStream();
    // attach tracks from remote
    pc.ontrack = (ev) => {
      ev.streams?.[0] && ev.streams[0].getTracks().forEach(t => remoteStream.addTrack(t));
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
    };
    pc.onicecandidate = (ev) => {
      if (ev.candidate) {
        try {
          socket.emit('webrtc-ice-candidate', { to: remoteSocketId, candidate: ev.candidate });
        } catch (e) { console.warn(e); }
      }
    };
    peerConnections.current[remoteSocketId] = { pc, remoteStream };
    return pc;
  };

  // start call to a remote user (must have socketId)
  const initiateCall = async (remoteUser) => {
    const targetSocketId = remoteUser.socketId || remoteUser.raw?.socketId || remoteUser.raw?.socket_id;
    if (!targetSocketId) {
      toast.error('Cannot call: user has no socket id');
      return;
    }
    await startPreview(); // ensure local stream present
    const pc = getOrCreatePC(targetSocketId);
    // add local tracks
    setLocalTracksToPC(pc);
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('webrtc-offer', { to: targetSocketId, sdp: offer.sdp, type: offer.type });
      setInCallWith(targetSocketId);
    } catch (e) {
      console.error('Failed to create/send offer', e);
      toast.error('Call failed');
    }
  };

  const hangupCall = (remoteSocketId) => {
    const key = remoteSocketId || inCallWith;
    if (!key) return;
    const entry = peerConnections.current[key];
    if (entry) {
      try { entry.pc.close(); } catch (e) { /* ignore */ }
      try { entry.remoteStream && entry.remoteStream.getTracks().forEach(t => t.stop()); } catch(e){}
      delete peerConnections.current[key];
    }
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setInCallWith(null);
    try { socket.emit('call-hangup', { to: key }); } catch (e) { console.warn(e); }
  };

  const sendMessage = () => {
    if (!messageInput.trim()) return;

    const local = normalizeUser(user) || {};

    const messageData = {
      text: messageInput,
      sender: local.name || (user && user.name) || (user && user.username) || 'You',
      senderId: local.id || user?.id,
      timestamp: new Date().toISOString(),
      country: local.country || user?.country || '',
      isAnonymous: local.isAnonymous ?? false
    };

    socket.emit('chat-message', messageData);
    setMessages(prev => [...prev, messageData]);
    setMessageInput('');
  };

  return (
    <div className="waiting-room">
      <Header />
      <div className="content">
        <div className="user-info">
          <div className="avatar">
            <ReactCountryFlag countryCode={getCountryCode(user?.country)} svg style={{ width: '100%', height: '100%' }} />
          </div>
          <div className="details">
            <h2>{user ? user.name : 'Guest'}</h2>
            <p>{user ? user.email : 'Not logged in'}</p>
            <p>{user ? user.country : 'Unknown location'}</p>
          </div>
        </div>
        <div className="actions">
          <button onClick={handleFindMatch} disabled={isSearching}>
            {isSearching ? 'Searching...' : 'Find a Match'}
          </button>
          <button onClick={handleCancelSearch} disabled={!isSearching}>
            Cancel Search
          </button>
          <button onClick={handleBack}>
            <ArrowLeft /> Back
          </button>
        </div>
        <div className="stats">
          <div className="stat-item">
            <Users />
            <span>{stats.totalUsers}</span>
          </div>
          <div className="stat-item">
            <Globe />
            <span>{stats.countries}</span>
          </div>
          <div className="stat-item">
            <Clock />
            <span>{formatTime(searchCountdown)}</span>
          </div>
        </div>
        <div className="online-users">
          <h3>Online Users</h3>
          <div className="user-list">
            {onlineUsers.map((u, idx) => (
              <motion.div key={u.id || idx} className="user-item" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="avatar">
                  <ReactCountryFlag countryCode={getCountryCode(u.country)} svg style={{ width: '100%', height: '100%' }} />
                </div>
                <div className="info">
                  <h4>{u.name}</h4>
                  <p>{u.country}</p>
                </div>
                <div className="actions">
                  <button onClick={() => initiateCall(u)} disabled={inCallWith !== null}>
                    <Video />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="chat">
          <div className="messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.fromMe ? 'from-me' : 'from-them'}`}>
                <div className="avatar">
                  <ReactCountryFlag countryCode={getCountryCode(msg.sender?.country)} svg style={{ width: '100%', height: '100%' }} />
                </div>
                <div className="bubble">
                  <div className="info">
                    <span className="name">{msg.sender?.name || 'Unknown'}</span>
                    <span className="time">{formatTime(msg.timestamp)}</span>
                  </div>
                  <div className="text">{msg.text}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="input-area">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type your message..."
            />
            <button onClick={sendMessage}>
              <Send />
            </button>
          </div>
        </div>
      </div>
      <div className="video-preview" style={{ display: previewActive ? 'block' : 'none' }}>
        <video ref={localVideoRef} autoPlay muted />
      </div>
      <div className="remote-video" style={{ display: inCallWith ? 'block' : 'none' }}>
        <video ref={remoteVideoRef} autoPlay />
      </div>
      <AnimatePresence>
        {isSearching && (
          <motion.div className="searching-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="spinner">
              <div className="double-bounce1"></div>
              <div className="double-bounce2"></div>
            </div>
            <p>Searching for a match...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WaitingRoom;