import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Award, 
  Sparkles,
  Star,
  Lock,
  Crown,
  Zap,
  Heart,
  Flame
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "react-hot-toast";

const rarityConfig = {
  common: { 
    label: "Comum", 
    color: "text-gray-400", 
    bg: "from-gray-600 to-gray-700",
    glow: "shadow-gray-500/30",
    border: "border-gray-500/30"
  },
  rare: { 
    label: "Raro", 
    color: "text-blue-400", 
    bg: "from-blue-600 to-blue-700",
    glow: "shadow-blue-500/50",
    border: "border-blue-500/50"
  },
  epic: { 
    label: "Épico", 
    color: "text-purple-400", 
    bg: "from-purple-600 to-purple-700",
    glow: "shadow-purple-500/50",
    border: "border-purple-500/50"
  },
  legendary: { 
    label: "Lendário", 
    color: "text-amber-400", 
    bg: "from-amber-600 to-amber-700",
    glow: "shadow-amber-500/50",
    border: "border-amber-500/50"
  },
  mythical: { 
    label: "Mítico", 
    color: "text-pink-400", 
    bg: "from-pink-600 via-purple-600 to-blue-600",
    glow: "shadow-pink-500/70",
    border: "border-pink-500/70"
  }
};

const categoryIcons = {
  beginner: "🌱",
  social: "👥",
  mystical: "🔮",
  collector: "📦",
  champion: "🏆",
  legendary: "⭐",
  seasonal: "🎃",
  special: "💎"
};

export default function DistintivosPage() {
  const [user, setUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBadge, setSelectedBadge] = useState(null);
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

  // Buscar todos os badges
  const { data: allBadges } = useQuery({
    queryKey: ['badges'],
    queryFn: () => base44.entities.Badge.filter({ is_active: true }, "order", 100),
    enabled: !!user,
    initialData: [],
  });

  // Buscar badges do usuário
  const { data: userBadges } = useQuery({
    queryKey: ['userBadges', user?.id],
    queryFn: () => base44.entities.UserBadge.filter({ user_id: user.id }, "-unlocked_at", 100),
    enabled: !!user,
    initialData: [],
  });

  // Equipar/Desequipar badge
  const toggleEquipMutation = useMutation({
    mutationFn: async ({ badgeId, isEquipped }) => {
      const userBadge = userBadges.find(ub => ub.badge_id === badgeId);
      if (userBadge) {
        await base44.entities.UserBadge.update(userBadge.id, {
          is_equipped: !isEquipped
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userBadges'] });
      toast.success('Badge atualizado! ✨');
    },
  });

  const handleToggleEquip = (badgeId, isEquipped) => {
    toggleEquipMutation.mutate({ badgeId, isEquipped });
  };

  // Filtrar badges
  const filteredBadges = allBadges.filter(badge => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'unlocked') {
      return userBadges.some(ub => ub.badge_id === badge.id);
    }
    return badge.category === selectedCategory;
  });

  // Estatísticas
  const stats = {
    total: allBadges.length,
    unlocked: userBadges.length,
    equipped: userBadges.filter(ub => ub.is_equipped).length,
    completion: allBadges.length > 0 ? Math.round((userBadges.length / allBadges.length) * 100) : 0
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Sparkles className="w-12 h-12 text-purple-500 animate-pulse" />
      </div>
    );
  }

  const categories = [
    { id: 'all', label: 'Todos', icon: Award },
    { id: 'unlocked', label: 'Desbloqueados', icon: Star },
    { id: 'beginner', label: 'Iniciante', emoji: '🌱' },
    { id: 'social', label: 'Social', emoji: '👥' },
    { id: 'mystical', label: 'Místico', emoji: '🔮' },
    { id: 'champion', label: 'Campeão', emoji: '🏆' },
    { id: 'legendary', label: 'Lendário', emoji: '⭐' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f1e] via-[#1a1a2e] to-[#0f0f1e]">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-amber-600 to-orange-600 mb-4 shadow-xl shadow-amber-500/50">
            <Award className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
            Coleção de Badges
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            Desbloqueie e colecione distintivos místicos
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6"
        >
          <Card className="bg-[#1a1a2e] border-purple-900/20 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Award className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-xs text-gray-400">Total</p>
              </div>
            </div>
          </Card>

          <Card className="bg-[#1a1a2e] border-purple-900/20 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <Star className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.unlocked}</p>
                <p className="text-xs text-gray-400">Desbloqueados</p>
              </div>
            </div>
          </Card>

          <Card className="bg-[#1a1a2e] border-purple-900/20 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.equipped}</p>
                <p className="text-xs text-gray-400">Equipados</p>
              </div>
            </div>
          </Card>

          <Card className="bg-[#1a1a2e] border-purple-900/20 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Crown className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.completion}%</p>
                <p className="text-xs text-gray-400">Completo</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : 'bg-[#1a1a2e] text-gray-400 hover:text-white'
                  }`}
                >
                  {Icon ? <Icon className="w-4 h-4" /> : <span className="text-lg">{cat.emoji}</span>}
                  <span className="text-sm">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Badges Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
        >
          {filteredBadges.map((badge, index) => {
            const userBadge = userBadges.find(ub => ub.badge_id === badge.id);
            const isUnlocked = !!userBadge;
            const isEquipped = userBadge?.is_equipped || false;
            const rarity = rarityConfig[badge.rarity || 'common'];

            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => setSelectedBadge(badge)}
              >
                <Card 
                  className={`relative overflow-hidden cursor-pointer transition ${
                    isUnlocked 
                      ? `bg-gradient-to-br ${rarity.bg} border-2 ${rarity.border} shadow-xl ${rarity.glow}` 
                      : 'bg-[#1a1a2e] border-purple-900/20 hover:border-purple-700/50'
                  }`}
                >
                  {/* Efeito de brilho se desbloqueado */}
                  {isUnlocked && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: ['-200%', '200%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                  )}

                  {/* Badge equipado indicator */}
                  {isEquipped && (
                    <div className="absolute top-2 right-2 z-10">
                      <Badge className="bg-green-500 text-white text-[10px] px-1.5 py-0.5">
                        Equipado
                      </Badge>
                    </div>
                  )}

                  <div className="relative z-10 p-4">
                    {/* Ícone */}
                    <div className="text-center mb-3">
                      <div 
                        className="text-5xl mx-auto w-16 h-16 flex items-center justify-center"
                        style={{
                          filter: isUnlocked ? 'none' : 'grayscale(100%) opacity(0.3)'
                        }}
                      >
                        {isUnlocked ? (
                          badge.icon || "🏆"
                        ) : (
                          <Lock className="w-8 h-8 text-gray-600" />
                        )}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="text-center">
                      <h3 className={`font-bold text-sm mb-1 ${
                        isUnlocked ? 'text-white' : 'text-gray-500'
                      }`}>
                        {isUnlocked || !badge.is_hidden ? badge.name : "???"}
                      </h3>
                      
                      <Badge className={`text-[10px] ${
                        isUnlocked 
                          ? `${rarity.color} bg-black/20` 
                          : 'bg-gray-700 text-gray-400'
                      }`}>
                        {rarity.label}
                      </Badge>

                      {isUnlocked && userBadge && (
                        <p className="text-[10px] text-white/70 mt-2">
                          {format(new Date(userBadge.unlocked_at), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {filteredBadges.length === 0 && (
          <Card className="bg-[#1a1a2e] border-purple-900/20 p-12 text-center">
            <Award className="w-16 h-16 text-purple-500/50 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-purple-300 mb-2">
              Nenhum Badge Encontrado
            </h3>
            <p className="text-gray-400">
              Continue sua jornada mística para desbloquear badges!
            </p>
          </Card>
        )}
      </div>

      {/* Badge Detail Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setSelectedBadge(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              {(() => {
                const userBadge = userBadges.find(ub => ub.badge_id === selectedBadge.id);
                const isUnlocked = !!userBadge;
                const isEquipped = userBadge?.is_equipped || false;
                const rarity = rarityConfig[selectedBadge.rarity || 'common'];

                return (
                  <Card className={`bg-gradient-to-br ${rarity.bg} border-2 ${rarity.border} p-6 shadow-2xl ${rarity.glow}`}>
                    <div className="text-center mb-4">
                      <div className="text-7xl mb-4">
                        {isUnlocked ? selectedBadge.icon || "🏆" : "🔒"}
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-2">
                        {isUnlocked || !selectedBadge.is_hidden ? selectedBadge.name : "Badge Secreto"}
                      </h2>
                      <Badge className={`${rarity.color} bg-black/30 mb-4`}>
                        {rarity.label}
                      </Badge>
                      <p className="text-white/90 text-sm">
                        {isUnlocked || !selectedBadge.is_hidden 
                          ? selectedBadge.description 
                          : "Complete os requisitos para desbloquear"}
                      </p>
                    </div>

                    {isUnlocked && (
                      <div className="space-y-3 mb-4">
                        <div className="bg-black/20 p-3 rounded-lg">
                          <p className="text-white/70 text-xs mb-1">Desbloqueado em</p>
                          <p className="text-white font-semibold">
                            {format(new Date(userBadge.unlocked_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </p>
                        </div>

                        {selectedBadge.xp_bonus > 0 && (
                          <div className="bg-black/20 p-3 rounded-lg">
                            <p className="text-white/70 text-xs mb-1">Bônus de XP</p>
                            <p className="text-white font-semibold">+{selectedBadge.xp_bonus} XP permanente</p>
                          </div>
                        )}
                      </div>
                    )}

                    {!isUnlocked && selectedBadge.unlock_condition && (
                      <div className="bg-black/20 p-3 rounded-lg mb-4">
                        <p className="text-white/70 text-xs mb-1">Como Desbloquear</p>
                        <p className="text-white text-sm">{selectedBadge.unlock_condition}</p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      {isUnlocked && (
                        <Button
                          onClick={() => handleToggleEquip(selectedBadge.id, isEquipped)}
                          disabled={toggleEquipMutation.isPending}
                          className={`flex-1 ${
                            isEquipped 
                              ? 'bg-red-600 hover:bg-red-700' 
                              : 'bg-green-600 hover:bg-green-700'
                          } text-white font-bold`}
                        >
                          {isEquipped ? 'Desequipar' : 'Equipar'}
                        </Button>
                      )}
                      <Button
                        onClick={() => setSelectedBadge(null)}
                        variant="outline"
                        className="flex-1 border-white/30 text-white hover:bg-white/10"
                      >
                        Fechar
                      </Button>
                    </div>
                  </Card>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}