import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { CloudMoon, Sparkles, Loader2, Brain, Coins, Eye, Trash2 } from "lucide-react";

export default function DiarioSonhosPage() {
  const [user, setUser] = useState(null);
  const [showNewDream, setShowNewDream] = useState(false);
  const [dreamData, setDreamData] = useState({
    title: "",
    content: "",
    date: new Date().toISOString().split('T')[0],
    mood: "neutro",
    recurring: false
  });
  const [interpretingDream, setInterpretingDream] = useState(null);
  const [isInterpreting, setIsInterpreting] = useState(false);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const currentUser = await base44.auth.me();
    setUser(currentUser);
  };

  const { data: dreams } = useQuery({
    queryKey: ['dreams', user?.id],
    queryFn: () => base44.entities.DirectMessage.filter({ 
      user_id: user?.id,
      message_type: 'dream' // usando DirectMessage temporariamente
    }),
    enabled: !!user
  });

  const { data: interpretations } = useQuery({
    queryKey: ['dream-interpretations', user?.id],
    queryFn: () => base44.entities.DreamInterpretation.filter({ user_id: user?.id }),
    enabled: !!user
  });

  const saveDreamMutation = useMutation({
    mutationFn: async (data) => {
      // Salvar sonho (adaptar conforme entidade real)
      return await base44.entities.DirectMessage.create({
        ...data,
        user_id: user.id,
        message_type: 'dream'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dreams'] });
      setShowNewDream(false);
      setDreamData({
        title: "",
        content: "",
        date: new Date().toISOString().split('T')[0],
        mood: "neutro",
        recurring: false
      });
      alert('✅ Sonho salvo!');
    }
  });

  const interpretDreamMutation = useMutation({
    mutationFn: async ({ dreamId, content, title }) => {
      // Verificar ouros
      if ((user.ouros || 0) < 10) {
        throw new Error('Você precisa de 10 ouros para interpretar um sonho');
      }

      setIsInterpreting(true);

      // Debitar ouros
      await base44.auth.updateMe({
        ouros: (user.ouros || 0) - 10
      });

      // Gerar interpretação com IA
      const prompt = `Você é um especialista em interpretação de sonhos e simbolismo. Analise o seguinte sonho em detalhes:

Título: ${title}
Conteúdo: ${content}

Forneça uma interpretação completa incluindo:
1. Símbolos principais e seus significados
2. Tema emocional do sonho
3. Possíveis mensagens do subconsciente
4. Orientações práticas baseadas no sonho
5. Aspectos que podem estar sendo processados

Use linguagem acolhedora e inspiradora. Seja detalhado nos simbolismos.`;

      const interpretation = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false
      });

      // Salvar interpretação
      return await base44.entities.DreamInterpretation.create({
        user_id: user.id,
        dream_id: dreamId,
        dream_title: title,
        dream_content: content,
        interpretation: interpretation,
        ouros_paid: 10
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dream-interpretations'] });
      loadUser(); // Recarregar saldo
      setIsInterpreting(false);
      alert('✅ Interpretação gerada!');
    },
    onError: (error) => {
      setIsInterpreting(false);
      alert('Erro: ' + error.message);
    }
  });

  const handleSaveDream = () => {
    if (!dreamData.title || !dreamData.content) {
      alert('Preencha título e conteúdo');
      return;
    }
    saveDreamMutation.mutate(dreamData);
  };

  const handleInterpret = (dream) => {
    if (confirm('Interpretar este sonho custará 10 ouros. Deseja continuar?')) {
      interpretDreamMutation.mutate({
        dreamId: dream.id,
        content: dream.content,
        title: dream.title || 'Sonho sem título'
      });
    }
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
              rotate: [0, 10, -10, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-2xl"
          >
            <CloudMoon className="w-10 h-10 md:w-12 md:h-12 text-white" />
          </motion.div>
          <h1 className="text-2xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Diário dos Sonhos
          </h1>
          <p className="text-slate-300 text-sm md:text-base">Registre e interprete seus sonhos</p>
        </motion.div>

        {/* Saldo de Ouros */}
        <Card className="bg-gradient-to-r from-yellow-900/30 to-amber-900/30 border-yellow-500/30 p-3 mb-6 text-center">
          <p className="text-sm text-yellow-300">
            <Coins className="w-4 h-4 inline mr-2" />
            Seu saldo: <strong>{user.ouros || 0} ouros</strong> • Interpretação: 10 ouros
          </p>
        </Card>

        {/* Novo Sonho */}
        <Card className="bg-slate-800/50 border-indigo-500/30 p-4 md:p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg md:text-xl font-bold text-indigo-300">📝 Registrar Novo Sonho</h3>
            <Button
              onClick={() => setShowNewDream(!showNewDream)}
              variant="outline"
              size="sm"
              className="border-indigo-500"
            >
              {showNewDream ? 'Cancelar' : 'Novo'}
            </Button>
          </div>

          <AnimatePresence>
            {showNewDream && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <Input
                  value={dreamData.title}
                  onChange={(e) => setDreamData({...dreamData, title: e.target.value})}
                  placeholder="Título do sonho..."
                  className="bg-slate-700/50 border-slate-600 text-white"
                />

                <Textarea
                  value={dreamData.content}
                  onChange={(e) => setDreamData({...dreamData, content: e.target.value})}
                  placeholder="Descreva seu sonho em detalhes..."
                  className="bg-slate-700/50 border-slate-600 text-white h-32"
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-300 mb-2 block">Data</label>
                    <Input
                      type="date"
                      value={dreamData.date}
                      onChange={(e) => setDreamData({...dreamData, date: e.target.value})}
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-300 mb-2 block">Humor ao acordar</label>
                    <select
                      value={dreamData.mood}
                      onChange={(e) => setDreamData({...dreamData, mood: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                    >
                      <option value="feliz">😊 Feliz</option>
                      <option value="neutro">😐 Neutro</option>
                      <option value="confuso">😕 Confuso</option>
                      <option value="assustado">😰 Assustado</option>
                      <option value="triste">😢 Triste</option>
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={dreamData.recurring}
                    onChange={(e) => setDreamData({...dreamData, recurring: e.target.checked})}
                    className="rounded"
                  />
                  <span>Sonho recorrente</span>
                </label>

                <Button
                  onClick={handleSaveDream}
                  disabled={saveDreamMutation.isPending}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  <CloudMoon className="w-4 h-4 mr-2" />
                  Salvar Sonho
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Lista de Sonhos */}
        <div className="space-y-4">
          {dreams && dreams.length > 0 ? (
            dreams.map((dream, idx) => {
              const hasInterpretation = interpretations?.find(i => i.dream_id === dream.id);
              
              return (
                <motion.div
                  key={dream.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="bg-slate-800/50 border-purple-500/30 p-4 md:p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-purple-300 mb-2">
                          {dream.title || 'Sonho sem título'}
                        </h3>
                        <p className="text-sm text-slate-400 mb-3">
                          {new Date(dream.created_date).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-slate-200 text-sm whitespace-pre-wrap line-clamp-3">
                          {dream.content}
                        </p>
                      </div>
                    </div>

                    {hasInterpretation ? (
                      <div className="mt-4 p-4 bg-gradient-to-br from-purple-900/30 to-indigo-900/30 rounded-lg border border-purple-500/30">
                        <h4 className="font-bold text-purple-300 mb-2 flex items-center gap-2">
                          <Brain className="w-4 h-4" />
                          Interpretação
                        </h4>
                        <p className="text-sm text-slate-200 whitespace-pre-wrap">
                          {hasInterpretation.interpretation}
                        </p>
                        {hasInterpretation.symbols_found && hasInterpretation.symbols_found.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-purple-300 font-semibold mb-2">Símbolos encontrados:</p>
                            <div className="flex flex-wrap gap-2">
                              {hasInterpretation.symbols_found.map((symbol, i) => (
                                <Badge key={i} className="bg-purple-700/50 text-purple-200">
                                  {symbol.symbol}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleInterpret(dream)}
                        disabled={isInterpreting}
                        variant="outline"
                        className="w-full mt-4 border-indigo-500 text-indigo-400 hover:bg-indigo-500/20"
                      >
                        {isInterpreting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Interpretando...
                          </>
                        ) : (
                          <>
                            <Brain className="w-4 h-4 mr-2" />
                            Interpretar (10 ouros)
                          </>
                        )}
                      </Button>
                    )}
                  </Card>
                </motion.div>
              );
            })
          ) : (
            <Card className="bg-slate-800/50 border-slate-600 p-12 text-center">
              <CloudMoon className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">Nenhum sonho registrado ainda</p>
              <p className="text-sm text-slate-500 mt-2">Comece a documentar seus sonhos para análises profundas</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}