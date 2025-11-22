import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Sparkles, Loader2, Swords } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function MagicArenaPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const currentUser = await base44.auth.me();
    setUser(currentUser);
  };

  const { data: decks = [] } = useQuery({
    queryKey: ['my-decks', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return await base44.entities.MagicDeck.filter({ user_id: user.id });
    },
    enabled: !!user?.id
  });

  const { data: matches = [] } = useQuery({
    queryKey: ['magic-matches', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const p1 = await base44.entities.MagicMatch.filter({ player1_id: user.id });
      const p2 = await base44.entities.MagicMatch.filter({ player2_id: user.id });
      return [...p1, ...p2];
    },
    enabled: !!user?.id
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a0a1a] via-[#131128] to-[#0a0a1a]">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#131128] to-[#0a0a1a] p-4 md:p-6 pb-24">
      <div className="max-w-6xl mx-auto">
        <Button
          onClick={() => navigate(createPageUrl("ArenaHub"))}
          variant="ghost"
          className="mb-4 text-gray-300 hover:text-white"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Magic: O Grimório
          </h1>
          <p className="text-gray-400">
            Duela com cartas místicas em batalhas estratégicas
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Meus Decks */}
          <Card className="bg-slate-900/50 border-purple-500/30 p-6">
            <h2 className="text-2xl font-bold text-purple-300 mb-4 flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              Meus Grimórios
            </h2>
            {decks.length === 0 ? (
              <div className="text-center py-12">
                <Sparkles className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">Você ainda não possui grimórios</p>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Criar Primeiro Grimório
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {decks.map((deck) => (
                  <Card key={deck.id} className="bg-slate-800/50 border-purple-900/30 p-4">
                    <h3 className="text-white font-bold mb-1">{deck.name}</h3>
                    <p className="text-sm text-gray-400">{deck.cards?.length || 0} cartas</p>
                  </Card>
                ))}
              </div>
            )}
          </Card>

          {/* Partidas */}
          <Card className="bg-slate-900/50 border-purple-500/30 p-6">
            <h2 className="text-2xl font-bold text-purple-300 mb-4 flex items-center gap-2">
              <Swords className="w-6 h-6" />
              Partidas Ativas
            </h2>
            {matches.filter(m => m.status !== 'finished').length === 0 ? (
              <div className="text-center py-12">
                <Swords className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">Nenhuma partida ativa</p>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Buscar Oponente
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {matches.filter(m => m.status !== 'finished').map((match) => (
                  <Card key={match.id} className="bg-slate-800/50 border-purple-900/30 p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white font-bold text-sm">
                          {match.player1_id === user.id ? match.player2_name : match.player1_name}
                        </p>
                        <p className="text-xs text-gray-400">{match.status === 'in_progress' ? 'Em andamento' : 'Aguardando'}</p>
                      </div>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        Continuar
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Coming Soon - Interface do Jogo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8"
        >
          <Card className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border-indigo-500/30 p-8 text-center">
            <Sparkles className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">
              Sistema de Jogo em Desenvolvimento
            </h3>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Em breve você poderá criar decks, colecionar cartas místicas e duelar em partidas épicas de estratégia!
              O sistema completo de mana, criaturas, feitiços e combate está sendo preparado.
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}