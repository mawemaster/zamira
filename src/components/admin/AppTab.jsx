import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Smartphone, Save, Upload, Download, Users, TrendingUp, 
  Activity, Eye, Settings, Palette, Image as ImageIcon
} from "lucide-react";
import { motion } from "framer-motion";

export default function AppTab() {
  const [editData, setEditData] = useState(null);
  const queryClient = useQueryClient();

  const { data: appSettings, isLoading } = useQuery({
    queryKey: ['app-settings'],
    queryFn: async () => {
      const settings = await base44.entities.AppSettings.list();
      return settings[0] || null;
    },
  });

  const { data: users } = useQuery({
    queryKey: ['app-users-count'],
    queryFn: () => base44.entities.User.list(),
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (data) => {
      if (appSettings) {
        return await base44.entities.AppSettings.update(appSettings.id, data);
      }
      return await base44.entities.AppSettings.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-settings'] });
      setEditData(null);
      alert('✅ Configurações do App salvas!');
    },
  });

  const handleImageUpload = async (e, field) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setEditData({ ...editData, [field]: file_url });
        alert('✅ Imagem enviada!');
      } catch (error) {
        alert('Erro: ' + error.message);
      }
    }
  };

  const handleSave = () => {
    if (editData) {
      saveSettingsMutation.mutate({
        ...editData,
        last_updated: new Date().toISOString(),
        total_users: users?.length || 0
      });
    }
  };

  React.useEffect(() => {
    if (appSettings) {
      setEditData(appSettings);
    } else {
      setEditData({
        app_name: "Zamira - Portal Místico",
        app_short_name: "Zamira",
        app_description: "Sua jornada mística começa aqui",
        theme_color: "#9333EA",
        background_color: "#02031C",
        version: "1.0.0",
        total_installs: 0,
        is_maintenance_mode: false
      });
    }
  }, [appSettings]);

  if (isLoading || !editData) {
    return (
      <div className="text-center py-12">
        <Activity className="w-12 h-12 text-purple-600 animate-pulse mx-auto mb-4" />
        <p className="text-slate-600">Carregando configurações...</p>
      </div>
    );
  }

  const stats = [
    {
      label: "Instalações",
      value: editData.total_installs || 0,
      icon: Download,
      color: "from-blue-500 to-blue-600"
    },
    {
      label: "Usuários Ativos",
      value: users?.length || 0,
      icon: Users,
      color: "from-purple-500 to-purple-600"
    },
    {
      label: "Versão Atual",
      value: editData.version || "1.0.0",
      icon: Settings,
      color: "from-green-500 to-green-600"
    }
  ];

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Smartphone className="w-7 h-7" />
          Configurações do Aplicativo
        </h2>
        <p className="text-slate-600">Gerencie todas as configurações do PWA</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-white border-slate-200 p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-sm text-slate-600">{stat.label}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Identidade Visual */}
      <Card className="bg-white border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5 text-purple-600" />
          Identidade Visual
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Nome do App */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Nome do Aplicativo
            </label>
            <Input
              value={editData.app_name || ''}
              onChange={(e) => setEditData({...editData, app_name: e.target.value})}
              className="border-slate-300"
            />
          </div>

          {/* Nome Curto */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Nome Curto (para ícone)
            </label>
            <Input
              value={editData.app_short_name || ''}
              onChange={(e) => setEditData({...editData, app_short_name: e.target.value})}
              className="border-slate-300"
            />
          </div>

          {/* Descrição */}
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Descrição
            </label>
            <Textarea
              value={editData.app_description || ''}
              onChange={(e) => setEditData({...editData, app_description: e.target.value})}
              className="border-slate-300"
              rows={3}
            />
          </div>

          {/* Versão */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Versão
            </label>
            <Input
              value={editData.version || ''}
              onChange={(e) => setEditData({...editData, version: e.target.value})}
              className="border-slate-300"
              placeholder="1.0.0"
            />
          </div>

          {/* Total Instalações */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Total de Instalações
            </label>
            <Input
              type="number"
              value={editData.total_installs || 0}
              onChange={(e) => setEditData({...editData, total_installs: parseInt(e.target.value)})}
              className="border-slate-300"
            />
          </div>
        </div>
      </Card>

      {/* Cores */}
      <Card className="bg-white border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5 text-purple-600" />
          Cores do Tema
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Cor do Tema
            </label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={editData.theme_color || '#9333EA'}
                onChange={(e) => setEditData({...editData, theme_color: e.target.value})}
                className="w-20 h-10 border-slate-300"
              />
              <Input
                value={editData.theme_color || ''}
                onChange={(e) => setEditData({...editData, theme_color: e.target.value})}
                className="flex-1 border-slate-300"
                placeholder="#9333EA"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Cor de Fundo
            </label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={editData.background_color || '#02031C'}
                onChange={(e) => setEditData({...editData, background_color: e.target.value})}
                className="w-20 h-10 border-slate-300"
              />
              <Input
                value={editData.background_color || ''}
                onChange={(e) => setEditData({...editData, background_color: e.target.value})}
                className="flex-1 border-slate-300"
                placeholder="#02031C"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Ícones e Imagens */}
      <Card className="bg-white border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-purple-600" />
          Ícones e Imagens
        </h3>

        <div className="space-y-4">
          {/* Logo Principal */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Logo Principal
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'app_logo_url')}
              className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-purple-50 file:text-purple-700 mb-2"
            />
            {editData.app_logo_url && (
              <img src={editData.app_logo_url} className="w-32 h-32 object-contain border rounded" />
            )}
          </div>

          {/* Ícone 512x512 */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Ícone 512x512 (PWA)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'app_icon_512_url')}
              className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-purple-50 file:text-purple-700 mb-2"
            />
            {editData.app_icon_512_url && (
              <img src={editData.app_icon_512_url} className="w-32 h-32 object-contain border rounded" />
            )}
          </div>

          {/* Ícone 192x192 */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Ícone 192x192 (PWA)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'app_icon_192_url')}
              className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-purple-50 file:text-purple-700 mb-2"
            />
            {editData.app_icon_192_url && (
              <img src={editData.app_icon_192_url} className="w-32 h-32 object-contain border rounded" />
            )}
          </div>

          {/* Splash Screen */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Tela de Splash (Carregamento)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'app_splash_url')}
              className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-purple-50 file:text-purple-700 mb-2"
            />
            {editData.app_splash_url && (
              <img src={editData.app_splash_url} className="w-full max-w-sm h-auto object-contain border rounded" />
            )}
          </div>
        </div>
      </Card>

      {/* Modo Manutenção Geral */}
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300 p-6">
        <h3 className="text-lg font-bold text-amber-900 mb-4">
          🔧 Modo Manutenção Geral do App
        </h3>
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={editData.is_maintenance_mode || false}
              onChange={(e) => setEditData({...editData, is_maintenance_mode: e.target.checked})}
            />
            <span className="text-sm font-medium">Ativar Modo Manutenção</span>
          </label>
          {editData.is_maintenance_mode && (
            <Textarea
              value={editData.maintenance_message || ''}
              onChange={(e) => setEditData({...editData, maintenance_message: e.target.value})}
              placeholder="Mensagem que será exibida aos usuários..."
              className="border-amber-300"
              rows={3}
            />
          )}
        </div>
      </Card>

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saveSettingsMutation.isPending}
          className="bg-purple-600 hover:bg-purple-700 text-white"
          size="lg"
        >
          <Save className="w-5 h-5 mr-2" />
          Salvar Configurações do App
        </Button>
      </div>
    </div>
  );
}