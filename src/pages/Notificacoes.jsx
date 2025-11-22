import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell, BellOff, Heart, MessageCircle, UserPlus, TrendingUp, Award, Sparkles, Crown, Trash2, Check, CheckCheck, Settings
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const notificationIcons = {
  follow: UserPlus,
  reaction: Heart,
  comment: MessageCircle,
  level_up: TrendingUp,
  achievement: Award,
  daily_blessing: Sparkles,
  synchronicity: Sparkles,
  duel_challenge: Crown,
  duel_result: Crown,
  announcement: Bell
};

export default function NotificacoesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    loadUser();
  }, []);

  const loadUser = async () => {
    const currentUser = await base44.auth.me();
    setUser(currentUser);
  };

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => base44.entities.Notification.filter(
      { user_id: user.id },
      "-created_date",
      100
    ),
    enabled: !!user,
    staleTime: 3000,
    refetchInterval: 5000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notifId) => {
      return await base44.entities.Notification.update(notifId, { is_read: true });
    },
    onMutate: async (notifId) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previousNotifs = queryClient.getQueryData(['notifications', user?.id]);
      
      queryClient.setQueryData(['notifications', user?.id], (old) => {
        return old?.map(n => n.id === notifId ? { ...n, is_read: true } : n);
      });
      
      return { previousNotifs };
    },
    onError: (err, notifId, context) => {
      queryClient.setQueryData(['notifications', user?.id], context.previousNotifs);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const markAsUnreadMutation = useMutation({
    mutationFn: async (notifId) => {
      return await base44.entities.Notification.update(notifId, { is_read: false });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unreadNotifs = notifications.filter(n => !n.is_read);
      await Promise.all(unreadNotifs.map(n => base44.entities.Notification.update(n.id, { is_read: true })));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (id) => await base44.entities.Notification.delete(id),
    onMutate: async (deleteId) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previousNotifs = queryClient.getQueryData(['notifications', user?.id]);
      
      queryClient.setQueryData(['notifications', user?.id], (old) => {
        return old?.filter(n => n.id !== deleteId);
      });
      
      return { previousNotifs };
    },
    onError: (err, deleteId, context) => {
      queryClient.setQueryData(['notifications', user?.id], context.previousNotifs);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const handleNotificationClick = (notif) => {
    if (!notif.is_read) {
      markAsReadMutation.mutate(notif.id);
    }
    
    if (notif.action_url) {
      navigate(notif.action_url);
    } else if (notif.related_entity_id) {
      switch (notif.related_entity_type) {
        case 'post':
          navigate(createPageUrl(`Hub`));
          break;
        case 'comment':
          navigate(createPageUrl(`Hub`));
          break;
        case 'user':
          navigate(createPageUrl(`Perfil?username=${notif.from_user_id}`));
          break;
        default:
          break;
      }
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#02031C] via-slate-900 to-[#02031C]">
        <Sparkles className="w-12 h-12 text-purple-500 animate-pulse" />
      </div>
    );
  }

  const unreadNotifs = notifications.filter(n => !n.is_read);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#02031C] via-slate-900 to-[#02031C] text-white pb-24">
      <div className="sticky top-[56px] md:top-[64px] z-40 bg-[#02031C]/95 backdrop-blur-sm border-b border-purple-900/30 px-4 py-3">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl md:text-2xl font-bold">Ecos do Universo</h1>
            <div className="flex items-center gap-2">
              {unreadNotifs.length > 0 && (
                <Button
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <CheckCheck className="w-4 h-4 mr-1" />
                  Marcar todas
                </Button>
              )}
              <Button
                onClick={() => navigate(createPageUrl("ConfiguracoesNotificacoes"))}
                size="icon"
                variant="ghost"
                className="text-gray-400 hover:text-white"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <p className="text-gray-400 text-xs md:text-sm">
            {unreadNotifs.length > 0 
              ? `${unreadNotifs.length} nova${unreadNotifs.length > 1 ? 's' : ''} notificaç${unreadNotifs.length > 1 ? 'ões' : 'ão'}` 
              : 'Você está em dia com o universo ✨'}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-3 md:px-4 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full bg-slate-800/80 mb-4 grid grid-cols-2 h-10 md:h-11">
            <TabsTrigger value="all" className="text-xs md:text-sm">
              Todas ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread" className="text-xs md:text-sm">
              Não Lidas ({unreadNotifs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-2 md:space-y-3 m-0">
            {notifications.length === 0 ? (
              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 p-8 md:p-12 text-center">
                <BellOff className="w-12 h-12 md:w-16 md:h-16 text-slate-600 mx-auto mb-3 md:mb-4" />
                <p className="text-gray-400 text-sm md:text-base">Nenhuma notificação ainda</p>
              </Card>
            ) : (
              <AnimatePresence>
                {notifications.map((notif, index) => {
                  const Icon = notificationIcons[notif.type] || Bell;
                  
                  return (
                    <motion.div
                      key={notif.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.02 }}
                    >
                      <Card
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-3 md:p-4 transition cursor-pointer active:scale-98 ${
                          !notif.is_read
                            ? 'bg-gradient-to-r from-purple-900/50 to-slate-900/50 border-purple-500/50 hover:border-purple-400'
                            : 'bg-gradient-to-r from-slate-900/40 to-slate-800/40 border-slate-700/50 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-start gap-2.5 md:gap-3">
                          {notif.from_user_avatar ? (
                            <img
                              src={notif.from_user_avatar}
                              alt=""
                              className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-purple-500 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-purple-600/30 flex items-center justify-center flex-shrink-0">
                              <Icon className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold text-xs md:text-sm mb-0.5 md:mb-1">
                              {notif.title}
                            </p>
                            <p className="text-gray-400 text-[11px] md:text-xs mb-1 md:mb-2 line-clamp-2">
                              {notif.message}
                            </p>
                            <span className="text-gray-500 text-[10px] md:text-xs">
                              {format(new Date(notif.created_date), "dd MMM 'às' HH:mm", { locale: ptBR })}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            {!notif.is_read && (
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsReadMutation.mutate(notif.id);
                                }}
                                size="icon"
                                variant="ghost"
                                className="text-green-400 hover:text-green-300 hover:bg-green-900/20 h-8 w-8"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            )}
                            {notif.is_read && (
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsUnreadMutation.mutate(notif.id);
                                }}
                                size="icon"
                                variant="ghost"
                                className="text-gray-400 hover:text-gray-300 hover:bg-gray-700/20 h-8 w-8"
                              >
                                <Bell className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotificationMutation.mutate(notif.id);
                              }}
                              size="icon"
                              variant="ghost"
                              className="text-red-400 hover:text-red-300 hover:bg-red-900/20 h-8 w-8"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </TabsContent>

          <TabsContent value="unread" className="space-y-2 md:space-y-3 m-0">
            {unreadNotifs.length === 0 ? (
              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 p-8 md:p-12 text-center">
                <Sparkles className="w-12 h-12 md:w-16 md:h-16 text-purple-500 mx-auto mb-3 md:mb-4" />
                <p className="text-gray-400 text-sm md:text-base">Todas as notificações foram lidas!</p>
              </Card>
            ) : (
              <AnimatePresence>
                {unreadNotifs.map((notif, index) => {
                  const Icon = notificationIcons[notif.type] || Bell;
                  
                  return (
                    <motion.div
                      key={notif.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.02 }}
                    >
                      <Card
                        onClick={() => handleNotificationClick(notif)}
                        className="bg-gradient-to-r from-purple-900/50 to-slate-900/50 border-purple-500/50 hover:border-purple-400 p-3 md:p-4 transition cursor-pointer active:scale-98"
                      >
                        <div className="flex items-start gap-2.5 md:gap-3">
                          {notif.from_user_avatar ? (
                            <img
                              src={notif.from_user_avatar}
                              alt=""
                              className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-purple-500 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-purple-600/30 flex items-center justify-center flex-shrink-0">
                              <Icon className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold text-xs md:text-sm mb-0.5 md:mb-1">
                              {notif.title}
                            </p>
                            <p className="text-gray-400 text-[11px] md:text-xs mb-1 md:mb-2 line-clamp-2">
                              {notif.message}
                            </p>
                            <span className="text-gray-500 text-[10px] md:text-xs">
                              {format(new Date(notif.created_date), "dd MMM 'às' HH:mm", { locale: ptBR })}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsReadMutation.mutate(notif.id);
                              }}
                              size="icon"
                              variant="ghost"
                              className="text-green-400 hover:text-green-300 hover:bg-green-900/20 h-8 w-8"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotificationMutation.mutate(notif.id);
                              }}
                              size="icon"
                              variant="ghost"
                              className="text-red-400 hover:text-red-300 hover:bg-red-900/20 h-8 w-8"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}