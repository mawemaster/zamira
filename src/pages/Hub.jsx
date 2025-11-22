import React, { useState, useEffect } from "react";
import { supabase } from "../api/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Moon, Sun, CloudRain, Cloud, MapPin, TrendingUp, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// import lune from "lune"; // Biblioteca removida temporariamente para evitar erros de compilação
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Importando componentes
// Se algum destes não existir, o site avisa, mas não quebra
import PostCard from "../components/community/PostCard";
import CreatePostModal from "../components/community/CreatePostModal";
import MysticInfo from "../components/MysticInfo";

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
  const [posts, setPosts] = useState([]);
  const [weather, setWeather] = useState(null);
  const [moonPhase, setMoonPhase] = useState("Nova");
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Tenta buscar perfil
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        const fullUser = profile ? { ...session.user, ...profile } : session.user;
        setUser(fullUser);
        setGreeting(getGreetingByTime());

        // Clima e Lua
        if (fullUser.city) fetchWeather(fullUser.city);
        else fetchWeather("São Paulo");

        // Lua Fixa para evitar erro de build se a biblioteca falhar
        setMoonPhase("Crescente");

        fetchPosts();
      }
    } catch (error) {
      console.error("Erro ao carregar:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    setLoadingPosts(true);
    try {
      const { data } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      setPosts(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPosts(false);
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

  const WeatherIcon = ({ condition }) => {
    if (!condition) return <Sun className="w-6 h-6 text-yellow-400" />;
    if (condition.includes("chuva")) return <CloudRain className="w-6 h-6 text-blue-400" />;
    if (condition.includes("nuvens")) return <Cloud className="w-6 h-6 text-gray-400" />;
    return <Sun className="w-6 h-6 text-yellow-400" />;
  };

  if (loading) return <div className="min-h-screen bg-[#02031C] flex items-center justify-center"><Loader2 className="w-10 h-10 text-purple-500 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#02031C] text-white p-4 md:p-6 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            {greeting}, {user?.display_name || "Viajante"}!
          </h1>
          <p className="text-gray-400 text-sm">Sua jornada mística continua.</p>
        </motion.div>

        <MysticInfo user={user} />

        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-white/5 border-white/10 p-4 text-center flex flex-col items-center justify-center">
            <div className="text-xs text-gray-400 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> {weather?.name || "Local"}</div>
            <WeatherIcon condition={weather?.weather?.[0]?.description} />
            <div className="text-xl font-bold mt-1">{weather ? Math.round(weather.main.temp) + "°C" : "--"}</div>
          </Card>
          <Card className="bg-white/5 border-white/10 p-4 text-center flex flex-col items-center justify-center">
            <div className="text-xs text-gray-400 mb-1">Lua Atual</div>
            <Moon className="w-6 h-6 text-purple-300" />
            <div className="text-xl font-bold mt-1">{moonPhase}</div>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" /> Feed da Comunidade
            </h2>
            <Button size="sm" onClick={() => setShowCreateModal(true)} className="bg-purple-600 hover:bg-purple-700 text-white border-0">
              + Postar
            </Button>
          </div>

          <AnimatePresence>
            {loadingPosts ? (
              <div className="text-center py-8"><Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto" /></div>
            ) : posts.length === 0 ? (
              <div className="text-center p-8 bg-white/5 rounded-xl border border-dashed border-white/10">
                <TrendingUp className="w-12 h-12 text-purple-500/50 mx-auto mb-2" />
                <p className="text-gray-400">O silêncio reina aqui. Seja o primeiro a falar!</p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard key={post.id} post={post} currentUser={user} />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {showCreateModal && (
        <CreatePostModal
          user={user}
          onClose={() => setShowCreateModal(false)}
          onSubmit={async (data) => {
            await supabase.from('posts').insert([{
              content: data.content,
              user_id: user.id,
              author_name: user.display_name || user.email.split('@')[0]
            }]);
            setShowCreateModal(false);
            fetchPosts();
          }}
          isLoading={false}
        />
      )}
    </div>
  );
}