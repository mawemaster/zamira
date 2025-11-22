import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Volume2, Upload, Play, Pause, Activity, Save, Trash2
} from "lucide-react";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";

const soundLabels = {
  notification: "Notificação Geral",
  message: "Nova Mensagem",
  level_up: "Subiu de Nível",
  achievement: "Conquista Desbloqueada",
  ouros_received: "Recebeu Ouros",
  new_follower: "Novo Seguidor",
  reaction: "Reação em Post",
  comment: "Novo Comentário",
  duel_start: "Duelo Iniciado",
  duel_win: "Vitória no Duelo",
  portal_open: "Portal Aberto",
  magic_cast: "Magia Lançada",
  item_collected: "Item Coletado",
  quest_complete: "Missão Completa",
  error: "Erro",
  success: "Sucesso"
};

export default function SonsTab() {
  const [uploadingSound, setUploadingSound] = useState(null);
  const [playingSound, setPlayingSound] = useState(null);
  const queryClient = useQueryClient();

  const { data: sounds, isLoading } = useQuery({
    queryKey: ['admin-system-sounds'],
    queryFn: () => base44.entities.SystemSound.list(),
  });

  const createOrUpdateSoundMutation = useMutation({
    mutationFn: async ({ soundName, audioUrl, volume }) => {
      const existing = sounds?.find(s => s.sound_name === soundName);
      if (existing) {
        return await base44.entities.SystemSound.update(existing.id, {
          audio_url: audioUrl,
          volume: volume || 0.5,
          is_active: true
        });
      }
      return await base44.entities.SystemSound.create({
        sound_name: soundName,
        audio_url: audioUrl,
        volume: volume || 0.5,
        is_active: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-system-sounds'] });
      setUploadingSound(null);
      alert('✅ Som atualizado com sucesso!');
    },
  });

  const deleteSoundMutation = useMutation({
    mutationFn: async (id) => await base44.entities.SystemSound.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-system-sounds'] });
      alert('✅ Som removido!');
    },
  });

  const handleFileUpload = async (soundName, file) => {
    if (file) {
      try {
        setUploadingSound(soundName);
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        await createOrUpdateSoundMutation.mutateAsync({ 
          soundName, 
          audioUrl: file_url 
        });
      } catch (error) {
        alert('Erro ao fazer upload: ' + error.message);
      } finally {
        setUploadingSound(null);
      }
    }
  };

  const handlePlaySound = (audioUrl) => {
    if (playingSound) {
      playingSound.pause();
    }
    const audio = new Audio(audioUrl);
    audio.play();
    setPlayingSound(audio);
    audio.onended = () => setPlayingSound(null);
  };

  const handleVolumeChange = async (sound, volume) => {
    await createOrUpdateSoundMutation.mutateAsync({
      soundName: sound.sound_name,
      audioUrl: sound.audio_url,
      volume: volume[0]
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Sons do Sistema</h2>
        <p className="text-slate-600">Personalize todos os sons e efeitos sonoros</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <Activity className="w-12 h-12 text-purple-600 animate-pulse mx-auto mb-4" />
          <p className="text-slate-600">Carregando sons...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {Object.entries(soundLabels).map(([key, label]) => {
            const existingSound = sounds?.find(s => s.sound_name === key);
            const isUploading = uploadingSound === key;

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-white border-slate-200 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-slate-900">{label}</h3>
                      <p className="text-xs text-slate-500">{key}</p>
                    </div>
                    {existingSound ? (
                      <Badge className="bg-green-100 text-green-800">
                        Configurado
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-slate-600">
                        Sem som
                      </Badge>
                    )}
                  </div>

                  {existingSound && (
                    <div className="space-y-3 mb-3">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePlaySound(existingSound.audio_url)}
                          className="flex-1"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Testar Som
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteSoundMutation.mutate(existingSound.id)}
                          className="border-red-300 text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-slate-500" />
                        <Slider
                          value={[existingSound.volume || 0.5]}
                          onValueChange={(value) => handleVolumeChange(existingSound, value)}
                          max={1}
                          step={0.1}
                          className="flex-1"
                        />
                        <span className="text-xs text-slate-600 w-12">
                          {Math.round((existingSound.volume || 0.5) * 100)}%
                        </span>
                      </div>
                    </div>
                  )}

                  <label className="block">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => handleFileUpload(key, e.target.files[0])}
                      disabled={isUploading}
                      className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 disabled:opacity-50"
                    />
                  </label>

                  {isUploading && (
                    <p className="text-xs text-purple-600 mt-2 flex items-center gap-2">
                      <Activity className="w-3 h-3 animate-spin" />
                      Enviando...
                    </p>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}