import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { 
  Heart, Calendar, TrendingUp, Activity, Droplet, Moon,
  Thermometer, Pill, MessageSquare, Bell, Loader2, Plus
} from "lucide-react";

const CYCLE_PHASES = {
  menstrual: { name: 'Menstrual', color: 'from-red-500 to-pink-500', emoji: '🌙', description: 'Fase de renovação' },
  folicular: { name: 'Folicular', color: 'from-green-500 to-emerald-500', emoji: '🌱', description: 'Fase de crescimento' },
  ovulacao: { name: 'Ovulação', color: 'from-yellow-500 to-amber-500', emoji: '☀️', description: 'Pico de fertilidade' },
  lutea: { name: 'Lútea', color: 'from-purple-500 to-indigo-500', emoji: '🌸', description: 'Preparação' }
};

const SYMPTOMS = [
  'Cólicas', 'Dor de cabeça', 'Inchaço', 'Sensibilidade nos seios', 
  'Fadiga', 'Mudanças de humor', 'Acne', 'Náusea', 'Dor lombar', 
  'Ansiedade', 'Insônia', 'Apetite aumentado'
];

const MOODS = ['Feliz', 'Calma', 'Irritada', 'Ansiosa', 'Triste', 'Energética', 'Cansada'];
const FLOW_INTENSITY = ['Leve', 'Moderado', 'Intenso', 'Muito intenso'];

export default function CicloMenstrualPage() {
  const [user, setUser] = useState(null);
  const [showSetup, setShowSetup] = useState(false);
  const [setupData, setSetupData] = useState({
    last_period_start: '',
    cycle_length: 28,
    period_length: 5
  });
  const [todaySymptoms, setTodaySymptoms] = useState([]);
  const [todayMood, setTodayMood] = useState('');
  const [todayFlow, setTodayFlow] = useState('');
  const [todayNotes, setTodayNotes] = useState('');
  const queryClient = useQueryClient();

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const currentUser = await base44.auth.me();
    setUser(currentUser);
  };

  const { data: cycleData } = useQuery({
    queryKey: ['menstrual-cycle', user?.id],
    queryFn: () => base44.entities.MenstrualCycle.filter({ user_id: user?.id }),
    enabled: !!user
  });

  const currentCycle = cycleData?.[0];

  const setupCycleMutation = useMutation({
    mutationFn: async (data) => {
      const nextPeriodDate = new Date(data.last_period_start);
      nextPeriodDate.setDate(nextPeriodDate.getDate() + data.cycle_length);

      const ovulationDate = new Date(data.last_period_start);
      ovulationDate.setDate(ovulationDate.getDate() + Math.floor(data.cycle_length / 2));

      const fertileStart = new Date(ovulationDate);
      fertileStart.setDate(fertileStart.getDate() - 3);
      
      const fertileEnd = new Date(ovulationDate);
      fertileEnd.setDate(fertileEnd.getDate() + 1);

      if (currentCycle) {
        return await base44.entities.MenstrualCycle.update(currentCycle.id, {
          ...data,
          next_period_prediction: nextPeriodDate.toISOString().split('T')[0],
          ovulation_date: ovulationDate.toISOString().split('T')[0],
          fertile_window: {
            start: fertileStart.toISOString().split('T')[0],
            end: fertileEnd.toISOString().split('T')[0]
          }
        });
      }

      return await base44.entities.MenstrualCycle.create({
        user_id: user.id,
        ...data,
        next_period_prediction: nextPeriodDate.toISOString().split('T')[0],
        ovulation_date: ovulationDate.toISOString().split('T')[0],
        fertile_window: {
          start: fertileStart.toISOString().split('T')[0],
          end: fertileEnd.toISOString().split('T')[0]
        },
        symptoms_tracking: [],
        cycle_phase: 'menstrual'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menstrual-cycle'] });
      setShowSetup(false);
      alert('✅ Ciclo configurado!');
    }
  });

  const logSymptomsMutation = useMutation({
    mutationFn: async () => {
      if (!currentCycle) return;

      const newLog = {
        date: new Date().toISOString().split('T')[0],
        symptoms: todaySymptoms,
        mood: todayMood,
        flow_intensity: todayFlow,
        notes: todayNotes
      };

      const updatedTracking = [...(currentCycle.symptoms_tracking || []), newLog];

      return await base44.entities.MenstrualCycle.update(currentCycle.id, {
        symptoms_tracking: updatedTracking
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menstrual-cycle'] });
      setTodaySymptoms([]);
      setTodayMood('');
      setTodayFlow('');
      setTodayNotes('');
      alert('✅ Sintomas registrados!');
    }
  });

  const calculatePhase = () => {
    if (!currentCycle) return null;
    
    const today = new Date();
    const lastPeriod = new Date(currentCycle.last_period_start);
    const daysSincePeriod = Math.floor((today - lastPeriod) / (1000 * 60 * 60 * 24));
    
    if (daysSincePeriod < currentCycle.period_length) return 'menstrual';
    if (daysSincePeriod < currentCycle.cycle_length / 2 - 2) return 'folicular';
    if (daysSincePeriod < currentCycle.cycle_length / 2 + 2) return 'ovulacao';
    return 'lutea';
  };

  const currentPhase = calculatePhase();
  const phaseConfig = currentPhase ? CYCLE_PHASES[currentPhase] : null;

  const toggleSymptom = (symptom) => {
    setTodaySymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  if (!user) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#02031C] via-slate-900 to-[#02031C]">
      <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#02031C] via-slate-900 to-[#02031C] text-white p-3 md:p-6 pb-24">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mx-auto mb-4 shadow-2xl"
          >
            <Heart className="w-10 h-10 md:w-12 md:h-12 text-white" />
          </motion.div>
          <h1 className="text-2xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
            Ciclo Menstrual
          </h1>
          <p className="text-slate-300 text-sm md:text-base">Acompanhe e entenda seu ciclo</p>
        </motion.div>

        {!currentCycle || showSetup ? (
          <Card className="bg-slate-800/50 border-pink-500/30 p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-bold text-pink-300 mb-4">Configuração Inicial</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-300 mb-2 block">Primeiro dia do último período</label>
                <Input
                  type="date"
                  value={setupData.last_period_start}
                  onChange={(e) => setSetupData({...setupData, last_period_start: e.target.value})}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Duração do ciclo (dias)</label>
                  <Input
                    type="number"
                    value={setupData.cycle_length}
                    onChange={(e) => setSetupData({...setupData, cycle_length: parseInt(e.target.value)})}
                    min={21}
                    max={35}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Duração do período (dias)</label>
                  <Input
                    type="number"
                    value={setupData.period_length}
                    onChange={(e) => setSetupData({...setupData, period_length: parseInt(e.target.value)})}
                    min={2}
                    max={10}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
              </div>
              <Button
                onClick={() => setupCycleMutation.mutate(setupData)}
                disabled={!setupData.last_period_start || setupCycleMutation.isPending}
                className="w-full bg-gradient-to-r from-pink-600 to-rose-600"
              >
                Salvar Configuração
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Fase Atual */}
            {phaseConfig && (
              <Card className={`bg-gradient-to-r ${phaseConfig.color} border-2 border-white/20 p-4 md:p-6 text-center shadow-2xl`}>
                <div className="text-5xl mb-3">{phaseConfig.emoji}</div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2 text-white drop-shadow-lg">{phaseConfig.name}</h2>
                <p className="text-white drop-shadow-md">{phaseConfig.description}</p>
              </Card>
            )}

            {/* Cards de Info */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="bg-slate-800/50 border-pink-500/30 p-4 text-center">
                <Calendar className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                <p className="text-sm text-slate-300 mb-1">Próximo Período</p>
                <p className="text-lg font-bold text-white">
                  {new Date(currentCycle.next_period_prediction).toLocaleDateString('pt-BR')}
                </p>
              </Card>

              <Card className="bg-slate-800/50 border-yellow-500/30 p-4 text-center">
                <Moon className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-sm text-slate-300 mb-1">Ovulação</p>
                <p className="text-lg font-bold text-white">
                  {new Date(currentCycle.ovulation_date).toLocaleDateString('pt-BR')}
                </p>
              </Card>

              <Card className="bg-slate-800/50 border-green-500/30 p-4 text-center">
                <Activity className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-sm text-slate-300 mb-1">Janela Fértil</p>
                <p className="text-xs font-bold text-white">
                  {new Date(currentCycle.fertile_window.start).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} - {new Date(currentCycle.fertile_window.end).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </p>
              </Card>
            </div>

            <Tabs defaultValue="hoje" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-slate-800">
                <TabsTrigger value="hoje">Hoje</TabsTrigger>
                <TabsTrigger value="historico">Histórico</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
              </TabsList>

              <TabsContent value="hoje" className="space-y-4 mt-4">
                <Card className="bg-slate-800/50 border-pink-500/30 p-4 md:p-6">
                  <h3 className="text-lg font-bold text-pink-300 mb-4">Registrar Hoje</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-slate-300 mb-2 block">Sintomas</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {SYMPTOMS.map(symptom => (
                          <button
                            key={symptom}
                            onClick={() => toggleSymptom(symptom)}
                            className={`p-2 rounded-lg border-2 text-sm transition ${
                              todaySymptoms.includes(symptom)
                                ? 'border-pink-500 bg-pink-500/20 text-white'
                                : 'border-slate-600 hover:border-pink-400 text-slate-200'
                            }`}
                          >
                            {symptom}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-slate-300 mb-2 block">Humor</label>
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                        {MOODS.map(mood => (
                          <button
                            key={mood}
                            onClick={() => setTodayMood(mood)}
                            className={`p-2 rounded-lg border-2 text-sm transition ${
                              todayMood === mood
                                ? 'border-purple-500 bg-purple-500/20 text-white'
                                : 'border-slate-600 hover:border-purple-400 text-slate-200'
                            }`}
                          >
                            {mood}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-slate-300 mb-2 block">Intensidade do Fluxo</label>
                      <div className="grid grid-cols-4 gap-2">
                        {FLOW_INTENSITY.map(flow => (
                          <button
                            key={flow}
                            onClick={() => setTodayFlow(flow)}
                            className={`p-2 rounded-lg border-2 text-xs transition ${
                              todayFlow === flow
                                ? 'border-red-500 bg-red-500/20 text-white'
                                : 'border-slate-600 hover:border-red-400 text-slate-200'
                            }`}
                          >
                            {flow}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-slate-300 mb-2 block">Notas</label>
                      <Input
                        value={todayNotes}
                        onChange={(e) => setTodayNotes(e.target.value)}
                        placeholder="Observações do dia..."
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>

                    <Button
                      onClick={() => logSymptomsMutation.mutate()}
                      disabled={logSymptomsMutation.isPending}
                      className="w-full bg-gradient-to-r from-pink-600 to-rose-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Salvar Registro de Hoje
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="historico" className="mt-4">
                <Card className="bg-slate-800/50 border-purple-500/30 p-4 md:p-6">
                  <h3 className="text-lg font-bold text-purple-300 mb-4">📊 Histórico de Sintomas</h3>
                  {currentCycle?.symptoms_tracking && currentCycle.symptoms_tracking.length > 0 ? (
                    <div className="space-y-3">
                      {currentCycle.symptoms_tracking.slice().reverse().map((log, idx) => (
                        <div key={idx} className="p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold text-sm">{new Date(log.date).toLocaleDateString('pt-BR')}</p>
                            {log.mood && <Badge variant="outline">{log.mood}</Badge>}
                          </div>
                          {log.symptoms && log.symptoms.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {log.symptoms.map((s, i) => (
                                <span key={i} className="text-xs bg-pink-900/30 px-2 py-1 rounded">{s}</span>
                              ))}
                            </div>
                          )}
                          {log.flow_intensity && (
                            <p className="text-xs text-slate-400">Fluxo: {log.flow_intensity}</p>
                          )}
                          {log.notes && (
                            <p className="text-xs text-slate-300 mt-2">{log.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-slate-400 py-8">Nenhum registro ainda</p>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="insights" className="mt-4">
                <Card className="bg-slate-800/50 border-blue-500/30 p-4 md:p-6">
                  <h3 className="text-lg font-bold text-blue-300 mb-4">💡 Insights de Saúde</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
                      <h4 className="font-semibold text-blue-300 mb-2">Fase Atual</h4>
                      <p className="text-sm text-slate-200">
                        Durante a fase {phaseConfig?.name.toLowerCase()}, é comum sentir {
                          currentPhase === 'menstrual' ? 'mais cansaço e necessidade de descanso' :
                          currentPhase === 'folicular' ? 'mais energia e criatividade' :
                          currentPhase === 'ovulacao' ? 'pico de energia e sociabilidade' :
                          'mudanças de humor e necessidade de autocuidado'
                        }.
                      </p>
                    </div>

                    <div className="p-4 bg-green-900/20 rounded-lg border border-green-500/30">
                      <h4 className="font-semibold text-green-300 mb-2">Recomendações</h4>
                      <ul className="text-sm text-slate-200 space-y-1">
                        <li>• Mantenha-se hidratada</li>
                        <li>• Pratique exercícios leves durante o período</li>
                        <li>• Alimente-se bem, especialmente com ferro</li>
                        <li>• Descanse adequadamente</li>
                        <li>• Monitore sintomas incomuns</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
                      <h4 className="font-semibold text-yellow-300 mb-2">⚠️ Quando consultar um médico</h4>
                      <ul className="text-xs text-slate-300 space-y-1">
                        <li>• Dor intensa que interfere nas atividades diárias</li>
                        <li>• Sangramento muito intenso ou prolongado</li>
                        <li>• Ciclos muito irregulares</li>
                        <li>• Sintomas novos ou incomuns</li>
                      </ul>
                    </div>

                    <Button
                      onClick={() => setShowSetup(true)}
                      variant="outline"
                      className="w-full border-slate-600"
                    >
                      Atualizar Configurações
                    </Button>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}