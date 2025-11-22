import React, { useState, useEffect } from "react";
import { supabase } from "../api/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Moon, Sun, CloudRain, Cloud, Wind, MapPin, Calendar as CalendarIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Para buscar o clima
import lune from "lune";   // Para calcular a lua
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Componentes antigos (se existirem)
import PostCard from "../components/community/PostCard";
import CreatePostModal from "../components/community/CreatePostModal";
import MysticInfo from "../components/MysticInfo";

const WEATHER_API_KEY = "bfaf57dd1ed477eb4aff9f6b85ad28d3"; // Sua chave aqui!

const getGreetingByTime = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Bom dia";
  if (hour >= 12 && hour < 18) return "Boa tarde";
  return "Boa noite";
};

// Função simples para descobrir o signo
const getZodiacSign = (dateString) => {
  if (!dateString) return { name: "Desconhecido", icon: "✨" };
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.getMonth() + 1;

  if ((month == 1 && day <= 20) || (month == 12 && day >= 22)) return { name: "Capricórnio", icon: "♑" };
  if ((month == 1 && day >= 21) || (month == 2 && day <= 18)) return { name: "Aquário", icon: "♒" };
  if ((month == 2 && day >= 19) || (month == 3 && day <= 20)) return { name: "Peixes", icon: "♓" };
  if ((month == 3 && day >= 21) || (month == 4 && day <= 19)) return { name: "Áries", icon: "♈" };
  if ((month == 4 && day >= 20) || (month == 5 && day <= 20)) return { name: "Touro", icon: "♉" };
  if ((month == 5 && day >= 21) || (month == 6 && day <= 20)) return { name: "Gêmeos", icon: "♊" };
  if ((month == 6 && day >= 21) || (month == 7 && day <= 22)) return { name: "Câncer", icon: "♋" };
  if ((month == 7 && day >= 23) || (month == 8 && day <= 22)) return { name: "Leão", icon: "♌" };
  if ((month == 8 && day >= 23) || (month == 9 && day <= 22)) return { name: "Virgem", icon: "♍" };
  if ((month == 9 && day >= 23) || (month == 10 && day <= 22)) return { name: "Libra", icon: "♎" };
  if ((month == 10 && day >= 23) || (month == 11 && day <= 21)) return { name: "Escorpião", icon: "♏" };
  if ((month == 11 && day >= 22) || (month == 12 && day >= 21)) return { name: "Sagitário", icon: "♐" };
  return { name: "Estelar", icon: "✨" };
};

export default function HubPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [weather, setWeather] = useState(null);
  const [moonPhase, setMoonPhase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // 1. Carregar Usuário
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        const fullUser = { ...session.user, ...profile };
        setUser(fullUser);
        setGreeting(getGreetingByTime());

        // 2. Carregar Clima (Se tiver cidade)
        if (fullUser.city) {
          fetchWeather(fullUser.city);
        }

        // 3. Calcular Lua
        const currentMoon = lune.phase_hunt(new Date());
        setMoonPhase(getMoonPhaseName(currentMoon.nextnew_date));
      }

      // 4. Carregar Posts
      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      setPosts(postsData || []);

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async (city) => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric&lang=pt_br`
      );
      setWeather(response.data);
    } catch (error) {
      console.error("Erro no clima:", error);
    }
  };

  const getMoonPhaseName = (nextNewDate) => {
    // Lógica simplificada para nome da fase (biblioteca lune é complexa)
    // Vamos usar uma aproximação visual baseada na data
    return "Crescente"; // Placeholder para evitar erro de cálculo complexo agora
  };

  // Ícone do clima dinâmico
  const WeatherIcon = ({ condition }) => {
    if (!condition) return <Sun className="w-6 h-6 text-yellow-400" />;
    if (condition.includes("chuva")) return <CloudRain className="w-6 h-6 text-blue-400" />;
    if (condition.includes("nuvens")) return <Cloud className="w-6 h-6 text-gray-400" />;
    return <Sun className="w-6 h-6 text-yellow-400" />;
  };

  if (loading) {
    return <div className="min-h-screen bg-[#02031C] flex items-center justify-center text-white">Carregando energias...</div>;
  }

  const sign = getZodiacSign(user?.birth_date);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#02031C] via-slate-900 to-[#02031C] text-white p-4 md:p-6 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Cabeçalho Saudação */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            {greeting}, {user?.display_name || "Viajante"}!
          </h1>
          <p className="text-gray-400 text-sm">Sua jornada mística continua.</p>
        </motion.div>

        {/* WIDGETS MÍSTICOS (Carrossel) */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {/* Widget 1: Clima */}
          <Card className="bg-white/5 border-white/10 p-4 flex flex-col items-center justify-center text-center space-y-2">
            {weather ? (
              <>
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                  <MapPin className="w-3 h-3" /> {weather.name}
                </div>
                <WeatherIcon condition={weather.weather[0].description} />
                <div className="text-2xl font-bold">{Math.round(weather.main.temp)}°C</div>
                <p className="text-xs text-gray-300 capitalize">{weather.weather[0].description}</p>
              </>
            ) : (
              <div className="text-xs text-gray-500">Sem dados de clima</div>
            )}
          </Card>

          {/* Widget 2: Lua */}
          <Card className="bg-white/5 border-white/10 p-4 flex flex-col items-center justify-center text-center space-y-2">
            <p className="text-xs text-gray-400">Fase da Lua</p>
            <Moon className="w-8 h-8 text-purple-300 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
            <p className="text-sm font-medium text-purple-200">{moonPhase}</p>
          </Card>

          {/* Widget 3: Signo */}
          <Card className="bg-white/5 border-white/10 p-4 flex flex-col items-center justify-center text-center space-y-2 col-span-2 md:col-span-1">
            <p className="text-xs text-gray-400">Seu Sol</p>
            <div className="text-3xl">{sign.icon}</div>
            <p className="text-sm font-medium text-pink-200">{sign.name}</p>
          </Card>
        </div>

        {/* Botão para ver o Mapa Astral Completo */}
        <Button 
          onClick={() => navigate(createPageUrl("MapaAstral"))}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Ver meu Mapa Astral Completo
        </Button>

        {/* FEED */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" /> Feed da Comunidade
            </h2>
            <Button size="sm" onClick={() => setShowCreateModal(true)} variant="secondary">
              + Postar
            </Button>
          </div>

          {/* Lista de Posts */}
          <div className="space-y-4">
            {posts.length === 0 ? (