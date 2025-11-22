
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, Moon, Plus, X, Sparkles, Clock, Focus, Play, Pause, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, parseISO, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

const moonPhases = [
  { value: "new", emoji: "🌑", name: "Lua Nova" },
  { value: "waxing_crescent", emoji: "🌒", name: "Crescente" },
  { value: "first_quarter", emoji: "🌓", name: "Quarto Crescente" },
  { value: "waxing_gibbous", emoji: "🌔", name: "Crescente Gibosa" },
  { value: "full", emoji: "🌕", name: "Lua Cheia" },
  { value: "waning_gibbous", emoji: "🌖", name: "Minguante Gibosa" },
  { value: "last_quarter", emoji: "🌗", name: "Quarto Minguante" },
  { value: "waning_crescent", emoji: "🌘", name: "Minguante" }
];

export default function PlannerLunarPage() {
  const [user, setUser] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false); // Renamed from showModal
  const [showFocusMode, setShowFocusMode] = useState(false);
  const [eventForm, setEventForm] = useState({ // Renamed from formData
    title: "",
    description: "",
    color: "#A855F7", // Updated default color to match outline
    time: "09:00"
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    // Scroll to top on component mount, useful for SPA navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    }
  };

  const { data: events } = useQuery({
    queryKey: ['lunarEvents', user?.id],
    queryFn: () => base44.entities.LunarEvent.filter({ user_id: user.id }),
    enabled: !!user,
    initialData: [],
  });

  const createEventMutation = useMutation({
    mutationFn: async (eventData) => {
      // Formatar data corretamente no fuso horário local
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      
      const newEvent = await base44.entities.LunarEvent.create({
        user_id: user.id,
        event_date: dateStr,
        event_time: eventData.time,
        moon_phase: getMoonPhaseForDate(selectedDate)?.value, // Use the updated function name
        ...eventData
      });

      // Criar notificação de confirmação
      await base44.entities.Notification.create({
        user_id: user.id,
        type: "announcement",
        title: "Evento Criado! 🌙",
        message: `"${eventData.title}" foi adicionado ao seu Planner Lunar para ${format(selectedDate, "d 'de' MMMM", { locale: ptBR })}`,
        related_entity_type: "event",
        related_entity_id: newEvent.id
      });

      return newEvent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lunarEvents'] });
      setShowEventModal(false); // Updated modal state
      setEventForm({ title: "", description: "", color: "#A855F7", time: "09:00" }); // Updated form state
      toast.success("Evento criado com sucesso! 🌙");
    },
    onError: (error) => {
      console.error("Erro ao criar evento:", error);
      toast.error("Erro ao criar evento");
    }
  });

  const deleteEventMutation = useMutation({
    mutationFn: (eventId) => base44.entities.LunarEvent.delete(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lunarEvents'] });
      toast.success("Evento removido");
    },
    onError: (error) => {
      console.error("Erro ao deletar evento:", error);
      toast.error("Erro ao remover evento");
    }
  });

  const getMoonPhaseForDate = (date) => { // Renamed function
    if (!date) return null;
    // Simple moon phase approximation based on day of month, for demonstration purposes
    // A more accurate calculation would involve astronomical algorithms
    const day = date.getDate();
    const cycle = Math.floor((day % 29.5) / 3.69); // Approx length of a lunar cycle is 29.5 days
    return moonPhases[cycle];
  };

  const getDaysInMonthForCalendar = () => {
    const startOfCurrentMonth = startOfMonth(currentDate);
    const endOfCurrentMonth = endOfMonth(currentDate);

    // Get the first day of the week for the start of the month (Sunday = 0, Monday = 1, etc.)
    const startDayOfWeek = startOfCurrentMonth.getDay();

    // Calculate the start date of the calendar grid (could be from the previous month)
    const startDate = subMonths(startOfCurrentMonth, 1); // Start from a month before to be safe
    // Go back to the first day of the week (e.g., Sunday)
    const startDay = startOfWeek(startOfCurrentMonth, { weekStartsOn: 0 }); // Sunday is 0

    // Ensure we have at least 6 weeks (42 days) displayed to maintain consistent layout
    const endDate = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 });
    let days = eachDayOfInterval({ start: startDay, end: endDate });

    // If less than 42 days, add days from the next month
    while (days.length < 42) {
      endDate.setDate(endDate.getDate() + 1);
      days = eachDayOfInterval({ start: startDay, end: endDate });
    }

    return days;
  };

  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = parseISO(event.event_date);
      return isSameDay(eventDate, date);
    });
  };

  const handleCreateEvent = () => {
    if (!eventForm.title.trim()) { // Updated form state
      toast.error("Digite um título para o evento");
      return;
    }
    createEventMutation.mutate(eventForm); // Updated form state
  };

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDateClick = (day) => {
    setSelectedDate(day);
    setShowEventModal(true); // Updated modal state
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Sparkles className="w-12 h-12 text-purple-500 animate-pulse" />
      </div>
    );
  }

  const daysInMonth = getDaysInMonthForCalendar();
  const currentMonth = currentDate.getMonth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-white p-4 md:p-6 pb-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 mb-6">
            <CalendarIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Planner Lunar</h1>
          <p className="text-gray-400 text-sm md:text-base">Organize sua vida com as fases da lua</p>

          {/* Botão Modo Foco */}
          <Button
            onClick={() => setShowFocusMode(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 mt-4"
          >
            <Focus className="w-5 h-5 mr-2" />
            Modo Foco Total
          </Button>
        </motion.div>

        {/* Navegação do Calendário */}
        <Card className="bg-slate-900/50 border-purple-500/30 p-4 md:p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handlePreviousMonth}
              className="text-white hover:text-purple-400 transition"
            >
              ← Anterior
            </button>
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-white capitalize">
              {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
            </h2>
            <button
              onClick={handleNextMonth}
              className="text-white hover:text-purple-400 transition"
            >
              Próximo →
            </button>
          </div>

          {/* Grid do Calendário */}
          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {/* Dias da Semana */}
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
              <div key={day} className="text-center text-gray-400 text-xs md:text-sm font-semibold p-1 md:p-2">
                {day}
              </div>
            ))}

            {/* Dias do Mês */}
            {daysInMonth.map((day, index) => {
              const dayEvents = events.filter(event => 
                isSameDay(parseISO(event.event_date), day)
              );
              const phase = getMoonPhaseForDate(day);
              const isToday = isSameDay(day, new Date());
              const isSelected = selectedDate && isSameDay(day, selectedDate);

              return (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDateClick(day)}
                  className={`aspect-square rounded-lg p-1 md:p-2 text-xs md:text-sm transition relative overflow-hidden ${
                    day.getMonth() !== currentMonth
                      ? 'text-gray-600 bg-slate-800/30'
                      : isSelected
                      ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                      : isToday
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800/50 text-white hover:bg-slate-700/50'
                  }`}
                >
                  <div className="font-semibold">{format(day, 'd')}</div>
                  <div className="text-sm md:text-base">{phase?.emoji}</div>
                  {dayEvents.length > 0 && (
                    <div className="absolute bottom-0.5 md:bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                      {dayEvents.slice(0, 3).map((event, idx) => (
                        <div
                          key={idx}
                          className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full"
                          style={{ backgroundColor: event.color }}
                        />
                      ))}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </Card>

        {/* Modal de Evento */}
        <AnimatePresence>
          {showEventModal && selectedDate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowEventModal(false)} // Click outside to close
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl max-w-md w-full p-6 border border-purple-500/30"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                    </h3>
                    <p className="text-purple-300 text-sm">
                      {getMoonPhaseForDate(selectedDate)?.emoji} {getMoonPhaseForDate(selectedDate)?.name}
                    </p>
                  </div>
                  <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowEventModal(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                </div>


                {/* Eventos do Dia */}
                <div className="mb-6 max-h-48 overflow-y-auto pr-2">
                  {getEventsForDate(selectedDate).length > 0 ? (
                    getEventsForDate(selectedDate).map(event => (
                      <div
                        key={event.id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/60 border border-slate-700/30 mb-2"
                      >
                        <div
                          className="w-4 h-4 rounded-full mt-1 flex-shrink-0"
                          style={{ backgroundColor: event.color }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-white">{event.title}</h4>
                            {event.event_time && (
                              <div className="flex items-center gap-1 text-xs text-blue-300 bg-blue-900/30 px-2 py-0.5 rounded-full">
                                <Clock className="w-3 h-3" />
                                {event.event_time}
                              </div>
                            )}
                          </div>
                          {event.description && (
                            <p className="text-sm text-gray-300">{event.description}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteEventMutation.mutate(event.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center text-sm">Nenhum evento para este dia.</p>
                  )}
                </div>

                {/* Criar Novo Evento */}
                <div className="space-y-4 bg-purple-900/20 p-4 rounded-xl border border-purple-500/20">
                  <h4 className="font-semibold text-purple-300 mb-3">Novo Evento</h4>
                  
                  <div>
                    <label className="text-sm font-semibold text-gray-300 mb-2 block">
                      Título do Evento
                    </label>
                    <Input
                      value={eventForm.title}
                      onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                      placeholder="Ex: Ritual de Lua Cheia"
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-300 mb-2 block">
                      Descrição
                    </label>
                    <Textarea
                      value={eventForm.description}
                      onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                      placeholder="Detalhes do evento..."
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-gray-500"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-300 mb-2 block">
                      Horário
                    </label>
                    <Input
                      type="time"
                      value={eventForm.time}
                      onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-gray-300 mb-2 block">
                      Cor do Evento
                    </label>
                    <div className="flex gap-2">
                      {['#A855F7', '#F59E0B', '#3B82F6', '#10B981', '#EC4899', '#8B5CF6'].map(color => (
                        <button
                          key={color}
                          onClick={() => setEventForm({ ...eventForm, color })}
                          className={`w-10 h-10 rounded-full border-2 transition ${
                            eventForm.color === color ? 'border-white scale-110' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleCreateEvent}
                    disabled={!eventForm.title.trim() || createEventMutation.isPending}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {createEventMutation.isPending ? (
                      <>
                        <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5 mr-2" />
                        Adicionar Evento
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal Modo Foco */}
      <FocusModeModal 
        isOpen={showFocusMode} 
        onClose={() => setShowFocusMode(false)} 
      />
    </div>
  );
}

// Componente de Modo Foco
function FocusModeModal({ isOpen, onClose }) {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const audioRef = React.useRef(null);

  useEffect(() => {
    let interval = null;
    if (isRunning && totalSeconds > 0) {
      interval = setInterval(() => {
        setTotalSeconds(s => {
          if (s <= 1) {
            setIsRunning(false);
            toast.success("Sessão de foco concluída! 🎉");
            if (audioRef.current) {
              audioRef.current.pause();
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, totalSeconds]);

  useEffect(() => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    setMinutes(mins);
    setSeconds(secs);
  }, [totalSeconds]);

  useEffect(() => {
    if (isRunning && audioRef.current) {
      audioRef.current.play();
    } else if (!isRunning && audioRef.current) {
      audioRef.current.pause();
    }
  }, [isRunning]);

  const handleStart = () => {
    if (totalSeconds === 0) {
      setTotalSeconds(25 * 60);
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTotalSeconds(25 * 60);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-sm"
      >
        <audio ref={audioRef} loop>
          <source src="https://cdn.pixabay.com/download/audio/2022/03/10/audio_4a463d640d.mp3" type="audio/mpeg" />
        </audio>

        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          className="relative w-full max-w-2xl"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
          >
            <X className="w-6 h-6" />
          </Button>

          <Card className="bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-blue-900/40 border-purple-500/30 p-12 text-center relative overflow-hidden">
            {/* Animação de fundo */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-purple-400/20 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -30, 0],
                    opacity: [0.2, 0.8, 0.2],
                    scale: [1, 1.5, 1],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>

            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-white mb-8">Modo Foco Total</h2>
              
              {/* Timer */}
              <div className="mb-8">
                <motion.div
                  animate={isRunning ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-8xl font-bold text-white mb-4"
                >
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </motion.div>
                <p className="text-purple-300 text-lg">
                  {isRunning ? 'Mantenha o foco...' : 'Pronto para começar?'}
                </p>
              </div>

              {/* Controles */}
              <div className="flex items-center justify-center gap-4">
                {!isRunning ? (
                  <Button
                    onClick={handleStart}
                    size="lg"
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-8"
                  >
                    <Play className="w-6 h-6 mr-2" />
                    Iniciar
                  </Button>
                ) : (
                  <Button
                    onClick={handlePause}
                    size="lg"
                    className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 px-8"
                  >
                    <Pause className="w-6 h-6 mr-2" />
                    Pausar
                  </Button>
                )}
                
                <Button
                  onClick={handleReset}
                  size="lg"
                  variant="outline"
                  className="border-purple-500/50 text-purple-300 hover:bg-purple-900/30"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Reiniciar
                </Button>
              </div>

              {/* Ajuste de tempo */}
              {!isRunning && totalSeconds === 25 * 60 && (
                <div className="mt-8 flex items-center justify-center gap-4">
                  <Button
                    onClick={() => setTotalSeconds(15 * 60)}
                    variant="outline"
                    size="sm"
                    className="border-purple-500/30 text-purple-300 hover:bg-purple-900/20"
                  >
                    15 min
                  </Button>
                  <Button
                    onClick={() => setTotalSeconds(25 * 60)}
                    variant="outline"
                    size="sm"
                    className="border-purple-500/30 text-purple-300 hover:bg-purple-900/20"
                  >
                    25 min
                  </Button>
                  <Button
                    onClick={() => setTotalSeconds(45 * 60)}
                    variant="outline"
                    size="sm"
                    className="border-purple-500/30 text-purple-300 hover:bg-purple-900/20"
                  >
                    45 min
                  </Button>
                  <Button
                    onClick={() => setTotalSeconds(60 * 60)}
                    variant="outline"
                    size="sm"
                    className="border-purple-500/30 text-purple-300 hover:bg-purple-900/20"
                  >
                    60 min
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
