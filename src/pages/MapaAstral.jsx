import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Loader2, Download, Share2, Calendar, Clock, MapPin, Sparkles } from "lucide-react";

export default function MapaAstralPage() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    full_name: "",
    birth_date: "",
    birth_time: "",
    birth_city: "",
    birth_state: "",
    birth_country: "Brasil"
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedChart, setGeneratedChart] = useState(null);

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const currentUser = await base44.auth.me();
    setUser(currentUser);
    setFormData(prev => ({
      ...prev,
      full_name: currentUser.display_name || currentUser.full_name || ""
    }));
  };

  const { data: savedCharts } = useQuery({
    queryKey: ['birth-charts', user?.id],
    queryFn: () => base44.entities.BirthChart.filter({ user_id: user?.id }),
    enabled: !!user
  });

  const generateChart = async () => {
    if (!formData.full_name || !formData.birth_date || !formData.birth_time || !formData.birth_city) {
      alert('Preencha todos os campos');
      return;
    }

    setIsGenerating(true);

    try {
      // Gerar interpretação com IA
      const prompt = `Você é um astrólogo experiente. Crie uma interpretação detalhada e personalizada do mapa astral para:

Nome: ${formData.full_name}
Data de Nascimento: ${formData.birth_date}
Hora: ${formData.birth_time}
Local: ${formData.birth_city}, ${formData.birth_state}, ${formData.birth_country}

Forneça uma análise completa incluindo:
1. Signo Solar, Lunar e Ascendente
2. Posicionamento dos planetas pessoais (Mercúrio, Vênus, Marte)
3. Características principais de personalidade
4. Dons e talentos naturais
5. Desafios a serem trabalhados
6. Propósito de vida e missão da alma
7. Orientações para o momento atual

Use linguagem acolhedora, mística e inspiradora. Seja detalhado e personalizado.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false
      });

      // Salvar no banco
      const chart = await base44.entities.BirthChart.create({
        user_id: user.id,
        full_name: formData.full_name,
        birth_date: formData.birth_date,
        birth_time: formData.birth_time,
        birth_place: {
          city: formData.birth_city,
          state: formData.birth_state,
          country: formData.birth_country
        },
        full_interpretation: response,
        generated_at: new Date().toISOString()
      });

      setGeneratedChart(chart);
      setIsGenerating(false);
    } catch (error) {
      alert('Erro ao gerar: ' + error.message);
      setIsGenerating(false);
    }
  };

  const shareChart = async () => {
    if (!generatedChart) return;

    try {
      await base44.entities.Post.create({
        author_id: user.id,
        author_name: user.display_name || user.full_name,
        author_avatar: user.avatar_url,
        author_level: user.level,
        author_archetype: user.archetype,
        post_type: 'reflexao',
        content: `🌙 Meu Mapa Astral\n\nAcabo de descobrir insights profundos sobre minha jornada através do mapa astral! ✨\n\nData: ${new Date(generatedChart.generated_at).toLocaleString('pt-BR')}`,
        visibility: 'public'
      });

      alert('✅ Compartilhado no feed!');
    } catch (error) {
      alert('Erro: ' + error.message);
    }
  };

  if (!user) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#02031C] via-slate-900 to-[#02031C]">
      <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#02031C] via-slate-900 to-[#02031C] text-white p-3 md:p-6 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-2xl"
          >
            <Moon className="w-10 h-10 md:w-12 md:h-12 text-white" />
          </motion.div>
          <h1 className="text-2xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Mapa Astral
          </h1>
          <p className="text-slate-300 text-sm md:text-base">Planetário da Alma - seu mapa completo</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!isGenerating && !generatedChart && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-slate-800/50 border-purple-500/30 p-4 md:p-6 mb-6">
                <h3 className="text-lg md:text-xl font-bold text-purple-300 mb-4">📝 Seus Dados de Nascimento</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-300 mb-2 block flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Nome Completo
                    </label>
                    <Input
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      placeholder="Seu nome completo"
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-slate-300 mb-2 block flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Data de Nascimento
                      </label>
                      <Input
                        type="date"
                        value={formData.birth_date}
                        onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-slate-300 mb-2 block flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Hora de Nascimento
                      </label>
                      <Input
                        type="time"
                        value={formData.birth_time}
                        onChange={(e) => setFormData({...formData, birth_time: e.target.value})}
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-slate-300 mb-2 block flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Cidade de Nascimento
                    </label>
                    <Input
                      value={formData.birth_city}
                      onChange={(e) => setFormData({...formData, birth_city: e.target.value})}
                      placeholder="Ex: São Paulo"
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-slate-300 mb-2 block">Estado</label>
                      <Input
                        value={formData.birth_state}
                        onChange={(e) => setFormData({...formData, birth_state: e.target.value})}
                        placeholder="Ex: SP"
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-slate-300 mb-2 block">País</label>
                      <Input
                        value={formData.birth_country}
                        onChange={(e) => setFormData({...formData, birth_country: e.target.value})}
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={generateChart}
                  className="w-full mt-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-6 text-lg"
                  size="lg"
                >
                  <Moon className="w-5 h-5 mr-2" />
                  Gerar Meu Mapa Astral
                </Button>
              </Card>

              {/* Mapas Salvos */}
              {savedCharts && savedCharts.length > 0 && (
                <Card className="bg-slate-800/50 border-blue-500/30 p-4 md:p-6">
                  <h3 className="text-lg font-bold text-blue-300 mb-4">📚 Mapas Anteriores</h3>
                  <div className="space-y-3">
                    {savedCharts.map(chart => (
                      <button
                        key={chart.id}
                        onClick={() => setGeneratedChart(chart)}
                        className="w-full p-3 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-blue-500 transition text-left"
                      >
                        <p className="font-semibold text-white">{chart.full_name}</p>
                        <p className="text-sm text-slate-400">
                          {new Date(chart.generated_at).toLocaleDateString('pt-BR')} às {new Date(chart.generated_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </button>
                    ))}
                  </div>
                </Card>
              )}
            </motion.div>
          )}

          {isGenerating && (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Card className="bg-slate-800/50 border-purple-500/30 p-8 md:p-12">
                <motion.div
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity }
                  }}
                  className="w-32 h-32 mx-auto mb-6"
                >
                  <div className="relative w-full h-full">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 opacity-50 blur-xl" />
                    <div className="absolute inset-4 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                      <Moon className="w-16 h-16 text-white" />
                    </div>
                  </div>
                </motion.div>

                <motion.h2
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-2xl md:text-3xl font-bold text-purple-300 mb-4"
                >
                  Consultando os Astros...
                </motion.h2>
                <p className="text-slate-400 mb-2">A IA está analisando seu mapa natal</p>
                <p className="text-sm text-slate-500">Interpretando posições planetárias e aspectos astrológicos</p>

                {/* Estrelas flutuantes */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {[...Array(30)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ 
                        x: Math.random() * 600 - 300,
                        y: Math.random() * 600,
                        opacity: 0,
                        scale: 0
                      }}
                      animate={{
                        y: [null, -200],
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0]
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: "easeOut"
                      }}
                      className="absolute w-2 h-2 bg-purple-400 rounded-full"
                    />
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {generatedChart && !isGenerating && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-slate-800/50 border-purple-500/30 p-4 md:p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl md:text-2xl font-bold text-purple-300">
                    Mapa Astral de {generatedChart.full_name}
                  </h3>
                  <Button
                    onClick={() => setGeneratedChart(null)}
                    variant="outline"
                    size="sm"
                    className="border-slate-600"
                  >
                    Nova Consulta
                  </Button>
                </div>

                <div className="mb-4 p-3 bg-slate-700/50 rounded-lg text-sm text-slate-300">
                  <p>📅 {new Date(generatedChart.birth_date).toLocaleDateString('pt-BR')}</p>
                  <p>🕐 {generatedChart.birth_time}</p>
                  <p>📍 {generatedChart.birth_place?.city}, {generatedChart.birth_place?.state}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    Gerado em: {new Date(generatedChart.generated_at).toLocaleString('pt-BR')}
                  </p>
                </div>

                <div className="prose prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-slate-200 leading-relaxed">
                    {generatedChart.full_interpretation}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-3 mt-6">
                  <Button
                    onClick={shareChart}
                    variant="outline"
                    className="border-blue-500 text-blue-400 hover:bg-blue-500/20"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartilhar
                  </Button>
                  <Button
                    onClick={() => {
                      const element = document.createElement('a');
                      const file = new Blob([generatedChart.full_interpretation], {type: 'text/plain'});
                      element.href = URL.createObjectURL(file);
                      element.download = `mapa-astral-${generatedChart.full_name}.txt`;
                      element.click();
                    }}
                    variant="outline"
                    className="border-green-500 text-green-400 hover:bg-green-500/20"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}