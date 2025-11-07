import { useRef, useEffect, useState } from 'react';
import io from 'socket.io-client';

const useWebRTC = (roomId, user) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [callEnded, setCallEnded] = useState(false);
  const socketRef = useRef();
  const peerConnections = useRef({});
  const dataChannels = useRef({});

  useEffect(() => {
    socketRef.current = io('https://videovhatbackend.onrender.com'); // Production signaling server URL

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        setLocalStream(stream);
        // Emit user-join instead of join-room to match server
        socketRef.current.emit('user-join', { roomId, user });
      })
      .catch(error => {
        console.error('Error accessing media devices.', error);
      });

    // Listen for match-found instead of all-users
    socketRef.current.on('match-found', (data) => {
      // When match is found, create peer connection for the matched user
      const matchedUserId = data.matchedUser?.id || data.matchedUser?.socketId;
      if (matchedUserId) {
        const pc = createPeerConnection(matchedUserId);
        peerConnections.current[matchedUserId] = pc;
        const dc = pc.createDataChannel('chat');
        dataChannels.current[matchedUserId] = dc;
        setupDataChannel(dc);
      }
    });

    // Listen for skip-matched (when user skips and gets a new match)
    socketRef.current.on('skip-matched', (data) => {
      // Clean up existing connections before creating new ones
      cleanupConnections();

      // When skip match is found, create peer connection for the new matched user
      const matchedUserId = data.matchedUser?.id || data.matchedUser?.socketId;
      if (matchedUserId) {
        const pc = createPeerConnection(matchedUserId);
        peerConnections.current[matchedUserId] = pc;
        const dc = pc.createDataChannel('chat');
        dataChannels.current[matchedUserId] = dc;
        setupDataChannel(dc);
      }
    });

    socketRef.current.on('user-joined', payload => {
      const pc = createPeerConnection(payload.callerID);
      peerConnections.current[payload.callerID] = pc;
      const dc = pc.createDataChannel('chat');
      dataChannels.current[payload.callerID] = dc;
      setupDataChannel(dc);
      pc.createOffer()
        .then(offer => {
          return pc.setLocalDescription(offer);
        })
        .then(() => {
          socketRef.current.emit('offer', {
            target: payload.callerID,
            caller: socketRef.current.id,
            sdp: pc.localDescription,
          });
        })
        .catch(error => {
          console.error('Error creating offer.', error);
        });
    });

    socketRef.current.on('offer', payload => {
      const pc = peerConnections.current[payload.caller];
      pc.setRemoteDescription(payload.sdp)
        .then(() => {
          return pc.createAnswer();
        })
        .then(answer => {
          return pc.setLocalDescription(answer);
        })
        .then(() => {
          socketRef.current.emit('answer', {
            target: payload.caller,
            caller: socketRef.current.id,
            sdp: pc.localDescription,
          });
        })
        .catch(error => {
          console.error('Error creating answer.', error);
        });
    });

    socketRef.current.on('answer', payload => {
      const pc = peerConnections.current[payload.caller];
      pc.setRemoteDescription(payload.sdp).catch(error => {
        console.error('Error setting remote description.', error);
      });
    });

    socketRef.current.on('ice-candidate', payload => {
      const pc = peerConnections.current[payload.caller];
      pc.addIceCandidate(new RTCIceCandidate(payload.candidate)).catch(error => {
        console.error('Error adding ICE candidate.', error);
      });
    });

    socketRef.current.on('user-left', userID => {
      if (peerConnections.current[userID]) {
        peerConnections.current[userID].close();
      }
      delete peerConnections.current[userID];
      delete dataChannels.current[userID];
      setRemoteStreams(prevStreams => {
        const newStreams = { ...prevStreams };
        delete newStreams[userID];
        return newStreams;
      });
    });

    socketRef.current.on('call-ended', () => {
      setCallEnded(true);
    });

    return () => {
      socketRef.current.disconnect();
      localStream?.getTracks().forEach(track => track.stop());
      Object.values(peerConnections.current).forEach(pc => pc.close());
      socketRef.current.off('call-ended');
    };
  }, [roomId, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const createPeerConnection = (userID) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
        // TURN servers for relay when STUN fails
        {
          urls: 'turn:turn.anyfirewall.com:443?transport=tcp',
          username: 'webrtc',
          credential: 'webrtc'
        },
        {
          urls: 'turn:turn.anyfirewall.com:443?transport=udp',
          username: 'webrtc',
          credential: 'webrtc'
        },
        // Additional TURN servers
        {
          urls: 'turn:turn.bistri.com:80',
          username: 'homeo',
          credential: 'homeo'
        },
        {
          urls: 'turn:turn.bistri.com:80?transport=tcp',
          username: 'homeo',
          credential: 'homeo'
        }
      ],
    });

    pc.onicecandidate = event => {
      if (event.candidate) {
        socketRef.current.emit('ice-candidate', {
          target: userID,
          caller: socketRef.current.id,
          candidate: event.candidate,
        });
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', pc.iceConnectionState);
      if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
        console.warn('ICE connection failed, attempting restart...');
        // Attempt ICE restart
        pc.restartIce();
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('Peer connection state:', pc.connectionState);
    };

    pc.ontrack = event => {
      setRemoteStreams(prevStreams => ({
        ...prevStreams,
        [userID]: event.streams[0],
      }));
    };

    pc.ondatachannel = event => {
      const dc = event.channel;
      dataChannels.current[userID] = dc;
      setupDataChannel(dc);
    };

    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    return pc;
  };

  const setupDataChannel = (dc) => {
    dc.onopen = () => {
      console.log('Data channel is open');
    };

    dc.onmessage = event => {
      // Messages are now handled in ChatRoom component via socket
      console.log('Data channel message received:', event.data);
    };
  };

  const cleanupConnections = () => {
    // Close all existing peer connections
    Object.values(peerConnections.current).forEach(pc => {
      if (pc.signalingState !== 'closed') {
        pc.close();
      }
    });
    peerConnections.current = {};

    // Close all data channels
    Object.values(dataChannels.current).forEach(dc => {
      if (dc.readyState !== 'closed') {
        dc.close();
      }
    });
    dataChannels.current = {};

    // Clear remote streams
    setRemoteStreams({});
  };

  // Cleanup on unmount or when room changes
  useEffect(() => {
    return () => {
      cleanupConnections();
    };
  }, [roomId]);

  return { socketRef, localStream, remoteStreams, callEnded, setCallEnded };
};

export default useWebRTC;