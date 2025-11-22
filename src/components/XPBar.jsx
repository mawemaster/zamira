import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Award, Star } from "lucide-react";

const generateFireflies = (count) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    initialX: Math.random() * 100,
    initialY: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 4 + Math.random() * 4,
    color: ['rgba(168, 85, 247, 0.3)', 'rgba(236, 72, 153, 0.3)', 'rgba(59, 130, 246, 0.3)', 'rgba(251, 191, 36, 0.3)'][Math.floor(Math.random() * 4)]
  }));
};

const fireflies = generateFireflies(8);

export default function XPBar({ user }) {
  const [isLevelingUp, setIsLevelingUp] = useState(false);
  const [newLevel, setNewLevel] = useState(null);

  const checkLevelUp = React.useCallback(async () => {
    if (!user?.id) return;

    const currentLevel = user.level || 1;
    const currentXP = user.xp || 0;
    const xpForNextLevel = currentLevel * 100;

    if (currentXP >= xpForNextLevel) {
      let newLevelCalc = currentLevel;
      let remainingXP = currentXP;

      while (remainingXP >= (newLevelCalc * 100)) {
        remainingXP -= (newLevelCalc * 100);
        newLevelCalc += 1;
      }

      try {
        setNewLevel(newLevelCalc);
        setIsLevelingUp(true);

        await base44.auth.updateMe({
          level: newLevelCalc,
          xp: remainingXP,
        });

        await base44.entities.Notification.create({
          user_id: user.id,
          type: "level_up",
          title: "Level Up! 🎉",
          message: `Parabéns! Você alcançou o nível ${newLevelCalc}!`,
          is_read: false,
        });

        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } catch (error) {
        console.error("Erro ao subir de nível:", error);
        setIsLevelingUp(false);
      }
    }
  }, [user?.id, user?.level, user?.xp]);

  useEffect(() => {
    checkLevelUp();
  }, [checkLevelUp]);

  useEffect(() => {
    const handleXPUpdate = () => {
      checkLevelUp();
    };

    window.addEventListener('xpUpdated', handleXPUpdate);
    return () => window.removeEventListener('xpUpdated', handleXPUpdate);
  }, [checkLevelUp]);

  if (!user?.id) {
    return null;
  }

  const currentLevel = user.level || 1;
  const currentXP = user.xp || 0;
  const xpForNextLevel = currentLevel * 100;
  const progress = Math.min((currentXP / xpForNextLevel) * 100, 100);

  return (
    <>
      <div className="fixed top-[56px] md:top-[64px] left-0 right-0 z-40">
        <div className="h-4 md:h-5 bg-gradient-to-r from-purple-900/40 via-purple-800/30 to-purple-900/40 backdrop-blur-sm relative overflow-hidden">
          {/* Barra de Progresso */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          
          {/* Vagalumes Coloridos dentro da Barra */}
          {fireflies.map((firefly) => (
            <motion.div
              key={firefly.id}
              className="absolute rounded-full blur-[1px]"
              style={{
                width: '2px',
                height: '2px',
                left: `${firefly.initialX}%`,
                top: `${firefly.initialY}%`,
                backgroundColor: firefly.color,
              }}
              animate={{
                x: [0, Math.random() * 40 - 20, Math.random() * 40 - 20, 0],
                y: [0, Math.random() * 8 - 4, Math.random() * 8 - 4, 0],
                opacity: [0.2, 0.5, 0.3, 0.2],
                scale: [0.6, 1, 0.8, 0.6],
              }}
              transition={{
                duration: firefly.duration,
                delay: firefly.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
          
          {/* Efeito de Brilho Suave */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
            animate={{
              x: ["-100%", "200%"],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          {/* Porcentagem Centralizada Elegante */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] md:text-xs font-bold text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] tracking-wider">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      </div>

      {/* Level Up Animation */}
      <AnimatePresence>
        {isLevelingUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "backOut" }}
              className="relative text-center"
            >
              {/* Círculos de Partículas */}
              <div className="absolute inset-0">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                    style={{
                      left: '50%',
                      top: '50%',
                    }}
                    animate={{
                      x: [0, (Math.cos(i * 18 * Math.PI / 180) * 150)],
                      y: [0, (Math.sin(i * 18 * Math.PI / 180) * 150)],
                      opacity: [1, 0],
                      scale: [1, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      delay: i * 0.05,
                      ease: "easeOut",
                    }}
                  />
                ))}
              </div>

              {/* Estrelas Brilhantes */}
              <motion.div
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      transform: `rotate(${i * 45}deg) translateY(-100px)`,
                    }}
                    animate={{
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.2,
                      repeat: Infinity,
                    }}
                  >
                    <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                  </motion.div>
                ))}
              </motion.div>

              {/* Conteúdo Central */}
              <div className="relative z-10 bg-gradient-to-br from-purple-900/80 to-pink-900/80 rounded-3xl p-8 md:p-12 border-4 border-yellow-400 shadow-2xl shadow-yellow-400/50">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="mb-6"
                >
                  <Award className="w-24 h-24 md:w-32 md:h-32 text-yellow-400 mx-auto" />
                </motion.div>

                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl md:text-6xl font-bold text-white mb-4"
                >
                  Level Up!
                </motion.h2>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="inline-flex items-center gap-3 bg-yellow-400 text-purple-900 px-8 py-4 rounded-full font-bold text-2xl md:text-3xl shadow-xl"
                >
                  <Sparkles className="w-8 h-8" />
                  Nível {newLevel}
                  <Sparkles className="w-8 h-8" />
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-white/90 text-lg md:text-xl mt-6"
                >
                  Parabéns pela evolução! 🎉
                </motion.p>
              </div>

              {/* Confete Caindo */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(30)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-3 rounded-sm"
                    style={{
                      left: `${Math.random() * 100}%`,
                      backgroundColor: ['#fbbf24', '#ec4899', '#a855f7', '#3b82f6'][Math.floor(Math.random() * 4)],
                    }}
                    animate={{
                      y: [-100, window.innerHeight + 100],
                      x: [0, Math.random() * 100 - 50],
                      rotate: [0, Math.random() * 360],
                    }}
                    transition={{
                      duration: 2 + Math.random() * 2,
                      delay: Math.random() * 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}