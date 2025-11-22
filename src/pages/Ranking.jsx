import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Crown, 
  Star,
  Medal,
  Sparkles,
  TrendingUp,
  Search,
  Filter
} from "lucide-react";
import { motion } from "framer-motion";
import UserAvatar from "../components/UserAvatar";
import UserLink from "../components/UserLink";

const podiumColors = {
  1: { bg: 'from-yellow-600 to-amber-600', glow: 'shadow-yellow-500/50', icon: Crown, color: 'text-yellow-400' },
  2: { bg: 'from-gray-400 to-gray-500', glow: 'shadow-gray-400/50', icon: Medal, color: 'text-gray-300' },
  3: { bg: 'from-amber-700 to-amber-800', glow: 'shadow-amber-600/50', icon: Medal, color: 'text-amber-500' }
};

export default function RankingPage() {
  const [user, setUser] = useState(null);
  const [rankingType, setRankingType] = useState("xp");
  const [searchTerm, setSearchTerm] = useState("");

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

  // Buscar usuários para ranking
  const { data: users, isLoading } = useQuery({
    queryKey: ['ranking', rankingType],
    queryFn: async () => {
      const sortField = rankingType === 'xp' ? '-xp' : 
                        rankingType === 'level' ? '-level' : 
                        '-ouros';
      const allUsers = await base44.entities.User.list(sortField, 100);
      return allUsers;
    },
    enabled: !!user,
    initialData: [],
  });

  // Buscar badges dos top 3
  const { data: topUsersBadges } = useQuery({
    queryKey: ['topUsersBadges'],
    queryFn: async () => {
      const top3 = users.slice(0, 3);
      const badgesPromises = top3.map(u => 
        base44.entities.UserBadge.filter(
          { user_id: u.id, is_equipped: true },
          "-unlocked_at",
          3
        )
      );
      const results = await Promise.all(badgesPromises);
      return results;
    },
    enabled: users.length > 0,
    initialData: [],
  });

  // Filtrar usuários por busca
  const filteredUsers = users.filter(u => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(search) ||
      u.display_name?.toLowerCase().includes(search) ||
      u.username?.toLowerCase().includes(search)
    );
  });

  // Encontrar posição do usuário atual
  const currentUserRank = filteredUsers.findIndex(u => u.id === user?.id) + 1;

  const getRankingValue = (u) => {
    if (rankingType === 'xp') return u.xp || 0;
    if (rankingType === 'level') return u.level || 1;
    return u.ouros || 0;
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Sparkles className="w-12 h-12 text-purple-500 animate-pulse" />
      </div>
    );
  }

  const top3 = filteredUsers.slice(0, 3);
  const restUsers = filteredUsers.slice(3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f1e] via-[#1a1a2e] to-[#0f0f1e]">
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-amber-600 to-yellow-600 mb-4 shadow-xl shadow-amber-500/50">
            <Trophy className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
            Ranking Místico
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            Os maiores viajantes do portal
          </p>
        </motion.div>

        {/* Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 space-y-4"
        >
          {/* Tipo de Ranking */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { id: 'xp', label: 'Por XP', icon: TrendingUp },
              { id: 'level', label: 'Por Nível', icon: Star },
              { id: 'ouros', label: 'Por Ouros', icon: Trophy }
            ].map((type) => {
              const Icon = type.icon;
              return (
                <Button
                  key={type.id}
                  onClick={() => setRankingType(type.id)}
                  variant={rankingType === type.id ? "default" : "outline"}
                  className={`whitespace-nowrap ${
                    rankingType === type.id
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                      : 'border-purple-900/30 hover:bg-purple-900/20'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {type.label}
                </Button>
              );
            })}
          </div>

          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar viajante..."
              className="pl-10 bg-[#1a1a2e] border-purple-900/20 text-white"
            />
          </div>
        </motion.div>

        {/* Posição do Usuário Atual */}
        {currentUserRank > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500/30 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-purple-600/30 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">#{currentUserRank}</span>
                  </div>
                  <div>
                    <p className="text-white font-bold">Sua Posição</p>
                    <p className="text-purple-200 text-sm">
                      {getRankingValue(user).toLocaleString()} {
                        rankingType === 'xp' ? 'XP' :
                        rankingType === 'level' ? 'Nível' :
                        'Ouros'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Pódio - Top 3 */}
        {top3.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className="grid grid-cols-3 gap-3 md:gap-4">
              {/* 2º Lugar */}
              {top3[1] && (
                <Card className={`bg-gradient-to-br ${podiumColors[2].bg} border-gray-400/30 p-4 shadow-xl ${podiumColors[2].glow} order-1`}>
                  <div className="text-center">
                    <div className="flex justify-center mb-3">
                      <Medal className="w-8 h-8 md:w-10 md:h-10 text-white" />
                    </div>
                    <UserLink user={top3[1]}>
                      <UserAvatar user={top3[1]} size="lg" />
                    </UserLink>
                    <p className="text-white font-bold mt-2 text-sm md:text-base truncate">
                      {top3[1].display_name || top3[1].full_name}
                    </p>
                    <p className="text-white/80 text-xs">Nível {top3[1].level || 1}</p>
                    <Badge className="mt-2 bg-white/20 text-white text-xs">
                      {getRankingValue(top3[1]).toLocaleString()}
                    </Badge>
                  </div>
                </Card>
              )}

              {/* 1º Lugar */}
              {top3[0] && (
                <Card className={`bg-gradient-to-br ${podiumColors[1].bg} border-yellow-400/50 p-4 shadow-2xl ${podiumColors[1].glow} order-2 md:scale-110 md:-mt-4`}>
                  <div className="text-center">
                    <div className="flex justify-center mb-3">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Crown className="w-10 h-10 md:w-12 md:h-12 text-white" />
                      </motion.div>
                    </div>
                    <UserLink user={top3[0]}>
                      <UserAvatar user={top3[0]} size="xl" />
                    </UserLink>
                    <p className="text-white font-bold mt-2 text-base md:text-lg truncate">
                      {top3[0].display_name || top3[0].full_name}
                    </p>
                    <p className="text-white/90 text-xs md:text-sm">Nível {top3[0].level || 1}</p>
                    <Badge className="mt-2 bg-white/30 text-white font-bold">
                      {getRankingValue(top3[0]).toLocaleString()}
                    </Badge>
                  </div>
                </Card>
              )}

              {/* 3º Lugar */}
              {top3[2] && (
                <Card className={`bg-gradient-to-br ${podiumColors[3].bg} border-amber-600/30 p-4 shadow-xl ${podiumColors[3].glow} order-3`}>
                  <div className="text-center">
                    <div className="flex justify-center mb-3">
                      <Medal className="w-8 h-8 md:w-10 md:h-10 text-white" />
                    </div>
                    <UserLink user={top3[2]}>
                      <UserAvatar user={top3[2]} size="lg" />
                    </UserLink>
                    <p className="text-white font-bold mt-2 text-sm md:text-base truncate">
                      {top3[2].display_name || top3[2].full_name}
                    </p>
                    <p className="text-white/80 text-xs">Nível {top3[2].level || 1}</p>
                    <Badge className="mt-2 bg-white/20 text-white text-xs">
                      {getRankingValue(top3[2]).toLocaleString()}
                    </Badge>
                  </div>
                </Card>
              )}
            </div>
          </motion.div>
        )}

        {/* Lista - 4º em diante */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          {restUsers.map((rankedUser, index) => {
            const position = index + 4;
            const isCurrentUser = rankedUser.id === user.id;

            return (
              <motion.div
                key={rankedUser.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
              >
                <Card className={`bg-[#1a1a2e] border-purple-900/20 p-4 hover:bg-[#1f1f2e] transition ${
                  isCurrentUser ? 'ring-2 ring-purple-500/50' : ''
                }`}>
                  <div className="flex items-center gap-4">
                    {/* Posição */}
                    <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">#{position}</span>
                    </div>

                    {/* Avatar */}
                    <UserLink user={rankedUser}>
                      <UserAvatar user={rankedUser} size="md" />
                    </UserLink>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <UserLink user={rankedUser}>
                        <p className="text-white font-semibold truncate hover:text-purple-400 transition">
                          {rankedUser.display_name || rankedUser.full_name}
                        </p>
                      </UserLink>
                      <p className="text-gray-400 text-sm">
                        Nível {rankedUser.level || 1}
                      </p>
                    </div>

                    {/* Valor */}
                    <Badge className="bg-purple-600/20 text-purple-300 font-bold">
                      {getRankingValue(rankedUser).toLocaleString()}
                    </Badge>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {filteredUsers.length === 0 && (
          <Card className="bg-[#1a1a2e] border-purple-900/20 p-12 text-center">
            <Trophy className="w-16 h-16 text-purple-500/50 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-purple-300 mb-2">
              Nenhum Viajante Encontrado
            </h3>
            <p className="text-gray-400">
              Tente ajustar sua busca
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}