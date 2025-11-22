
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Crown, Eye, BookOpen, Sparkles } from "lucide-react";
import PDFViewer from "../components/PDFViewer";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function BibliotecaMisticaPage() {
  const [user, setUser] = useState(null);
  const [selectedPDF, setSelectedPDF] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const currentUser = await base44.auth.me();
    setUser(currentUser);
  };

  const { data: pdfs, isLoading } = useQuery({
    queryKey: ['pdf-library'],
    queryFn: () => base44.entities.PDFLibrary.filter({ 
      is_active: true 
    }, "order", 100),
    enabled: !!user,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  const canAccessPDF = (pdf) => {
    if (!pdf.is_premium) return true;
    return user?.is_pro_subscriber;
  };

  const handleOpenPDF = async (pdf) => {
    if (!pdf || !pdf.id) return;
    
    if (!canAccessPDF(pdf)) {
      alert('📚 Este PDF é exclusivo para membros PRO. Assine para ter acesso completo!');
      return;
    }

    try {
      await base44.entities.PDFLibrary.update(pdf.id, {
        views_count: (pdf.views_count || 0) + 1
      });
    } catch (error) {
      console.error('Erro ao atualizar views:', error);
    }

    setSelectedPDF(pdf);
  };

  const categories = [
    { value: 'all', label: 'Todos', emoji: '📚' },
    { value: 'tarot', label: 'Tarot', emoji: '🃏' },
    { value: 'astrologia', label: 'Astrologia', emoji: '⭐' },
    { value: 'cristais', label: 'Cristais', emoji: '💎' },
    { value: 'meditacao', label: 'Meditação', emoji: '🧘' },
    { value: 'outros', label: 'Outros', emoji: '✨' }
  ];

  const filteredPDFs = selectedCategory === 'all'
    ? pdfs
    : pdfs?.filter(p => p.category === selectedCategory);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#02031C] via-slate-900 to-[#02031C]">
        <Sparkles className="w-12 h-12 text-purple-500 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] p-4 md:p-6 pb-24">
      <div className="max-w-6xl mx-auto">
        <Button
          onClick={() => navigate(createPageUrl("AreaDoAluno"))}
          variant="ghost"
          className="text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Área do Aluno
        </Button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mx-auto mb-4 shadow-2xl"
          >
            <BookOpen className="w-10 h-10 md:w-12 md:h-12 text-white" />
          </motion.div>
          <h1 className="text-2xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Biblioteca Mística
          </h1>
          <p className="text-slate-300 text-sm md:text-base">Materiais exclusivos para aprofundar seus estudos</p>
        </motion.div>

        {/* Filtros */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 md:px-4 py-2 rounded-full transition text-sm ${
                selectedCategory === cat.value
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {/* Grid de PDFs - 2 por linha em mobile, 3 em desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {isLoading ? (
            <div className="col-span-full text-center py-12">
              <Sparkles className="w-12 h-12 text-purple-500 animate-pulse mx-auto mb-4" />
              <p className="text-gray-400">Carregando biblioteca...</p>
            </div>
          ) : filteredPDFs && filteredPDFs.length > 0 ? (
            filteredPDFs.map((pdf, index) => {
              const hasAccess = canAccessPDF(pdf);

              return (
                <motion.div
                  key={pdf.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`bg-gradient-to-br from-slate-900/50 to-black border-purple-500/20 hover:border-purple-400/50 transition-all overflow-hidden group ${
                    hasAccess ? 'cursor-pointer' : 'opacity-75'
                  }`}
                    onClick={() => hasAccess && handleOpenPDF(pdf)}
                  >
                    {pdf.cover_image_url ? (
                      <div className="aspect-[3/4] overflow-hidden relative">
                        <img 
                          src={pdf.cover_image_url} 
                          alt={pdf.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {!hasAccess && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                            <div className="text-center">
                              <Crown className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                              <Badge className="bg-yellow-600 text-white">
                                PRO
                              </Badge>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-[3/4] bg-gradient-to-br from-purple-900/30 to-pink-900/30 flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-purple-400" />
                      </div>
                    )}
                    <div className="p-3 md:p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-white text-xs md:text-base line-clamp-2 flex-1">
                          {pdf.title}
                        </h3>
                        {pdf.is_premium && hasAccess && (
                          <Crown className="w-3 h-3 md:w-4 md:h-4 text-yellow-400 flex-shrink-0" />
                        )}
                      </div>
                      {pdf.description && (
                        <p className="text-[10px] md:text-sm text-gray-400 line-clamp-2 mb-2 md:mb-3">
                          {pdf.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] md:text-xs text-gray-500 flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {pdf.views_count || 0}
                        </span>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 h-7 md:h-8 text-[10px] md:text-sm px-2 md:px-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            hasAccess && handleOpenPDF(pdf);
                          }}
                        >
                          <BookOpen className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                          Ler
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full">
              <Card className="bg-slate-800/50 border-slate-600 p-12 text-center">
                <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400">Nenhum material disponível</p>
              </Card>
            </div>
          )}
        </div>

        {/* Info */}
        <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30 p-4 md:p-6 mt-8">
          <h4 className="font-bold text-purple-300 mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Sobre a Biblioteca
          </h4>
          <p className="text-sm text-slate-300">
            Nossa biblioteca está sempre crescendo com novos materiais sobre Tarot, Astrologia, Cristais e muito mais. 
            Membros PRO têm acesso completo a todo o conteúdo premium! ✨
          </p>
        </Card>
      </div>

      {/* PDF Viewer */}
      <AnimatePresence>
        {selectedPDF && (
          <PDFViewer 
            pdf={selectedPDF} 
            onClose={() => setSelectedPDF(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
