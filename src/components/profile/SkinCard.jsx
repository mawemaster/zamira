import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, Coins } from "lucide-react";

const rarityColors = {
  comum: {
    border: "border-gray-500",
    bg: "from-gray-700 to-gray-800",
    glow: "shadow-gray-500/30"
  },
  rara: {
    border: "border-blue-500",
    bg: "from-blue-700 to-blue-900",
    glow: "shadow-blue-500/40"
  },
  epica: {
    border: "border-purple-500",
    bg: "from-purple-700 to-purple-900",
    glow: "shadow-purple-500/50"
  },
  lendaria: {
    border: "border-yellow-500",
    bg: "from-yellow-600 to-orange-700",
    glow: "shadow-yellow-500/60"
  },
  mitica: {
    border: "border-pink-500",
    bg: "from-pink-600 to-purple-700",
    glow: "shadow-pink-500/70"
  }
};

export default function SkinCard({ skin, owned = false, equipped = false, onClick }) {
  const rarity = rarityColors[skin.rarity] || rarityColors.comum;

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative cursor-pointer rounded-xl overflow-hidden ${rarity.border} border-2 ${rarity.glow} shadow-lg bg-slate-900`}
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-b ${rarity.bg} opacity-40`} />
      
      {/* Equipped Badge */}
      {equipped && (
        <div className="absolute top-1 right-1 z-20 bg-green-500 text-white text-[7px] md:text-[8px] px-1 md:px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
          <CheckCircle className="w-2 h-2 md:w-2.5 md:h-2.5" />
          <span className="hidden sm:inline">EQUIPADO</span>
        </div>
      )}

      {/* Image */}
      <div className="relative aspect-square p-1.5 md:p-2">
        <img
          src={skin.image_url}
          alt={skin.name}
          className="w-full h-full object-cover rounded-lg"
        />
      </div>

      {/* Name and Price */}
      <div className="relative p-1.5 md:p-2 bg-black/60 backdrop-blur-sm">
        <p className="text-white text-[9px] md:text-[10px] font-bold text-center truncate mb-0.5">
          {skin.name}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-gray-300 text-[7px] md:text-[8px] uppercase">
            {skin.rarity}
          </p>
          {!owned && (
            <div className="flex items-center gap-0.5 bg-yellow-900/30 px-1 py-0.5 rounded-full">
              <Coins className="w-2 h-2 md:w-2.5 md:h-2.5 text-yellow-400" />
              <span className="text-yellow-300 text-[7px] md:text-[8px] font-bold">{skin.price_ouros}</span>
            </div>
          )}
        </div>
      </div>

      {/* Owned indicator */}
      {owned && !equipped && (
        <div className="absolute top-1 left-1 z-20">
          <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-green-500/90 flex items-center justify-center">
            <CheckCircle className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />
          </div>
        </div>
      )}

      {/* Shine Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: owned ? 3 : 5,
          ease: "linear",
        }}
      />
    </motion.div>
  );
}