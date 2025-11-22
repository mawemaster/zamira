
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Map, Users, Gamepad2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import GameCanvas from "../components/game/GameCanvas";

export default function ZamiraCityPage() {
  const [user, setUser] = useState(null);
  const [enteredCity, setEnteredCity] = useState(false); // Changed from isPlaying to enteredCity
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    loadUser();
    loadOnlineCount();
    
    const interval = setInterval(loadOnlineCount, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    }
  };

  const loadOnlineCount = async () => {
    try {
      const positions = await base44.entities.ZamiraPosition.filter({ is_online: true });
      setOnlineCount(positions.length);
    } catch (error) {
      console.error("Erro ao carregar contagem:", error);
    }
  };

  const handleEnterCity = () => {
    setEnteredCity(true); // Changed to setEnteredCity
  };

  // handleLeaveCity is no longer directly used here, its logic is moved to the onExit prop of GameCanvas
  // const handleLeaveCity = () => {
  //   setEnteredCity(false);
  //   loadOnlineCount();
  // };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f0f1e] via-[#1a1a2e] to-[#0f0f1e] flex items-center justify-center">
        <Sparkles className="w-12 h-12 text-purple-500 animate-pulse" />
      </div>
    );
  }

  if (enteredCity) { // Changed from isPlaying to enteredCity
    return (
      <div className="fixed inset-0 z-[9999] bg-black">
        {/* Updated props: currentUser -> user, onClose -> onExit */}
        <GameCanvas user={user} onExit={() => { setEnteredCity(false); loadOnlineCount(); }} /> 
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f1e] via-[#1a1a2e] to-[#0f0f1e]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 mb-6 shadow-2xl shadow-purple-500/50">
            <Map className="w-12 h-12 text-white" />
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4">
            🏰 Cidade de Zamira
          </h1>
          
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-6">
            Explore o metaverso místico, encontre outros viajantes e descubra segredos escondidos na cidade mágica
          </p>

          <div className="flex items-center justify-center gap-6 text-sm md:text-base">
            <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-full border border-purple-500/30">
              <Users className="w-5 h-5 text-green-400" />
              <span className="text-white font-bold">{onlineCount}</span>
              <span className="text-gray-400">online agora</span>
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 border-purple-500/30 p-6 h-full">
              <div className="w-12 h-12 rounded-full bg-purple-600/30 flex items-center justify-center mb-4">
                <Gamepad2 className="w-6 h-6 text-purple-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Movimento Livre</h3>
              <p className="text-purple-200 text-sm">
                Clique em qualquer lugar da tela para mover seu avatar. Explore a cidade sem limites!
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-pink-900/40 to-pink-800/40 border-pink-500/30 p-6 h-full">
              <div className="w-12 h-12 rounded-full bg-pink-600/30 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-pink-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Multiplayer em Tempo Real</h3>
              <p className="text-pink-200 text-sm">
                Veja outros viajantes se movendo ao vivo. Encontre amigos e faça novas conexões místicas!
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 border-blue-500/30 p-6 h-full">
              <div className="w-12 h-12 rounded-full bg-blue-600/30 flex items-center justify-center mb-4">
                <Map className="w-6 h-6 text-blue-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Mundo Vivo</h3>
              <p className="text-blue-200 text-sm">
                Descubra portais místicos, áreas secretas e locais especiais espalhados pela cidade
              </p>
            </Card>
          </motion.div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <Card className="bg-gradient-to-r from-purple-900/60 via-pink-900/60 to-blue-900/60 border-purple-500/50 p-8 md:p-12 relative overflow-hidden">
            {/* Efeito de brilho */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              animate={{
                x: ['-200%', '200%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
            />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Pronto para Explorar?
              </h2>
              <p className="text-gray-200 text-lg mb-8 max-w-2xl mx-auto">
                Entre na Cidade de Zamira agora e comece sua jornada no metaverso místico!
              </p>

              <Button
                onClick={handleEnterCity}
                className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white font-bold text-lg px-8 py-6 rounded-xl shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 transition-all duration-300"
              >
                <Map className="w-6 h-6 mr-2" />
                Entrar na Cidade
                <ArrowRight className="w-6 h-6 ml-2" />
              </Button>

              <p className="text-gray-300 text-sm mt-4">
                ✨ Seu avatar será criado automaticamente com base no seu perfil
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Como Jogar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">
            🎮 Como Jogar
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-slate-900/50 border-purple-500/20 p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-600/30 flex items-center justify-center flex-shrink-0 text-white font-bold">
                  1
                </div>
                <div>
                  <h3 className="text-white font-bold mb-2">Movimento</h3>
                  <p className="text-gray-300 text-sm">
                    Clique em qualquer ponto da tela para mover seu avatar. Seu personagem andará automaticamente até o local clicado.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-slate-900/50 border-purple-500/20 p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-600/30 flex items-center justify-center flex-shrink-0 text-white font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-white font-bold mb-2">Exploração</h3>
                  <p className="text-gray-300 text-sm">
                    Explore a cidade livremente! Descubra áreas verdes, fontes de água e portais místicos roxos.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-slate-900/50 border-purple-500/20 p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-600/30 flex items-center justify-center flex-shrink-0 text-white font-bold">
                  3
                </div>
                <div>
                  <h3 className="text-white font-bold mb-2">Interação</h3>
                  <p className="text-gray-300 text-sm">
                    Veja outros jogadores em tempo real! Seus avatares aparecem com seus nomes e níveis acima da cabeça.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-slate-900/50 border-purple-500/20 p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-600/30 flex items-center justify-center flex-shrink-0 text-white font-bold">
                  4
                </div>
                <div>
                  <h3 className="text-white font-bold mb-2">Personalização</h3>
                  <p className="text-gray-300 text-sm">
                    Seu avatar usa a cor do seu arquétipo místico e exibe sua foto de perfil. Você é único!
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
