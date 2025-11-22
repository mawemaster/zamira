import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, CheckCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const rarityColors = {
  comum: { color: "text-gray-400", bg: "bg-gray-700", border: "border-gray-500" },
  rara: { color: "text-blue-400", bg: "bg-blue-900/50", border: "border-blue-500" },
  epica: { color: "text-purple-400", bg: "bg-purple-900/50", border: "border-purple-500" },
  lendaria: { color: "text-yellow-400", bg: "bg-yellow-900/50", border: "border-yellow-500" },
  mitica: { color: "text-pink-400", bg: "bg-pink-900/50", border: "border-pink-500" }
};

export default function SkinDetailModal({ 
  skin, 
  owned = false, 
  equipped = false, 
  isOpen, 
  onClose, 
  onBuy, 
  onEquip,
  buying = false,
  equipping = false,
  userOuros = 0
}) {
  if (!isOpen || !skin) return null;

  const rarity = rarityColors[skin.rarity] || rarityColors.comum;
  const canAfford = userOuros >= skin.price_ouros;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-3 md:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className={`relative w-full max-w-sm md:max-w-md bg-gradient-to-b from-slate-900 to-slate-800 rounded-2xl border-4 ${rarity.border} shadow-2xl overflow-hidden`}
        >
          {/* Header with glow */}
          <div className={`absolute top-0 left-0 right-0 h-24 md:h-32 ${rarity.bg} blur-3xl opacity-50`} />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 md:top-4 right-3 md:right-4 z-20 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition"
          >
            <X className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </button>

          {/* Content */}
          <div className="relative z-10 p-4 md:p-6">
            {/* Image */}
            <div className="mb-4 md:mb-6">
              <img
                src={skin.image_url}
                alt={skin.name}
                className="w-full h-48 md:h-64 object-cover rounded-xl shadow-2xl"
              />
            </div>

            {/* Title and Rarity */}
            <div className="text-center mb-3 md:mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2">{skin.name}</h2>
              <Badge className={`${rarity.bg} ${rarity.color} border ${rarity.border} text-xs md:text-sm`}>
                {skin.rarity.toUpperCase()}
              </Badge>
              {owned && equipped && (
                <Badge className="ml-2 bg-green-600 text-white text-xs md:text-sm">
                  EQUIPADO
                </Badge>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-300 text-xs md:text-sm text-center mb-3 md:mb-4">
              {skin.description}
            </p>

            {/* Lore */}
            {skin.lore && (
              <div className="bg-slate-800/50 rounded-lg p-3 md:p-4 mb-3 md:mb-4">
                <p className="text-[10px] md:text-xs text-gray-400 italic leading-relaxed">
                  "{skin.lore}"
                </p>
              </div>
            )}

            {/* Attributes */}
            {skin.attributes && (
              <div className="grid grid-cols-2 gap-2 mb-3 md:mb-4">
                {skin.attributes.poder !== undefined && (
                  <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                    <p className="text-[10px] md:text-xs text-gray-400">Poder</p>
                    <p className="text-base md:text-lg font-bold text-red-400">{skin.attributes.poder}</p>
                  </div>
                )}
                {skin.attributes.magia !== undefined && (
                  <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                    <p className="text-[10px] md:text-xs text-gray-400">Magia</p>
                    <p className="text-base md:text-lg font-bold text-purple-400">{skin.attributes.magia}</p>
                  </div>
                )}
                {skin.attributes.sabedoria !== undefined && (
                  <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                    <p className="text-[10px] md:text-xs text-gray-400">Sabedoria</p>
                    <p className="text-base md:text-lg font-bold text-blue-400">{skin.attributes.sabedoria}</p>
                  </div>
                )}
                {skin.attributes.raridade_nivel !== undefined && (
                  <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                    <p className="text-[10px] md:text-xs text-gray-400">Raridade</p>
                    <p className={`text-base md:text-lg font-bold ${rarity.color}`}>{skin.attributes.raridade_nivel}</p>
                  </div>
                )}
              </div>
            )}

            {/* Price */}
            <div className="flex items-center justify-center gap-2 mb-3 md:mb-4">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
              <span className="text-xl md:text-2xl font-bold text-yellow-300">
                {skin.price_ouros} Ouros
              </span>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              {!owned && (
                <>
                  <Button
                    onClick={onBuy}
                    disabled={buying || !canAfford}
                    className={`w-full h-11 md:h-12 text-sm md:text-base font-bold ${
                      canAfford 
                        ? 'bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700'
                        : 'bg-gray-600 cursor-not-allowed'
                    }`}
                  >
                    {buying ? (
                      <>
                        <Sparkles className="w-4 h-4 md:w-5 md:h-5 mr-2 animate-spin" />
                        Comprando...
                      </>
                    ) : canAfford ? (
                      <>
                        <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                        Comprar Skin
                      </>
                    ) : (
                      'Ouros Insuficientes'
                    )}
                  </Button>
                  {!canAfford && (
                    <p className="text-[10px] md:text-xs text-red-400 text-center">
                      Você precisa de {skin.price_ouros - userOuros} ouros a mais
                    </p>
                  )}
                </>
              )}

              {owned && !equipped && (
                <Button
                  onClick={onEquip}
                  disabled={equipping}
                  className="w-full h-11 md:h-12 text-sm md:text-base font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {equipping ? (
                    <>
                      <Sparkles className="w-4 h-4 md:w-5 md:h-5 mr-2 animate-spin" />
                      Equipando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                      Equipar Skin
                    </>
                  )}
                </Button>
              )}

              {owned && equipped && (
                <div className="text-center py-2 md:py-3 bg-green-900/30 rounded-lg border border-green-500/30">
                  <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-400 mx-auto mb-1" />
                  <p className="text-green-400 font-bold text-xs md:text-sm">Esta skin está equipada!</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}