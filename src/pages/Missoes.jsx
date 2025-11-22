import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Trophy, 
  Flame, 
  Star,
  Clock,
  Calendar,
  Infinity,
  CheckCircle,
  Gift,
  TrendingUp,
  Zap,
  Award
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, differenceInHours } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "react-hot-toast";

const difficultyConfig = {
  easy: { label: "Fácil", color: "text-green-400", bg: "bg-green-500/20" },
  medium: { label: "Médio", color: "text-yellow-400", bg: "bg-yellow-500/20" },
  hard: { label: "Difícil", color: "text-orange-400", bg: "bg-orange-500/20" },
  legendary: { label: "Lendário", color: "text-purple-400", bg: "bg-purple-500/20" }
};

const categoryIcons = {
  social: "👥",
  exploration: "🧭",
  mystical: "🔮",
  community: "💬",
  learning: "📚"
};

export default function MissoesPage() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("daily");
  const queryClient = useQueryClient();

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

  // Buscar missões
  const { data: quests } = useQuery({
    queryKey: ['quests', activeTab],
    queryFn: () => base44.entities.Quest.filter(
      { type: activeTab, is_active: true },
      "order",
      50
    ),
    enabled: !!user,
    initialData: [],
  });

  // Buscar progresso do usuário
  const { data: progress } = useQuery({
    queryKey: ['questProgress', user?.id],
    queryFn: () => base44.entities.QuestProgress.filter(
      { user_id: user.id },
      "-updated_date",
      100
    ),
    enabled: !!user,
    initialData: [],
  });

  // Coletar recompensa
  const claimRewardMutation = useMutation({
    mutationFn: async ({ progressId, quest }) => {
      // Atualizar progresso
      await base44.entities.QuestProgress.update(progressId, {
        reward_claimed: true,
        claimed_at: new Date().toISOString()
      });

      // Dar recompensas ao usuário
      const updates = {
        xp: (user.xp || 0) + quest.xp_reward,
        ouros: (user.ouros || 0) + (quest.ouros_reward || 0)
      };

      await base44.auth.updateMe(updates);

      // Se tiver badge de recompensa
      if (quest.badge_reward) {
        const badge = await base44.entities.Badge.filter({ id: quest.badge_reward });
        if (badge.length > 0) {
          const badgeData = badge[0];
          await base44.entities.UserBadge.create({
            user_id: user.id,
            badge_id: badgeData.id,
            badge_name: badgeData.name,
            badge_icon: badgeData.icon,
            badge_rarity: badgeData.rarity,
            badge_color: badgeData.color
          });

          // Atualizar contador de desbloqueios
          await base44.entities.Badge.update(badgeData.id, {
            total_unlocked: (badgeData.total_unlocked || 0) + 1
          });
        }
      }

      return updates;
    },
    onSuccess: (updates) => {
      queryClient.invalidateQueries({ queryKey: ['questProgress'] });
      setUser({ ...user, ...updates });
      window.dispatchEvent(new CustomEvent('xpUpdated'));
      
      toast.success('Recompensa coletada! ✨', {
        icon: '🎁',
        style: {
          background: '#8b5cf6',
          color: '#fff',
        }
      });
    },
  });

  const handleClaimReward = (progressId, quest) => {
    claimRewardMutation.mutate({ progressId, quest });
  };

  // Calcular tempo restante para reset
  const getTimeUntilReset = (type) => {
    const now = new Date();
    if (type === 'daily') {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const hours = differenceInHours(tomorrow, now);
      return `${hours}h restantes`;
    } else if (type === 'weekly') {
      const nextMonday = new Date(now);
      const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
      nextMonday.setDate(nextMonday.getDate() + daysUntilMonday);
      nextMonday.setHours(0, 0, 0, 0);
      const hours = differenceInHours(nextMonday, now);
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return '';
  };

  // Estatísticas gerais
  const stats = {
    completed: progress.filter(p => p.is_completed).length,
    inProgress: progress.filter(p => !p.is_completed && p.current_count > 0).length,
    totalXP: progress.reduce((sum, p) => {
      if (p.reward_claimed) {
        const quest = quests.find(q => q.id === p.quest_id);
        return sum + (quest?.xp_reward || 0);
      }
      return sum;
    }, 0),
    streak: user?.daily_streak || 0
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Sparkles className="w-12 h-12 text-purple-500 animate-pulse" />
      </div>
    );
  }

  const tabs = [
    { id: 'daily', label: 'Diárias', icon: Clock, color: 'from-blue-600 to-cyan-600' },
    { id: 'weekly', label: 'Semanais', icon: Calendar, color: 'from-purple-600 to-pink-600' },
    { id: 'permanent', label: 'Permanentes', icon: Infinity, color: 'from-amber-600 to-orange-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f1e] via-[#1a1a2e] to-[#0f0f1e]">
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 mb-4 shadow-xl shadow-purple-500/50">
            <Trophy className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
            Missões Místicas
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            Complete desafios e ganhe recompensas épicas
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6"
        >
          <Card className="bg-[#1a1a2e] border-purple-900/20 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.completed}</p>
                <p className="text-xs text-gray-400">Completadas</p>
              </div>
            </div>
          </Card>

          <Card className="bg-[#1a1a2e] border-purple-900/20 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.inProgress}</p>
                <p className="text-xs text-gray-400">Em Progresso</p>
              </div>
            </div>
          </Card>

          <Card className="bg-[#1a1a2e] border-purple-900/20 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.totalXP}</p>
                <p className="text-xs text-gray-400">XP Total</p>
              </div>
            </div>
          </Card>

          <Card className="bg-[#1a1a2e] border-purple-900/20 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.streak}</p>
                <p className="text-xs text-gray-400">Sequência</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex gap-2 overflow-x-auto pb-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 md:px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                      : 'bg-[#1a1a2e] text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-sm md:text-base">{tab.label}</span>
                  {activeTab === tab.id && tab.id !== 'permanent' && (
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                      {getTimeUntilReset(tab.id)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Quests Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid md:grid-cols-2 gap-4"
          >
            {quests.length === 0 ? (
              <Card className="md:col-span-2 bg-[#1a1a2e] border-purple-900/20 p-12 text-center">
                <Trophy className="w-16 h-16 text-purple-500/50 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-purple-300 mb-2">
                  Nenhuma Missão Disponível
                </h3>
                <p className="text-gray-400">
                  Novas missões aparecerão em breve!
                </p>
              </Card>
            ) : (
              quests.map((quest, index) => {
                const questProgress = progress.find(p => p.quest_id === quest.id);
                const currentCount = questProgress?.current_count || 0;
                const isCompleted = questProgress?.is_completed || false;
                const rewardClaimed = questProgress?.reward_claimed || false;
                const progressPercent = Math.min((currentCount / quest.target_count) * 100, 100);
                const difficulty = difficultyConfig[quest.difficulty || 'easy'];

                return (
                  <motion.div
                    key={quest.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={`bg-[#1a1a2e] border-purple-900/20 p-5 relative overflow-hidden ${
                      isCompleted && !rewardClaimed ? 'ring-2 ring-green-500/50' : ''
                    }`}>
                      {/* Efeito de brilho se completada */}
                      {isCompleted && !rewardClaimed && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/10 to-transparent"
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}

                      <div className="relative z-10">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div 
                              className="text-3xl"
                              style={{ 
                                filter: isCompleted ? 'none' : 'grayscale(50%) opacity(0.7)'
                              }}
                            >
                              {quest.icon || categoryIcons[quest.category] || "⭐"}
                            </div>
                            <div>
                              <h3 className="font-bold text-white text-base">{quest.title}</h3>
                              <p className="text-xs text-gray-400 line-clamp-1">
                                {quest.description}
                              </p>
                            </div>
                          </div>
                          <Badge className={`${difficulty.bg} ${difficulty.color} text-[10px]`}>
                            {difficulty.label}
                          </Badge>
                        </div>

                        {/* Progress */}
                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">Progresso</span>
                            <span className="text-white font-semibold">
                              {currentCount}/{quest.target_count}
                            </span>
                          </div>
                          <Progress 
                            value={progressPercent} 
                            className="h-2"
                            style={{ 
                              '--progress-color': quest.color || '#8b5cf6' 
                            }}
                          />
                        </div>

                        {/* Rewards */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center gap-1 text-xs">
                            <Star className="w-4 h-4 text-purple-400" />
                            <span className="text-white font-semibold">+{quest.xp_reward} XP</span>
                          </div>
                          {quest.ouros_reward > 0 && (
                            <div className="flex items-center gap-1 text-xs">
                              <Award className="w-4 h-4 text-yellow-400" />
                              <span className="text-white font-semibold">+{quest.ouros_reward} Ouros</span>
                            </div>
                          )}
                        </div>

                        {/* Action Button */}
                        {isCompleted && !rewardClaimed && (
                          <Button
                            onClick={() => handleClaimReward(questProgress.id, quest)}
                            disabled={claimRewardMutation.isPending}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold"
                          >
                            <Gift className="w-4 h-4 mr-2" />
                            Coletar Recompensa
                          </Button>
                        )}

                        {rewardClaimed && (
                          <div className="flex items-center justify-center gap-2 text-green-400 text-sm font-semibold">
                            <CheckCircle className="w-4 h-4" />
                            <span>Recompensa Coletada!</span>
                          </div>
                        )}

                        {!isCompleted && (
                          <div className="text-center text-gray-400 text-sm">
                            Continue progredindo...
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}