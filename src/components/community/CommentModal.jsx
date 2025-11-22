
import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Send, Sparkles, Heart, Reply } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import UserLink from "../UserLink";
import UserAvatar from "../UserAvatar";

const archetypeColors = {
  bruxa_natural: "#9333EA",
  sabio: "#F59E0B",
  guardiao_astral: "#3B82F6",
  xama: "#10B981",
  navegador_cosmico: "#8B5CF6",
  alquimista: "#6366F1",
  none: "#64748B"
};

function CommentItem({ comment, currentUser, onReply, level = 0 }) {
  // Validação essencial
  if (!comment?.id || !currentUser?.id) return null;

  const archColor = archetypeColors[comment.author_archetype] || archetypeColors.none;
  const [showReplies, setShowReplies] = useState(false);
  const queryClient = useQueryClient();

  const { data: replies } = useQuery({
    queryKey: ['comment-replies', comment.id],
    queryFn: () => base44.entities.Comment.filter(
      { parent_comment_id: comment.id },
      "created_date",
      50
    ),
    initialData: [],
    enabled: showReplies
  });

  const likeCommentMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser?.id || !comment?.id) return;

      const newReactionsByUser = { ...(comment.reactions_by_user || {}) };
      const newReactions = { ...(comment.reactions || {}) };
      const userReaction = newReactionsByUser[currentUser.id];

      if (userReaction) {
        delete newReactionsByUser[currentUser.id];
        newReactions.like = Math.max(0, (newReactions.like || 0) - 1);
      } else {
        newReactionsByUser[currentUser.id] = 'like';
        newReactions.like = (newReactions.like || 0) + 1;
      }

      await base44.entities.Comment.update(comment.id, {
        reactions: newReactions,
        reactions_by_user: newReactionsByUser
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-comments'] });
      queryClient.invalidateQueries({ queryKey: ['comment-replies'] });
    }
  });

  const userReacted = comment.reactions_by_user?.[currentUser.id];
  const totalReactions = comment.reactions?.like || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${level > 0 ? 'ml-8 md:ml-12 border-l-2 border-purple-900/30 pl-3 md:pl-4' : ''}`}
    >
      <div className="flex gap-2 md:gap-3 mb-3 md:mb-4">
        <UserLink user={{ id: comment.author_id, username: comment.author_username }}>
          <UserAvatar
            user={{
              avatar_url: comment.author_avatar,
              archetype: comment.author_archetype
            }}
            size="sm"
            showStatus={false}
          />
        </UserLink>

        <div className="flex-1 min-w-0">
          <div className="bg-slate-800/50 rounded-2xl p-3 md:p-4">
            <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
              <UserLink user={{ id: comment.author_id, username: comment.author_username }}>
                <span className="font-bold text-sm md:text-base" style={{ color: archColor }}>
                  {comment.author_name}
                </span>
              </UserLink>
              <span className="text-[10px] md:text-xs text-gray-500">
                • Nv.{comment.author_level}
              </span>
            </div>

            <p className="text-gray-200 text-sm md:text-base leading-relaxed mb-2 md:mb-3">
              {comment.content}
            </p>

            <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-400">
              <span>
                {format(new Date(comment.created_date), "d 'de' MMM 'às' HH:mm", { locale: ptBR })}
              </span>

              <button
                onClick={() => likeCommentMutation.mutate()}
                className={`flex items-center gap-1 hover:text-pink-400 transition ${
                  userReacted ? 'text-pink-400' : ''
                }`}
              >
                <Heart className={`w-3.5 h-3.5 md:w-4 md:h-4 ${userReacted ? 'fill-current' : ''}`} />
                {totalReactions > 0 && <span>{totalReactions}</span>}
              </button>

              <button
                onClick={() => onReply(comment)}
                className="flex items-center gap-1 hover:text-blue-400 transition"
              >
                <Reply className="w-3.5 h-3.5 md:w-4 md:h-4" />
                Responder
              </button>
            </div>
          </div>

          {/* Mostrar replies */}
          {replies && replies.length > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="text-xs md:text-sm text-purple-400 hover:text-purple-300 mt-2 ml-2"
            >
              {showReplies ? 'Ocultar' : 'Ver'} {replies.length} {replies.length === 1 ? 'resposta' : 'respostas'}
            </button>
          )}
        </div>
      </div>

      {/* Renderizar replies */}
      <AnimatePresence>
        {showReplies && replies && replies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {replies.map(reply => (
              <CommentItem
                key={reply.id}
                comment={reply}
                currentUser={currentUser}
                onReply={onReply}
                level={level + 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function CommentModal({ isOpen, onClose, post, currentUser }) {
  // Validação essencial
  if (!post?.id || !currentUser?.id) return null;

  const [comment, setComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const textareaRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: comments, isLoading } = useQuery({
    queryKey: ['post-comments', post.id],
    queryFn: () => base44.entities.Comment.filter(
      { post_id: post.id, parent_comment_id: null }, // Fetch only top-level comments
      "-created_date", // Sort by creation date descending
      100
    ),
    enabled: !!post?.id && isOpen,
    initialData: []
  });

  const createCommentMutation = useMutation({
    mutationFn: async ({ content, parentId }) => {
      if (!currentUser?.id || !post?.id) return;

      await base44.entities.Comment.create({
        post_id: post.id,
        author_id: currentUser.id,
        author_name: currentUser.display_name || currentUser.full_name,
        author_username: currentUser.username || currentUser.id,
        author_avatar: currentUser.avatar_url,
        author_level: currentUser.level || 1,
        author_archetype: currentUser.archetype,
        content: content,
        parent_comment_id: parentId || null,
        reactions: { like: 0 },
        reactions_by_user: {}
      });

      // Atualizar contador no post
      await base44.entities.Post.update(post.id, {
        comments_count: (post.comments_count || 0) + 1
      });

      // Notificar autor do post
      if (post.author_id !== currentUser.id) {
        await base44.entities.Notification.create({
          user_id: post.author_id,
          type: "comment",
          title: "Novo Comentário!",
          message: `${currentUser.display_name || currentUser.full_name} comentou no seu post`,
          from_user_id: currentUser.id,
          from_user_name: currentUser.display_name || currentUser.full_name,
          from_user_avatar: currentUser.avatar_url,
          related_entity_id: post.id,
          related_entity_type: "post",
          action_url: "/Hub"
        });
      }

      // Se é resposta, notificar autor do comentário pai
      if (parentId && replyTo && replyTo.author_id !== currentUser.id) {
        await base44.entities.Notification.create({
          user_id: replyTo.author_id,
          type: "comment",
          title: "Nova Resposta!",
          message: `${currentUser.display_name || currentUser.full_name} respondeu seu comentário`,
          from_user_id: currentUser.id,
          from_user_name: currentUser.display_name || currentUser.full_name,
          from_user_avatar: currentUser.avatar_url,
          related_entity_id: post.id,
          related_entity_type: "post",
          action_url: "/Hub"
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-comments'] });
      queryClient.invalidateQueries({ queryKey: ['comment-replies'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setComment("");
      setReplyTo(null);
      toast.success("Comentário enviado! ✨");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    createCommentMutation.mutate({
      content: comment,
      parentId: replyTo?.id || null
    });
  };

  const handleReply = (commentData) => {
    setReplyTo(commentData);
    textareaRef.current?.focus();
  };

  useEffect(() => {
    if (!isOpen) {
      setComment("");
      setReplyTo(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/70 flex items-end md:items-center justify-center p-0 md:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full md:max-w-2xl bg-slate-900 rounded-t-3xl md:rounded-2xl shadow-2xl flex flex-col max-h-[85vh] md:max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-purple-900/30 flex-shrink-0">
              <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
                Comentários
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-700/50 hover:bg-slate-600 flex items-center justify-center transition"
              >
                <X className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
              </button>
            </div>

            {/* Lista de Comentários */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32 md:pb-4">
              {isLoading ? (
                <div className="text-center py-12">
                  <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-purple-500 animate-pulse mx-auto mb-3 md:mb-4" />
                  <p className="text-gray-400 text-sm md:text-base">Carregando comentários...</p>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-12">
                  <Sparkles className="w-12 h-12 md:w-16 md:h-16 text-purple-500/50 mx-auto mb-3 md:mb-4" />
                  <h3 className="text-base md:text-lg font-semibold text-purple-300 mb-2">
                    Seja o primeiro a comentar!
                  </h3>
                  <p className="text-gray-400 text-sm md:text-base">
                    Compartilhe seus pensamentos sobre esta publicação
                  </p>
                </div>
              ) : (
                <div className="space-y-4 md:space-y-6">
                  {comments.map(comment => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      currentUser={currentUser}
                      onReply={handleReply}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Input de Comentário */}
            <div className="sticky bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 p-4 pb-6 md:pb-4">
              {replyTo && (
                <div className="mb-2 md:mb-3 p-2 md:p-3 bg-slate-700/30 rounded-lg flex items-center justify-between">
                  <span className="text-xs md:text-sm text-gray-300">
                    Respondendo <span className="text-purple-400 font-semibold">{replyTo.author_name}</span>
                  </span>
                  <button
                    onClick={() => setReplyTo(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex gap-2 md:gap-3">
                <UserAvatar
                  user={currentUser}
                  size="sm"
                  showStatus={false}
                />

                <div className="flex-1">
                  <Textarea
                    ref={textareaRef}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={replyTo ? `Responder ${replyTo.author_name}...` : "Adicione um comentário..."}
                    className="bg-slate-800 border-purple-900/30 text-white placeholder:text-gray-500 resize-none h-16 md:h-20 text-sm md:text-base"
                    disabled={createCommentMutation.isPending}
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">
                      {comment.length}/500
                    </span>
                    <Button
                      type="submit"
                      disabled={!comment.trim() || createCommentMutation.isPending}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-sm md:text-base px-4 md:px-6"
                    >
                      {createCommentMutation.isPending ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Sparkles className="w-4 h-4" />
                        </motion.div>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-1.5 md:mr-2" />
                          Enviar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
