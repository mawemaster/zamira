import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Swords, Sparkles, Zap, Users, Wand2 } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const games = [
  {
    id: 1,
    title: "Lutas de Ideias",
    description: "Desafie outros místicos em debates filosóficos e espirituais. Prove sua sabedoria!",
    icon: Swords,
    gradient: "from-purple-600 via-purple-500 to-pink-600",
    glowColor: "rgba(147, 51, 234, 0.5)",
    status: "active",
    route: "Arena"
  },
  {
    id: 2,
    title: "Dojô Místico",
    description: "Treine suas habilidades místicas e desbloqueie novos poderes através de desafios únicos.",
    icon: Zap,
    gradient: "from-yellow-600 via-orange-500 to-red-600",
    glowColor: "rgba(234, 179, 8, 0.5)",
    status: "active",
    route: "Dojo"
  },
  {
    id: 3,
    title: "Tarot Online",
    description: "Enfrente consulentes virtuais em atendimentos ao vivo. Demonstre seu domínio profissional!",
    icon: Users,
    gradient: "from-cyan-600 via-blue-500 to-indigo-600",
    glowColor: "rgba(6, 182, 212, 0.5)",
    status: "active",
    route: "TarotOnline"
  },
  {
    id: 4,
    title: "Magic: O Grimório",
    description: "Duela com cartas místicas em batalhas estratégicas. Conjure criaturas e domine a mana!",
    icon: Wand2,
    gradient: "from-indigo-600 via-purple-600 to-pink-600",
    glowColor: "rgba(99, 102, 241, 0.5)",
    status: "active",
    route: "MagicArena"
  }
];

export default function ArenaHubPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    }
  };

  const handleGameClick = (game) => {
    if (game.status === "active" && game.route) {
      navigate(createPageUrl(game.route));
    }
  };

  const handleClose = () => {
    navigate(createPageUrl("Hub"));
  };

  if (!user) {
    return (
      <div className="fixed inset-0 bg-[#0a0a1a] flex items-center justify-center z-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-12 h-12 text-purple-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#131128] to-[#0a0a1a] z-50 overflow-y-auto">
      {/* Partículas de Fundo Animadas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Botão Fechar */}
      <button
        onClick={handleClose}
        className="fixed top-4 right-4 z-50 w-12 h-12 rounded-full bg-slate-800/50 hover:bg-slate-700/50 flex items-center justify-center transition backdrop-blur-sm"
      >
        <X className="w-6 h-6 text-gray-400" />
      </button>

      <div className="max-w-7xl mx-auto px-4 py-12 pb-32">
        {/* Header Épico */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.h1
            className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-4"
            animate={{
              textShadow: [
                "0 0 20px rgba(147, 51, 234, 0.5)",
                "0 0 40px rgba(147, 51, 234, 0.8)",
                "0 0 20px rgba(147, 51, 234, 0.5)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Arena dos Oráculos
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-400 text-base md:text-lg lg:text-xl"
          >
            Escolha seu desafio e prove seu valor
          </motion.p>
        </motion.div>

        {/* Grid de Jogos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {games.map((game, index) => {
            const Icon = game.icon;
            const isHovered = hoveredCard === game.id;
            const isActive = game.status === "active";

            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                onHoverStart={() => setHoveredCard(game.id)}
                onHoverEnd={() => setHoveredCard(null)}
              >
                <Card
                  className={`relative overflow-hidden border-2 ${
                    isActive ? "border-purple-500/50 cursor-pointer" : "border-gray-700/50 cursor-not-allowed"
                  } bg-[#131128] backdrop-blur-sm transition-all duration-500 ${
                    isActive && "hover:scale-105 hover:border-purple-400"
                  }`}
                  onClick={() => handleGameClick(game)}
                  style={{
                    boxShadow: isHovered && isActive ? `0 0 40px ${game.glowColor}` : "none",
                  }}
                >
                  {/* Gradiente de Fundo */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${game.gradient} opacity-10 transition-opacity duration-500 ${
                      isHovered && isActive ? "opacity-20" : ""
                    }`}
                  />

                  {/* Brilho Animado */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0"
                      animate={{
                        background: [
                          `radial-gradient(circle at 0% 0%, ${game.glowColor} 0%, transparent 50%)`,
                          `radial-gradient(circle at 100% 100%, ${game.glowColor} 0%, transparent 50%)`,
                          `radial-gradient(circle at 0% 0%, ${game.glowColor} 0%, transparent 50%)`,
                        ],
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                  )}

                  <div className="relative z-10 p-6 md:p-8">
                    {/* Ícone do Jogo */}
                    <motion.div
                      className="mb-6 flex justify-center"
                      animate={
                        isHovered && isActive
                          ? {
                              scale: [1, 1.1, 1],
                              rotate: [0, 5, -5, 0],
                            }
                          : {}
                      }
                      transition={{ duration: 0.5 }}
                    >
                      <div
                        className={`w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br ${game.gradient} flex items-center justify-center ${
                          game.status === "coming_soon" ? "opacity-50" : ""
                        }`}
                        style={{
                          boxShadow: isHovered && isActive ? `0 0 30px ${game.glowColor}` : "none",
                        }}
                      >
                        <Icon className="w-10 h-10 md:w-12 md:h-12 text-white" />
                      </div>
                    </motion.div>

                    {/* Título */}
                    <h3
                      className={`text-xl md:text-2xl font-bold text-white mb-3 text-center ${
                        game.status === "coming_soon" ? "opacity-70" : ""
                      }`}
                    >
                      {game.title}
                    </h3>

                    {/* Descrição */}
                    <p
                      className={`text-gray-400 text-center text-sm mb-6 leading-relaxed ${
                        game.status === "coming_soon" ? "opacity-70" : ""
                      }`}
                    >
                      {game.description}
                    </p>

                    {/* Botão */}
                    {isActive ? (
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          className={`w-full bg-gradient-to-r ${game.gradient} hover:opacity-90 text-white font-bold py-3 rounded-xl shadow-lg`}
                        >
                          Entrar Agora
                        </Button>
                      </motion.div>
                    ) : (
                      <Button
                        disabled
                        className="w-full bg-gray-700 text-gray-400 cursor-not-allowed py-3 rounded-xl"
                      >
                        Em Breve
                      </Button>
                    )}

                    {/* Efeito de Partículas no Hover */}
                    {isHovered && isActive && (
                      <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {[...Array(5)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-2 h-2 bg-white rounded-full"
                            initial={{
                              x: "50%",
                              y: "50%",
                              opacity: 1,
                            }}
                            animate={{
                              x: `${Math.random() * 100}%`,
                              y: `${Math.random() * 100}%`,
                              opacity: 0,
                            }}
                            transition={{ duration: 1, delay: i * 0.1 }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Estatísticas do Jogador */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16"
        >
          <Card className="bg-[#131128] border-purple-500/30 p-6">
            <div className="flex flex-col md:flex-row items-center justify-around gap-6">
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-1">Nível Atual</p>
                <p className="text-3xl font-bold text-purple-400">{user.level || 1}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-1">Arquétipo</p>
                <p className="text-xl font-bold text-white">
                  {user.archetype === "sabio" ? "Sábio" :
                   user.archetype === "guardiao_astral" ? "Guardião Astral" :
                   user.archetype === "bruxa_natural" ? "Bruxa Natural" :
                   user.archetype === "xama" ? "Xamã" :
                   user.archetype === "navegador_cosmico" ? "Navegador Cósmico" :
                   user.archetype === "alquimista" ? "Alquimista" :
                   "Místico"}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-1">XP Total</p>
                <p className="text-3xl font-bold text-yellow-400">{user.xp || 0}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}