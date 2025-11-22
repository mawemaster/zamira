
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sparkles, Heart, UserPlus, UserMinus, Award,
  Star, Calendar, MapPin, Users, Crown,
  Loader2, ChevronLeft, MessageCircle, ThumbsUp, ThumbsDown,
  Activity, Instagram, Facebook, Twitter, Phone
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import UserAvatar from "../components/UserAvatar";
import { createPageUrl } from "@/utils";
import ProfileMagicModal from "../components/profile/ProfileMagicModal";
import TestimonialModal from "../components/profile/TestimonialModal";
import DonateModal from "../components/profile/DonateModal";
import SendRavenModal from "../components/ravens/SendRavenModal";
import SkinCard from "../components/profile/SkinCard";
import SkinDetailModal from "../components/profile/SkinDetailModal";
import { toast } from "sonner";

const ARCHETYPE_COLORS = {
  bruxa_natural: "#9333EA",
  sabio: "#F59E0B",
  guardiao_astral: "#3B82F6",
  xama: "#10B981",
  navegador_cosmico: "#8B5CF6",
  alquimista: "#6366F1",
  none: "#A855F7"
};

const ARCHETYPE_ICONS = {
  bruxa_natural: "🌿",
  sabio: "📚",
  guardiao_astral: "⭐",
  xama: "🦅",
  navegador_cosmico: "🌌",
  alquimista: "⚗️",
  none: "✨"
};

export default function PerfilPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [showMagicModal, setShowMagicModal] = useState(false);
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [showRavenModal, setShowRavenModal] = useState(false);
  const [selectedSkin, setSelectedSkin] = useState(null);
  const [showSkinModal, setShowSkinModal] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const username = searchParams.get('username');
  const userId = searchParams.get('id'); // Added userId search param

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      if (username || userId) { // Updated condition to include userId
        loadProfileUser();
      } else {
        setProfileUser(currentUser);
      }
    }
  }, [username, userId, currentUser]); // Updated dependency array to include userId

  const loadCurrentUser = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    }
  };

  const loadProfileUser = async () => {
    try {
      let users = [];
      if (username) {
        users = await base44.entities.User.filter({ username: username });
      } else if (userId) { // Logic to filter by userId
        users = await base44.entities.User.filter({ id: userId });
      }
      
      if (users && users.length > 0) {
        setProfileUser(users[0]);
      } else {
        // Optionally handle case where user is not found
        console.warn("User not found by username or ID.");
        setProfileUser(null); // Or redirect to a 404 page
      }
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
    }
  };

  const { data: allSkins = [] } = useQuery({
    queryKey: ['all-skins'],
    queryFn: async () => {
      const skins = await base44.entities.Skin.filter({ is_available: true });
      return skins || [];
    },
    staleTime: 300000
  });

  const { data: userSkins = [] } = useQuery({
    queryKey: ['user-skins', profileUser?.id],
    queryFn: async () => {
      if (!profileUser?.id) return [];
      const skins = await base44.entities.UserSkin.filter({ user_id: profileUser.id });
      return skins || [];
    },
    enabled: !!profileUser?.id,
    staleTime: 60000
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['user-posts', profileUser?.id],
    queryFn: async () => {
      if (!profileUser?.id) return [];
      const result = await base44.entities.Post.filter(
        { author_id: profileUser.id },
        "-created_date",
        20
      );
      return (result || []).filter(p => p && p.id);
    },
    enabled: !!profileUser?.id,
    staleTime: 60000
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['user-comments', profileUser?.id],
    queryFn: async () => {
      if (!profileUser?.id) return [];
      const result = await base44.entities.Comment.filter(
        { author_id: profileUser.id },
        "-created_date",
        20
      );
      return (result || []).filter(c => c && c.id);
    },
    enabled: !!profileUser?.id,
    staleTime: 60000
  });

  const { data: connections = [] } = useQuery({
    queryKey: ['user-connections', profileUser?.id],
    queryFn: async () => {
      if (!profileUser?.id) return [];
      const result = await base44.entities.Connection.filter(
        { following_id: profileUser.id }
      );
      return (result || []).filter(c => c && c.id);
    },
    enabled: !!profileUser?.id,
    staleTime: 60000
  });

  const { data: testimonials = [] } = useQuery({
    queryKey: ['user-testimonials', profileUser?.id],
    queryFn: async () => {
      if (!profileUser?.id) return [];
      const result = await base44.entities.ProfileTestimonial.filter(
        { profile_user_id: profileUser.id, status: 'approved' },
        "-created_date",
        10
      );
      return (result || []).filter(t => t && t.id);
    },
    enabled: !!profileUser?.id,
    staleTime: 60000
  });

  const { data: activeMagics = [] } = useQuery({
    queryKey: ['user-magics', profileUser?.id],
    queryFn: async () => {
      if (!profileUser?.id) return [];
      const magics = await base44.entities.ProfileMagic.filter(
        { profile_user_id: profileUser.id, is_active: true }
      );
      return (magics || []).filter(m => m && m.id && m.expires_at && new Date(m.expires_at) > new Date());
    },
    enabled: !!profileUser?.id,
    refetchInterval: 10000,
    staleTime: 5000
  });

  const { data: badges = [] } = useQuery({
    queryKey: ['user-badges', profileUser?.id],
    queryFn: async () => {
      if (!profileUser?.id) return [];
      const userBadges = await base44.entities.UserBadge.filter(
        { user_id: profileUser.id }
      );
      return (userBadges || []).filter(b => b && b.id);
    },
    enabled: !!profileUser?.id,
    staleTime: 60000
  });

  const { data: votes = [] } = useQuery({
    queryKey: ['user-votes', profileUser?.id],
    queryFn: async () => {
      if (!profileUser?.id) return [];
      const profileVotes = await base44.entities.ProfileVote.filter(
        { profile_user_id: profileUser.id }
      );
      return (profileVotes || []).filter(v => v && v.id);
    },
    enabled: !!profileUser?.id,
    staleTime: 30000
  });

  const { data: myVote } = useQuery({
    queryKey: ['my-vote', currentUser?.id, profileUser?.id],
    queryFn: async () => {
      if (!currentUser?.id || !profileUser?.id) return null;
      const votes = await base44.entities.ProfileVote.filter({
        profile_user_id: profileUser.id,
        voter_id: currentUser.id
      });
      return votes && votes.length > 0 && votes[0]?.id ? votes[0] : null;
    },
    enabled: !!currentUser?.id && !!profileUser?.id,
    staleTime: 30000
  });

  const { data: isFollowing } = useQuery({
    queryKey: ['is-following', currentUser?.id, profileUser?.id],
    queryFn: async () => {
      if (!currentUser?.id || !profileUser?.id || currentUser.id === profileUser.id) return false;
      const connections = await base44.entities.Connection.filter({
        follower_id: currentUser.id,
        following_id: profileUser.id
      });
      return connections && connections.length > 0;
    },
    enabled: !!currentUser?.id && !!profileUser?.id && currentUser?.id !== profileUser?.id,
    staleTime: 30000
  });

  const buySkinMutation = useMutation({
    mutationFn: async (skinId) => {
      const skin = allSkins.find(s => s.id === skinId);
      if (!skin) throw new Error("Skin não encontrada");
      
      if (currentUser.ouros < skin.price_ouros) {
        throw new Error("Ouros insuficientes");
      }

      await base44.auth.updateMe({
        ouros: currentUser.ouros - skin.price_ouros
      });

      await base44.entities.UserSkin.create({
        user_id: currentUser.id,
        skin_id: skinId,
        is_equipped: false,
        acquired_date: new Date().toISOString()
      });

      return skin;
    },
    onSuccess: (skin) => {
      queryClient.invalidateQueries({ queryKey: ['user-skins'] });
      toast.success(`Você adquiriu ${skin.name}! ✨`);
      setShowSkinModal(false);
      loadCurrentUser();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao comprar skin");
    }
  });

  const equipSkinMutation = useMutation({
    mutationFn: async (skinId) => {
      await base44.entities.UserSkin.filter({ user_id: currentUser.id }).then(async (skins) => {
        for (const skin of skins) {
          if (skin.is_equipped) {
            await base44.entities.UserSkin.update(skin.id, { is_equipped: false });
          }
        }
      });

      const userSkin = userSkins.find(us => us.skin_id === skinId);
      if (userSkin) {
        await base44.entities.UserSkin.update(userSkin.id, { is_equipped: true });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-skins'] });
      toast.success("Skin equipada com sucesso! ✨");
      setShowSkinModal(false);
    },
    onError: () => {
      toast.error("Erro ao equipar skin");
    }
  });

  const voteMutation = useMutation({
    mutationFn: async (voteType) => {
      if (!currentUser?.id || !profileUser?.id) return;

      if (myVote?.id) {
        if (myVote.vote_type === voteType) {
          await base44.entities.ProfileVote.delete(myVote.id);
        } else {
          await base44.entities.ProfileVote.update(myVote.id, { vote_type: voteType });
        }
      } else {
        await base44.entities.ProfileVote.create({
          profile_user_id: profileUser.id,
          voter_id: currentUser.id,
          voter_name: currentUser.display_name || currentUser.full_name || 'Viajante',
          voter_avatar: currentUser.avatar_url || '',
          vote_type: voteType
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-votes'] });
      queryClient.invalidateQueries({ queryKey: ['my-vote'] });
    }
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser?.id || !profileUser?.id) return;

      await base44.entities.Connection.create({
        follower_id: currentUser.id,
        follower_name: currentUser.display_name || currentUser.full_name || 'Viajante',
        follower_avatar: currentUser.avatar_url || '',
        following_id: profileUser.id,
        following_name: profileUser.display_name || profileUser.full_name || 'Viajante',
        following_avatar: profileUser.avatar_url || ''
      });

      await base44.entities.Notification.create({
        user_id: profileUser.id,
        type: "follow",
        title: "Nova Conexão!",
        message: `${currentUser.display_name || currentUser.full_name || 'Alguém'} conectou-se com você`,
        from_user_id: currentUser.id,
        from_user_name: currentUser.display_name || currentUser.full_name || 'Viajante',
        from_user_avatar: currentUser.avatar_url || ''
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['is-following'] });
      queryClient.invalidateQueries({ queryKey: ['user-connections'] });
    }
  });

  const unfollowMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser?.id || !profileUser?.id) return;

      const connections = await base44.entities.Connection.filter({
        follower_id: currentUser.id,
        following_id: profileUser.id
      });
      if (connections && connections.length > 0 && connections[0]?.id) {
        await base44.entities.Connection.delete(connections[0].id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['is-following'] });
      queryClient.invalidateQueries({ queryKey: ['user-connections'] });
    }
  });

  const handleSkinClick = (skin) => {
    setSelectedSkin(skin);
    setShowSkinModal(true);
  };

  if (!currentUser || !profileUser) {
    // If a username or userId was provided but no profileUser was found
    if ((username || userId) && profileUser === null) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#0f0f1e] via-[#1a1a2e] to-[#0f0f1e]">
          <h2 className="text-xl text-white">Perfil não encontrado.</h2>
        </div>
      );
    }
    
    // Default loading state
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#0f0f1e] via-[#1a1a2e] to-[#0f0f1e]">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  const isOwnProfile = currentUser.id === profileUser.id;
  const archColor = ARCHETYPE_COLORS[profileUser.archetype] || ARCHETYPE_COLORS.none;
  const archIcon = ARCHETYPE_ICONS[profileUser.archetype] || ARCHETYPE_ICONS.none;

  const upvotes = (votes || []).filter(v => v?.vote_type === 'upvote').length;
  const downvotes = (votes || []).filter(v => v?.vote_type === 'downvote').length;

  const recentActivities = [
    ...(posts || []).map(p => ({ ...p, type: 'post' })),
    ...(comments || []).map(c => ({ ...c, type: 'comment' }))
  ].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 10);

  const ownedSkinIds = new Set(userSkins.map(us => us.skin_id));
  const equippedSkin = userSkins.find(us => us.is_equipped);

  const displaySkins = allSkins.filter(skin => ownedSkinIds.has(skin.id));
  const maxSlots = 12;
  const emptySlots = Math.max(0, maxSlots - displaySkins.length);

  const selectedSkinOwned = selectedSkin ? ownedSkinIds.has(selectedSkin.id) : false;
  const selectedSkinEquipped = selectedSkin && equippedSkin ? equippedSkin.skin_id === selectedSkin.id : false;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f1e] via-[#1a1a2e] to-[#0f0f1e] pb-24">
      <div className="max-w-5xl mx-auto px-3 md:px-4 py-4 md:py-8">
        {(username || userId) && ( // Updated condition to include userId
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="mb-3 md:mb-4 text-gray-300 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-slate-900/50 border-purple-500/30 overflow-hidden mb-4 md:mb-6">
            <div className="relative h-32 md:h-48 bg-gradient-to-r from-purple-900 to-pink-900">
              {profileUser.banner_url && (
                <img src={profileUser.banner_url} alt="Banner" className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
            </div>

            <div className="p-3 md:p-6 -mt-12 md:-mt-16 relative">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-3 md:gap-4 mb-4 md:mb-6">
                <div className="relative">
                  <UserAvatar user={profileUser} size={typeof window !== 'undefined' && window.innerWidth < 768 ? "lg" : "xl"} showStatus={true} />
                  {profileUser.is_pro_subscriber && (
                    <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 bg-gradient-to-r from-yellow-600 to-amber-600 text-white px-1.5 md:px-2 py-0.5 md:py-1 rounded-full flex items-center gap-1 text-[10px] md:text-xs">
                      <Crown className="w-2.5 h-2.5 md:w-3 md:h-3" />
                      PRO
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-xl md:text-3xl font-bold text-white mb-1 md:mb-2 flex items-center justify-center md:justify-start gap-2">
                    <span>{archIcon}</span>
                    {profileUser.display_name || profileUser.full_name || 'Viajante'}
                  </h1>
                  {profileUser.username && (
                    <p className="text-sm md:text-base text-gray-400 mb-2">@{profileUser.username}</p>
                  )}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 md:gap-2">
                    <Badge style={{ backgroundColor: archColor }} className="text-[10px] md:text-xs">
                      {profileUser.archetype ? profileUser.archetype.replace(/_/g, ' ').toUpperCase() : 'SEM ARQUÉTIPO'}
                    </Badge>
                    <Badge variant="outline" className="text-yellow-400 border-yellow-400 text-[10px] md:text-xs">
                      Nível {profileUser.level || 1}
                    </Badge>
                    {profileUser.mystical_title && (
                      <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-[10px] md:text-xs">
                        {profileUser.mystical_title}
                      </Badge>
                    )}
                  </div>
                </div>

                {!isOwnProfile && (
                  <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                    <Button
                      onClick={() => isFollowing ? unfollowMutation.mutate() : followMutation.mutate()}
                      disabled={followMutation.isPending || unfollowMutation.isPending}
                      size="sm"
                      className={`${isFollowing ? "bg-gray-600 hover:bg-gray-700" : "bg-purple-600 hover:bg-purple-700"} w-full md:w-auto`}
                    >
                      {isFollowing ? <UserMinus className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" /> : <UserPlus className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />}
                      {isFollowing ? 'Desconectar' : 'Conectar'}
                    </Button>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => voteMutation.mutate('upvote')}
                        variant={myVote?.vote_type === 'upvote' ? 'default' : 'outline'}
                        size="sm"
                        className={`flex-1 md:flex-none ${myVote?.vote_type === 'upvote' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                      >
                        <ThumbsUp className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                        {upvotes}
                      </Button>
                      <Button
                        onClick={() => voteMutation.mutate('downvote')}
                        variant={myVote?.vote_type === 'downvote' ? 'default' : 'outline'}
                        size="sm"
                        className={`flex-1 md:flex-none ${myVote?.vote_type === 'downvote' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                      >
                        <ThumbsDown className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                        {downvotes}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {profileUser.bio && (
                <p className="text-sm md:text-base text-gray-300 mb-3 md:mb-4 text-center md:text-left">{profileUser.bio}</p>
              )}

              <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 md:gap-4 text-xs md:text-sm text-gray-400 mb-4 md:mb-6">
                {profileUser.birth_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="truncate">{new Date(profileUser.birth_date).toLocaleDateString('pt-BR')}</span>
                  </div>
                )}
                {profileUser.birth_city && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="truncate">{profileUser.birth_city}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3 md:w-4 md:h-4" />
                  <span>{connections.length} conexões</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3 md:w-4 md:h-4" />
                  <span>{posts.length} posts</span>
                </div>
              </div>

              {!isOwnProfile && (
                <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 md:gap-3">
                  <Button
                    onClick={() => setShowRavenModal(true)}
                    size="sm"
                    className="relative bg-black hover:bg-gray-900 border border-purple-500/30 text-xs md:text-sm"
                  >
                    <img
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e5f6f991e09e82bef3795/4332b5385_corvo.png"
                      alt="Corvo"
                      className="w-3 h-3 md:w-5 md:h-5 mr-1 md:mr-2"
                    />
                    <span className="font-bold text-white">Corvo</span>
                  </Button>

                  <Button
                    onClick={() => setShowMagicModal(true)}
                    size="sm"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-xs md:text-sm"
                  >
                    <Sparkles className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    Magia
                  </Button>

                  <Button
                    onClick={() => setShowTestimonialModal(true)}
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-xs md:text-sm"
                  >
                    <Star className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    Depoimento
                  </Button>

                  <Button
                    onClick={() => setShowDonateModal(true)}
                    size="sm"
                    className="bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-xs md:text-sm"
                  >
                    <Heart className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    Doar
                  </Button>
                </div>
              )}
            </div>

            {activeMagics && activeMagics.length > 0 && (
              <div className="px-3 md:px-6 pb-3 md:pb-6">
                <h3 className="text-xs md:text-sm font-bold text-purple-300 mb-2 md:mb-3">✨ Magias Ativas</h3>
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                  {activeMagics.map(magic => (
                    <Badge key={magic.id} className="bg-purple-900/50 text-purple-200 text-[10px] md:text-xs">
                      {magic.magic_type ? magic.magic_type.replace(/_/g, ' ') : 'Magia'} por {magic.caster_name || 'Anônimo'}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {(profileUser.pronouns || profileUser.relationship_status || profileUser.gender || profileUser.orientation || profileUser.zodiac_sign || profileUser.favorite_color || (profileUser.beliefs && profileUser.beliefs.length > 0) || (profileUser.hobbies && profileUser.hobbies.length > 0) || profileUser.social_links) && (
            <Card className="bg-slate-900/50 border-purple-500/30 p-3 md:p-4 mb-4 md:mb-6">
              <h3 className="text-sm md:text-base font-bold text-purple-300 mb-3 md:mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                Sobre Mim
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 text-xs md:text-sm">
                {profileUser.pronouns && (
                  <div>
                    <span className="text-gray-400">Pronomes:</span>
                    <span className="text-gray-200 ml-2">{profileUser.pronouns_other || profileUser.pronouns}</span>
                  </div>
                )}
                {profileUser.relationship_status && (
                  <div>
                    <span className="text-gray-400">Status:</span>
                    <span className="text-gray-200 ml-2">{profileUser.relationship_status}</span>
                  </div>
                )}
                {profileUser.gender && (
                  <div>
                    <span className="text-gray-400">Gênero:</span>
                    <span className="text-gray-200 ml-2">{profileUser.gender_other || profileUser.gender}</span>
                  </div>
                )}
                {profileUser.orientation && (
                  <div>
                    <span className="text-gray-400">Orientação:</span>
                    <span className="text-gray-200 ml-2">{profileUser.orientation_other || profileUser.orientation}</span>
                  </div>
                )}
                {profileUser.zodiac_sign && (
                  <div>
                    <span className="text-gray-400">Signo:</span>
                    <span className="text-gray-200 ml-2">{profileUser.zodiac_sign}</span>
                  </div>
                )}
                {profileUser.favorite_color && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Aura:</span>
                    <div className="w-5 h-5 rounded-full border-2 border-white" style={{ backgroundColor: profileUser.favorite_color }} />
                  </div>
                )}
                {profileUser.beliefs && profileUser.beliefs.length > 0 && (
                  <div className="col-span-full">
                    <span className="text-gray-400">Crenças:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {profileUser.beliefs.map((belief, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] md:text-xs text-gray-200 border-gray-600">{belief}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {profileUser.hobbies && profileUser.hobbies.length > 0 && (
                  <div className="col-span-full">
                    <span className="text-gray-400">Interesses:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {profileUser.hobbies.map((hobby, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] md:text-xs text-gray-200 border-gray-600">{hobby}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {profileUser.social_links && Object.keys(profileUser.social_links).length > 0 && (
                <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-purple-500/20">
                  <div className="flex flex-wrap gap-2">
                    {profileUser.social_links.instagram && (
                      <a href={`https://instagram.com/${profileUser.social_links.instagram}`} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">
                        <Instagram className="w-4 h-4 md:w-5 md:h-5" />
                      </a>
                    )}
                    {profileUser.social_links.facebook && (
                      <a href={profileUser.social_links.facebook} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">
                        <Facebook className="w-4 h-4 md:w-5 md:h-5" />
                      </a>
                    )}
                    {profileUser.social_links.twitter && (
                      <a href={`https://twitter.com/${profileUser.social_links.twitter}`} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">
                        <Twitter className="w-4 h-4 md:w-5 md:h-5" />
                      </a>
                    )}
                    {profileUser.social_links.phone && (
                      <a href={`tel:${profileUser.social_links.phone}`} className="text-purple-400 hover:text-purple-300">
                        <Phone className="w-4 h-4 md:w-5 md:h-5" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </Card>
          )}

          <Card className="bg-slate-900/50 border-purple-500/30 p-3 md:p-4 mb-4 md:mb-6">
            <h3 className="text-sm md:text-base font-bold text-purple-300 mb-3 md:mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
              Skins Místicas {isOwnProfile && `(${userSkins.length})`}
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 md:gap-3">
              {displaySkins.map((skin) => (
                <SkinCard
                  key={skin.id}
                  skin={skin}
                  owned={true}
                  equipped={equippedSkin?.skin_id === skin.id}
                  onClick={() => handleSkinClick(skin)}
                />
              ))}
              {Array.from({ length: emptySlots }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="relative aspect-square rounded-xl border-2 border-dashed border-gray-700 bg-slate-800/30 flex items-center justify-center cursor-pointer hover:border-purple-500/50 transition"
                  onClick={() => {
                    if (isOwnProfile) {
                      navigate(createPageUrl("Inventario"));
                    }
                  }}
                >
                  <div className="text-center p-2">
                    <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-gray-600 mx-auto mb-1" />
                    <p className="text-[8px] md:text-[10px] text-gray-500">Slot Vazio</p>
                  </div>
                </div>
              ))}
            </div>
            {isOwnProfile && userSkins.length === 0 && (
              <p className="text-xs text-center text-gray-400 mt-3">
                Compre skins no <button onClick={() => navigate(createPageUrl("Inventario"))} className="text-purple-400 underline">Inventário</button>
              </p>
            )}
          </Card>

          {badges && badges.length > 0 && (
            <Card className="bg-slate-900/50 border-purple-500/30 p-3 md:p-4 mb-4 md:mb-6">
              <h3 className="text-sm md:text-base font-bold text-purple-300 mb-3 md:mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 md:w-5 md:h-5" />
                Conquistas ({badges.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                {badges.map((badge, index) => (
                  <div key={badge?.id || index} className="bg-slate-800/50 p-2 md:p-3 rounded-lg text-center">
                    <div className="text-2xl md:text-3xl mb-1 md:mb-2">🏆</div>
                    <p className="text-white font-bold text-xs md:text-sm truncate">{badge?.badge_name || 'Conquista'}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Tabs defaultValue="activity" className="w-full">
            <TabsList className="grid grid-cols-4 w-full bg-slate-900/50 mb-4 md:mb-6 text-[10px] md:text-sm">
              <TabsTrigger value="activity">Atividade</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="testimonials">Depoimentos</TabsTrigger>
              <TabsTrigger value="connections">Conexões</TabsTrigger>
            </TabsList>

            <TabsContent value="activity">
              {recentActivities.length === 0 ? (
                <div className="text-center py-8 md:py-12">
                  <Activity className="w-12 h-12 md:w-16 md:h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-sm md:text-base text-gray-400">Nenhuma atividade recente</p>
                </div>
              ) : (
                <div className="space-y-3 md:space-y-4">
                  {recentActivities.map((activity, i) => (
                    <Card key={`activity-${i}`} className="bg-slate-900/50 border-purple-500/30 p-3 md:p-4">
                      <div className="flex items-start gap-2 md:gap-3">
                        <div className={`p-1.5 md:p-2 rounded-lg ${activity.type === 'post' ? 'bg-purple-900/30' : 'bg-blue-900/30'}`}>
                          {activity.type === 'post' ? <MessageCircle className="w-3 h-3 md:w-4 md:h-4 text-purple-400" /> : <Activity className="w-3 h-3 md:w-4 md:h-4 text-blue-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm md:text-base mb-1 md:mb-2 break-words">{activity.content || ''}</p>
                          <span className="text-[10px] md:text-xs text-gray-400">
                            {activity.created_date && formatDistanceToNow(new Date(activity.created_date), { addSuffix: true, locale: ptBR })}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="posts">
              {posts.length === 0 ? (
                <div className="text-center py-8 md:py-12">
                  <MessageCircle className="w-12 h-12 md:w-16 md:h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-sm md:text-base text-gray-400">Nenhum post ainda</p>
                </div>
              ) : (
                <div className="space-y-3 md:space-y-4">
                  {posts.map((post, index) => (
                    <Card key={post?.id || index} className="bg-slate-900/50 border-purple-500/30 p-3 md:p-4">
                      <p className="text-white text-sm md:text-base mb-2 break-words">{post?.content || ''}</p>
                      <span className="text-[10px] md:text-xs text-gray-400">
                        {post?.created_date && formatDistanceToNow(new Date(post.created_date), { addSuffix: true, locale: ptBR })}
                      </span>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="testimonials">
              {testimonials.length === 0 ? (
                <div className="text-center py-8 md:py-12">
                  <Star className="w-12 h-12 md:w-16 md:h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-sm md:text-base text-gray-400">Nenhum depoimento ainda</p>
                </div>
              ) : (
                <div className="space-y-3 md:space-y-4">
                  {testimonials.map((testimonial, index) => (
                    <Card key={testimonial?.id || index} className="bg-slate-900/50 border-purple-500/30 p-3 md:p-4">
                      <div className="flex items-start gap-2 md:gap-3">
                        <UserAvatar
                          user={{
                            avatar_url: testimonial?.author_avatar || '',
                            display_name: testimonial?.author_name || 'Viajante',
                            full_name: testimonial?.author_name || 'Viajante'
                          }}
                          size="sm"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-bold text-xs md:text-sm">{testimonial?.author_name || 'Viajante'}</h4>
                          <p className="text-gray-300 text-xs md:text-sm mt-1 break-words">{testimonial?.content || ''}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="connections">
              {connections.length === 0 ? (
                <div className="text-center py-8 md:py-12">
                  <Users className="w-12 h-12 md:w-16 md:h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-sm md:text-base text-gray-400">Nenhuma conexão ainda</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                  {connections.map((connection, index) => (
                    <Card key={connection?.id || index} className="bg-slate-900/50 border-purple-500/30 p-3 md:p-4 text-center">
                      <UserAvatar
                        user={{
                          avatar_url: connection?.follower_avatar || '',
                          display_name: connection?.follower_name || 'Viajante',
                          full_name: connection?.follower_name || 'Viajante'
                        }}
                        size="md"
                      />
                      <p className="text-white font-bold text-xs md:text-sm mt-2 truncate">{connection?.follower_name || 'Viajante'}</p>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {currentUser && profileUser && !isOwnProfile && (
        <>
          <ProfileMagicModal
            isOpen={showMagicModal}
            onClose={() => setShowMagicModal(false)}
            currentUser={currentUser}
            profileUser={profileUser}
          />

          <TestimonialModal
            isOpen={showTestimonialModal}
            onClose={() => setShowTestimonialModal(false)}
            currentUser={currentUser}
            profileUser={profileUser}
          />

          <DonateModal
            isOpen={showDonateModal}
            onClose={() => setShowDonateModal(false)}
            currentUser={currentUser}
            recipientUser={profileUser}
          />

          <SendRavenModal
            isOpen={showRavenModal}
            onClose={() => setShowRavenModal(false)}
            currentUser={currentUser}
            recipient={profileUser}
          />
        </>
      )}

      <SkinDetailModal
        skin={selectedSkin}
        owned={selectedSkinOwned}
        equipped={selectedSkinEquipped}
        isOpen={showSkinModal}
        onClose={() => {
          setShowSkinModal(false);
          setSelectedSkin(null);
        }}
        onBuy={() => buySkinMutation.mutate(selectedSkin.id)}
        onEquip={() => equipSkinMutation.mutate(selectedSkin.id)}
        buying={buySkinMutation.isPending}
        equipping={equipSkinMutation.isPending}
        userOuros={currentUser?.ouros || 0}
      />
    </div>
  );
}
