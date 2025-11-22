import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Loader2, Search, Eye, Crown, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CATEGORY_LABELS = {
  receitas: "Receitas",
  mundo_holistico: "Mundo Holístico",
  marketing_digital: "Marketing Digital",
  saude_mental: "Saúde Mental",
  outros: "Outros"
};

const CATEGORY_EMOJIS = {
  receitas: "🍲",
  mundo_holistico: "🌿",
  marketing_digital: "📈",
  saude_mental: "🧘",
  outros: "📚"
};

export default function EnciclopediaPage() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const queryClient = useQueryClient();

  React.useEffect(() => {
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

  const { data: pdfs = [], isLoading } = useQuery({
    queryKey: ['encyclopedia-pdfs'],
    queryFn: async () => {
      const result = await base44.entities.PDFLibrary.filter({ is_active: true }, "order", 200);
      return result || [];
    }
  });

  const incrementViewMutation = useMutation({
    mutationFn: async (pdfId) => {
      const pdf = pdfs.find(p => p.id === pdfId);
      if (pdf) {
        await base44.entities.PDFLibrary.update(pdfId, {
          views_count: (pdf.views_count || 0) + 1
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['encyclopedia-pdfs'] });
    }
  });

  const handleViewPDF = (pdf) => {
    incrementViewMutation.mutate(pdf.id);
    window.open(pdf.pdf_url, '_blank');
  };

  const filteredPDFs = pdfs.filter(pdf => {
    const matchesSearch = pdf.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pdf.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "todos" || pdf.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categorizedPDFs = selectedCategory === "todos" 
    ? Object.keys(CATEGORY_LABELS).map(cat => ({
        category: cat,
        pdfs: filteredPDFs.filter(p => p.category === cat)
      })).filter(g => g.pdfs.length > 0)
    : [{ category: selectedCategory, pdfs: filteredPDFs }];

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#0f0f1e] via-[#1a1a2e] to-[#0f0f1e]">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f1e] via-[#1a1a2e] to-[#0f0f1e] text-white pb-24">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl font-bold text-white">Enciclopédia Zamira</h1>
          </div>
          <p className="text-gray-400">Biblioteca de conhecimento místico e sabedoria</p>
        </motion.div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar PDF..."
              className="pl-10 bg-slate-900/50 border-purple-500/30 text-white"
            />
          </div>
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
          <TabsList className="grid grid-cols-6 w-full bg-slate-900/50">
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="receitas">Receitas</TabsTrigger>
            <TabsTrigger value="mundo_holistico">Holístico</TabsTrigger>
            <TabsTrigger value="marketing_digital">Marketing</TabsTrigger>
            <TabsTrigger value="saude_mental">Saúde</TabsTrigger>
            <TabsTrigger value="outros">Outros</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
              </div>
            ) : filteredPDFs.length === 0 ? (
              <Card className="bg-slate-900/50 border-purple-500/30 p-12 text-center">
                <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Nenhum PDF encontrado</p>
              </Card>
            ) : (
              <div className="space-y-8">
                {categorizedPDFs.map(({ category, pdfs }) => (
                  <div key={category}>
                    <h2 className="text-xl font-bold text-purple-300 mb-4 flex items-center gap-2">
                      <span>{CATEGORY_EMOJIS[category]}</span>
                      {CATEGORY_LABELS[category]}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {pdfs.map((pdf) => (
                        <motion.div
                          key={pdf.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <Card className="bg-slate-900/50 border-purple-500/30 overflow-hidden h-full flex flex-col">
                            {pdf.cover_image_url && (
                              <img
                                src={pdf.cover_image_url}
                                alt={pdf.title}
                                className="w-full h-48 object-cover"
                              />
                            )}
                            <div className="p-4 flex-1 flex flex-col">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="text-white font-bold text-lg flex-1">{pdf.title}</h3>
                                {pdf.is_premium && (
                                  <Badge className="bg-gradient-to-r from-yellow-600 to-amber-600 text-white text-xs ml-2">
                                    <Crown className="w-3 h-3 mr-1" />
                                    PRO
                                  </Badge>
                                )}
                              </div>
                              
                              {pdf.description && (
                                <p className="text-sm text-gray-400 mb-3 line-clamp-2 flex-1">
                                  {pdf.description}
                                </p>
                              )}

                              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                                {pdf.pages_count && <span>📄 {pdf.pages_count} páginas</span>}
                                <div className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  <span>{pdf.views_count || 0} views</span>
                                </div>
                              </div>

                              <Button
                                onClick={() => {
                                  if (pdf.is_premium && !user.is_pro_subscriber) {
                                    alert("Este PDF é exclusivo para assinantes PRO");
                                    return;
                                  }
                                  handleViewPDF(pdf);
                                }}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                Ver PDF
                              </Button>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}