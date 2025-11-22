import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { Droplet, Sparkles, Loader2, Moon, Sun } from "lucide-react";

export default function PenduloPage() {
  const [user, setUser] = useState(null);
  const [question, setQuestion] = useState("");
  const [isPendulating, setIsPendulating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const currentUser = await base44.auth.me();
    setUser(currentUser);
  };

  const askPendulum = async () => {
    if (!question.trim()) {
      alert('Digite sua pergunta primeiro');
      return;
    }

    setIsPendulating(true);
    setShowResult(false);

    // Animação de 10 segundos
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Gerar resposta com energia
    const answers = ['sim', 'nao', 'talvez'];
    const randomAnswer = answers[Math.floor(Math.random() * answers.length)];
    
    const energyReadings = {
      sim: 'A energia ao seu redor vibra positivamente. Os caminhos estão se abrindo.',
      nao: 'A energia sugere cautela. Talvez não seja o momento ideal.',
      talvez: 'A energia está neutra. O universo aguarda suas ações para definir o caminho.'
    };

    const newResult = {
      answer: randomAnswer,
      energy_reading: energyReadings[randomAnswer]
    };

    // Salvar no banco
    await base44.entities.PendulumQuestion.create({
      user_id: user.id,
      question: question,
      answer: randomAnswer,
      energy_reading: energyReadings[randomAnswer],
      asked_at: new Date().toISOString()
    });

    setResult(newResult);
    setIsPendulating(false);
    setShowResult(true);
  };

  const resetPendulum = () => {
    setQuestion("");
    setShowResult(false);
    setResult(null);
  };

  if (!user) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#02031C] via-slate-900 to-[#02031C]">
      <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#02031C] via-slate-900 to-[#02031C] text-white p-3 md:p-6 pb-24">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ 
              rotate: isPendulating ? [0, 15, -15, 0] : 0,
              scale: isPendulating ? [1, 1.1, 1] : 1
            }}
            transition={{ 
              duration: 2,
              repeat: isPendulating ? Infinity : 0,
              ease: "easeInOut"
            }}
            className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mx-auto mb-4 shadow-2xl"
          >
            <Droplet className="w-10 h-10 md:w-12 md:h-12 text-white" />
          </motion.div>
          <h1 className="text-2xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Pêndulo Divinatório
          </h1>
          <p className="text-slate-300 text-sm md:text-base">Oráculo do Pêndulo para perguntas sim/não</p>
        </motion.div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {!isPendulating && !showResult && (
            <motion.div
              key="question"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card className="bg-slate-800/50 border-blue-500/30 p-4 md:p-6 mb-6">
                <h3 className="text-lg md:text-xl font-bold text-blue-300 mb-4 text-center">
                  Faça sua Pergunta ao Universo
                </h3>
                
                <Textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Digite sua pergunta (sim/não)..."
                  className="bg-slate-700/50 border-slate-600 text-white mb-4 h-32 text-base md:text-lg"
                  maxLength={200}
                />

                <div className="text-sm text-slate-400 mb-4 text-center">
                  <p>🔮 Concentre-se na sua pergunta</p>
                  <p>💭 Respire fundo e mantenha a mente clara</p>
                  <p>✨ O pêndulo revelará a resposta</p>
                </div>

                <Button
                  onClick={askPendulum}
                  disabled={!question.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-6 text-lg"
                  size="lg"
                >
                  <Droplet className="w-5 h-5 mr-2" />
                  Consultar o Pêndulo
                </Button>
              </Card>

              <Card className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-blue-500/30 p-4">
                <h4 className="font-bold text-blue-300 mb-2">💡 Como Usar</h4>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• Faça perguntas claras que podem ser respondidas com sim/não</li>
                  <li>• Concentre-se na pergunta enquanto o pêndulo consulta</li>
                  <li>• Confie na primeira resposta que vier</li>
                  <li>• Use para decisões do dia a dia e reflexões pessoais</li>
                </ul>
              </Card>
            </motion.div>
          )}

          {isPendulating && (
            <motion.div
              key="pendulating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <Card className="bg-slate-800/50 border-blue-500/30 p-8 md:p-12">
                {/* Pêndulo Animado */}
                <div className="relative h-64 md:h-80 mb-8">
                  {/* Linha do Pêndulo */}
                  <motion.div
                    animate={{
                      rotate: [-30, 30, -30],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute top-0 left-1/2 w-1 h-40 md:h-48 bg-gradient-to-b from-blue-400 to-transparent"
                    style={{ transformOrigin: 'top center' }}
                  >
                    {/* Cristal do Pêndulo */}
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 360]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-12 md:w-10 md:h-14 bg-gradient-to-b from-cyan-400 via-blue-500 to-purple-600 rounded-full shadow-2xl"
                      style={{
                        clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
                      }}
                    />
                  </motion.div>

                  {/* Textos Sim/Não */}
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute left-8 md:left-16 top-48 md:top-56 text-green-400 font-bold text-xl md:text-2xl"
                  >
                    SIM
                  </motion.div>
                  <motion.div
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute right-8 md:right-16 top-48 md:top-56 text-red-400 font-bold text-xl md:text-2xl"
                  >
                    NÃO
                  </motion.div>
                </div>

                <motion.p
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-xl md:text-2xl font-bold text-blue-300 mb-2"
                >
                  Consultando o Universo...
                </motion.p>
                <p className="text-slate-400 text-sm md:text-base">O pêndulo está lendo as energias ao seu redor</p>

                {/* Partículas místicas */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ 
                        x: Math.random() * 400 - 200,
                        y: Math.random() * 400,
                        opacity: 0 
                      }}
                      animate={{
                        y: [null, -100],
                        opacity: [0, 1, 0]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.3,
                        ease: "easeOut"
                      }}
                      className="absolute w-1 h-1 bg-blue-400 rounded-full"
                    />
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {showResult && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              {/* Popup de Resultado */}
              <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", duration: 0.8 }}
                >
                  <Card className={`max-w-md w-full p-6 md:p-8 text-center ${
                    result.answer === 'sim' ? 'bg-gradient-to-br from-green-900/90 to-emerald-900/90 border-green-500' :
                    result.answer === 'nao' ? 'bg-gradient-to-br from-red-900/90 to-rose-900/90 border-red-500' :
                    'bg-gradient-to-br from-yellow-900/90 to-amber-900/90 border-yellow-500'
                  }`}>
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 360]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-20 h-20 mx-auto mb-4"
                    >
                      {result.answer === 'sim' ? '✅' : result.answer === 'nao' ? '❌' : '🤔'}
                    </motion.div>

                    <h2 className="text-3xl md:text-4xl font-bold mb-4 uppercase">
                      {result.answer === 'sim' ? 'SIM' : result.answer === 'nao' ? 'NÃO' : 'TALVEZ'}
                    </h2>

                    <div className="mb-6 p-4 bg-black/30 rounded-lg">
                      <p className="text-sm text-slate-300 mb-2 italic">"{question}"</p>
                    </div>

                    <div className="mb-6 p-4 bg-white/10 rounded-lg">
                      <p className="text-sm md:text-base text-white">
                        <Sparkles className="w-4 h-4 inline mr-2" />
                        {result.energy_reading}
                      </p>
                    </div>

                    <Button
                      onClick={resetPendulum}
                      className="w-full bg-white/20 hover:bg-white/30 text-white"
                      size="lg"
                    >
                      Fazer Nova Consulta
                    </Button>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}