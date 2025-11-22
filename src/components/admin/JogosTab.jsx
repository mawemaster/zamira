import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Map, Swords, Activity, AlertCircle, CheckCircle, Clock
} from "lucide-react";
import { motion } from "framer-motion";

const systems = [
  { 
    id: "zamira_city", 
    label: "Cidade de Zamira", 
    icon: Map, 
    color: "from-teal-500 to-teal-600",
    description: "Metaverso 2D com interação em tempo real"
  },
  { 
    id: "arena", 
    label: "Arena de Duelos", 
    icon: Swords, 
    color: "from-red-500 to-red-600",
    description: "Sistema de batalhas místicas e competições"
  },
  { 
    id: "voice", 
    label: "Voice (VOCEM)", 
    icon: Activity, 
    color: "from-purple-500 to-purple-600",
    description: "Sistema de áudios místicos"
  },
  { 
    id: "portals", 
    label: "Portais Místicos", 
    icon: Activity, 
    color: "from-blue-500 to-blue-600",
    description: "Tarot, Astrologia, etc"
  },
  { 
    id: "shop", 
    label: "Loja Mística", 
    icon: Activity, 
    color: "from-amber-500 to-amber-600",
    description: "E-commerce de produtos"
  },
  { 
    id: "chat", 
    label: "Chat Global", 
    icon: Activity, 
    color: "from-pink-500 to-pink-600",
    description: "Sistema de mensagens"
  }
];

export default function JogosTab() {
  const [editingSystem, setEditingSystem] = useState(null);
  const [maintenanceData, setMaintenanceData] = useState({
    maintenance_message: "",
    maintenance_end_time: ""
  });
  const queryClient = useQueryClient();

  const { data: systemStatuses, isLoading } = useQuery({
    queryKey: ['admin-system-status'],
    queryFn: () => base44.entities.SystemStatus.list(),
  });

  const toggleMaintenanceMutation = useMutation({
    mutationFn: async ({ systemName, maintenanceMode, message, endTime }) => {
      const existing = systemStatuses?.find(s => s.system_name === systemName);
      
      if (existing) {
        return await base44.entities.SystemStatus.update(existing.id, {
          maintenance_mode: maintenanceMode,
          maintenance_message: message,
          maintenance_end_time: endTime
        });
      }
      
      return await base44.entities.SystemStatus.create({
        system_name: systemName,
        is_active: true,
        maintenance_mode: maintenanceMode,
        maintenance_message: message,
        maintenance_end_time: endTime
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-system-status'] });
      setEditingSystem(null);
      alert('✅ Status atualizado!');
    },
  });

  const getSystemStatus = (systemId) => {
    return systemStatuses?.find(s => s.system_name === systemId);
  };

  const handleToggleMaintenance = (systemId, enable) => {
    if (enable && editingSystem !== systemId) {
      setEditingSystem(systemId);
    } else if (!enable) {
      toggleMaintenanceMutation.mutate({
        systemName: systemId,
        maintenanceMode: false,
        message: "",
        endTime: ""
      });
    } else {
      toggleMaintenanceMutation.mutate({
        systemName: systemId,
        maintenanceMode: true,
        message: maintenanceData.maintenance_message,
        endTime: maintenanceData.maintenance_end_time
      });
      setMaintenanceData({ maintenance_message: "", maintenance_end_time: "" });
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Gerenciar Jogos e Sistemas</h2>
        <p className="text-slate-600">Controle de manutenção e status dos sistemas</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {systems.map((system) => {
          const Icon = system.icon;
          const status = getSystemStatus(system.id);
          const inMaintenance = status?.maintenance_mode;
          const isEditing = editingSystem === system.id;

          return (
            <motion.div
              key={system.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-white border-slate-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${system.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{system.label}</h3>
                      <p className="text-xs text-slate-600">{system.description}</p>
                    </div>
                  </div>
                  {inMaintenance ? (
                    <Badge className="bg-red-100 text-red-800 border-red-300">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Manutenção
                    </Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-800 border-green-300">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Ativo
                    </Badge>
                  )}
                </div>

                {inMaintenance && status && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-red-900 mb-1">
                      <strong>Mensagem:</strong> {status.maintenance_message}
                    </p>
                    {status.maintenance_end_time && (
                      <p className="text-xs text-red-700 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Retorno previsto: {new Date(status.maintenance_end_time).toLocaleString('pt-BR')}
                      </p>
                    )}
                  </div>
                )}

                {isEditing && (
                  <div className="space-y-3 mb-4">
                    <Textarea
                      placeholder="Mensagem de manutenção para os usuários..."
                      value={maintenanceData.maintenance_message}
                      onChange={(e) => setMaintenanceData({
                        ...maintenanceData,
                        maintenance_message: e.target.value
                      })}
                      rows={3}
                      className="text-sm"
                    />
                    <Input
                      type="datetime-local"
                      value={maintenanceData.maintenance_end_time}
                      onChange={(e) => setMaintenanceData({
                        ...maintenanceData,
                        maintenance_end_time: e.target.value
                      })}
                      className="text-sm"
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  {inMaintenance ? (
                    <Button
                      onClick={() => handleToggleMaintenance(system.id, false)}
                      disabled={toggleMaintenanceMutation.isPending}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Ativar Sistema
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleToggleMaintenance(system.id, true)}
                      disabled={toggleMaintenanceMutation.isPending}
                      variant="outline"
                      className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Modo Manutenção
                    </Button>
                  )}
                  {isEditing && (
                    <Button
                      onClick={() => handleToggleMaintenance(system.id, true)}
                      disabled={toggleMaintenanceMutation.isPending}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Confirmar
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-300 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-2">ℹ️ Informações</h3>
        <ul className="text-sm text-slate-700 space-y-1">
          <li>• <strong>Modo Manutenção:</strong> Usuários verão mensagem ao tentar acessar</li>
          <li>• <strong>Sistema Ativo:</strong> Funcionamento normal</li>
          <li>• <strong>Previsão de Retorno:</strong> Opcional, informa aos usuários quando volta</li>
        </ul>
      </Card>
    </div>
  );
}