import React, { useState, useEffect } from "react";
import { supabase } from "../api/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Moon, Sun, CloudRain, Cloud, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import lune from "lune";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// --- DESATIVANDO TEMPORARIAMENTE PARA TESTE ---
// import PostCard from "../components/community/PostCard";
// import CreatePostModal from "../components/community/CreatePostModal";
// import MysticInfo from "../components/MysticInfo"; 
// -----------------------------------------------

const WEATHER_API_KEY = "bfaf57dd1ed477eb4aff9f6b85ad28d3";

const getGreetingByTime = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Bom dia";
  if (hour >= 12 && hour < 18) return "Boa tarde";
  return "Boa noite";
};

export default function HubPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [weather, setWeather] = useState(null);
  const [moonPhase, setMoonPhase] = useState("");
  const [loading, setLoading] = useState(true);
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
        // Tenta buscar perfil, se não tiver, usa dados da sessão
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        const fullUser = profile ? { ...session.user, ...profile } : session.user;
        setUser(fullUser);
        setGreeting(getGreetingByTime());

        // 2. Carregar Clima
        if (fullUser.city) {
          fetchWeather(fullUser.city);
        } else {
          fetchWeather("São Paulo"); // Padrão se não tiver cidade
        }

        // 3. Calcular Lua
        const currentMoon = lune.phase_hunt(new Date());
        setMoonPhase("Nova"); // Simplificado para teste
      }
    } catch (error) {
      console.error("Erro ao carregar:", error);
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
      console.error("Erro Clima:", error);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#02031C] text-white flex items-center justify-center">Carregando...</div>;

  return (
    <div className="min-h-screen bg-[#02031C] text-white p-4 md:p-6 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Saudação */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            {greeting}, {user?.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-400 text-sm">O sistema está vivo.</p>
        </motion.div>

        {/* Widgets de Teste */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-white/5 border-white/10 p-4 text-center">
            <h3 className="text-gray-400 text-xs">Clima Atual</h3>
            <div className="text-xl font-bold">{weather ? Math.round(weather.main.temp) + "°C" : "--"}</div>
          </Card>
          <Card className="bg-white/5 border-white/10 p-4 text-center">
            <h3 className="text-gray-400 text-xs">Lua</h3>
            <div className="text-xl font-bold">{moonPhase}</div>
          </Card>
        </div>

        {/* Aviso de Área Limpa */}
        <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
          <p className="text-green-400 text-sm">
            ✅ <strong>Hub Carregado!</strong> <br />
            Agora podemos reativar o <code>MysticInfo</code> e o <code>Feed</code> um por um.
          </p>
        </div>

      </div>
    </div>
  );
}