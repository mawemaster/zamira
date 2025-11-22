import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Video, VideoOff, Mic, MicOff, PhoneOff, MessageSquare,
  Settings, Users, Clock, ArrowLeft, CheckCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function RoomConsultaPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const consultationId = searchParams.get("id");

  const [user, setUser] = useState(null);
  const [consultation, setConsultation] = useState(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [elapsedTime, setElapsedTime] = useState(0);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    loadData();
    initializeMedia();

    return () => {
      // Cleanup
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Timer
  useEffect(() => {
    if (isConnected) {
      startTimeRef.current = Date.now();
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isConnected]);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const consultationData = await base44.entities.Consultation.filter({ id: consultationId });
      if (consultationData.length > 0) {
        setConsultation(consultationData[0]);
        
        // Atualizar status para "in_progress" quando entrar
        if (consultationData[0].status === 'confirmed') {
          await base44.entities.Consultation.update(consultationId, {
            status: 'in_progress'
          });
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao acessar a sala");
      navigate(createPageUrl("AreaDoAluno"));
    }
  };

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      setIsConnected(true);
      toast.success("✓ Conectado à sala!");
    } catch (error) {
      console.error("Erro ao acessar mídia:", error);
      toast.error("Erro ao acessar câmera/microfone");
    }
  };

  const toggleVideo = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const videoTrack = localVideoRef.current.srcObject.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setVideoEnabled(videoTrack.enabled);
    }
  };

  const toggleAudio = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const audioTrack = localVideoRef.current.srcObject.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setAudioEnabled(audioTrack.enabled);
    }
  };

  const endCall = async () => {
    if (window.confirm("Deseja realmente encerrar a consulta?")) {
      try {
        // Atualizar status para completed
        await base44.entities.Consultation.update(consultationId, {
          status: 'completed'
        });

        // Criar notificação
        await base44.entities.Notification.create({
          user_id: consultation.user_id,
          type: 'announcement',
          title: 'Consulta Concluída',
          message: 'Sua consulta com Emelyn Chotté foi concluída. Obrigada!',
          action_url: '/ConsultaEmelyn'
        });

        toast.success("✓ Consulta finalizada!");
        navigate(createPageUrl("AreaDoAluno"));
      } catch (error) {
        toast.error("Erro ao finalizar consulta");
      }
    }
  };

  const sendMessage = () => {
    if (messageInput.trim()) {
      const newMessage = {
        from: user.display_name || user.full_name,
        message: messageInput,
        timestamp: new Date().toISOString()
      };
      setChatMessages([...chatMessages, newMessage]);
      setMessageInput("");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!consultation || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Carregando sala...</div>
      </div>
    );
  }

  const isAdmin = user.email === "mawemaster@gmail.com";
  const isParticipant = consultation.user_id === user.id || isAdmin;

  if (!isParticipant) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <Card className="bg-slate-900 border-red-500/30 p-8 text-center max-w-md">
          <h2 className="text-white font-bold text-xl mb-4">Acesso Negado</h2>
          <p className="text-gray-400 mb-6">
            Você não tem permissão para acessar esta sala de consulta.
          </p>
          <Button onClick={() => navigate(createPageUrl("Hub"))}>
            Voltar
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate(createPageUrl("AreaDoAluno"))}
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Consulta com Emelyn Chotté</h1>
              <p className="text-sm text-gray-400">
                {format(parseISO(consultation.scheduled_date), "dd/MM/yyyy", { locale: ptBR })} - {consultation.scheduled_time}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isConnected && (
              <div className="flex items-center gap-2 text-green-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <Clock className="w-4 h-4" />
                <span className="font-mono text-sm">{formatTime(elapsedTime)}</span>
              </div>
            )}
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">{participants.length + 1}</span>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
        {/* Main Video Area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Remote Video (Emelyn) */}
          <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 bg-black/70 px-3 py-1 rounded-full">
              <span className="text-sm">Emelyn Chotté</span>
            </div>
          </div>

          {/* Local Video (User) */}
          <div className="relative aspect-video max-w-xs bg-slate-900 rounded-xl overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover mirror"
            />
            <div className="absolute bottom-4 left-4 bg-black/70 px-3 py-1 rounded-full">
              <span className="text-sm">Você</span>
            </div>
          </div>
        </div>

        {/* Chat Sidebar */}
        <div className="lg:col-span-1">
          <Card className="bg-slate-900 border-slate-800 h-full flex flex-col">
            <div className="p-4 border-b border-slate-800">
              <h3 className="font-bold flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Chat
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.length === 0 ? (
                <p className="text-gray-500 text-sm text-center">
                  Nenhuma mensagem ainda
                </p>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div key={idx} className="bg-slate-800 rounded-lg p-3">
                    <p className="text-purple-400 text-xs font-semibold mb-1">
                      {msg.from}
                    </p>
                    <p className="text-sm">{msg.message}</p>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Digite uma mensagem..."
                  className="flex-1 bg-slate-800 border-slate-700 rounded-lg px-3 py-2 text-sm"
                />
                <Button
                  onClick={sendMessage}
                  size="icon"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <MessageSquare className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-slate-900 border-t border-slate-800 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
          <Button
            onClick={toggleVideo}
            size="icon"
            className={`w-12 h-12 rounded-full ${
              videoEnabled ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </Button>

          <Button
            onClick={toggleAudio}
            size="icon"
            className={`w-12 h-12 rounded-full ${
              audioEnabled ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </Button>

          <Button
            onClick={endCall}
            size="icon"
            className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700"
          >
            <PhoneOff className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <style jsx>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
}