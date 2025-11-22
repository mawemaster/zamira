import React, { useState, useEffect } from "react";
import { supabase } from "../api/supabaseClient";
import { motion } from "framer-motion";
import { Send, Heart, MessageCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserAvatar from "@/components/UserAvatar"; // Certifique-se que este componente existe ou remova se der erro

export default function Hub() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // 1. Carregar Usuário e Posts ao abrir
  useEffect(() => {
    fetchUserAndPosts();
  }, []);

  const fetchUserAndPosts = async () => {
    setLoading(true);
    
    // Pega o usuário atual
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    // Busca os posts do banco (do mais novo para o mais velho)
    const { data, error } = await supabase
      .from('posts')
      .select('*') // Em breve faremos o join com profiles para mostrar nome e foto
      .order('created_at', { ascending: false });

    if (!error) {
      setPosts(data);
    }
    setLoading(false);
  };

  // 2. Função de Publicar
  const handlePublish = async () => {
    if (!newPost.trim() || !user) return;

    const { error } = await supabase
      .from('posts')
      .insert([{ 
        content: newPost, 
        user_id: user.id 
      }]);

    if (error) {
      alert("Erro ao postar: " + error.message);
    } else {
      setNewPost(""); // Limpa o campo
      fetchUserAndPosts(); // Atualiza a lista
    }
  };

  // 3. Função de Deletar (Só aparece para o dono)
  const handleDelete = async (postId) => {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);
      
    if (!error) fetchUserAndPosts();
  };

  return (
    <div className="min-h-screen p-4 space-y-6 pt-6 pb-24">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Feed Místico</h1>
      </div>

      {/* Área de Criar Post */}
      <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
        <div className="flex gap-3">
          <div className="flex-1">
            <Input 
              placeholder="O que os astros dizem hoje?" 
              className="bg-transparent border-none text-white placeholder:text-gray-500 focus-visible:ring-0"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
            />
          </div>
          <Button 
            size="icon" 
            onClick={handlePublish}
            className="bg-purple-600 hover:bg-purple-700 rounded-full h-10 w-10"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Lista de Posts */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-center text-gray-500 animate-pulse">Consultando os oráculos...</p>
        ) : posts.length === 0 ? (
          <div className="text-center p-8 bg-white/5 rounded-xl">
            <p className="text-gray-400">O silêncio reina aqui. Seja o primeiro a falar!</p>
          </div>
        ) : (
          posts.map((post) => (
            <motion.div 
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#1e1b4b]/50 p-4 rounded-2xl border border-white/5 backdrop-blur-sm"
            >
              {/* Cabeçalho do Post */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500" />
                  <div>
                    <p className="text-sm font-semibold text-white">Viajante</p>
                    <p className="text-[10px] text-gray-400">
                      {new Date(post.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
                {user && user.id === post.user_id && (
                  <button onClick={() => handleDelete(post.id)} className="text-gray-600 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Conteúdo */}
              <p className="text-gray-200 text-sm mb-4 leading-relaxed">
                {post.content}
              </p>

              {/* Ações (Like/Comentar - Visual por enquanto) */}
              <div className="flex items-center gap-4 pt-2 border-t border-white/5">
                <button className="flex items-center gap-1 text-gray-400 hover:text-pink-500 transition">
                  <Heart className="w-4 h-4" />
                  <span className="text-xs">{post.likes_count || 0}</span>
                </button>
                <button className="flex items-center gap-1 text-gray-400 hover:text-blue-400 transition">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-xs">Comentar</span>
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}