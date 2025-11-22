
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Megaphone, Search, Eye, MousePointer, CheckCircle, 
  XCircle, Pause, Play, Trash2, TrendingUp, Activity, Coins
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdsTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAd, setSelectedAd] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const queryClient = useQueryClient();

  const { data: allAds, isLoading } = useQuery({
    queryKey: ['admin-all-ads'],
    queryFn: () => base44.entities.Ad.list("-created_date", 500),
  });

  const updateAdMutation = useMutation({
    mutationFn: async ({ adId, data }) => {
      return await base44.entities.Ad.update(adId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-ads'] });
      alert('✅ Anúncio atualizado!');
    }
  });

  const deleteAdMutation = useMutation({
    mutationFn: async (adId) => {
      return await base44.entities.Ad.delete(adId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-ads'] });
    }
  });

  const handleApprove = (ad) => {
    updateAdMutation.mutate({
      adId: ad.id,
      data: { 
        is_approved: true, 
        status: 'active',
        admin_notes: adminNotes 
      }
    });
    setSelectedAd(null);
    setAdminNotes("");
  };

  const handleReject = (ad) => {
    updateAdMutation.mutate({
      adId: ad.id,
      data: { 
        status: 'rejected',
        admin_notes: adminNotes 
      }
    });
    setSelectedAd(null);
    setAdminNotes("");
  };

  const handleTogglePause = (ad) => {
    const newStatus = ad.status === 'active' ? 'paused' : 'active';
    updateAdMutation.mutate({
      adId: ad.id,
      data: { status: newStatus }
    });
  };

  const filteredAds = allAds?.filter(ad => {
    const query = searchQuery.toLowerCase();
    return (
      ad.title?.toLowerCase().includes(query) ||
      ad.advertiser_name?.toLowerCase().includes(query)
    );
  }) || [];

  const stats = {
    total: allAds?.length || 0,
    pending: allAds?.filter(a => a.status === 'pending').length || 0,
    active: allAds?.filter(a => a.status === 'active').length || 0,
    totalImpressions: allAds?.reduce((sum, a) => sum + (a.total_impressions || 0), 0) || 0,
    totalClicks: allAds?.reduce((sum, a) => sum + (a.total_clicks || 0), 0) || 0,
    totalRevenue: allAds?.reduce((sum, a) => sum + (a.budget_ouros || 0), 0) || 0
  };

  const statusColors = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Aguardando' },
    active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Ativo' },
    paused: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Pausado' },
    completed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Concluído' },
    rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejeitado' }
  };

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Gerenciar Anúncios</h2>
        <p className="text-slate-600">Aprovar, pausar e monitorar anúncios</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-white border-slate-200 p-4">
          <p className="text-xs text-slate-600 mb-1">Total</p>
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200 p-4">
          <p className="text-xs text-yellow-700 mb-1">Pendentes</p>
          <p className="text-2xl font-bold text-yellow-800">{stats.pending}</p>
        </Card>
        <Card className="bg-green-50 border-green-200 p-4">
          <p className="text-xs text-green-700 mb-1">Ativos</p>
          <p className="text-2xl font-bold text-green-800">{stats.active}</p>
        </Card>
        <Card className="bg-blue-50 border-blue-200 p-4">
          <p className="text-xs text-blue-700 mb-1">Views Total</p>
          <p className="text-2xl font-bold text-blue-800">{stats.totalImpressions}</p>
        </Card>
        <Card className="bg-purple-50 border-purple-200 p-4">
          <p className="text-xs text-purple-700 mb-1">Cliques Total</p>
          <p className="text-2xl font-bold text-purple-800">{stats.totalClicks}</p>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 p-4">
          <p className="text-xs text-purple-700 mb-1">Receita</p>
          <p className="text-2xl font-bold text-purple-800">{stats.totalRevenue}</p>
        </Card>
      </div>

      <Card className="bg-white border-slate-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar anúncios..."
            className="pl-10 border-slate-300"
          />
        </div>
      </Card>

      {/* Lista de Anúncios */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-purple-600 animate-pulse mx-auto mb-4" />
          </div>
        ) : filteredAds.length === 0 ? (
          <Card className="bg-white border-slate-200 p-12 text-center">
            <Megaphone className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">Nenhum anúncio encontrado</p>
          </Card>
        ) : (
          filteredAds.map((ad, index) => {
            const statusConfig = statusColors[ad.status];
            const ctr = ad.total_impressions > 0 
              ? ((ad.total_clicks / ad.total_impressions) * 100).toFixed(1)
              : 0;

            return (
              <motion.div
                key={ad.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
              >
                <Card className="bg-white border-slate-200 p-6">
                  <div className="flex items-start gap-4">
                    {ad.image_url && (
                      <img src={ad.image_url} className="w-32 h-32 object-cover rounded-lg" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-slate-900">{ad.title}</h3>
                        <Badge className={`${statusConfig.bg} ${statusConfig.text}`}>
                          {statusConfig.label}
                        </Badge>
                        {!ad.is_approved && ad.status === 'pending' && (
                          <Badge className="bg-orange-100 text-orange-800">
                            Precisa Aprovar
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-slate-600 mb-3">{ad.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                        <span>Por: {ad.advertiser_name}</span>
                        <span>Botão: "{ad.button_text}"</span>
                        <span className="capitalize">📍 {ad.placement}</span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        <div className="bg-slate-50 p-2 rounded">
                          <p className="text-xs text-slate-600">Views</p>
                          <p className="font-bold text-slate-900">{ad.total_impressions || 0}</p>
                        </div>
                        <div className="bg-slate-50 p-2 rounded">
                          <p className="text-xs text-slate-600">Cliques</p>
                          <p className="font-bold text-slate-900">{ad.total_clicks || 0}</p>
                        </div>
                        <div className="bg-slate-50 p-2 rounded">
                          <p className="text-xs text-slate-600">CTR</p>
                          <p className="font-bold text-slate-900">{ctr}%</p>
                        </div>
                        <div className="bg-purple-50 p-2 rounded">
                          <p className="text-xs text-purple-700">Orçamento</p>
                          <p className="font-bold text-purple-800">{ad.budget_ouros}</p>
                        </div>
                        <div className="bg-pink-50 p-2 rounded">
                          <p className="text-xs text-pink-700">Gasto</p>
                          <p className="font-bold text-pink-800">{ad.total_spent || 0}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {ad.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedAd(ad)}
                            className="border-green-300 text-green-600"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Aprovar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedAd(ad);
                              setTimeout(() => handleReject(ad), 100);
                            }}
                            className="border-red-300 text-red-600"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Rejeitar
                          </Button>
                        </>
                      )}
                      {ad.status === 'active' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTogglePause(ad)}
                        >
                          <Pause className="w-4 h-4 mr-2" />
                          Pausar
                        </Button>
                      )}
                      {ad.status === 'paused' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTogglePause(ad)}
                          className="border-green-300 text-green-600"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Ativar
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm('Deletar anúncio?')) {
                            deleteAdMutation.mutate(ad.id);
                          }
                        }}
                        className="border-red-300 text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {ad.admin_notes && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-600 mb-1">Notas do Admin:</p>
                      <p className="text-sm text-slate-800">{ad.admin_notes}</p>
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Modal de Aprovação */}
      {selectedAd && selectedAd.status === 'pending' && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
          <Card className="bg-white max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Revisar Anúncio
            </h3>
            <div className="mb-4">
              <p className="font-semibold text-slate-900">{selectedAd.title}</p>
              <p className="text-sm text-slate-600">{selectedAd.description}</p>
            </div>
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Notas do admin (opcional)..."
              className="mb-4"
              rows={3}
            />
            <div className="flex gap-2">
              <Button
                onClick={() => handleApprove(selectedAd)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Aprovar
              </Button>
              <Button
                onClick={() => handleReject(selectedAd)}
                variant="outline"
                className="flex-1 border-red-300 text-red-600"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Rejeitar
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedAd(null)}
              >
                Cancelar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
