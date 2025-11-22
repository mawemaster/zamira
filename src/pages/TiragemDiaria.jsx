import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RotateCcw, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TAROT_CARDS, getRandomCard } from "../components/tarot/TarotCards";

export default function TiragemDiariaPage() {
  const [user, setUser] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [canDraw, setCanDraw] = useState(true);
  const [isReversed, setIsReversed] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      checkDailyDraw(currentUser);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    }
  };

  const checkDailyDraw = async (currentUser) => {
    const today = new Date().toISOString().split('T')[0];
    const readings = await base44.entities.TarotReading.filter({
      user_id: currentUser.id,
      reading_type: "daily"
    }, "-created_date", 1);

    if (readings.length > 0) {
      const lastReading = readings[0];
      const lastReadingDate = new Date(lastReading.created_date).toISOString().split('T')[0];
      
      if (lastReadingDate === today) {
        setCanDraw(false);
        const cardData = lastReading.cards[0];
        const card = TAROT_CARDS[Object.values(TAROT_CARDS).findIndex(c => c.name === cardData.card_name)];
        if (card) {
          setSelectedCard(card);
          setIsReversed(cardData.is_reversed);
        }
      }
    }
  };

  const drawCardMutation = useMutation({
    mutationFn: async () => {
      const randomCard = getRandomCard();
      const reversed = Math.random() > 0.5;

      const reading = await base44.entities.TarotReading.create({
        user_id: user.id,
        reading_type: "daily",
        cards: [{
          card_name: randomCard.name,
          position: "daily",
          is_reversed: reversed,
          meaning: `Sua carta do dia é ${randomCard.name}${reversed ? ' (invertida)' : ''}.`
        }],
        interpretation: `Sua carta do dia é ${randomCard.name}${reversed ? ' (invertida)' : ''}.`,
        energy_level: Math.floor(Math.random() * 10) + 1
      });

      await base44.auth.updateMe({
        xp: (user.xp || 0) + 10
      });

      return { ...randomCard, is_reversed: reversed };
    },
    onSuccess: (card) => {
      setSelectedCard(card);
      setIsReversed(card.is_reversed);
      setCanDraw(false);
      queryClient.invalidateQueries({ queryKey: ['tarotReadings'] });
    },
  });

  const handleDrawCard = () => {
    setIsFlipping(true);
    setTimeout(() => {
      drawCardMutation.mutate();
      setIsFlipping(false);
    }, 1000);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Sparkles className="w-12 h-12 text-purple-500 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#02031C] via-slate-900 to-[#02031C] text-white p-3 md:p-6 pb-24">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 md:mb-8"
        >
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity }
            }}
            className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-2xl"
          >
            <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-white" />
          </motion.div>
          <h1 className="text-2xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-rose-400 to-purple-400 bg-clip-text text-transparent">
            Tiragem Diária
          </h1>
          <p className="text-slate-300 text-sm md:text-base">Ritual diário com uma carta de Tarot</p>
        </motion.div>

        <div className="flex flex-col items-center">
          <AnimatePresence mode="wait">
            {!selectedCard ? (
              <motion.div
                key="card-back"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, rotateY: 90 }}
                className="mb-8"
              >
                <motion.div
                  animate={isFlipping ? { rotateY: 360 } : {}}
                  transition={{ duration: 1 }}
                >
                  <Card 
                    className="w-48 md:w-64 h-72 md:h-96 bg-gradient-to-br from-purple-900 via-pink-900 to-blue-900 border-purple-500 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform shadow-2xl"
                    onClick={canDraw ? handleDrawCard : undefined}
                  >
                    <div className="text-center">
                      <Sparkles className="w-16 h-16 md:w-24 md:h-24 text-purple-300 mx-auto mb-4" />
                      <p className="text-purple-200 text-sm">Toque para revelar</p>
                    </div>
                  </Card>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="card-front"
                initial={{ opacity: 0, rotateY: -90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-8"
              >
                <div className={`w-48 md:w-64 ${isReversed ? 'rotate-180' : ''}`}>
                  <Card className="bg-white rounded-xl overflow-hidden shadow-2xl border-4 border-purple-500">
                    <img 
                      src={selectedCard.image} 
                      alt={selectedCard.name} 
                      className="w-full h-auto object-cover"
                    />
                  </Card>
                  {isReversed && (
                    <p className="text-sm text-purple-400 mt-2 text-center">(Carta Invertida)</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {selectedCard && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-2xl"
            >
              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-purple-900/30 p-6 md:p-8">
                <h3 className="text-xl md:text-2xl font-bold text-purple-300 mb-3 md:mb-4 text-center">
                  {selectedCard.name}
                </h3>
                <p className="text-gray-300 text-center text-sm md:text-base leading-relaxed mb-4 md:mb-6">
                  Medite sobre esta carta durante o dia. Ela traz mensagens importantes para sua jornada.
                </p>
                
                <div className="text-center">
                  <p className="text-sm text-purple-400 mb-4">
                    +10 XP concedidos por sua prática diária ✨
                  </p>
                  {!canDraw && (
                    <p className="text-xs text-gray-500">
                      Retorne amanhã para uma nova tiragem
                    </p>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {canDraw && !selectedCard && (
            <Button
              onClick={handleDrawCard}
              disabled={isFlipping || drawCardMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-base md:text-lg px-6 md:px-8 py-4 md:py-6"
            >
              {isFlipping ? (
                <>
                  <RotateCcw className="w-5 h-5 md:w-6 md:h-6 mr-2 animate-spin" />
                  Revelando...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 md:w-6 md:h-6 mr-2" />
                  Revelar Carta do Dia
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}