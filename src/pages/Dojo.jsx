import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { X, Sparkles, Loader2, Wand2, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";

// Deck completo de cartas para sorteio aleatório
const tarotDeck = [
  { name: "O Louco", arcana: "Maior", image: "🃏" },
  { name: "O Mago", arcana: "Maior", image: "🎩" },
  { name: "A Sacerdotisa", arcana: "Maior", image: "🌙" },
  { name: "A Imperatriz", arcana: "Maior", image: "👑" },
  { name: "O Imperador", arcana: "Maior", image: "⚔️" },
  { name: "O Hierofante", arcana: "Maior", image: "📿" },
  { name: "Os Enamorados", arcana: "Maior", image: "💕" },
  { name: "O Carro", arcana: "Maior", image: "🏇" },
  { name: "A Justiça", arcana: "Maior", image: "⚖️" },
  { name: "O Eremita", arcana: "Maior", image: "🕯️" },
  { name: "A Roda da Fortuna", arcana: "Maior", image: "🎡" },
  { name: "A Força", arcana: "Maior", image: "🦁" },
  { name: "O Enforcado", arcana: "Maior", image: "🔮" },
  { name: "A Morte", arcana: "Maior", image: "💀" },
  { name: "A Temperança", arcana: "Maior", image: "🍷" },
  { name: "O Diabo", arcana: "Maior", image: "👹" },
  { name: "A Torre", arcana: "Maior", image: "⚡" },
  { name: "A Estrela", arcana: "Maior", image: "⭐" },
  { name: "A Lua", arcana: "Maior", image: "🌕" },
  { name: "O Sol", arcana: "Maior", image: "☀️" },
  { name: "O Julgamento", arcana: "Maior", image: "📯" },
  { name: "O Mundo", arcana: "Maior", image: "🌍" }
];

export default function DojoPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cards, setCards] = useState([]);
  const [userInterpretation, setUserInterpretation] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    loadUser();
    drawCards();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    }
  };

  const drawCards = () => {
    const shuffled = [...tarotDeck].sort(() => Math.random() - 0.5);
    const drawn = shuffled.slice(0, 3);
    setCards(drawn);
  };

  const handleNewReading = () => {
    drawCards();
    setUserInterpretation("");
    setFeedback("");
    setShowFeedback(false);
  };

  const handleSubmit = async () => {
    if (!userInterpretation.trim()) {
      toast.error("Escreva sua interpretação antes de solicitar orientação!");
      return;
    }

    setIsLoading(true);
    setShowFeedback(false);

    try {
      const cardNames = cards.map(c => c.name);
      
      const prompt = `Você é Esphera, uma mestra de Tarot sábia, gentil e encorajadora. Sua missão não é dar a 'resposta certa', mas guiar o aluno a aprofundar sua própria intuição.

A tiragem do aluno continha as seguintes cartas:
- Passado: ${cardNames[0]}
- Presente: ${cardNames[1]}
- Futuro: ${cardNames[2]}

A interpretação do aluno foi:
"${userInterpretation}"

Sua tarefa é fornecer um feedback construtivo e encorajador seguindo estas regras:
1. Comece elogiando um ponto forte da interpretação.
2. Gentilmente, sugira outras possíveis camadas de significado ou conexões entre as cartas que o aluno pode não ter visto. Não diga que ele está errado.
3. Termine com uma mensagem de incentivo.

Seja poética, mas clara. Use parágrafos curtos e linguagem acolhedora.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false
      });

      setFeedback(response);
      setShowFeedback(true);

      // Dar XP ao usuário por praticar
      await base44.auth.updateMe({
        xp: (user.xp || 0) + 15
      });

      toast.success("+15 XP! Continue praticando! ✨");
    } catch (error) {
      console.error("Erro ao obter feedback:", error);
      toast.error("Não foi possível conectar com a Mestra Esphera. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    navigate(createPageUrl("ArenaHub"));
  };

  if (!user) {
    return (
      <div className="fixed inset-0 bg-[#0a0a1a] flex items-center justify-center z-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-12 h-12 text-purple-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#1a0a2e] to-[#0a0a1a] z-50 overflow-y-auto">
      {/* Partículas de Fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0, 1, 0],
              scale: [0, 1.2, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Botão Fechar */}
      <button
        onClick={handleClose}
        className="fixed top-4 right-4 z-50 w-12 h-12 rounded-full bg-slate-800/50 hover:bg-slate-700/50 flex items-center justify-center transition backdrop-blur-sm"
      >
        <X className="w-6 h-6 text-gray-400" />
      </button>

      <div className="max-w-6xl mx-auto px-4 py-12 pb-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="inline-block mb-4"
          >
            <Wand2 className="w-16 h-16 text-yellow-400 mx-auto" />
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Dojô de Tarot
          </h1>
          <p className="text-gray-400 text-lg md:text-xl mb-2">
            Pratique sua intuição e sabedoria
          </p>
          <p className="text-purple-300 text-sm">
            Mestra Esphera guiará sua jornada de aprendizado
          </p>
        </motion.div>

        {/* O Altar - Área das Cartas */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 border-purple-500/30 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-center text-purple-300 mb-6 flex items-center justify-center gap-2">
              <Star className="w-6 h-6" />
              O Altar da Tiragem
              <Star className="w-6 h-6" />
            </h2>

            <div className="grid grid-cols-3 gap-4 md:gap-8 mb-6">
              {cards.map((card, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8, rotateY: 180 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  transition={{ delay: 0.3 + index * 0.2, duration: 0.6 }}
                  className="text-center"
                >
                  <motion.div
                    whileHover={{ scale: 1.05, y: -10 }}
                    className="bg-gradient-to-br from-yellow-700 to-yellow-900 rounded-2xl p-4 md:p-6 shadow-lg border-2 border-yellow-500/50 mb-3"
                    style={{
                      boxShadow: "0 0 30px rgba(234, 179, 8, 0.3)",
                    }}
                  >
                    <div className="text-4xl md:text-6xl mb-2">{card.image}</div>
                    <p className="text-yellow-100 font-bold text-xs md:text-sm">
                      {card.name}
                    </p>
                  </motion.div>
                  <p className="text-gray-400 text-xs md:text-sm font-semibold uppercase">
                    {index === 0 ? "Passado" : index === 1 ? "Presente" : "Futuro"}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="text-center">
              <Button
                onClick={handleNewReading}
                variant="outline"
                className="border-purple-500/50 text-purple-300 hover:bg-purple-900/30"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Nova Tiragem
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Área de Interpretação */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <Card className="bg-[#131128] border-purple-500/30 p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              Escreva sua interpretação:
            </h3>
            <Textarea
              value={userInterpretation}
              onChange={(e) => setUserInterpretation(e.target.value)}
              placeholder="Com base nas cartas, escreva aqui a sua interpretação da jornada... O que o Passado revela? Como o Presente se manifesta? Para onde o Futuro aponta?"
              className="bg-slate-800/50 border-purple-900/30 text-white placeholder:text-gray-500 min-h-[200px] resize-none text-base leading-relaxed"
              disabled={isLoading}
            />

            <div className="mt-6 flex justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleSubmit}
                  disabled={!userInterpretation.trim() || isLoading}
                  className="bg-gradient-to-r from-yellow-600 via-orange-500 to-red-600 hover:opacity-90 text-white font-bold px-8 py-6 text-lg rounded-xl shadow-lg disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Consultando Esphera...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Pedir Orientação à Mestra
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </Card>
        </motion.div>

        {/* Área de Feedback da IA */}
        <AnimatePresence>
          {showFeedback && feedback && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-400/50 p-6 md:p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <motion.div
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="w-8 h-8 text-yellow-400" />
                  </motion.div>
                  <div>
                    <h3 className="text-2xl font-bold text-purple-300">
                      Sabedoria de Esphera
                    </h3>
                    <p className="text-purple-200 text-sm">
                      Sua mestra de Tarot
                    </p>
                  </div>
                </div>

                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-200 leading-relaxed whitespace-pre-line">
                    {feedback}
                  </p>
                </div>

                <div className="mt-6 pt-6 border-t border-purple-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-yellow-300">
                    <Star className="w-5 h-5" />
                    <span className="text-sm font-semibold">+15 XP pela prática!</span>
                  </div>
                  <Button
                    onClick={handleNewReading}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Wand2 className="w-4 h-4 mr-2" />
                    Nova Tiragem
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State para Feedback */}
        {isLoading && !showFeedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Card className="bg-[#131128] border-purple-500/30 p-8">
              <div className="flex flex-col items-center justify-center gap-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-12 h-12 text-purple-400" />
                </motion.div>
                <p className="text-gray-400 text-center">
                  Esphera está analisando sua interpretação...
                </p>
                <div className="w-full max-w-md h-2 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}