
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { base44 } from "@/api/base44Client";
import { Moon, Sun, Cloud, Sparkles, Sunset, Sunrise, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

import MoonPhasesModal from "./modals/MoonPhasesModal";
import WeatherWeekModal from "./modals/WeatherWeekModal";
import HoroscopeModal from "./modals/HoroscopeModal";

// Cache de clima (2 horas)
const WEATHER_CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 horas em milissegundos

const getMoonPhase = (date = new Date()) => {
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  const day = date.getDate();
  
  let c, e, jd, b;
  
  if (month < 3) {
    year--;
    month += 12;
  }
  
  ++month;
  c = 365.25 * year;
  e = 30.6 * month;
  jd = c + e + day - 694039.09;
  jd /= 29.5305882;
  b = parseInt(jd);
  jd -= b;
  b = Math.round(jd * 8);
  
  if (b >= 8) b = 0;
  
  const phases = [
    { name: "Lua Nova", emoji: "🌑", description: "Novos começos" },
    { name: "Lua Crescente", emoji: "🌒", description: "Crescimento" },
    { name: "Quarto Crescente", emoji: "🌓", description: "Ação" },
    { name: "Lua Gibosa Crescente", emoji: "🌔", description: "Preparação" },
    { name: "Lua Cheia", emoji: "🌕", description: "Plenitude" },
    { name: "Lua Gibosa Minguante", emoji: "🌖", description: "Gratidão" },
    { name: "Quarto Minguante", emoji: "🌗", description: "Liberação" },
    { name: "Lua Minguante", emoji: "🌘", description: "Renovação" }
  ];
  
  return phases[b];
};

const getZodiacFromBirthDate = (birthDate) => {
  if (!birthDate) return null;
  
  const date = new Date(birthDate);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  const signs = [
    { name: "Capricórnio", emoji: "♑", start: [12, 22], end: [1, 19] },
    { name: "Aquário", emoji: "♒", start: [1, 20], end: [2, 18] },
    { name: "Peixes", emoji: "♓", start: [2, 19], end: [3, 20] },
    { name: "Áries", emoji: "♈", start: [3, 21], end: [4, 19] },
    { name: "Touro", emoji: "♉", start: [4, 20], end: [5, 20] },
    { name: "Gêmeos", emoji: "♊", start: [5, 21], end: [6, 20] },
    { name: "Câncer", emoji: "♋", start: [6, 21], end: [7, 22] },
    { name: "Leão", emoji: "♌", start: [7, 23], end: [8, 22] },
    { name: "Virgem", emoji: "♍", start: [8, 23], end: [9, 22] },
    { name: "Libra", emoji: "♎", start: [9, 23], end: [10, 22] },
    { name: "Escorpião", emoji: "♏", start: [10, 23], end: [11, 21] },
    { name: "Sagitário", emoji: "♐", start: [11, 22], end: [12, 21]}
  ];
  
  for (const sign of signs) {
    const [startMonth, startDay] = sign.start;
    const [endMonth, endDay] = sign.end;
    
    if (
      (month === startMonth && day >= startDay) ||
      (month === endMonth && day <= endDay)
    ) {
      return sign;
    }
  }
  
  return signs[0];
};

const getPeriodIcon = (period, weatherMain) => {
  if (period === 'manha') return { icon: '🌅', component: Sunrise, color: '#F59E0B' };
  if (period === 'tarde') {
    if (weatherMain?.toLowerCase().includes('rain')) return { icon: '🌧️', component: Cloud, color: '#3B82F6' };
    if (weatherMain?.toLowerCase().includes('cloud')) return { icon: '⛅', component: Cloud, color: '#6B7280' };
    return { icon: '☀️', component: Sun, color: '#EAB308' };
  }
  if (period === 'noite') return { icon: '🌙', component: Moon, color: '#8B5CF6' };
  return { icon: '☁️', component: Cloud, color: '#6B7280' };
};

// Sistema de cache para clima
const getWeatherCache = () => {
  const cached = localStorage.getItem('weather_cache');
  if (!cached) return null;
  
  try {
    const data = JSON.parse(cached);
    const now = Date.now();
    
    // Verificar se cache ainda é válido (2 horas)
    if (now - data.timestamp < WEATHER_CACHE_DURATION) {
      return data;
    }
  } catch (error) {
    console.error('Erro ao ler cache de clima:', error);
  }
  
  return null;
};

const setWeatherCache = (weatherData, weatherTip, dayPeriod) => {
  try {
    const cacheData = {
      weatherData,
      weatherTip,
      dayPeriod,
      timestamp: Date.now()
    };
    localStorage.setItem('weather_cache', JSON.stringify(cacheData));
  } catch (error) {
    console.error('Erro ao salvar cache de clima:', error);
  }
};

export default function MysticInfo({ user }) {
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherTip, setWeatherTip] = useState(null);
  const [dayPeriod, setDayPeriod] = useState(null);
  const [weatherError, setWeatherError] = useState(null);

  const [showMoonModal, setShowMoonModal] = useState(false);
  const [showWeatherModal, setShowWeatherModal] = useState(false);
  const [showHoroscopeModal, setShowHoroscopeModal] = useState(false);
  
  const moonPhase = getMoonPhase();
  
  const userZodiacSign = user?.zodiac_sign || (user?.birth_date ? getZodiacFromBirthDate(user.birth_date)?.name : null);
  const zodiacData = userZodiacSign ? 
    { name: userZodiacSign, emoji: getZodiacFromBirthDate(user.birth_date)?.emoji || "♏" } :
    { name: "Seu Signo", emoji: "✨" };
  
  const loadWeather = async (forceRefresh = false) => {
    try {
      // VALIDAÇÃO CRÍTICA
      if (!user?.id) {
        console.error("Não é possível carregar clima sem usuário");
        setWeatherLoading(false);
        return;
      }
      
      // Tentar usar cache primeiro
      if (!forceRefresh) {
        const cached = getWeatherCache();
        if (cached) {
          console.log('📦 Usando clima em cache (válido por mais', Math.round((WEATHER_CACHE_DURATION - (Date.now() - cached.timestamp)) / 60000), 'minutos)');
          setWeatherData(cached.weatherData);
          setWeatherTip(cached.weatherTip);
          setDayPeriod(cached.dayPeriod);
          setWeatherLoading(false);
          setWeatherError(null);
          return;
        }
      }

      setWeatherLoading(true);
      setWeatherError(null);

      console.log('🌤️ Buscando clima atualizado...');

      let latitude = user?.detected_location?.latitude;
      let longitude = user?.detected_location?.longitude;
      const city = user?.detected_location?.city || user?.city || "São Paulo";

      if (!latitude || !longitude) {
        latitude = -23.5505;
        longitude = -46.6333;
      }

      const response = await base44.functions.invoke('getWeather', {
        latitude,
        longitude,
        city: city
      });

      if (response.data && response.data.success) {
        console.log('✅ Clima carregado e salvo em cache!');
        setWeatherData(response.data.current);
        setWeatherTip(response.data.tip);
        setDayPeriod(response.data.period);
        setWeatherError(null);
        
        // Salvar em cache
        setWeatherCache(response.data.current, response.data.tip, response.data.period);
      } else {
        console.error('❌ Resposta sem sucesso:', response.data);
        setWeatherError(response.data?.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error("❌ Erro ao carregar clima:", error);
      setWeatherError(error.message);
    } finally {
      setWeatherLoading(false);
    }
  };
  
  useEffect(() => {
    if (user?.id) {
      loadWeather();
      
      // Atualizar clima a cada 2 horas
      const interval = setInterval(() => {
        console.log('🔄 Atualizando clima (após 2 horas)...');
        loadWeather(true);
      }, WEATHER_CACHE_DURATION);
      
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  const periodIconData = getPeriodIcon(dayPeriod, weatherData?.main);
  
  // VALIDAÇÃO CRÍTICA
  if (!user?.id) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-4 md:mb-6"
      >
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          {/* Fase da Lua - Clicável */}
          <motion.button
            onClick={() => setShowMoonModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="block w-full"
          >
            <Card className="bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 border-purple-500/30 p-3 md:p-4 hover:border-purple-500/50 transition cursor-pointer h-full">
              <div className="flex flex-col items-center justify-center text-center h-full min-h-[120px] md:min-h-[140px]">
                <span className="text-3xl md:text-4xl lg:text-5xl mb-2">{moonPhase.emoji}</span>
                <p className="text-[10px] md:text-xs lg:text-sm font-semibold text-purple-300 mb-0.5 md:mb-1 leading-tight px-1">
                  {moonPhase.name}
                </p>
                <p className="text-[9px] md:text-[10px] lg:text-xs text-gray-400">
                  Lua
                </p>
              </div>
            </Card>
          </motion.button>
          
          {/* Temperatura - Clicável com ícone dinâmico */}
          <motion.button
            onClick={() => setShowWeatherModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="block w-full"
          >
            <Card className="bg-gradient-to-br from-slate-900 via-blue-900/30 to-slate-900 border-blue-500/30 p-3 md:p-4 hover:border-blue-500/50 transition cursor-pointer h-full">
              <div className="flex flex-col items-center justify-center text-center h-full min-h-[120px] md:min-h-[140px]">
                {weatherLoading ? (
                  <>
                    <div className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full bg-gray-700 animate-pulse mb-2" />
                    <div className="w-12 h-3 md:w-16 md:h-4 bg-gray-700 rounded animate-pulse mb-1" />
                    <div className="w-10 h-2 md:w-12 md:h-3 bg-gray-700 rounded animate-pulse" />
                  </>
                ) : weatherError ? (
                  <>
                    <AlertCircle className="w-8 h-8 md:w-10 md:h-10 text-red-400 mb-2" />
                    <p className="text-[9px] md:text-[10px] text-red-400">Erro ao carregar</p>
                  </>
                ) : weatherData && periodIconData ? (
                  <>
                    <span className="text-3xl md:text-4xl lg:text-5xl mb-2">{periodIconData.icon}</span>
                    <p className="text-lg md:text-xl lg:text-2xl font-bold mb-0.5 md:mb-1" style={{ color: periodIconData.color }}>
                      {weatherData.temp}°C
                    </p>
                    <p className="text-[9px] md:text-[10px] lg:text-xs text-gray-400 leading-tight px-1">
                      {weatherData.city}
                    </p>
                  </>
                ) : (
                  <>
                    <span className="text-3xl md:text-4xl lg:text-5xl mb-2">☁️</span>
                    <p className="text-[10px] md:text-xs text-gray-400">Carregando...</p>
                  </>
                )}
              </div>
            </Card>
          </motion.button>
          
          {/* Horóscopo - Clicável */}
          <motion.button
            onClick={() => setShowHoroscopeModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="block w-full"
          >
            <Card className="bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 border-purple-500/30 p-3 md:p-4 hover:border-purple-500/50 transition cursor-pointer h-full">
              <div className="flex flex-col items-center justify-center text-center h-full min-h-[120px] md:min-h-[140px]">
                <span className="text-3xl md:text-4xl lg:text-5xl mb-2">{zodiacData.emoji}</span>
                <p className="text-[10px] md:text-xs lg:text-sm font-semibold text-purple-300 mb-0.5 md:mb-1 leading-tight px-1">
                  {zodiacData.name}
                </p>
                <p className="text-[9px] md:text-[10px] lg:text-xs text-gray-400">
                  Horóscopo
                </p>
              </div>
            </Card>
          </motion.button>
        </div>

        {/* DICA DE CLIMA */}
        {weatherTip && !weatherError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-3 md:mt-4"
          >
            <Card className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border-blue-500/30 p-3 md:p-4">
              <p className="text-xs md:text-sm text-blue-200 text-center font-medium leading-relaxed">
                {weatherTip}
              </p>
            </Card>
          </motion.div>
        )}
      </motion.div>

      <MoonPhasesModal 
        isOpen={showMoonModal} 
        onClose={() => setShowMoonModal(false)} 
      />
      
      <WeatherWeekModal 
        isOpen={showWeatherModal} 
        onClose={() => setShowWeatherModal(false)}
        user={user}
      />
      
      <HoroscopeModal 
        isOpen={showHoroscopeModal} 
        onClose={() => setShowHoroscopeModal(false)}
        user={user}
        currentSign={userZodiacSign}
      />
    </>
  );
}
