
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const zodiacSigns = [
  { value: "Áries", emoji: "♈", element: "Fogo", dates: "21/03 - 19/04" },
  { value: "Touro", emoji: "♉", element: "Terra", dates: "20/04 - 20/05" },
  { value: "Gêmeos", emoji: "♊", element: "Ar", dates: "21/05 - 20/06" },
  { value: "Câncer", emoji: "♋", element: "Água", dates: "21/06 - 22/07" },
  { value: "Leão", emoji: "♌", element: "Fogo", dates: "23/07 - 22/08" },
  { value: "Virgem", emoji: "♍", element: "Terra", dates: "23/08 - 22/09" },
  { value: "Libra", emoji: "♎", element: "Ar", dates: "23/09 - 22/10" },
  { value: "Escorpião", emoji: "♏", element: "Água", dates: "23/10 - 21/11" },
  { value: "Sagitário", emoji: "♐", element: "Fogo", dates: "22/11 - 21/12" },
  { value: "Capricórnio", emoji: "♑", element: "Terra", dates: "22/12 - 19/01" },
  { value: "Aquário", emoji: "♒", element: "Ar", dates: "20/01 - 18/02" },
  { value: "Peixes", emoji: "♓", element: "Água", dates: "19/02 - 20/03" }
];

export default function HoroscopeModal({ isOpen, onClose, user, currentSign }) {
  const [horoscope, setHoroscope] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSignSelector, setShowSignSelector] = useState(!currentSign);
  const [selectedSign, setSelectedSign] = useState(currentSign);

  useEffect(() => {
    if (isOpen) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (selectedSign) {
        loadHoroscope();
      }
    }
  }, [isOpen, selectedSign]);

  const loadHoroscope = async () => {
    try {
      setLoading(true);
      const userName = user.display_name || user.full_name?.split(' ')[0] || 'Viajante';
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Como um astrólogo místico brasileiro, crie um horóscopo personalizado COMPLETO para hoje para ${userName}, que é do signo de ${selectedSign}.

O horóscopo DEVE OBRIGATORIAMENTE ter pelo menos 4 parágrafos e incluir:

1º Parágrafo: Visão Geral do Dia
- Como o dia se apresenta para ${userName}
- Energias principais do signo ${selectedSign} hoje

2º Parágrafo: Amor e Relacionamentos
- Orientações sobre vida amorosa
- Conexões e relacionamentos

3º Parágrafo: Trabalho e Finanças
- Oportunidades profissionais
- Gestão financeira

4º Parágrafo: Saúde e Bem-estar
- Cuidados com a saúde física e mental
- Práticas de autocuidado

5º Parágrafo (Bônus): Conselho Místico
- Um conselho prático e aplicável
- Ritual ou prática espiritual sugerida

IMPORTANTE:
- Escreva em português brasileiro
- Use o nome ${userName} pelo menos 3 vezes no texto
- Mencione o signo ${selectedSign} pelo menos 2 vezes
- Seja positivo, inspirador e místico
- Não use títulos ou seções, apenas texto corrido
- Mínimo de 4 parágrafos, idealmente 5

Exemplo de tom: "${userName}, os astros se alinham favoravelmente para você hoje. Como ${selectedSign}, sua energia está vibrante e cheia de possibilidades..."`,
        add_context_from_internet: true
      });

      setHoroscope(response || "As estrelas tecem seu caminho com sabedoria infinita.");
      setLoading(false);
    } catch (error) {
      console.error("Erro ao carregar horóscopo:", error);
      setHoroscope("As estrelas estão temporariamente obscurecidas. Tente novamente em breve.");
      setLoading(false);
    }
  };

  const handleSignSelect = async (sign) => {
    setSelectedSign(sign);
    setShowSignSelector(false);
    
    // Salvar signo escolhido no perfil
    await base44.auth.updateMe({
      zodiac_sign: sign
    });
    
    // The loadHoroscope will be called by the useEffect due to selectedSign change
  };

  const handleChangeSign = () => {
    setShowSignSelector(true);
    setHoroscope("");
  };

  if (!isOpen) return null;

  const signData = zodiacSigns.find(s => s.value === selectedSign);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 md:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <Card className="bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 border-purple-500/30 p-4 md:p-6">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center gap-2 md:gap-3">
                <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
                <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-white">
                  {showSignSelector ? "Escolha seu Signo" : "Horóscopo do Dia"}
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-gray-400 hover:text-white h-8 w-8 md:h-10 md:w-10"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </Button>
            </div>

            {showSignSelector ? (
              <div>
                <p className="text-xs md:text-sm text-gray-300 mb-4 md:mb-6 text-center">
                  Selecione seu signo do zodíaco para receber seu horóscopo personalizado
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                  {zodiacSigns.map((sign, index) => (
                    <motion.button
                      key={sign.value}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleSignSelect(sign.value)}
                      className="p-3 md:p-4 bg-slate-800/50 hover:bg-purple-900/40 border border-slate-700/30 hover:border-purple-500/50 rounded-xl transition text-center group"
                    >
                      <p className="text-3xl md:text-4xl mb-1 md:mb-2 group-hover:scale-110 transition">{sign.emoji}</p>
                      <p className="text-xs md:text-sm font-bold text-white mb-0.5 md:mb-1">{sign.value}</p>
                      <p className="text-[10px] md:text-xs text-gray-400 mb-0.5">{sign.element}</p>
                      <p className="text-[9px] md:text-[10px] text-gray-500">{sign.dates}</p>
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                {signData && (
                  <div className="text-center mb-4 md:mb-6 pb-4 md:pb-6 border-b border-purple-900/30">
                    <p className="text-4xl md:text-5xl lg:text-6xl mb-2 md:mb-3">{signData.emoji}</p>
                    <h3 className="text-xl md:text-2xl font-bold text-purple-300 mb-1 md:mb-2">{signData.value}</h3>
                    <p className="text-xs md:text-sm text-gray-400 mb-3 md:mb-4">
                      Elemento {signData.element} • {signData.dates}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleChangeSign}
                      className="text-[10px] md:text-xs h-7 md:h-8"
                    >
                      Trocar Signo
                    </Button>
                  </div>
                )}

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-8 md:py-12">
                    <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-purple-500 animate-spin mb-3 md:mb-4" />
                    <p className="text-sm md:text-base text-gray-400">Consultando os astros...</p>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-purple-900/20 rounded-xl p-4 md:p-6 border border-purple-500/20"
                  >
                    <div className="flex items-center gap-2 mb-3 md:mb-4">
                      <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-purple-400" />
                      <p className="text-xs md:text-sm font-semibold text-purple-300 uppercase tracking-wide">
                        Sua Mensagem Cósmica
                      </p>
                    </div>
                    <div className="prose prose-invert prose-sm max-w-none">
                      <p className="text-xs md:text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
                        {horoscope}
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
