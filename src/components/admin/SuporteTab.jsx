import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Headphones, Search, MessageSquare, CheckCircle, Clock, Activity, Send, X
} from "lucide-react";
import { motion } from "framer-motion";

const statusColors = {
  aberto: { bg: "bg-blue-100", text: "text-blue-800", label: "Aberto" },
  em_andamento: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Em Andamento" },
  aguardando_usuario: { bg: "bg-purple-100", text: "text-purple-800", label: "Aguardando Usuário" },
  resolvido: { bg: "bg-green-100", text: "text-green-800", label: "Resolvido" },
  fechado: { bg: "bg-gray-100", text: "text-gray-800", label: "Fechado" }
};

export default function SuporteTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [responseText, setResponseText] = useState("");
  const queryClient = useQueryClient();

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['admin-support-tickets'],
    queryFn: () => base44.entities.SupportTicket.list("-created_date", 200),
    refetchInterval: 10000,
  });

  const respondTicketMutation = useMutation({
    mutationFn: async ({ ticketId, response, status }) => {
      await base44.entities.SupportTicket.update(ticketId, {
        admin_response: response,
        status: status
      });
      
      // Criar notificação para o usuário
      const ticket = tickets.find(t => t.id === ticketId);
      if (ticket) {
        await base44.entities.Notification.create({
          user_id: ticket.user_id,
          type: "announcement",
          title: "✅ Resposta do Suporte",
          message: `Seu chamado "${ticket.subject}" recebeu uma resposta!`,
          from_user_id: "admin",
          from_user_name: "Equipe Zamira",
          related_entity_type: "support",
          related_entity_id: ticketId
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] });
      setSelectedTicket(null);
      setResponseText("");
      alert("Resposta enviada com sucesso!");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ ticketId, status }) => {
      return await base44.entities.SupportTicket.update(ticketId, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] });
    },
  });

  const filteredTickets = tickets?.filter(ticket => {
    const query = searchQuery.toLowerCase();
    return (
      ticket.subject?.toLowerCase().includes(query) ||
      ticket.user_name?.toLowerCase().includes(query) ||
      ticket.user_email?.toLowerCase().includes(query) ||
      ticket.category?.toLowerCase().includes(query)
    );
  }) || [];

  const handleRespond = () => {
    if (selectedTicket && responseText.trim()) {
      respondTicketMutation.mutate({
        ticketId: selectedTicket.id,
        response: responseText,
        status: "aguardando_usuario"
      });
    }
  };

  const openTickets = filteredTickets.filter(t => t.status === 'aberto' || t.status === 'em_andamento');
  const resolvedTickets = filteredTickets.filter(t => t.status === 'resolvido' || t.status === 'fechado');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gerenciar Suporte</h2>
          <p className="text-slate-600">{openTickets.length} chamados abertos</p>
        </div>
      </div>

      <Card className="bg-white border-slate-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar chamados..."
            className="pl-10 border-slate-300"
          />
        </div>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-white border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-slate-900">{openTickets.length}</p>
              <p className="text-sm text-slate-600">Abertos</p>
            </div>
          </div>
        </Card>
        <Card className="bg-white border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-slate-900">{resolvedTickets.length}</p>
              <p className="text-sm text-slate-600">Resolvidos</p>
            </div>
          </div>
        </Card>
        <Card className="bg-white border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <Headphones className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-slate-900">{filteredTickets.length}</p>
              <p className="text-sm text-slate-600">Total</p>
            </div>
          </div>
        </Card>
      </div>

      {selectedTicket && (
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-300 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              Responder Chamado
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedTicket(null)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="bg-white rounded-lg p-4 mb-4">
            <p className="text-sm text-slate-600 mb-1">De: {selectedTicket.user_name} ({selectedTicket.user_email})</p>
            <p className="text-sm text-slate-600 mb-2">Assunto: {selectedTicket.subject}</p>
            <p className="text-slate-900">{selectedTicket.message}</p>
          </div>
          <Textarea
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            placeholder="Digite sua resposta..."
            className="mb-4 h-32"
          />
          <Button
            onClick={handleRespond}
            disabled={respondTicketMutation.isPending}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Send className="w-4 h-4 mr-2" />
            Enviar Resposta
          </Button>
        </Card>
      )}

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-purple-600 animate-pulse mx-auto mb-4" />
            <p className="text-slate-600">Carregando chamados...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <Card className="bg-white border-slate-200 p-12 text-center">
            <Headphones className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">Nenhum chamado encontrado</p>
          </Card>
        ) : (
          filteredTickets.map((ticket, index) => {
            const status = statusColors[ticket.status];
            return (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
              >
                <Card className="bg-white border-slate-200 p-4 hover:shadow-md transition">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                      {ticket.user_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-bold text-slate-900">{ticket.user_name}</p>
                        <Badge className={`${status.bg} ${status.text} border-none text-xs`}>
                          {status.label}
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          {ticket.category}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-slate-900 mb-1">{ticket.subject}</h3>
                      <p className="text-sm text-slate-700 mb-2 line-clamp-2">{ticket.message}</p>
                      {ticket.admin_response && (
                        <div className="bg-green-50 border border-green-200 rounded p-2 mb-2">
                          <p className="text-xs font-semibold text-green-800 mb-1">Sua Resposta:</p>
                          <p className="text-sm text-green-900">{ticket.admin_response}</p>
                        </div>
                      )}
                      <p className="text-xs text-slate-500">
                        {new Date(ticket.created_date).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTicket(ticket)}
                        className="border-purple-300 text-purple-600"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Responder
                      </Button>
                      <select
                        value={ticket.status}
                        onChange={(e) => updateStatusMutation.mutate({
                          ticketId: ticket.id,
                          status: e.target.value
                        })}
                        className="text-xs px-2 py-1 border border-slate-300 rounded"
                      >
                        <option value="aberto">Aberto</option>
                        <option value="em_andamento">Em Andamento</option>
                        <option value="aguardando_usuario">Aguardando</option>
                        <option value="resolvido">Resolvido</option>
                        <option value="fechado">Fechado</option>
                      </select>
                    </div>
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