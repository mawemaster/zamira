import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Globe, Bell, Lock, User as UserIcon, Circle } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const languages = [
  { value: 'pt-BR', label: 'Português (Brasil)', flag: '🇧🇷' },
  { value: 'en-US', label: 'English (US)', flag: '🇺🇸' },
  { value: 'es-ES', label: 'Español (España)', flag: '🇪🇸' },
];

const statusOptions = [
  { value: 'online', label: 'Online', color: '#10B981', icon: '🟢' },
  { value: 'busy', label: 'Ocupado', color: '#F59E0B', icon: '🟠' },
];

export default function ConfiguracoesPage() {
  const [user, setUser] = useState(null);
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

  const updateLanguageMutation = useMutation({
    mutationFn: async (language) => {
      await base44.auth.updateMe({ language });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      window.location.reload();
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status) => {
      await base44.auth.updateMe({ 
        online_status: status,
        last_seen: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      loadUser();
    },
  });

  const handleLogout = async () => {
    // Define status como offline antes de sair
    await base44.auth.updateMe({ 
      online_status: 'offline',
      last_seen: new Date().toISOString()
    });
    await base44.auth.logout();
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Sparkles className="w-12 h-12 text-purple-500 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f1e] via-[#1a1a2e] to-[#0f0f1e]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Configurações</h1>
          <p className="text-gray-400">Personalize sua experiência no portal</p>
        </motion.div>

        <div className="space-y-6">
          {/* Status de Presença */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <Card className="bg-[#1a1a2e] border-purple-900/20 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Circle className="w-6 h-6 text-green-400" />
                <h2 className="text-xl font-bold text-white">Status de Presença</h2>
              </div>

              <div className="space-y-4">
                <p className="text-gray-400 text-sm">
                  Defina como você aparece para outros usuários no portal
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {statusOptions.map((status) => (
                    <button
                      key={status.value}
                      onClick={() => updateStatusMutation.mutate(status.value)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        user.online_status === status.value
                          ? 'border-purple-500 bg-purple-900/30'
                          : 'border-purple-900/20 bg-slate-800/50 hover:border-purple-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: status.color }}
                        />
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-white">{status.label}</p>
                          <p className="text-xs text-gray-400">
                            {status.value === 'online' 
                              ? 'Disponível para conversas' 
                              : 'Não perturbe, estou focado'}
                          </p>
                        </div>
                        {user.online_status === status.value && (
                          <Sparkles className="w-5 h-5 text-purple-400" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  💡 Seu status muda automaticamente para "Offline" quando você sair do portal
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Idioma e Região */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-[#1a1a2e] border-purple-900/20 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Globe className="w-6 h-6 text-purple-400" />
                <h2 className="text-xl font-bold text-white">Idioma e Região</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Idioma</label>
                  <Select
                    value={user.language || 'pt-BR'}
                    onValueChange={(value) => updateLanguageMutation.mutate(value)}
                  >
                    <SelectTrigger className="bg-slate-800 border-purple-900/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-purple-900/30 text-white">
                      {languages.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value} className="text-white">
                          <span className="mr-2">{lang.flag}</span>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {user.detected_location && (
                  <div className="bg-slate-800/50 p-4 rounded-lg">
                    <p className="text-sm text-gray-300 mb-1">Localização Detectada:</p>
                    <p className="text-white font-semibold">
                      {user.detected_location.city}, {user.detected_location.state} - {user.detected_location.country}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Notificações */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="bg-[#1a1a2e] border-purple-900/20 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-6 h-6 text-purple-400" />
                <h2 className="text-xl font-bold text-white">Notificações</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-purple-900/20">
                  <div>
                    <p className="font-semibold text-white">Notificações Push</p>
                    <p className="text-sm text-gray-300">Receba alertas de novas mensagens</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between py-3 border-b border-purple-900/20">
                  <div>
                    <p className="font-semibold text-white">Resumo de Atividades</p>
                    <p className="text-sm text-gray-300">Email semanal com suas conquistas</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-semibold text-white">Alertas de Sincronicidade</p>
                    <p className="text-sm text-gray-300">Quando eventos cósmicos ocorrem</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Privacidade */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-[#1a1a2e] border-purple-900/20 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Lock className="w-6 h-6 text-purple-400" />
                <h2 className="text-xl font-bold text-white">Privacidade</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-purple-900/20">
                  <div>
                    <p className="font-semibold text-white">Perfil Privado</p>
                    <p className="text-sm text-gray-300">Apenas conexões podem ver seu perfil</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between py-3 border-b border-purple-900/20">
                  <div>
                    <p className="font-semibold text-white">Mostrar Localização</p>
                    <p className="text-sm text-gray-300">Exibir cidade no perfil</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-semibold text-white">Status Online</p>
                    <p className="text-sm text-gray-300">Mostrar quando você está ativo</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Conta */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="bg-[#1a1a2e] border-purple-900/20 p-6">
              <div className="flex items-center gap-3 mb-6">
                <UserIcon className="w-6 h-6 text-purple-400" />
                <h2 className="text-xl font-bold text-white">Conta</h2>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <p className="text-sm text-gray-300 mb-1">Email</p>
                  <p className="text-white font-semibold">{user.email}</p>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <p className="text-sm text-gray-300 mb-1">Nível Místico</p>
                  <p className="text-white font-semibold">Nível {user.level || 1}</p>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <p className="text-sm text-gray-300 mb-1">Membro desde</p>
                  <p className="text-white font-semibold">
                    {format(new Date(user.created_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>

                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  Sair da Conta
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}