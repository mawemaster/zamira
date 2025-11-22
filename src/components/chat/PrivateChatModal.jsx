import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, Image as ImageIcon, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import UserAvatar from "../UserAvatar";
import VoiceRecordModal from "./VoiceRecordModal";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function PrivateChatModal({ isOpen, onClose, currentUser, otherUser }) {
  if (!currentUser?.id || !otherUser?.id) return null;

  const [newMessage, setNewMessage] = useState("");
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const conversationId = [currentUser.id, otherUser.id].sort().join("_");

  // Buscar mensagens - ORDEM CORRETA (mais antigas primeiro)
  const { data: messages, isLoading } = useQuery({
    queryKey: ['direct-messages', conversationId],
    queryFn: async () => {
      const msgs = await base44.entities.DirectMessage.filter(
        { conversation_id: conversationId },
        "created_date", // Ordem crescente (mais antigas primeiro)
        200
      );
      return msgs;
    },
    enabled: isOpen && !!currentUser?.id && !!otherUser?.id,
    initialData: [],
    refetchInterval: 1500, // Atualizar a cada 1.5 segundos
  });

  useEffect(() => {
    if (isOpen) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      scrollToBottom();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Marcar mensagens como lidas
  useEffect(() => {
    const markAsRead = async () => {
      if (!isOpen || !messages || messages.length === 0) return;
      
      const unreadMessages = messages.filter(
        m => m.recipient_id === currentUser.id && !m.is_read
      );
      
      for (const msg of unreadMessages) {
        try {
          await base44.entities.DirectMessage.update(msg.id, { is_read: true });
        } catch (error) {
          console.error("Erro ao marcar como lida:", error);
        }
      }
      
      if (unreadMessages.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['direct-messages'] });
        queryClient.invalidateQueries({ queryKey: ['private-messages-all'] });
      }
    };
    
    markAsRead();
  }, [isOpen, messages, currentUser.id, queryClient]);

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData) => {
      if (!currentUser?.id || !otherUser?.id) return;
      
      const msg = await base44.entities.DirectMessage.create(messageData);
      
      // Criar notificação para o destinatário
      await base44.entities.Notification.create({
        user_id: otherUser.id,
        type: "announcement",
        title: "💬 Nova Mensagem!",
        message: `${currentUser.display_name || currentUser.full_name} enviou uma mensagem`,
        from_user_id: currentUser.id,
        from_user_name: currentUser.display_name || currentUser.full_name,
        from_user_avatar: currentUser.avatar_url,
        action_url: "/Chat"
      });
      
      return msg;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['direct-messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['private-messages-all'] });
      scrollToBottom();
    },
    onError: () => {
      toast.error("Erro ao enviar mensagem");
    }
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !currentUser?.id || !otherUser?.id) return;

    const messageData = {
      conversation_id: conversationId,
      sender_id: currentUser.id,
      sender_name: currentUser.display_name || currentUser.full_name,
      sender_avatar: currentUser.avatar_url,
      recipient_id: otherUser.id,
      recipient_name: otherUser.display_name || otherUser.full_name,
      recipient_avatar: otherUser.avatar_url,
      message_type: "text",
      content: newMessage,
      is_read: false
    };

    sendMessageMutation.mutate(messageData);
    setNewMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceMessage = async (audioUrl) => {
    if (!currentUser?.id || !otherUser?.id) return;

    const messageData = {
      conversation_id: conversationId,
      sender_id: currentUser.id,
      sender_name: currentUser.display_name || currentUser.full_name,
      sender_avatar: currentUser.avatar_url,
      recipient_id: otherUser.id,
      recipient_name: otherUser.display_name || otherUser.full_name,
      recipient_avatar: otherUser.avatar_url,
      message_type: "audio",
      content: "🎤 Mensagem de voz",
      media_url: audioUrl,
      is_read: false
    };

    sendMessageMutation.mutate(messageData);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-2 md:p-4 bg-black/80"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl max-w-2xl w-full h-[85vh] md:h-[80vh] flex flex-col border border-purple-500/30 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 md:p-6 border-b border-purple-500/30 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <UserAvatar user={otherUser} size="sm" showStatus={true} />
                  <div>
                    <h3 className="text-base md:text-lg font-bold text-white">
                      {otherUser.display_name || otherUser.full_name}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {otherUser.online_status === 'online' ? '🟢 Online' : 'Offline'}
                    </p>
                  </div>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3">
                {isLoading && messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 text-sm">Nenhuma mensagem ainda</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    if (!msg?.id) return null;
                    const isMine = msg.sender_id === currentUser.id;
                    
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[75%] md:max-w-[70%] ${isMine ? 'items-end' : 'items-start'}`}>
                          {msg.message_type === 'audio' ? (
                            <div className={`p-3 rounded-2xl ${
                              isMine 
                                ? 'bg-gradient-to-r from-purple-600 to-purple-700' 
                                : 'bg-slate-700'
                            }`}>
                              <audio controls className="max-w-full">
                                <source src={msg.media_url} type="audio/mpeg" />
                              </audio>
                            </div>
                          ) : (
                            <div className={`p-3 rounded-2xl ${
                              isMine 
                                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white' 
                                : 'bg-slate-700 text-white'
                            }`}>
                              <p className="text-sm break-words">{msg.content}</p>
                            </div>
                          )}
                          <span className="text-xs text-gray-500 mt-1 px-2 block">
                            {format(new Date(msg.created_date), "HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 md:p-4 border-t border-purple-500/30 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setShowVoiceModal(true)}
                    className="text-purple-400 hover:bg-purple-900/20 flex-shrink-0"
                  >
                    <Mic className="w-5 h-5" />
                  </Button>
                  
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 bg-slate-800 border-slate-700 text-white text-sm md:text-base"
                  />
                  
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    size="icon"
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 flex-shrink-0"
                  >
                    {sendMessageMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 md:w-5 md:h-5" />
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <VoiceRecordModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onSave={handleVoiceMessage}
      />
    </>
  );
}