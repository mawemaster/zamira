import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import UserAvatar from "../components/UserAvatar";
import GlobalChatModal from "../components/chat/GlobalChatModal";
import { Button } from "@/components/ui/button";

export default function ChatPage() {
  const [user, setUser] = useState(null);
  const [showGlobalChat, setShowGlobalChat] = useState(false);

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

  const { data: sentRavens = [], isLoading: loadingSent } = useQuery({
    queryKey: ['ravens-sent', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const ravens = await base44.entities.Raven.filter(
        { sender_id: user.id },
        "-created_date",
        50
      );
      return ravens;
    },
    enabled: !!user?.id,
    refetchInterval: 3000
  });

  const { data: receivedRavens = [], isLoading: loadingReceived } = useQuery({
    queryKey: ['ravens-received', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const ravens = await base44.entities.Raven.filter(
        { recipient_id: user.id },
        "-created_date",
        50
      );
      return ravens;
    },
    enabled: !!user?.id,
    refetchInterval: 3000
  });

  const handleMarkAsRead = async (ravenId) => {
    try {
      await base44.entities.Raven.update(ravenId, {
        is_read: true,
        read_at: new Date().toISOString()
      });
    } catch (error) {
      console.error("Erro ao marcar como lido:", error);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#0f0f1e] via-[#1a1a2e] to-[#0f0f1e]">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  const unreadCount = receivedRavens.filter(r => r && !r.is_read).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f1e] via-[#1a1a2e] to-[#0f0f1e] pb-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e5f6f991e09e82bef3795/4332b5385_corvo.png" 
              alt="Corvo" 
              className="w-12 h-12 object-contain"
            />
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Mensagens & Corvos
            </h1>
          </div>
          <p className="text-gray-300 text-sm md:text-base">
            Chat global e corvos místicos para comunicação secreta
          </p>
        </motion.div>

        <Button
          onClick={() => setShowGlobalChat(true)}
          className="w-full mb-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 text-lg"
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          Abrir Chat Global
        </Button>

        <Tabs defaultValue="received" className="w-full">
          <TabsList className="grid grid-cols-2 w-full bg-slate-900/50 mb-6">
            <TabsTrigger value="received" className="relative">
              Corvos Recebidos
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent">Corvos Enviados</TabsTrigger>
          </TabsList>

          <TabsContent value="received">
            <AnimatePresence>
              {loadingReceived ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                </div>
              ) : receivedRavens.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e5f6f991e09e82bef3795/4332b5385_corvo.png" 
                    alt="Nenhum corvo" 
                    className="w-24 h-24 mx-auto mb-4 opacity-50"
                  />
                  <p className="text-gray-400">Nenhum corvo recebido ainda</p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {receivedRavens.map((raven) => {
                    if (!raven) return null;
                    return (
                      <motion.div
                        key={raven.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                      >
                        <Card 
                          className={`bg-slate-900/50 border-purple-500/30 p-4 cursor-pointer hover:bg-slate-900/70 transition ${
                            !raven.is_read ? 'border-purple-500 bg-purple-900/20' : ''
                          }`}
                          onClick={() => handleMarkAsRead(raven.id)}
                        >
                          <div className="flex items-start gap-3">
                            <UserAvatar 
                              user={{
                                avatar_url: raven.sender_avatar || '',
                                display_name: raven.sender_name || 'Viajante',
                                full_name: raven.sender_name || 'Viajante'
                              }} 
                              size="md" 
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-white font-bold">{raven.sender_name || 'Viajante'}</h3>
                                <span className="text-xs text-gray-400">
                                  {formatDistanceToNow(new Date(raven.created_date), { 
                                    addSuffix: true, 
                                    locale: ptBR 
                                  })}
                                </span>
                              </div>
                              <p className="text-gray-300 text-sm whitespace-pre-wrap">{raven.message || ''}</p>
                              {!raven.is_read && (
                                <div className="mt-2 flex items-center gap-2 text-xs text-purple-400">
                                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                                  Não lido
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="sent">
            <AnimatePresence>
              {loadingSent ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                </div>
              ) : sentRavens.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e5f6f991e09e82bef3795/4332b5385_corvo.png" 
                    alt="Nenhum corvo" 
                    className="w-24 h-24 mx-auto mb-4 opacity-50"
                  />
                  <p className="text-gray-400">Você ainda não enviou nenhum corvo</p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {sentRavens.map((raven) => {
                    if (!raven) return null;
                    return (
                      <motion.div
                        key={raven.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                      >
                        <Card className="bg-slate-900/50 border-purple-500/30 p-4">
                          <div className="flex items-start gap-3">
                            <UserAvatar 
                              user={{
                                avatar_url: raven.recipient_avatar || '',
                                display_name: raven.recipient_name || 'Viajante',
                                full_name: raven.recipient_name || 'Viajante'
                              }} 
                              size="md" 
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-white font-bold">Para: {raven.recipient_name || 'Viajante'}</h3>
                                <span className="text-xs text-gray-400">
                                  {formatDistanceToNow(new Date(raven.created_date), { 
                                    addSuffix: true, 
                                    locale: ptBR 
                                  })}
                                </span>
                              </div>
                              <p className="text-gray-300 text-sm whitespace-pre-wrap">{raven.message || ''}</p>
                              <div className="mt-2 flex items-center gap-2 text-xs">
                                {raven.is_read ? (
                                  <span className="text-green-400">✓ Lido</span>
                                ) : (
                                  <span className="text-gray-400">Aguardando leitura</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </div>

      <GlobalChatModal
        isOpen={showGlobalChat}
        onClose={() => setShowGlobalChat(false)}
        currentUser={user}
      />
    </div>
  );
}