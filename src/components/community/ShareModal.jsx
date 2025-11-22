
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { X, Copy, Check, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// Ícones Oficiais das Redes Sociais
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6 md:w-7 md:h-7" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6 md:w-7 md:h-7" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6 md:w-7 md:h-7" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

export default function ShareModal({ isOpen, onClose, post, currentUser }) {
  // Validação essencial
  if (!post?.id || !currentUser?.id) return null;

  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false); // New state for sharing status
  const queryClient = useQueryClient();

  const shareMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser?.id || !post?.id) return;

      // Update the share count of the original post
      await base44.entities.Post.update(post.id, {
        shares_count: (post.shares_count || 0) + 1
      });

      // Create a notification for the original post author
      if (post.author_id !== currentUser.id) {
        await base44.entities.Notification.create({
          user_id: post.author_id,
          type: "announcement",
          title: "Post Compartilhado!",
          message: `${currentUser.display_name || currentUser.full_name} compartilhou seu post`,
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
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setShared(true); // Set shared state
      toast.success("Post compartilhado no seu feed! ✨"); // Toast message
      setTimeout(() => {
        onClose(); // Close modal after a delay
        setShared(false); // Reset shared state
      }, 1500); // 1.5 seconds
    }
  });

  const handleCopyLink = () => {
    if (!post?.id) return;
    const url = `${window.location.origin}/Hub?post=${post.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareToFeed = () => {
    shareMutation.mutate();
  };

  const handleShareFacebook = () => {
    const url = `${window.location.origin}/Hub?post=${post.id}`;
    const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(fbShareUrl, '_blank', 'width=600,height=400');
    
    // Update counter (assuming shareMutation is not used here because it closes the modal)
    base44.entities.Post.update(post.id, {
      shares_count: (post.shares_count || 0) + 1
    });
    queryClient.invalidateQueries({ queryKey: ['posts'] });
    toast.success("Abrindo Facebook...");
  };

  const handleShareWhatsApp = () => {
    const url = `${window.location.origin}/Hub?post=${post.id}`;
    const text = `Confira esta publicação mística: "${(post.content || '').substring(0, 100)}${post.content?.length > 100 ? '...' : ''}"`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + '\n\n' + url)}`;
    window.open(whatsappUrl, '_blank');
    
    // Update counter (assuming shareMutation is not used here because it closes the modal)
    base44.entities.Post.update(post.id, {
      shares_count: (post.shares_count || 0) + 1
    });
    queryClient.invalidateQueries({ queryKey: ['posts'] });
    toast.success("Abrindo WhatsApp...");
  };

  const handleShareTelegram = () => {
    const url = `${window.location.origin}/Hub?post=${post.id}`;
    const text = `Confira esta publicação mística: "${(post.content || '').substring(0, 100)}${post.content?.length > 100 ? '...' : ''}"`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(telegramUrl, '_blank');
    
    // Update counter (assuming shareMutation is not used here because it closes the modal)
    base44.entities.Post.update(post.id, {
      shares_count: (post.shares_count || 0) + 1
    });
    queryClient.invalidateQueries({ queryKey: ['posts'] });
    toast.success("Abrindo Telegram...");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full bg-gradient-to-b from-slate-900 to-slate-800 rounded-t-3xl shadow-2xl mb-[70px]"
          style={{ maxHeight: 'calc(90vh - 70px)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-5 border-b border-purple-900/30">
            <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <Share2 className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
              Compartilhar
            </h2>
            <button
              onClick={onClose}
              className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-slate-700/50 hover:bg-slate-600 flex items-center justify-center transition"
            >
              <X className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
            </button>
          </div>

          {/* Conteúdo - Scrollable */}
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
            <div className="p-4 md:p-5 space-y-3">
              {/* Compartilhar no Feed */}
              <button
                onClick={handleShareToFeed}
                disabled={shareMutation.isPending || shared}
                className="w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl transition group"
              >
                <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                  {shared ? (
                    <Check className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  ) : (
                    <Share2 className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-sm md:text-base font-semibold text-white group-hover:text-purple-300 transition">
                    {shared ? 'Compartilhado!' : 'Compartilhar no seu Feed'}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-400">
                    Publique esta emanação no seu perfil
                  </p>
                </div>
              </button>

              {/* Copiar Link */}
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl transition group"
              >
                <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center flex-shrink-0">
                  {copied ? (
                    <Check className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  ) : (
                    <Copy className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-sm md:text-base font-semibold text-white group-hover:text-blue-300 transition">
                    {copied ? 'Link Copiado!' : 'Copiar Link'}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-400">
                    Compartilhe onde quiser
                  </p>
                </div>
              </button>

              {/* Divisor */}
              <div className="flex items-center gap-3 py-2">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
                <span className="text-xs text-gray-500">Redes Sociais</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
              </div>

              {/* Facebook */}
              <button
                onClick={handleShareFacebook}
                className="w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl transition group"
              >
                <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-[#1877F2] flex items-center justify-center flex-shrink-0">
                  <FacebookIcon />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-sm md:text-base font-semibold text-white group-hover:text-[#1877F2] transition">
                    Facebook
                  </h3>
                  <p className="text-xs md:text-sm text-gray-400">
                    Compartilhe com seus amigos
                  </p>
                </div>
              </button>

              {/* WhatsApp */}
              <button
                onClick={handleShareWhatsApp}
                className="w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl transition group"
              >
                <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0">
                  <WhatsAppIcon />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-sm md:text-base font-semibold text-white group-hover:text-[#25D366] transition">
                    WhatsApp
                  </h3>
                  <p className="text-xs md:text-sm text-gray-400">
                    Envie para contatos e grupos
                  </p>
                </div>
              </button>

              {/* Telegram */}
              <button
                onClick={handleShareTelegram}
                className="w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl transition group"
              >
                <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-[#0088cc] flex items-center justify-center flex-shrink-0">
                  <TelegramIcon />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-sm md:text-base font-semibold text-white group-hover:text-[#0088cc] transition">
                    Telegram
                  </h3>
                  <p className="text-xs md:text-sm text-gray-400">
                    Compartilhe em canais e chats
                  </p>
                </div>
              </button>
            </div>

            {/* Prévia do Post */}
            <div className="p-4 md:p-5 border-t border-purple-900/30">
              <div className="bg-slate-800/50 rounded-xl p-3 md:p-4">
                <div className="flex items-center gap-2 md:gap-3 mb-2">
                  <img
                    src={post.author_avatar || "https://via.placeholder.com/40"}
                    alt={post.author_name}
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-xs md:text-sm font-semibold text-white">
                      {post.author_name}
                    </p>
                    <p className="text-[10px] md:text-xs text-gray-400">
                      Nível {post.author_level}
                    </p>
                  </div>
                </div>
                <p className="text-xs md:text-sm text-gray-300 line-clamp-3">
                  {post.content}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
