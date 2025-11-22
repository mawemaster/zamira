import React, { useRef, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Maximize2, Play, Pause } from "lucide-react";
import { motion } from "framer-motion";

export default function MinimizedVideoPlayer({ course, onClose, onMaximize, onProgressUpdate }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const playerRef = useRef(null);
  const playerDivRef = useRef(null);
  const timeUpdateInterval = useRef(null);

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
        autoplay: 1
      },
      events: {
        onReady: (event) => {
          event.target.playVideo();
          
          timeUpdateInterval.current = setInterval(() => {
            if (playerRef.current && playerRef.current.getCurrentTime) {
              const time = playerRef.current.getCurrentTime();
              setCurrentTime(time);
              
              if (onProgressUpdate) {
                onProgressUpdate(time, playerRef.current.getDuration());
              }
            }
          }, 1000);
        },
        onStateChange: (event) => {
          setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
        }
      }
    });
  };

  const togglePlayPause = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-[72px] md:bottom-20 right-4 z-[60] w-64 md:w-80"
      drag
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={{
        top: -window.innerHeight + 250,
        left: -window.innerWidth + 300,
        right: 0,
        bottom: 0
      }}
    >
      <Card className="bg-slate-900 border-2 border-purple-500/50 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 to-pink-900 p-2 flex items-center justify-between">
          <p className="text-white text-xs font-semibold truncate flex-1 mr-2">
            {course.title}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMaximize}
              className="text-white hover:bg-white/20 h-7 w-7"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20 h-7 w-7"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Video */}
        <div className="relative aspect-video bg-black">
          <div ref={playerDivRef} className="absolute inset-0" />
          
          {/* Play/Pause Overlay */}
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
            onClick={togglePlayPause}
          >
            <Button
              className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500"
            >
              {isPlaying ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white ml-0.5" />}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}