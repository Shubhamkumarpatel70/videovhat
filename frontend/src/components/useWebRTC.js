import { useRef, useEffect, useState, useCallback } from 'react';
import io from 'socket.io-client';

const useWebRTC = (roomId, user) => {
  const [peers, setPeers] = useState({});
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [callEnded, setCallEnded] = useState(false);
  const socketRef = useRef();
  const peerConnections = useRef({});
  const dataChannels = useRef({});

  useEffect(() => {
    socketRef.current = io('http://localhost:5000'); // Replace with your signaling server URL

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        setLocalStream(stream);
        socketRef.current.emit('join-room', { roomId, user });
      })
      .catch(error => {
        console.error('Error accessing media devices.', error);
      });

    socketRef.current.on('all-users', users => {
      users.forEach(userID => {
        const pc = createPeerConnection(userID);
        peerConnections.current[userID] = pc;
        const dc = pc.createDataChannel('chat');
        dataChannels.current[userID] = dc;
        setupDataChannel(dc);
      });
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
      setPeers(prevPeers => {
        const newPeers = { ...prevPeers };
        delete newPeers[userID];
        return newPeers;
      });
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
  }, [roomId]);

  const createPeerConnection = (userID) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
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

  return { socketRef, localStream, remoteStreams, callEnded, setCallEnded };
};

export default useWebRTC;