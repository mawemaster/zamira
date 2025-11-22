import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, Map as MapIcon, Navigation, Zap } from "lucide-react";

export default function MapTransitionAnimation({ fromMap, toMap, onComplete }) {
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState("preparing");

  const phases = [
    { key: "preparing", label: "Preparando viagem mística...", duration: 800 },
    { key: "opening", label: "Abrindo portal dimensional...", duration: 1000 },
    { key: "traveling", label: "Atravessando o véu cósmico...", duration: 1200 },
    { key: "loading", label: `Materializando ${toMap}...`, duration: 1000 },
    { key: "stabilizing", label: "Estabilizando energias...", duration: 600 }
  ];

  useEffect(() => {
    let phaseIndex = 0;
    let currentProgress = 0;

    const runPhases = async () => {
      for (let i = 0; i < phases.length; i++) {
        setCurrentPhase(phases[i].key);
        
        const increment = (100 / phases.length);
        const steps = 20;
        const stepDuration = phases[i].duration / steps;
        
        for (let step = 0; step < steps; step++) {
          await new Promise(resolve => setTimeout(resolve, stepDuration));
          currentProgress += increment / steps;
          setProgress(Math.min(currentProgress, 100));
        }
      }
      
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 300);
    };

    runPhases();
  }, []);

  const getPhaseEmoji = () => {
    switch(currentPhase) {
      case "preparing": return "🔮";
      case "opening": return "🌀";
      case "traveling": return "✨";
      case "loading": return "🏰";
      case "stabilizing": return "💫";
      default: return "🔮";
    }
  };

  const currentPhaseData = phases.find(p => p.key === currentPhase);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-gradient-to-b from-[#0f0f1e] via-[#1a1a2e] to-[#0f0f1e] flex items-center justify-center overflow-hidden"
    >
      {/* Partículas de fundo */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-purple-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [0, 1.5, 0],
              opacity: [0, 0.8, 0],
              y: [0, -100],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeOut"
            }}
          />
        ))}
      </div>

      {/* Portal Circular Central */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          rotate: 360
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <div className="relative w-64 h-64 md:w-96 md:h-96">
          {/* Círculos concêntricos */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border-2"
              style={{
                borderColor: `rgba(168, 85, 247, ${0.2 - i * 0.03})`,
                transform: `scale(${1 - i * 0.15})`
              }}
              animate={{
                scale: [1 - i * 0.15, 1.2 - i * 0.15, 1 - i * 0.15],
                opacity: [0.3, 0.6, 0.3],
                rotate: i % 2 === 0 ? 360 : -360
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.2
              }}
            />
          ))}

          {/* Centro do portal */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-purple-600/40 via-pink-600/40 to-blue-600/40 backdrop-blur-xl flex items-center justify-center">
              <motion.div
                animate={{
                  rotate: 360,
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity }
                }}
                className="text-6xl md:text-8xl"
              >
                {getPhaseEmoji()}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Raios de Energia */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`ray-${i}`}
          className="absolute w-1 bg-gradient-to-t from-transparent via-purple-400/60 to-transparent"
          style={{
            left: '50%',
            top: '50%',
            height: '50vh',
            transformOrigin: 'bottom center',
            transform: `rotate(${i * 30}deg)`,
          }}
          animate={{
            scaleY: [0, 1, 0],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Conteúdo Central */}
      <div className="relative z-10 text-center px-4 max-w-md">
        {/* Título da fase */}
        <motion.div
          key={currentPhase}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mb-8"
        >
          <h2 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2">
            Viajando...
          </h2>
          <p className="text-gray-300 text-sm md:text-lg">
            {currentPhaseData?.label}
          </p>
        </motion.div>

        {/* Barra de Progresso Mística */}
        <div className="w-full mb-6">
          <div className="relative h-4 bg-slate-800/50 rounded-full overflow-hidden backdrop-blur-sm border border-purple-500/30">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
            
            {/* Efeito de brilho que passa */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{
                x: ['-100%', '200%']
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </div>
          
          <div className="flex items-center justify-center gap-2 mt-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
            </motion.div>
            <span className="text-purple-300 font-mono text-sm">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Ícones de recursos carregando */}
        <div className="flex justify-center gap-6 md:gap-8">
          <motion.div
            animate={{
              opacity: progress >= 25 ? 1 : 0.3,
              scale: progress >= 25 ? [1, 1.2, 1] : 1,
              y: progress >= 25 ? [0, -5, 0] : 0
            }}
            transition={{ duration: 0.5, repeat: progress >= 25 ? Infinity : 0 }}
            className="flex flex-col items-center gap-2"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              progress >= 25 ? 'bg-purple-600/30' : 'bg-slate-800/30'
            }`}>
              <MapIcon className={`w-6 h-6 ${progress >= 25 ? 'text-purple-400' : 'text-gray-600'}`} />
            </div>
            <span className="text-xs text-gray-400">Mapa</span>
          </motion.div>

          <motion.div
            animate={{
              opacity: progress >= 50 ? 1 : 0.3,
              scale: progress >= 50 ? [1, 1.2, 1] : 1,
              y: progress >= 50 ? [0, -5, 0] : 0
            }}
            transition={{ duration: 0.5, repeat: progress >= 50 ? Infinity : 0 }}
            className="flex flex-col items-center gap-2"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              progress >= 50 ? 'bg-pink-600/30' : 'bg-slate-800/30'
            }`}>
              <Navigation className={`w-6 h-6 ${progress >= 50 ? 'text-pink-400' : 'text-gray-600'}`} />
            </div>
            <span className="text-xs text-gray-400">Posição</span>
          </motion.div>

          <motion.div
            animate={{
              opacity: progress >= 75 ? 1 : 0.3,
              scale: progress >= 75 ? [1, 1.2, 1] : 1,
              y: progress >= 75 ? [0, -5, 0] : 0
            }}
            transition={{ duration: 0.5, repeat: progress >= 75 ? Infinity : 0 }}
            className="flex flex-col items-center gap-2"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              progress >= 75 ? 'bg-blue-600/30' : 'bg-slate-800/30'
            }`}>
              <Zap className={`w-6 h-6 ${progress >= 75 ? 'text-blue-400' : 'text-gray-600'}`} />
            </div>
            <span className="text-xs text-gray-400">Energias</span>
          </motion.div>
        </div>

        {/* Ondas de energia expandindo */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 md:w-[600px] md:h-[600px]"
          animate={{
            scale: [1, 2, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeOut"
          }}
        >
          <div className="w-full h-full rounded-full border-4 border-purple-400/30" />
        </motion.div>
      </div>

      {/* Estrelas cadentes */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute w-1 h-20 bg-gradient-to-b from-white via-purple-400 to-transparent"
          style={{
            left: `${10 + i * 12}%`,
            top: '-10%',
            transform: `rotate(45deg)`,
          }}
          animate={{
            y: ['0vh', '120vh'],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "linear"
          }}
        />
      ))}
    </motion.div>
  );
}