import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Swords, Crown, CheckCircle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import UserAvatar from "../components/UserAvatar";

const archetypeColors = {
  bruxa_natural: "#9333EA",
  sabio: "#F59E0B",
  guardiao_astral: "#3B82F6",
  xama: "#10B981",
  navegador_cosmico: "#8B5CF6",
  alquimista: "#6366F1",
  none: "#64748B"
};

export default function ArenaDuelPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedFor, setVotedFor] = useState(null);
  const [bgFlash, setBgFlash] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const duelId = urlParams.get('id');

  useEffect(() => {
    loadUser();
    checkIfVoted();
  }, [duelId]);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    }
  };

  const checkIfVoted = () => {
    const votedDuels = JSON.parse(localStorage.getItem('voted_duels') || '[]');
    if (votedDuels.includes(duelId)) {
      setHasVoted(true);
    }
  };

  const { data: duel, isLoading } = useQuery({
    queryKey: ['duel', duelId],
    queryFn: async () => {
      const duels = await base44.entities.Duel.filter({ id: duelId }, "created_date", 1);
      return duels[0];
    },
    enabled: !!duelId,
  });

  const voteMutation = useMutation({
    mutationFn: async (side) => {
      const newVotes = {
        challenger_votes: duel.challenger_votes + (side === 'challenger' ? 1 : 0),
        opponent_votes: duel.opponent_votes + (side === 'opponent' ? 1 : 0),
        total_votes: duel.total_votes + 1,
        voters: [...(duel.voters || []), user.id]
      };

      await base44.entities.Duel.update(duelId, newVotes);
      
      // Atualizar XP do usuário
      const xpGain = 10;
      await base44.auth.updateMe({
        xp: (user.xp || 0) + xpGain
      });

      return { side, xpGain };
    },
    onSuccess: ({ side, xpGain }) => {
      // Salvar voto no localStorage
      const votedDuels = JSON.parse(localStorage.getItem('voted_duels') || '[]');
      votedDuels.push(duelId);
      localStorage.setItem('voted_duels', JSON.stringify(votedDuels));

      setHasVoted(true);
      setVotedFor(side);
      
      // Flash de cor no background
      const color = side === 'challenger' 
        ? archetypeColors[duel.challenger_archetype] 
        : archetypeColors[duel.opponent_archetype];
      
      setBgFlash(true);
      setTimeout(() => setBgFlash(false), 500);

      toast.success(`Voto registrado! +${xpGain} XP`, {
        description: "Sua sabedoria foi contabilizada."
      });

      queryClient.invalidateQueries({ queryKey: ['duel', duelId] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const handleVote = (side) => {
    voteMutation.mutate(side);
  };

  const handleClose = () => {
    navigate(createPageUrl("Arena"));
  };

  if (!user || isLoading || !duel) {
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

  const totalVotes = duel.total_votes || 1;
  const challengerPercentage = Math.round((duel.challenger_votes / totalVotes) * 100);
  const opponentPercentage = Math.round((duel.opponent_votes / totalVotes) * 100);

  return (
    <div 
      className={`fixed inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#131128] to-[#0a0a1a] z-50 overflow-y-auto transition-all duration-500 ${
        bgFlash ? 'brightness-125' : ''
      }`}
    >
      {/* Botão Fechar */}
      <button
        onClick={handleClose}
        className="fixed top-4 right-4 z-50 w-12 h-12 rounded-full bg-slate-800/50 hover:bg-slate-700/50 flex items-center justify-center transition"
      >
        <X className="w-6 h-6 text-gray-400" />
      </button>

      <div className="max-w-4xl mx-auto px-4 py-12 pb-32">
        {/* Header com Duelistas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-8 mb-12"
        >
          {/* Challenger */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <div className="relative inline-block">
              {duel.challenger_level > duel.opponent_level && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute -top-2 -right-2 z-10"
                >
                  <Crown className="w-6 h-6 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
                </motion.div>
              )}
              <UserAvatar
                user={{
                  avatar_url: duel.challenger_avatar,
                  archetype: duel.challenger_archetype,
                }}
                size="xl"
                showStatus={false}
              />
            </div>
            <h3 className="text-xl font-bold text-white mt-4">
              {duel.challenger_name}
            </h3>
            <p className="text-gray-400 text-sm">Nível {duel.challenger_level}</p>
            <p className="text-purple-400 text-xs">
              {duel.challenger_archetype === 'sabio' ? 'Sábio - Oráculo' : 
               duel.challenger_archetype === 'guardiao_astral' ? 'Guardião Astral - Mago Branco' :
               'Místico'}
            </p>
          </motion.div>

          {/* Espadas */}
          <motion.div
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Swords className="w-12 h-12 text-gray-600" />
          </motion.div>

          {/* Opponent */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <div className="relative inline-block">
              {duel.opponent_level > duel.challenger_level && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute -top-2 -right-2 z-10"
                >
                  <Crown className="w-6 h-6 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
                </motion.div>
              )}
              <UserAvatar
                user={{
                  avatar_url: duel.opponent_avatar,
                  archetype: duel.opponent_archetype,
                }}
                size="xl"
                showStatus={false}
              />
            </div>
            <h3 className="text-xl font-bold text-white mt-4">
              {duel.opponent_name}
            </h3>
            <p className="text-gray-400 text-sm">Nível {duel.opponent_level}</p>
            <p className="text-blue-400 text-xs">
              {duel.opponent_archetype === 'guardiao_astral' ? 'Guardião Astral - Mago Branco' :
               duel.opponent_archetype === 'sabio' ? 'Sábio - Oráculo' :
               'Místico'}
            </p>
          </motion.div>
        </motion.div>

        {/* A Questão do Duelo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <Card className="bg-[#131128] border-purple-400/20 p-8 text-center">
            <p className="text-purple-300 text-sm mb-3 uppercase tracking-wide">
              A Questão do Duelo
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-yellow-300">
              "{duel.question}"
            </h2>
          </Card>
        </motion.div>

        {/* Argumentos */}
        <div className="space-y-6 mb-8">
          {/* Argumento Challenger */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-[#131128] border-purple-400/20 p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Argumento de {duel.challenger_name}
              </h3>
              <p className="text-gray-300 leading-relaxed mb-6">
                {duel.challenger_argument}
              </p>
              <Button
                onClick={() => handleVote('challenger')}
                disabled={hasVoted || voteMutation.isPending}
                className={`w-full ${
                  votedFor === 'challenger'
                    ? 'bg-green-600 hover:bg-green-700'
                    : hasVoted
                    ? 'bg-gray-700 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {votedFor === 'challenger' ? (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Votado!
                  </>
                ) : hasVoted ? (
                  'Votar neste argumento'
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Votar neste argumento
                  </>
                )}
              </Button>
            </Card>
          </motion.div>

          {/* Argumento Opponent */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-[#131128] border-purple-400/20 p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Argumento de {duel.opponent_name}
              </h3>
              <p className="text-gray-300 leading-relaxed mb-6">
                {duel.opponent_argument}
              </p>
              <Button
                onClick={() => handleVote('opponent')}
                disabled={hasVoted || voteMutation.isPending}
                className={`w-full ${
                  votedFor === 'opponent'
                    ? 'bg-green-600 hover:bg-green-700'
                    : hasVoted
                    ? 'bg-gray-700 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {votedFor === 'opponent' ? (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Votado!
                  </>
                ) : hasVoted ? (
                  'Votar neste argumento'
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Votar neste argumento
                  </>
                )}
              </Button>
            </Card>
          </motion.div>
        </div>

        {/* Barra de Progresso */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-8"
        >
          <h3 className="text-2xl font-bold text-white text-center mb-4">
            {hasVoted ? 'Sua Centelha de XP' : 'Barra de Convicção'}
          </h3>
          
          <div className="relative h-12 bg-slate-800 rounded-full overflow-hidden mb-4">
            <motion.div
              initial={{ width: `${challengerPercentage}%` }}
              animate={{ width: `${challengerPercentage}%` }}
              transition={{ duration: 1 }}
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-yellow-500 to-yellow-600"
            />
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-yellow-400 font-bold">
              {challengerPercentage}% {duel.challenger_name}
            </span>
            <span className="text-gray-400 font-bold">
              {opponentPercentage}% {duel.opponent_name}
            </span>
          </div>
        </motion.div>

        {/* Botão Voltar */}
        {hasVoted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Button
              onClick={handleClose}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white py-6 text-lg"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar para a Arena
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}