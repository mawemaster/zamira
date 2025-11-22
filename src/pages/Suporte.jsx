import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Headphones, Send, FileText, CheckCircle, Clock, AlertCircle, MessageSquare, Upload
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categories = [
  { value: "tecnico", label: "🔧 Problema Técnico", description: "Bugs, erros, problemas no site" },
  { value: "financeiro", label: "💰 Financeiro", description: "Pagamentos, ouros, assinaturas" },
  { value: "conta", label: "👤 Conta", description: "Login, senha, perfil" },
  { value: "conteudo", label: "📝 Conteúdo", description: "Posts, comentários, moderação" },
  { value: "sugestao", label: "💡 Sugestão", description: "Ideias e melhorias" },
  { value: "outro", label: "🎯 Outro", description: "Outros assuntos" }
];

const statusColors = {
  aberto: { bg: "bg-blue-100", text: "text-blue-800", label: "Aberto" },
  em_andamento: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Em Andamento" },
  aguardando_usuario: { bg: "bg-purple-100", text: "text-purple-800", label: "Aguardando Você" },
  resolvido: { bg: "bg-green-100", text: "text-green-800", label: "Resolvido" },
  fechado: { bg: "bg-gray-100", text: "text-gray-800", label: "Fechado" }
};

export default function SuportePage() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    category: "",
    subject: "",
    message: "",
    attachments: []
  });
  const queryClient = useQueryClient();

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

  const { data: tickets } = useQuery({
    queryKey: ['support-tickets', user?.id],
    queryFn: () => base44.entities.SupportTicket.filter({ user_id: user.id }, "-created_date", 50),
    enabled: !!user,
    initialData: [],
    refetchInterval: 10000,
  });

  const createTicketMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.SupportTicket.create({
        user_id: user.id,
        user_name: user.display_name || user.full_name,
        user_email: user.email,
        category: data.category,
        subject: data.subject,
        message: data.message,
        attachments: data.attachments,
        status: "aberto",
        priority: "media"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      setFormData({ category: "", subject: "", message: "", attachments: [] });
      alert("✅ Chamado criado com sucesso! Nossa equipe entrará em contato em breve.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.category || !formData.subject || !formData.message) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    createTicketMutation.mutate(formData);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setFormData({
          ...formData,
          attachments: [...formData.attachments, file_url]
        });
      } catch (error) {
        alert("Erro ao fazer upload do arquivo");
      }
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Headphones className="w-12 h-12 text-purple-500 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 mb-6">
            <Headphones className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Central de Suporte</h1>
          <p className="text-slate-600 text-lg">Estamos aqui para ajudar você!</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Formulário */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white border-slate-200 p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Send className="w-6 h-6 text-purple-600" />
                Abrir Novo Chamado
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Categoria *
                  </label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="border-slate-300">
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          <div>
                            <p className="font-medium">{cat.label}</p>
                            <p className="text-xs text-slate-500">{cat.description}</p>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Assunto *
                  </label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Descreva brevemente o problema"
                    className="border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Descrição Detalhada *
                  </label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Descreva o problema com o máximo de detalhes possível"
                    className="border-slate-300 h-32"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Anexos (Opcional)
                  </label>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  />
                  {formData.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {formData.attachments.map((url, index) => (
                        <p key={index} className="text-xs text-slate-600">
                          ✅ Arquivo {index + 1} anexado
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={createTicketMutation.isPending}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {createTicketMutation.isPending ? "Enviando..." : "Enviar Chamado"}
                </Button>
              </form>
            </Card>
          </motion.div>

          {/* Meus Chamados */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white border-slate-200 p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-purple-600" />
                Meus Chamados
              </h2>

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {tickets.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-600">Nenhum chamado ainda</p>
                    <p className="text-sm text-slate-500">Crie um chamado para receber ajuda</p>
                  </div>
                ) : (
                  tickets.map((ticket) => {
                    const status = statusColors[ticket.status];
                    const categoryData = categories.find(c => c.value === ticket.category);
                    return (
                      <Card key={ticket.id} className="bg-slate-50 border-slate-200 p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-bold text-slate-900 mb-1">{ticket.subject}</h3>
                            <p className="text-xs text-slate-600 mb-2">{categoryData?.label}</p>
                          </div>
                          <Badge className={`${status.bg} ${status.text} border-none`}>
                            {status.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-700 mb-3 line-clamp-2">{ticket.message}</p>
                        {ticket.admin_response && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-2">
                            <p className="text-xs font-semibold text-green-800 mb-1">
                              ✅ Resposta da Equipe:
                            </p>
                            <p className="text-sm text-green-900">{ticket.admin_response}</p>
                          </div>
                        )}
                        <p className="text-xs text-slate-500">
                          {new Date(ticket.created_date).toLocaleString('pt-BR')}
                        </p>
                      </Card>
                    );
                  })
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <Card className="bg-blue-50 border-blue-200 p-4">
            <Clock className="w-8 h-8 text-blue-600 mb-2" />
            <h3 className="font-bold text-blue-900 mb-1">Tempo de Resposta</h3>
            <p className="text-sm text-blue-700">Respondemos em até 24 horas úteis</p>
          </Card>
          <Card className="bg-purple-50 border-purple-200 p-4">
            <CheckCircle className="w-8 h-8 text-purple-600 mb-2" />
            <h3 className="font-bold text-purple-900 mb-1">Acompanhamento</h3>
            <p className="text-sm text-purple-700">Você receberá notificações de atualizações</p>
          </Card>
          <Card className="bg-green-50 border-green-200 p-4">
            <AlertCircle className="w-8 h-8 text-green-600 mb-2" />
            <h3 className="font-bold text-green-900 mb-1">Prioridade</h3>
            <p className="text-sm text-green-700">Casos urgentes são tratados primeiro</p>
          </Card>
        </div>
      </div>
    </div>
  );
}