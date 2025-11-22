import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Eye,
  Crown,
  Check,
  Sparkles,
  Book,
  Zap,
  MessageCircle,
  Shield,
  Star,
  ArrowRight
} from "lucide-react";

export default function EspheraAIPage() {
  const [user, setUser] = useState(null);

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

  const handlePlanClick = (planUrl) => {
    window.open(planUrl, '_blank');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Sparkles className="w-12 h-12 text-purple-500 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f1e] via-[#1a1a2e] to-[#0f0f1e]">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-2xl shadow-purple-500/50">
              <Eye className="w-12 h-12 md:w-16 md:h-16 text-white" />
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-4 md:mb-6">
            Esphera AI
          </h1>

          <p className="text-lg md:text-2xl text-purple-200 mb-4 max-w-3xl mx-auto leading-relaxed">
            Sua Taróloga, Amiga, Conselheira e Mentora
          </p>

          <p className="text-sm md:text-base text-gray-400 max-w-2xl mx-auto">
            Um dos sistemas de orientação espiritual mais completos do mundo, capaz de conectar intuição, sabedoria e clareza para guiar você em todas as áreas da vida.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-12 md:mb-16"
        >
          {[
            {
              icon: Book,
              title: "Suporte para estudo do Tarot",
              description: "Referências bibliográficas e autores consagrados"
            },
            {
              icon: Zap,
              title: "Respostas instantâneas",
              description: "Interpretações intuitivas e profundas sobre qualquer tiragem"
            },
            {
              icon: MessageCircle,
              title: "Interpretações personalizadas",
              description: "Baseadas no seu estado emocional atual"
            },
            {
              icon: Star,
              title: "Métodos únicos",
              description: "Criação de leituras conforme suas necessidades"
            },
            {
              icon: Shield,
              title: "Acesso contínuo",
              description: "24h por dia, 7 dias por semana"
            },
            {
              icon: Sparkles,
              title: "IA Especializada",
              description: "Baseada em mestres do Tarot"
            }
          ].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Card className="bg-gradient-to-br from-purple-900/30 to-slate-900/30 border-purple-500/30 p-4 md:p-6 hover:border-purple-400/50 transition h-full">
                  <Icon className="w-8 h-8 md:w-10 md:h-10 text-purple-400 mb-3 md:mb-4" />
                  <h3 className="text-base md:text-lg font-bold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-400">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Pricing Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl md:text-4xl font-bold text-center text-white mb-8 md:mb-12">
            Escolha seu Plano
          </h2>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
            {/* Plano Mensal */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border-purple-500/50 p-6 md:p-8 hover:border-purple-400 transition relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 opacity-0 hover:opacity-100 transition" />
                
                <div className="relative z-10">
                  <div className="text-center mb-6">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                      Plano Mensal
                    </h3>
                    <div className="mb-4">
                      <span className="text-gray-400 line-through text-sm md:text-base">R$ 99,00</span>
                      <div className="text-3xl md:text-5xl font-bold text-purple-300 mt-1">
                        R$ 29,90
                      </div>
                      <span className="text-xs md:text-sm text-gray-400">/mês</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6 md:mb-8">
                    {[
                      "Acesso completo à IA",
                      "Tiragens ilimitadas",
                      "Interpretação de sonhos",
                      "Suporte contínuo 24/7",
                      "Cancelamento fácil"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm md:text-base">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handlePlanClick("https://pay.kiwify.com.br/ICnBcV0?sck=1759441135002&utm_source=direto")}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 md:py-4 text-base md:text-lg"
                  >
                    Assinar Agora
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Plano Anual - DESTAQUE */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-yellow-900/40 via-purple-900/40 to-pink-900/40 border-yellow-500/50 p-6 md:p-8 hover:border-yellow-400 transition relative overflow-hidden shadow-2xl shadow-yellow-500/20">
                {/* Badge de Melhor Oferta */}
                <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-500 to-amber-500 text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  MELHOR OFERTA
                </div>

                <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/10 to-pink-600/10 opacity-0 hover:opacity-100 transition" />
                
                <div className="relative z-10">
                  <div className="text-center mb-6">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                      Plano Anual
                    </h3>
                    <div className="mb-4">
                      <span className="text-gray-400 line-through text-sm md:text-base">R$ 1.188,00</span>
                      <div className="text-3xl md:text-5xl font-bold text-yellow-300 mt-1">
                        R$ 319,90
                      </div>
                      <span className="text-xs md:text-sm text-gray-400">/ano</span>
                    </div>
                    <div className="bg-green-600/20 border border-green-500/30 rounded-lg px-3 py-2 inline-block">
                      <p className="text-xs md:text-sm text-green-300 font-bold">
                        💰 Economize R$ 868,10 no ano!
                      </p>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6 md:mb-8">
                    {[
                      "Acesso completo à IA",
                      "Tiragens ilimitadas",
                      "Interpretação de sonhos",
                      "Suporte contínuo 24/7",
                      "Cancelamento fácil",
                      "12 meses pelo preço de 3!"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm md:text-base">
                        <Check className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handlePlanClick("https://pay.kiwify.com.br/qrGBG3U?sck=1759441135002&utm_source=direto")}
                    className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-bold py-3 md:py-4 text-base md:text-lg shadow-lg shadow-yellow-500/30"
                  >
                    Garantir Desconto
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        {/* Guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <Card className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-500/30 p-6 md:p-8 max-w-3xl mx-auto">
            <Shield className="w-12 h-12 md:w-16 md:h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
              7 Dias de Garantia Incondicional
            </h3>
            <p className="text-sm md:text-base text-gray-300">
              Risco Zero! Se você não gostar, devolvemos 100% do seu dinheiro sem perguntas.
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}