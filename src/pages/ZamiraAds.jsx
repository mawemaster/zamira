import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Megaphone, Plus, Eye, MousePointer, TrendingUp, Calendar,
  Edit2, Pause, Play, Trash2, Upload, Zap, Coins, Image as ImageIcon,
  Video, Music, Globe, Share2
} from "lucide-react";
import { motion } from "framer-motion";

export default function ZamiraAdsPage() {
  const [user, setUser] = useState(null);
  const [editingAd, setEditingAd] = useState(null);
  const [adData, setAdData] = useState({
    title: "",
    description: "",
    media_type: "image",
    image_url: "",
    video_url: "",
    audio_url: "",
    button_text: "Saiba Mais",
    link_type: "internal",
    button_url: "",
    placement: "feed",
    budget_ouros: 500,
    duration_days: 7,
    cost_per_view: 1,
    cost_per_click: 5,
    target_audience: {}
  });
  const queryClient = useQueryClient();

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const currentUser = await base44.auth.me();
    setUser(currentUser);
  };

  const { data: myAds } = useQuery({
    queryKey: ['my-ads'],
    queryFn: () => base44.entities.Ad.filter({ 
      advertiser_id: user?.id 
    }, "-created_date", 50),
    enabled: !!user,
  });

  const createAdMutation = useMutation({
    mutationFn: async (data) => {
      const totalCost = data.budget_ouros;
      
      if ((user.ouros || 0) < totalCost) {
        throw new Error('Ouros insuficientes');
      }

      await base44.auth.updateMe({
        ouros: (user.ouros || 0) - totalCost
      });

      const endDate = new Date();
      endDate.setDate(endDate.getDate() + data.duration_days);

      if (editingAd) {
        return await base44.entities.Ad.update(editingAd.id, data);
      }

      return await base44.entities.Ad.create({
        ...data,
        advertiser_id: user.id,
        advertiser_name: user.display_name || user.full_name,
        status: 'pending',
        total_impressions: 0,
        total_clicks: 0,
        total_spent: 0,
        start_date: new Date().toISOString(),
        end_date: endDate.toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-ads'] });
      setEditingAd(null);
      setAdData({
        title: "",
        description: "",
        media_type: "image",
        image_url: "",
        video_url: "",
        audio_url: "",
        button_text: "Saiba Mais",
        link_type: "internal",
        button_url: "",
        placement: "feed",
        budget_ouros: 500,
        duration_days: 7,
        cost_per_view: 1,
        cost_per_click: 5,
        target_audience: {}
      });
      loadUser();
      alert('✅ Anúncio criado! Aguarde aprovação do admin.');
    },
    onError: (error) => {
      alert('Erro: ' + error.message);
    }
  });

  const pauseAdMutation = useMutation({
    mutationFn: async (adId) => {
      const ad = myAds.find(a => a.id === adId);
      const newStatus = ad.status === 'active' ? 'paused' : 'active';
      return await base44.entities.Ad.update(adId, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-ads'] });
    }
  });

  const deleteAdMutation = useMutation({
    mutationFn: async (adId) => {
      return await base44.entities.Ad.delete(adId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-ads'] });
    }
  });

  const handleMediaUpload = async (e, type) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        if (type === 'image') {
          setAdData({ ...adData, image_url: file_url });
        } else if (type === 'audio') {
          setAdData({ ...adData, audio_url: file_url });
        }
        alert('✅ Arquivo carregado!');
      } catch (error) {
        alert('Erro: ' + error.message);
      }
    }
  };

  const handleEdit = (ad) => {
    setEditingAd(ad);
    setAdData(ad);
  };

  const handleSubmit = () => {
    if (!adData.title || !adData.description) {
      alert('Preencha título e descrição');
      return;
    }
    createAdMutation.mutate(adData);
  };

  const estimatedReach = Math.floor(adData.budget_ouros / adData.cost_per_view);
  const estimatedClicks = Math.floor(adData.budget_ouros / adData.cost_per_click);

  const statusColors = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Aguardando' },
    active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Ativo' },
    paused: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Pausado' },
    completed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Concluído' },
    rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejeitado' }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Megaphone className="w-12 h-12 text-purple-500 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-3 md:p-6 pb-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-2 md:gap-3 mb-3">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
              <Megaphone className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Zamira Ads</h1>
              <p className="text-sm md:text-base text-slate-600">Promova seu conteúdo</p>
            </div>
          </div>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 p-4 md:p-6">
            <h3 className="font-bold text-purple-900 mb-2 flex items-center gap-2 text-sm md:text-base">
              <Zap className="w-4 h-4 md:w-5 md:h-5" />
              Como Funciona
            </h3>
            <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-purple-800">
              <p>✨ Alcance a comunidade no feed principal</p>
              <p>💰 Pague com Ouros de forma transparente</p>
              <p>📊 Acompanhe métricas em tempo real</p>
              <p>🎯 Segmente seu público-alvo</p>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="criar" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-100">
            <TabsTrigger value="criar" className="text-xs md:text-sm">
              <Plus className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              Criar
            </TabsTrigger>
            <TabsTrigger value="meus-ads" className="text-xs md:text-sm">
              <Eye className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              Meus ({myAds?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="precos" className="text-xs md:text-sm">
              <Coins className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              Preços
            </TabsTrigger>
          </TabsList>

          {/* CRIAR ANÚNCIO */}
          <TabsContent value="criar" className="space-y-4 md:space-y-6 mt-4 md:mt-6">
            <Card className="bg-white border-slate-200 p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-4">
                {editingAd ? 'Editar Anúncio' : 'Criar Novo Anúncio'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-xs md:text-sm font-medium text-slate-700 mb-2 block">
                    Título do Anúncio
                  </label>
                  <Input
                    value={adData.title}
                    onChange={(e) => setAdData({...adData, title: e.target.value})}
                    placeholder="Ex: Novo Curso de Tarot Grátis!"
                    maxLength={60}
                    className="text-sm md:text-base"
                  />
                  <p className="text-xs text-slate-500 mt-1">{adData.title.length}/60</p>
                </div>

                <div>
                  <label className="text-xs md:text-sm font-medium text-slate-700 mb-2 block">
                    Descrição
                  </label>
                  <Textarea
                    value={adData.description}
                    onChange={(e) => setAdData({...adData, description: e.target.value})}
                    placeholder="Descreva seu anúncio..."
                    rows={4}
                    maxLength={200}
                    className="text-sm md:text-base"
                  />
                  <p className="text-xs text-slate-500 mt-1">{adData.description.length}/200</p>
                </div>

                <div>
                  <label className="text-xs md:text-sm font-medium text-slate-700 mb-2 block">
                    Tipo de Mídia
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setAdData({...adData, media_type: 'image'})}
                      className={`p-3 rounded-lg border-2 transition ${
                        adData.media_type === 'image'
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <ImageIcon className="w-5 h-5 mx-auto mb-1 text-purple-600" />
                      <p className="text-xs font-semibold">Imagem</p>
                    </button>
                    <button
                      onClick={() => setAdData({...adData, media_type: 'video'})}
                      className={`p-3 rounded-lg border-2 transition ${
                        adData.media_type === 'video'
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <Video className="w-5 h-5 mx-auto mb-1 text-purple-600" />
                      <p className="text-xs font-semibold">Vídeo</p>
                    </button>
                    <button
                      onClick={() => setAdData({...adData, media_type: 'audio'})}
                      className={`p-3 rounded-lg border-2 transition ${
                        adData.media_type === 'audio'
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <Music className="w-5 h-5 mx-auto mb-1 text-purple-600" />
                      <p className="text-xs font-semibold">Áudio</p>
                    </button>
                  </div>
                </div>

                {/* Upload de Mídia */}
                {adData.media_type === 'image' && (
                  <div>
                    <label className="text-xs md:text-sm font-medium text-slate-700 mb-2 block">
                      Upload de Imagem
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleMediaUpload(e, 'image')}
                      className="w-full text-xs md:text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-purple-50 file:text-purple-700"
                    />
                    {adData.image_url && (
                      <img src={adData.image_url} className="mt-3 w-full h-40 md:h-48 object-cover rounded-lg" />
                    )}
                  </div>
                )}

                {adData.media_type === 'video' && (
                  <div>
                    <label className="text-xs md:text-sm font-medium text-slate-700 mb-2 block">
                      URL do Vídeo (YouTube, Vimeo, etc)
                    </label>
                    <Input
                      value={adData.video_url}
                      onChange={(e) => setAdData({...adData, video_url: e.target.value})}
                      placeholder="https://www.youtube.com/embed/..."
                      className="text-sm md:text-base"
                    />
                  </div>
                )}

                {adData.media_type === 'audio' && (
                  <div>
                    <label className="text-xs md:text-sm font-medium text-slate-700 mb-2 block">
                      Upload de Áudio
                    </label>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => handleMediaUpload(e, 'audio')}
                      className="w-full text-xs md:text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-purple-50 file:text-purple-700"
                    />
                    {adData.audio_url && (
                      <audio controls className="mt-3 w-full">
                        <source src={adData.audio_url} type="audio/mpeg" />
                      </audio>
                    )}
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs md:text-sm font-medium text-slate-700 mb-2 block">
                      Texto do Botão
                    </label>
                    <Input
                      value={adData.button_text}
                      onChange={(e) => setAdData({...adData, button_text: e.target.value})}
                      placeholder="Ex: Começar Agora"
                      className="text-sm md:text-base"
                    />
                  </div>

                  <div>
                    <label className="text-xs md:text-sm font-medium text-slate-700 mb-2 block">
                      Tipo de Link
                    </label>
                    <select
                      value={adData.link_type}
                      onChange={(e) => setAdData({...adData, link_type: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm md:text-base"
                    >
                      <option value="internal">Página Interna</option>
                      <option value="external">Site Externo</option>
                      <option value="social">Rede Social</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs md:text-sm font-medium text-slate-700 mb-2 block">
                    {adData.link_type === 'internal' ? 'Nome da Página' : 
                     adData.link_type === 'social' ? 'Link da Rede Social' : 
                     'URL do Site'}
                  </label>
                  <Input
                    value={adData.button_url}
                    onChange={(e) => setAdData({...adData, button_url: e.target.value})}
                    placeholder={
                      adData.link_type === 'internal' ? 'Ex: Loja' :
                      adData.link_type === 'social' ? 'Ex: https://instagram.com/seu_perfil' :
                      'Ex: https://seusite.com'
                    }
                    className="text-sm md:text-base"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs md:text-sm font-medium text-slate-700 mb-2 block">
                      Orçamento em Ouros
                    </label>
                    <Input
                      type="number"
                      value={adData.budget_ouros}
                      onChange={(e) => setAdData({...adData, budget_ouros: parseInt(e.target.value)})}
                      min={100}
                      step={50}
                      className="text-sm md:text-base"
                    />
                  </div>

                  <div>
                    <label className="text-xs md:text-sm font-medium text-slate-700 mb-2 block">
                      Duração (dias)
                    </label>
                    <select
                      value={adData.duration_days}
                      onChange={(e) => setAdData({...adData, duration_days: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm md:text-base"
                    >
                      <option value={3}>3 dias</option>
                      <option value={7}>7 dias</option>
                      <option value={14}>14 dias</option>
                      <option value={30}>30 dias</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 md:p-4 bg-slate-50 rounded-lg space-y-1 text-xs md:text-sm">
                  <p className="text-slate-700">
                    📊 <strong>Alcance estimado:</strong> ~{estimatedReach} visualizações
                  </p>
                  <p className="text-slate-700">
                    👆 <strong>Cliques estimados:</strong> ~{estimatedClicks} cliques
                  </p>
                  <p className="text-slate-700">
                    📅 <strong>Duração:</strong> {adData.duration_days} dias
                  </p>
                  <p className="text-purple-700 font-semibold">
                    💰 <strong>Custo total:</strong> {adData.budget_ouros} ouros
                  </p>
                </div>

                <div className="flex items-center gap-2 p-3 md:p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <Coins className="w-4 h-4 md:w-5 md:h-5 text-amber-600" />
                  <p className="text-xs md:text-sm text-amber-900">
                    <strong>Saldo atual:</strong> {user?.ouros || 0} ouros
                  </p>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={createAdMutation.isPending || (user?.ouros || 0) < adData.budget_ouros}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm md:text-base"
                  size="lg"
                >
                  <Megaphone className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  {editingAd ? 'Atualizar' : `Criar Anúncio (${adData.budget_ouros} ouros)`}
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* MEUS ANÚNCIOS */}
          <TabsContent value="meus-ads" className="space-y-3 md:space-y-4 mt-4 md:mt-6">
            {!myAds || myAds.length === 0 ? (
              <Card className="bg-white border-slate-200 p-8 md:p-12 text-center">
                <Megaphone className="w-10 h-10 md:w-12 md:h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-sm md:text-base text-slate-600 mb-4">Você ainda não criou anúncios</p>
              </Card>
            ) : (
              myAds.map((ad) => {
                const statusConfig = statusColors[ad.status];
                const ctr = ad.total_impressions > 0 
                  ? ((ad.total_clicks / ad.total_impressions) * 100).toFixed(1)
                  : 0;

                return (
                  <Card key={ad.id} className="bg-white border-slate-200 p-4 md:p-6">
                    <div className="flex items-start gap-3 md:gap-4 mb-4">
                      {ad.image_url && ad.media_type === 'image' && (
                        <img src={ad.image_url} className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="font-bold text-slate-900 text-sm md:text-base">{ad.title}</h3>
                          <Badge className={`${statusConfig.bg} ${statusConfig.text} text-xs`}>
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <p className="text-xs md:text-sm text-slate-600 mb-3">{ad.description}</p>
                        
                        {/* Métricas */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          <div className="bg-slate-50 p-2 rounded">
                            <p className="text-[10px] md:text-xs text-slate-600">Views</p>
                            <p className="text-sm md:text-lg font-bold text-slate-900">{ad.total_impressions || 0}</p>
                          </div>
                          <div className="bg-slate-50 p-2 rounded">
                            <p className="text-[10px] md:text-xs text-slate-600">Cliques</p>
                            <p className="text-sm md:text-lg font-bold text-slate-900">{ad.total_clicks || 0}</p>
                          </div>
                          <div className="bg-slate-50 p-2 rounded">
                            <p className="text-[10px] md:text-xs text-slate-600">CTR</p>
                            <p className="text-sm md:text-lg font-bold text-slate-900">{ctr}%</p>
                          </div>
                          <div className="bg-purple-50 p-2 rounded">
                            <p className="text-[10px] md:text-xs text-purple-700">Gasto</p>
                            <p className="text-sm md:text-lg font-bold text-purple-800">{ad.total_spent || 0}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 flex-shrink-0">
                        {ad.status === 'active' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => pauseAdMutation.mutate(ad.id)}
                            className="text-xs"
                          >
                            <Pause className="w-3 h-3 md:w-4 md:h-4" />
                          </Button>
                        )}
                        {ad.status === 'paused' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => pauseAdMutation.mutate(ad.id)}
                            className="border-green-300 text-green-600 text-xs"
                          >
                            <Play className="w-3 h-3 md:w-4 md:h-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(ad)}
                          className="text-xs"
                        >
                          <Edit2 className="w-3 h-3 md:w-4 md:h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (confirm('Deletar anúncio?')) {
                              deleteAdMutation.mutate(ad.id);
                            }
                          }}
                          className="border-red-300 text-red-600 text-xs"
                        >
                          <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2 text-[10px] md:text-xs text-slate-600">
                        <span>Orçamento utilizado</span>
                        <span className="font-semibold">
                          {ad.total_spent || 0} / {ad.budget_ouros} ouros
                        </span>
                      </div>
                      <div className="h-1.5 md:h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500"
                          style={{ width: `${Math.min(((ad.total_spent || 0) / ad.budget_ouros) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </TabsContent>

          {/* TABELA DE PREÇOS */}
          <TabsContent value="precos" className="space-y-4 md:space-y-6 mt-4 md:mt-6">
            <Card className="bg-white border-slate-200 p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-4">Tabela de Preços</h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 md:p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-slate-900 text-sm md:text-base">Visualização</p>
                    <p className="text-xs text-slate-600">Cada exibição do anúncio</p>
                  </div>
                  <Badge className="bg-purple-100 text-purple-800 text-base md:text-lg px-3 md:px-4 py-1.5 md:py-2">
                    1 ouro
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 md:p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-slate-900 text-sm md:text-base">Clique</p>
                    <p className="text-xs text-slate-600">Quando alguém clica</p>
                  </div>
                  <Badge className="bg-pink-100 text-pink-800 text-base md:text-lg px-3 md:px-4 py-1.5 md:py-2">
                    5 ouros
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 md:p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <div>
                    <p className="font-semibold text-purple-900 text-sm md:text-base">Orçamento Mínimo</p>
                    <p className="text-xs text-purple-700">Para começar</p>
                  </div>
                  <Badge className="bg-purple-600 text-white text-base md:text-lg px-3 md:px-4 py-1.5 md:py-2">
                    100 ouros
                  </Badge>
                </div>
              </div>

              <div className="mt-6 p-3 md:p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-bold text-blue-900 mb-2 text-sm md:text-base">💡 Pacotes Recomendados:</h4>
                <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-blue-800">
                  <p>🌟 <strong>Iniciante:</strong> 500 ouros = ~500 views</p>
                  <p>✨ <strong>Padrão:</strong> 1.000 ouros = ~1.000 views</p>
                  <p>🔥 <strong>Premium:</strong> 2.500 ouros = ~2.500 views</p>
                  <p>💎 <strong>Elite:</strong> 5.000 ouros = ~5.000 views</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}