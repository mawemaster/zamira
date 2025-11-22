
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Crown, TrendingUp, Calendar, ChevronRight, Send, Loader2, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

import PostCard from "../components/community/PostCard";
import CreatePostModal from "../components/community/CreatePostModal";
import MysticImageBanner from "../components/MysticImageBanner";
import MysticInfo from "../components/MysticInfo";
import AdCarousel from "../components/ads/AdCarousel";

const archetypeColors = {
  bruxa_natural: "#9333EA",
  sabio: "#F59E0B",
  guardiao_astral: "#3B82F6",
  xama: "#10B981",
  navegador_cosmico: "#8B5CF6",
  alquimista: "#6366F1",
  none: "#64748B"
};

// Função para pegar saudação baseada no horário de São Paulo
const getGreetingByTime = () => {
  const now = new Date();
  const saoPauloTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  const hour = saoPauloTime.getHours();
  
  if (hour >= 6 && hour < 12) return "Bom dia";
  if (hour >= 12 && hour < 18) return "Boa tarde";
  return "Boa noite";
};

export default function HubPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsSticky(scrollTop > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      const timeBasedGreeting = getGreetingByTime();
      setGreeting(timeBasedGreeting);
      
      checkDailyBlessing(currentUser);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    }
  };

  const checkDailyBlessing = async (currentUser) => {
    const today = new Date().toISOString().split('T')[0];
    const lastBlessing = currentUser.last_daily_blessing;

    if (lastBlessing !== today) {
      const newStreak = lastBlessing === new Date(Date.now() - 86400000).toISOString().split('T')[0]
        ? (currentUser.daily_streak || 0) + 1
        : 1;

      await base44.auth.updateMe({
        last_daily_blessing: today,
        daily_streak: newStreak,
        xp: (currentUser.xp || 0) + 10,
        ouros: (currentUser.ouros || 0) + 1
      });

      setUser({
        ...currentUser,
        last_daily_blessing: today,
        daily_streak: newStreak,
        xp: (currentUser.xp || 0) + 10,
        ouros: (currentUser.ouros || 0) + 1
      });
    }
  };

  const { data: todayEvents } = useQuery({
    queryKey: ['lunarEvents', user?.id, format(new Date(), 'yyyy-MM-dd')],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const allEvents = await base44.entities.LunarEvent.filter({ user_id: user.id });
      const today = new Date();
      
      return allEvents.filter(event => 
        isSameDay(new Date(event.event_date), today)
      );
    },
    enabled: !!user?.id,
    initialData: [],
  });

  // Infinite Query para posts com paginação - OTIMIZADO
  const {
    data: postsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch: refetchPosts
  } = useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: async ({ pageParam = 0 }) => {
      const posts = await base44.entities.Post.list("-created_date", 20, pageParam);
      return {
        posts: posts || [],
        nextCursor: posts && posts.length === 20 ? pageParam + 20 : undefined
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
    staleTime: 30000,
    gcTime: 300000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const allPosts = postsData?.pages.flatMap(page => page.posts).filter(p => p && p.id) || [];

  const createPostMutation = useMutation({
    mutationFn: async (postData) => {
      if (!user?.id) throw new Error("User not found");

      const newPost = await base44.entities.Post.create({
        ...postData,
        author_id: user.id,
        author_name: user.display_name || user.full_name,
        author_username: user.username || user.id,
        author_avatar: user.avatar_url,
        author_level: user.level || 1,
        author_archetype: user.archetype || 'none',
        author_title: user.mystical_title || '',
        reactions: {
          inspirador: 0,
          mistico: 0,
          gratidao: 0,
          poderoso: 0,
          curativo: 0
        },
        reactions_by_user: {},
        comments_count: 0,
        shares_count: 0
      });

      const followers = await base44.entities.Connection.filter(
        { following_id: user.id },
        "-created_date",
        100
      );

      const notificationPromises = followers.map(follower =>
        base44.entities.Notification.create({
          user_id: follower.follower_id,
          type: "announcement",
          title: "Nova Publicação!",
          message: `${user.display_name || user.full_name} criou uma nova publicação`,
          from_user_id: user.id,
          from_user_name: user.display_name || user.full_name,
          from_user_avatar: user.avatar_url,
          related_entity_type: "post",
          related_entity_id: newPost.id,
          action_url: "/Hub"
        })
      );

      await Promise.all(notificationPromises);

      return newPost;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      refetchPosts(); // Refetch the infinite query to include the new post
      setShowCreateModal(false);
      
      if (user?.xp !== undefined) {
        await base44.auth.updateMe({
          xp: (user.xp || 0) + 5
        });
      }
    },
  });

  const handleCreatePost = (postData) => {
    createPostMutation.mutate(postData);
  };

  // Auto-scroll para carregar mais posts
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1000 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#02031C] via-slate-900 to-[#02031C]">
        <Sparkles className="w-12 h-12 text-purple-500 animate-pulse" />
      </div>
    );
  }

  const userName = user.display_name || user.full_name?.split(' ')[0] || 'Viajante';
  const archColor = archetypeColors[user.archetype || 'none'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#02031C] via-slate-900 to-[#02031C] text-white p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 md:mb-6"
        >
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1 md:mb-2" style={{ color: archColor }}>
            {greeting.toUpperCase()}, {userName.toUpperCase()}!
          </h1>
          <p className="text-gray-400 text-xs md:text-sm lg:text-base">
            Sua jornada mística continua aqui.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4 md:mb-6"
        >
          {todayEvents && todayEvents.length > 0 ? (
            <Card className="bg-gradient-to-br from-blue-900/40 via-blue-800/30 to-blue-900/40 border-blue-500/30 p-4 md:p-5">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-600/30 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm md:text-base font-bold text-blue-300 mb-2">
                    Eventos de Hoje no Planner Lunar
                  </h3>
                  
                  <div className="space-y-2">
                    {todayEvents.slice(0, 3).map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex items-center gap-2 md:gap-3"
                      >
                        <div 
                          className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: event.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs md:text-sm text-white font-medium truncate">
                            {event.title}
                          </p>
                          {event.description && (
                            <p className="text-[10px] md:text-xs text-blue-100 truncate">
                              {event.description}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {todayEvents.length > 3 && (
                    <p className="text-xs text-blue-300 mt-2">
                      +{todayEvents.length - 3} outros eventos
                    </p>
                  )}
                </div>
                
                <Link
                  to={createPageUrl("PlannerLunar")}
                  className="flex-shrink-0 text-blue-400 hover:text-blue-300 transition"
                >
                  <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                </Link>
              </div>
            </Card>
          ) : (
            <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700/30 p-4 md:p-5">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-700/30 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 md:w-6 md:h-6 text-slate-400" />
                </div>
                
                <div className="flex-1">
                  <p className="text-xs md:text-sm text-gray-300">
                    Sem eventos importantes em seu{" "}
                    <Link 
                      to={createPageUrl("PlannerLunar")}
                      className="text-purple-400 hover:text-purple-300 underline decoration-dotted underline-offset-2 transition font-medium"
                    >
                      Planner
                    </Link>
                  </p>
                </div>
                
                <Link
                  to={createPageUrl("PlannerLunar")}
                  className="flex-shrink-0 text-slate-400 hover:text-slate-300 transition"
                >
                  <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                </Link>
              </div>
            </Card>
          )}
        </motion.div>

        <MysticInfo user={user} />

        {/* Box Cidade de Zamira - COM IMAGEM DE FUNDO DE CHAMAS AZUIS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-4 md:mb-6"
        >
          <Card 
            className="relative overflow-hidden border-2 border-purple-600/50 cursor-pointer hover:scale-[1.01] md:hover:scale-[1.02] transition-transform group"
            onClick={() => navigate(createPageUrl("ZamiraCity"))}
          >
            {/* NOVA IMAGEM DE FUNDO - Chamas Azuis Místicas */}
            <div className="absolute inset-0">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e5f6f991e09e82bef3795/0dc641ab3_360_F_917051441_rbREv0dfroA7DwJ4BoXjfyqSYZZm32lg.jpg"
                alt="Chamas Místicas de Zamira"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Mantém todos os overlays de gradiente */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-blue-900/70 to-purple-900/80" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50" />
            </div>

            <div className="relative z-10 p-4 md:p-6 lg:p-8 flex items-center gap-4 md:gap-6">
              <motion.div
                animate={{
                  y: [0, -8, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="flex-shrink-0"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-purple-500/50">
                  <span className="text-3xl md:text-4xl lg:text-5xl">🏰</span>
                </div>
              </motion.div>

              <div className="flex-1 min-w-0">
                <h3 className="text-base md:text-xl lg:text-2xl xl:text-3xl font-bold text-white mb-1 md:mb-2 leading-tight">
                  Explore a Cidade de Zamira
                </h3>
                <p className="text-purple-200 text-xs md:text-sm lg:text-base xl:text-lg mb-2 md:mb-4">
                  Entre no metaverso místico e encontre outros viajantes em tempo real!
                </p>
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold px-4 md:px-6 py-1.5 md:py-2 rounded-full text-xs md:text-sm lg:text-base shadow-lg shadow-purple-500/50">
                  Entrar na Cidade
                </Button>
              </div>
            </div>

            {/* Mantém efeito de hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            {/* Mantém partículas flutuantes */}
            <motion.div
              className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400/60 rounded-full blur-[1px]"
              animate={{
                y: [0, -30, 0],
                x: [0, 15, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute top-1/2 right-1/3 w-2 h-2 bg-blue-400/60 rounded-full blur-[1px]"
              animate={{
                y: [0, -40, 0],
                x: [0, -20, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            />
          </Card>
        </motion.div>

        {/* Box Arena */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-4 md:mb-6"
        >
          <Card 
            className="relative overflow-hidden border-2 border-yellow-600/50 cursor-pointer hover:scale-[1.01] md:hover:scale-[1.02] transition-transform group"
            onClick={() => navigate(createPageUrl("ArenaHub"))}
          >
            <div className="absolute inset-0">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e5f6f991e09e82bef3795/1a08dcb11_pngtree-neon-energy-swirls-a-3d-rendered-abstract-magic-portal-with-luminous-image_36050321.jpg"
                alt="Portal Místico"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/70" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40" />
            </div>

            <div className="relative z-10 p-4 md:p-6 lg:p-8 flex items-center gap-4 md:gap-6">
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="flex-shrink-0"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 flex items-center justify-center">
                  <Crown className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.7)]" />
                </div>
              </motion.div>

              <div className="flex-1 min-w-0">
                <h3 className="text-base md:text-xl lg:text-2xl xl:text-3xl font-bold text-white mb-1 md:mb-2 leading-tight">
                  Você ostenta a Coroa do Sábio de Tarot!
                </h3>
                <p className="text-yellow-200 text-xs md:text-sm lg:text-base xl:text-lg mb-2 md:mb-4">
                  Defenda a sua honra e aceite novos desafios.
                </p>
                <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-4 md:px-6 py-1.5 md:py-2 rounded-full text-xs md:text-sm lg:text-base">
                  Entrar na Arena
                </Button>
              </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          </Card>
        </motion.div>

        <MysticImageBanner user={user} />

        {/* CARROSSEL DE ANÚNCIOS - PRIMEIRA POSIÇÃO */}
        <AdCarousel user={user} />

        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              scaleX: isSticky ? [1, 1.02, 1] : 1
            }}
            transition={{ 
              delay: 0.4,
              scaleX: { duration: 0.3 }
            }}
            className={`sticky top-[70px] z-30 mb-0 transition-all duration-300 ${
              isSticky ? 'md:mx-0' : ''
            }`}
          >
            <div className="relative">
              <Card className="relative bg-gradient-to-br from-purple-200 via-blue-100 to-purple-200 border-2 border-purple-300 overflow-hidden"
                style={{
                  borderRadius: '24px',
                  boxShadow: 'none'
                }}
              >
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <motion.div
                    className="absolute w-[200%] h-[3px] bg-gradient-to-r from-transparent via-white/70 to-transparent blur-[2px]"
                    style={{
                      left: '-50%',
                      top: '25%',
                      transform: 'rotate(-12deg)',
                    }}
                    animate={{
                      x: ['-100%', '100%'],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "linear",
                      delay: 0,
                    }}
                  />
                  
                  <motion.div
                    className="absolute w-[200%] h-[2px] bg-gradient-to-r from-transparent via-blue-200/70 to-transparent blur-[1px]"
                    style={{
                      left: '-50%',
                      top: '55%',
                      transform: 'rotate(8deg)',
                    }}
                    animate={{
                      x: ['-100%', '100%'],
                      opacity: [0, 0.9, 0],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear",
                      delay: 2,
                    }}
                  />
                  
                  <motion.div
                    className="absolute w-[200%] h-[2px] bg-gradient-to-r from-transparent via-purple-200/60 to-transparent blur-[1px]"
                    style={{
                      left: '-50%',
                      top: '75%',
                      transform: 'rotate(-5deg)',
                    }}
                    animate={{
                      x: ['-100%', '100%'],
                      opacity: [0, 0.8, 0],
                    }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      ease: "linear",
                      delay: 4,
                    }}
                  />
                  
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20"
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 12,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </div>
                
                <motion.button
                  onClick={() => setShowCreateModal(true)}
                  className="relative z-10 w-full text-left px-4 py-3 md:px-6 md:py-4 rounded-3xl transition-all flex items-center gap-3 md:gap-4"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div 
                    className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center border-[3px] overflow-hidden flex-shrink-0"
                    style={{ 
                      borderColor: archColor,
                      boxShadow: `0 0 15px ${archColor}40`
                    }}
                  >
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Sparkles className="w-6 h-6" style={{ color: archColor }} />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <span className="text-slate-800 text-sm md:text-base font-bold">
                      {userName}, compartilhe com a comunidade
                    </span>
                  </div>
                  
                  <div 
                    className="w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ 
                      backgroundColor: archColor,
                      boxShadow: `0 0 20px ${archColor}60`
                    }}
                  >
                    <Send className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                </motion.button>
              </Card>
            </div>
          </motion.div>
        </div>

        <div className="h-6" />

        <div className="space-y-6">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
            Feed da Comunidade
          </h2>
          <AnimatePresence>
            {isLoading && allPosts.length === 0 ? ( // Only show initial loading if no posts are loaded yet
              <div className="text-center py-12">
                <Sparkles className="w-12 h-12 text-purple-500 animate-pulse mx-auto mb-4" />
                <p className="text-gray-400">Carregando emanações...</p>
              </div>
            ) : allPosts.length === 0 ? ( // Only show "no posts" if not loading AND no posts
              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-purple-900/30 p-12 text-center">
                <TrendingUp className="w-16 h-16 text-purple-500/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-purple-300 mb-2">
                  Seja o primeiro viajante!
                </h3>
                <p className="text-gray-400 mb-6">
                  Inicie a jornada compartilhando a primeira emanação mística
                </p>
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Criar Post
                </Button>
              </Card>
            ) : (
              <>
                {allPosts.map((post) => (
                  post && post.id && user ? (
                    <PostCard key={post.id} post={post} currentUser={user} />
                  ) : null
                ))}
                
                {/* Indicador de carregamento de mais posts */}
                {hasNextPage && (
                  <div className="text-center py-8">
                    {isFetchingNextPage ? (
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                        <p className="text-gray-400 text-sm">Carregando mais emanações...</p>
                      </div>
                    ) : (
                      <Button
                        onClick={() => fetchNextPage()}
                        variant="outline"
                        className="border-purple-500/30 text-purple-300 hover:bg-purple-900/20"
                      >
                        Carregar Mais Posts
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {showCreateModal && user && (
        <CreatePostModal
          user={user}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreatePost}
          isLoading={createPostMutation.isPending}
        />
      )}
    </div>
  );
}
