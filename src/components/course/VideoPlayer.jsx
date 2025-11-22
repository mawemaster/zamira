import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, VolumeX, Maximize, SkipForward, SkipBack } from "lucide-react";
import { motion } from "framer-motion";

export default function VideoPlayer({ course, user, onNext, onPrevious }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const playerRef = useRef(null);
  const playerDivRef = useRef(null);
  const progressSaveInterval = useRef(null);
  const timeUpdateInterval = useRef(null);

  useEffect(() => {
    if (course && user) {
      loadProgress();
    }

    return () => {
      if (progressSaveInterval.current) clearInterval(progressSaveInterval.current);
      if (timeUpdateInterval.current) clearInterval(timeUpdateInterval.current);
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
  }, [course?.id, user?.id]);

  useEffect(() => {
    if (course?.video_url) {
      const videoId = getYouTubeVideoId(course.video_url);
      if (videoId) {
        setThumbnail(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);
      }
    }
  }, [course?.video_url]);

  const loadProgress = async () => {
    try {
      const savedProgress = await base44.entities.CourseProgress.filter({
        user_id: user.id,
        course_id: course.id
      });

      if (savedProgress && savedProgress.length > 0) {
        setProgress(savedProgress[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar progresso:', error);
    }
  };

  const saveProgress = async (currentTime, duration) => {
    if (!user || !course) return;

    try {
      const progressData = {
        user_id: user.id,
        course_id: course.id,
        lesson_number: course.lesson_number,
        video_progress: currentTime,
        video_duration: duration,
        is_completed: currentTime / duration >= 0.9,
        last_watched: new Date().toISOString()
      };

      if (progress) {
        await base44.entities.CourseProgress.update(progress.id, progressData);
      } else {
        const newProgress = await base44.entities.CourseProgress.create(progressData);
        setProgress(newProgress);
      }
    } catch (error) {
      console.error('Erro ao salvar progresso:', error);
    }
  };

  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch')) return url.split('v=')[1]?.split('&')[0];
    if (url.includes('youtu.be/')) return url.split('youtu.be/')[1]?.split('?')[0];
    return null;
  };

  useEffect(() => {
    const videoId = getYouTubeVideoId(course?.video_url);
    if (!videoId || !playerDivRef.current) return;

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => initializePlayer(videoId);
    } else {
      initializePlayer(videoId);
    }

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
      if (timeUpdateInterval.current) clearInterval(timeUpdateInterval.current);
      if (progressSaveInterval.current) clearInterval(progressSaveInterval.current);
    };
  }, [course?.video_url]);

  const initializePlayer = (videoId) => {
    if (!videoId || !playerDivRef.current) return;
    
    playerRef.current = new window.YT.Player(playerDivRef.current, {
      videoId: videoId,
      width: '100%',
      height: '100%',
      playerVars: {
        controls: 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        fs: 0,
        autoplay: 0,
        iv_load_policy: 3,
        cc_load_policy: 0,
        disablekb: 1,
        start: progress?.video_progress ? Math.floor(progress.video_progress) : 0
      },
      events: {
        onReady: (event) => {
          setDuration(event.target.getDuration());
          setIsReady(true);
          
          timeUpdateInterval.current = setInterval(() => {
            if (playerRef.current && playerRef.current.getCurrentTime) {
              const time = playerRef.current.getCurrentTime();
              setCurrentTime(time);
            }
          }, 500);

          progressSaveInterval.current = setInterval(() => {
            if (playerRef.current && playerRef.current.getCurrentTime && playerRef.current.getDuration) {
              const time = playerRef.current.getCurrentTime();
              const dur = playerRef.current.getDuration();
              if (time > 0 && dur > 0) {
                saveProgress(time, dur);
              }
            }
          }, 5000);
        },
        onStateChange: (event) => {
          setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
          
          if (event.data === window.YT.PlayerState.ENDED) {
            saveProgress(duration, duration);
          }
        }
      }
    });
  };

  const togglePlayPause = () => {
    if (!playerRef.current || !isReady) return;
    
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const handleSeek = (value) => {
    if (!playerRef.current || !duration || !isReady) return;
    const newTime = (value[0] / 100) * duration;
    playerRef.current.seekTo(newTime, true);
  };

  const handleVolumeChange = (value) => {
    if (!playerRef.current || !isReady) return;
    const newVolume = value[0];
    setVolume(newVolume);
    playerRef.current.setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (!playerRef.current || !isReady) return;
    
    if (isMuted) {
      playerRef.current.unMute();
      playerRef.current.setVolume(volume);
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  const skip = (seconds) => {
    if (!playerRef.current || !isReady) return;
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    playerRef.current.seekTo(newTime, true);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const isYouTubeVideo = (course?.video_url && 
                         (course.video_url.includes('youtube.com') || 
                          course.video_url.includes('youtu.be')));

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border border-purple-500/20 overflow-hidden shadow-xl">
      <div className="relative">
        {isYouTubeVideo ? (
          <>
            <div className="relative aspect-video bg-black">
              {/* Player YouTube (escondido atrás) */}
              <div 
                ref={playerDivRef} 
                className="absolute inset-0 w-full h-full"
                style={{ pointerEvents: isPlaying ? 'auto' : 'none' }}
              />
              
              {/* Thumbnail overlay quando não está tocando */}
              {!isPlaying && thumbnail && (
                <div 
                  className="absolute inset-0 bg-black flex items-center justify-center cursor-pointer z-10"
                  onClick={togglePlayPause}
                >
                  <img src={thumbnail} alt="Thumbnail" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40" />
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="relative z-20 w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl"
                  >
                    <Play className="w-8 h-8 md:w-10 md:h-10 text-white ml-1" />
                  </motion.div>
                </div>
              )}
            </div>

            {/* Controles Customizados */}
            <div className="bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent p-3 md:p-4 space-y-2 md:space-y-3">
              {/* Progress Bar */}
              <div className="px-1 md:px-2">
                <Slider
                  value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
                  onValueChange={handleSeek}
                  max={100}
                  step={0.1}
                  className="w-full cursor-pointer"
                />
                <div className="flex justify-between text-[10px] md:text-xs text-gray-300 mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between px-1 md:px-2">
                <div className="flex items-center gap-1 md:gap-2">
                  {onPrevious && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={onPrevious} 
                      className="text-white hover:text-purple-300 hover:bg-purple-500/20 h-8 w-8 md:h-10 md:w-10"
                    >
                      <SkipBack className="w-4 h-4 md:w-5 md:h-5" />
                    </Button>
                  )}

                  <Button
                    onClick={togglePlayPause}
                    disabled={!isReady}
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/50"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 md:w-5 md:h-5 text-white" /> : <Play className="w-4 h-4 md:w-5 md:h-5 text-white ml-0.5" />}
                  </Button>

                  {onNext && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={onNext} 
                      className="text-white hover:text-purple-300 hover:bg-purple-500/20 h-8 w-8 md:h-10 md:w-10"
                    >
                      <SkipForward className="w-4 h-4 md:w-5 md:h-5" />
                    </Button>
                  )}

                  {/* Skip buttons para telas pequenas */}
                  <div className="flex items-center gap-1 md:hidden">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => skip(-10)}
                      className="text-white hover:bg-purple-500/20 h-7 px-2 text-[10px]"
                    >
                      -10s
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => skip(10)}
                      className="text-white hover:bg-purple-500/20 h-7 px-2 text-[10px]"
                    >
                      +10s
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:gap-3">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={toggleMute} 
                    className="text-white hover:text-purple-300 hover:bg-purple-500/20 h-8 w-8 md:h-10 md:w-10"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 md:w-5 md:h-5" /> : <Volume2 className="w-4 h-4 md:w-5 md:h-5" />}
                  </Button>
                  <div className="w-16 md:w-20 hidden sm:block">
                    <Slider
                      value={[volume]}
                      onValueChange={handleVolumeChange}
                      max={100}
                      step={1}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <video
            src={course?.video_url}
            controls
            className="w-full aspect-video bg-black"
          />
        )}
      </div>

      {progress && progress.video_progress > 0 && (
        <div className="bg-purple-900/30 border-t border-purple-500/30 p-2 md:p-3 text-center">
          <p className="text-xs md:text-sm text-purple-300">
            ✨ Progresso salvo: {Math.round((progress.video_progress / progress.video_duration) * 100)}% assistido
          </p>
        </div>
      )}
    </Card>
  );
}