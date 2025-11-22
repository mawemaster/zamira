import { useEffect, useState, useRef } from "react";

export default function useWebRTC({ currentUser, otherPlayers, playerPos, proximityDistance = 5 }) {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState({});
  const [videoEnabled, setVideoEnabled] = useState({});
  const [isSpeaking, setIsSpeaking] = useState({});
  
  const peerConnections = useRef({});
  const audioElements = useRef({});
  const videoElements = useRef({});
  const analyserRef = useRef({});
  const animationFramesRef = useRef({});
  
  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
    ]
  };

  // Iniciar stream local automaticamente
  useEffect(() => {
    initLocalStream();
    
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const initLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000
        },
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 }
        }
      });
      
      stream.getVideoTracks()[0].enabled = false; // Vídeo desligado por padrão
      
      setLocalStream(stream);
      setupAudioAnalyser('local', stream);
      return stream;
    } catch (error) {
      console.error("Erro ao acessar mídia:", error);
      
      // Tentar só áudio se falhar
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          },
          video: false
        });
        setLocalStream(audioStream);
        setCameraEnabled(false);
        setupAudioAnalyser('local', audioStream);
        return audioStream;
      } catch (err) {
        console.error("Erro ao acessar áudio:", err);
        return null;
      }
    }
  };

  const setupAudioAnalyser = (userId, stream) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;
      
      analyserRef.current[userId] = { analyser, audioContext };
      
      const checkAudioLevel = () => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        
        setIsSpeaking(prev => ({
          ...prev,
          [userId]: average > 20
        }));
        
        animationFramesRef.current[userId] = requestAnimationFrame(checkAudioLevel);
      };
      
      checkAudioLevel();
    } catch (error) {
      console.error("Erro ao configurar analyser:", error);
    }
  };

  const calculateDistance = (x1, y1, x2, y2) => {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  };

  // Gerenciar conexões peer-to-peer automaticamente
  useEffect(() => {
    if (!localStream || !currentUser?.id) return;

    const nearbyPlayers = otherPlayers.filter(player => {
      if (!player?.user_id || !player?.current_room || !player?.x || !player?.y) return false;
      
      const distance = calculateDistance(
        playerPos.x, playerPos.y,
        player.x, player.y
      );
      
      return distance <= proximityDistance;
    });

    const nearbyIds = nearbyPlayers.map(p => p.user_id);
    const connectedIds = Object.keys(peerConnections.current);

    // Remover conexões de jogadores distantes
    connectedIds.forEach(userId => {
      if (!nearbyIds.includes(userId)) {
        closePeerConnection(userId);
      }
    });

    // Criar conexões com jogadores próximos
    nearbyPlayers.forEach(player => {
      if (!peerConnections.current[player.user_id]) {
        createPeerConnection(player.user_id, true);
      }
    });
  }, [otherPlayers, playerPos, localStream, currentUser?.id]);

  const createPeerConnection = async (targetUserId, isInitiator = false) => {
    if (!localStream || !targetUserId || targetUserId === currentUser?.id) return null;
    
    if (peerConnections.current[targetUserId]) {
      return peerConnections.current[targetUserId];
    }

    console.log(`🔗 Criando conexão WebRTC com ${targetUserId} (initiator: ${isInitiator})`);

    const pc = new RTCPeerConnection(iceServers);
    peerConnections.current[targetUserId] = pc;

    // Adicionar tracks locais
    localStream.getTracks().forEach(track => {
      pc.addTrack(track, localStream);
    });

    // Receber tracks remotos
    pc.ontrack = (event) => {
      console.log(`📥 Track recebido de ${targetUserId}:`, event.track.kind);
      
      const stream = event.streams[0];
      
      if (event.track.kind === 'audio') {
        if (!audioElements.current[targetUserId]) {
          const audio = new Audio();
          audio.srcObject = stream;
          audio.autoplay = true;
          audio.volume = 1.0;
          audioElements.current[targetUserId] = audio;
          
          setupAudioAnalyser(targetUserId, stream);
        }
        
        setAudioEnabled(prev => ({
          ...prev,
          [targetUserId]: true
        }));
      }
      
      if (event.track.kind === 'video') {
        videoElements.current[targetUserId] = stream;
        setVideoEnabled(prev => ({
          ...prev,
          [targetUserId]: true
        }));
      }
      
      setRemoteStreams(prev => ({
        ...prev,
        [targetUserId]: stream
      }));
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log(`🧊 ICE candidate para ${targetUserId}`);
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`🔌 Estado da conexão com ${targetUserId}: ${pc.connectionState}`);
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        closePeerConnection(targetUserId);
      } else if (pc.connectionState === 'connected') {
        console.log(`✅ Conectado com ${targetUserId}`);
      }
    };

    // Se for iniciador, criar oferta
    if (isInitiator && currentUser.id < targetUserId) {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        console.log(`📤 Oferta criada para ${targetUserId}`);
      } catch (error) {
        console.error(`Erro ao criar oferta para ${targetUserId}:`, error);
      }
    }

    return pc;
  };

  const closePeerConnection = (targetUserId) => {
    console.log(`🔌 Fechando conexão com ${targetUserId}`);
    
    if (peerConnections.current[targetUserId]) {
      peerConnections.current[targetUserId].close();
      delete peerConnections.current[targetUserId];
    }
    
    if (audioElements.current[targetUserId]) {
      audioElements.current[targetUserId].pause();
      audioElements.current[targetUserId].srcObject = null;
      delete audioElements.current[targetUserId];
    }
    
    if (videoElements.current[targetUserId]) {
      delete videoElements.current[targetUserId];
    }
    
    if (analyserRef.current[targetUserId]) {
      if (animationFramesRef.current[targetUserId]) {
        cancelAnimationFrame(animationFramesRef.current[targetUserId]);
      }
      if (analyserRef.current[targetUserId].audioContext) {
        analyserRef.current[targetUserId].audioContext.close();
      }
      delete analyserRef.current[targetUserId];
    }
    
    setRemoteStreams(prev => {
      const newStreams = { ...prev };
      delete newStreams[targetUserId];
      return newStreams;
    });
    
    setAudioEnabled(prev => {
      const newAudio = { ...prev };
      delete newAudio[targetUserId];
      return newAudio;
    });
    
    setVideoEnabled(prev => {
      const newVideo = { ...prev };
      delete newVideo[targetUserId];
      return newVideo;
    });
    
    setIsSpeaking(prev => {
      const newSpeaking = { ...prev };
      delete newSpeaking[targetUserId];
      return newSpeaking;
    });
  };

  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleCamera = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCameraEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleParticipantAudio = (userId) => {
    if (audioElements.current[userId]) {
      const audio = audioElements.current[userId];
      audio.muted = !audio.muted;
      setAudioEnabled(prev => ({
        ...prev,
        [userId]: !audio.muted
      }));
    }
  };

  const getVideoElement = (userId) => {
    return videoElements.current[userId];
  };

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      
      Object.keys(peerConnections.current).forEach(userId => {
        closePeerConnection(userId);
      });
      
      Object.values(animationFramesRef.current).forEach(frame => {
        cancelAnimationFrame(frame);
      });
    };
  }, []);

  return {
    localStream,
    remoteStreams,
    micEnabled,
    cameraEnabled,
    audioEnabled,
    videoEnabled,
    isSpeaking,
    toggleMic,
    toggleCamera,
    toggleParticipantAudio,
    getVideoElement,
    peerConnections: peerConnections.current
  };
}