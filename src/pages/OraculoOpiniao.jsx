import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, MessageSquare, TrendingUp, Eye, EyeOff, Send, Plus, Loader2, Sparkles } from "lucide-react";

export default function OraculoOpiniaoPage() {
  const [user, setUser] = useState(null);
  const [showNewQuestion, setShowNewQuestion] = useState(false);
  const [questionData, setQuestionData] = useState({
    question: "",
    context: "",
    category: "geral",
    is_anonymous: false
  });
  const [selectedOpinion, setSelectedOpinion] = useState(null);
  const [responseText, setResponseText] = useState("");
  const queryClient = useQueryClient();

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const currentUser = await base44.auth.me();
    setUser(currentUser);
  };

  const { data: opinions } = useQuery({
    queryKey: ['community-opinions'],
    queryFn: () => base44.entities.CommunityOpinion.filter({ status: 'open' }, "-created_date", 50),
    refetchInterval: 10000
  });

  const createOpinionMutation = useMutation({
    mutationFn: async (data) => {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      return await base44.entities.CommunityOpinion.create({
        ...data,
        author_id: user.id,
        author_name: data.is_anonymous ? 'Anônimo' : (user.display_name || user.full_name),
        responses: [],
        responses_count: 0,
        views_count: 0,
        status: 'open',
        expires_at: expiresAt.toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-opinions'] });
      setShowNewQuestion(false);
      setQuestionData({
        question: "",
        context: "",
        category: "geral",
        is_anonymous: false
      });
      alert('✅ Pergunta publicada!');
    }
  });

  const respondOpinionMutation = useMutation({
    mutationFn: async ({ opinionId, response }) => {
      const opinion = opinions.find(o => o.id === opinionId);
      if (!opinion) return;

      const newResponse = {
        user_id: user.id,
        user_name: user.display_name || user.full_name,
        user_avatar: user.avatar_url,
        response: response,
        likes: 0,
        created_at: new Date().toISOString()
      };

      const updatedResponses = [...(opinion.responses || []), newResponse];

      await base44.entities.CommunityOpinion.update(opinionId, {
        responses: updatedResponses,
        responses_count: updatedResponses.length
      });

      // Dar XP ao respondente
      const xpGain = Math.floor((user.xp || 0) * 0.005); // 0.5% de XP
      await base44.auth.updateMe({
        xp: (user.xp || 0) + xpGain
      });

      // Criar notificação para autor
      if (opinion.author_id !== user.id) {
        await base44.entities.Notification.create({
          user_id: opinion.author_id,
          type: 'comment',
          title: '💡 Nova Opinião',
          message: `${user.display_name || user.full_name} respondeu sua pergunta`,
          from_user_id: user.id,
          from_user_name: user.display_name || user.full_name,
          from_user_avatar: user.avatar_url
        });
      }

      return xpGain;
    },
    onSuccess: (xpGain) => {
      queryClient.invalidateQueries({ queryKey: ['community-opinions'] });
      setSelectedOpinion(null);
      setResponseText("");
      loadUser();
      
      // Popup de XP
      const popup = document.createElement('div');
      popup.className = 'fixed top-20 left-1/2 -translate-x-1/2 z-[200] bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-full shadow-2xl font-bold';
      popup.textContent = `+${xpGain} XP! 🌟`;
      document.body.appendChild(popup);
      setTimeout(() => popup.remove(), 3000);

      alert('✅ Resposta enviada! +0.5% XP');
    }
  });

  const handleCreateQuestion = () => {
    if (!questionData.question) {
      alert('Digite sua pergunta');
      return;
    }
    createOpinionMutation.mutate(questionData);
  };

  const handleRespond = () => {
    if (!responseText.trim()) {
      alert('Digite sua resposta');
      return;
    }
    respondOpinionMutation.mutate({
      opinionId: selectedOpinion.id,
      response: responseText
    });
  };

  const categories = {
    amor: { emoji: '❤️', color: 'from-pink-500 to-red-500' },
    trabalho: { emoji: '💼', color: 'from-blue-500 to-cyan-500' },
    espiritualidade: { emoji: '🔮', color: 'from-purple-500 to-indigo-500' },
    saude: { emoji: '🍃', color: 'from-green-500 to-emerald-500' },
    familia: { emoji: '👨‍👩‍👧', color: 'from-orange-500 to-amber-500' },
    decisao: { emoji: '⚖️', color: 'from-yellow-500 to-orange-500' },
    geral: { emoji: '💭', color: 'from-slate-500 to-slate-600' }
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
              rotate: [0, 5, -5, 0],
              y: [0, -5, 0]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-4 shadow-2xl"
          >
            <Lightbulb className="w-10 h-10 md:w-12 md:h-12 text-white" />
          </motion.div>
          <h1 className="text-2xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            Oráculo da Opinião
          </h1>
          <p className="text-slate-300 text-sm md:text-base">Câmara dos Sussurros - pergunte à comunidade</p>
        </motion.div>

        {/* Info */}
        <Card className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-500/30 p-3 md:p-4 mb-6">
          <p className="text-sm text-green-300">
            ✨ Cada resposta dada ganha <strong>0.5% de XP</strong> instantaneamente!
          </p>
        </Card>

        {/* Nova Pergunta */}
        <Card className="bg-slate-800/50 border-amber-500/30 p-4 md:p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg md:text-xl font-bold text-amber-300">💭 Fazer Pergunta</h3>
            <Button
              onClick={() => setShowNewQuestion(!showNewQuestion)}
              variant="outline"
              size="sm"
              className="border-amber-500"
            >
              {showNewQuestion ? 'Cancelar' : <Plus className="w-4 h-4" />}
            </Button>
          </div>

          <AnimatePresence>
            {showNewQuestion && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <Textarea
                  value={questionData.question}
                  onChange={(e) => setQuestionData({...questionData, question: e.target.value})}
                  placeholder="Qual é sua dúvida ou questão?"
                  className="bg-slate-700/50 border-slate-600 text-white h-24"
                />

                <Textarea
                  value={questionData.context}
                  onChange={(e) => setQuestionData({...questionData, context: e.target.value})}
                  placeholder="Contexto adicional (opcional)..."
                  className="bg-slate-700/50 border-slate-600 text-white h-20"
                />

                <select
                  value={questionData.category}
                  onChange={(e) => setQuestionData({...questionData, category: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                >
                  <option value="geral">💭 Geral</option>
                  <option value="amor">❤️ Amor</option>
                  <option value="trabalho">💼 Trabalho</option>
                  <option value="espiritualidade">🔮 Espiritualidade</option>
                  <option value="saude">🍃 Saúde</option>
                  <option value="familia">👨‍👩‍👧 Família</option>
                  <option value="decisao">⚖️ Decisão</option>
                </select>

                <label className="flex items-center gap-2 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={questionData.is_anonymous}
                    onChange={(e) => setQuestionData({...questionData, is_anonymous: e.target.checked})}
                    className="rounded"
                  />
                  <span>Perguntar anonimamente</span>
                  {questionData.is_anonymous ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </label>

                <Button
                  onClick={handleCreateQuestion}
                  disabled={createOpinionMutation.isPending}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Publicar Pergunta
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Muro das Opiniões */}
        <h2 className="text-xl md:text-2xl font-bold text-amber-300 mb-4 flex items-center gap-2">
          <Sparkles className="w-6 h-6" />
          Muro das Opiniões
        </h2>

        <div className="space-y-4">
          {opinions && opinions.length > 0 ? (
            opinions.map((opinion, idx) => {
              const categoryConfig = categories[opinion.category] || categories.geral;
              
              return (
                <motion.div
                  key={opinion.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className={`bg-slate-800/50 border-l-4 p-4 md:p-6 bg-gradient-to-r ${categoryConfig.color} border-opacity-50`}>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-2xl flex-shrink-0">
                        {categoryConfig.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <p className="font-bold text-white">
                            {opinion.is_anonymous ? '🎭 Anônimo' : opinion.author_name}
                          </p>
                          <Badge variant="outline" className="text-xs capitalize">
                            {opinion.category}
                          </Badge>
                        </div>
                        <h3 className="text-lg font-bold text-amber-300 mb-2">{opinion.question}</h3>
                        {opinion.context && (
                          <p className="text-sm text-slate-300 mb-3">{opinion.context}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <span>{opinion.responses_count || 0} respostas</span>
                          <span>{opinion.views_count || 0} visualizações</span>
                        </div>
                      </div>
                    </div>

                    {/* Respostas */}
                    {opinion.responses && opinion.responses.length > 0 && (
                      <div className="mt-4 space-y-3">
                        {opinion.responses.map((resp, ridx) => (
                          <div key={ridx} className="p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-xs font-bold">
                                {resp.user_name?.[0]?.toUpperCase()}
                              </div>
                              <p className="font-semibold text-sm">{resp.user_name}</p>
                            </div>
                            <p className="text-sm text-slate-200">{resp.response}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Botão Responder */}
                    {selectedOpinion?.id === opinion.id ? (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 space-y-3"
                      >
                        <Textarea
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          placeholder="Digite sua opinião..."
                          className="bg-slate-700/50 border-slate-600 text-white h-24"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={handleRespond}
                            disabled={respondOpinionMutation.isPending}
                            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Enviar (+0.5% XP)
                          </Button>
                          <Button
                            onClick={() => setSelectedOpinion(null)}
                            variant="outline"
                            className="border-slate-600"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </motion.div>
                    ) : (
                      <Button
                        onClick={() => setSelectedOpinion(opinion)}
                        variant="outline"
                        className="w-full mt-4 border-amber-500 text-amber-400 hover:bg-amber-500/20"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Dar Minha Opinião
                      </Button>
                    )}
                  </Card>
                </motion.div>
              );
            })
          ) : (
            <Card className="bg-slate-800/50 border-slate-600 p-12 text-center">
              <Lightbulb className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">Nenhuma pergunta no momento</p>
              <p className="text-sm text-slate-500 mt-2">Seja o primeiro a perguntar!</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}