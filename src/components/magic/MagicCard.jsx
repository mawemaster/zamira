import React from "react";
import { Card } from "@/components/ui/card";
import { Shield, Zap, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const COLOR_MAP = {
  branco: { bg: "from-yellow-100 to-yellow-300", border: "border-yellow-500", icon: "☀️" },
  azul: { bg: "from-blue-400 to-blue-600", border: "border-blue-500", icon: "💧" },
  preto: { bg: "from-gray-800 to-black", border: "border-gray-700", icon: "💀" },
  vermelho: { bg: "from-red-500 to-red-700", border: "border-red-600", icon: "🔥" },
  verde: { bg: "from-green-500 to-green-700", border: "border-green-600", icon: "🌿" },
  incolor: { bg: "from-gray-400 to-gray-600", border: "border-gray-500", icon: "⚫" }
};

const SIZE_MAP = {
  sm: "w-20 h-28 text-[8px]",
  md: "w-32 h-44 text-xs",
  lg: "w-40 h-56 text-sm"
};

export default function MagicCard({ card, size = "md", onClick, disabled, selected, canAttack, flipped }) {
  const colorStyle = COLOR_MAP[card.color] || COLOR_MAP.incolor;

  if (flipped) {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={`${SIZE_MAP[size]} cursor-pointer`}
      >
        <Card className="w-full h-full bg-gradient-to-br from-purple-900 to-indigo-900 border-2 border-purple-500 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-purple-300" />
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.05, y: disabled ? 0 : -5 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={disabled ? undefined : onClick}
      className={`${SIZE_MAP[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${
        selected ? 'ring-4 ring-yellow-400' : ''
      } ${canAttack ? 'ring-2 ring-green-400' : ''}`}
    >
      <Card className={`w-full h-full bg-gradient-to-br ${colorStyle.bg} border-2 ${colorStyle.border} p-2 flex flex-col justify-between relative overflow-hidden`}>
        {/* Summoning Sickness Indicator */}
        {card.summoning_sickness && (
          <div className="absolute top-0 right-0 bg-red-600 text-white px-1 rounded-bl text-[8px] font-bold">
            SICK
          </div>
        )}

        {/* Card Name & Cost */}
        <div>
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-bold text-white leading-tight flex-1" style={{ textShadow: '1px 1px 2px black' }}>
              {card.name}
            </h3>
            <div className="flex items-center gap-0.5 bg-black/50 rounded px-1">
              <Zap className="w-3 h-3 text-yellow-300" />
              <span className="text-white font-bold text-[10px]">{card.mana_cost}</span>
            </div>
          </div>
          <p className="text-[8px] text-white/80 bg-black/30 px-1 rounded">{card.type}</p>
        </div>

        {/* Card Image/Icon */}
        <div className="flex-1 flex items-center justify-center">
          {card.image_url ? (
            <img src={card.image_url} alt={card.name} className="max-h-full object-contain rounded" />
          ) : (
            <span className="text-4xl">{colorStyle.icon}</span>
          )}
        </div>

        {/* Power/Toughness for Creatures */}
        {card.type === 'criatura' && (
          <div className="flex justify-between items-center">
            <div className="bg-black/70 rounded px-2 py-1 flex items-center gap-1">
              <Shield className="w-3 h-3 text-blue-300" />
              <span className="text-white font-bold text-[10px]">{card.power}/{card.toughness}</span>
            </div>
            {card.tapped && (
              <div className="bg-orange-600 text-white px-1 rounded text-[8px] font-bold">
                VIRADO
              </div>
            )}
          </div>
        )}

        {/* Abilities */}
        {card.abilities && card.abilities.length > 0 && size !== 'sm' && (
          <div className="bg-black/50 rounded p-1 mt-1">
            {card.abilities.slice(0, 2).map((ability, idx) => (
              <p key={idx} className="text-[8px] text-white/90 truncate">{ability}</p>
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  );
}