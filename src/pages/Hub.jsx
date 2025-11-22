import React, { useState, useEffect } from "react";
import { supabase } from "../api/supabaseClient"; // Conexão Supabase
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Crown, Calendar, ChevronRight, Loader2, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Tente importar seus componentes antigos. 
// Se algum der erro de "não encontrado", comente a linha.
import PostCard from "../components/community/PostCard"; 
import CreatePostModal from "../components/community/CreatePostModal";
import MysticImageBanner from "../components/MysticImageBanner";
import MysticInfo from "../components/MysticInfo";
// import AdCarousel from "../components/ads/AdCarousel"; // Comentei pois não vi a pasta ads na sua print

const archetypeColors = {
  bruxa_natural: "#9333EA", sabio: "#F59E0B", guardiao_astral: "#3B82F6",
  xama: "#10B981", navegador_cosmico: "#8B5CF6", alquimista: "#6366F1", none: "#64748B"
};

const getGreetingByTime = () => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return "Bom dia";
  if (hour >= 12 && hour < 18) return "Boa tarde";
  return "Boa noite";
};

export default function HubPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [isSticky, setIsSticky] = useState(false);

  // 1. Carregar Usuário e Perfil
  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Busca dados extras do perfil
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          const fullUser = { ...session.user, ...profile };
          setUser(fullUser);
          setGreeting(getGreetingByTime());
        }
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
      } finally {
        setLoadingUser(false);
      }
    };

    loadUser();
  }, []);

  // 2. Carregar Posts
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoadingPosts(true);
    try {
      // Busca posts e tenta buscar dados do autor (se houver relacionamento configurado)
      // Por enquanto pegamos o post puro
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // ADAPTADOR: Transforma os dados do Supabase no formato que seu PostCard antigo espera
      const adaptedPosts = data.map(post => ({
        ...post,
        created_date: post.created_at, // O código antigo usava created_date
        author_name: "Viajante", // Como ainda não fizemos o "join" com perfis, vai aparecer genérico
        author_avatar: null, 
        likes_count: post.likes_count || 0,
        comments_count: 0
      }));

      setPosts(adaptedPosts);
    } catch (error) {
      console.error("Erro ao buscar posts:", error);
    } finally {
      setLoadingPosts(false);
    }
  };

  // 3. Criar Post
  const handleCreatePost = async (postData) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('posts')
        .insert([{
          content: postData.content, // Ajuste conforme seu modal retorna os dados
          user_id: user.id,
          likes_count: 0
        }]);

      if (error) throw error;

      setShowCreateModal(false);
      fetchPosts(); // Recarrega a lista
      
      // Dá um XPzinho (Opcional)
      // await supabase.rpc('increment_xp', { amount: 5 }); 

    } catch (error) {
      alert("Erro ao criar post: " + error.message);
    }
  };

  // Efeito de Scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- RENDERIZAÇÃO ---

  if (loadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#02031C] via-slate-900 to-[#02031C]">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  const userName = user?.display_name || user?.email?.split('@')[0] || 'Viajante';
  const archColor = archetypeColors[user?.archetype] || archetypeColors.none;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#02031C] via-slate-900 to-[#02031C] text-white p-4 md:p-6 pb-24">
      <div className="max-w-4xl mx-auto">
        
        {/* Cabeçalho Saudação */}
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

        {/* Banner e Infos (Se os componentes existirem) */}
        <div className="space-y-6">
            {/* Se der erro nesses componentes, comente as linhas abaixo */}
            <MysticInfo user={user} />
            <MysticImageBanner user={user} /> 
        </div>

        <div className="h-6" />

        {/* FEED */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
                Feed da Comunidade
            </h2>
            <Button 
                onClick={() => setShowCreateModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                size="sm"
            >
                Criar Post
            </Button>
          </div>

          <AnimatePresence>
            {loadingPosts ? (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Carregando emanações...</p>
              </div>
            ) : posts.length === 0 ? (
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
              <div className="space-y-4">
                {posts.map((post) => (
                    // Usando o PostCard antigo se ele existir e aceitar a prop 'post'
                    <PostCard key={post.id} post={post} currentUser={user} />
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modal de Criação */}
      {showCreateModal && (
        <CreatePostModal
          user={user}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreatePost}
          isLoading={false}
        />
      )}
    </div>
  );
}