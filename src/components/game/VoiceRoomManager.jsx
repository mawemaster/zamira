import React, { useEffect, useState, useRef } from "react";
import { base44 } from "@/api/base44Client";

export default function VoiceRoomManager({ currentUser, otherPlayers, playerPos }) {
  const [myRoom, setMyRoom] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [micEnabled, setMicEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState({});
  const [pendingInvite, setPendingInvite] = useState(null);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  
  const peerConnections = useRef({});
  const audioElements = useRef({});
  
  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ]
  };

  useEffect(() => {
    const loadMyRoom = async () => {
      try {
        const rooms = await base44.entities.VoiceRoom.filter({ is_active: true });
        const myActiveRoom = rooms.find(room => 
          room.participants.some(p => p.user_id === currentUser.id)
        );
        
        if (myActiveRoom) {
          setMyRoom(myActiveRoom);
          if (!localStream) {
            await initLocalAudio();
          }
        }
      } catch (error) {
        console.error("Erro ao carregar sala:", error);
      }
    };

    loadMyRoom();
    const interval = setInterval(loadMyRoom, 2000);
    return () => clearInterval(interval);
  }, [currentUser.id]);

  useEffect(() => {
    const checkInvites = async () => {
      try {
        const rooms = await base44.entities.VoiceRoom.filter({ is_active: true });
        
        for (const room of rooms) {
          const invite = room.pending_invites?.find(inv => inv.user_id === currentUser.id);
          if (invite) {
            setPendingInvite({ room, invite });
            break;
          }
        }
      } catch (error) {
        console.error("Erro ao verificar convites:", error);
      }
    };

    checkInvites();
    const interval = setInterval(checkInvites, 2000);
    return () => clearInterval(interval);
  }, [currentUser.id]);

  const initLocalAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      });
      
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error("Erro ao acessar microfone:", error);
      return null;
    }
  };

  const createPeerConnection = (targetUserId) => {
    if (peerConnections.current[targetUserId]) {
      return peerConnections.current[targetUserId];
    }

    const pc = new RTCPeerConnection(iceServers);
    peerConnections.current[targetUserId] = pc;

    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    pc.ontrack = (event) => {
      if (!audioElements.current[targetUserId]) {
        const audio = new Audio();
        audio.srcObject = event.streams[0];
        audio.autoplay = true;
        audioElements.current[targetUserId] = audio;
      }
      
      setRemoteStreams(prev => ({
        ...prev,
        [targetUserId]: event.streams[0]
      }));
      
      setAudioEnabled(prev => ({
        ...prev,
        [targetUserId]: true
      }));
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("ICE candidate:", targetUserId);
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        closePeerConnection(targetUserId);
      }
    };

    return pc;
  };

  const closePeerConnection = (targetUserId) => {
    if (peerConnections.current[targetUserId]) {
      peerConnections.current[targetUserId].close();
      delete peerConnections.current[targetUserId];
    }
    
    if (audioElements.current[targetUserId]) {
      audioElements.current[targetUserId].pause();
      audioElements.current[targetUserId].srcObject = null;
      delete audioElements.current[targetUserId];
    }
    
    setRemoteStreams(prev => {
      const newStreams = { ...prev };
      delete newStreams[targetUserId];
      return newStreams;
    });
  };

  useEffect(() => {
    if (!myRoom || !localStream) return;

    const participantIds = myRoom.participants.map(p => p.user_id).filter(id => id !== currentUser.id);
    const connectedIds = Object.keys(peerConnections.current);

    connectedIds.forEach(userId => {
      if (!participantIds.includes(userId)) {
        closePeerConnection(userId);
      }
    });

    participantIds.forEach(userId => {
      if (!peerConnections.current[userId]) {
        createPeerConnection(userId);
      }
    });
  }, [myRoom, localStream, currentUser.id]);

  const createRoom = async (invitedUserId) => {
    try {
      const stream = await initLocalAudio();
      if (!stream) return;

      const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newRoom = await base44.entities.VoiceRoom.create({
        room_id: roomId,
        participants: [{
          user_id: currentUser.id,
          user_name: currentUser.display_name || currentUser.full_name,
          user_avatar: currentUser.avatar_url,
          joined_at: new Date().toISOString()
        }],
        pending_invites: [{
          user_id: invitedUserId,
          invited_by: currentUser.id,
          invited_at: new Date().toISOString()
        }],
        is_active: true,
        created_by: currentUser.id
      });

      setMyRoom(newRoom);
    } catch (error) {
      console.error("Erro ao criar sala:", error);
    }
  };

  const acceptInvite = async () => {
    if (!pendingInvite) return;

    try {
      const stream = await initLocalAudio();
      if (!stream) return;

      const { room } = pendingInvite;
      
      const updatedParticipants = [
        ...room.participants,
        {
          user_id: currentUser.id,
          user_name: currentUser.display_name || currentUser.full_name,
          user_avatar: currentUser.avatar_url,
          joined_at: new Date().toISOString()
        }
      ];
      
      const updatedInvites = room.pending_invites.filter(inv => inv.user_id !== currentUser.id);
      
      await base44.entities.VoiceRoom.update(room.id, {
        participants: updatedParticipants,
        pending_invites: updatedInvites
      });

      setPendingInvite(null);
      setMyRoom({ ...room, participants: updatedParticipants, pending_invites: updatedInvites });
    } catch (error) {
      console.error("Erro ao aceitar convite:", error);
    }
  };

  const declineInvite = async () => {
    if (!pendingInvite) return;

    try {
      const { room } = pendingInvite;
      const updatedInvites = room.pending_invites.filter(inv => inv.user_id !== currentUser.id);
      
      await base44.entities.VoiceRoom.update(room.id, {
        pending_invites: updatedInvites
      });

      setPendingInvite(null);
    } catch (error) {
      console.error("Erro ao recusar convite:", error);
    }
  };

  const requestJoinRoom = async (targetUserId) => {
    try {
      const rooms = await base44.entities.VoiceRoom.filter({ is_active: true });
      const targetRoom = rooms.find(room => 
        room.participants.some(p => p.user_id === targetUserId)
      );
      
      if (!targetRoom) return;

      const updatedInvites = [
        ...(targetRoom.pending_invites || []),
        {
          user_id: currentUser.id,
          invited_by: currentUser.id,
          invited_at: new Date().toISOString()
        }
      ];
      
      await base44.entities.VoiceRoom.update(targetRoom.id, {
        pending_invites: updatedInvites
      });
    } catch (error) {
      console.error("Erro ao solicitar entrada:", error);
    }
  };

  const leaveRoom = async () => {
    try {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }

      Object.keys(peerConnections.current).forEach(userId => {
        closePeerConnection(userId);
      });

      if (myRoom) {
        const updatedParticipants = myRoom.participants.filter(p => p.user_id !== currentUser.id);
        
        if (updatedParticipants.length === 0) {
          await base44.entities.VoiceRoom.update(myRoom.id, { is_active: false });
        } else {
          await base44.entities.VoiceRoom.update(myRoom.id, {
            participants: updatedParticipants
          });
        }
        
        setMyRoom(null);
      }
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
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

  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      Object.keys(peerConnections.current).forEach(userId => {
        closePeerConnection(userId);
      });
    };
  }, []);

  return {
    myRoom,
    localStream,
    remoteStreams,
    micEnabled,
    audioEnabled,
    pendingInvite,
    showParticipantsModal,
    createRoom,
    acceptInvite,
    declineInvite,
    requestJoinRoom,
    leaveRoom,
    toggleMic,
    toggleParticipantAudio,
    setShowParticipantsModal
  };
}