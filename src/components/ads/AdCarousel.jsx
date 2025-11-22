import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Megaphone, Eye, Play, Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AdCarousel({ user }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: ads } = useQuery({
    queryKey: ['active-ads'],
    queryFn: () => base44.entities.Ad.filter({ 
      status: 'active', 
      is_approved: true 
    }, "-created_date", 20),
    refetchInterval: 30000,
  });

  const recordImpressionMutation = useMutation({
    mutationFn: async (adId) => {
      const ad = ads?.find(a => a.id === adId);
      if (!ad) return;
      
      await base44.entities.Ad.update(adId, {
        total_impressions: (ad.total_impressions || 0) + 1,
        total_spent: (ad.total_spent || 0) + (ad.cost_per_view || 1)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-ads'] });
    }
  });

  const recordClickMutation = useMutation({
    mutationFn: async (adId) => {
      const ad = ads?.find(a => a.id === adId);
      if (!ad) return;
      
      await base44.entities.Ad.update(adId, {
        total_clicks: (ad.total_clicks || 0) + 1,
        total_spent: (ad.total_spent || 0) + (ad.cost_per_click || 5)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-ads'] });
    }
  });

  useEffect(() => {
    if (!ads || ads.length === 0) return;

    const currentAd = ads[currentIndex];
    if (currentAd) {
      recordImpressionMutation.mutate(currentAd.id);
    }

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex, ads]);

  if (!ads || ads.length === 0) return null;

  const currentAd = ads[currentIndex];
  
  if (!currentAd) return null;

  const handleClick = () => {
    recordClickMutation.mutate(currentAd.id);
    
    if (currentAd.link_type === 'external' && currentAd.button_url?.startsWith('http')) {
      window.open(currentAd.button_url, '_blank');
    } else if (currentAd.link_type === 'social' && currentAd.button_url?.startsWith('http')) {
      window.open(currentAd.button_url, '_blank');
    } else if (currentAd.button_url) {
      navigate(createPageUrl(currentAd.button_url));
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % ads.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + ads.length) % ads.length);
  };

  return (
    <div className="mb-6">
      <style>{`
        @keyframes rainbow-border {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <div className="relative p-[1.5px] rounded-2xl bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-[length:200%_200%] animate-[rainbow-border_3s_ease-in-out_infinite] shadow-xl">
        <Card className="border-0 rounded-2xl overflow-hidden" style={{ backgroundColor: '#DBE9FD' }}>
          <div className="p-3 md:p-4">
            {/* Badge Patrocinado */}
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => navigate(createPageUrl("ZamiraAds"))}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition shadow-sm"
              >
                <Megaphone className="w-3 h-3 text-purple-600" />
                <span className="text-[10px] md:text-xs font-semibold text-purple-700">Patrocinado</span>
              </button>
              
              {ads.length > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrev}
                    className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-white/80 hover:bg-white flex items-center justify-center transition shadow-sm"
                  >
                    <ChevronLeft className="w-3 h-3 md:w-4 md:h-4 text-slate-700" />
                  </button>
                  <span className="text-[10px] md:text-xs text-slate-700 font-medium mx-1">
                    {currentIndex + 1}/{ads.length}
                  </span>
                  <button
                    onClick={handleNext}
                    className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-white/80 hover:bg-white flex items-center justify-center transition shadow-sm"
                  >
                    <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-slate-700" />
                  </button>
                </div>
              )}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentAd.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Conteúdo do Anúncio */}
                <div className="flex items-start gap-2 md:gap-3 mb-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0">
                    {currentAd.advertiser_name?.[0]?.toUpperCase() || 'A'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 mb-1 text-sm md:text-base">{currentAd.title}</h3>
                    <p className="text-xs md:text-sm text-slate-700 leading-relaxed">
                      {currentAd.description}
                    </p>
                  </div>
                </div>

                {/* Mídia do Anúncio */}
                {currentAd.media_type === 'image' && currentAd.image_url && (
                  <div className="mb-3 rounded-xl overflow-hidden shadow-md">
                    <img
                      src={currentAd.image_url}
                      alt={currentAd.title}
                      className="w-full h-48 md:h-56 object-cover"
                    />
                  </div>
                )}

                {currentAd.media_type === 'video' && currentAd.video_url && (
                  <div className="mb-3 rounded-xl overflow-hidden shadow-md bg-black">
                    <iframe
                      src={currentAd.video_url}
                      className="w-full h-48 md:h-56"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}

                {currentAd.media_type === 'audio' && currentAd.audio_url && (
                  <div className="mb-3 p-3 md:p-4 bg-white/80 rounded-xl shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                        <Volume2 className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      </div>
                      <audio controls className="flex-1 h-8">
                        <source src={currentAd.audio_url} type="audio/mpeg" />
                      </audio>
                    </div>
                  </div>
                )}

                {/* Botão de Ação */}
                <Button
                  onClick={handleClick}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg text-sm md:text-base"
                  size="lg"
                >
                  {currentAd.button_text || 'Saiba Mais'}
                </Button>

                {/* Métricas (só para o anunciante) */}
                {user?.id === currentAd.advertiser_id && (
                  <div className="mt-3 pt-3 border-t border-slate-300/50 flex items-center justify-between text-[10px] md:text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {currentAd.total_impressions || 0}
                    </span>
                    <span>
                      {currentAd.total_clicks || 0} cliques
                    </span>
                    <span className="text-purple-700 font-semibold">
                      {currentAd.total_spent || 0} ouros
                    </span>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </Card>
      </div>
    </div>
  );
}