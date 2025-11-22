
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Cloud, Sun, CloudRain, Wind, Droplets, MapPin, Sparkles, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const periodBackgrounds = {
  manha: {
    gradient: "from-orange-200 via-yellow-100 to-blue-200",
    icon: "🌅",
    label: "Manhã"
  },
  tarde: {
    gradient: "from-blue-300 via-cyan-200 to-blue-400",
    icon: "☀️",
    label: "Tarde"
  },
  noite: {
    gradient: "from-indigo-900 via-purple-900 to-slate-900",
    icon: "🌙",
    label: "Noite"
  }
};

const weatherIcons = {
  'clear': '☀️',
  'clouds': '☁️',
  'rain': '🌧️',
  'drizzle': '🌦️',
  'thunderstorm': '⛈️',
  'snow': '❄️',
  'mist': '🌫️',
  'fog': '🌫️',
  'haze': '🌫️'
};

export default function WeatherWeekModal({ isOpen, onClose, user }) {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      loadWeatherWeek();
    }
  }, [isOpen, user]);

  const loadWeatherWeek = async () => {
    setLoading(true);
    setError(null);

    try {
      // Pegar localização do usuário
      const location = user.detected_location || { city: "São Paulo", country: "Brasil" };
      
      // Se não tiver coordenadas, buscar por cidade
      let latitude = user.detected_location?.latitude;
      let longitude = user.detected_location?.longitude;

      if (!latitude || !longitude) {
        // Usar API de geocoding para converter cidade em coordenadas
        const geoResponse = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${location.city},${location.state || location.country}&limit=1&appid=${await getOpenWeatherKey()}`
        );
        const geoData = await geoResponse.json();
        
        if (geoData && geoData.length > 0) {
          latitude = geoData[0].lat;
          longitude = geoData[0].lon;
        } else {
          // Fallback para São Paulo
          latitude = -23.5505;
          longitude = -46.6333;
        }
      }

      // Buscar dados do clima
      const response = await base44.functions.invoke('getWeather', {
        latitude,
        longitude,
        city: location.city
      });

      if (response.data.success) {
        setWeatherData(response.data);
      } else {
        setError(response.data.error || 'Erro ao carregar clima');
      }
    } catch (err) {
      console.error('Erro ao carregar clima:', err);
      setError('Não foi possível carregar os dados do clima');
    } finally {
      setLoading(false);
    }
  };

  const getOpenWeatherKey = async () => {
    // Placeholder - a chave já está na função backend
    return "";
  };

  if (!isOpen) return null;

  const periodInfo = weatherData ? periodBackgrounds[weatherData.period] : periodBackgrounds.noite;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <Card className={`bg-gradient-to-br ${periodInfo.gradient} border-none overflow-hidden relative`}>
              {/* Header com clima atual */}
              <div className="p-6 md:p-8 relative">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 hover:bg-black/10 rounded-full transition"
                >
                  <X className="w-5 h-5 text-slate-800" />
                </button>

                {loading ? (
                  <div className="text-center py-12">
                    <Sparkles className="w-12 h-12 text-purple-600 animate-pulse mx-auto mb-4" />
                    <p className="text-slate-700 font-semibold">Consultando os astros sobre o clima...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                    <p className="text-slate-800 font-semibold mb-2">Erro ao carregar clima</p>
                    <p className="text-slate-600 text-sm">{error}</p>
                  </div>
                ) : weatherData ? (
                  <>
                    {/* Clima Atual */}
                    <div className="flex items-start gap-3 mb-6">
                      <Cloud className="w-6 h-6 text-slate-700" />
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-slate-900 mb-1">
                          Clima da Semana
                        </h2>
                        <p className="text-slate-700 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {weatherData.current.city}, {weatherData.current.country}
                        </p>
                      </div>
                    </div>

                    {/* Card Clima AGORA */}
                    <Card className="bg-white/80 backdrop-blur-sm border-white/40 p-6 mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm text-slate-600 mb-1">
                            {periodInfo.icon} {periodInfo.label} • AGORA
                          </p>
                          <h3 className="text-5xl font-bold text-slate-900">
                            {weatherData.current.temp}°C
                          </h3>
                          <p className="text-slate-700 text-sm mt-1 capitalize">
                            {weatherData.current.description}
                          </p>
                        </div>
                        <div className="text-6xl">
                          {weatherIcons[weatherData.current.main.toLowerCase()] || '☁️'}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                        <div>
                          <p className="text-xs text-slate-600">Sensação</p>
                          <p className="text-lg font-bold text-slate-900">{weatherData.current.feels_like}°C</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600">Umidade</p>
                          <p className="text-lg font-bold text-slate-900">{weatherData.current.humidity}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600">Vento</p>
                          <p className="text-lg font-bold text-slate-900">{weatherData.current.wind_speed} m/s</p>
                        </div>
                      </div>

                      {/* Dica Personalizada */}
                      <div className="mt-4 p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border border-purple-200">
                        <p className="text-sm text-purple-900 font-medium">
                          {weatherData.tip}
                        </p>
                      </div>
                    </Card>

                    {/* Previsão da Semana */}
                    <h3 className="text-lg font-bold text-slate-900 mb-4">
                      Próximos 7 Dias
                    </h3>

                    <div className="space-y-3">
                      {weatherData.forecast.map((day, index) => {
                        const dayIcon = weatherIcons[day.main.toLowerCase()] || '☁️';
                        
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Card className="bg-white/70 backdrop-blur-sm border-white/40 p-4 hover:bg-white/90 transition">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1">
                                  <div className="text-center min-w-[60px]">
                                    <p className="text-xs text-slate-600 mb-1">
                                      {format(day.date, 'EEE', { locale: ptBR })}
                                    </p>
                                    <p className="font-bold text-slate-900">
                                      {format(day.date, 'd')}
                                    </p>
                                  </div>

                                  <div className="text-3xl">
                                    {dayIcon}
                                  </div>

                                  <div className="flex-1">
                                    <p className="font-semibold text-slate-900 capitalize text-sm">
                                      {day.description}
                                    </p>
                                    <div className="flex items-center gap-3 text-xs text-slate-600 mt-1">
                                      <span className="flex items-center gap-1">
                                        <Droplets className="w-3 h-3" />
                                        {day.humidity}%
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <p className="text-xs text-slate-600">Máx</p>
                                  <p className="text-2xl font-bold text-red-600">{Math.round(day.temp_max)}°</p>
                                  <p className="text-xs text-slate-600 mt-1">Mín</p>
                                  <p className="text-lg font-bold text-blue-600">{Math.round(day.temp_min)}°</p>
                                </div>
                              </div>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  </>
                ) : null}
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
