
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, TrendingUp, Zap, Shield, Heart, Star, 
  BookOpen, Award, Target, ChevronRight, Crown, Flame
} from "lucide-react";

const ARCHETYPES = {
  bruxa_natural: {
    name: "Bruxa Natural",
    color: "#9333EA",
    gradient: "from-purple-600 to-purple-800",
    icon: "🌿",
    description: "Conectada profundamente com a natureza e seus ciclos, a Bruxa Natural comanda os elementos e as energias da Terra.",
    traits: [
      "Conexão profunda com a natureza",
      "Domínio sobre ervas e cristais",
      "Sintonia com os ciclos lunares",
      "Sabedoria ancestral"
    ],
    bonuses: [
      { icon: TrendingUp, label: "XP em rituais lunares", value: "+15%" },
      { icon: Heart, label: "Cura e proteção", value: "+20%" },
      { icon: Sparkles, label: "Magia natural", value: "+10%" }
    ],
    path: "Explore a sabedoria ancestral das plantas, cristais e energias naturais. Aprofunde sua conexão com a Lua e os ciclos da natureza.",
    quests: ["Realizar 10 rituais lunares", "Coletar 20 cristais místicos", "Meditar sob a lua cheia"]
  },
  sabio: {
    name: "Sábio",
    color: "#F59E0B",
    gradient: "from-amber-600 to-orange-800",
    icon: "📚",
    description: "Guardião do conhecimento místico, o Sábio busca a verdade através do estudo, meditação e contemplação profunda.",
    traits: [
      "Busca incessante por conhecimento",
      "Mestre em filosofia mística",
      "Sabedoria em Tarot e oráculos",
      "Mentor natural"
    ],
    bonuses: [
      { icon: BookOpen, label: "XP em estudos místicos", value: "+20%" },
      { icon: Star, label: "Precisão em leituras", value: "+25%" },
      { icon: Crown, label: "Reputação na Arena", value: "+15%" }
    ],
    path: "Desvende os mistérios do Tarot, da Astrologia e das filosofias místicas. Compartilhe seu conhecimento e torne-se um mestre.",
    quests: ["Vencer 15 duelos na Arena", "Completar 30 leituras de Tarot", "Ensinar 5 viajantes"]
  },
  guardiao_astral: {
    name: "Guardião Astral",
    color: "#3B82F6",
    gradient: "from-blue-600 to-cyan-800",
    icon: "⭐",
    description: "Protetor cósmico que viaja entre dimensões, o Guardião Astral domina as energias astrais e celestiais.",
    traits: [
      "Proteção contra energias negativas",
      "Viagem astral avançada",
      "Conexão com guias espirituais",
      "Mestre em astrologia"
    ],
    bonuses: [
      { icon: Shield, label: "Proteção espiritual", value: "+30%" },
      { icon: Sparkles, label: "Intuição astral", value: "+20%" },
      { icon: Zap, label: "Energia cósmica", value: "+15%" }
    ],
    path: "Domine a arte da proteção espiritual e explore os planos astrais. Conecte-se com seus guias e proteja outros viajantes.",
    quests: ["Proteger 10 viajantes", "Completar 20 meditações astrais", "Estudar todos os planetas"]
  },
  xama: {
    name: "Xamã",
    color: "#10B981",
    gradient: "from-green-600 to-emerald-800",
    icon: "🦅",
    description: "Ponte entre mundos, o Xamã comunica-se com espíritos ancestrais e cura através de rituais sagrados.",
    traits: [
      "Comunicação com espíritos",
      "Rituais de cura profunda",
      "Jornadas xamânicas",
      "Sabedoria tribal"
    ],
    bonuses: [
      { icon: Heart, label: "Cura espiritual", value: "+25%" },
      { icon: Flame, label: "Rituais sagrados", value: "+20%" },
      { icon: Target, label: "Visões proféticas", value: "+15%" }
    ],
    path: "Aprenda rituais ancestrais e conecte-se com o mundo espiritual. Torne-se um curador e guia para sua comunidade.",
    quests: ["Realizar 15 rituais de cura", "Conversar com 10 espíritos", "Guiar 5 jornadas xamânicas"]
  },
  navegador_cosmico: {
    name: "Navegador Cósmico",
    color: "#8B5CF6",
    gradient: "from-violet-600 to-purple-800",
    icon: "🌌",
    description: "Explorador interdimensional que navega pelos mistérios do cosmos, descobrindo verdades universais ocultas.",
    traits: [
      "Exploração de realidades alternativas",
      "Domínio da sincronicidade",
      "Visão multidimensional",
      "Conexão com o universo"
    ],
    bonuses: [
      { icon: Sparkles, label: "Sincronicidades", value: "+30%" },
      { icon: Star, label: "Descobertas cósmicas", value: "+20%" },
      { icon: Zap, label: "Energia universal", value: "+15%" }
    ],
    path: "Desbrave os mistérios do cosmos e descubra conexões ocultas. Torne-se um mestre das sincronicidades.",
    quests: ["Descobrir 20 sincronicidades", "Explorar 10 portais", "Meditar no cosmos 15 vezes"]
  },
  alquimista: {
    name: "Alquimista",
    color: "#6366F1",
    gradient: "from-indigo-600 to-purple-800",
    icon: "⚗️",
    description: "Transformador místico que domina a arte da alquimia espiritual, transmutando energias e materiais.",
    traits: [
      "Transmutação de energias",
      "Criação de elixires místicos",
      "Domínio da química sagrada",
      "Transformação pessoal"
    ],
    bonuses: [
      { icon: Flame, label: "Criação de poções", value: "+25%" },
      { icon: Award, label: "Transmutação", value: "+20%" },
      { icon: TrendingUp, label: "Evolução espiritual", value: "+15%" }
    ],
    path: "Domine a arte sagrada da alquimia e aprenda a transmutar energias. Crie poções e elixires poderosos.",
    quests: ["Criar 20 poções místicas", "Transmutar 15 energias negativas", "Completar o Grande Trabalho"]
  }
};

export default function ArquetipoPage() {
  const [user, setUser] = useState(null);
  const [selectedArchetype, setSelectedArchetype] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      if (currentUser.archetype && currentUser.archetype !== 'none') {
        setSelectedArchetype(currentUser.archetype);
      }
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Sparkles className="w-12 h-12 text-purple-500 animate-pulse" />
      </div>
    );
  }

  const currentArchetype = user.archetype && user.archetype !== 'none' 
    ? ARCHETYPES[user.archetype] 
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f1e] via-[#1a1a2e] to-[#0f0f1e] pb-24">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          {currentArchetype ? (
            <>
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 mb-6 text-5xl">
                {currentArchetype.icon}
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4">
                {currentArchetype.name}
              </h1>
              
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                {currentArchetype.description}
              </p>
            </>
          ) : (
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 mb-6 text-5xl">
                {"✨"}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4">
                🌟 Descobrindo seu Arquétipo
              </h1>
              <p className="text-white text-sm md:text-base max-w-2xl mx-auto">
                Responda às perguntas para descobrir seu arquétipo místico
              </p>
            </div>
          )}
        </motion.div>

        {currentArchetype ? (
          <>
            {/* Características */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-purple-900/30 p-6">
                <h2 className="text-2xl font-bold text-purple-300 mb-4 flex items-center gap-2">
                  <Sparkles className="w-6 h-6" />
                  Características do Arquétipo
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentArchetype.traits.map((trait, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-lg"
                    >
                      <ChevronRight className="w-5 h-5 text-purple-400" />
                      <p className="text-gray-300">{trait}</p>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Bônus */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-purple-900/30 p-6">
                <h2 className="text-2xl font-bold text-purple-300 mb-4 flex items-center gap-2">
                  <Award className="w-6 h-6" />
                  Bônus e Vantagens
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {currentArchetype.bonuses.map((bonus, index) => {
                    const Icon = bonus.icon;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className={`bg-gradient-to-br ${currentArchetype.gradient} p-4 rounded-xl`}
                      >
                        <Icon className="w-8 h-8 text-white mb-2" />
                        <p className="text-white font-semibold mb-1">{bonus.label}</p>
                        <p className="text-2xl font-bold text-white">{bonus.value}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>

            {/* Caminho Espiritual */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8"
            >
              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-purple-900/30 p-6">
                <h2 className="text-2xl font-bold text-purple-300 mb-4 flex items-center gap-2">
                  <Target className="w-6 h-6" />
                  Seu Caminho Espiritual
                </h2>
                <p className="text-gray-300 text-lg mb-6">
                  {currentArchetype.path}
                </p>
                
                <h3 className="text-xl font-bold text-purple-300 mb-4">Missões do Arquétipo:</h3>
                <div className="space-y-3">
                  {currentArchetype.quests.map((quest, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-center gap-3 bg-slate-800/50 p-4 rounded-lg"
                    >
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <p className="text-gray-300">{quest}</p>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Explorar Outros Arquétipos */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-purple-900/30 p-6">
                <h2 className="text-2xl font-bold text-purple-300 mb-4">
                  Conheça Outros Arquétipos
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {Object.entries(ARCHETYPES).map(([key, archetype]) => (
                    <motion.button
                      key={key}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedArchetype(key)}
                      className={`p-4 rounded-xl text-center transition ${
                        key === user.archetype
                          ? `bg-gradient-to-br ${archetype.gradient}`
                          : 'bg-slate-800/50 hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="text-4xl mb-2">{archetype.icon}</div>
                      <p className="text-xs font-semibold text-white">{archetype.name}</p>
                    </motion.button>
                  ))}
                </div>
              </Card>
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-purple-900/30 p-12">
              <Sparkles className="w-16 h-16 text-purple-500 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">
                Descubra Seu Arquétipo Místico
              </h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Complete o questionário de arquétipos para descobrir qual caminho espiritual ressoa com sua essência.
              </p>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8 py-6">
                Iniciar Questionário
              </Button>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
