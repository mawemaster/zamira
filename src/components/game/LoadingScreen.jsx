import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";

export default function LoadingScreen({ progress = 0, currentTask = "Carregando..." }) {
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayProgress(prev => {
        if (prev < progress) {
          return Math.min(prev + 2, progress);
        }
        return prev;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [progress]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-gradient-to-b from-[#0f0f1e] via-[#1a1a2e] to-[#0f0f1e] flex items-center justify-center"
    >
      <div className="text-center max-w-md w-full px-6">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="mb-8"
        >
          <Sparkles className="w-16 h-16 text-purple-500 mx-auto" />
        </motion.div>

        <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
          Preparando Zamira
        </h2>

        <div className="relative w-full h-3 bg-slate-800 rounded-full overflow-hidden mb-4">
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600"
            style={{ width: `${displayProgress}%` }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </motion.div>
        </div>

        <p className="text-purple-300 text-sm mb-2">{currentTask}</p>
        <p className="text-purple-400 text-xl font-bold">{displayProgress}%</p>

        <div className="mt-8 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
          <span className="text-gray-400 text-xs">Aguarde...</span>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </motion.div>
  );
}