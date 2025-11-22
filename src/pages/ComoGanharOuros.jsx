import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Coins, TrendingUp, MessageSquare, Heart, Flame, Award, 
  CheckCircle, Sparkles, BarChart3, Activity, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const wayMethods = [
  {
    icon: MessageSquare,
    title: "Criar Posts",
    description: "Compartilhe reflexões no feed da comunidade",
    reward: "10 ouros por post",
    color: "from-blue-600 to-cyan-600"
  },
  {
    icon: Heart,
    title: "Reagir em Posts",
    description: "Interaja com a comunidade deixando reações",
    reward: "2 ouros por reação",
    color: "from-pink-600 to-rose-600"
  },
  {
    icon: Flame,
    title: "Arena dos Oráculos",
    description: "Participe de duelos e ganhe se vencer",
    reward: "50 ouros por vitória",
    color: "from-orange-600 to-red-600"
  },
  {
    icon: CheckCircle,
    title: "Completar Missões",
    description: "Cumpra missões diárias e semanais",
    reward: "Até 100 ouros",
    color: "from-green-600 to-emerald-600"
  },
  {
    icon: Award,
    title: "Subir de Nível",
    description: "Ganhe XP e desbloqueie recompensas",
    reward: "Ouros + Badges",
    color: "from-yellow-600 to-amber-600"
  },
  {
    icon: Sparkles,
    title: "Quizzes Místicos",
    description: "Acerte 80%+ e ganhe recompensas",
    reward: "5 ouros por quiz",
    color: "from-purple-600 to-pink-600"
  }
];

export default function ComoGanharOurosPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const currentUser = await base44.auth.me();
    setUser(currentUser);
  };

  const { data: allUsers } = useQuery({
    queryKey: ['all-users-ouros'],
    queryFn: () => base44.entities.User.list("", 1000),
    refetchInterval: 10000
  });

  // Calcular stats de ouros
  const totalOuros = allUsers?.reduce((sum, u) => sum + (u.ouros || 0), 0) || 0;
  const avgOuros = allUsers?.length > 0 ? Math.floor(totalOuros / allUsers.length) : 0;
  const topHolder = allUsers?.sort((a, b) => (b.ouros || 0) - (a.ouros || 0))[0];

  // Gerar dados de cotação simulados em tempo real
  const [priceData, setPriceData] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(8.5);

  useEffect(() => {
    // Inicializar dados
    const initialData = Array.from({ length: 20 }, (_, i) => ({
      time: `${20 - i}min`,
      price: 8.0 + Math.random() * 1.5,
      volume: 5000 + Math.random() * 5000
    }));
    setPriceData(initialData);

    // Atualizar a cada 3 segundos
    const interval = setInterval(() => {
      setPriceData(prev => {
        const newPrice = Math.max(7.5, Math.min(10.0, prev[prev.length - 1].price + (Math.random() - 0.5) * 0.3));
        const newPoint = {
          time: 'agora',
          price: newPrice,
          volume: 5000 + Math.random() * 5000
        };
        setCurrentPrice(newPrice);
        return [...prev.slice(1), newPoint];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const priceChange = priceData.length > 1 
    ? ((priceData[priceData.length - 1].price - priceData[0].price) / priceData[0].price) * 100 
    : 0;

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#02031C] via-slate-900 to-[#02031C]">
        <Sparkles className="w-12 h-12 text-purple-500 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#02031C] via-slate-900 to-[#02031C] text-white p-3 md:p-6 pb-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 5, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity }
            }}
            className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-yellow-500/50"
          >
            <Coins className="w-10 h-10 md:w-12 md:h-12 text-slate-900" />
          </motion.div>
          <h1 className="text-2xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
            Como Ganhar Ouros
          </h1>
          <p className="text-slate-300 text-sm md:text-base">Moeda mística do portal Zamira</p>
        </motion.div>

        {/* O que são Ouros */}
        <Card className="bg-gradient-to-br from-yellow-900/30 to-amber-900/30 border-yellow-500/30 p-4 md:p-6 mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-yellow-300 mb-3 flex items-center gap-2">
            <Coins className="w-6 h-6" />
            O que são Ouros?
          </h2>
          <p className="text-slate-200 leading-relaxed mb-4">
            Ouros são a moeda mágica de Zamira, usada para desbloquear recursos especiais, comprar itens na loja mística, 
            interpretar sonhos, lançar magias em posts e muito mais. É o símbolo da sua dedicação e participação na comunidade.
          </p>
          <p className="text-sm text-yellow-300 font-semibold">
            💰 Você pode ganhar Ouros de várias formas completamente GRÁTIS!
          </p>
        </Card>

        {/* Cotação em Tempo Real */}
        <Card className="bg-slate-800/50 border-purple-500/30 p-4 md:p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-purple-300 flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              Cotação de Ouros
            </h2>
            <div className="text-right">
              <p className="text-2xl md:text-3xl font-bold text-yellow-400">
                {currentPrice.toFixed(2)} BRL
              </p>
              <div className={`flex items-center gap-1 text-sm ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {priceChange >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                <span>{Math.abs(priceChange).toFixed(2)}%</span>
              </div>
            </div>
          </div>

          {/* Gráfico de Preço */}
          <div className="h-64 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={priceData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#facc15" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#facc15" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} domain={[7, 10.5]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                  labelStyle={{ color: '#cbd5e1' }}
                />
                <Area type="monotone" dataKey="price" stroke="#facc15" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <div className="bg-slate-700/50 p-3 rounded-lg text-center">
              <p className="text-xs text-slate-400 mb-1">Total em Circulação</p>
              <p className="text-lg md:text-xl font-bold text-yellow-400">
                {totalOuros.toLocaleString()}
              </p>
            </div>
            <div className="bg-slate-700/50 p-3 rounded-lg text-center">
              <p className="text-xs text-slate-400 mb-1">Média por Usuário</p>
              <p className="text-lg md:text-xl font-bold text-purple-400">
                {avgOuros}
              </p>
            </div>
            <div className="bg-slate-700/50 p-3 rounded-lg text-center">
              <p className="text-xs text-slate-400 mb-1">Top Holder</p>
              <p className="text-xs md:text-sm font-bold text-green-400 truncate">
                {topHolder?.display_name || topHolder?.full_name || 'N/A'}
              </p>
            </div>
          </div>
        </Card>

        {/* Métodos para Ganhar */}
        <h2 className="text-xl md:text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-green-400" />
          Formas de Ganhar Ouros Grátis
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wayMethods.map((method, index) => {
            const Icon = method.icon;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`bg-slate-800/50 border-2 border-transparent hover:border-yellow-500/50 p-4 md:p-6 group transition-all hover:shadow-lg hover:shadow-yellow-500/20`}>
                  <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${method.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <Icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  
                  <h3 className="text-lg md:text-xl font-bold text-white mb-2">
                    {method.title}
                  </h3>
                  
                  <p className="text-sm text-slate-300 mb-3">
                    {method.description}
                  </p>
                  
                  <Badge className="bg-yellow-600 text-white">
                    {method.reward}
                  </Badge>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Dicas Extras */}
        <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30 p-4 md:p-6 mt-8">
          <h3 className="font-bold text-purple-300 mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Dicas para Maximizar Ganhos
          </h3>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
              <span>Complete missões diárias para ganhar ouros consistentemente</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
              <span>Participe ativamente da comunidade criando conteúdo de qualidade</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
              <span>Vença duelos na Arena para grandes recompensas</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
              <span>Assinantes PRO recebem ouros mensais automaticamente</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}