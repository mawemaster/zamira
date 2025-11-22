
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { X, UserPlus, UserMinus, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const archetypeColors = {
  bruxa_natural: "#9333EA",
  sabio: "#F59E0B",
  guardiao_astral: "#3B82F6",
  xama: "#10B981",
  navegador_cosmico: "#8B5CF6",
  alquimista: "#6366F1",
  none: "#64748B"
};

export default function MyTiesModal({ user, onClose }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Buscar conexões
  const { data: following } = useQuery({
    queryKey: ['following', user.id],
    queryFn: () => base44.entities.Connection.filter({ follower_id: user.id }, "-created_date", 100),
    initialData: []
  });

  const { data: followers } = useQuery({
    queryKey: ['followers', user.id],
    queryFn: () => base44.entities.Connection.filter({ following_id: user.id }, "-created_date", 100),
    initialData: []
  });

  // Sincronicidades (matches mútuos)
  const synchronicities = following.filter(conn => 
    followers.some(f => f.follower_id === conn.following_id)
  );

  const unfollowMutation = useMutation({
    mutationFn: async (connectionId) => {
      await base44.entities.Connection.delete(connectionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['followers'] });
    }
  });

  const followBackMutation = useMutation({
    mutationFn: async (follower) => {
      await base44.entities.Connection.create({
        follower_id: user.id,
        follower_name: user.display_name || user.full_name,
        follower_avatar: user.avatar_url,
        following_id: follower.follower_id,
        following_name: follower.follower_name,
        following_avatar: follower.follower_avatar
      });

      // Notificar follow back
      await base44.entities.Notification.create({
        user_id: follower.follower_id,
        type: "follow",
        title: "Conexão Recíproca!",
        message: `${user.display_name || user.full_name} seguiu você de volta`,
        from_user_id: user.id,
        from_user_name: user.display_name || user.full_name,
        from_user_avatar: user.avatar_url,
        related_entity_type: "user",
        related_entity_id: user.id,
        action_url: `/Perfil?user=${user.id}`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['followers'] });
    }
  });

  const isFollowing = (userId) => {
    return following.some(conn => conn.following_id === userId);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gradient-to-b from-[#0f0f23] to-[#1a1a2e] border-purple-500/30 text-white p-0 overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="relative border-b border-purple-500/30 p-6 text-center">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">
            A Teia de Laços Místicos
          </h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800/50 hover:bg-slate-700 flex items-center justify-center transition"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="synchronicities" className="flex-1 overflow-hidden">
          <TabsList className="w-full bg-slate-900/50 p-2 rounded-none border-b border-purple-500/20">
            <TabsTrigger
              value="synchronicities"
              className="flex-1 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              Sincronicidades
              {synchronicities.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-pink-500 rounded-full text-xs">
                  {synchronicities.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="following"
              className="flex-1 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              Seguindo
            </TabsTrigger>
            <TabsTrigger
              value="followers"
              className="flex-1 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              Seguidores
            </TabsTrigger>
          </TabsList>

          {/* Sincronicidades */}
          <TabsContent value="synchronicities" className="p-6 overflow-y-auto max-h-[60vh]">
            {synchronicities.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-2">Nenhuma sincronicidade ainda</p>
                <p className="text-gray-500 text-sm">
                  Conecte-se com outros viajantes para encontrar matches mútuos!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {synchronicities.map((sync) => (
                  <motion.div
                    key={sync.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-800/50 rounded-xl p-4 flex items-center justify-between hover:bg-slate-800/70 transition border border-purple-500/20"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={sync.following_avatar || "https://via.placeholder.com/50"}
                        alt={sync.following_name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-pink-500"
                      />
                      <div>
                        <h4 className="font-bold text-white">{sync.following_name}</h4>
                        <p className="text-sm text-pink-300 italic">
                          "O universo realmente nos uniu! ✨"
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => navigate(createPageUrl("Chat"))}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Conversar
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Seguindo */}
          <TabsContent value="following" className="p-6 overflow-y-auto max-h-[60vh]">
            {following.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">Você ainda não segue ninguém</p>
              </div>
            ) : (
              <div className="space-y-3">
                {following.map((conn) => (
                  <motion.div
                    key={conn.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-800/50 rounded-xl p-4 flex items-center justify-between hover:bg-slate-800/70 transition border border-purple-500/20"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={conn.following_avatar || "https://via.placeholder.com/50"}
                        alt={conn.following_name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-purple-500"
                      />
                      <div>
                        <h4 className="font-bold text-white">{conn.following_name}</h4>
                        <p className="text-sm text-gray-400">@{conn.following_name.toLowerCase().replace(/\s/g, '')}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => unfollowMutation.mutate(conn.id)}
                      variant="outline"
                      className="border-slate-600 hover:bg-slate-700"
                    >
                      <UserMinus className="w-4 h-4 mr-2" />
                      Deixar de Seguir
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Seguidores */}
          <TabsContent value="followers" className="p-6 overflow-y-auto max-h-[60vh]">
            {followers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">Nenhum seguidor ainda</p>
              </div>
            ) : (
              <div className="space-y-3">
                {followers.map((follower) => {
                  const alreadyFollowing = isFollowing(follower.follower_id);
                  
                  return (
                    <motion.div
                      key={follower.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-800/50 rounded-xl p-4 flex items-center justify-between hover:bg-slate-800/70 transition border border-purple-500/20"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={follower.follower_avatar || "https://via.placeholder.com/50"}
                          alt={follower.follower_name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
                        />
                        <div>
                          <h4 className="font-bold text-white">{follower.follower_name}</h4>
                          <p className="text-sm text-gray-400">@{follower.follower_name.toLowerCase().replace(/\s/g, '')}</p>
                        </div>
                      </div>
                      {alreadyFollowing ? (
                        <Button
                          disabled
                          className="bg-green-600/50 cursor-default"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Seguindo
                        </Button>
                      ) : (
                        <Button
                          onClick={() => followBackMutation.mutate(follower)}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Seguir de Volta
                        </Button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
