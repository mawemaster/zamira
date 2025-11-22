import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, TrendingUp, Users, MessageSquare, Eye, 
  ShoppingBag, Activity, Crown, Map, Zap
} from "lucide-react";
import { motion } from "framer-motion";

export default function AnalyticsTab() {
  const { data: users } = useQuery({
    queryKey: ['analytics-users'],
    queryFn: () => base44.entities.User.list("-created_date", 1000),
  });

  const { data: posts } = useQuery({
    queryKey: ['analytics-posts'],
    queryFn: () => base44.entities.Post.list("-created_date", 500),
  });

  const { data: messages } = useQuery({
    queryKey: ['analytics-messages'],
    queryFn: () => base44.entities.DirectMessage.list("-created_date", 1000),
  });

  const { data: products } = useQuery({
    queryKey: ['analytics-products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const { data: positions } = useQuery({
    queryKey: ['analytics-positions'],
    queryFn: () => base44.entities.ZamiraPosition.filter({ is_online: true }),
    refetchInterval: 5000,
  });

  const { data: duels } = useQuery({
    queryKey: ['analytics-duels'],
    queryFn: () => base44.entities.Duel.list("-created_date", 200),
  });

  // Calcular métricas
  const totalUsers = users?.length || 0;
  const onlineUsers = positions?.length || 0;
  const totalPosts = posts?.length || 0;
  const totalMessages = messages?.length || 0;
  const totalProducts = products?.length || 0;
  const totalDuels = duels?.length || 0;

  const proUsers = users?.filter(u => u.is_pro_subscriber)?.length || 0;
  const proPercentage = totalUsers > 0 ? ((proUsers / totalUsers) * 100).toFixed(1) : 0;

  const totalOuros = users?.reduce((sum, user) => sum + (user.ouros || 0), 0) || 0;
  const avgLevel = users?.length ? (users.reduce((sum, u) => sum + (u.level || 1), 0) / users.length).toFixed(1) : 0;

  // Posts por tipo
  const postsByType = posts?.reduce((acc, post) => {
    const type = post.post_type || 'simples';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {}) || {};

  // Usuários por arquétipo
  const usersByArchetype = users?.reduce((acc, user) => {
    const arch = user.archetype || 'none';
    acc[arch] = (acc[arch] || 0) + 1;
    return acc;
  }, {}) || {};

  const metrics = [
    {
      label: "Taxa de Conversão PRO",
      value: `${proPercentage}%`,
      subtext: `${proUsers} de ${totalUsers} usuários`,
      icon: Crown,
      color: "from-yellow-500 to-amber-600"
    },
    {
      label: "Engajamento Médio",
      value: totalPosts > 0 ? `${(totalMessages / totalPosts * 100).toFixed(0)}%` : "0%",
      subtext: "Mensagens por post",
      icon: TrendingUp,
      color: "from-green-500 to-emerald-600"
    },
    {
      label: "Nível Médio",
      value: avgLevel,
      subtext: "Progressão geral",
      icon: Activity,
      color: "from-purple-500 to-purple-600"
    },
    {
      label: "Taxa Online",
      value: totalUsers > 0 ? `${((onlineUsers / totalUsers) * 100).toFixed(1)}%` : "0%",
      subtext: `${onlineUsers} online agora`,
      icon: Users,
      color: "from-blue-500 to-blue-600"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Analytics Avançado</h2>
        <p className="text-slate-600">Métricas e insights do sistema</p>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="bg-white border-slate-200 p-4">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${metric.color} flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-slate-900 mb-1">
                  {metric.value}
                </p>
                <p className="text-sm text-slate-600 mb-1">{metric.label}</p>
                <p className="text-xs text-slate-500">{metric.subtext}</p>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Distribuição de Posts */}
      <Card className="bg-white border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-600" />
          Tipos de Posts
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {Object.entries(postsByType).map(([type, count]) => (
            <Card key={type} className="bg-slate-50 border-slate-200 p-3">
              <p className="text-xs text-slate-600 capitalize mb-1">{type}</p>
              <p className="text-2xl font-bold text-slate-900">{count}</p>
            </Card>
          ))}
        </div>
      </Card>

      {/* Distribuição de Arquétipos */}
      <Card className="bg-white border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600" />
          Usuários por Arquétipo
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(usersByArchetype).map(([archetype, count]) => (
            <Card key={archetype} className="bg-slate-50 border-slate-200 p-3">
              <p className="text-xs text-slate-600 capitalize mb-1">
                {archetype === 'bruxa_natural' ? 'Bruxa Natural' :
                 archetype === 'sabio' ? 'Sábio' :
                 archetype === 'guardiao_astral' ? 'Guardião Astral' :
                 archetype === 'xama' ? 'Xamã' :
                 archetype === 'navegador_cosmico' ? 'Navegador Cósmico' :
                 archetype === 'alquimista' ? 'Alquimista' : 'Indefinido'}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-slate-900">{count}</p>
                <Badge variant="outline" className="text-xs">
                  {totalUsers > 0 ? ((count / totalUsers) * 100).toFixed(0) : 0}%
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-amber-600" />
            <p className="text-sm text-slate-600">Total de Duelos</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalDuels}</p>
        </Card>

        <Card className="bg-white border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag className="w-4 h-4 text-purple-600" />
            <p className="text-sm text-slate-600">Produtos Ativos</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalProducts}</p>
        </Card>

        <Card className="bg-white border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-4 h-4 text-yellow-600" />
            <p className="text-sm text-slate-600">Ouros Circulantes</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {totalOuros.toLocaleString()}
          </p>
        </Card>

        <Card className="bg-white border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Map className="w-4 h-4 text-teal-600" />
            <p className="text-sm text-slate-600">Em Zamira</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">{onlineUsers}</p>
        </Card>
      </div>
    </div>
  );
}