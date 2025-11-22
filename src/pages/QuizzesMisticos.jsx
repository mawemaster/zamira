import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Loader2, Clock, Award, Sparkles, CheckCircle, XCircle, Star, Trophy, Zap, Medal, TrendingUp, Coins } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const QUIZ_THEMES = [
  { id: 'tarot-arcanos', name: 'Tarot - Arcanos Maiores', emoji: '🃏', difficulty: 'médio' },
  { id: 'astrologia-basica', name: 'Astrologia Básica', emoji: '⭐', difficulty: 'fácil' },
  { id: 'cristais-propriedades', name: 'Cristais e Propriedades', emoji: '💎', difficulty: 'médio' },
  { id: 'chakras-equilibrio', name: 'Chakras e Equilíbrio', emoji: '🌈', difficulty: 'fácil' },
  { id: 'numerologia', name: 'Numerologia Mística', emoji: '🔢', difficulty: 'médio' },
  { id: 'simbolismo-sonhos', name: 'Simbolismo dos Sonhos', emoji: '💭', difficulty: 'difícil' },
  { id: 'mitologia-grega', name: 'Mitologia Grega', emoji: '🏛️', difficulty: 'médio' },
  { id: 'mitologia-egipcia', name: 'Mitologia Egípcia', emoji: '🐍', difficulty: 'difícil' },
  { id: 'psicologia-jung', name: 'Psicologia Junguiana', emoji: '🧠', difficulty: 'difícil' },
  { id: 'alquimia', name: 'Alquimia e Transmutação', emoji: '⚗️', difficulty: 'difícil' },
  { id: 'runas-nordicas', name: 'Runas Nórdicas', emoji: 'ᚱ', difficulty: 'médio' },
  { id: 'cabala', name: 'Cabala e Árvore da Vida', emoji: '🕎', difficulty: 'difícil' },
  { id: 'i-ching', name: 'I Ching - Sabedoria Chinesa', emoji: '☯️', difficulty: 'difícil' },
  { id: 'xamanismo', name: 'Xamanismo e Jornadas', emoji: '🪶', difficulty: 'médio' },
  { id: 'wicca', name: 'Wicca e Magia Natural', emoji: '🌙', difficulty: 'médio' },
  { id: 'arquétipos', name: 'Arquétipos e Personalidade', emoji: '🎭', difficulty: 'fácil' },
  { id: 'lua-fases', name: 'Fases da Lua e Rituais', emoji: '🌕', difficulty: 'fácil' },
  { id: 'elementos', name: 'Os 4 Elementos', emoji: '🔥', difficulty: 'fácil' },
];

export default function QuizzesMisticosPage() {
  const [user, setUser] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(90);
  const [showResult, setShowResult] = useState(false);

  const navigate = useNavigate();

  React.useEffect(() => {
    loadUser();
  }, []);

  const { data: topScores } = useQuery({
    queryKey: ['top-quiz-scores'],
    queryFn: () => base44.entities.QuizScore.list("-score_percentage", 10),
    refetchInterval: 10000
  });

  React.useEffect(() => {
    if (quiz && !showResult && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && quiz && !showResult) {
      finishQuiz();
    }
  }, [timeLeft, quiz, showResult]);

  const loadUser = async () => {
    const currentUser = await base44.auth.me();
    setUser(currentUser);
  };

  const generateQuiz = async (theme) => {
    setIsGenerating(true);
    setSelectedTheme(theme);

    const prompt = `Crie um quiz sobre "${theme.name}" com exatamente 10 perguntas de múltipla escolha.

Para cada pergunta:
- Crie uma pergunta desafiadora e interessante
- Forneça 4 alternativas (A, B, C, D)
- Indique qual é a resposta correta
- Adicione uma explicação educativa para a resposta correta

Retorne no formato JSON especificado.`;

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  options: {
                    type: "array",
                    items: { type: "string" }
                  },
                  correct_answer: { type: "number" },
                  explanation: { type: "string" }
                }
              }
            }
          }
        }
      });

      setQuiz(response.questions);
      setCurrentQuestion(0);
      setAnswers([]);
      setTimeLeft(90);
      setShowResult(false);
      setIsGenerating(false);
    } catch (error) {
      alert('Erro ao gerar quiz: ' + error.message);
      setIsGenerating(false);
    }
  };

  const handleAnswer = (optionIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);

    if (currentQuestion < quiz.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 500);
    } else {
      setTimeout(() => {
        finishQuiz();
      }, 500);
    }
  };

  const finishQuiz = async () => {
    const correctCount = answers.reduce((count, answer, idx) => {
      return answer === quiz[idx].correct_answer ? count + 1 : count;
    }, 0);

    const score = Math.round((correctCount / quiz.length) * 100);
    const timeTaken = 90 - timeLeft;

    // Salvar score no ranking
    await base44.entities.QuizScore.create({
      user_id: user.id,
      user_name: user.display_name || user.full_name,
      user_avatar: user.avatar_url,
      quiz_theme: selectedTheme.name,
      correct_answers: correctCount,
      total_questions: quiz.length,
      score_percentage: score,
      time_taken: timeTaken,
      xp_earned: correctCount >= 8 ? Math.floor((user.xp || 0) * 0.005) : 0,
      ouros_earned: correctCount >= 8 ? 5 : 0
    });

    // Dar XP e Ouros se acertar 8/10 ou mais
    if (correctCount >= 8) {
      const currentXP = user.xp || 0;
      const currentOuros = user.ouros || 0;
      const xpGain = Math.floor(currentXP * 0.005);
      
      await base44.auth.updateMe({
        xp: currentXP + xpGain,
        ouros: currentOuros + 5
      });

      const popup = document.createElement('div');
      popup.className = 'fixed top-20 left-1/2 -translate-x-1/2 z-[200] bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-full shadow-2xl font-bold';
      popup.textContent = `+${xpGain} XP! +5 Ouros! 🌟`;
      document.body.appendChild(popup);
      setTimeout(() => popup.remove(), 3000);

      loadUser();
    }

    setShowResult(true);
  };

  const resetQuiz = () => {
    setQuiz(null);
    setSelectedTheme(null);
    setCurrentQuestion(0);
    setAnswers([]);
    setTimeLeft(90);
    setShowResult(false);
  };

  if (!user) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#02031C] via-slate-900 to-[#02031C]">
      <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#02031C] via-slate-900 to-[#02031C] text-white p-3 md:p-6 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 3, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity }
            }}
            className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mx-auto mb-4 shadow-2xl"
          >
            <Brain className="w-10 h-10 md:w-12 md:h-12 text-white" />
          </motion.div>
          <h1 className="text-2xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Quizzes Místicos
          </h1>
          <p className="text-slate-300 text-sm md:text-base">Teste seu conhecimento e ganhe XP</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!selectedTheme && !isGenerating && (
            <motion.div
              key="selection"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Tabs defaultValue="temas" className="mb-6">
                <TabsList className="grid w-full grid-cols-2 bg-slate-800">
                  <TabsTrigger value="temas">
                    <Brain className="w-4 h-4 mr-2" />
                    Temas
                  </TabsTrigger>
                  <TabsTrigger value="ranking">
                    <Trophy className="w-4 h-4 mr-2" />
                    Ranking
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="temas" className="mt-6">
                  <Card className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-purple-500/30 p-4 mb-6">
                    <p className="text-sm text-purple-300 text-center">
                      <Zap className="w-4 h-4 inline mr-2" />
                      Acerte <strong>8/10 ou mais</strong> e ganhe <strong>5 ouros + 0.5% XP</strong>!
                    </p>
                  </Card>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {QUIZ_THEMES.map((theme, idx) => (
                  <motion.div
                    key={theme.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                  >
                    <Card
                      onClick={() => generateQuiz(theme)}
                      className="bg-slate-800/50 border-purple-500/30 p-4 hover:border-purple-400 transition cursor-pointer group"
                    >
                      <div className="text-4xl mb-3 group-hover:scale-110 transition">{theme.emoji}</div>
                      <h3 className="font-bold text-purple-300 mb-2 text-sm">{theme.name}</h3>
                      <Badge className={`text-xs ${
                        theme.difficulty === 'fácil' ? 'bg-green-100 text-green-800' :
                        theme.difficulty === 'médio' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {theme.difficulty}
                      </Badge>
                    </Card>
                  </motion.div>
                ))}
              </div>
                </TabsContent>

                <TabsContent value="ranking" className="mt-6">
                  <Card className="bg-slate-800/50 border-purple-500/30 p-4 md:p-6">
                    <h3 className="text-xl font-bold text-purple-300 mb-4 flex items-center gap-2">
                      <Trophy className="w-6 h-6 text-yellow-400" />
                      Top 10 Mestres dos Quizzes
                    </h3>
                    {topScores && topScores.length > 0 ? (
                      <div className="space-y-3">
                        {topScores.map((score, index) => (
                          <motion.div
                            key={score.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`p-3 md:p-4 rounded-xl border-2 transition ${
                              index === 0 ? 'bg-gradient-to-r from-yellow-900/30 to-amber-900/30 border-yellow-500/50' :
                              index === 1 ? 'bg-gradient-to-r from-gray-800/30 to-gray-700/30 border-gray-400/50' :
                              index === 2 ? 'bg-gradient-to-r from-orange-900/30 to-amber-900/30 border-orange-500/50' :
                              'bg-slate-700/30 border-purple-500/30'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                                index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-slate-900' :
                                index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-slate-900' :
                                index === 2 ? 'bg-gradient-to-br from-orange-400 to-amber-600 text-slate-900' :
                                'bg-slate-600 text-white'
                              }`}>
                                {index + 1}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-bold text-white truncate">
                                    {score.user_name}
                                  </p>
                                  <Badge className="bg-purple-600 text-white text-xs">
                                    {score.quiz_theme}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-300">
                                  <span className="flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3 text-green-400" />
                                    {score.correct_answers}/{score.total_questions}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3 text-purple-400" />
                                    {score.score_percentage}%
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-blue-400" />
                                    {score.time_taken}s
                                  </span>
                                </div>
                              </div>

                              <div className="text-right flex-shrink-0">
                                {score.xp_earned > 0 && (
                                  <Badge className="bg-green-600 text-white text-xs mb-1">
                                    +{score.xp_earned} XP
                                  </Badge>
                                )}
                                {score.ouros_earned > 0 && (
                                  <div className="flex items-center gap-1 text-yellow-400 font-bold text-sm">
                                    <Coins className="w-4 h-4" />
                                    {score.ouros_earned}
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Medal className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400">Nenhum score registrado ainda</p>
                        <p className="text-sm text-slate-500 mt-2">Seja o primeiro a completar um quiz!</p>
                      </div>
                    )}
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}

          {isGenerating && (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Card className="bg-slate-800/50 border-purple-500/30 p-8 md:p-12">
                <motion.div
                  animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                  transition={{ rotate: { duration: 2, repeat: Infinity, ease: "linear" }, scale: { duration: 1.5, repeat: Infinity } }}
                  className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center"
                >
                  <Brain className="w-12 h-12 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold text-purple-300 mb-2">Gerando Quiz...</h2>
                <p className="text-slate-400">A IA está criando perguntas sobre {selectedTheme?.name}</p>
              </Card>
            </motion.div>
          )}

          {quiz && !showResult && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {/* Timer e Progresso */}
              <Card className="bg-slate-800/50 border-purple-500/30 p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-400" />
                    <span className={`font-bold text-lg ${timeLeft < 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                      {timeLeft}s
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <span>{currentQuestion + 1} / {quiz.length}</span>
                  </div>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQuestion + 1) / quiz.length) * 100}%` }}
                    className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                  />
                </div>
              </Card>

              {/* Pergunta */}
              <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-500/30 p-6 md:p-8">
                <div className="text-center mb-6">
                  <Badge className="bg-purple-700 text-white mb-4">
                    Questão {currentQuestion + 1}
                  </Badge>
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                    {quiz[currentQuestion].question}
                  </h2>
                </div>

                <div className="space-y-3">
                  {quiz[currentQuestion].options.map((option, idx) => {
                    const isSelected = answers[currentQuestion] === idx;
                    const letters = ['A', 'B', 'C', 'D'];
                    
                    return (
                      <motion.button
                        key={idx}
                        onClick={() => handleAnswer(idx)}
                        disabled={answers[currentQuestion] !== undefined}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full p-4 rounded-xl border-2 transition text-left ${
                          isSelected
                            ? 'border-purple-500 bg-purple-500/20'
                            : 'border-slate-600 bg-slate-700/50 hover:border-purple-400'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            isSelected ? 'bg-purple-500 text-white' : 'bg-slate-600 text-slate-300'
                          }`}>
                            {letters[idx]}
                          </div>
                          <span className="text-sm md:text-base text-white">{option}</span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          )}

          {showResult && quiz && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {(() => {
                const correctCount = answers.reduce((count, answer, idx) => {
                  return answer === quiz[idx].correct_answer ? count + 1 : count;
                }, 0);
                const score = Math.round((correctCount / quiz.length) * 100);
                const passed = correctCount >= 8;

                return (
                  <div className="space-y-6">
                    <Card className={`bg-gradient-to-br p-6 md:p-8 text-center ${
                      passed 
                        ? 'from-green-900/50 to-emerald-900/50 border-green-500/50'
                        : 'from-orange-900/50 to-red-900/50 border-orange-500/50'
                    }`}>
                      <motion.div
                        animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={`w-20 h-20 md:w-24 md:h-24 rounded-full mx-auto mb-4 flex items-center justify-center ${
                          passed ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-orange-500 to-red-600'
                        }`}
                      >
                        {passed ? <Trophy className="w-12 h-12 text-white" /> : <Star className="w-12 h-12 text-white" />}
                      </motion.div>

                      <h2 className="text-3xl md:text-4xl font-bold mb-2">
                        {score}%
                      </h2>
                      <p className="text-lg text-white mb-4">
                        {correctCount} de {quiz.length} corretas
                      </p>

                      {passed && (
                        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-4 space-y-2">
                          <p className="text-green-300 font-bold text-center">
                            🎉 Parabéns! Você ganhou:
                          </p>
                          <div className="flex items-center justify-center gap-4">
                            <div className="flex items-center gap-2 bg-green-600/30 px-4 py-2 rounded-lg">
                              <Sparkles className="w-5 h-5 text-green-300" />
                              <span className="text-white font-bold">+0.5% XP</span>
                            </div>
                            <div className="flex items-center gap-2 bg-yellow-600/30 px-4 py-2 rounded-lg">
                              <Coins className="w-5 h-5 text-yellow-400" />
                              <span className="text-white font-bold">+5 Ouros</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <p className="text-slate-300 mb-4">
                        {passed 
                          ? 'Excelente domínio do tema! Continue assim! ✨'
                          : 'Continue estudando! Acerte 8/10 para ganhar recompensas 💪'}
                      </p>

                      <Button
                        onClick={() => navigate(createPageUrl('Explorar'))}
                        variant="outline"
                        className="border-purple-500 text-purple-300 hover:bg-purple-500/20 mb-2"
                        size="sm"
                      >
                        <Trophy className="w-4 h-4 mr-2" />
                        Ver Ranking Completo
                      </Button>
                    </Card>

                    {/* Respostas */}
                    <div className="space-y-3">
                      {quiz.map((q, idx) => {
                        const userAnswer = answers[idx];
                        const isCorrect = userAnswer === q.correct_answer;
                        
                        return (
                          <Card key={idx} className={`p-4 ${
                            isCorrect 
                              ? 'bg-green-900/20 border-green-500/30' 
                              : 'bg-red-900/20 border-red-500/30'
                          }`}>
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0">
                                {isCorrect ? (
                                  <CheckCircle className="w-6 h-6 text-green-400" />
                                ) : (
                                  <XCircle className="w-6 h-6 text-red-400" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-white mb-2">{q.question}</p>
                                <p className="text-sm text-slate-300 mb-2">
                                  Sua resposta: <span className={isCorrect ? 'text-green-400' : 'text-red-400'}>
                                    {q.options[userAnswer] || 'Não respondeu'}
                                  </span>
                                </p>
                                {!isCorrect && (
                                  <p className="text-sm text-green-400 mb-2">
                                    Correta: {q.options[q.correct_answer]}
                                  </p>
                                )}
                                <p className="text-xs text-slate-400 bg-slate-800/50 p-2 rounded">
                                  💡 {q.explanation}
                                </p>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>

                    <Button
                      onClick={resetQuiz}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-6 text-lg"
                      size="lg"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Fazer Outro Quiz
                    </Button>
                  </div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}