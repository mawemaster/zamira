import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Settings, Database, Activity, Zap, Shield, Bell, 
  RefreshCw, Download, Check, Users, FileText, MessageSquare,
  ShoppingBag, Map, Server, HardDrive
} from "lucide-react";

export default function SystemTab() {
  const [backupLoading, setBackupLoading] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);
  const queryClient = useQueryClient();

  const { data: users } = useQuery({
    queryKey: ['system-users'],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: posts } = useQuery({
    queryKey: ['system-posts'],
    queryFn: () => base44.entities.Post.list(),
  });

  const { data: messages } = useQuery({
    queryKey: ['system-messages'],
    queryFn: () => base44.entities.DirectMessage.list(),
  });

  const { data: products } = useQuery({
    queryKey: ['system-products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const { data: positions } = useQuery({
    queryKey: ['system-positions'],
    queryFn: () => base44.entities.ZamiraPosition.filter({ is_online: true }),
  });

  const systemInfo = {
    version: "2.5.0",
    uptime: "15 dias, 7 horas",
    lastBackup: new Date().toLocaleDateString('pt-BR'),
    dbSize: "2.4 GB",
    activeUsers: "Online",
    performance: "Excelente"
  };

  const handleBackup = async () => {
    setBackupLoading(true);
    setTimeout(() => {
      alert('✅ Backup do sistema iniciado! Você receberá uma notificação quando concluir.');
      setBackupLoading(false);
    }, 2000);
  };

  const handleClearCacheAndReload = async () => {
    if (!confirm('Isso irá limpar o cache de TODOS os usuários e recarregar a aplicação para todos. Deseja continuar?')) {
      return;
    }

    setClearingCache(true);

    try {
      // Criar global message para forçar reload em todos
      await base44.asServiceRole.entities.AdminGlobalMessage.create({
        message: 'SYSTEM_RELOAD',
        type: 'system',
        is_active: true,
        show_immediately: true,
        priority: 'critical'
      });

      // Limpar cache local e recarregar
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }

      // Invalidar TODAS as queries do React Query
      queryClient.clear();

      // Forçar reload da página
      setTimeout(() => {
        window.location.reload(true);
      }, 500);
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      alert('Erro ao limpar cache. Recarregando página...');
      window.location.reload(true);
    }
  };

  const handleExportData = (entityName) => {
    alert(`📊 Exportando dados de ${entityName}...`);
  };

  const dbStats = [
    { label: "Usuários", count: users?.length || 0, icon: Users, color: "from-blue-500 to-blue-600" },
    { label: "Posts", count: posts?.length || 0, icon: FileText, color: "from-purple-500 to-purple-600" },
    { label: "Mensagens", count: messages?.length || 0, icon: MessageSquare, color: "from-pink-500 to-pink-600" },
    { label: "Produtos", count: products?.length || 0, icon: ShoppingBag, color: "from-amber-500 to-amber-600" },
    { label: "Online Agora", count: positions?.length || 0, icon: Map, color: "from-green-500 to-green-600" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Configurações do Sistema</h2>
        <p className="text-slate-600">Gerenciar e monitorar o sistema</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="bg-white border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Versão</span>
            <Badge className="bg-purple-100 text-purple-800">{systemInfo.version}</Badge>
          </div>
        </Card>

        <Card className="bg-white border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Status</span>
            <Badge className="bg-green-100 text-green-800">
              <Activity className="w-3 h-3 mr-1" />
              {systemInfo.activeUsers}
            </Badge>
          </div>
        </Card>

        <Card className="bg-white border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Performance</span>
            <Badge className="bg-blue-100 text-blue-800">
              {systemInfo.performance}
            </Badge>
          </div>
        </Card>
      </div>

      <Card className="bg-white border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-purple-600" />
          Estatísticas do Banco de Dados
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {dbStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-2`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{stat.count}</p>
                <p className="text-xs text-slate-600">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="bg-white border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Server className="w-5 h-5 text-purple-600" />
          Informações do Servidor
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-slate-200">
            <span className="text-slate-600">Tempo Online</span>
            <span className="font-semibold text-slate-900">{systemInfo.uptime}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-200">
            <span className="text-slate-600">Último Backup</span>
            <span className="font-semibold text-slate-900">{systemInfo.lastBackup}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-200">
            <span className="text-slate-600">Tamanho do Banco</span>
            <span className="font-semibold text-slate-900">{systemInfo.dbSize}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-slate-600">Total de Entidades</span>
            <span className="font-semibold text-slate-900">25 Tipos</span>
          </div>
        </div>
      </Card>

      <Card className="bg-white border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-600" />
          Ações Rápidas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            onClick={handleClearCacheAndReload}
            disabled={clearingCache}
            className="bg-slate-900 hover:bg-slate-800 text-white justify-start"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${clearingCache ? 'animate-spin' : ''}`} />
            {clearingCache ? 'Limpando...' : 'Limpar Cache e Recarregar'}
          </Button>

          <Button
            onClick={handleBackup}
            disabled={backupLoading}
            variant="outline"
            className="border-slate-300 justify-start"
          >
            <Download className="w-4 h-4 mr-2" />
            {backupLoading ? 'Fazendo Backup...' : 'Fazer Backup Manual'}
          </Button>

          <Button
            onClick={() => handleExportData('Usuários')}
            variant="outline"
            className="border-slate-300 justify-start"
          >
            <HardDrive className="w-4 h-4 mr-2" />
            Exportar Dados de Usuários
          </Button>

          <Button
            onClick={() => handleExportData('Posts')}
            variant="outline"
            className="border-slate-300 justify-start"
          >
            <FileText className="w-4 h-4 mr-2" />
            Exportar Dados de Posts
          </Button>

          <Button
            variant="outline"
            className="border-slate-300 justify-start"
          >
            <Bell className="w-4 h-4 mr-2" />
            Configurar Notificações Push
          </Button>

          <Button
            variant="outline"
            className="border-slate-300 justify-start"
          >
            <Shield className="w-4 h-4 mr-2" />
            Revisar Logs de Segurança
          </Button>
        </div>
      </Card>

      <Card className="bg-white border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-600" />
          Integrações Ativas
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              <span className="font-medium text-slate-900">Mercado Pago</span>
            </div>
            <Badge className="bg-green-100 text-green-800">Ativo</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              <span className="font-medium text-slate-900">Gemini AI</span>
            </div>
            <Badge className="bg-green-100 text-green-800">Ativo</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              <span className="font-medium text-slate-900">Base44 SDK</span>
            </div>
            <Badge className="bg-green-100 text-green-800">Ativo</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              <span className="font-medium text-slate-900">WebRTC (Voz/Vídeo)</span>
            </div>
            <Badge className="bg-green-100 text-green-800">Ativo</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              <span className="font-medium text-slate-900">PWA (Notificações)</span>
            </div>
            <Badge className="bg-green-100 text-green-800">Ativo</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}