import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Trash2, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import UserAvatar from "../UserAvatar";

export default function MessagesTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data: ravens = [], isLoading } = useQuery({
    queryKey: ['admin-ravens'],
    queryFn: async () => {
      return await base44.asServiceRole.entities.Raven.list("-created_date", 100);
    },
    refetchInterval: 5000
  });

  const deleteRavenMutation = useMutation({
    mutationFn: async (ravenId) => {
      await base44.asServiceRole.entities.Raven.delete(ravenId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ravens'] });
    }
  });

  const filteredRavens = ravens.filter(raven => 
    raven?.sender_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    raven?.recipient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    raven?.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar corvos..."
            className="pl-10 bg-slate-800 border-purple-900/30 text-white"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredRavens.length === 0 ? (
          <div className="text-center py-12">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e5f6f991e09e82bef3795/4332b5385_corvo.png" 
              alt="Nenhum corvo" 
              className="w-24 h-24 mx-auto mb-4 opacity-50"
            />
            <p className="text-gray-400">Nenhum corvo encontrado</p>
          </div>
        ) : (
          filteredRavens.map((raven) => {
            if (!raven) return null;
            return (
              <motion.div
                key={raven.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-slate-900/50 border-purple-500/30 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <UserAvatar 
                          user={{
                            avatar_url: raven.sender_avatar || '',
                            display_name: raven.sender_name || 'Viajante',
                            full_name: raven.sender_name || 'Viajante'
                          }} 
                          size="sm" 
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-bold">{raven.sender_name || 'Viajante'}</span>
                            <Send className="w-4 h-4 text-purple-400" />
                            <span className="text-white font-bold">{raven.recipient_name || 'Viajante'}</span>
                          </div>
                          <span className="text-xs text-gray-400">
                            {formatDistanceToNow(new Date(raven.created_date), { 
                              addSuffix: true, 
                              locale: ptBR 
                            })}
                          </span>
                        </div>
                        {raven.is_read ? (
                          <Badge className="bg-green-900/30 text-green-400">Lido</Badge>
                        ) : (
                          <Badge className="bg-purple-900/30 text-purple-400">Não lido</Badge>
                        )}
                      </div>

                      <p className="text-gray-300 text-sm mb-2 bg-slate-800/50 p-3 rounded-lg">
                        {raven.message || ''}
                      </p>

                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>ID: {raven.id}</span>
                        {raven.read_at && (
                          <span>• Lido em: {new Date(raven.read_at).toLocaleString('pt-BR')}</span>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={() => {
                        if (confirm('Excluir este corvo?')) {
                          deleteRavenMutation.mutate(raven.id);
                        }
                      }}
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}