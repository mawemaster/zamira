import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Minimize2, Maximize2, X, Move } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export default function GlobalAudioPlayer({ audio, onClose, onNext, onPrevious, playlist = [] }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const audioRef = useRef(null);

  // Auto-play quando novo áudio é carregado
  useEffect(() => {
    if (audio && audioRef.current) {
      // Suportar tanto audio.url quanto audio.audio_url
      const audioUrl = audio.url || audio.audio_url;
      if (!audioUrl) return;
      
      // Se for URL do YouTube, não podemos tocar diretamente
      if (audioUrl.includes('youtube.com') || audioUrl.includes('youtu.be')) {
        console.log('YouTube audio não suportado em <audio>, use iframe');
        return;
      }
      
      audioRef.current.src = audioUrl;
      audioRef.current.load();
      
      // Tentar reproduzir automaticamente
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(error => {
            console.log("Autoplay bloqueado, aguardando interação do usuário:", error);
            setIsPlaying(false);
          });
      }
    }
  }, [audio]);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const updateTime = () => setCurrentTime(audioElement.currentTime);
    const updateDuration = () => setDuration(audioElement.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      if (onNext) onNext();
    };

    audioElement.addEventListener('timeupdate', updateTime);
    audioElement.addEventListener('loadedmetadata', updateDuration);
    audioElement.addEventListener('ended', handleEnded);

    return () => {
      audioElement.removeEventListener('timeupdate', updateTime);
      audioElement.removeEventListener('loadedmetadata', updateDuration);
      audioElement.removeEventListener('ended', handleEnded);
    };
  }, [onNext]);

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value) => {
    const newTime = (value[0] / 100) * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value) => {
    const newVolume = value[0] / 100;
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Funções de arrastar
  const handleMouseDown = (e) => {
    if (e.target.closest('.no-drag')) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    // Limites da tela - ajustar baseado no tamanho real
    const playerWidth = Math.min(window.innerWidth * 0.9, 380);
    const maxX = window.innerWidth - playerWidth;
    const maxY = window.innerHeight - 180;
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.target.closest('.no-drag')) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    });
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    
    const newX = touch.clientX - dragStart.x;
    const newY = touch.clientY - dragStart.y;
    
    const playerWidth = Math.min(window.innerWidth * 0.9, 380);
    const maxX = window.innerWidth - playerWidth;
    const maxY = window.innerHeight - 180;
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, dragStart, position]);

  if (!audio) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        style={{
          position: 'fixed',
          zIndex: 90,
          ...(isMinimized ? {
            left: position.x || position.x === 0 ? `${position.x}px` : '50%',
            bottom: '80px',
            transform: (position.x || position.x === 0) ? 'none' : 'translateX(-50%)',
            width: '90%',
            maxWidth: '380px',
            cursor: isDragging ? 'grabbing' : 'grab'
          } : {
            bottom: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            maxWidth: '600px'
          })
        }}
        onMouseDown={isMinimized ? handleMouseDown : undefined}
        onTouchStart={isMinimized ? handleTouchStart : undefined}
      >
        <Card className={`bg-gradient-to-br from-slate-900 via-purple-900/40 to-slate-900 border-purple-500/30 ${
          isMinimized ? 'rounded-2xl' : 'rounded-t-2xl rounded-b-none mx-4'
        } shadow-2xl overflow-hidden ${isDragging ? 'shadow-purple-500/50' : ''}`}>
          <audio ref={audioRef} />

          {/* Player Expandido */}
          {!isMinimized && (
            <div className="p-4 md:p-6 no-drag">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1 min-w-0 mr-4">
                  <h3 className="text-white font-bold text-lg md:text-xl mb-1 truncate">
                    {audio.title}
                  </h3>
                  <p className="text-purple-300 text-sm truncate">
                    {audio.description}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMinimized(true)}
                    className="text-gray-400 hover:text-white"
                  >
                    <Minimize2 className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <Slider
                  value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
                  onValueChange={handleSeek}
                  max={100}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMute}
                    className="text-gray-400 hover:text-white"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </Button>
                  <div className="w-24">
                    <Slider
                      value={[isMuted ? 0 : volume * 100]}
                      onValueChange={handleVolumeChange}
                      max={100}
                      step={1}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {onPrevious && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onPrevious}
                      className="text-purple-400 hover:text-purple-300"
                    >
                      <SkipBack className="w-5 h-5" />
                    </Button>
                  )}
                  
                  <Button
                    onClick={togglePlayPause}
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 text-white" />
                    ) : (
                      <Play className="w-6 h-6 text-white ml-1" />
                    )}
                  </Button>

                  {onNext && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onNext}
                      className="text-purple-400 hover:text-purple-300"
                    >
                      <SkipForward className="w-5 h-5" />
                    </Button>
                  )}
                </div>

                <div className="w-24" />
              </div>
            </div>
          )}

          {/* Player Minimizado - Arrastável */}
          {isMinimized && (
            <div className="p-3 flex items-center gap-3">
              {/* Indicador de arrastar */}
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-900/30 hover:bg-purple-800/50 transition flex-shrink-0">
                <Move className="w-4 h-4 text-purple-400" />
              </div>

              <Button
                onClick={togglePlayPause}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 flex-shrink-0 no-drag"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 text-white" />
                ) : (
                  <Play className="w-4 h-4 text-white ml-0.5" />
                )}
              </Button>

              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">
                  {audio.title}
                </p>
                <div className="w-full bg-slate-700 h-1 rounded-full mt-1 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                    style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="flex gap-1 no-drag">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMinimized(false)}
                  className="text-gray-400 hover:text-white w-8 h-8"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-gray-400 hover:text-white w-8 h-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}