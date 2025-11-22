import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, Heart, MessageCircle, UserPlus, TrendingUp, Award, Sparkles, Crown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const notificationIcons = {
  follow: UserPlus,
  reaction: Heart,
  comment: MessageCircle,
  level_up: TrendingUp,
  achievement: Award,
  daily_blessing: Sparkles,
  synchronicity: Sparkles,
  duel_challenge: Crown,
  duel_result: Crown,
  announcement: Bell
};

const playedSounds = new Set();

const playNotificationSound = async (type) => {
  if (playedSounds.has(type)) return;

  try {
    playedSounds.add(type);
    
    setTimeout(() => {
      playedSounds.delete(type);
    }, 2000);

    const soundMapping = {
      'follow': 'new_follower',
      'reaction': 'reaction',
      'comment': 'comment',
      'level_up': 'level_up',
      'achievement': 'achievement',
      'announcement': 'notification'
    };

    const soundName = soundMapping[type] || 'notification';
    
    const sounds = await base44.entities.SystemSound.filter({ 
      sound_name: soundName,
      is_active: true 
    });

    if (sounds.length > 0 && sounds[0].audio_url) {
      const audio = new Audio(sounds[0].audio_url);
      audio.volume = sounds[0].volume || 0.5;
      audio.play().catch(e => console.log('Audio play prevented:', e));
    }
  } catch (error) {
    console.error('Error playing sound:', error);
  }
};

const showBrowserNotification = async (notification) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      const notif = new Notification(notification.title, {
        body: notification.message,
        icon: notification.from_user_avatar || 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e5f6f991e09e82bef3795/a3f627646_imgi_2_337f3cf9e282bc41c87500e885414629.png',
        badge: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e5f6f991e09e82bef3795/a3f627646_imgi_2_337f3cf9e282bc41c87500e885414629.png',
        tag: notification.id,
        requireInteraction: false,
        silent: false
      });

      notif.onclick = () => {
        window.focus();
        if (notification.action_url) {
          window.location.href = notification.action_url;
        }
        notif.close();
      };
    } catch (error) {
      console.error('Browser notification error:', error);
    }
  }
};

export default function NotificationToast({ notification, onClose }) {
  const [visible, setVisible] = useState(true);
  const navigate = useNavigate();
  const Icon = notificationIcons[notification.type] || Bell;

  useEffect(() => {
    playNotificationSound(notification.type);
    showBrowserNotification(notification);

    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const handleClick = () => {
    handleClose();
    
    if (notification.action_url) {
      navigate(notification.action_url);
    } else if (notification.related_entity_id) {
      switch (notification.related_entity_type) {
        case 'post':
          navigate(createPageUrl('Hub'));
          break;
        case 'comment':
          navigate(createPageUrl('Hub'));
          break;
        case 'user':
          navigate(createPageUrl(`Perfil?username=${notification.from_user_id}`));
          break;
        default:
          navigate(createPageUrl('Notificacoes'));
          break;
      }
    } else {
      navigate(createPageUrl('Notificacoes'));
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: -20, x: 20 }}
          onClick={handleClick}
          className="bg-gradient-to-r from-purple-900 to-purple-800 border border-purple-600/50 rounded-xl shadow-2xl p-4 max-w-sm w-full backdrop-blur-sm cursor-pointer hover:border-purple-500 transition"
        >
          <div className="flex items-start gap-3">
            {notification.from_user_avatar ? (
              <img
                src={notification.from_user_avatar}
                alt=""
                className="w-10 h-10 rounded-full flex-shrink-0 border-2 border-purple-400"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-purple-700 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-white" />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm mb-1">
                {notification.title}
              </p>
              <p className="text-purple-200 text-xs line-clamp-2">
                {notification.message}
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              className="text-purple-300 hover:text-white transition flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}