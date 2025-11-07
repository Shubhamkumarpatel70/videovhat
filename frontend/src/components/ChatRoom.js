
import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useWebRTC from './useWebRTC';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Loader, RefreshCw, User, MapPin, Flag } from 'lucide-react';
import ReactCountryFlag from 'react-country-flag';

const ChatRoom = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState(location.state?.roomId);
  const [matchedUser, setMatchedUser] = useState(location.state?.matchedUser);
  const { socketRef, localStream, remoteStreams, callEnded, setCallEnded } = useWebRTC(roomId, user);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [findingNext, setFindingNext] = useState(false);
  const localVideoRef = useRef();
  const remoteVideosRef = useRef({});

  // Country code mapping (same as WaitingRoom.js)
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
  };

  const getCountryCode = (country) => {
    if (!country) return '';
    if (/^[A-Za-z]{2}$/.test(country)) return country.toUpperCase();
    return countryCodeMap[country] || '';
  };

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on('match-found', (data) => {
        setFindingNext(false);
        setCallEnded(false);
        setRoomId(data.roomId);
        setMatchedUser(data.matchedUser);
        // Clear messages for new match
        setMessages([]);
        // The useWebRTC hook will handle the new connection
      });

      socketRef.current.on('no-match-found', () => {
        setFindingNext(false);
        navigate('/waiting');
      });

      // Listen for skip-matched event
      socketRef.current.on('skip-matched', (data) => {
        setFindingNext(false);
        setCallEnded(false);
        setRoomId(data.roomId);
        setMatchedUser(data.matchedUser);
        // Clear messages for new match
        setMessages([]);
        // The useWebRTC hook will handle the new connection
      });

      // Listen for chat messages
      socketRef.current.on('receive-message', (messageData) => {
        setMessages(prevMessages => [...prevMessages, messageData]);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off('match-found');
        socketRef.current.off('no-match-found');
        socketRef.current.off('skip-matched');
        socketRef.current.off('chat-message');
      }
    };
  }, [socketRef, navigate, setCallEnded]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const messageData = {
        message: newMessage.trim(),
        senderName: user?.name || 'Anonymous',
        timestamp: new Date(),
      };
      setMessages(prevMessages => [...prevMessages, messageData]);

      // Send via socket to backend
      if (socketRef.current) {
        socketRef.current.emit('send-message', {
          message: newMessage.trim(),
          roomId,
          senderName: user?.name || 'Anonymous'
        });
      }

      setNewMessage('');
    }
  };

  const handleRefreshChat = () => {
    setMessages([]);
  };

  const handleEndCall = () => {
    // Clear current messages when ending call
    setMessages([]);
    if (socketRef.current) {
        socketRef.current.emit('end-call', { roomId });
    }
    // Navigate back to waiting room after ending call
    navigate('/waiting');
  };

  const handleSkipMatch = () => {
    // Clear current messages when skipping
    setMessages([]);
    if (socketRef.current) {
      socketRef.current.emit('skip-chat', { roomId });
    }
    // Navigate back to waiting room to find new match
    navigate('/waiting');
  };

  const handleFindNextMatch = () => {
    setFindingNext(true);
    if (socketRef.current) {
      socketRef.current.emit('find-match', {
        gender: user?.gender,
        country: user?.country
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 relative overflow-hidden">
      {/* Header */}
      <div className="bg-white px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 shadow-lg relative z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Video Chat</h1>
          {matchedUser && (
            <div className="flex items-center gap-3 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <User size={16} className="text-blue-600" />
                <span className="text-sm font-medium text-gray-900">
                  {matchedUser.name || 'Anonymous'}
                </span>
              </div>
              {matchedUser.country && (
                <div className="flex items-center gap-1">
                  <ReactCountryFlag
                    countryCode={getCountryCode(matchedUser.country)}
                    svg
                    style={{
                      width: '16px',
                      height: '12px',
                    }}
                  />
                  <span className="text-xs text-gray-600">{matchedUser.country}</span>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefreshChat}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors duration-200"
            title="Refresh Chat"
          >
            <RefreshCw size={16} />
            <span className="hidden sm:inline text-sm">Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid lg:grid-cols-3 gap-6 p-6 relative z-10">
        {/* Video Section */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white rounded-3xl overflow-hidden relative flex-1 min-h-[500px] shadow-lg border border-gray-200">
            {/* Main Remote Video */}
            {Object.keys(remoteStreams).length > 0 ? (
              Object.keys(remoteStreams).map(key => (
                <video
                  key={key}
                  ref={el => (remoteVideosRef.current[key] = el)}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                  onLoadedMetadata={() => {
                    if (remoteVideosRef.current[key]) {
                      remoteVideosRef.current[key].srcObject = remoteStreams[key];
                    }
                  }}
                />
              ))
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <div className="text-center text-gray-500">
                  <div className="text-6xl mb-4">📹</div>
                  <p className="text-lg">Waiting for other user to join...</p>
                </div>
              </div>
            )}

            {/* Local Video - Picture in Picture */}
            <div className="absolute top-4 right-4 w-48 h-36 bg-black rounded-lg overflow-hidden shadow-lg border-2 border-white">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Chat Section */}
        <div className="bg-white rounded-3xl flex flex-col h-[600px] overflow-hidden shadow-lg border border-gray-200">
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-900">Chat</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Connected</span>
              </div>
            </div>
            <button
              onClick={handleRefreshChat}
              className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg transition-colors duration-200 text-sm"
              title="Clear Chat History"
            >
              <RefreshCw size={14} />
              Clear Chat
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto scrollbar-thin space-y-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <div className="text-4xl mb-2">💬</div>
                  <p className="text-sm">Start a conversation!</p>
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div key={index} className={`flex flex-col gap-1 ${message.senderName === (user?.name || 'Anonymous') ? 'items-end' : 'items-start'}`}>
                  <div className={`px-4 py-3 rounded-2xl max-w-[85%] ${message.senderName === (user?.name || 'Anonymous') ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-900 border border-gray-200 shadow-sm'}`}>
                    {message.message}
                  </div>
                  <div className={`text-xs text-gray-500 px-2 flex items-center gap-2 ${message.senderName === (user?.name || 'Anonymous') ? 'flex-row-reverse' : ''}`}>
                    <span>{message.senderName}</span>
                    <span>•</span>
                    <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200 space-y-3 bg-white">
            {callEnded ? (
                <div className="text-center">
                    <h2 className="text-lg font-bold mb-2">User has left the chat</h2>
                    <p className="text-gray-600 mb-4">Would you like to find another match?</p>
                    {findingNext ? (
                        <div className="flex items-center justify-center">
                            <Loader className="animate-spin mr-2" />
                            Searching...
                        </div>
                    ) : (
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={handleFindNextMatch}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2"
                            >
                                <Search size={18} />
                                Find Next Match
                            </button>
                            <button
                                onClick={() => navigate('/waiting')}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg font-semibold flex items-center gap-2"
                            >
                                <X size={18} />
                                Go to Waiting Room
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                      </button>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleSkipMatch}
                        className="flex-1 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-2xl flex items-center justify-center gap-3 text-white font-semibold transition-all duration-200"
                      >
                        Skip
                      </button>
                      <button
                        onClick={handleEndCall}
                        className="flex-1 py-3 bg-red-600 hover:bg-red-700 rounded-2xl flex items-center justify-center gap-3 text-white font-semibold transition-all duration-200"
                      >
                        End Call
                      </button>
                    </div>
                </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
