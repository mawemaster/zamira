import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, Search, Trash2, Heart, MessageSquare, Activity, Wand2, X, Send, Plus, Minus
} from "lucide-react";
import { motion } from "framer-motion";

export default function PostsTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [showMagicModal, setShowMagicModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [reactionChanges, setReactionChanges] = useState({});
  const queryClient = useQueryClient();

  const { data: posts, isLoading } = useQuery({
    queryKey: ['admin-posts-all'],
    queryFn: () => base44.entities.Post.list("-created_date", 500),
    refetchInterval: 5000,
  });

  const deletePostMutation = useMutation({
    mutationFn: async (postId) => {
      return await base44.entities.Post.delete(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts-all'] });
    },
  });

  const updateReactionsMutation = useMutation({
    mutationFn: async ({ postId, reactions }) => {
      return await base44.entities.Post.update(postId, { reactions });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts-all'] });
      setShowMagicModal(false);
      setReactionChanges({});
      setSelectedPost(null);
      alert('✅ Reações atualizadas!');
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async ({ postId, comment }) => {
      const post = posts.find(p => p.id === postId);
      
      // Criar notificação para o autor
      await base44.entities.Notification.create({
        user_id: post.author_id,
        type: 'comment',
        title: '💬 Novo Comentário',
        message: `Admin Zamira comentou em seu post`,
        from_user_id: 'admin',
        from_user_name: 'Admin Zamira',
        related_entity_type: 'post',
        related_entity_id: postId
      });

      // Atualizar contador de comentários
      return await base44.entities.Post.update(postId, {
        comments_count: (post.comments_count || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts-all'] });
      setShowCommentModal(false);
      setCommentText("");
      setSelectedPost(null);
      alert('✅ Comentário adicionado!');
    },
  });

  const filteredPosts = posts?.filter(post => {
    const query = searchQuery.toLowerCase();
    return (
      post.content?.toLowerCase().includes(query) ||
      post.author_name?.toLowerCase().includes(query)
    );
  }) || [];

  const handleDelete = (postId) => {
    if (confirm('Tem certeza que deseja deletar este post?')) {
      deletePostMutation.mutate(postId);
    }
  };

  const handleOpenMagic = (post) => {
    setSelectedPost(post);
    setReactionChanges(post.reactions || {
      sparkle: 0,
      crystal_ball: 0,
      pray: 0,
      fire: 0,
      water: 0
    });
    setShowMagicModal(true);
  };

  const handleOpenComment = (post) => {
    setSelectedPost(post);
    setShowCommentModal(true);
  };

  const handleReactionChange = (type, delta) => {
    setReactionChanges({
      ...reactionChanges,
      [type]: Math.max(0, (reactionChanges[type] || 0) + delta)
    });
  };

  const handleSaveReactions = () => {
    if (selectedPost) {
      updateReactionsMutation.mutate({
        postId: selectedPost.id,
        reactions: reactionChanges
      });
    }
  };

  const handleAddComment = () => {
    if (selectedPost && commentText.trim()) {
      addCommentMutation.mutate({
        postId: selectedPost.id,
        comment: commentText
      });
    }
  };

  const getTotalReactions = (post) => {
    if (!post.reactions) return 0;
    return Object.values(post.reactions).reduce((sum, val) => sum + val, 0);
  };

  const reactionEmojis = {
    sparkle: '✨',
    crystal_ball: '🔮',
    pray: '🙏',
    fire: '🔥',
    water: '💧'
  };

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Gerenciar Posts</h2>
        <p className="text-slate-600">{filteredPosts.length} posts encontrados</p>
      </div>

      <Card className="bg-white border-slate-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar posts..."
            className="pl-10 border-slate-300"
          />
        </div>
      </Card>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-purple-600 animate-pulse mx-auto mb-4" />
            <p className="text-slate-600">Carregando posts...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <Card className="bg-white border-slate-200 p-12 text-center">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">Nenhum post encontrado</p>
          </Card>
        ) : (
          filteredPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
            >
              <Card className="bg-white border-slate-200 p-4 hover:shadow-md transition">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                    {post.author_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-bold text-slate-900">{post.author_name}</p>
                      {post.author_level && (
                        <Badge variant="outline" className="text-xs">
                          Nv {post.author_level}
                        </Badge>
                      )}
                      <Badge className="bg-purple-100 text-purple-800 border-purple-300 capitalize text-xs">
                        {post.post_type || 'simples'}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-700 mb-3 line-clamp-3">
                      {post.content}
                    </p>
                    {post.images && post.images.length > 0 && (
                      <div className="flex gap-2 mb-3">
                        {post.images.slice(0, 3).map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt=""
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {getTotalReactions(post)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {post.comments_count || 0}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(post.created_date).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenMagic(post)}
                      className="border-purple-300 text-purple-600"
                    >
                      <Wand2 className="w-4 h-4 mr-2" />
                      Magia
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenComment(post)}
                      className="border-blue-300 text-blue-600"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Comentar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(post.id)}
                      disabled={deletePostMutation.isPending}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal de Magia/Reações */}
      {showMagicModal && selectedPost && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
          <Card className="bg-white max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-purple-600" />
                Controlar Reações
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setShowMagicModal(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-3 mb-4">
              {Object.entries(reactionEmojis).map(([key, emoji]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-lg">{emoji}</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleReactionChange(key, -1)}
                      className="h-8 w-8"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="font-bold text-slate-900 w-12 text-center">
                      {reactionChanges[key] || 0}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleReactionChange(key, 1)}
                      className="h-8 w-8"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={handleSaveReactions}
              disabled={updateReactionsMutation.isPending}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Aplicar Magia
            </Button>
          </Card>
        </div>
      )}

      {/* Modal de Comentário */}
      {showCommentModal && selectedPost && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
          <Card className="bg-white max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Adicionar Comentário
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setShowCommentModal(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg mb-4">
              <p className="text-sm text-slate-700 line-clamp-2">{selectedPost.content}</p>
            </div>

            <Textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Digite seu comentário como Admin Zamira..."
              className="mb-4 h-32"
            />

            <Button
              onClick={handleAddComment}
              disabled={addCommentMutation.isPending || !commentText.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              Publicar Comentário
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}