import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Sparkles, 
  Crown,
  Flame,
  Calendar,
  Award,
  Star
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const archetypeColors = {
  bruxa_natural: "#9333EA",
  sabio: "#F59E0B",
  guardiao_astral: "#3B82F6",
  xama: "#10B981",
  navegador_cosmico: "#8B5CF6",
  alquimista: "#6366F1",
  none: "#64748B"
};

export default function ProgressoPage() {
  const [user, setUser] = useState(null);

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

  const { data: posts } = useQuery({
    queryKey: ['userPosts', user?.id],
    queryFn: () => base44.entities.Post.filter({ author_id: user.id }),
    enabled: !!user,
    initialData: [],
  });

  const { data: duels } = useQuery({
    queryKey: ['userDuels', user?.id],
    queryFn: async () => {
      const challenged = await base44.entities.Duel.filter({ challenger_id: user.id });
      const opponent = await base44.entities.Duel.filter({ opponent_id: user.id });
      return [...challenged, ...opponent];
    },
    enabled: !!user,
    initialData: [],
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Sparkles className="w-12 h-12 text-purple-500 animate-pulse" />
      </div>
    );
  }

  const currentLevel = user.level || 1;
  const currentXP = user.xp || 0;
  const xpForNextLevel = currentLevel * 100;
  const xpInCurrentLevel = currentXP % xpForNextLevel;
  const progressPercentage = (xpInCurrentLevel / xpForNextLevel) * 100;

  const wins = duels.filter(d => d.winner_id === user.id).length;
  const totalReactions = posts.reduce((sum, post) => {
    return sum + Object.values(post.reactions || {}).reduce((a, b) => a + b, 0);
  }, 0);

  const archColor = archetypeColors[user.archetype || 'none'];

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 mb-6">
            <TrendingUp className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4">
            Diário de Bordo da Alma
          </h1>
          <p className="text-gray-400 text-lg">
            Acompanhe sua jornada mística
          </p>
        </motion.div>

        {/* Perfil Overview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 p-8"
            style={{ borderColor: archColor }}>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div 
                className="w-24 h-24 rounded-full border-4 overflow-hidden flex-shrink-0"
                style={{ borderColor: archColor }}
              >
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                    <Sparkles className="w-12 h-12" style={{ color: archColor }} />
                  </div>
                )}
              </div>

              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold mb-2" style={{ color: archColor }}>
                  {user.display_name || user.full_name}
                </h2>
                {user.mystical_title && (
                  <p className="text-purple-300 mb-2">{user.mystical_title}</p>
                )}
                <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-gray-400">
                  <span>Nível {currentLevel}</span>
                  <span>•</span>
                  <span>{currentXP} XP</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Flame className="w-4 h-4 text-orange-400" />
                    {user.daily_streak || 0} dias
                  </span>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400">{user.ouros || 0}</div>
                  <div className="text-xs text-gray-400">Ouros</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">{user.achievements?.length || 0}</div>
                  <div className="text-xs text-gray-400">Conquistas</div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Progresso para Nível {currentLevel + 1}</span>
                <span>{xpInCurrentLevel} / {xpForNextLevel} XP</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>
          </Card>
        </motion.div>

        {/* Estatísticas */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-purple-900/30 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{posts.length}</div>
                  <div className="text-sm text-gray-400">Emanações</div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-purple-900/30 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-pink-600/20 flex items-center justify-center">
                  <Star className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{totalReactions}</div>
                  <div className="text-sm text-gray-400">Reações</div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-purple-900/30 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-violet-600/20 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-violet-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{wins}</div>
                  <div className="text-sm text-gray-400">Duelos Vencidos</div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-purple-900/30 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-600/20 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{user.daily_streak || 0}</div>
                  <div className="text-sm text-gray-400">Dias Consecutivos</div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Atividade Recente */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-purple-900/30 p-6">
          <h3 className="text-xl font-bold text-purple-300 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Jornada Recente
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-green-600/20 flex items-center justify-center flex-shrink-0">
                <Award className="w-4 h-4 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-gray-300">Entrada diária realizada</p>
                <p className="text-xs text-gray-500">
                  {format(new Date(), "d 'de' MMMM", { locale: ptBR })}
                </p>
              </div>
            </div>
            {user.last_daily_blessing && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-300">Bênção diária recebida</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(user.last_daily_blessing), "d 'de' MMMM", { locale: ptBR })}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-gray-300">Conta criada</p>
                <p className="text-xs text-gray-500">
                  {format(new Date(user.created_date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}