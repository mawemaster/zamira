
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { X, Heart, Users, Sun, Moon, ArrowUp, Flame, Droplets, Wind, Mountain, MapPin, Sparkles, Star, Settings } from "lucide-react";
import { toast } from "sonner";

import MyTiesModal from "../components/connection/MyTiesModal";
import MatchAnimation from "../components/connection/MatchAnimation";
import OraculoSettingsModal from "../components/connection/OraculoSettingsModal";
import PrivateChatModal from "../components/chat/PrivateChatModal";

const archetypeColors = {
  bruxa_natural: "#9333EA",
  sabio: "#F59E0B",
  guardiao_astral: "#3B82F6",
  xama: "#10B981",
  navegador_cosmico: "#8B5CF6",
  alquimista: "#6366F1",
  none: "#64748B"
};

const elementIcons = {
  fogo: Flame,
  agua: Droplets,
  ar: Wind,
  terra: Mountain
};

export default function OraculoCoracaoPage() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTiesModal, setShowTiesModal] = useState(false);
  const [showMatchAnimation, setShowMatchAnimation] = useState(false);
  const [matchedUser, setMatchedUser] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatTargetUser, setChatTargetUser] = useState(null);

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

  const { data: potentialConnections, isLoading, refetch } = useQuery({
    queryKey: ['potential-connections', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const allUsers = await base44.entities.User.list("-created_date", 100);
      
      const myConnections = await base44.entities.Connection.filter(
        { follower_id: user.id }
      );
      
      const connectedIds = myConnections.map(c => c.following_id);
      
      const filtered = allUsers.filter(u => {
        if (u.id === user.id) return false;
        if (connectedIds.includes(u.id)) return false;
        if (!u.avatar_url || !u.display_name) return false;
        
        const inRelationship = ['namorando', 'casado', 'uniao-estavel'].includes(u.relationship_status);
        if (inRelationship) return false;
        
        if (u.visible_in_oraculo === false) return false;
        
        return true;
      });
      
      const sorted = filtered.sort((a, b) => {
        if (a.featured_profile && !b.featured_profile) return -1;
        if (!a.featured_profile && b.featured_profile) return 1;
        return 0;
      });
      
      return sorted;
    },
    enabled: !!user,
    initialData: []
  });

  const connectMutation = useMutation({
    mutationFn: async (targetUser) => {
      await base44.entities.Connection.create({
        follower_id: user.id,
        follower_name: user.display_name || user.full_name,
        follower_avatar: user.avatar_url,
        following_id: targetUser.id,
        following_name: targetUser.display_name || targetUser.full_name,
        following_avatar: targetUser.avatar_url
      });

      await base44.entities.Notification.create({
        user_id: targetUser.id,
        type: "follow",
        title: "💖 Novo Match no Oráculo!",
        message: `${user.display_name || user.full_name} se conectou com você no Oráculo do Coração`,
        from_user_id: user.id,
        from_user_name: user.display_name || user.full_name,
        from_user_avatar: user.avatar_url,
        related_entity_type: "user",
        related_entity_id: user.id,
        action_url: `/Perfil?user=${user.username || user.id}`
      });

      const currentXP = user.xp || 0;
      const xpBonus = Math.max(Math.floor(currentXP * 0.02), 10);
      
      await base44.auth.updateMe({
        xp: currentXP + xpBonus
      });

      window.dispatchEvent(new CustomEvent('questAction:follow_user'));

      return { targetUser, xpBonus };
    },
    onSuccess: ({ targetUser, xpBonus }) => {
      setMatchedUser(targetUser);
      setShowMatchAnimation(true);
      
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['potential-connections'] });
      window.dispatchEvent(new CustomEvent('xpUpdated'));
    }
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (settings) => {
      await base44.auth.updateMe(settings);
    },
    onSuccess: () => {
      toast.success("Configurações salvas! ✨");
      setShowSettingsModal(false);
      loadUser();
      queryClient.invalidateQueries({ queryKey: ['potential-connections'] });
    }
  });

  const handleSwipe = (direction, targetUser) => {
    if (direction === "right") {
      connectMutation.mutate(targetUser);
    } else {
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 300);
    }
  };

  const handlePass = () => {
    if (currentIndex < potentialConnections.length) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleConnect = () => {
    if (currentIndex < potentialConnections.length) {
      handleSwipe("right", potentialConnections[currentIndex]);
    }
  };

  const handleOpenChat = () => {
    setShowMatchAnimation(false);
    if (matchedUser) {
      setChatTargetUser(matchedUser);
      setShowChatModal(true);
    }
  };

  const handleRestartJourney = () => {
    setCurrentIndex(0);
    refetch();
    toast.success("Jornada reiniciada! ✨");
  };

  if (!user || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#02031C] via-[#1a1a2e] to-[#02031C] flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 360]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Heart className="w-16 h-16 text-pink-500 mx-auto mb-4" />
          </motion.div>
          <p className="text-gray-300 text-lg">Preparando o Oráculo...</p>
        </div>
      </div>
    );
  }

  const currentProfile = potentialConnections[currentIndex];
  const hasMoreProfiles = currentIndex < potentialConnections.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#02031C] via-[#1a1a2e] to-[#02031C] overflow-hidden">
      {/* Efeitos de fundo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative max-w-md mx-auto px-3 pt-3" style={{ paddingBottom: 'calc(56px + 1rem)' }}>
        {/* Header Compacto */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-2"
        >
          <div className="flex-1">
            <h1 className="text-lg md:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">
              Conexões e Laços
            </h1>
            <p className="text-slate-300 text-[9px] md:text-[10px]">Encontre sua sincronicidade</p>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => setShowSettingsModal(true)}
              size="sm"
              className="bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 h-7 px-2.5"
            >
              <Settings className="w-3.5 h-3.5" />
            </Button>
            
            <Button
              onClick={() => setShowTiesModal(true)}
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg shadow-purple-500/30 h-7 px-2.5"
            >
              <Users className="w-3.5 h-3.5" />
            </Button>
          </div>
        </motion.div>

        {/* Card Stack Area - Ajustado para ocupar TODO o espaço */}
        <div className="relative" style={{ height: 'calc(100vh - 140px)' }}>
          <AnimatePresence mode="wait">
            {!hasMoreProfiles ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center px-6 h-full flex flex-col items-center justify-center"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 360]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-pink-500/50"
                >
                  <Heart className="w-10 h-10 md:w-12 md:h-12 text-white" />
                </motion.div>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-3">
                  Você explorou todos os perfis!
                </h2>
                <p className="text-slate-300 text-sm md:text-base mb-6">
                  O Oráculo está buscando novas energias cósmicas...
                </p>
                <Button
                  onClick={handleRestartJourney}
                  className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white shadow-lg shadow-pink-500/30"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Recomeçar Jornada
                </Button>
              </motion.div>
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                {potentialConnections[currentIndex + 1] && (
                  <motion.div
                    key={`bg-${currentIndex + 1}`}
                    initial={{ scale: 0.92, opacity: 0.3 }}
                    animate={{ scale: 0.95, opacity: 0.5 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="w-[92%] h-[95%] rounded-3xl bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-sm border border-purple-500/20" />
                  </motion.div>
                )}
                
                <div className="relative w-full h-full">
                  <ProfileCard
                    key={currentProfile.id}
                    profile={currentProfile}
                    onSwipe={handleSwipe}
                  />
                  
                  {/* Botões Sobrepostos - Mais próximos do fim do card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-4 z-20"
                  >
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handlePass}
                      className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-2xl shadow-red-500/60 hover:shadow-red-500/80 transition-all duration-300 border-4 border-white/20"
                    >
                      <X className="w-7 h-7 md:w-8 md:h-8 text-white" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleConnect}
                      disabled={connectMutation.isPending}
                      className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 flex items-center justify-center shadow-2xl shadow-green-500/70 hover:shadow-green-500/90 transition-all duration-300 border-4 border-white/30 relative"
                    >
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="absolute inset-0 rounded-full bg-green-400/30 blur-xl"
                      />
                      <Heart className="w-8 h-8 md:w-10 md:h-10 text-white relative z-10" fill="currentColor" />
                    </motion.button>
                  </motion.div>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modals */}
      {showTiesModal && (
        <MyTiesModal
          user={user}
          onClose={() => setShowTiesModal(false)}
        />
      )}

      {showMatchAnimation && matchedUser && (
        <MatchAnimation
          currentUser={user}
          matchedUser={matchedUser}
          onClose={() => {
            setShowMatchAnimation(false);
            setCurrentIndex(prev => prev + 1);
          }}
          onOpenChat={handleOpenChat}
        />
      )}

      {showSettingsModal && (
        <OraculoSettingsModal
          user={user}
          onClose={() => setShowSettingsModal(false)}
          onSave={(settings) => saveSettingsMutation.mutate(settings)}
        />
      )}

      {/* Chat Modal - Sem fundo de corações por enquanto */}
      {showChatModal && chatTargetUser && (
        <PrivateChatModal
          isOpen={showChatModal}
          onClose={() => {
            setShowChatModal(false);
            setChatTargetUser(null);
          }}
          currentUser={user}
          otherUser={chatTargetUser}
        />
      )}
    </div>
  );
}

// ProfileCard Component
function ProfileCard({ profile, onSwipe }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (event, info) => {
    const threshold = 80;
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    if (Math.abs(offset) > threshold || Math.abs(velocity) > 400) {
      const direction = offset > 0 ? "right" : "left";
      
      const exitX = direction === "right" ? 500 : -500;
      x.set(exitX);
      
      setTimeout(() => {
        onSwipe(direction, profile);
      }, 200);
    } else {
      x.set(0);
      y.set(0);
    }
  };

  const archColor = archetypeColors[profile.archetype] || archetypeColors.none;
  const age = profile.birthdate ? new Date().getFullYear() - new Date(profile.birthdate).getFullYear() : "?";
  
  const location = profile.detected_location?.city && profile.detected_location?.state 
    ? `${profile.detected_location.city}, ${profile.detected_location.state}` 
    : profile.city && profile.state 
    ? `${profile.city}, ${profile.state}` 
    : "Local desconhecido";
  
  const ElementIcon = profile.elemento_dominante ? elementIcons[profile.elemento_dominante.toLowerCase()] : null;

  const archetypeNames = {
    guardiao_astral: 'Guardião Astral',
    sabio: 'Sábio',
    bruxa_natural: 'Bruxa Natural',
    xama: 'Xamã',
    navegador_cosmico: 'Navegador Cósmico',
    alquimista: 'Alquimista'
  };

  return (
    <motion.div
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      style={{ x, y, rotate, opacity }}
      className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none"
    >
      <div className="relative w-full h-full rounded-3xl overflow-hidden border-4 border-purple-500/30 shadow-2xl">
        <div className="absolute inset-0">
          <img
            src={profile.avatar_url}
            alt={profile.display_name}
            className="w-full h-full object-cover"
            draggable={false}
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

        <div className="absolute bottom-14 left-0 right-0 p-3 md:p-4 text-white">
          <div className="mb-2">
            <h2 className="text-xl md:text-2xl font-bold drop-shadow-lg">
              {profile.display_name || profile.full_name}, {age}
            </h2>

            <div className="flex items-center gap-1 text-gray-200 mt-0.5">
              <MapPin className="w-3 h-3" />
              <span className="text-[10px] md:text-xs">{location}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {profile.archetype && profile.archetype !== 'none' && (
              <div
                className="px-2 py-0.5 rounded-full text-[10px] md:text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md border border-white/20 shadow-md"
                style={{ 
                  backgroundColor: `${archColor}40`,
                  color: '#ffffff',
                  textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                }}
              >
                {ElementIcon && <ElementIcon className="w-3 h-3" />}
                <span>{archetypeNames[profile.archetype] || 'Místico'}</span>
              </div>
            )}

            <div className="flex items-center gap-1 bg-gradient-to-r from-purple-600/80 to-pink-600/80 px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/20 shadow-md">
              <Star className="w-3 h-3 text-yellow-300" fill="currentColor" />
              <span className="text-[10px] md:text-xs font-bold">Nv {profile.level || 1}</span>
            </div>
          </div>

          {(profile.signo_solar || profile.signo_lunar || profile.ascendente) && (
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {profile.signo_solar && (
                <div className="flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-sm">
                  <Sun className="w-3 h-3 text-yellow-400" />
                  <span className="text-[10px] font-medium">{profile.signo_solar}</span>
                </div>
              )}
              {profile.signo_lunar && (
                <div className="flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-sm">
                  <Moon className="w-3 h-3 text-purple-300" />
                  <span className="text-[10px] font-medium">{profile.signo_lunar}</span>
                </div>
              )}
              {profile.ascendente && (
                <div className="flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-sm">
                  <ArrowUp className="w-3 h-3 text-cyan-400" />
                  <span className="text-[10px] font-medium">{profile.ascendente}</span>
                </div>
              )}
            </div>
          )}

          {profile.bio && (
            <div className="bg-black/30 backdrop-blur-md rounded-lg p-2 border border-white/10">
              <p className="text-gray-100 text-[11px] md:text-xs leading-snug line-clamp-2">
                "{profile.bio}"
              </p>
            </div>
          )}
        </div>

        <motion.div
          className="absolute top-6 md:top-8 right-4 md:right-6 px-3 md:px-4 py-1.5 md:py-2 bg-green-500/90 backdrop-blur-sm rounded-xl border-3 border-white shadow-xl"
          style={{ 
            opacity: useTransform(x, [0, 100], [0, 1]),
            rotate: -20
          }}
        >
          <span className="text-2xl md:text-4xl font-bold text-white">MATCH</span>
        </motion.div>
        
        <motion.div
          className="absolute top-6 md:top-8 left-4 md:left-6 px-3 md:px-4 py-1.5 md:py-2 bg-red-500/90 backdrop-blur-sm rounded-xl border-3 border-white shadow-xl"
          style={{ 
            opacity: useTransform(x, [-100, 0], [1, 0]),
            rotate: 20
          }}
        >
          <span className="text-2xl md:text-4xl font-bold text-white">NOPE</span>
        </motion.div>
      </div>
    </motion.div>
  );
}
