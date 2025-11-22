import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Swords, Vote, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import CreateDuelModal from "../components/arena/CreateDuelModal";
import UserAvatar from "../components/UserAvatar";

export default function ArenaPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [votedDuels, setVotedDuels] = useState([]);

  useEffect(() => {
    loadUser();
    loadVotedDuels();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    }
  };

  const loadVotedDuels = () => {
    const voted = JSON.parse(localStorage.getItem('voted_duels') || '[]');
    setVotedDuels(voted);
  };

  const { data: duels, isLoading } = useQuery({
    queryKey: ['duels'],
    queryFn: () => base44.entities.Duel.filter({ status: 'active' }, "-created_date", 50),
    initialData: [],
  });

  const createDuelMutation = useMutation({
    mutationFn: async (duelData) => {
      return await base44.entities.Duel.create({
        ...duelData,
        challenger_id: user.id,
        challenger_name: user.display_name || user.full_name,
        challenger_avatar: user.avatar_url,
        challenger_level: user.level || 1,
        challenger_archetype: user.archetype || 'none',
        status: 'active',
        total_votes: 0,
        challenger_votes: 0,
        opponent_votes: 0,
        voters: []
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['duels'] });
      setShowCreateModal(false);
    },
  });

  const handleCreateDuel = (duelData) => {
    createDuelMutation.mutate(duelData);
  };

  const handleClose = () => {
    navigate(createPageUrl("Hub"));
  };

  const hasVoted = (duelId) => {
    return votedDuels.includes(duelId);
  };

  if (!user) {
    return (
      <div className="fixed inset-0 bg-[#0a0a1a] flex items-center justify-center z-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Swords className="w-12 h-12 text-yellow-400" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#131128] to-[#0a0a1a] z-50 overflow-y-auto">
      {/* Botão Fechar */}
      <button
        onClick={handleClose}
        className="fixed top-4 right-4 z-50 w-12 h-12 rounded-full bg-slate-800/50 hover:bg-slate-700/50 flex items-center justify-center transition"
      >
        <X className="w-6 h-6 text-gray-400" />
      </button>

      <div className="max-w-4xl mx-auto px-4 py-12 pb-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Arena dos Oráculos
          </h1>
          <p className="text-gray-400 text-lg md:text-xl mb-8">
            Onde a sabedoria é a arma e o conhecimento é a armadura.
          </p>

          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-6 text-lg rounded-2xl shadow-lg shadow-yellow-500/30"
          >
            <Swords className="w-6 h-6 mr-2" />
            Lançar um Desafio
          </Button>
        </motion.div>

        {/* Duelos Abertos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12"
        >
          <h2 className="text-3xl font-bold text-white mb-6">Duelos Abertos</h2>

          {isLoading ? (
            <div className="text-center py-12">
              <Swords className="w-12 h-12 text-yellow-400 animate-pulse mx-auto mb-4" />
              <p className="text-gray-400">Carregando batalhas...</p>
            </div>
          ) : duels.length === 0 ? (
            <Card className="bg-[#131128] border-purple-400/20 p-12 text-center">
              <Swords className="w-16 h-16 text-yellow-400/50 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-yellow-300 mb-2">
                Nenhum duelo ativo
              </h3>
              <p className="text-gray-400 mb-6">
                Seja o primeiro a lançar um desafio na arena!
              </p>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
              >
                Lançar Desafio
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              {duels.map((duel) => {
                const voted = hasVoted(duel.id);
                
                return (
                  <motion.div
                    key={duel.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card
                      className="bg-[#131128] border-purple-400/20 p-6 cursor-pointer hover:border-purple-400/40 transition"
                      onClick={() => navigate(createPageUrl(`ArenaDuel?id=${duel.id}`))}
                    >
                      {/* Header do Card */}
                      <div className="flex items-center justify-between mb-4">
                        <Badge className="bg-purple-900/50 text-purple-300 border-purple-400/30">
                          {duel.category}
                        </Badge>
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <Vote className="w-4 h-4" />
                          <span>{duel.total_votes} votos</span>
                        </div>
                      </div>

                      {/* Duelistas */}
                      <div className="flex items-center justify-center gap-6 mb-4">
                        <div className="text-center">
                          <UserAvatar
                            user={{
                              avatar_url: duel.challenger_avatar,
                              archetype: duel.challenger_archetype,
                            }}
                            size="lg"
                            showStatus={false}
                          />
                          <p className="text-white font-semibold mt-2 text-sm">
                            {duel.challenger_name}
                          </p>
                        </div>

                        <Swords className="w-8 h-8 text-gray-600" />

                        <div className="text-center">
                          <UserAvatar
                            user={{
                              avatar_url: duel.opponent_avatar,
                              archetype: duel.opponent_archetype,
                            }}
                            size="lg"
                            showStatus={false}
                          />
                          <p className="text-white font-semibold mt-2 text-sm">
                            {duel.opponent_name}
                          </p>
                        </div>
                      </div>

                      {/* Questão */}
                      <p className="text-gray-300 text-center mb-4 line-clamp-2 italic">
                        "{duel.question}"
                      </p>

                      {/* Botão */}
                      {voted ? (
                        <Button
                          disabled
                          className="w-full bg-gray-700 text-gray-400 cursor-not-allowed"
                        >
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Voto Registrado
                        </Button>
                      ) : (
                        <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                          Assistir e Votar
                        </Button>
                      )}
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Modal de Criar Duelo */}
      {showCreateModal && (
        <CreateDuelModal
          user={user}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateDuel}
          isLoading={createDuelMutation.isPending}
        />
      )}
    </div>
  );
}