import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, Check, Sparkles, TrendingUp, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import OurosPaymentModal from "../components/shop/OurosPaymentModal";

const ourosPacks = [
  { amount: 100, price: 5.00, bonus: 0 },
  { amount: 500, price: 20.00, bonus: 50 },
  { amount: 1000, price: 35.00, bonus: 150 },
  { amount: 5000, price: 150.00, bonus: 1000 }
];

export default function CarteiraPage() {
  const [user, setUser] = useState(null);
  const [selectedPack, setSelectedPack] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const navigate = useNavigate();

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

  const handleBuyPack = (pack) => {
    setSelectedPack(pack);
    setShowPaymentModal(true);
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
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 md:mb-12"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4">
            Sua Carteira Mística
          </h1>
          <p className="text-gray-400 text-base md:text-lg">
            Adquira Ouros para desbloquear recursos especiais
          </p>
        </motion.div>

        {/* Saldo Atual */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 md:mb-12"
        >
          <Card className="bg-gradient-to-br from-yellow-900/40 to-yellow-800/40 border-yellow-600/30 p-6 md:p-8 text-center">
            <p className="text-yellow-200 text-xs md:text-sm mb-2 uppercase tracking-wide">
              Saldo Atual
            </p>
            <div className="flex items-center justify-center gap-2 md:gap-3 mb-2">
              <Coins className="w-10 h-10 md:w-12 md:h-12 text-yellow-400" />
              <h2 className="text-5xl md:text-6xl font-bold text-yellow-300">
                {user.ouros || 0}
              </h2>
            </div>
            <p className="text-yellow-200 text-xs md:text-sm">Ouros disponíveis</p>
          </Card>
        </motion.div>

        {/* Pacotes de Ouros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 md:mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 md:mb-6">
            Pacotes de Ouros
          </h2>
          
          {/* Grid dos 4 pacotes de ouros */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4">
            {ourosPacks.map((pack, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="relative"
              >
                <Card className="bg-[#1a1a2e] border-2 border-purple-900/20 hover:border-yellow-500/50 p-4 md:p-6 transition-all h-full relative overflow-hidden group flex flex-col">
                  {/* Animação de borda dourada */}
                  <motion.div
                    className="absolute inset-0 rounded-lg"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(234, 179, 8, 0.3), transparent)',
                    }}
                    animate={{
                      x: ['-100%', '200%'],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />

                  <div className="text-center relative z-10 flex flex-col flex-1">
                    <Coins className="w-10 h-10 md:w-12 md:h-12 text-yellow-400 mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl md:text-2xl font-bold text-yellow-300 mb-2">
                      {pack.amount}
                    </h3>
                    {pack.bonus > 0 && (
                      <div className="mb-2 md:mb-3">
                        <span className="bg-green-600 text-white text-[10px] md:text-xs px-2 py-1 rounded-full font-bold">
                          +{pack.bonus} BÔNUS
                        </span>
                      </div>
                    )}
                    <p className="text-gray-400 text-xs md:text-sm mb-3 md:mb-4 min-h-[2rem]">
                      {pack.bonus > 0 ? `Total: ${pack.amount + pack.bonus} ouros` : <span>&nbsp;</span>}
                    </p>
                    <p className="text-2xl md:text-3xl font-bold text-white mb-auto">
                      R$ {pack.price.toFixed(2)}
                    </p>
                    <Button 
                      onClick={() => handleBuyPack(pack)}
                      className="w-full bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-600 hover:via-amber-600 hover:to-yellow-700 text-slate-900 font-bold text-sm md:text-base h-10 md:h-11 shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 transition-all mt-4"
                    >
                      Comprar
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Card Como Ganhar Ouros - Linha separada sem animação */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card 
              onClick={() => navigate(createPageUrl("ComoGanharOuros"))}
              className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-2 border-green-500/30 hover:border-green-400 p-6 md:p-8 cursor-pointer group transition-all hover:shadow-lg hover:shadow-green-500/30"
            >
              <div className="text-center flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
                <TrendingUp className="w-12 h-12 md:w-16 md:h-16 text-green-400 group-hover:scale-110 transition-transform flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-bold text-green-300 mb-2">
                    Como Ganhar Ouros Grátis
                  </h3>
                  <p className="text-sm md:text-base text-green-200">
                    Descubra formas grátis de ganhar ouros através de missões, eventos e conquistas
                  </p>
                </div>
                <HelpCircle className="w-8 h-8 md:w-10 md:h-10 text-green-400 group-hover:rotate-12 transition-transform flex-shrink-0" />
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Planos de Assinatura */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 md:mb-6">
            Planos de Assinatura
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Plano Viajante */}
            <Card className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 border-purple-600/30 p-6 md:p-8">
              <div className="mb-4 md:mb-6">
                <h3 className="text-xl md:text-2xl font-bold text-purple-300 mb-2">
                  Viajante Cósmico
                </h3>
                <p className="text-gray-300 text-xs md:text-sm">
                  Para quem está começando sua jornada
                </p>
              </div>

              <div className="mb-4 md:mb-6">
                <p className="text-4xl md:text-5xl font-bold text-white mb-2">
                  R$ 19,90
                  <span className="text-base md:text-lg text-gray-400">/mês</span>
                </p>
              </div>

              <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8">
                <li className="flex items-center gap-2 text-gray-300 text-sm md:text-base">
                  <Check className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                  <span>100 Ouros mensais</span>
                </li>
                <li className="flex items-center gap-2 text-gray-300 text-sm md:text-base">
                  <Check className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                  <span>Acesso a tiragens especiais</span>
                </li>
                <li className="flex items-center gap-2 text-gray-300 text-sm md:text-base">
                  <Check className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                  <span>Badge exclusivo no perfil</span>
                </li>
                <li className="flex items-center gap-2 text-gray-300 text-sm md:text-base">
                  <Check className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                  <span>10% de desconto na loja</span>
                </li>
              </ul>

              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 md:py-3 text-sm md:text-base">
                Assinar Agora
              </Button>
            </Card>

            {/* Plano Iniciado */}
            <Card className="bg-gradient-to-br from-yellow-900/40 to-yellow-800/40 border-yellow-600/30 p-6 md:p-8 relative overflow-hidden">
              <div className="absolute top-3 md:top-4 right-3 md:right-4">
                <span className="bg-yellow-500 text-black text-[10px] md:text-xs px-2 md:px-3 py-0.5 md:py-1 rounded-full font-bold">
                  POPULAR
                </span>
              </div>

              <div className="mb-4 md:mb-6">
                <h3 className="text-xl md:text-2xl font-bold text-yellow-300 mb-2">
                  Iniciado
                </h3>
                <p className="text-gray-300 text-xs md:text-sm">
                  Para místicos comprometidos
                </p>
              </div>

              <div className="mb-4 md:mb-6">
                <p className="text-4xl md:text-5xl font-bold text-white mb-2">
                  R$ 39,90
                  <span className="text-base md:text-lg text-gray-400">/mês</span>
                </p>
              </div>

              <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8">
                <li className="flex items-center gap-2 text-gray-300 text-sm md:text-base">
                  <Check className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
                  <span className="font-semibold">300 Ouros mensais</span>
                </li>
                <li className="flex items-center gap-2 text-gray-300 text-sm md:text-base">
                  <Check className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
                  <span>Tudo do plano Viajante</span>
                </li>
                <li className="flex items-center gap-2 text-gray-300 text-sm md:text-base">
                  <Check className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
                  <span>Acesso antecipado a novos recursos</span>
                </li>
                <li className="flex items-center gap-2 text-gray-300 text-sm md:text-base">
                  <Check className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
                  <span>Consultoria mensal com tarólogos</span>
                </li>
                <li className="flex items-center gap-2 text-gray-300 text-sm md:text-base">
                  <Check className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
                  <span>20% de desconto na loja</span>
                </li>
              </ul>

              <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-2.5 md:py-3 text-sm md:text-base">
                Assinar Agora
              </Button>
            </Card>
          </div>
        </motion.div>
      </div>

      {/* Modal de Pagamento */}
      <OurosPaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedPack(null);
        }}
        pack={selectedPack}
        user={user}
      />
    </div>
  );
}