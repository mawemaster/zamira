
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card"; // Ensure CardContent is imported
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  Heart,
  MessageCircle,
  Share2,
  Crown,
  Sparkles,
  Wand2,
  Hand,
  Flame,
  Droplets,
  Volume2,
  Coins,
  Zap,
  Music, // Added Music icon
  MoreVertical, // Added MoreVertical icon for dropdown
  Flag // Added Flag icon for reporting
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { createPageUrl } from "@/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserLink from "../UserLink";
import CommentModal from "./CommentModal";
import ShareModal from "./ShareModal";
import MagicModal from "./MagicModal";
import DonateModal from "./DonateModal";
import ReportModal from "./ReportModal"; // Added ReportModal import
import { Badge } from "@/components/ui/badge"; // Added Badge import
import { toast } from "sonner";

const archetypeColors = {
  bruxa_natural: "#9333EA",
  sabio: "#F59E0B",
  guardiao_astral: "#3B82F6",
  xama: "#10B981",
  navegador_cosmico: "#8B5CF6",
  alquimista: "#6366F1",
  none: "#64748B"
};

const reactionIcons = {
  inspirador: { icon: Sparkles, color: "#FCD34D", label: "Inspirador" },
  mistico: { icon: Wand2, color: "#A78BFA", label: "Místico" },
  gratidao: { icon: Hand, color: "#F9A8D4", label: "Gratidão" },
  poderoso: { icon: Flame, color: "#F87171", label: "Poderoso" },
  curativo: { icon: Droplets, color: "#67E8F9", label: "Curativo" }
};

const magicEffects = {
  // MAGIAS BRANCAS
  destaque_ouro: {
    cardClass: "bg-gradient-to-br from-yellow-900/30 via-yellow-800/20 to-yellow-900/30 border-yellow-500/50",
    glowClass: "shadow-2xl shadow-yellow-500/50",
    borderAnimation: "animate-pulse",
    emoji: "✨"
  },
  destaque_roxo: {
    cardClass: "bg-gradient-to-br from-purple-900/30 via-purple-800/20 to-purple-900/30 border-purple-500/50",
    glowClass: "shadow-2xl shadow-purple-500/50",
    borderAnimation: "animate-pulse",
    emoji: "💜"
  },
  destaque_arcoiris: {
    cardClass: "bg-gradient-to-r from-red-900/20 via-purple-900/20 to-blue-900/20 border-transparent",
    glowClass: "shadow-2xl shadow-purple-500/70",
    borderAnimation: "animate-pulse",
    special: "rainbow",
    emoji: "🌈"
  },
  protecao: {
    cardClass: "bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-cyan-500/50",
    glowClass: "shadow-xl shadow-cyan-500/40",
    borderAnimation: "",
    emoji: "🛡️"
  },
  amplificacao: {
    cardClass: "bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-orange-500/50",
    glowClass: "shadow-xl shadow-orange-500/40",
    special: "amplify",
    emoji: "⚡"
  },
  cristal_puro: {
    cardClass: "bg-gradient-to-br from-cyan-900/30 via-blue-900/20 to-purple-900/30 border-cyan-400/60",
    glowClass: "shadow-2xl shadow-cyan-400/60",
    special: "crystal",
    emoji: "💎"
  },

  // MAGIAS SOMBRIAS
  enfeitico_leve: {
    cardClass: "bg-gradient-to-br from-gray-900/60 to-slate-900/60 border-gray-700/50",
    glowClass: "shadow-lg shadow-black/50",
    blur: "light",
    emoji: "🌑"
  },
  enfeitico_medio: {
    cardClass: "bg-gradient-to-br from-gray-900/80 to-black/80 border-gray-800/50",
    glowClass: "shadow-xl shadow-black/70",
    blur: "medium",
    emoji: "🌘"
  },
  enfeitico_pesado: {
    cardClass: "bg-gradient-to-br from-black/90 to-gray-900/90 border-black/80",
    glowClass: "shadow-2xl shadow-black/90",
    blur: "heavy",
    emoji: "🌚"
  },
  tremor_mistico: {
    cardClass: "bg-gradient-to-br from-purple-900/40 to-slate-900/40 border-purple-700/50",
    glowClass: "shadow-xl shadow-purple-500/40",
    special: "shake",
    emoji: "🌪️"
  },
  glitch_sombrio: {
    cardClass: "bg-gradient-to-br from-red-900/30 to-slate-900/30 border-red-700/50",
    glowClass: "shadow-xl shadow-red-500/40",
    special: "glitch",
    emoji: "📺"
  },
  chamas_negras: {
    cardClass: "bg-gradient-to-br from-red-900/40 via-orange-900/30 to-black/50 border-orange-700/50",
    glowClass: "shadow-2xl shadow-orange-500/60",
    special: "flames",
    emoji: "🔥"
  },
  distorcao: {
    cardClass: "bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-purple-700/50",
    glowClass: "shadow-xl shadow-purple-500/50",
    special: "distortion",
    emoji: "🌀"
  },
  curse_silent: {
    cardClass: "bg-gradient-to-br from-black/70 to-slate-900/70 border-slate-800/50",
    glowClass: "shadow-xl shadow-black/60",
    special: "silent",
    emoji: "🤐"
  }
};

export default function PostCard({ post, currentUser }) {
  // Validação essencial - PROTEÇÃO CONTRA UNDEFINED
  if (!post?.id || !currentUser?.id) return null;

  const queryClient = useQueryClient();
  const [showReactions, setShowReactions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showMagic, setShowMagic] = useState(false);
  const [showDonate, setShowDonate] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const userReaction = post.reactions_by_user?.[currentUser.id];

  // Query otimizada com cache
  const { data: comments } = useQuery({
    queryKey: ['post-comments', post.id],
    queryFn: () => base44.entities.PostComment.filter(
      { post_id: post.id },
      "-created_date",
      50
    ),
    enabled: !!post?.id,
    initialData: [],
    staleTime: 30000,
    gcTime: 120000,
  });

  const { data: activeMagic } = useQuery({
    queryKey: ['postMagic', post.id],
    queryFn: async () => {
      const magics = await base44.entities.PostMagic.filter({
        post_id: post.id,
        is_active: true
      }, "-created_date", 1);

      if (magics.length > 0) {
        const magic = magics[0];
        if (new Date(magic.expires_at) < new Date()) {
          await base44.entities.PostMagic.update(magic.id, { is_active: false });
          return [];
        }
        return [magic];
      }
      return [];
    },
    enabled: !!post?.id,
    initialData: [],
    refetchInterval: 60000
  });

  const { data: totalDonations } = useQuery({
    queryKey: ['postDonations', post.id],
    queryFn: async () => {
      const donations = await base44.entities.PostDonation.filter({ post_id: post.id });
      return donations.reduce((sum, d) => sum + d.amount, 0);
    },
    enabled: !!post?.id,
    initialData: 0
  });

  // Apply magic effect visuals
  const appliedMagic = activeMagic?.[0];
  const magicEffect = appliedMagic ? magicEffects[appliedMagic.magic_type] : null;

  let cardClass = "bg-gradient-to-br from-slate-900 to-slate-800 border-purple-900/30 hover:border-purple-700/50 transition";
  let glowClass = "";
  let appliedBorderAnimation = "";

  if (magicEffect) {
    cardClass = magicEffect.cardClass;
    glowClass = magicEffect.glowClass;
    appliedBorderAnimation = magicEffect.borderAnimation || '';
  }

  const specialEffects = magicEffect?.special;

  const reactMutation = useMutation({
    mutationFn: async (reactionType) => {
      if (!currentUser?.id || !post?.id) return;

      const newReactionsByUser = { ...(post.reactions_by_user || {}) };
      const newReactions = { ...(post.reactions || {}) };

      if (userReaction === reactionType) {
        delete newReactionsByUser[currentUser.id];
        newReactions[reactionType] = Math.max(0, (newReactions[reactionType] || 0) - 1);
      } else {
        if (userReaction) {
          newReactions[userReaction] = Math.max(0, (newReactions[userReaction] || 0) - 1);
        }
        newReactionsByUser[currentUser.id] = reactionType;
        newReactions[reactionType] = (newReactions[reactionType] || 0) + 1;

        if (post.author_id !== currentUser.id) {
          await base44.entities.Notification.create({
            user_id: post.author_id,
            type: "reaction",
            title: "Nova Reação!",
            message: `${currentUser.display_name || currentUser.full_name} reagiu ao seu post`,
            from_user_id: currentUser.id,
            from_user_name: currentUser.display_name || currentUser.full_name,
            from_user_avatar: currentUser.avatar_url,
            related_entity_id: post.id,
            related_entity_type: "post",
            action_url: "/Hub"
          });
        }
      }

      await base44.entities.Post.update(post.id, {
        reactions: newReactions,
        reactions_by_user: newReactionsByUser
      });
    },
    onMutate: async (reactionType) => {
      // Optimistic update - atualizar UI imediatamente
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      
      const previousPosts = queryClient.getQueryData(['posts']);
      
      queryClient.setQueryData(['posts'], (old) => {
        if (!old?.pages) return old;
        
        return {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            data: page.data.map(p => {
              if (p.id === post.id) {
                const newReactionsByUser = { ...(p.reactions_by_user || {}) };
                const newReactions = { ...(p.reactions || {}) };
                const currentReaction = newReactionsByUser[currentUser.id];

                if (currentReaction === reactionType) {
                  delete newReactionsByUser[currentUser.id];
                  newReactions[reactionType] = Math.max(0, (newReactions[reactionType] || 0) - 1);
                } else {
                  if (currentReaction) {
                    newReactions[currentReaction] = Math.max(0, (newReactions[currentReaction] || 0) - 1);
                  }
                  newReactionsByUser[currentUser.id] = reactionType;
                  newReactions[reactionType] = (newReactions[reactionType] || 0) + 1;
                }

                return {
                  ...p,
                  reactions: newReactions,
                  reactions_by_user: newReactionsByUser
                };
              }
              return p;
            })
          }))
        };
      });
      
      return { previousPosts };
    },
    onError: (err, variables, context) => {
      // Reverter em caso de erro
      if (context?.previousPosts) {
        queryClient.setQueryData(['posts'], context.previousPosts);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const castMagicMutation = useMutation({
    mutationFn: async ({ magicType, cost, message, duration, expiresAt }) => {
      if (!currentUser?.id || !post?.id) return;

      await base44.entities.PostMagic.create({
        post_id: post.id,
        post_author_id: post.author_id,
        caster_id: currentUser.id,
        caster_name: currentUser.display_name || currentUser.full_name,
        caster_avatar: currentUser.avatar_url,
        magic_type: magicType,
        ouros_cost: cost,
        duration_hours: duration,
        expires_at: expiresAt,
        message: message,
        is_active: true
      });

      await base44.auth.updateMe({
        ouros: (currentUser.ouros || 0) - cost
      });

      await base44.entities.Notification.create({
        user_id: post.author_id,
        type: "announcement",
        title: "🔮 Magia Recebida!",
        message: `${currentUser.display_name || currentUser.full_name} lançou uma magia no seu post!`,
        from_user_id: currentUser.id,
        from_user_name: currentUser.display_name || currentUser.full_name,
        from_user_avatar: currentUser.avatar_url,
        related_entity_id: post.id,
        related_entity_type: "post",
        action_url: "/Hub"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postMagic'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      window.location.reload();
    }
  });

  const donateMutation = useMutation({
    mutationFn: async ({ amount, message }) => {
      if (!currentUser?.id || !post?.id) return;

      await base44.entities.PostDonation.create({
        post_id: post.id,
        post_author_id: post.author_id,
        donor_id: currentUser.id,
        donor_name: currentUser.display_name || currentUser.full_name,
        donor_avatar: currentUser.avatar_url,
        amount: amount,
        message: message
      });

      await base44.auth.updateMe({
        ouros: (currentUser.ouros || 0) - amount
      });

      const authorData = await base44.entities.User.filter({ id: post.author_id });
      if (authorData.length > 0) {
        const author = authorData[0];
        await base44.entities.User.update(post.author_id, {
          ouros: (author.ouros || 0) + amount
        });
      }

      await base44.entities.Notification.create({
        user_id: post.author_id,
        type: "announcement",
        title: "💰 Doação Recebida!",
        message: `${currentUser.display_name || currentUser.full_name} doou ${amount} Ouros para você!`,
        from_user_id: currentUser.id,
        from_user_name: currentUser.display_name || currentUser.full_name,
        from_user_avatar: currentUser.avatar_url,
        related_entity_id: post.id,
        related_entity_type: "post",
        action_url: "/Hub"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postDonations'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      window.location.reload();
    }
  });

  const handleReaction = (type) => {
    reactMutation.mutate(type);
    setShowReactions(false);
  };

  const totalReactions = Object.values(post?.reactions || {}).reduce((sum, count) => sum + count, 0);
  const archColor = archetypeColors[post?.author_archetype] || archetypeColors.none;

  return (
    <>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0) translateY(0); }
          10% { transform: translateX(-2px) translateY(-2px); }
          20% { transform: translateX(2px) translateY(2px); }
          30% { transform: translateX(-2px) translateY(2px); }
          40% { transform: translateX(2px) translateY(-2px); }
          50% { transform: translateX(-2px) translateY(-2px); }
          60% { transform: translateX(2px) translateY(2px); }
          70% { transform: translateX(-2px) translateY(2px); }
          80% { transform: translateX(2px) translateY(-2px); }
          90% { transform: translateX(-2px) translateY(-2px); }
        }

        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }

        @keyframes distortion {
          0%, 100% { transform: skew(0deg); }
          25% { transform: skew(2deg, 1deg); }
          50% { transform: skew(-1deg, -2deg); }
          75% { transform: skew(1deg, -1deg); }
        }

        @keyframes rainbow-border {
          0% { border-color: #ff0000; }
          16% { border-color: #ff7f00; }
          33% { border-color: #ffff00; }
          50% { border-color: #00ff00; }
          66% { border-color: #0000ff; }
          83% { border-color: #8b00ff; }
          100% { border-color: #ff0000; }
        }

        @keyframes flames {
          0%, 100% { filter: hue-rotate(0deg) brightness(1); }
          50% { filter: hue-rotate(20deg) brightness(1.2); }
        }

        .shake { animation: shake 0.5s infinite; }
        .glitch { animation: glitch 0.3s infinite; }
        .distortion { animation: distortion 2s ease-in-out infinite; }
        .rainbow-border { animation: rainbow-border 3s linear infinite; border-width: 3px; }
        .flames { animation: flames 1.5s ease-in-out infinite; }
        .crystal-sparkle {
          position: relative;
          overflow: hidden;
        }
        .crystal-sparkle::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%);
          animation: crystal-shine 3s infinite;
        }
        @keyframes crystal-shine {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }

        .caster-text {
          background: linear-gradient(90deg, #ffd700, #ffed4e, #ffd700);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 2s linear infinite;
          text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`relative ${
          specialEffects === 'shake' ? 'shake' :
          specialEffects === 'glitch' ? 'glitch' :
          specialEffects === 'distortion' ? 'distortion' :
          specialEffects === 'flames' ? 'flames' :
          specialEffects === 'crystal' ? 'crystal-sparkle' :
          ''
        }`}
      >
        <Card className={`${cardClass} ${glowClass} ${
          specialEffects === 'rainbow' ? 'rainbow-border' : ''
        } ${appliedBorderAnimation}`}>

          {appliedMagic && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
              <Badge className="bg-purple-900/90 text-white border-purple-500/50 shadow-lg px-3 py-1 flex items-center gap-1.5 whitespace-nowrap">
                <span>{magicEffect?.emoji}</span>
                <span className="text-xs">Encantado por</span>
                <span className={`font-bold ${
                  appliedMagic.caster_id === post.author_id ? 'caster-text' : ''
                }`}>
                  {appliedMagic.caster_name}
                </span>
              </Badge>
            </div>
          )}

          <CardContent className="p-4 md:p-6 relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3 md:gap-4">
                <UserLink user={{ id: post.author_id, username: post.author_username }}>
                  <div
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center border-2 flex-shrink-0 cursor-pointer ${
                      appliedMagic && appliedMagic.caster_id === post.author_id
                      ? 'border-yellow-400 shadow-lg shadow-yellow-500/50'
                      : ''
                    }`}
                    style={{ borderColor: archColor }}
                  >
                    {post.author_avatar ? (
                      <img src={post.author_avatar} alt={post.author_name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
                    )}
                  </div>
                </UserLink>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                    <UserLink user={{ id: post.author_id, username: post.author_username }}>
                      <h4
                        className={`font-bold text-sm md:text-base truncate cursor-pointer hover:opacity-80 transition text-white ${
                          appliedMagic && appliedMagic.caster_id === post.author_id
                          ? 'caster-text text-lg'
                          : ''
                        }`}
                      >
                        {post.author_name}
                      </h4>
                    </UserLink>

                    {post.author_title && (
                      <span className="text-[10px] md:text-xs text-gray-300">• {post.author_title}</span>
                    )}

                    <span className="text-[10px] md:text-xs text-gray-400">
                      • Nível {post.author_level}
                    </span>
                    {post.author_archetype && (
                        <>
                            <span className="text-[10px] md:text-xs text-gray-400">•</span>
                            <span className="text-[10px] md:text-xs text-gray-300">
                                {post.author_archetype}
                            </span>
                        </>
                    )}

                    {post.author_champion_crowns?.length > 0 && (
                      <Crown className="w-3 h-3 md:w-4 md:h-4 text-yellow-400" />
                    )}
                  </div>

                  <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">
                    {format(new Date(post.created_date), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>

                {post.post_type !== 'simples' && (
                  <div className="px-2 md:px-3 py-0.5 md:py-1 bg-purple-900/30 rounded-full text-[10px] md:text-xs text-purple-300 border border-purple-700/30">
                    {post.post_type}
                  </div>
                )}
              </div>

              {currentUser.id !== post.author_id && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white -mr-2">
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-slate-900 border-purple-500/30">
                    <DropdownMenuItem
                      onClick={() => setShowReportModal(true)}
                      className="text-red-400 hover:text-red-300 cursor-pointer"
                    >
                      <Flag className="w-4 h-4 mr-2" />
                      Denunciar Publicação
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {magicEffect && magicEffect.blur && (
              <>
                <div className={`absolute inset-0 ${
                  magicEffect.blur === 'light' ? 'blur-sm bg-gray-900/60' :
                  magicEffect.blur === 'medium' ? 'blur-md bg-gray-900/70' :
                  magicEffect.blur === 'heavy' ? 'blur-xl bg-black/80' : ''
                } rounded-lg z-20`} />
                <div className="absolute inset-0 flex flex-col items-center justify-center z-30 text-center p-4">
                  <span className="text-4xl md:text-5xl mb-3">{magicEffect.emoji}</span>
                  <h4 className="text-white font-bold text-base md:text-lg mb-2">
                    Post Enfeitiçado!
                  </h4>
                  <p className="text-white/80 text-xs md:text-sm mb-1">
                    por {appliedMagic.caster_name}
                  </p>
                  {appliedMagic.message && (
                    <p className="text-white/70 text-xs italic">
                      "{appliedMagic.message}"
                    </p>
                  )}
                </div>
              </>
            )}

            <div className={`mb-3 md:mb-4 ${magicEffect && magicEffect.blur ? 'relative' : ''}`}>
              {post.content && (
                <p className="text-gray-100 text-sm md:text-base whitespace-pre-wrap leading-relaxed mb-3">
                  {post.content}
                </p>
              )}

              {post.audio_url && (
                <div className="mt-4 p-4 bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-2xl backdrop-blur-sm border border-purple-500/30 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-xl flex-shrink-0">
                      <Volume2 className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                        <Music className="w-4 h-4" />
                        Áudio Místico
                      </p>
                      <audio
                        controls
                        className="w-full h-10 rounded-lg"
                        style={{
                          filter: 'invert(1) hue-rotate(180deg)',
                        }}
                      >
                        <source src={post.audio_url} type="audio/mpeg" />
                      </audio>
                    </div>
                  </div>
                </div>
              )}

              {post.images && post.images.length > 0 && (
                <div className={`grid gap-2 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  {post.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt=""
                      className="rounded-lg w-full h-auto object-cover"
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 md:gap-4 pt-3 md:pt-4 border-t border-purple-900/30 flex-wrap">
              <DropdownMenu open={showReactions} onOpenChange={setShowReactions}>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 md:gap-2 text-gray-300 hover:text-purple-400 transition group touch-manipulation">
                    <div className={`p-1.5 md:p-2 rounded-full group-hover:bg-purple-900/30 transition ${userReaction ? 'bg-purple-900/30' : ''}`}>
                      {userReaction && reactionIcons[userReaction] ? (
                        React.createElement(reactionIcons[userReaction].icon, {
                          className: "w-4 h-4 md:w-5 md:h-5",
                          style: { color: reactionIcons[userReaction].color }
                        })
                      ) : (
                        <Heart className="w-4 h-4 md:w-5 md:h-5" />
                      )}
                    </div>
                    <span className="text-xs md:text-sm font-medium text-white">{totalReactions > 0 ? totalReactions : ''}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="bg-slate-900 border-purple-900/30 p-3 z-[200]"
                  align="center"
                  sideOffset={5}
                >
                  <div className="flex gap-3">
                    {Object.entries(reactionIcons).map(([type, { icon: Icon, color, label }]) => (
                      <button
                        key={type}
                        onClick={() => handleReaction(type)}
                        className="flex flex-col items-center gap-1.5 p-2.5 hover:bg-purple-900/30 rounded-lg transition cursor-pointer"
                        title={label}
                      >
                        <Icon className="w-7 h-7 md:w-8 md:h-8" style={{ color }} />
                        <span className="text-[10px] text-gray-300">{label}</span>
                      </button>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <button
                onClick={() => setShowComments(true)}
                className="flex items-center gap-1.5 md:gap-2 text-gray-300 hover:text-blue-400 transition group touch-manipulation"
              >
                <div className="p-1.5 md:p-2 rounded-full group-hover:bg-blue-900/30 transition">
                  <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <span className="text-xs md:text-sm font-medium text-white">{post.comments_count > 0 ? post.comments_count : ''}</span>
              </button>

              <button
                onClick={() => setShowShare(true)}
                className="flex items-center gap-1.5 md:gap-2 text-gray-300 hover:text-green-400 transition group touch-manipulation"
              >
                <div className="p-1.5 md:p-2 rounded-full group-hover:bg-green-900/30 transition">
                  <Share2 className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <span className="text-xs md:text-sm font-medium text-white">{post.shares_count > 0 ? post.shares_count : ''}</span>
              </button>

              <button
                onClick={() => setShowDonate(true)}
                className="flex items-center gap-1.5 md:gap-2 text-gray-300 hover:text-yellow-400 transition group touch-manipulation"
              >
                <div className="p-1.5 md:p-2 rounded-full group-hover:bg-yellow-900/30 transition">
                  <Coins className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                {totalDonations > 0 && (
                  <span className="text-xs md:text-sm font-medium text-yellow-400">{totalDonations}</span>
                )}
              </button>

              <button
                onClick={() => setShowMagic(true)}
                className="flex items-center gap-1.5 md:gap-2 text-gray-300 hover:text-purple-400 transition group ml-auto touch-manipulation"
              >
                <div className="p-1.5 md:p-2 rounded-full group-hover:bg-purple-900/30 transition">
                  <Zap className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <span className="text-xs md:text-sm font-medium text-white">Magia</span>
              </button>
            </div>

            {totalReactions > 0 && (
              <div className="flex items-center gap-1 mt-3 pt-3 border-t border-purple-900/30 flex-wrap">
                {Object.entries(post?.reactions || {}).map(([type, count]) => {
                  const reactionConfig = reactionIcons[type];
                  if (!count || count === 0 || !reactionConfig) return null;

                  const Icon = reactionConfig.icon;

                  return (
                    <div key={type} className="flex items-center gap-1 md:gap-1.5 px-2 md:px-2.5 py-1 md:py-1.5 bg-slate-800 rounded-full">
                      <Icon
                        className="w-3 h-3 md:w-4 md:h-4"
                        style={{ color: reactionConfig.color }}
                      />
                      <span className="text-[10px] md:text-xs text-gray-300 font-medium">{count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {post?.id && currentUser?.id && (
        <>
          <CommentModal
            isOpen={showComments}
            onClose={() => setShowComments(false)}
            post={post}
            currentUser={currentUser}
          />

          <ShareModal
            isOpen={showShare}
            onClose={() => setShowShare(false)}
            post={post}
            currentUser={currentUser}
          />

          <MagicModal
            isOpen={showMagic}
            onClose={() => setShowMagic(false)}
            post={post}
            currentUser={currentUser}
            onMagicCast={(data) => castMagicMutation.mutate(data)}
          />

          <DonateModal
            isOpen={showDonate}
            onClose={() => setShowDonate(false)}
            post={post}
            currentUser={currentUser}
            onDonate={(data) => donateMutation.mutate(data)}
          />

          <ReportModal
            isOpen={showReportModal}
            onClose={() => setShowReportModal(false)}
            post={post}
            currentUser={currentUser}
          />
        </>
      )}
    </>
  );
}
