
import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Send, Smile, Mic, Volume2, Users, Reply, Check, CheckCheck, Image as ImageIcon, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import VoiceRecordModal from "./VoiceRecordModal";
import UserAvatar from "../UserAvatar";
import UserLink from "../UserLink";

const archetypeColors = {
  bruxa_natural: "#9333EA",
  sabio: "#F59E0B",
  guardiao_astral: "#3B82F6",
  xama: "#10B981",
  navegador_cosmico: "#8B5CF6",
  alquimista: "#6366F1",
  none: "#64748B"
};

function MessageComponent({ message, currentUser, onReact, onReply }) {
  const isOwn = message.author_id === currentUser.id;
  const archColor = archetypeColors[message.author_archetype] || archetypeColors.none;
  const [showReactions, setShowReactions] = useState(false);

  const processMessageContent = (text) => {
    if (!text) return text;
    
    const parts = text.split(/(@[\w]+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span key={index} className="text-purple-400 font-semibold">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const totalReactions = Object.values(message.reactions || {}).reduce((a, b) => a + b, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2 md:gap-3 mb-3 md:mb-4 group ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <UserLink user={{ id: message.author_id }}>
        <UserAvatar 
          user={{
            avatar_url: message.author_avatar,
            archetype: message.author_archetype,
            online_status: 'online'
          }}
          size="sm"
          showStatus={false}
        />
      </UserLink>

      <div className={`flex-1 max-w-[80%] md:max-w-[75%]`}>
        <div
          className={`p-3 md:p-4 rounded-2xl relative ${
            isOwn
              ? 'bg-gradient-to-br from-purple-600/40 to-purple-700/40 backdrop-blur-sm'
              : 'bg-slate-800/60 backdrop-blur-sm'
          }`}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <UserLink user={{ id: message.author_id }}>
              <span className="font-bold text-sm md:text-base truncate hover:underline" style={{ color: isOwn ? '#fbbf24' : archColor }}>
                {message.author_name}
              </span>
            </UserLink>
            <span className="text-[10px] md:text-xs text-gray-400 flex-shrink-0">
              Nv.{message.author_level}
            </span>
          </div>

          {message.message_type === 'audio' && message.media_url ? (
            <div className="flex items-center gap-2 md:gap-3 my-2">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-purple-600/30 flex items-center justify-center flex-shrink-0">
                <Volume2 className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
              </div>
              <audio controls className="flex-1 h-8 md:h-10 max-w-full">
                <source src={message.media_url} type="audio/webm" />
              </audio>
            </div>
          ) : (
            <p className="text-white text-sm md:text-base leading-relaxed break-words">
              {processMessageContent(message.content)}
            </p>
          )}

          {totalReactions > 0 && (
            <div className="flex items-center gap-1 mt-2 flex-wrap">
              {Object.entries(message.reactions || {}).map(([emoji, count]) => {
                if (count === 0) return null;
                const emojiMap = { sparkle: '✨', fire: '🔥', heart: '💜', magic: '🔮' };
                return (
                  <span key={emoji} className="text-xs bg-slate-700/50 px-2 py-0.5 rounded-full">
                    {emojiMap[emoji]} {count}
                  </span>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between mt-2">
            <p className="text-[10px] md:text-xs text-gray-500">
              {format(new Date(message.created_date), "HH:mm", { locale: ptBR })}
              {message.is_edited && <span className="ml-1 text-gray-600">(editado)</span>}
            </p>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
              <button 
                onClick={() => setShowReactions(!showReactions)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition"
              >
                <Smile className="w-3.5 h-3.5 text-gray-400" />
              </button>
              <button 
                onClick={() => onReply(message)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition"
              >
                <Reply className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showReactions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute z-10 bg-slate-900 border-2 border-purple-500/50 rounded-2xl p-3 shadow-2xl"
                style={{ 
                  bottom: '100%', 
                  left: isOwn ? 'auto' : '0',
                  right: isOwn ? '0' : 'auto',
                  marginBottom: '8px'
                }}
              >
                <div className="flex gap-2">
                  {[
                    { emoji: '✨', type: 'sparkle' },
                    { emoji: '🔥', type: 'fire' },
                    { emoji: '💜', type: 'heart' },
                    { emoji: '🔮', type: 'magic' }
                  ].map(({ emoji, type }) => (
                    <button
                      key={type}
                      onClick={() => {
                        onReact(message.id, type);
                        setShowReactions(false);
                      }}
                      className="text-2xl md:text-3xl hover:scale-125 transition p-2 hover:bg-white/10 rounded-lg"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export default function GlobalChatModal({ isOpen, onClose, currentUser }) {
  const [message, setMessage] = useState("");
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const [showMentionList, setShowMentionList] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [replyTo, setReplyTo] = useState(null);
  const [onlineCount, setOnlineCount] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const queryClient = useQueryClient();

  const emojis = ["✨", "🔮", "🌙", "⭐", "💫", "🌟", "🪐", "🌠", "🔥", "💜", "🌺", "🦋", "🍃", "🌿", "🌸", "🦄", "👑", "💎"];

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['global-chat-messages'],
    queryFn: () => base44.entities.ChatMessage.filter(
      { room_id: 'global' },
      "created_date",
      200
    ),
    enabled: isOpen,
    refetchInterval: 2000,
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users-for-mention'],
    queryFn: async () => {
      const users = await base44.entities.User.list("-created_date", 50);
      return users;
    },
    enabled: isOpen,
  });

  useEffect(() => {
    if (isOpen) {
      const fetchOnline = async () => {
        const positions = await base44.entities.ZamiraPosition.filter({ is_online: true });
        setOnlineCount(positions.length);
      };
      fetchOnline();
      const interval = setInterval(fetchOnline, 10000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, type = 'text', mediaUrl = null }) => {
      await base44.entities.ChatMessage.create({
        room_id: 'global',
        author_id: currentUser.id,
        author_name: currentUser.display_name || currentUser.full_name,
        author_avatar: currentUser.avatar_url,
        author_level: currentUser.level || 1,
        author_archetype: currentUser.archetype || 'none',
        message_type: type,
        content,
        media_url: mediaUrl,
        reactions: {},
        reply_to: replyTo?.id || null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['global-chat-messages'] });
      setMessage("");
      setReplyTo(null);
    }
  });

  const reactMutation = useMutation({
    mutationFn: async ({ messageId, reactionType }) => {
      const msg = messages.find(m => m.id === messageId);
      if (!msg) return;
      
      const newReactions = { ...(msg.reactions || {}) };
      newReactions[reactionType] = (newReactions[reactionType] || 0) + 1;
      
      await base44.entities.ChatMessage.update(messageId, {
        reactions: newReactions
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['global-chat-messages'] });
    },
  });

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const lastWord = message.slice(0, cursorPosition).split(/\s/).pop();
    
    if (lastWord && lastWord.startsWith('@')) {
      const search = lastWord.slice(1).toLowerCase();
      setMentionSearch(search);
      setShowMentionList(true);
    } else {
      setShowMentionList(false);
      setMentionSearch("");
    }
  }, [message, cursorPosition]);

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    setCursorPosition(e.target.selectionStart);
  };

  const handleSelectMention = (selectedUser) => {
    const beforeCursor = message.slice(0, cursorPosition);
    const afterCursor = message.slice(cursorPosition);
    
    const words = beforeCursor.split(/\s/);
    words.pop();
    const beforeMention = words.join(' ') + (words.length > 0 ? ' ' : '');
    
    const username = selectedUser.username || selectedUser.id;
    const newMessage = beforeMention + `@${username} ` + afterCursor;
    
    setMessage(newMessage);
    setShowMentionList(false);
    setMentionSearch("");
    
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };

  const filteredUsers = allUsers.filter(u => {
    if (!mentionSearch) return true;
    const username = (u.username || u.full_name || u.email).toLowerCase();
    return username.includes(mentionSearch.toLowerCase());
  }).slice(0, 5);

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;
    
    sendMessageMutation.mutate({ content: trimmedMessage });
  };

  const handleVoiceSent = (audioUrl) => {
    sendMessageMutation.mutate({
      content: "🎤 Mensagem de voz",
      type: 'audio',
      mediaUrl: audioUrl
    });
    setShowVoiceModal(false);
  };

  const handleReact = (messageId, reactionType) => {
    reactMutation.mutate({ messageId, reactionType });
  };

  const handleReply = (msg) => {
    setReplyTo(msg);
    if (inputRef.current) inputRef.current.focus();
  };

  const addEmoji = (emoji) => {
    const beforeCursor = message.slice(0, cursorPosition);
    const afterCursor = message.slice(cursorPosition);
    const newMessage = beforeCursor + emoji + afterCursor;
    
    setMessage(newMessage);
    setCursorPosition(beforeCursor.length + emoji.length);
    setShowEmojiPicker(false);
    
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };

  if (!isOpen) return null;

  const groupedMessages = messages.reduce((acc, msg) => {
    const date = format(new Date(msg.created_date), "dd 'de' MMMM", { locale: ptBR });
    if (!acc[date]) acc[date] = [];
    acc[date].push(msg);
    return acc;
  }, {});

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-sm"
      >
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        />

        <div className="relative bg-black/20 backdrop-blur-md border-b border-purple-900/30 p-3 md:p-4 flex-shrink-0">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-purple-400 text-xl md:text-2xl">#</span>
                <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-white">geral</h2>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                <Users className="w-3 h-3 inline mr-1" />
                {onlineCount} online agora
              </p>
            </div>

            <Button
              size="icon"
              variant="ghost"
              onClick={onClose}
              className="text-gray-400 hover:text-white h-9 w-9 lg:h-10 lg:w-10"
            >
              <X className="w-5 h-5 lg:w-6 lg:h-6" />
            </Button>
          </div>
        </div>

        <div className="relative flex-1 overflow-hidden pb-[72px] md:pb-0">
          <ScrollArea className="h-full">
            <div className="max-w-4xl mx-auto p-3 md:p-4 lg:p-6 min-h-full flex flex-col justify-end pb-1">
              {isLoading ? (
                <div className="text-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                  </motion.div>
                  <p className="text-gray-400 text-sm md:text-base">Carregando o portal...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12">
                  <Sparkles className="w-16 h-16 text-purple-500/50 mx-auto mb-4" />
                  <h3 className="text-lg md:text-xl font-bold text-purple-300 mb-2">
                    Seja o primeiro a falar!
                  </h3>
                  <p className="text-gray-400 text-sm md:text-base">
                    Inicie uma conversa no portal místico
                  </p>
                </div>
              ) : (
                <div>
                  {Object.entries(groupedMessages).map(([date, msgs]) => (
                    <div key={date}>
                      <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-purple-900/30" />
                        <span className="text-xs text-purple-300 font-semibold px-3 py-1 bg-purple-900/20 rounded-full">
                          {date}
                        </span>
                        <div className="flex-1 h-px bg-purple-900/30" />
                      </div>
                      
                      {msgs.map((msg) => (
                        <MessageComponent
                          key={msg.id}
                          message={msg}
                          currentUser={currentUser}
                          onReact={handleReact}
                          onReply={handleReply}
                        />
                      ))}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="relative bg-black/20 backdrop-blur-md border-t border-purple-900/30 p-2.5 md:p-3 lg:p-4 flex-shrink-0 mb-16 md:mb-0">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative">
            {replyTo && (
              <div className="mb-2 p-2 bg-purple-900/20 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Reply className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span className="text-xs text-gray-300 truncate">
                    Respondendo {replyTo.author_name}
                  </span>
                </div>
                <button onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <AnimatePresence>
              {showMentionList && filteredUsers.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full mb-2 left-0 right-0 bg-slate-900 border-2 border-purple-500/50 rounded-2xl overflow-hidden shadow-2xl"
                >
                  <div className="p-2 border-b border-purple-900/30 bg-slate-800/50">
                    <p className="text-xs text-gray-400">Mencionar:</p>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredUsers.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleSelectMention(u)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-purple-900/30 transition"
                      >
                        <UserAvatar user={u} size="sm" showStatus={false} />
                        <div className="flex-1 text-left">
                          <p className="text-sm font-semibold text-white">
                            {u.display_name || u.full_name}
                          </p>
                          <p className="text-xs text-gray-400">
                            @{u.username || u.id}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-1.5 md:gap-2 bg-slate-800/50 rounded-full px-2 md:px-3 py-1.5 md:py-2">
              <div className="relative">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="hover:bg-slate-700 h-8 w-8 md:h-9 md:w-9 lg:h-10 lg:w-10 flex-shrink-0"
                >
                  <Smile className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                </Button>

                <AnimatePresence>
                  {showEmojiPicker && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      className="absolute bottom-full mb-2 left-0 bg-slate-900 border-2 border-purple-500/50 rounded-2xl p-3 md:p-4 shadow-2xl z-20"
                    >
                      <div className="grid grid-cols-6 gap-2">
                        {emojis.map((emoji, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => addEmoji(emoji)}
                            className="text-2xl hover:scale-125 transition p-2 hover:bg-white/10 rounded-lg"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Input
                ref={inputRef}
                value={message}
                onChange={handleInputChange}
                onSelect={(e) => setCursorPosition(e.target.selectionStart)}
                placeholder="Sussurre para a comunidade..."
                className="flex-1 bg-transparent border-0 text-white placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 h-8 md:h-9 lg:h-10 text-sm md:text-base"
                disabled={sendMessageMutation.isPending}
              />

              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => setShowVoiceModal(true)}
                className="hover:bg-slate-700 h-8 w-8 md:h-9 md:w-9 lg:h-10 lg:w-10 flex-shrink-0"
                disabled={sendMessageMutation.isPending}
              >
                <Mic className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
              </Button>

              <Button
                type="submit"
                disabled={!message.trim() || sendMessageMutation.isPending}
                size="icon"
                className="bg-purple-600 hover:bg-purple-700 h-8 w-8 md:h-9 md:w-9 lg:h-10 lg:w-10 rounded-full disabled:opacity-50 flex-shrink-0"
              >
                {sendMessageMutation.isPending ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                  </motion.div>
                ) : (
                  <Send className="w-4 h-4 md:w-5 md:h-5" />
                )}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>

      <VoiceRecordModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onVoiceSent={handleVoiceSent}
        user={currentUser}
      />
    </AnimatePresence>
  );
}
