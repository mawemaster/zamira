import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { 
  Wand2, Loader2, Hexagon, CloudMoon, Moon, Zap, Heart,
  Calendar, Image, Music, Sparkles, Download, Eye, Trash2
} from "lucide-react";

export default function CofreTesorosPage() {
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const currentUser = await base44.auth.me();
    setUser(currentUser);
  };

  // Buscar todas as criações do usuário
  const { data: mandalas } = useQuery({
    queryKey: ['saved-mandalas', user?.id],
    queryFn: () => base44.entities.MandalaCreation.filter({ creator_id: user?.id }),
    enabled: !!user
  });

  const { data: charts } = useQuery({
    queryKey: ['saved-charts', user?.id],
    queryFn: () => base44.entities.BirthChart.filter({ user_id: user?.id }),
    enabled: !!user
  });

  const { data: auras } = useQuery({
    queryKey: ['saved-auras', user?.id],
    queryFn: () => base44.entities.AuraReading.filter({ user_id: user?.id }),
    enabled: !!user
  });

  const { data: dreams } = useQuery({
    queryKey: ['saved-dreams', user?.id],
    queryFn: () => base44.entities.DreamInterpretation.filter({ user_id: user?.id }),
    enabled: !!user
  });

  const { data: pendulums } = useQuery({
    queryKey: ['saved-pendulums', user?.id],
    queryFn: () => base44.entities.PendulumQuestion.filter({ user_id: user?.id }),
    enabled: !!user
  });

  const { data: lunarEvents } = useQuery({
    queryKey: ['saved-events', user?.id],
    queryFn: () => base44.entities.LunarEvent.filter({ user_id: user?.id }),
    enabled: !!user
  });

  if (!user) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#02031C] via-slate-900 to-[#02031C]">
      <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
    </div>
  );

  const totalItems = (mandalas?.length || 0) + (charts?.length || 0) + (auras?.length || 0) + 
                     (dreams?.length || 0) + (pendulums?.length || 0) + (lunarEvents?.length || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#02031C] via-slate-900 to-[#02031C] text-white p-3 md:p-6 pb-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center mx-auto mb-4 shadow-2xl"
          >
            <Wand2 className="w-10 h-10 md:w-12 md:h-12 text-white" />
          </motion.div>
          <h1 className="text-2xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">
            Cofre de Tesouros
          </h1>
          <p className="text-slate-300 text-sm md:text-base">Tudo que você salvou no Zamira ({totalItems} itens)</p>
        </motion.div>

        <Tabs defaultValue="mandalas" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 bg-slate-800 mb-6">
            <TabsTrigger value="mandalas" className="text-xs md:text-sm">
              <Hexagon className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              Mandalas
            </TabsTrigger>
            <TabsTrigger value="mapas" className="text-xs md:text-sm">
              <Moon className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              Mapas
            </TabsTrigger>
            <TabsTrigger value="auras" className="text-xs md:text-sm">
              <Zap className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              Auras
            </TabsTrigger>
            <TabsTrigger value="sonhos" className="text-xs md:text-sm">
              <CloudMoon className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              Sonhos
            </TabsTrigger>
            <TabsTrigger value="pendulo" className="text-xs md:text-sm">
              <Sparkles className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              Pêndulo
            </TabsTrigger>
            <TabsTrigger value="eventos" className="text-xs md:text-sm">
              <Calendar className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              Eventos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mandalas" className="space-y-4">
            {!mandalas || mandalas.length === 0 ? (
              <Card className="bg-slate-800/50 border-pink-500/30 p-12 text-center">
                <Hexagon className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400">Nenhuma mandala salva</p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mandalas.map(mandala => (
                  <Card key={mandala.id} className="bg-slate-800/50 border-pink-500/30 p-4">
                    <img src={mandala.image_url} className="w-full aspect-square object-cover rounded-lg mb-3" />
                    <h3 className="font-bold text-pink-300 mb-1">{mandala.title}</h3>
                    <p className="text-xs text-slate-300 mb-2">{mandala.intention}</p>
                    <p className="text-xs text-slate-400">{new Date(mandala.created_date).toLocaleDateString('pt-BR')}</p>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="mapas" className="space-y-4">
            {!charts || charts.length === 0 ? (
              <Card className="bg-slate-800/50 border-purple-500/30 p-12 text-center">
                <Moon className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400">Nenhum mapa astral gerado</p>
              </Card>
            ) : (
              charts.map(chart => (
                <Card key={chart.id} className="bg-slate-800/50 border-purple-500/30 p-4 md:p-6">
                  <h3 className="text-lg font-bold text-purple-300 mb-2">{chart.full_name}</h3>
                  <div className="text-sm text-slate-300 mb-3">
                    <p>📅 {new Date(chart.birth_date).toLocaleDateString('pt-BR')}</p>
                    <p>🕐 {chart.birth_time}</p>
                    <p>📍 {chart.birth_place?.city}</p>
                  </div>
                  <div className="bg-slate-700/50 p-3 rounded-lg max-h-40 overflow-y-auto">
                    <p className="text-xs text-slate-200 whitespace-pre-wrap">{chart.full_interpretation}</p>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="auras" className="space-y-4">
            {!auras || auras.length === 0 ? (
              <Card className="bg-slate-800/50 border-orange-500/30 p-12 text-center">
                <Zap className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400">Nenhuma leitura de aura</p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {auras.map(aura => (
                  <Card key={aura.id} className="bg-slate-800/50 border-orange-500/30 p-4">
                    <div className="relative mb-3">
                      <img src={aura.photo_url} className="w-full aspect-square object-cover rounded-lg" />
                      <div className="absolute inset-0 rounded-lg" style={{
                        background: `radial-gradient(circle, transparent 40%, ${aura.aura_color}60 70%, ${aura.aura_color}30 100%)`
                      }} />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full" style={{backgroundColor: aura.aura_color}} />
                      <div>
                        <p className="font-bold text-orange-300 text-sm">{aura.emotion_detected}</p>
                        <p className="text-xs text-slate-300">{aura.energy_level}% energia</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400">{new Date(aura.scanned_at).toLocaleDateString('pt-BR')}</p>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sonhos" className="space-y-4">
            {!dreams || dreams.length === 0 ? (
              <Card className="bg-slate-800/50 border-indigo-500/30 p-12 text-center">
                <CloudMoon className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400">Nenhum sonho interpretado</p>
              </Card>
            ) : (
              dreams.map(dream => (
                <Card key={dream.id} className="bg-slate-800/50 border-indigo-500/30 p-4 md:p-6">
                  <h3 className="font-bold text-indigo-300 mb-2">{dream.dream_title}</h3>
                  <p className="text-sm text-slate-300 mb-3 line-clamp-2">{dream.dream_content}</p>
                  <div className="bg-purple-900/30 p-3 rounded-lg">
                    <h4 className="text-xs font-bold text-purple-300 mb-2">Interpretação:</h4>
                    <p className="text-xs text-slate-200 line-clamp-3">{dream.interpretation}</p>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">{new Date(dream.created_date).toLocaleDateString('pt-BR')}</p>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="pendulo" className="space-y-4">
            {!pendulums || pendulums.length === 0 ? (
              <Card className="bg-slate-800/50 border-cyan-500/30 p-12 text-center">
                <Sparkles className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400">Nenhuma consulta ao pêndulo</p>
              </Card>
            ) : (
              pendulums.map(pend => (
                <Card key={pend.id} className="bg-slate-800/50 border-cyan-500/30 p-4 md:p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                      pend.answer === 'sim' ? 'bg-green-500' :
                      pend.answer === 'nao' ? 'bg-red-500' :
                      'bg-yellow-500'
                    }`}>
                      {pend.answer === 'sim' ? '✅' : pend.answer === 'nao' ? '❌' : '🤔'}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-200 italic">"{pend.question}"</p>
                      <p className="text-xs text-cyan-300 font-bold mt-1">
                        Resposta: {pend.answer.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">{pend.energy_reading}</p>
                  <p className="text-xs text-slate-400 mt-2">{new Date(pend.asked_at).toLocaleDateString('pt-BR')}</p>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="eventos" className="space-y-4">
            {!lunarEvents || lunarEvents.length === 0 ? (
              <Card className="bg-slate-800/50 border-blue-500/30 p-12 text-center">
                <Calendar className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400">Nenhum evento lunar salvo</p>
              </Card>
            ) : (
              lunarEvents.map(event => (
                <Card key={event.id} className="bg-slate-800/50 border-blue-500/30 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{backgroundColor: event.color}}>
                      🌙
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-blue-300">{event.title}</h3>
                      <p className="text-xs text-slate-300">{event.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-300">
                    <span>📅 {new Date(event.event_date).toLocaleDateString('pt-BR')}</span>
                    {event.event_time && <span>🕐 {event.event_time}</span>}
                    <Badge variant="outline" className="text-xs capitalize text-slate-300">{event.moon_phase}</Badge>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}