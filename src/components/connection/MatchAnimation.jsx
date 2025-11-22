import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MatchAnimation({ currentUser, matchedUser, onClose, onOpenChat }) {
  const [showHearts, setShowHearts] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    // Após 2 segundos, mostrar confirmação
    const timer = setTimeout(() => {
      setShowHearts(false);
      setShowConfirmation(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Gerar corações aleatórios
  const hearts = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 3,
    size: 20 + Math.random() * 40,
  }));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Corações Voadores */}
        {showHearts && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {hearts.map((heart) => (
              <motion.div
                key={heart.id}
                className="absolute"
                style={{
                  left: `${heart.x}%`,
                  top: `${heart.y}%`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  scale: [0, 1, 1.2, 0],
                  y: [0, -200],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: heart.duration,
                  delay: heart.delay,
                  ease: "easeOut",
                }}
              >
                <Heart
                  className="text-pink-500"
                  style={{ width: heart.size, height: heart.size }}
                  fill="currentColor"
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Conteúdo Principal */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: "spring", damping: 15 }}
          onClick={(e) => e.stopPropagation()}
          className="relative z-10"
        >
          {/* Fase 1: Fotos + Coração Central */}
          {!showConfirmation ? (
            <div className="flex items-center gap-4 md:gap-6">
              {/* Foto do Usuário Atual */}
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-purple-500 overflow-hidden shadow-2xl"
              >
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.display_name}
                  className="w-full h-full object-cover"
                />
              </motion.div>

              {/* Coração Pulsante */}
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative"
              >
                <Heart
                  className="w-16 h-16 md:w-20 md:h-20 text-pink-500"
                  fill="currentColor"
                />
                <motion.div
                  className="absolute inset-0"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                >
                  <Heart
                    className="w-16 h-16 md:w-20 md:h-20 text-pink-400"
                    fill="currentColor"
                  />
                </motion.div>
              </motion.div>

              {/* Foto do Match */}
              <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-pink-500 overflow-hidden shadow-2xl"
              >
                <img
                  src={matchedUser.avatar_url}
                  alt={matchedUser.display_name}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>
          ) : (
            /* Fase 2: Confirmação */
            <div className="bg-gradient-to-br from-purple-900/90 via-pink-900/90 to-purple-900/90 backdrop-blur-xl rounded-3xl p-6 md:p-8 border-2 border-pink-500/50 shadow-2xl max-w-md">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 10 }}
                className="text-center"
              >
                {/* Ícone de Sucesso */}
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-xl">
                  <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-white" />
                </div>

                {/* Título */}
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  🎉 Match Realizado! 🎉
                </h2>

                {/* Mensagem */}
                <p className="text-pink-200 mb-2 text-sm md:text-base">
                  Você se conectou com
                </p>
                <p className="text-white text-xl md:text-2xl font-bold mb-4">
                  {matchedUser.display_name}!
                </p>

                {/* Notificação Enviada */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mb-6">
                  <p className="text-purple-200 text-xs md:text-sm">
                    ✨ Notificação enviada! Aguarde a confirmação para iniciar uma conversa especial.
                  </p>
                </div>

                {/* Botões */}
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={onOpenChat}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold shadow-lg"
                  >
                    <Heart className="w-5 h-5 mr-2" fill="currentColor" />
                    Iniciar Chat Místico
                  </Button>

                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="w-full border-pink-400/50 text-pink-300 hover:bg-pink-500/20"
                  >
                    Continuar Explorando
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}