
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Skull, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { addHours } from "date-fns";

// MAGIAS BRANCAS - Todos os níveis
const whiteMagics = [
  {
    id: "destaque_ouro",
    name: "Destaque Dourado",
    emoji: "✨",
    description: "Post brilha em dourado por 24h, aparece mais no feed",
    cost: 50,
    duration: 24,
    minLevel: 1,
    effect: "highlight_gold"
  },
  {
    id: "destaque_roxo",
    name: "Destaque Místico",
    emoji: "💜",
    description: "Post brilha em roxo místico por 12h, ganha aura especial",
    cost: 30,
    duration: 12,
    minLevel: 1,
    effect: "highlight_purple"
  },
  {
    id: "destaque_arcoiris",
    name: "Destaque Arco-Íris",
    emoji: "🌈",
    description: "Post com efeito arco-íris por 48h, máxima visibilidade",
    cost: 100,
    duration: 48,
    minLevel: 10,
    effect: "highlight_rainbow"
  },
  {
    id: "protecao",
    name: "Escudo Protetor",
    emoji: "🛡️",
    description: "Protege o post de magias sombrias por 24h",
    cost: 40,
    duration: 24,
    minLevel: 5,
    effect: "protection"
  },
  {
    id: "amplificacao",
    name: "Amplificação Energética",
    emoji: "⚡",
    description: "Dobra reações por 12h",
    cost: 60,
    duration: 12,
    minLevel: 15,
    effect: "amplify"
  },
  {
    id: "cristal_puro",
    name: "Cristal Puro",
    emoji: "💎",
    description: "Post ganha brilho de cristal e bordas brilhantes",
    cost: 80,
    duration: 36,
    minLevel: 20,
    effect: "crystal_glow"
  }
];

// MAGIAS SOMBRIAS - Nível 70+
const darkMagics = [
  {
    id: "enfeitico_leve",
    name: "Enfeitiço Leve",
    emoji: "🌑",
    description: "Post fica levemente escurecido por 6h",
    cost: 25,
    duration: 6,
    minLevel: 70,
    effect: "bewitch_light"
  },
  {
    id: "enfeitico_medio",
    name: "Enfeitiço Médio",
    emoji: "🌘",
    description: "Post fica muito escurecido por 12h",
    cost: 50,
    duration: 12,
    minLevel: 75,
    effect: "bewitch_medium"
  },
  {
    id: "enfeitico_pesado",
    name: "Enfeitiço Pesado",
    emoji: "🌚",
    description: "Post fica quase invisível por 24h",
    cost: 100,
    duration: 24,
    minLevel: 80,
    effect: "bewitch_heavy"
  },
  {
    id: "tremor_mistico",
    name: "Tremor Místico",
    emoji: "🌪️",
    description: "Post fica tremendo constantemente",
    cost: 70,
    duration: 12,
    minLevel: 72,
    effect: "shake"
  },
  {
    id: "glitch_sombrio",
    name: "Glitch Sombrio",
    emoji: "📺",
    description: "Post com efeito de glitch/bugado",
    cost: 90,
    duration: 18,
    minLevel: 77,
    effect: "glitch"
  },
  {
    id: "chamas_negras",
    name: "Chamas Negras",
    emoji: "🔥",
    description: "Post envolto em chamas sombrias",
    cost: 120,
    duration: 24,
    minLevel: 85,
    effect: "dark_flames"
  },
  {
    id: "distorcao",
    name: "Distorção Dimensional",
    emoji: "🌀",
    description: "Post distorcido e ondulante",
    cost: 80,
    duration: 15,
    minLevel: 73,
    effect: "distortion"
  },
  {
    id: "maldicao_silenciosa",
    name: "Maldição Silenciosa",
    emoji: "🤐",
    description: "Post não aparece em buscas por 24h",
    cost: 150,
    duration: 24,
    minLevel: 90,
    effect: "curse_silent"
  }
];

export default function MagicModal({ isOpen, onClose, post, currentUser, onMagicCast }) {
  if (!post?.id || !currentUser?.id) return null;

  const [selectedMagic, setSelectedMagic] = useState(null);
  const [magicMessage, setMagicMessage] = useState("");

  const handleCastMagic = () => {
    if (!selectedMagic || !currentUser?.id || !post?.id) {
      toast.error("Selecione uma magia primeiro");
      return;
    }

    if ((currentUser.ouros || 0) < selectedMagic.cost) {
      toast.error("Ouros insuficientes");
      return;
    }

    if ((currentUser.level || 1) < selectedMagic.minLevel) {
      toast.error(`Você precisa ser nível ${selectedMagic.minLevel} para usar esta magia`);
      return;
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + selectedMagic.duration);

    onMagicCast({
      magicType: selectedMagic.id,
      cost: selectedMagic.cost,
      message: magicMessage,
      duration: selectedMagic.duration,
      expiresAt: expiresAt.toISOString()
    });

    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-purple-500/30"
          >
            <div className="p-4 md:p-6 border-b border-purple-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-purple-600/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-white">Grimório de Magias</h3>
                    <p className="text-xs md:text-sm text-gray-300">Lance feitiços e encantos neste post</p>
                  </div>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>
              
              <div className="flex items-center gap-2 mt-4 text-yellow-400">
                <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                <span className="font-bold text-base md:text-lg">{currentUser.ouros || 0} Ouros disponíveis</span>
              </div>
            </div>

            <div className="p-4 md:p-6 overflow-y-auto max-h-[60vh]">
              <Tabs defaultValue="white" className="w-full">
                <TabsList className="w-full bg-slate-800 mb-6">
                  <TabsTrigger value="white" className="flex-1 data-[state=active]:bg-purple-600">
                    <Sparkles className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Magias Brancas</span>
                    <span className="sm:hidden">Brancas</span>
                  </TabsTrigger>
                  <TabsTrigger value="dark" className="flex-1 data-[state=active]:bg-red-900">
                    <Skull className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Magias Sombrias</span>
                    <span className="sm:hidden">Sombrias</span>
                    {currentUser.level < 70 && (
                      <Lock className="w-3 h-3 ml-1 md:ml-2" />
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="white" className="space-y-3">
                  {whiteMagics.map((magic) => {
                    const canCast = currentUser.level >= magic.minLevel;
                    const isSelected = selectedMagic?.id === magic.id;

                    return (
                      <button
                        key={magic.id}
                        onClick={() => canCast && setSelectedMagic(magic)}
                        disabled={!canCast}
                        className={`w-full text-left p-3 md:p-4 rounded-xl border-2 transition ${
                          isSelected
                            ? 'border-purple-500 bg-purple-900/30'
                            : canCast
                            ? 'border-purple-700/30 bg-purple-900/10 hover:border-purple-600/50'
                            : 'border-slate-700 bg-slate-800/30 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                            <span className="text-2xl md:text-3xl flex-shrink-0">{magic.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h4 className="text-white font-bold text-sm md:text-base">{magic.name}</h4>
                                {!canCast && (
                                  <Badge variant="outline" className="text-xs">
                                    Nível {magic.minLevel}+
                                  </Badge>
                                )}
                              </div>
                              <p className="text-gray-300 text-xs md:text-sm">{magic.description}</p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-yellow-400 font-bold text-base md:text-lg whitespace-nowrap">
                              {magic.cost}💰
                            </p>
                            <p className="text-gray-400 text-xs">{magic.duration}h</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </TabsContent>

                <TabsContent value="dark" className="space-y-3">
                  {currentUser.level < 70 ? (
                    <div className="text-center py-12">
                      <Lock className="w-12 h-12 md:w-16 md:h-16 text-red-500 mx-auto mb-4" />
                      <h3 className="text-lg md:text-xl font-bold text-white mb-2">
                        Grimório Trancado
                      </h3>
                      <p className="text-gray-300 text-sm md:text-base">
                        Você precisa ser nível 70+ para acessar as Magias Sombrias
                      </p>
                      <p className="text-red-400 text-xs md:text-sm mt-2">
                        Nível atual: {currentUser.level}
                      </p>
                    </div>
                  ) : (
                    darkMagics.map((magic) => {
                      const canCast = currentUser.level >= magic.minLevel;
                      const isSelected = selectedMagic?.id === magic.id;

                      return (
                        <button
                          key={magic.id}
                          onClick={() => canCast && setSelectedMagic(magic)}
                          disabled={!canCast}
                          className={`w-full text-left p-3 md:p-4 rounded-xl border-2 transition ${
                            isSelected
                              ? 'border-red-500 bg-red-900/30'
                              : canCast
                              ? 'border-red-700/30 bg-red-900/10 hover:border-red-600/50'
                              : 'border-slate-700 bg-slate-800/30 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                              <span className="text-2xl md:text-3xl flex-shrink-0">{magic.emoji}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <h4 className="text-white font-bold text-sm md:text-base">{magic.name}</h4>
                                  {!canCast && (
                                    <Badge variant="outline" className="text-xs bg-red-900 border-red-700">
                                      Nível {magic.minLevel}+
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-gray-300 text-xs md:text-sm">{magic.description}</p>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-yellow-400 font-bold text-base md:text-lg whitespace-nowrap">
                                {magic.cost}💰
                              </p>
                              <p className="text-gray-400 text-xs">{magic.duration}h</p>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </TabsContent>
              </Tabs>

              {selectedMagic && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <label className="text-sm font-semibold text-gray-200 mb-2 block">
                    Mensagem Personalizada (opcional)
                  </label>
                  <Textarea
                    value={magicMessage}
                    onChange={(e) => setMagicMessage(e.target.value)}
                    placeholder="Adicione uma mensagem ao lançar a magia..."
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-gray-500"
                    rows={3}
                  />
                </motion.div>
              )}
            </div>

            <div className="p-4 md:p-6 border-t border-purple-500/30 bg-slate-900/50">
              {selectedMagic ? (
                <div className="flex gap-3">
                  <Button
                    onClick={() => setSelectedMagic(null)}
                    variant="outline"
                    className="flex-1 border-slate-600 text-white"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCastMagic}
                    disabled={(!currentUser?.ouros || currentUser.ouros < selectedMagic.cost)}
                    className={`flex-1 ${
                      selectedMagic.minLevel >= 70
                        ? 'bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900'
                        : 'bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900'
                    }`}
                  >
                    Lançar por {selectedMagic.cost} Ouros
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="w-full border-slate-600 text-white"
                >
                  Fechar Grimório
                </Button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
