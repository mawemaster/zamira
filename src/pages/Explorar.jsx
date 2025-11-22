
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Sparkles,
  Users,
  TrendingUp,
  BarChart3,
  Plus,
  CheckCircle,
  UserPlus,
  Flame,
  Star,
  Calendar,
  Clock,
  ShoppingBag,
  Megaphone,
  Crown,
  Award,
  Medal
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, differenceInSeconds, differenceInMinutes, differenceInHours } from "date-fns";
import { ptBR } from "date-fns/locale";
import UserLink from "../components/UserLink";
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

const AnimatedBackground = () => {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    initialX: Math.random() * 100,
    initialY: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 15 + Math.random() * 10,
    size: 1 + Math.random() * 2,
  }));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-purple-400/20 blur-sm"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.initialX}%`,
            top: `${particle.initialY}%`,
          }}
          animate={{
            x: [0, Math.random() * 100 - 50, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, Math.random() * 100 - 50, 0],
            opacity: [0.1, 0.3, 0.2, 0.1],
            scale: [1, 1.5, 1.2, 1],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-purple-900/5 via-transparent to-blue-900/5"
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
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

export default function ExplorarPage() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPollModal, setShowPollModal] = useState(false);
  const [xpNotification, setXpNotification] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const navigate = useNavigate();

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
    queryKey: ['explore-posts'],
    queryFn: () => base44.entities.Post.list("-created_date", 50),
    initialData: [],
  });

  const { data: allUsers } = useQuery({
    queryKey: ['explore-users'],
    queryFn: () => base44.entities.User.list("-created_date", 50),
    initialData: [],
  });

  const { data: polls } = useQuery({
    queryKey: ['polls'],
    queryFn: () => base44.entities.Poll.filter({ is_active: true }, "-created_date", 3),
    initialData: [],
  });

  const { data: products } = useQuery({
    queryKey: ['explore-products'],
    queryFn: () => base44.entities.Product.filter({ is_active: true }, "-created_date", 3),
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
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      setShowPollModal(false);
    },
  });

  const voteMutation = useMutation({
    mutationFn: async ({ pollId, optionId }) => {
      const poll = polls.find(p => p.id === pollId);
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

      await base44.auth.updateMe({
        xp: newXP
      });

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
      queryClient.invalidateQueries({ queryKey: ['polls'] });
    },
  });

  const newMembers = allUsers.slice(0, 10);

  const topUsers = allUsers
    .sort((a, b) => {
      const levelDiff = (b.level || 0) - (a.level || 0);
      if (levelDiff !== 0) return levelDiff;
      return (b.xp || 0) - (a.xp || 0);
    })
    .slice(0, 5);

  const trendingPosts = posts
    .map(post => {
      const totalReactions = Object.values(post.reactions || {}).reduce((sum, count) => sum + count, 0);
      const interactionScore = totalReactions + (post.comments_count || 0) * 2 + (post.shares_count || 0) * 3;
      return { ...post, interactionScore };
    })
    .sort((a, b) => b.interactionScore - a.interactionScore)
    .slice(0, 5);

  const filteredPosts = searchTerm
    ? posts.filter(post =>
        post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.author_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : posts;

  const filteredUsers = searchTerm
    ? allUsers.filter(u =>
        u.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const handleVote = (pollId, optionId) => {
    voteMutation.mutate({ pollId, optionId });
  };

  const handleCreatePoll = (pollData) => {
    createPollMutation.mutate(pollData);
  };

  const handlePostClick = (postId) => {
    navigate(createPageUrl("Hub"));
    setTimeout(() => {
      const postElement = document.getElementById(`post-${postId}`);
      if (postElement) {
        postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const categories = [
    { id: "Todos", label: "Todos", icon: "🌟" },
    { id: "Jornada do Viajante", label: "Jornada", icon: "📈" },
    { id: "Ferramentas Místicas", label: "Ferramentas", icon: "🔮" },
    { id: "Comunidade & Conexão", label: "Comunidade", icon: "👥" },
    { id: "Conhecimento", label: "Conhecimento", icon: "📚" },
    { id: "Personalização", label: "Personalização", icon: "⚙️" }
  ];

  if (!user?.id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Sparkles className="w-12 h-12 text-purple-500 animate-pulse" />
      </div>
    );
  }

  const getRankIcon = (index) => {
    if (index === 0) return { icon: Crown, color: "from-yellow-500 to-yellow-600", text: "text-yellow-400" };
    if (index === 1) return { icon: Award, color: "from-gray-400 to-gray-500", text: "text-gray-300" };
    if (index === 2) return { icon: Medal, color: "from-orange-500 to-orange-600", text: "text-orange-400" };
    return { icon: Star, color: "from-purple-500 to-purple-600", text: "text-purple-400" };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a2e] to-[#0a0a1a] relative">
      <AnimatedBackground />

      <div className="max-w-7xl mx-auto px-4 py-6 pb-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4">
              Explorar
            </h1>
            <p className="text-gray-300 text-base md:text-lg">
              Bússola Cósmica - descubra conteúdo e viajantes
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <Card className="bg-gradient-to-br from-purple-900/30 via-purple-800/20 to-pink-900/30 border-purple-500/40 overflow-hidden backdrop-blur-sm">
              <div className="p-4 md:p-6">
                <div className="flex flex-col items-center text-center mb-4 md:mb-6">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-3 md:mb-4">
                    <Megaphone className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white">
                    Quadro de Avisos - Zamira
                  </h3>
                </div>

                <div className="bg-purple-900/40 p-4 md:p-6 rounded-lg border border-purple-500/30 text-center">
                  <p className="text-purple-100 text-sm md:text-base leading-relaxed mb-3 md:mb-4">
                    <strong className="text-white text-base md:text-lg block mb-2 md:mb-3">💜 Bem-vindos à versão BETA!</strong>
                    Agradecemos imensamente a todos que estão testando e contribuindo para o crescimento do Zamira.
                    Suas opiniões e feedbacks são essenciais para criarmos a melhor experiência mística possível.
                    Que a jornada seja repleta de descobertas! ✨
                  </p>
                  <p className="text-xs md:text-sm text-purple-200">
                    - Equipe Zamira | {format(new Date(), "d 'de' MMMM", { locale: ptBR })}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* FILTRO POR CATEGORIAS - DROPDOWN EM TELAS PEQUENAS */}
          <div className="mb-6">
            {/* Mobile: Dropdown */}
            <div className="md:hidden">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-800 border border-purple-500/30 text-white rounded-lg px-4 py-3 text-sm font-semibold focus:outline-none focus:border-purple-500"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Desktop: Botões */}
            <div className="hidden md:flex gap-3 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                    selectedCategory === cat.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative max-w-2xl mx-auto mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar posts, pessoas..."
              className="pl-12 bg-slate-800/50 border-purple-900/30 text-gray-200 placeholder:text-gray-500 h-14 rounded-xl text-base backdrop-blur-sm"
            />
          </div>

          {searchTerm && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="bg-slate-900/50 border-purple-900/30 p-4 mb-6 backdrop-blur-sm">
                <h3 className="text-sm font-semibold text-purple-300 mb-3">
                  Resultados da Busca
                </h3>

                {filteredUsers.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 mb-2">Pessoas</p>
                    <div className="space-y-2">
                      {filteredUsers.slice(0, 5).map((u) => (
                        <UserLink key={u.id} user={{ id: u.id, username: u.username }}>
                          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition cursor-pointer">
                            <div
                              className="w-10 h-10 rounded-full border-2 overflow-hidden"
                              style={{ borderColor: archetypeColors[u.archetype || 'none'] }}
                            >
                              {u.avatar_url ? (
                                <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                                  <Sparkles className="w-5 h-5" style={{ color: archetypeColors[u.archetype || 'none'] }} />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-white">{u.display_name || u.full_name}</p>
                              <p className="text-xs text-gray-400">Nível {u.level || 1}</p>
                            </div>
                          </div>
                        </UserLink>
                      ))}
                    </div>
                  </div>
                )}

                {filteredPosts.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 mb-2">Posts</p>
                    <p className="text-sm text-gray-300">{filteredPosts.length} posts encontrados</p>
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </motion.div>

        {!searchTerm && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-white" />
                  </div>
                  Novos Viajantes
                </h2>
              </div>

              <div className="overflow-x-auto pb-4 -mx-4 px-4">
                <div className="flex gap-4 min-w-max">
                  {newMembers.map((u, index) => {
                    const archColor = archetypeColors[u.archetype || 'none'];
                    return (
                      <motion.div
                        key={u.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <UserLink user={{ id: u.id, username: u.username }}>
                          <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-purple-900/30 p-4 hover:border-purple-700/50 transition cursor-pointer w-32 backdrop-blur-sm">
                            <div className="text-center">
                              <div
                                className="w-16 h-16 rounded-full mx-auto mb-3 border-2 overflow-hidden"
                                style={{ borderColor: archColor }}
                              >
                                {u.avatar_url ? (
                                  <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                                    <Sparkles className="w-8 h-8" style={{ color: archColor }} />
                                  </div>
                                )}
                              </div>
                              <h3
                                className="font-bold text-xs mb-1 truncate"
                                style={{ color: archColor }}
                              >
                                {u.display_name || u.full_name?.split(' ')[0]}
                              </h3>
                              <p className="text-[10px] text-gray-400">Nível {u.level || 1}</p>
                            </div>
                          </Card>
                        </UserLink>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {products && products.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-600 to-rose-600 flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-white" />
                    </div>
                    Novos na Loja
                  </h2>
                  <Button
                    onClick={() => navigate(createPageUrl("Loja"))}
                    variant="outline"
                    className="border-purple-500/30 text-purple-300 hover:bg-purple-900/20"
                  >
                    Ver Tudo
                  </Button>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {products.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                    >
                      <Card
                        onClick={() => navigate(createPageUrl(`Produto?id=${product.id}`))}
                        className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-purple-900/30 overflow-hidden hover:border-purple-700/50 transition cursor-pointer backdrop-blur-sm"
                      >
                        <div className="aspect-square overflow-hidden">
                          {product.images && product.images[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-900/30 to-pink-900/30 flex items-center justify-center">
                              <ShoppingBag className="w-12 h-12 text-purple-400" />
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 bg-pink-500/20 text-pink-300 text-[10px] font-bold rounded-full">
                              NOVO
                            </span>
                            <span className="text-xs text-purple-300">{product.category}</span>
                          </div>
                          <h3 className="font-bold text-white mb-1 line-clamp-1">{product.name}</h3>
                          <p className="text-sm text-gray-400 line-clamp-2 mb-2">{product.short_description}</p>
                          <p className="text-lg font-bold text-purple-300">
                            R$ {product.price?.toFixed(2)}
                          </p>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mb-8"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-white" />
                      </div>
                      Últimas Enquetes
                    </h2>
                    <Button
                      onClick={() => setShowPollModal(true)}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Criar Enquete
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {polls.length === 0 ? (
                      <Card className="bg-slate-900/50 border-purple-900/30 p-12 text-center backdrop-blur-sm">
                        <div className="flex flex-col items-center">
                          <BarChart3 className="w-16 h-16 text-purple-500/50 mb-4" />
                          <p className="text-gray-400 text-lg mb-4">Nenhuma enquete ativa no momento</p>
                          <Button
                            onClick={() => setShowPollModal(true)}
                            className="bg-gradient-to-r from-purple-600 to-pink-600"
                          >
                            Criar a Primeira Enquete
                          </Button>
                        </div>
                      </Card>
                    ) : (
                      polls.map((poll, index) => {
                        const userVoted = poll.votes_by_user?.[user.id];
                        const expiresAt = new Date(poll.expires_at);
                        const isExpired = expiresAt < new Date();

                        return (
                          <motion.div
                            key={poll.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 + index * 0.1 }}
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
                      })
                    )}
                  </div>

                  {polls.length > 0 && (
                    <div className="mt-6 text-center">
                      <Button
                        onClick={() => navigate(createPageUrl("Enquetes"))}
                        variant="outline"
                        className="border-purple-500/30 text-purple-300 hover:bg-purple-900/20"
                      >
                        Ver Todas as Enquetes
                      </Button>
                    </div>
                  )}
                </motion.div>
              </div>

              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="mb-6"
                >
                  <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-600 to-orange-600 flex items-center justify-center">
                      <Flame className="w-4 h-4 text-white" />
                    </div>
                    Top Viajantes
                  </h2>

                  <div className="space-y-3">
                    {topUsers.map((u, index) => {
                      if (!u?.id) return null;
                      const archColor = archetypeColors[u.archetype || 'none'];
                      const rankInfo = getRankIcon(index);
                      const RankIcon = rankInfo.icon;

                      return (
                        <motion.div
                          key={u.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + index * 0.05 }}
                        >
                          <UserLink user={{ id: u.id, username: u.username }}>
                            <Card className={`bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-purple-900/30 p-3 md:p-4 hover:border-purple-700/50 transition cursor-pointer backdrop-blur-sm ${
                              index < 3 ? 'ring-2 ring-opacity-50' : ''
                            } ${
                              index === 0 ? 'ring-yellow-500/50' :
                              index === 1 ? 'ring-gray-400/50' :
                              index === 2 ? 'ring-orange-500/50' : ''
                            }`}>
                              <div className="flex items-center gap-3">
                                <div className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br ${rankInfo.color} shadow-lg flex-shrink-0`}>
                                  {index < 3 ? (
                                    <RankIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                                  ) : (
                                    <span className="font-bold text-white text-xs md:text-sm">{index + 1}</span>
                                  )}
                                </div>
                                <div
                                  className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 overflow-hidden flex-shrink-0"
                                  style={{ borderColor: archColor }}
                                >
                                  {u.avatar_url ? (
                                    <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                                      <Sparkles className="w-5 h-5 md:w-6 md:h-6" style={{ color: archColor }} />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3
                                    className={`font-bold text-xs md:text-sm truncate text-white ${index < 3 ? rankInfo.text : ''}`}
                                  >
                                    {u.display_name || u.full_name}
                                  </h3>
                                  <div className="flex items-center gap-2 text-[10px] md:text-xs text-gray-300">
                                    <span>Nv. {u.level || 1}</span>
                                    <span>•</span>
                                    <span>{u.xp || 0} XP</span>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          </UserLink>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <h2 className="text-xl font-bold text-white flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-600 to-rose-600 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    Posts em Alta
                  </h2>

                  <div className="space-y-3">
                    {trendingPosts.map((post, index) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1 + index * 0.05 }}
                      >
                        <Card
                          onClick={() => handlePostClick(post.id)}
                          className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-purple-900/30 p-3 hover:border-purple-700/50 transition cursor-pointer backdrop-blur-sm"
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className="w-10 h-10 rounded-full border-2 flex-shrink-0 overflow-hidden"
                              style={{ borderColor: archetypeColors[post.author_archetype || 'none'] }}
                            >
                              {post.author_avatar ? (
                                <img src={post.author_avatar} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                                  <Sparkles className="w-5 h-5 text-purple-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4
                                className="font-semibold text-sm mb-1"
                                style={{ color: archetypeColors[post.author_archetype || 'none'] }}
                              >
                                {post.author_name}
                              </h4>
                              <p className="text-xs text-gray-300 line-clamp-2 mb-2">
                                {post.content}
                              </p>
                              <div className="flex items-center gap-3 text-[10px] text-gray-400">
                                <span>❤️ {Object.values(post.reactions || {}).reduce((a, b) => a + b, 0)}</span>
                                <span>💬 {post.comments_count || 0}</span>
                                <span>🔄 {post.shares_count || 0}</span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </>
        )}
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
