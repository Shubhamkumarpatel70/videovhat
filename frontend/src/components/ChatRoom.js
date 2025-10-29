import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  MessageCircle,
  Send,
  User,
  Globe,
  Settings,
  Wifi,
  WifiOff,
  SkipForward,
  Shield,
  Volume2,
  VolumeX,
  Crown,
  Sparkles,
  ArrowLeft,
  Zap,
  MoreVertical,
  Grid,
  PictureInPicture
} from 'lucide-react';
import toast from 'react-hot-toast';
import ReactCountryFlag from 'react-country-flag';

// minimal country map (keep consistent with WaitingRoom)
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
};

// helper to get 2-letter code (more robust)
const countryAliases = {
  'united states of america': 'US',
  'united states': 'US',
  'u.s.': 'US',
  'u.s.a.': 'US',
  'england': 'GB',
  'scotland': 'GB',
  'north korea': 'KP',
  'south korea': 'KR',
  'korea': 'KR',
  'korea, south': 'KR',
  'viet nam': 'VN',
  'ivory coast': 'CI'
};

const getCountryCode = (country) => {
  if (!country) return '';
  if (typeof country !== 'string') return '';

  const raw = country.trim();
  // If passed something like "United States (US)" extract the code
  const parenMatch = raw.match(/\(([A-Za-z]{2})\)/);
  if (parenMatch) return parenMatch[1].toUpperCase();

  // If already a 2-letter code
  if (/^[A-Za-z]{2}$/.test(raw)) return raw.toUpperCase();

  const key = raw.toLowerCase();
  // Direct map by exact key (original map had capitalized keys)
  if (countryCodeMap[raw]) return countryCodeMap[raw];
  if (countryCodeMap[key]) return countryCodeMap[key];
  if (countryAliases[key]) return countryAliases[key];

  // try first part before commas (e.g. "City, Country")
  const first = key.split(',')[0].trim();
  if (countryCodeMap[first]) return countryCodeMap[first];
  if (countryAliases[first]) return countryAliases[first];

  // fallback: try substring match against known map keys
  for (const k in countryCodeMap) {
    if (key.includes(k.toLowerCase())) return countryCodeMap[k];
  }

  return '';
};

// helper to interpret anonymous flag robustly
const isAnonymousFlag = (u) => {
  if (!u) return false;
  const val = u.isAnonymous ?? u.anonymous ?? u.is_anonymous ?? false;
  return val === true || val === 'true' || val === '1' || val === 1;
};

// helper to get best display name from various possible fields
const getDisplayName = (u) => {
  if (!u) return '';
  return u.name || u.displayName || u.display_name || u.username || u.userName || u.fullName || u.full_name || '';
};

// Add normalization helpers for consistent user/message shape and nicer display
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

  // common aliases
  const id = obj.id || obj._id || obj.userId || obj.uid || null;
  const rawName = obj.name || obj.displayName || obj.display_name || obj.username || obj.fullName || obj.full_name || '';
  const name = titleCase(rawName);
  const email = obj.email || obj.user_email || obj.mail || '';
  const gender = obj.gender || obj.sex || '';
  const country = obj.country || obj.location || obj.countryName || '';
  const isAnonymous = obj.isAnonymous ?? obj.anonymous ?? obj.is_anonymous ?? false;

  return { id, name, email, gender, country, isAnonymous, raw: obj };
};

const normalizeMessage = (m) => {
  if (!m) return m;
  const msg = { ...m };
  // normalize sender fields
  msg.sender = msg.sender || msg.name || msg.username || (msg.user && (msg.user.name || msg.user.username)) || 'Unknown';
  msg.senderId = msg.senderId || msg.sender_id || msg.userId || msg.user?.id || null;
  msg.timestamp = msg.timestamp || new Date().toISOString();
  msg.country = msg.country || msg.location || msg.user?.country || '';
  msg.isAnonymous = msg.isAnonymous ?? msg.is_anonymous ?? msg.anonymous ?? false;
  return msg;
};

const ChatRoom = ({ socket, user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomId, matchedUser: stateMatchedUser } = location.state || {};

  // normalize initial matchedUser if provided
  const [matchedUser, setMatchedUser] = useState(() => normalizeUser(stateMatchedUser) || null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  // tracks socket (server) connection separately from peer connection
  const [socketConnected, setSocketConnected] = useState(!!(socket && socket.connected));
  const [isSkipping, setIsSkipping] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [isRemoteVideoOn, setIsRemoteVideoOn] = useState(true);
  const [viewMode, setViewMode] = useState('pip'); // 'pip' or 'split'

  // keep a reference to the local MediaStream so we can add/stop tracks later
  const localStreamRef = useRef(null);

  // permission modal state
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [permissionErrorMsg, setPermissionErrorMsg] = useState('');

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const callTimerRef = useRef(null);
  // ADD: track whether we've announced presence to server
  const joinedRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Call timer effect
  useEffect(() => {
    if (isConnected) {
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [isConnected]);

  useEffect(() => {
    if (!socket || !roomId) {
      navigate('/');
      return;
    }

    initializeWebRTC();

    // Socket event listeners
    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleIceCandidate);
    socket.on('receive-message', handleReceiveMessage);
    socket.on('call-ended', handleCallEnded);
    socket.on('skip-matched', handleSkipMatched);
    socket.on('user-video-toggle', handleRemoteVideoToggle);
    socket.on('current-match', handleCurrentMatch);

    return () => {
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
      socket.off('receive-message');
      socket.off('call-ended');
      socket.off('skip-matched');
      socket.off('user-video-toggle');
      socket.off('current-match');
    };
  }, [socket, roomId]);

  // listen for socket (server) connect/disconnect to reflect server status in UI
  useEffect(() => {
    if (!socket) {
      setSocketConnected(false);
      return;
    }

    // initial state
    setSocketConnected(!!socket.connected);

    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);
    const onConnectError = () => setSocketConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
    };
  }, [socket]);

  // helper to create peer connection and attach event handlers (used whether or not media is available)
  const createPeerConnection = () => {
    if (peerConnectionRef.current) return;

    peerConnectionRef.current = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ],
      iceCandidatePoolSize: 10
    });

    peerConnectionRef.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        // assign remote stream and attempt to play
        remoteVideoRef.current.srcObject = event.streams[0];
        setIsRemoteVideoOn(true);

        // Start the call timer when remote media arrives (indicates chat started).
        // Only reset duration if we were not already marked as connected.
        setIsConnected(prev => {
          if (!prev) {
            setCallDuration(0);
          }
          return true;
        });

        try { remoteVideoRef.current.play(); } catch (e) { /* autoplay blocked; user will interact */ }
      }
    };

    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          candidate: event.candidate,
          roomId: roomId
        });
      }
    };

    peerConnectionRef.current.onconnectionstatechange = () => {
      const connectionState = peerConnectionRef.current?.connectionState;
      if (connectionState === 'connected') {
        setIsConnected(true);
        toast.success('Connection established!');
      } else if (connectionState === 'disconnected' || connectionState === 'failed') {
        setIsConnected(false);
        toast.error('Connection lost');
      }
    };
  };

  // Ensure local media is available and attached to the peer connection.
  const ensureLocalMedia = async () => {
    // If we already have a local stream with tracks, ensure those tracks are added to the peer connection
    if (localStreamRef.current && localStreamRef.current.getTracks().length > 0) {
      if (peerConnectionRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          const senderExists = peerConnectionRef.current.getSenders().some(s => s.track && s.track.kind === track.kind);
          if (!senderExists) {
            peerConnectionRef.current.addTrack(track, localStreamRef.current);
          }
        });
      }
      return localStreamRef.current;
    }

    // Otherwise, request media from the user
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 }
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });

    localStreamRef.current = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
      try { await localVideoRef.current.play(); } catch (e) { /* autoplay may be blocked */ }
    }

    if (peerConnectionRef.current) {
      stream.getTracks().forEach(track => peerConnectionRef.current.addTrack(track, stream));
    }

    setIsVideoOn(!!stream.getVideoTracks().length);
    setIsAudioOn(!!stream.getAudioTracks().length);
    return stream;
  };

  const initializeWebRTC = async () => {
    try {
      // Always create peer connection so we can still receive remote tracks even without local media
      createPeerConnection();
      // try to obtain local media but don't fail the flow if user declines
      await ensureLocalMedia();
    } catch (error) {
      console.error('Error accessing media devices:', error);
      // If permission denied (or similar), show modal to let user retry / continue without media
      const name = error?.name || '';
      if (name === 'NotAllowedError' || name === 'PermissionDenied' || name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        setPermissionErrorMsg(error.message || 'Camera/microphone permission denied or not available.');
        setPermissionModalVisible(true);
        // still leave peer connection created so remote tracks can be received
      } else {
        toast.error('Unable to access camera/microphone. Please check permissions.');
      }
    }
  };

  // Handlers for permission modal actions
  const handleRetryPermission = async () => {
    setPermissionModalVisible(false);
    setPermissionErrorMsg('');
    try {
      await initializeWebRTC();
      toast.success('Retrying permission prompt');
    } catch (err) {
      console.error('Retry permission error', err);
      toast.error('Retry failed');
    }
  };

  const handleContinueWithoutMedia = () => {
    setPermissionModalVisible(false);
    setPermissionErrorMsg('');
    // Disable local media flags so UI reflects no camera/mic
    setIsVideoOn(false);
    setIsAudioOn(false);
    toast('Continuing without camera/microphone', { icon: 'ℹ️' });
    // Ensure peer connection exists to still receive remote tracks
    createPeerConnection();
  };

  const handleLeaveDueToPermission = () => {
    setPermissionModalVisible(false);
    setPermissionErrorMsg('');
    toast('Leaving chat since camera/microphone not available', { icon: '⚠️' });

    try {
      if (joinedRef.current && socket) {
        const normalized = normalizeUser(user) || {};
        socket.emit('user-left-chat', { roomId, userId: normalized.id });
        joinedRef.current = false;
      }
    } catch (err) { console.warn('user-left-chat emit failed', err); }

    navigate('/waiting');
  };

  const handleOffer = async (data) => {
    try {
      await peerConnectionRef.current.setRemoteDescription(data.offer);
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      
      socket.emit('answer', {
        answer: answer,
        roomId: roomId
      });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  };

  const handleAnswer = async (data) => {
    try {
      await peerConnectionRef.current.setRemoteDescription(data.answer);
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  };

  const handleIceCandidate = async (data) => {
    try {
      await peerConnectionRef.current.addIceCandidate(data.candidate);
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  };

  const handleReceiveMessage = (data) => {
    setMessages(prev => [...prev, normalizeMessage(data)]);
  };

  const handleCallEnded = () => {
    toast.success('Call ended');
    // ensure timer/state reset
    setIsConnected(false);
    setCallDuration(0);
    // mark left locally (server should already have sent this, but be safe)
    joinedRef.current = false;
    navigate('/waiting');
  };

  const handleSkipMatched = (data) => {
    setIsSkipping(false);
    toast.dismiss('skipping');
    toast.success('Connected to new match!');
    // reset call timer for the new match
    setIsConnected(false);
    setCallDuration(0);

    const normalized = normalizeUser(data.matchedUser);
    // ensure UI shows normalized data immediately
    setMatchedUser(normalized);

    navigate('/chat', { 
      state: { roomId: data.roomId, matchedUser: data.matchedUser },
      replace: true 
    });
  };

  const handleRemoteVideoToggle = (data) => {
    setIsRemoteVideoOn(data.videoOn);
  };

  const handleCurrentMatch = (data) => {
    if (data?.matchedUser) {
      setMatchedUser(normalizeUser(data.matchedUser));
    } else {
      toast.warn('Matched user details not available');
    }
  };

  const toggleVideo = () => {
    // If no local video track exists, request media (user wants to start their camera)
    const localStream = localStreamRef.current || localVideoRef.current?.srcObject;
    if (!localStream || localStream.getVideoTracks().length === 0) {
      ensureLocalMedia().then((stream) => {
        const vTrack = stream.getVideoTracks()[0];
        if (vTrack) {
          setIsVideoOn(true);
          socket.emit('video-toggle', { roomId: roomId, videoOn: true });
        }
      }).catch((err) => {
        // show permission modal if permission denied
        const name = err?.name || '';
        if (name === 'NotAllowedError' || name === 'PermissionDenied') {
          setPermissionErrorMsg(err.message || 'Camera permission denied.');
          setPermissionModalVisible(true);
        } else {
          toast.error('Could not access camera');
        }
      });
      return;
    }

    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOn(videoTrack.enabled);
      socket.emit('video-toggle', { roomId: roomId, videoOn: videoTrack.enabled });
    }
  };

  const toggleAudio = () => {
    if (localVideoRef.current?.srcObject) {
      const audioTrack = localVideoRef.current.srcObject.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
      }
    }
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'pip' ? 'split' : 'pip');
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const local = normalizeUser(user) || {};

    const messageData = {
      text: newMessage,
      sender: local.name || (user && user.name) || (user && user.username) || 'You',
      senderId: local.id || user?.id,
      timestamp: new Date().toISOString(),
      roomId: roomId,
      country: local.country || user?.country || '',
      isAnonymous: local.isAnonymous ?? false
    };

    socket.emit('send-message', messageData);
    setMessages(prev => [...prev, normalizeMessage(messageData)]);
    setNewMessage('');
  };

  const endCall = () => {
    // stop local tracks to free camera/mic
    try {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
        localStreamRef.current = null;
      } else if (localVideoRef.current?.srcObject) {
        const s = localVideoRef.current.srcObject;
        s.getTracks().forEach(t => t.stop());
      }
    } catch (e) { /* ignore */ }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // reset connection/timer state
    setIsConnected(false);
    setCallDuration(0);

    // emit leave presence (so server marks offline / updates DB)
    try {
      if (joinedRef.current && socket) {
        const normalized = normalizeUser(user) || {};
        socket.emit('user-left-chat', { roomId, userId: normalized.id });
        joinedRef.current = false;
      }
    } catch (err) { console.warn('user-left-chat emit failed', err); }

    socket.emit('end-call', { roomId: roomId });
    navigate('/waiting');
  };

  const handleBack = () => {
    try {
      if (joinedRef.current && socket) {
        const normalized = normalizeUser(user) || {};
        socket.emit('user-left-chat', { roomId, userId: normalized.id });
        joinedRef.current = false;
      }
    } catch (err) { console.warn('user-left-chat emit failed', err); }
    navigate(-1);
  };

  const handleSkip = () => {
    if (isSkipping) return;
    setIsSkipping(true);

    // notify server we are leaving this chat instance
    try {
      if (joinedRef.current && socket) {
        const normalized = normalizeUser(user) || {};
        socket.emit('user-left-chat', { roomId, userId: normalized.id });
        joinedRef.current = false;
      }
    } catch (err) { console.warn('user-left-chat emit failed', err); }

    socket.emit('skip-chat', { roomId: roomId });
    toast.loading('Finding your next amazing match...', { 
      id: 'skipping',
      duration: Infinity 
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const floatingAnimation = {
    animate: {
      y: [0, -8, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // derived presentation values for matched user (handle various shapes)
  const matchedIsAnonymous = isAnonymousFlag(matchedUser);
  const matchedDisplayName = getDisplayName(matchedUser) || 'Unknown User';
  const avatarInitial = matchedIsAnonymous ? 'A' : (matchedDisplayName[0]?.toUpperCase() || 'U');

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 relative overflow-hidden">

      {/* Permission Modal */}
      {permissionModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-2">Camera & Microphone Permission</h3>
            <p className="text-sm text-gray-600 mb-4">
              This app needs access to your camera and microphone for video chat. You denied or blocked access.
              You can retry to allow access, continue without camera/microphone (audio/video disabled), or leave the chat.
            </p>
            {permissionErrorMsg && <div className="text-xs text-red-500 mb-3">{permissionErrorMsg}</div>}
            <div className="flex gap-3 justify-end">
              <button onClick={handleLeaveDueToPermission} className="px-4 py-2 rounded-2xl border">Leave</button>
              <button onClick={handleContinueWithoutMedia} className="px-4 py-2 rounded-2xl bg-yellow-500 text-white">Continue without media</button>
              <button onClick={handleRetryPermission} className="px-4 py-2 rounded-2xl bg-blue-600 text-white">Retry</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <motion.div
        className="bg-white px-6 py-4 flex justify-between items-center border-b border-gray-200 shadow-lg relative z-10"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-4 text-gray-900">
          <motion.div
            className="relative"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
              {avatarInitial}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
          </motion.div>

          <div>
            {/* Replace the header name block with the following (keeps most existing markup) */}
            <div>
              <h3 className="text-xl font-bold flex flex-col gap-1 text-gray-900">
                <span className="flex items-center gap-2">
                  {matchedIsAnonymous ? 'Anonymous User' : matchedDisplayName}
                  <Shield size={16} className="text-blue-600" />
                </span>
                <span className="text-sm text-gray-500">
                  {matchedUser?.email ? matchedUser.email : ''}
                  {matchedUser?.email && matchedUser?.gender ? ' • ' : ''}
                  {matchedUser?.gender ? titleCase(matchedUser.gender) : ''}
                </span>
              </h3>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Connected • {formatDuration(callDuration)}</span>
                </div>
                {matchedUser?.country && (
                  (() => {
                    const code = getCountryCode(matchedUser.country);
                    return (
                      <div className="flex items-center gap-1">
                        {code ? (
                          <ReactCountryFlag
                            countryCode={code}
                            svg
                            style={{ width: '18px', height: '12px' }}
                            title={matchedUser.country}
                          />
                        ) : (
                          <Globe size={12} />
                        )}
                        <span>{matchedUser.country}</span>
                      </div>
                    );
                  })()
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Server Connection Status (socket) */}
          <motion.div
            className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm ${
              socketConnected
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {socketConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
            <span>{socketConnected ? 'Server Connected' : 'Connecting to Server'}</span>
          </motion.div>

          {/* Control Buttons */}
          <div className="flex gap-2">
            <motion.button
              onClick={handleBack}
              className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 bg-gray-100 hover:bg-gray-200 text-gray-700"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
            >
              <ArrowLeft size={20} />
            </motion.button>

            <motion.button
              onClick={toggleViewMode}
              className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 bg-gray-100 hover:bg-gray-200 text-gray-700"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
            >
              {viewMode === 'pip' ? <Grid size={20} /> : <PictureInPicture size={20} />}
            </motion.button>

            <motion.button
              onClick={toggleVideo}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                isVideoOn
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
            >
              {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
            </motion.button>

            <motion.button
              onClick={toggleAudio}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                isAudioOn
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
            >
              {isAudioOn ? <Mic size={20} /> : <MicOff size={20} />}
            </motion.button>

            <motion.button
              onClick={endCall}
              className="w-12 h-12 bg-red-600 hover:bg-red-700 rounded-2xl flex items-center justify-center text-white transition-all duration-200"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
            >
              <Phone size={20} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 grid lg:grid-cols-3 gap-6 p-6 relative z-10">
        {/* Video Section */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {viewMode === 'split' ? (
            /* Split View */
            <motion.div
              className="bg-white rounded-3xl overflow-hidden relative flex-1 min-h-[500px] shadow-lg border border-gray-200"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="grid grid-cols-2 h-full">
                {/* Remote Video - Left Half */}
                <div className="relative flex items-center justify-center border-r border-gray-200">
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />

                  {!isRemoteVideoOn && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 text-center p-8 bg-gray-100">
                      <VideoOff size={64} className="mb-4 text-gray-400" />
                      <p className="text-xl font-semibold mb-2">Camera is off</p>
                      <p className="text-gray-500">The other user has turned off their camera</p>
                    </div>
                  )}

                  {/* Video Overlay Info */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full text-gray-900 text-sm flex items-center gap-2 shadow-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Live • {formatDuration(callDuration)}</span>
                  </div>
                </div>

                {/* Local Video - Right Half */}
                <div className="relative flex items-center justify-center">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />

                  {!isVideoOn && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <VideoOff size={32} className="text-gray-400" />
                    </div>
                  )}

                  <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-gray-900 text-xs shadow-lg">
                    You {isVideoOn ? '• Live' : '• Camera off'}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* PIP View */
            <>
              {/* Remote Video */}
              <motion.div
                className="bg-white rounded-3xl overflow-hidden relative flex-1 min-h-[500px] flex items-center justify-center shadow-lg border border-gray-200"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />

                {!isRemoteVideoOn && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 text-center p-8 bg-gray-100">
                    <VideoOff size={64} className="mb-4 text-gray-400" />
                    <p className="text-xl font-semibold mb-2">Camera is off</p>
                    <p className="text-gray-500">The other user has turned off their camera</p>
                  </div>
                )}

                {/* Video Overlay Info */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full text-gray-900 text-sm flex items-center gap-2 shadow-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Live • {formatDuration(callDuration)}</span>
                </div>
              </motion.div>

              {/* Local Video */}
              <motion.div
                className="bg-white rounded-2xl overflow-hidden relative w-64 h-48 self-end shadow-lg border border-gray-200"
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                whileHover={{ scale: 1.05 }}
              >
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />

                {!isVideoOn && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <VideoOff size={32} className="text-gray-400" />
                  </div>
                )}

                <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-gray-900 text-xs shadow-lg">
                  You {isVideoOn ? '• Live' : '• Camera off'}
                </div>
              </motion.div>
            </>
          )}
        </div>

        {/* Chat Section */}
        <motion.div
          className="bg-white rounded-3xl flex flex-col h-[600px] overflow-hidden shadow-lg border border-gray-200"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-3 text-gray-900 font-semibold">
              <div className="p-2 bg-blue-600 rounded-xl">
                <MessageCircle size={20} className="text-white" />
              </div>
              <span>Live Chat</span>
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <MoreVertical size={20} />
            </motion.button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto scrollbar-thin space-y-4 bg-gray-50">
            <AnimatePresence initial={false}>
              {messages.length === 0 ? (
                <motion.div
                  className="flex flex-col items-center justify-center h-full text-gray-400 text-center p-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Sparkles size={48} className="mb-4" />
                  <p className="text-lg font-semibold mb-2">Start a conversation!</p>
                  <p className="text-sm">Say hello and break the ice with your match</p>
                </motion.div>
              ) : (
                messages.map((message, index) => {
                  const isOwn = message.senderId === user.id;
                  return (
                    <motion.div
                      key={index}
                      className={`flex flex-col gap-1 ${isOwn ? 'items-end' : 'items-start'}`}
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      layout
                    >
                      <div
                        className={`px-4 py-3 rounded-2xl max-w-[85%] ${
                          isOwn
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-white text-gray-900 border border-gray-200 shadow-sm'
                        }`}
                      >
                        {message.text}
                      </div>
                      <div className={`text-xs text-gray-500 px-2 flex items-center gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
                        <div className="flex items-center gap-1">
                          {!isOwn && !message.isAnonymous && (
                            <>
                              {message.country ? (
                                <>
                                  <ReactCountryFlag
                                    countryCode={getCountryCode(message.country)}
                                    svg
                                    style={{
                                      width: '14px',
                                      height: '10px',
                                    }}
                                    title={message.country}
                                  />
                                  <span>{message.country}</span>
                                </>
                              ) : (
                                <>
                                  <Globe size={12} />
                                  <span>World</span>
                                </>
                              )}
                            </>
                          )}
                          <span>{isOwn ? 'You' : message.sender}</span>
                        </div>
                        <span>•</span>
                        <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200 space-y-3 bg-white">
            <div className="flex gap-3">
              <motion.input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                whileFocus={{ scale: 1.02 }}
              />
              <motion.button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: newMessage.trim() ? 1.1 : 1 }}
                whileTap={{ scale: newMessage.trim() ? 0.9 : 1 }}
              >
                <Send size={20} />
              </motion.button>
            </div>

            <motion.button
              onClick={handleSkip}
              disabled={isSkipping}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 rounded-2xl flex items-center justify-center gap-3 text-white font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: isSkipping ? 1 : 1.02, y: -2 }}
              whileTap={{ scale: isSkipping ? 1 : 0.98 }}
            >
              {isSkipping ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Zap size={18} />
                </motion.div>
              ) : (
                <SkipForward size={18} />
              )}
              {isSkipping ? 'Finding Next Match...' : 'Skip to Next Chat'}
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Bottom Controls */}
      <motion.div
        className="flex justify-center gap-4 p-6 relative z-10"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        {[
        ].map((control, index) => (
          <motion.button
            key={index}
            onClick={control.onClick}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-semibold transition-all duration-200 backdrop-blur-sm ${
              control.active
                ? 'bg-green-500/90 hover:bg-green-600 text-white'
                : 'bg-red-500/90 hover:bg-red-600 text-white'
            }`}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <control.icon size={20} />
            <span>{control.label}</span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};

export default ChatRoom;