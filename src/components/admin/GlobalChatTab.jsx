import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Trash2, Send, Loader2, RefreshCw, AlertTriangle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function GlobalChatTab() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['admin-global-chat'],
    queryFn: () => base44.entities.ChatMessage.filter(
      { room_id: 'global' },
      "-created_date",
      500
    ),
    refetchInterval: 5000
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId) => {
      await base44.entities.ChatMessage.delete(messageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-global-chat'] });
      toast.success("Mensagem deletada");
    }
  });

  const resetChatMutation = useMutation({
    mutationFn: async () => {
      const allMessages = await base44.entities.ChatMessage.filter({ room_id: 'global' });
      await Promise.all(allMessages.map(msg => base44.entities.ChatMessage.delete(msg.id)));
      
      await base44.entities.ChatMessage.create({
        room_id: 'global',
        author_id: 'system',
        author_name: 'Zamira',
        author_avatar: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e5f6f991e09e82bef3795/a3f627646_imgi_2_337f3cf9e282bc41c87500e885414629.png',
        author_level: 99,
        author_archetype: 'none',
        message_type: 'text',
        content: '✨ Bem-vindos ao novo portal místico! Este é um espaço renovado para conexões profundas. Que as energias fluam! 🌙',
        reactions: {}
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-global-chat'] });
      toast.success("Chat global resetado com sucesso!");
      setShowConfirmReset(false);
    },
    onError: () => {
      toast.error("Erro ao resetar chat");
    }
  });

  const filteredMessages = messages.filter(msg =>
    msg.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.author_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Card className="bg-slate-900/50 border-purple-500/30 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-purple-300 flex items-center gap-2">
              <MessageSquare className="w-6 h-6" />
              Gerenciar Chat Global
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              {messages.length} mensagens • Atualização automática
            </p>
          </div>
          
          <Button
            onClick={() => setShowConfirmReset(true)}
            variant="destructive"
            className="bg-red-600 hover:bg-red-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Resetar Chat
          </Button>
        </div>

        <Input
          placeholder="Buscar mensagens ou usuários..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-slate-800 border-purple-900/30 mb-4"
        />
      </Card>

      {showConfirmReset && (
        <Card className="bg-red-900/20 border-red-500/30 p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-8 h-8 text-red-400 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-lg font-bold text-red-300 mb-2">
                Confirmar Reset do Chat Global
              </h4>
              <p className="text-gray-300 mb-4">
                Esta ação irá deletar TODAS as mensagens antigas e criar uma nova mensagem de boas-vindas. Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => resetChatMutation.mutate()}
                  disabled={resetChatMutation.isPending}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {resetChatMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Resetando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Confirmar Reset
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setShowConfirmReset(false)}
                  variant="outline"
                  className="border-gray-600"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {isLoading ? (
        <Card className="bg-slate-900/50 border-purple-500/30 p-12 text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Carregando mensagens...</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredMessages.map((msg) => (
            <Card key={msg.id} className="bg-slate-900/50 border-purple-500/30 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {msg.author_avatar && (
                      <img 
                        src={msg.author_avatar} 
                        alt="" 
                        className="w-10 h-10 rounded-full border-2 border-purple-500"
                      />
                    )}
                    <div>
                      <p className="text-white font-bold">{msg.author_name}</p>
                      <p className="text-xs text-gray-400">
                        Nv.{msg.author_level} • {formatDistanceToNow(new Date(msg.created_date), { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 mb-2">{msg.content}</p>
                  
                  {msg.message_type === 'audio' && msg.media_url && (
                    <audio controls className="w-full max-w-md">
                      <source src={msg.media_url} type="audio/webm" />
                    </audio>
                  )}
                </div>

                <Button
                  onClick={() => deleteMessageMutation.mutate(msg.id)}
                  disabled={deleteMessageMutation.isPending}
                  size="icon"
                  variant="ghost"
                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}