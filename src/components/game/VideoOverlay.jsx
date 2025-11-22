import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Video, VideoOff, Minimize2, Maximize2, X, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserAvatar from "../UserAvatar";

export default function VideoOverlay({ 
  webRTC, 
  currentUser, 
  nearbyPlayers,
  onClose
}) {
  const [videoSize, setVideoSize] = useState('normal');
  const [minimized, setMinimized] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef({});

  // Configurar vídeo local
  useEffect(() => {
    if (localVideoRef.current && webRTC.localStream) {
      localVideoRef.current.srcObject = webRTC.localStream;
    }
  }, [webRTC.localStream]);

  // Configurar vídeos remotos
  useEffect(() => {
    nearbyPlayers.forEach(player => {
      const videoStream = webRTC.getVideoElement(player.user_id);
      if (videoStream && remoteVideoRefs.current[player.user_id]) {
        remoteVideoRefs.current[player.user_id].srcObject = videoStream;
      }
    });
  }, [nearbyPlayers, webRTC.remoteStreams]);

  const sizeClasses = {
    small: 'w-32 h-24',
    normal: 'w-48 h-36',
    large: 'w-64 h-48'
  };

  if (nearbyPlayers.length === 0 && !webRTC.cameraEnabled) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`fixed ${minimized ? 'bottom-20 right-4' : 'top-20 right-4'} z-[60] ${
          minimized ? 'w-20' : ''
        }`}
      >
        <div className={`bg-slate-900/95 backdrop-blur-md rounded-xl border border-purple-500/30 overflow-hidden shadow-2xl ${
          minimized ? 'p-2' : 'p-4'
        }`}>
          {!minimized && (
            <>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                  <Video className="w-4 h-4 text-purple-400" />
                  {nearbyPlayers.length} Conexão(ões)
                </h3>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setMinimized(true)}
                    className="h-6 w-6 text-gray-400 hover:text-white"
                  >
                    <Minimize2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={onClose}
                    className="h-6 w-6 text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Vídeo Local */}
              {webRTC.cameraEnabled && (
                <div className={`mb-3 relative ${sizeClasses[videoSize]} bg-slate-800 rounded-lg overflow-hidden`}>
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover mirror"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white">
                    Você
                  </div>
                  {webRTC.isSpeaking['local'] && (
                    <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  )}
                </div>
              )}

              {/* Vídeos Remotos */}
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {nearbyPlayers.map(player => (
                  <div key={player.user_id} className={`relative ${sizeClasses[videoSize]} bg-slate-800 rounded-lg overflow-hidden`}>
                    {webRTC.videoEnabled[player.user_id] ? (
                      <video
                        ref={el => remoteVideoRefs.current[player.user_id] = el}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <UserAvatar user={player.user} size="lg" />
                      </div>
                    )}
                    
                    <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white flex items-center gap-1">
                      {player.user?.display_name || player.user?.full_name || 'Jogador'}
                      {webRTC.isSpeaking[player.user_id] && (
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      )}
                    </div>
                    
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => webRTC.toggleParticipantAudio(player.user_id)}
                      className="absolute top-2 right-2 h-7 w-7 bg-black/60 hover:bg-black/80"
                    >
                      {webRTC.audioEnabled[player.user_id] ? (
                        <Volume2 className="w-4 h-4 text-white" />
                      ) : (
                        <VolumeX className="w-4 h-4 text-red-400" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>

              {/* Controles */}
              <div className="flex gap-2 mt-3 pt-3 border-t border-purple-500/30">
                <Button
                  size="sm"
                  onClick={webRTC.toggleMic}
                  className={webRTC.micEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                >
                  {webRTC.micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </Button>
                <Button
                  size="sm"
                  onClick={webRTC.toggleCamera}
                  className={webRTC.cameraEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                >
                  {webRTC.cameraEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </Button>
                <select
                  value={videoSize}
                  onChange={(e) => setVideoSize(e.target.value)}
                  className="bg-slate-800 text-white text-xs px-2 rounded border border-purple-500/30"
                >
                  <option value="small">Pequeno</option>
                  <option value="normal">Normal</option>
                  <option value="large">Grande</option>
                </select>
              </div>
            </>
          )}

          {minimized && (
            <button
              onClick={() => setMinimized(false)}
              className="flex items-center justify-center w-16 h-16 hover:scale-110 transition"
            >
              <div className="relative">
                <Video className="w-8 h-8 text-purple-400" />
                {nearbyPlayers.length > 0 && (
                  <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {nearbyPlayers.length}
                  </div>
                )}
              </div>
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}