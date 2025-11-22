import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Map, Sparkles, HelpCircle, Navigation, Users, 
  Backpack, ShoppingBag, Award, Settings, MessageCircle, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function MobileGameMenu({ 
  isOpen, 
  onClose, 
  onShowMapLegend, 
  onShowMysticalPoints, 
  onShowTutorial, 
  onToggleJoystick,
  showJoystick,
  onShowInventory,
  playersOnline,
  nearbyPlayers
}) {
  const navigate = useNavigate();

  const menuOptions = [
    {
      icon: Map,
      label: "Mapa & Legenda",
      color: "from-blue-600 to-cyan-600",
      action: () => {
        onShowMapLegend();
        onClose();
      }
    },
    {
      icon: Sparkles,
      label: "Pontos Místicos",
      color: "from-purple-600 to-pink-600",
      action: () => {
        onShowMysticalPoints();
        onClose();
      }
    },
    {
      icon: Backpack,
      label: "Inventário",
      color: "from-yellow-600 to-orange-600",
      action: () => {
        onShowInventory();
        onClose();
      }
    },
    {
      icon: ShoppingBag,
      label: "Loja de Zamira",
      color: "from-amber-600 to-yellow-600",
      action: () => {
        // Já está no jogo, só precisa encontrar o Welder
        onClose();
      }
    },
    {
      icon: MessageCircle,
      label: "Chat Global",
      color: "from-green-600 to-emerald-600",
      action: () => {
        navigate(createPageUrl("Chat"));
      }
    },
    {
      icon: Award,
      label: "Missões",
      color: "from-indigo-600 to-purple-600",
      action: () => {
        navigate(createPageUrl("Missoes"));
      }
    },
    {
      icon: Zap,
      label: "Arena",
      color: "from-red-600 to-pink-600",
      action: () => {
        navigate(createPageUrl("ArenaHub"));
      }
    },
    {
      icon: HelpCircle,
      label: "Tutorial",
      color: "from-slate-600 to-slate-700",
      action: () => {
        onShowTutorial();
        onClose();
      }
    },
    {
      icon: Navigation,
      label: showJoystick ? "Ocultar Joystick" : "Mostrar Joystick",
      color: "from-teal-600 to-cyan-600",
      action: () => {
        onToggleJoystick();
        onClose();
      }
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-gradient-to-b from-slate-900 to-slate-800 border-r border-purple-500/30 overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Menu Místico</h3>
                <button 
                  onClick={onClose} 
                  className="text-gray-400 hover:text-white transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Grid de Opções */}
              <div className="space-y-3 mb-6">
                {menuOptions.map((option, index) => {
                  const Icon = option.icon;
                  return (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={option.action}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r ${option.color} hover:opacity-90 transition shadow-lg`}
                    >
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-white font-semibold text-left flex-1">
                        {option.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Stats */}
              <div className="space-y-3">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30">
                  <p className="text-xs text-gray-400 mb-2">Viajantes Online</p>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-400" />
                    <p className="text-2xl font-bold text-white">{playersOnline}</p>
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30">
                  <p className="text-xs text-gray-400 mb-2">Próximos de Você</p>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-400" />
                    <p className="text-2xl font-bold text-green-400">{nearbyPlayers}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}