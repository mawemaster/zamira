import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Sparkles, Info, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { TAROT_CARDS, ALL_CARDS } from "../components/tarot/TarotCards";

// Naipes do Tarot
const naipes = [
  {
    id: "copas",
    name: "Copas",
    emoji: "🏆",
    icon: "💧",
    description: "Emoções, relacionamentos, intuição",
    color: "from-blue-600 to-cyan-600"
  },
  {
    id: "espadas",
    name: "Espadas",
    emoji: "⚔️",
    icon: "🗡️",
    description: "Pensamento, conflito, verdade",
    color: "from-gray-600 to-slate-600"
  },
  {
    id: "paus",
    name: "Paus",
    emoji: "🔥",
    icon: "🪵",
    description: "Paixão, energia, criatividade",
    color: "from-orange-600 to-red-600"
  },
  {
    id: "ouros",
    name: "Ouros",
    emoji: "💰",
    icon: "💎",
    description: "Materialidade, segurança, recursos",
    color: "from-yellow-600 to-amber-600"
  }
];

export default function OraculoCombinacoesPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedNaipe, setSelectedNaipe] = useState(null);
  const [selectedArcano, setSelectedArcano] = useState(null);
  const [interpretation, setInterpretation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showNaipeInfo, setShowNaipeInfo] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    }
  };

  const handleNaipeSelect = (naipe) => {
    setSelectedNaipe(naipe);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleArcanoSelect = async (arcano) => {
    setSelectedArcano(arcano);
    setIsLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const prompt = `Você é uma taróloga mestre especializada em combinações de cartas.

Analise a combinação entre:
- NAIPE: ${selectedNaipe.name} (${selectedNaipe.description})
- ARCANO MAIOR: ${arcano.name}

Forneça uma interpretação profunda e prática sobre como essa combinação específica pode se manifestar na vida de alguém.

Estruture sua resposta em:
1. **Síntese da Combinação** (2-3 frases sobre a essência da combinação)
2. **No Amor** (como essa combinação afeta relacionamentos)
3. **No Trabalho** (manifestação profissional)
4. **No Espiritual** (significado espiritual)
5. **Conselho Prático** (ação concreta que a pessoa pode tomar)

Seja específica, use exemplos práticos e mantenha um tom acolhedor e místico.
Tamanho total: 4-6 parágrafos.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false
      });

      setInterpretation(response);
      setIsLoading(false);

      await base44.auth.updateMe({
        xp: (user.xp || 0) + 15
      });
    } catch (error) {
      console.error("Erro ao gerar interpretação:", error);
      setIsLoading(false);
      setInterpretation("Erro ao conectar com as energias cósmicas. Tente novamente.");
    }
  };

  const handleBack = () => {
    if (selectedArcano) {
      setSelectedArcano(null);
      setInterpretation(null);
    } else if (selectedNaipe) {
      setSelectedNaipe(null);
    } else {
      navigate(createPageUrl("AreaDoAluno"));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]">
        <Sparkles className="w-12 h-12 text-purple-500 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-white p-4 md:p-6 pb-32">
      <div className="max-w-4xl mx-auto">
        {/* HEADER COM BOTÃO VOLTAR */}
        <div className="mb-6 md:mb-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-purple-300 hover:text-purple-100 transition mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              🔮 Oráculo de Combinações
            </h1>
            <p className="text-purple-300 text-sm md:text-base">
              Descubra o significado profundo da união entre Arcanos e Naipes
            </p>
          </motion.div>
        </div>

        {/* INFO EXPANDÍVEL */}
        {!selectedNaipe && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="bg-[#1a1a2e] border-purple-500/30 p-4">
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-purple-400" />
                  <span className="text-purple-300 font-semibold">Como Funciona</span>
                </div>
                {showInfo ? (
                  <ChevronUp className="w-5 h-5 text-purple-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-purple-400" />
                )}
              </button>
              
              <AnimatePresence>
                {showInfo && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 text-gray-300 text-sm space-y-2"
                  >
                    <p>
                      1️⃣ Escolha um dos 4 Naipes (Copas, Espadas, Paus ou Ouros)
                    </p>
                    <p>
                      2️⃣ Selecione um Arcano Maior (0-21)
                    </p>
                    <p>
                      3️⃣ Receba uma interpretação única sobre como essas energias se combinam
                    </p>
                    <p className="text-purple-400 font-semibold mt-3">
                      ✨ +15 XP por cada combinação explorada
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        )}

        {/* SELEÇÃO DE NAIPE */}
        {!selectedNaipe && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-xl md:text-2xl font-bold text-purple-300 mb-4 text-center">
              Escolha um Naipe
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {naipes.map((naipe) => (
                <motion.div
                  key={naipe.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card
                    onClick={() => handleNaipeSelect(naipe)}
                    className={`bg-gradient-to-br ${naipe.color} border-white/20 p-6 cursor-pointer hover:shadow-2xl transition-all`}
                  >
                    <div className="text-center">
                      <div className="text-5xl md:text-6xl mb-3">{naipe.emoji}</div>
                      <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                        {naipe.name}
                      </h3>
                      <p className="text-white/80 text-xs md:text-sm">
                        {naipe.description}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* SELEÇÃO DE ARCANO MAIOR - COM IMAGENS REAIS */}
        {selectedNaipe && !selectedArcano && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-[#1a1a2e] border-purple-500/30 p-4 mb-6">
              <button
                onClick={() => setShowNaipeInfo(!showNaipeInfo)}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedNaipe.emoji}</span>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-white">Naipe: {selectedNaipe.name}</h3>
                    <p className="text-sm text-purple-300">{selectedNaipe.description}</p>
                  </div>
                </div>
                {showNaipeInfo ? (
                  <ChevronUp className="w-5 h-5 text-purple-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-purple-400" />
                )}
              </button>
              
              {showNaipeInfo && (
                <div className="mt-4 pt-4 border-t border-purple-500/30">
                  <p className="text-gray-300 text-sm">
                    Agora escolha um Arcano Maior para ver como ele se combina com a energia de {selectedNaipe.name}.
                  </p>
                </div>
              )}
            </Card>

            <h2 className="text-xl md:text-2xl font-bold text-purple-300 mb-4 text-center">
              Escolha um Arcano Maior
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
              {ALL_CARDS.map((arcano) => (
                <motion.div
                  key={arcano.id}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card
                    onClick={() => handleArcanoSelect(arcano)}
                    className="bg-slate-800 border-purple-500/30 cursor-pointer hover:border-purple-500/60 transition-all overflow-hidden group"
                  >
                    <div className="aspect-[2/3] relative overflow-hidden">
                      <img 
                        src={arcano.image} 
                        alt={arcano.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <p className="text-white font-bold text-xs md:text-sm text-center leading-tight">
                          {arcano.name}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* INTERPRETAÇÃO FINAL - COM IMAGEM DA CARTA */}
        {selectedNaipe && selectedArcano && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-purple-500/50 p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {selectedNaipe.name} + {selectedArcano.name}
                  </h3>
                  <p className="text-purple-300 text-sm">
                    {selectedNaipe.description}
                  </p>
                </div>
                <div className="w-24 md:w-32 flex-shrink-0">
                  <Card className="bg-white rounded-lg overflow-hidden shadow-xl">
                    <img 
                      src={selectedArcano.image} 
                      alt={selectedArcano.name} 
                      className="w-full h-auto object-cover"
                    />
                  </Card>
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  </motion.div>
                  <p className="text-purple-300">Consultando as energias cósmicas...</p>
                </div>
              ) : interpretation ? (
                <div className="prose prose-invert max-w-none">
                  <div className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                    {interpretation}
                  </div>
                </div>
              ) : null}
            </Card>

            {interpretation && (
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setSelectedArcano(null);
                    setInterpretation(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  variant="outline"
                  className="flex-1 border-purple-500/50 text-purple-300 hover:bg-purple-900/20"
                >
                  Escolher Outro Arcano
                </Button>
                <Button
                  onClick={() => {
                    setSelectedNaipe(null);
                    setSelectedArcano(null);
                    setInterpretation(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Nova Combinação
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}