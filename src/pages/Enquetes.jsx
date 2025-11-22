import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, Sparkles, CheckCircle, Flame, TrendingUp, Plus, Clock, Calendar
} from "lucide-react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { differenceInSeconds } from "date-fns";
import CreatePollModal from "../components/explore/CreatePollModal";
import NotificationToast from "../components/NotificationToast";

const archetypeColors = {
  bruxa_natural: "#9333EA",
  sabio: "#F59E0B",
  guardiao_astral: "#3B82F6",
  xama: "#10B981",
  navegador_cosmico: "#8B5CF6",
  alquimista: "#6366F1",
  none: "#64748B"
};

const PollTimer = ({ expiresAt }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const expires = new Date(expiresAt);
      const diff = differenceInSeconds(expires, now);

      if (diff <= 0) {
        setTimeLeft("Expirada");
        return;
      }

      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <span className="flex items-center gap-1 text-xs text-purple-300 font-mono">
      <Clock className="w-3 h-3" />
      {timeLeft}
    </span>
  );
};

export default function EnquetesPage() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [showPollModal, setShowPollModal] = useState(false);
  const [xpNotification, setXpNotification] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    }
  };

  const { data: allPolls } = useQuery({
    queryKey: ['all-polls'],
    queryFn: () => base44.entities.Poll.list("-created_date", 100),
    initialData: [],
  });

  const createPollMutation = useMutation({
    mutationFn: async (pollData) => {
      return await base44.entities.Poll.create({
        ...pollData,
        author_id: user.id,
        author_name: user.display_name || user.full_name,
        author_avatar: user.avatar_url,
        author_username: user.username || user.id,
        votes_by_user: {},
        total_votes: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-polls'] });
      setShowPollModal(false);
    },
  });

  const voteMutation = useMutation({
    mutationFn: async ({ pollId, optionId }) => {
      const poll = allPolls.find(p => p.id === pollId);
      if (!poll) return;

      const hasVoted = poll.votes_by_user?.[user.id];
      if (hasVoted) return;

      const newOptions = poll.options.map(opt => 
        opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
      );

      const newVotesByUser = { ...poll.votes_by_user, [user.id]: optionId };

      await base44.entities.Poll.update(pollId, {
        options: newOptions,
        votes_by_user: newVotesByUser,
        total_votes: poll.total_votes + 1
      });

      const xpGain = Math.floor((user.xp || 0) * 0.03);
      const newXP = (user.xp || 0) + xpGain;
      
      await base44.auth.updateMe({ xp: newXP });
      setUser({ ...user, xp: newXP });

      setXpNotification({
        id: Date.now(),
        type: 'level_up',
        title: `+${xpGain} XP Ganhos! 🌟`,
        message: `Você ganhou ${xpGain} XP (3%) por participar da enquete!`,
        from_user_avatar: user.avatar_url,
      });

      window.dispatchEvent(new Event('xpUpdated'));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-polls'] });
    },
  });

  const activePolls = allPolls.filter(poll => {
    const expires = new Date(poll.expires_at);
    return expires > new Date() && poll.is_active;
  });

  const expiredPolls = allPolls.filter(poll => {
    const expires = new Date(poll.expires_at);
    return expires <= new Date() || !poll.is_active;
  });

  const topPolls = [...allPolls]
    .sort((a, b) => (b.total_votes || 0) - (a.total_votes || 0))
    .slice(0, 10);

  const handleVote = (pollId, optionId) => {
    voteMutation.mutate({ pollId, optionId });
  };

  const handleCreatePoll = (pollData) => {
    createPollMutation.mutate(pollData);
  };

  const renderPoll = (poll, index) => {
    const userVoted = poll.votes_by_user?.[user?.id];
    const expiresAt = new Date(poll.expires_at);
    const isExpired = expiresAt < new Date();

    return (
      <motion.div
        key={poll.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-purple-900/30 p-6 backdrop-blur-sm">
          <div className="flex items-start gap-3 mb-4">
            <div 
              className="w-10 h-10 rounded-full border-2 overflow-hidden flex-shrink-0"
              style={{ borderColor: archetypeColors[poll.author_archetype || 'none'] }}
            >
              {poll.author_avatar ? (
                <img src={poll.author_avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-white mb-1">{poll.author_name}</h4>
              <div className="flex items-center gap-2 text-xs text-gray-400 flex-wrap">
                <span className="px-2 py-0.5 bg-purple-900/30 rounded-full">{poll.category}</span>
                <span>•</span>
                <span>{poll.total_votes} votos</span>
                {!isExpired && (
                  <>
                    <span>•</span>
                    <PollTimer expiresAt={poll.expires_at} />
                  </>
                )}
              </div>
            </div>
          </div>

          <h3 className="text-lg font-bold text-white mb-4">{poll.question}</h3>

          <div className="space-y-2">
            {poll.options.map((option) => {
              const percentage = poll.total_votes > 0 
                ? Math.round((option.votes / poll.total_votes) * 100)
                : 0;
              const isSelected = userVoted === option.id;

              return (
                <button
                  key={option.id}
                  onClick={() => !userVoted && !isExpired && handleVote(poll.id, option.id)}
                  disabled={!!userVoted || isExpired}
                  className={`w-full p-3 rounded-lg border transition relative overflow-hidden ${
                    isSelected
                      ? 'border-purple-500 bg-purple-900/30'
                      : userVoted
                      ? 'border-slate-700 bg-slate-800/50'
                      : 'border-purple-900/30 bg-slate-800/30 hover:border-purple-700/50 hover:bg-slate-800/50'
                  } ${(!userVoted && !isExpired) ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  {userVoted && (
                    <motion.div 
                      className="absolute inset-0 bg-purple-600/20"
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  )}
                  
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isSelected && <CheckCircle className="w-4 h-4 text-purple-400" />}
                      <span className="text-white font-medium">{option.text}</span>
                    </div>
                    {userVoted && (
                      <span className="text-purple-300 font-bold">{percentage}%</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {!userVoted && !isExpired && (
            <p className="text-xs text-green-400 mt-4 text-center flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3" />
              Vote e ganhe 3% de XP Espiritual!
            </p>
          )}

          {isExpired && (
            <p className="text-xs text-gray-400 mt-4 text-center">
              Esta enquete expirou
            </p>
          )}
        </Card>
      </motion.div>
    );
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a2e] to-[#0a0a1a]">
        <Sparkles className="w-12 h-12 text-purple-500 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a2e] to-[#0a0a1a]">
      <div className="max-w-7xl mx-auto px-4 py-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                📊 Todas as Enquetes
              </h1>
              <p className="text-gray-400">
                Participe e compartilhe sua opinião com a comunidade
              </p>
            </div>
            <Button
              onClick={() => setShowPollModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Criar Enquete
            </Button>
          </div>
        </motion.div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 mb-6">
            <TabsTrigger value="active" className="text-xs md:text-sm">
              <Calendar className="w-4 h-4 mr-2" />
              Ativas ({activePolls.length})
            </TabsTrigger>
            <TabsTrigger value="top" className="text-xs md:text-sm">
              <Flame className="w-4 h-4 mr-2" />
              Top ({topPolls.length})
            </TabsTrigger>
            <TabsTrigger value="finalized" className="text-xs md:text-sm">
              <TrendingUp className="w-4 h-4 mr-2" />
              Finalizadas ({expiredPolls.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activePolls.length === 0 ? (
              <Card className="bg-slate-900/50 border-purple-900/30 p-12 text-center">
                <BarChart3 className="w-16 h-16 text-purple-500/50 mx-auto mb-4" />
                <p className="text-gray-400">Nenhuma enquete ativa no momento</p>
              </Card>
            ) : (
              activePolls.map((poll, index) => renderPoll(poll, index))
            )}
          </TabsContent>

          <TabsContent value="top" className="space-y-4">
            {topPolls.length === 0 ? (
              <Card className="bg-slate-900/50 border-purple-900/30 p-12 text-center">
                <Flame className="w-16 h-16 text-orange-500/50 mx-auto mb-4" />
                <p className="text-gray-400">Nenhuma enquete encontrada</p>
              </Card>
            ) : (
              topPolls.map((poll, index) => renderPoll(poll, index))
            )}
          </TabsContent>

          <TabsContent value="finalized" className="space-y-4">
            {expiredPolls.length === 0 ? (
              <Card className="bg-slate-900/50 border-purple-900/30 p-12 text-center">
                <TrendingUp className="w-16 h-16 text-purple-500/50 mx-auto mb-4" />
                <p className="text-gray-400">Nenhuma enquete finalizada ainda</p>
              </Card>
            ) : (
              expiredPolls.map((poll, index) => renderPoll(poll, index))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {showPollModal && (
        <CreatePollModal
          user={user}
          onClose={() => setShowPollModal(false)}
          onSubmit={handleCreatePoll}
          isLoading={createPollMutation.isPending}
        />
      )}

      {xpNotification && (
        <div className="fixed bottom-[70px] right-2 md:bottom-6 md:right-6 z-[100]">
          <NotificationToast
            notification={xpNotification}
            onClose={() => setXpNotification(null)}
          />
        </div>
      )}
    </div>
  );
}