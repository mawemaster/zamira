import { useEffect, useRef } from "react";

const AMBIENT_SOUNDS = {
  lobby: "https://cdn.pixabay.com/download/audio/2022/03/10/audio_4a463d640d.mp3?filename=mystical-ambience-10561.mp3",
  city: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07f.mp3?filename=fantasy-game-background-looping-122859.mp3"
};

const SOUND_EFFECTS = {
  // step: removido - sem som de passo
  portal: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c6c2c97bca.mp3?filename=magic-spell-6005.mp3",
  collect: "https://cdn.pixabay.com/download/audio/2022/03/24/audio_1882f75cc0.mp3?filename=coin-recieved-230517.mp3",
  connect: "https://cdn.pixabay.com/download/audio/2022/03/10/audio_21313a6f93.mp3?filename=notification-5-140376.mp3",
  interact: "https://cdn.pixabay.com/download/audio/2021/08/04/audio_7931320f3c.mp3?filename=click-21156.mp3",
  error: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_bb630cc098.mp3?filename=error-126627.mp3",
  success: "https://cdn.pixabay.com/download/audio/2022/03/24/audio_e18c91c54f.mp3?filename=success-1-6297.mp3",
  notification: "https://cdn.pixabay.com/download/audio/2022/03/10/audio_c74a0b6d16.mp3?filename=notification-sound-7062.mp3"
};

export default function SoundManager({ 
  isGameActive, 
  currentMap = 'lobby',
  volume = 0.3,
  onStepSound,
  onPortalSound,
  onCollectSound,
  onConnectSound,
  onInteractSound,
  onErrorSound,
  onSuccessSound,
  onNotificationSound
}) {
  const ambientAudioRef = useRef(null);
  const effectsAudioRefs = useRef({});

  useEffect(() => {
    console.log("🔊 Iniciando SoundManager - Pré-carregando sons...");
    
    Object.entries(SOUND_EFFECTS).forEach(([key, url]) => {
      const audio = new Audio(url);
      audio.volume = volume * 0.8;
      audio.preload = 'auto';
      effectsAudioRefs.current[key] = audio;
      
      audio.addEventListener('canplaythrough', () => {
        console.log(`✅ Som "${key}" carregado com sucesso`);
      });
      
      audio.addEventListener('error', (e) => {
        console.error(`❌ Erro ao carregar som "${key}":`, e);
      });
    });

    return () => {
      Object.values(effectsAudioRefs.current).forEach(audio => {
        audio.pause();
        audio.src = '';
      });
    };
  }, []);

  useEffect(() => {
    if (!isGameActive) return;

    const ambientUrl = AMBIENT_SOUNDS[currentMap] || AMBIENT_SOUNDS.lobby;
    
    console.log(`🎵 Carregando música ambiente para mapa: ${currentMap}`);
    
    if (!ambientAudioRef.current) {
      ambientAudioRef.current = new Audio(ambientUrl);
      ambientAudioRef.current.loop = true;
      ambientAudioRef.current.volume = volume;
      
      ambientAudioRef.current.addEventListener('canplaythrough', () => {
        console.log('✅ Música ambiente carregada com sucesso');
      });
      
      ambientAudioRef.current.addEventListener('error', (e) => {
        console.error('❌ Erro ao carregar música ambiente:', e);
      });
    }

    ambientAudioRef.current.src = ambientUrl;
    ambientAudioRef.current.volume = 0;
    
    ambientAudioRef.current.play()
      .then(() => console.log('✅ Música ambiente tocando'))
      .catch(err => console.error('❌ Erro ao tocar música ambiente:', err));

    const fadeIn = setInterval(() => {
      if (ambientAudioRef.current.volume < volume) {
        ambientAudioRef.current.volume = Math.min(
          ambientAudioRef.current.volume + 0.05,
          volume
        );
      } else {
        clearInterval(fadeIn);
      }
    }, 100);

    return () => {
      clearInterval(fadeIn);
      if (ambientAudioRef.current) {
        const fadeOut = setInterval(() => {
          if (ambientAudioRef.current.volume > 0.05) {
            ambientAudioRef.current.volume = Math.max(
              ambientAudioRef.current.volume - 0.05,
              0
            );
          } else {
            clearInterval(fadeOut);
            ambientAudioRef.current.pause();
          }
        }, 100);
      }
    };
  }, [isGameActive, currentMap, volume]);

  useEffect(() => {
    const playSound = (soundKey) => {
      const audio = effectsAudioRefs.current[soundKey];
      if (audio) {
        audio.currentTime = 0;
        audio.play()
          .then(() => console.log(`🔊 Som "${soundKey}" tocado`))
          .catch(err => console.error(`❌ Erro ao tocar som "${soundKey}":`, err));
      } else {
        console.warn(`⚠️ Som "${soundKey}" não encontrado`);
      }
    };

    // Sem som de passo!
    
    if (onPortalSound) {
      window.playPortalSound = () => playSound('portal');
      console.log('✅ playPortalSound registrado');
    }
    if (onCollectSound) {
      window.playCollectSound = () => playSound('collect');
      console.log('✅ playCollectSound registrado');
    }
    if (onConnectSound) {
      window.playConnectSound = () => playSound('connect');
      console.log('✅ playConnectSound registrado');
    }
    if (onInteractSound) {
      window.playInteractSound = () => playSound('interact');
      console.log('✅ playInteractSound registrado');
    }
    if (onErrorSound) {
      window.playErrorSound = () => playSound('error');
      console.log('✅ playErrorSound registrado');
    }
    if (onSuccessSound) {
      window.playSuccessSound = () => playSound('success');
      console.log('✅ playSuccessSound registrado');
    }
    if (onNotificationSound) {
      window.playNotificationSound = () => playSound('notification');
      console.log('✅ playNotificationSound registrado');
    }

    return () => {
      delete window.playStepSound;
      delete window.playPortalSound;
      delete window.playCollectSound;
      delete window.playConnectSound;
      delete window.playInteractSound;
      delete window.playErrorSound;
      delete window.playSuccessSound;
      delete window.playNotificationSound;
      console.log('🔇 Funções de áudio removidas');
    };
  }, [onStepSound, onPortalSound, onCollectSound, onConnectSound, onInteractSound, onErrorSound, onSuccessSound, onNotificationSound]);

  return null;
}