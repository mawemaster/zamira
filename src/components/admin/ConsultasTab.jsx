import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Calendar, Clock, DollarSign, Video, Edit2, Save, X,
  CheckCircle, AlertCircle, Activity, Users, TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const dayNames = {
  monday: "Segunda",
  tuesday: "Terça",
  wednesday: "Quarta",
  thursday: "Quinta",
  friday: "Sexta",
  saturday: "Sábado",
  sunday: "Domingo"
};

export default function ConsultasTab() {
  const queryClient = useQueryClient();
  const [editingSettings, setEditingSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    is_active: true,
    message: "",
    price: 200.00,
    duration_minutes: 60,
    available_days: [],
    available_hours: []
  });
  const [newHour, setNewHour] = useState("");

  // Buscar configurações
  const { data: settings, isLoading: loadingSettings } = useQuery({
    queryKey: ['admin-consultation-settings'],
    queryFn: async () => {
      const allSettings = await base44.entities.ConsultationSettings.list();
      if (allSettings.length > 0) {
        setSettingsForm(allSettings[0]);
        return allSettings[0];
      }
      return null;
    }
  });

  // Buscar todas as consultas
  const { data: consultations, isLoading: loadingConsultations } = useQuery({
    queryKey: ['admin-consultations'],
    queryFn: () => base44.entities.Consultation.list("-created_date", 100)
  });

  // Atualizar/Criar configurações
  const updateSettingsMutation = useMutation({
    mutationFn: async (data) => {
      if (settings?.id) {
        return await base44.entities.ConsultationSettings.update(settings.id, data);
      } else {
        return await base44.entities.ConsultationSettings.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-consultation-settings'] });
      setEditingSettings(false);
      toast.success("✓ Configurações atualizadas!");
    }
  });

  // Atualizar status da consulta
  const updateConsultationMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await base44.entities.Consultation.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-consultations'] });
      toast.success("✓ Consulta atualizada!");
    }
  });

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate(settingsForm);
  };

  const toggleDay = (day) => {
    const days = settingsForm.available_days || [];
    if (days.includes(day)) {
      setSettingsForm({
        ...settingsForm,
        available_days: days.filter(d => d !== day)
      });
    } else {
      setSettingsForm({
        ...settingsForm,
        available_days: [...days, day]
      });
    }
  };

  const addHour = () => {
    if (newHour && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(newHour)) {
      const hours = settingsForm.available_hours || [];
      if (!hours.includes(newHour)) {
        setSettingsForm({
          ...settingsForm,
          available_hours: [...hours, newHour].sort()
        });
      }
      setNewHour("");
    } else {
      toast.error("Formato inválido. Use HH:mm (ex: 09:00)");
    }
  };

  const removeHour = (hour) => {
    setSettingsForm({
      ...settingsForm,
      available_hours: settingsForm.available_hours.filter(h => h !== hour)
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-600';
      case 'pending_payment': return 'bg-yellow-600';
      case 'in_progress': return 'bg-blue-600';
      case 'completed': return 'bg-purple-600';
      case 'cancelled': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'pending_payment': return 'Aguardando Pagamento';
      case 'in_progress': return 'Em Andamento';
      case 'completed': return 'Concluída';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  // Estatísticas
  const totalConsultations = consultations?.length || 0;
  const confirmedCount = consultations?.filter(c => c.status === 'confirmed').length || 0;
  const completedCount = consultations?.filter(c => c.status === 'completed').length || 0;
  const totalRevenue = consultations?.filter(c => c.status === 'completed').reduce((sum, c) => sum + (c.price_paid || 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header com Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-500/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">{totalConsultations}</p>
          <p className="text-xs text-blue-300">Total de Consultas</p>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-500/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <Activity className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white">{confirmedCount}</p>
          <p className="text-xs text-green-300">Confirmadas</p>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-500/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <Video className="w-5 h-5 text-purple-400" />
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white">{completedCount}</p>
          <p className="text-xs text-purple-300">Realizadas</p>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 border-yellow-500/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-yellow-400" />
            <TrendingUp className="w-4 h-4 text-yellow-400" />
          </div>
          <p className="text-2xl font-bold text-white">R$ {totalRevenue.toFixed(2)}</p>
          <p className="text-xs text-yellow-300">Faturamento</p>
        </Card>
      </div>

      {/* Configurações */}
      <Card className="bg-white border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Configurações do Sistema</h2>
            <p className="text-slate-600">Gerencie disponibilidade e preços</p>
          </div>
          {!editingSettings ? (
            <Button onClick={() => setEditingSettings(true)} variant="outline">
              <Edit2 className="w-4 h-4 mr-2" />
              Editar
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSaveSettings} disabled={updateSettingsMutation.isPending}>
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
              <Button onClick={() => setEditingSettings(false)} variant="outline">
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          )}
        </div>

        {editingSettings ? (
          <div className="space-y-6">
            {/* Status Ativo/Inativo */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="font-semibold text-slate-900">Sistema de Agendamento</p>
                <p className="text-sm text-slate-600">Ativar ou desativar agendamentos</p>
              </div>
              <Switch
                checked={settingsForm.is_active}
                onCheckedChange={(checked) => setSettingsForm({ ...settingsForm, is_active: checked })}
              />
            </div>

            {/* Mensagem */}
            <div>
              <label className="text-sm font-semibold text-slate-900 mb-2 block">
                Mensagem de Status
              </label>
              <Textarea
                value={settingsForm.message}
                onChange={(e) => setSettingsForm({ ...settingsForm, message: e.target.value })}
                placeholder="Mensagem exibida quando o sistema está ativo ou inativo..."
                className="bg-slate-50"
                rows={3}
              />
            </div>

            {/* Preço */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-900 mb-2 block">
                  Preço (R$)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={settingsForm.price}
                  onChange={(e) => setSettingsForm({ ...settingsForm, price: parseFloat(e.target.value) })}
                  className="bg-slate-50"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-900 mb-2 block">
                  Duração (minutos)
                </label>
                <Input
                  type="number"
                  value={settingsForm.duration_minutes}
                  onChange={(e) => setSettingsForm({ ...settingsForm, duration_minutes: parseInt(e.target.value) })}
                  className="bg-slate-50"
                />
              </div>
            </div>

            {/* Dias Disponíveis */}
            <div>
              <label className="text-sm font-semibold text-slate-900 mb-3 block">
                Dias da Semana Disponíveis
              </label>
              <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                {Object.entries(dayNames).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => toggleDay(key)}
                    className={`p-3 rounded-lg border-2 transition ${
                      settingsForm.available_days?.includes(key)
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <p className="text-xs font-semibold">{label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Horários */}
            <div>
              <label className="text-sm font-semibold text-slate-900 mb-3 block">
                Horários Disponíveis
              </label>
              <div className="flex gap-2 mb-3">
                <Input
                  value={newHour}
                  onChange={(e) => setNewHour(e.target.value)}
                  placeholder="HH:mm (ex: 09:00)"
                  className="flex-1"
                />
                <Button onClick={addHour}>
                  Adicionar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(settingsForm.available_hours || []).map((hour) => (
                  <Badge key={hour} className="bg-purple-600 text-white px-3 py-1.5 text-sm">
                    <Clock className="w-3 h-3 mr-2" />
                    {hour}
                    <button
                      onClick={() => removeHour(hour)}
                      className="ml-2 hover:text-red-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Status</p>
                <Badge className={settings?.is_active ? 'bg-green-600' : 'bg-red-600'}>
                  {settings?.is_active ? '✓ Ativo' : '✗ Inativo'}
                </Badge>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Preço</p>
                <p className="text-lg font-bold text-slate-900">R$ {settings?.price?.toFixed(2)}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Duração</p>
                <p className="text-lg font-bold text-slate-900">{settings?.duration_minutes} min</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Horários</p>
                <p className="text-lg font-bold text-slate-900">{settings?.available_hours?.length || 0}</p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Lista de Consultas */}
      <Card className="bg-white border-slate-200 p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Consultas Agendadas</h2>
        
        {loadingConsultations ? (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-purple-600 animate-pulse mx-auto mb-4" />
            <p className="text-slate-600">Carregando consultas...</p>
          </div>
        ) : consultations && consultations.length > 0 ? (
          <div className="space-y-3">
            {consultations.map((consultation) => (
              <motion.div
                key={consultation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-slate-50 border-slate-200 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge className={getStatusColor(consultation.status)}>
                          {getStatusText(consultation.status)}
                        </Badge>
                        <p className="text-slate-600 text-sm">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {format(parseISO(consultation.scheduled_date), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                        <p className="text-slate-600 text-sm">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {consultation.scheduled_time}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-slate-500">Cliente</p>
                          <p className="text-sm font-semibold text-slate-900">{consultation.user_name}</p>
                          <p className="text-xs text-slate-600">{consultation.user_email}</p>
                          {consultation.user_phone && (
                            <p className="text-xs text-slate-600">{consultation.user_phone}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Valor</p>
                          <p className="text-sm font-bold text-green-600">R$ {consultation.price_paid?.toFixed(2)}</p>
                        </div>
                      </div>

                      {consultation.notes && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-xs text-blue-600 mb-1">Observações do Cliente:</p>
                          <p className="text-sm text-slate-700">{consultation.notes}</p>
                        </div>
                      )}

                      {consultation.admin_notes && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-xs text-yellow-600 mb-1">Notas Privadas:</p>
                          <p className="text-sm text-slate-700">{consultation.admin_notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      {consultation.status === 'confirmed' && (
                        <Button
                          size="sm"
                          onClick={() => window.open(createPageUrl(`RoomConsulta?id=${consultation.id}`), '_blank')}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <Video className="w-3 h-3 mr-2" />
                          Entrar
                        </Button>
                      )}
                      
                      {consultation.status === 'pending_payment' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (confirm('Confirmar pagamento manualmente?')) {
                              updateConsultationMutation.mutate({
                                id: consultation.id,
                                data: { status: 'confirmed' }
                              });
                            }
                          }}
                        >
                          Confirmar
                        </Button>
                      )}

                      {consultation.status === 'in_progress' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (confirm('Marcar como concluída?')) {
                              updateConsultationMutation.mutate({
                                id: consultation.id,
                                data: { status: 'completed' }
                              });
                            }
                          }}
                        >
                          Concluir
                        </Button>
                      )}

                      {!['completed', 'cancelled'].includes(consultation.status) && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600"
                          onClick={() => {
                            const reason = prompt('Motivo do cancelamento:');
                            if (reason) {
                              updateConsultationMutation.mutate({
                                id: consultation.id,
                                data: { 
                                  status: 'cancelled',
                                  cancelled_reason: reason
                                }
                              });
                            }
                          }}
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">Nenhuma consulta agendada ainda</p>
          </div>
        )}
      </Card>
    </div>
  );
}