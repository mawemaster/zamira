
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Moon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, addDays, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";

const moonEmojis = {
  "Nova": "🌑",
  "Crescente": "🌒",
  "Quarto Crescente": "🌓",
  "Gibosa Crescente": "🌔",
  "Cheia": "🌕",
  "Gibosa Minguante": "🌖",
  "Quarto Minguante": "🌗",
  "Minguante": "🌘"
};

export default function MoonPhasesModal({ isOpen, onClose }) {
  const [weekData, setWeekData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadWeekMoonPhases();
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Added this line
    }
  }, [isOpen]);

  const getMoonPhase = (date) => {
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    const day = date.getDate();
    
    if (month < 3) {
      year--;
      month += 12;
    }
    
    ++month;
    const c = 365.25 * year;
    const e = 30.6 * month;
    let jd = c + e + day - 694039.09;
    jd /= 29.5305882;
    const b = parseInt(jd);
    jd -= b;
    const phase = Math.round(jd * 8);
    
    const phases = [
      "Nova", "Crescente", "Quarto Crescente", "Gibosa Crescente",
      "Cheia", "Gibosa Minguante", "Quarto Minguante", "Minguante"
    ];
    
    return phases[phase >= 8 ? 0 : phase];
  };

  const loadWeekMoonPhases = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const sunday = startOfWeek(today, { weekStartsOn: 0 });
      
      const weekDays = Array.from({ length: 7 }, (_, i) => {
        const date = addDays(sunday, i);
        const phase = getMoonPhase(date);
        
        return {
          date,
          dayName: format(date, 'EEEE', { locale: ptBR }),
          dayShort: format(date, 'EEE', { locale: ptBR }),
          dayNumber: format(date, 'd', { locale: ptBR }),
          phase,
          emoji: moonEmojis[phase] || "🌑",
          isToday: format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
        };
      });

      // Buscar informações místicas da IA
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Como um astrólogo místico brasileiro, descreva brevemente (1-2 linhas cada) a energia de cada fase da lua durante esta semana. Escreva em português do Brasil de forma poética e inspiradora:
        
        ${weekDays.map(day => `- ${day.dayName}: Lua ${day.phase}`).join('\n')}
        
        Para cada dia, forneça uma descrição curta e poética da energia dessa fase lunar.
        Formate como JSON array com objetos {day: "nome do dia em português", energy: "descrição em português"}.`,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            days: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  day: { type: "string" },
                  energy: { type: "string" }
                }
              }
            }
          }
        }
      });

      const energies = response?.days || [];
      
      weekDays.forEach((day, index) => {
        const energyData = energies.find(e => e.day.toLowerCase().includes(day.dayName.toLowerCase()));
        day.energy = energyData?.energy || "Energia lunar em fluxo constante.";
      });

      setWeekData(weekDays);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao carregar fases da lua:", error);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 md:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <Card className="bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 border-purple-500/30 p-4 md:p-6">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center gap-2 md:gap-3">
                <Moon className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
                <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-white">Fases da Lua - Esta Semana</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-gray-400 hover:text-white h-8 w-8 md:h-10 md:w-10"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </Button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 md:py-12">
                <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-purple-500 animate-spin mb-3 md:mb-4" />
                <p className="text-sm md:text-base text-gray-400">Consultando os astros...</p>
              </div>
            ) : (
              <div className="space-y-2 md:space-y-3">
                {weekData.map((day, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`p-3 md:p-4 ${
                      day.isToday 
                        ? 'bg-purple-900/40 border-purple-500/50' 
                        : 'bg-slate-800/50 border-slate-700/30'
                    }`}>
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="text-center min-w-[50px] md:min-w-[60px]">
                          <p className="text-2xl md:text-3xl mb-1">{day.emoji}</p>
                          <p className="text-[10px] md:text-xs text-gray-400 capitalize">{day.dayShort}</p>
                          <p className="text-xs md:text-sm font-bold text-white">{day.dayNumber}</p>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm md:text-base lg:text-lg font-bold text-purple-300 capitalize">
                              {day.dayName}
                            </h3>
                            {day.isToday && (
                              <span className="text-[10px] md:text-xs bg-purple-600 text-white px-1.5 md:px-2 py-0.5 rounded-full">
                                Hoje
                              </span>
                            )}
                          </div>
                          <p className="text-xs md:text-sm font-semibold text-white mb-1">Lua {day.phase}</p>
                          <p className="text-[10px] md:text-xs text-gray-300 leading-relaxed">{day.energy}</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
