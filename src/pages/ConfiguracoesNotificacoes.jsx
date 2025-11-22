import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Check, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const NOTIFICATION_TYPES = [
  { key: 'follow', label: 'Novas Conexões', description: 'Quando alguém conectar com você' },
  { key: 'reaction', label: 'Reações', description: 'Quando reagirem aos seus posts' },
  { key: 'comment', label: 'Comentários', description: 'Quando comentarem seus posts' },
  { key: 'level_up', label: 'Subida de Nível', description: 'Quando você subir de nível' },
  { key: 'achievement', label: 'Conquistas', description: 'Quando ganhar distintivos' },
  { key: 'daily_blessing', label: 'Bênção Diária', description: 'Lembrete diário de bênção' },
  { key: 'duel_challenge', label: 'Desafios de Duelo', description: 'Quando te desafiarem' },
  { key: 'announcement', label: 'Anúncios', description: 'Avisos importantes da plataforma' },
];

export default function ConfiguracoesNotificacoesPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState({});
  const [saving, setSaving] = useState(false);
  const [browserPermission, setBrowserPermission] = useState('default');

  useEffect(() => {
    loadUser();
    checkBrowserPermission();
  }, []);

  const loadUser = async () => {
    const currentUser = await base44.auth.me();
    setUser(currentUser);
    setPreferences(currentUser.notification_preferences || {});
  };

  const checkBrowserPermission = () => {
    if ('Notification' in window) {
      setBrowserPermission(Notification.permission);
    }
  };

  const requestBrowserPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setBrowserPermission(permission);
      
      if (permission === 'granted') {
        toast.success('Notificações ativadas!');
      } else {
        toast.error('Permissão negada');
      }
    }
  };

  const togglePreference = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({
        notification_preferences: preferences
      });
      toast.success('Preferências salvas!');
    } catch (error) {
      toast.error('Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#02031C] via-slate-900 to-[#02031C] text-white pb-24">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="mb-4 text-gray-300 hover:text-white"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Bell className="w-8 h-8 text-purple-400" />
          Preferências de Notificações
        </h1>
        <p className="text-gray-400 mb-6">
          Escolha quais tipos de notificações deseja receber
        </p>

        <Card className="bg-slate-900/50 border-purple-500/30 p-6 mb-6">
          <h3 className="text-lg font-bold text-purple-300 mb-2">
            Notificações do Navegador
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Receba avisos mesmo quando não estiver na plataforma
          </p>
          
          {browserPermission === 'default' && (
            <Button
              onClick={requestBrowserPermission}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Bell className="w-4 h-4 mr-2" />
              Ativar Notificações Push
            </Button>
          )}
          
          {browserPermission === 'granted' && (
            <div className="flex items-center gap-2 text-green-400">
              <Check className="w-5 h-5" />
              <span>Notificações ativadas</span>
            </div>
          )}
          
          {browserPermission === 'denied' && (
            <p className="text-red-400 text-sm">
              Permissão negada. Ative manualmente nas configurações do navegador.
            </p>
          )}
        </Card>

        <Card className="bg-slate-900/50 border-purple-500/30 p-6 mb-6">
          <h3 className="text-lg font-bold text-purple-300 mb-4">
            Tipos de Notificação
          </h3>
          
          <div className="space-y-4">
            {NOTIFICATION_TYPES.map((type) => (
              <div
                key={type.key}
                className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-1">{type.label}</h4>
                  <p className="text-xs text-gray-400">{type.description}</p>
                </div>
                
                <button
                  onClick={() => togglePreference(type.key)}
                  className={`w-12 h-6 rounded-full transition flex-shrink-0 ml-4 ${
                    preferences[type.key] !== false
                      ? 'bg-purple-600'
                      : 'bg-gray-600'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      preferences[type.key] !== false
                        ? 'translate-x-6'
                        : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </Card>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-6 text-lg"
        >
          {saving ? 'Salvando...' : 'Salvar Preferências'}
        </Button>
      </div>
    </div>
  );
}